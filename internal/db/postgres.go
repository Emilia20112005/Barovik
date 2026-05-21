package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
	)
	var err error
	DB, err = sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal("Ошибка открытия БД:", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatal("БД недоступна:", err)
	}
	log.Println("Подключение к PostgreSQL успешно")
}
