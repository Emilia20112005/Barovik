package main

import (
	"log"

	"github.com/Emilia20112005/Barovik/internal/db"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Ошибка загрузки .env файла:", err)
	}
	db.Connect()
	log.Println("Приложение запущено")
}
