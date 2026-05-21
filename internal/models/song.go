package models

type Song struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	BandID      int    `json:"band_id"`
	BandName    string `json:"band_name"`
	DurationSec int    `json:"duration_sec"`
	ReleaseDate string `json:"release_date"`
}
