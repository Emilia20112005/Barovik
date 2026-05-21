# Лабораторная работа — Модуль справочной информации

**ФИО:** Козловская Эмилия
**Курс:** 3 | **Группа:** 2 | **Год:** 2026

## Стек
- Backend: Go (Golang)
- БД: PostgreSQL
- Frontend: HTML + Vanilla JS (без установки)

---

## Справочник 1 — Музыкальные группы (`bands`)

| Колонка       | Тип данных    | Ограничения | Описание                          |
|---------------|---------------|-------------|-----------------------------------|
| id            | SERIAL        | PRIMARY KEY | Уникальный идентификатор          |
| name          | VARCHAR(255)  | NOT NULL    | Название группы (текст)           |
| genre         | VARCHAR(100)  | NOT NULL    | Музыкальный жанр (текст)          |
| country       | VARCHAR(100)  | NOT NULL    | Страна происхождения (текст)      |
| founded_date  | DATE          |             | Дата основания группы             |
| members_count | INT           | NOT NULL    | Количество участников (целое)     |

---

## Справочник 2 — Песни (`songs`)

| Колонка      | Тип данных    | Ограничения              | Описание                           |
|--------------|---------------|--------------------------|------------------------------------|
| id           | SERIAL        | PRIMARY KEY              | Уникальный идентификатор           |
| title        | VARCHAR(255)  | NOT NULL                 | Название песни (текст)             |
| band_id      | INT           | NOT NULL, FK → bands(id) | Ссылка на группу из справочника    |
| duration_sec | INT           | NOT NULL                 | Длительность в секундах (целое)    |
| release_date | DATE          |                          | Дата выхода песни                  |

---

## Зависимость справочников

Поле `songs.band_id` — внешний ключ (Foreign Key), ссылающийся на `bands.id`.

Каждая песня принадлежит одной группе из справочника групп.

При попытке удалить группу, у которой есть песни в справочнике,
база данных вернёт ошибку (`ON DELETE RESTRICT`) —
записи в `songs` **не удаляются автоматически**.


## Схема БД

```
bands                               songs
────────────────────────────        ────────────────────────────────
id            SERIAL PK       ←──┐  id            SERIAL PK
name          VARCHAR(255)        │  title         VARCHAR(255)
genre         VARCHAR(100)        └─ band_id       INT FK
country       VARCHAR(100)           duration_sec  INT
founded_date  DATE                   release_date  DATE
members_count INT                    track_number  INT
```

---

## Запуск

```bash
# 1. Создать базу данных
psql -U postgres -c "CREATE DATABASE lab_db;"
psql -U postgres -d lab_db -f db/migrations/001_init.sql
psql -U postgres -d lab_db -f db/migrations/002_seed.sql

# 2. Переменные окружения
export POSTGRES_HOST=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_NAME=lab_db

# 3. Запустить сервер
go run ./cmd/main.go

# 4. Открыть в браузере
open http://localhost:8080
```

---

## API

| Метод  | URL               | Описание                  |
|--------|-------------------|---------------------------|
| GET    | /api/bands        | Список всех групп         |
| GET    | /api/bands/{id}   | Получить группу по ID     |
| POST   | /api/bands        | Добавить группу           |
| PUT    | /api/bands/{id}   | Обновить группу           |
| DELETE | /api/bands/{id}   | Удалить группу            |
| GET    | /api/songs        | Список всех песен         |
| GET    | /api/songs/{id}   | Получить песню по ID      |
| POST   | /api/songs        | Добавить песню            |
| PUT    | /api/songs/{id}   | Обновить песню            |
| DELETE | /api/songs/{id}   | Удалить песню             |
