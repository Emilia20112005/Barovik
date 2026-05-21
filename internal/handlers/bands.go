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

func BandsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	hasID := len(parts) == 3

	switch r.Method {
	case http.MethodGet:
		if hasID {
			getBand(w, r, parts[2])
		} else {
			listBands(w, r)
		}
	case http.MethodPost:
		createBand(w, r)
	case http.MethodPut:
		if hasID {
			updateBand(w, r, parts[2])
		}
	case http.MethodDelete:
		if hasID {
			deleteBand(w, r, parts[2])
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func listBands(w http.ResponseWriter, r *http.Request) {
	allowed := map[string]bool{
		"name": true, "genre": true, "country": true,
		"founded_date": true, "members_count": true, "description": true,
	}
	sortCol := r.URL.Query().Get("sort")
	sortDir := r.URL.Query().Get("dir")

	if !allowed[sortCol] {
		sortCol = "name"
	}
	if sortDir != "desc" {
		sortDir = "asc"
	}

	query := fmt.Sprintf(
		`SELECT id, name, genre, country, founded_date,
                members_count, COALESCE(description, '')
         FROM bands ORDER BY %s %s`, sortCol, sortDir)

	rows, err := appdb.DB.Query(query)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var list []models.Band
	for rows.Next() {
		var b models.Band
		if err := rows.Scan(&b.ID, &b.Name, &b.Genre, &b.Country,
			&b.FoundedDate, &b.MembersCount, &b.Description); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		list = append(list, b)
	}
	if list == nil {
		list = []models.Band{}
	}
	json.NewEncoder(w).Encode(list)
}

func getBand(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	var b models.Band
	err = appdb.DB.QueryRow(
		`SELECT id, name, genre, country, founded_date,
                members_count, COALESCE(description, '')
         FROM bands WHERE id=$1`, id).
		Scan(&b.ID, &b.Name, &b.Genre, &b.Country,
			&b.FoundedDate, &b.MembersCount, &b.Description)
	if err == sql.ErrNoRows {
		http.Error(w, "Не найдено", 404)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(b)
}

func createBand(w http.ResponseWriter, r *http.Request) {
	var b models.Band
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Неверный JSON", 400)
		return
	}
	err := appdb.DB.QueryRow(
		`INSERT INTO bands(name, genre, country, founded_date,
                           members_count, description)
         VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
		b.Name, b.Genre, b.Country, b.FoundedDate,
		b.MembersCount, b.Description).Scan(&b.ID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(b)
}

func updateBand(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	var b models.Band
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, "Неверный JSON", 400)
		return
	}
	b.ID = id
	_, err = appdb.DB.Exec(
		`UPDATE bands SET name=$1, genre=$2, country=$3, founded_date=$4,
                          members_count=$5, description=$6
         WHERE id=$7`,
		b.Name, b.Genre, b.Country, b.FoundedDate,
		b.MembersCount, b.Description, b.ID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(b)
}

func deleteBand(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID", 400)
		return
	}
	_, err = appdb.DB.Exec(`DELETE FROM bands WHERE id=$1`, id)
	if err != nil {
		http.Error(w, "Невозможно удалить: у группы есть песни в справочнике", 409)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
