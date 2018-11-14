package models

// Basic recipe structure
type Recipe struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Headline    string      `json:"headline"`
	Difficulty  int         `json:"difficulty"`
	PrepTime    string      `json:"prepTime"`
	TotalTime   interface{} `json:"totalTime,omitempty"`
	ServingSize int         `json:"servingSize,omitempty"`
	Link        string      `json:"link,omitempty"`
	ImageLink   string      `json:"imageLink,omitempty"`
	CardLink    string      `json:"cardLink,omitempty"`
	VideoLink   interface{} `json:"videoLink,omitempty"`
	Nutrition   []struct {
		Type   string `json:"type"`
		Name   string `json:"name"`
		Amount int    `json:"amount"`
		Unit   string `json:"unit"`
	} `json:"nutrition,omitempty"`
	AverageRating  float64 `json:"averageRating,omitempty"`
	RatingsCount   int     `json:"ratingsCount,omitempty"`
	FavoritesCount int     `json:"favoritesCount,omitempty"`
}

// Structure for collection of recipes
type Recipes struct {
	Recipes []Recipe `json:"items"`
}
