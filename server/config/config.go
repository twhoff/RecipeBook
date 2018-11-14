package config

import (
	"log"

	"github.com/BurntSushi/toml"
)

// Config : Represents database server and credentials
type Config struct {
	Country          string
	Locale           string
	Server           string
	Database         string
	RecipeBookAPIKey string
	RecipeBookAPIUrl string
	NumRecipesToLoad int
	HTTPRoot         string
}

// Read and parse the configuration file
func (c *Config) Read() {
	if _, err := toml.DecodeFile("config/config.toml", &c); err != nil {
		log.Fatal(err)
	}
}
