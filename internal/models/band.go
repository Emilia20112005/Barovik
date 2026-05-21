package models

type Band struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Genre        string `json:"genre"`
	Country      string `json:"country"`
	FoundedDate  string `json:"founded_date"`
	MembersCount int    `json:"members_count"`
	Description  string `json:"description"`
}
