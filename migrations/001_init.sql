CREATE TABLE IF NOT EXISTS bands(
    id           SERIAL       PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    genre        VARCHAR(255) NOT NULL,
    country      VARCHAR(255) NOT NULL,
    founded_date DATE,
    members_count INT NOT NULL DEFAULT 1,
    description  TEXT
);

CREATE TABLE IF NOT EXISTS songs(
    id           SERIAL       PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    band_id      INT          NOT NULL
        REFERENCES bands(id) ON DELETE RESTRICT,
    duration     INT          NOT NULL,
    release_date DATE  
);