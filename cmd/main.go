package main

import (
	"log"
	"net/http"

	appdb "github.com/Emilia20112005/Barovik/internal/db"
	"github.com/Emilia20112005/Barovik/internal/handlers"
)

func main() {
	appdb.Connect()

	http.HandleFunc("/api/bands", handlers.BandsHandler)
	http.HandleFunc("/api/bands/", handlers.BandsHandler)
	http.HandleFunc("/api/songs", handlers.SongsHandler)
	http.HandleFunc("/api/songs/", handlers.SongsHandler)

	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Println("Сервер запущен: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
