package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	appdb "github.com/Emilia20112005/Barovik/internal/db"
	"github.com/Emilia20112005/Barovik/internal/models"
)

func SongsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	hasID := len(parts) == 3

	switch r.Method {
	case http.MethodGet:
		if hasID {
			getSong(w, r, parts[2])
		} else {
			listSongs(w, r)
		}
	case http.MethodPost:
		createSong(w, r)
	case http.MethodPut:
		if hasID {
			updateSong(w, r, parts[2])
		}
	case http.MethodDelete:
		if hasID {
			deleteSong(w, r, parts[2])
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listSongs(w http.ResponseWriter, r *http.Request) {
	allowed := map[string]string{
		"title":        "s.title",
		"band_name":    "b.name",
		"duration_sec": "s.duration", // "duration_sec" в JSON, "duration" в БД
		"release_date": "s.release_date",
	}
	sortCol := r.URL.Query().Get("sort")
	sortDir := r.URL.Query().Get("dir")

	col, ok := allowed[sortCol]
	if !ok {
		col = "s.title"
	}
	if sortDir != "desc" {
		sortDir = "asc"
	}

	query := fmt.Sprintf(
		`SELECT s.id, s.title, s.band_id, b.name,
                s.duration, s.release_date
         FROM songs s
         JOIN bands b ON b.id = s.band_id
         ORDER BY %s %s`, col, sortDir)

	rows, err := appdb.DB.Query(query)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var list []models.Song
	for rows.Next() {
		var s models.Song
		if err := rows.Scan(&s.ID, &s.Title, &s.BandID, &s.BandName,
			&s.DurationSec, &s.ReleaseDate); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		list = append(list, s)
	}
	if list == nil {
		list = []models.Song{}
	}
	json.NewEncoder(w).Encode(list)
}

func getSong(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	var s models.Song
	err = appdb.DB.QueryRow(
		`SELECT s.id, s.title, s.band_id, b.name,
                s.duration, s.release_date
         FROM songs s
         JOIN bands b ON b.id = s.band_id
         WHERE s.id=$1`, id).
		Scan(&s.ID, &s.Title, &s.BandID, &s.BandName,
			&s.DurationSec, &s.ReleaseDate)
	if err == sql.ErrNoRows {
		http.Error(w, "Не найдено", 404)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(s)
}

func createSong(w http.ResponseWriter, r *http.Request) {
	var s models.Song
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Неверный JSON", 400)
		return
	}
	err := appdb.DB.QueryRow(
		`INSERT INTO songs(title, band_id, duration, release_date)
         VALUES($1,$2,$3,$4) RETURNING id`,
		s.Title, s.BandID, s.DurationSec, s.ReleaseDate).Scan(&s.ID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(s)
}

func updateSong(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	var s models.Song
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Неверный JSON", 400)
		return
	}
	s.ID = id
	_, err = appdb.DB.Exec(
		`UPDATE songs SET title=$1, band_id=$2, duration=$3,
                          release_date=$4
         WHERE id=$5`,
		s.Title, s.BandID, s.DurationSec, s.ReleaseDate, s.ID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(s)
}

func deleteSong(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	_, err = appdb.DB.Exec(`DELETE FROM songs WHERE id=$1`, id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
