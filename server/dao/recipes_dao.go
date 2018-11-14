package dao

import (
	"RecipeBook/server/models"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

type RecipesDAO struct {
	APIKey           string
	APIURL           string
	NumRecipesToLoad int
	Recipes          models.Recipes
	index            map[string]models.Recipe
}

var client = &http.Client{Timeout: 10 * time.Second}

func (r *RecipesDAO) getJSON(url string, target interface{}) error {
	// Build the request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal("NewRequest: ", err)
		return err
	}

	// Add secure header for API verification
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", r.APIKey))

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return json.NewDecoder(resp.Body).Decode(target)
}

// Load : Loads
func (r *RecipesDAO) Load(locale *models.Locale) {
	fmt.Print("Loading recipes... ")
	url := fmt.Sprintf("%s%s", r.APIURL, fmt.Sprintf("api/recipes/search?country=%s&limit=%d&order=-averageRating", locale.Country, r.NumRecipesToLoad))

	recipes := new(models.Recipes)

	r.getJSON(url, recipes)

	// If no recipes could be loaded from the API, fall back to the included recipes.json file
	if len(recipes.Recipes) == 0 {
		// Open our jsonFile
		recipesJSON, err := os.Open("data/recipes.json")

		// if we os.Open returns an error then handle it
		if err != nil {
			fmt.Println(err)
		} else {
			fmt.Println("Successfully opened recipes.json")
		}

		// defer the closing of our jsonFile so that we can parse it later on
		defer recipesJSON.Close()

		// read our opened xmlFile as a byte array.
		byteValue, _ := ioutil.ReadAll(recipesJSON)

		// we unmarshal our byteArray which contains our
		// recipesJSON's content into 'recipes' which we defined above
		err = json.Unmarshal(byteValue, &recipes)

	}

	// Finally, assign recipes by reference to the recipes struct
	r.Recipes = *recipes

	fmt.Printf("Done! (Loaded %d recipes)\n", len(recipes.Recipes))
}
