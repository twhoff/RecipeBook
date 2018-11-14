package main

// Description : Backend API

import (
	c "RecipeBook/server/config"
	d "RecipeBook/server/dao"
	"RecipeBook/server/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gorilla/context"
	"github.com/gorilla/sessions"

	"gopkg.in/mgo.v2/bson"

	"github.com/julienschmidt/httprouter"
)

var (
	config     = &c.Config{}        // Config information for database
	locale     = new(models.Locale) // Locale
	usersDAO   = &d.UsersDAO{}      // User DAO
	recipesDAO = &d.RecipesDAO{}    // Recipes DAO
	store      sessions.CookieStore // Store for server-side session cookies
	httpRoot   string
)

// SESSION : Session Store Alias
const (
	SESSION = "recipebook"
)

// Add HTTP Strict Transport Security support with a max-age of at least 6 months
// for A+ SSL lab score
func ssl(h httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		w.Header().Add("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
		h(w, r, ps)
	}
}

// authRequired : Wrapper function which adds authorisation to provided route
func authRequired(h httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

		session, _ := store.Get(r, SESSION)

		var hasAuth, ok bool
		if hasAuth, ok = session.Values["authenticated"].(bool); !ok {
			fmt.Println("[AUTH_ERROR]: Authorisation cookie not found in session.")
			respondWithError(w, http.StatusUnauthorized, "Not authorised.")
			return
		}
		var userID string
		if userID, ok = session.Values["userId"].(string); !ok {
			fmt.Println("[AUTH_ERROR]: User ID cookie not found in session.")
			respondWithError(w, http.StatusUnauthorized, "Not authorised.")
			return
		}

		var clientID *http.Cookie
		var err error
		if clientID, err = r.Cookie("clientId"); err != nil {
			fmt.Println("[AUTH_ERROR]: Client ID cookie not sent from client.")
			respondWithError(w, http.StatusUnauthorized, "Not authorised.")
			return
		}

		if !hasAuth || userID != clientID.Value {
			fmt.Println("[AUTH_ERROR]: Session couldn't be validated.")
			respondWithError(w, http.StatusUnauthorized, "Not authorised.")
			return
		}
		h(w, r, ps)

	}
}

func whoAmI(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	session, _ := store.Get(r, SESSION)
	var userID string
	var ok bool
	if userID, ok = session.Values["userId"].(string); !ok {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find userID in session.")
		return
	}
	var user models.User
	user, err := usersDAO.FindByID(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find user in the database.")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"status": true, "user": user})
}

func signIn(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()

	// Get the sign-in data (currently in JSON format) and decode it into a temp struct
	type SignInData struct {
		Email      string `json:"email"`
		Password   string `json:"password"`
		RememberMe bool   `json:"rememberMe"`
	}
	var signInData SignInData
	if err := json.NewDecoder(r.Body).Decode(&signInData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Ivalid payload.")
		return
	}
	// Look up the user using the data access object
	var user models.User
	user, err := usersDAO.FindByEmailIncludePassword(signInData.Email)
	authorised := false
	if err == nil {
		authorised = user.CheckPasswordHash(signInData.Password)
	}
	if !authorised {
		respondWithError(w, http.StatusUnauthorized, []string{"FORM_ERROR_INCORRECT_LOGIN"})
		return
	}

	// Set authorised cookie
	var cookieExpires int
	if signInData.RememberMe {
		cookieExpires = 60 * 60 * 24 * 365
	} else {
		cookieExpires = 60 * 10
	}
	session, _ := store.Get(r, SESSION)
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   cookieExpires,
		HttpOnly: true,
	}
	session.Values["authenticated"] = true
	session.Values["userId"] = user.ID.Hex()
	session.Save(r, w)

	// Clear the user's password from the struct before sending it in the response
	user.Password = ""

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"status": true, "user": user, "cookieExpires": cookieExpires})
}

func signUp(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondWithError(w, http.StatusBadRequest, "Ivalid payload.")
		return
	}

	fmt.Print(user)

	// Validate the user data
	if user.Validate() == false {
		respondWithError(w, http.StatusBadRequest, user.Errors)
		return
	}

	// Does the user already exist?
	var userInDb models.User
	userInDb, _ = usersDAO.FindByEmail(user.Email)
	if userInDb.Email != "" {
		respondWithError(w, http.StatusBadRequest, []string{"FORM_ERROR_USER_EXISTS"})
		return
	}

	// Hash the user password
	if err := user.HashPassword(); err != nil {
		respondWithError(w, http.StatusBadRequest, []string{fmt.Sprintf("Couldn't hash user password: %s", err.Error())})
		return
	}

	user.ID = bson.NewObjectId()
	if err := usersDAO.Insert(&user); err != nil {
		respondWithError(w, http.StatusInternalServerError, []string{err.Error()})
		return
	}
	user, _ = usersDAO.FindByEmail(user.Email)
	respondWithJSON(w, http.StatusCreated, map[string]interface{}{"status": true, "user": user})
}

func signOut(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()
	session, _ := store.Get(r, SESSION)
	session.Values["authenticated"] = false
	session.Save(r, w)
	respondWithJSON(w, http.StatusOK, "Logged out.")
}

func secret(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Authorised."})
}

func recipes(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()

	page, err := strconv.Atoi(ps.ByName("page"))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, `Invalid "page" data-type, expected int.`)
		return
	}
	pageSize, err := strconv.Atoi(ps.ByName("pageSize"))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, `Invalid "pageSize" data-type, expected int.`)
		return
	}

	// Page must be converted to the index of the first item
	// e.g. if page page size is 10
	// page 1 = items 0 to 9
	// page 2 = items 10 to 19
	// page 3 = items 20 to 29
	// etc...
	if pageSize <= 0 {
		pageSize = 10
	}
	numRecipes := len(recipesDAO.Recipes.Recipes)
	pageFrom := page*pageSize - pageSize
	pageTo := (pageFrom + pageSize)
	if pageFrom > numRecipes {
		pageFrom = numRecipes - (numRecipes % pageSize)
	}
	if pageTo > numRecipes {
		pageTo = numRecipes
	}
	if pageFrom == pageTo {
		pageFrom = pageFrom - pageSize
	}
	if pageFrom < 0 || pageTo <= 0 {
		pageFrom = 0
		pageTo = pageSize
	}

	fmt.Println("Load pages: ", pageFrom, " to ", pageTo)

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"status": true, "recipes": recipesDAO.Recipes.Recipes[pageFrom:pageTo]})
}

func recipe(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()
	id := ps.ByName("id")

	fmt.Println(id)
}

func setLocale(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	defer r.Body.Close()

	country := ps.ByName("country")
	localeCode := ps.ByName("locale")

	locale.Set(country, localeCode)
	fmt.Println("Locale changed: ", country, localeCode)

	// Changing locales causes the recipe data to reload (new language)
	recipesDAO.Load(locale)

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"status": true, "locale": locale})
}

func toggleFavouriteRecipe(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	// First check payload
	type RecipeData struct {
		ID string `json:"id"`
	}
	var recipeData RecipeData
	if err := json.NewDecoder(r.Body).Decode(&recipeData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Ivalid payload.")
		return
	}

	// Now check for userID in session
	session, _ := store.Get(r, SESSION)
	var userID string
	var ok bool
	if userID, ok = session.Values["userId"].(string); !ok {
		respondWithError(w, http.StatusInternalServerError, "Couldn't find userID in session.")
		return
	}

	// Now load user favourites
	var user models.User
	user, err := usersDAO.GetFavourites(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Couldn't load user favourites for %s.", userID))
		return
	}

	// Favourites might not exist
	if user.Favourites == nil {
		fmt.Println("doesn't exist")
		favourites := []string{recipeData.ID}
		if err := usersDAO.UpdateFavourites(userID, favourites); err != nil {
			respondWithError(w, http.StatusInternalServerError, []string{err.Error()})
			return
		}
		respondWithJSON(w, http.StatusCreated, map[string]interface{}{"status": true, "user": user})
		return
	}

	// Check if the favourite already exists
	exists := false
	for i, v := range user.Favourites {
		if v == recipeData.ID {
			exists = true
			// Remove from slice
			user.Favourites = append(user.Favourites[:i], user.Favourites[i+1:]...)
		}
	}
	if !exists {
		// Didn't exist so add
		user.Favourites = append(user.Favourites, recipeData.ID)
	}
	// Update the favourites in the database
	if err := usersDAO.UpdateFavourites(userID, user.Favourites); err != nil {
		respondWithError(w, http.StatusInternalServerError, []string{err.Error()})
		return
	}
	respondWithJSON(w, http.StatusCreated, map[string]interface{}{"status": true, "user": user})
}

func respondWithError(w http.ResponseWriter, code int, msg interface{}) {
	respondWithJSON(w, code, map[string]interface{}{
		"status": false,
		"errors": msg,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {

	response, _ := json.Marshal(payload)

	//Allow CORS here By * or specific origin
	w.Header().Set("Access-Control-Allow-Origin", "https://localhost:8080")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(code)
	w.Write(response)
}

// Parse the configuration file 'config.toml', and establish a connection to DB
func init() {
	config.Read()

	locale.Set(config.Country, config.Locale)

	// Read and set the RecipeBook API Key and URL
	recipesDAO.APIKey = config.RecipeBookAPIKey
	recipesDAO.APIURL = config.RecipeBookAPIUrl
	recipesDAO.NumRecipesToLoad = config.NumRecipesToLoad

	// Load recipes from API
	recipesDAO.Load(locale)

	// Read and set the Mongodb database details
	usersDAO.Server = config.Server
	usersDAO.Database = config.Database
	usersDAO.Connect()

	// Set the httpRoot for the public server
	httpRoot = config.HTTPRoot
}

// This code is a custom FileServer for re-routing the public server to index.html
// when reloading the page on a React route, such as signin or signup (instead of showing 404)
type customFileServer struct {
	root            http.Dir
	NotFoundHandler func(http.ResponseWriter, *http.Request)
}

// CustomFileServer : Enables redirecting back to index.html for SPA React Routing to take care of routes
func CustomFileServer(root http.Dir, NotFoundHandler http.HandlerFunc) http.Handler {
	return &customFileServer{root: root, NotFoundHandler: NotFoundHandler}
}

func (fs *customFileServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if containsDotDot(r.URL.Path) {
		http.Error(w, "URL should not contain '/../' parts", http.StatusBadRequest)
		return
	}

	//if empty, set current directory
	dir := string(fs.root)
	if dir == "" {
		dir = "."
	}

	//add prefix and clean
	upath := r.URL.Path
	if !strings.HasPrefix(upath, "/") {
		upath = "/" + upath
		r.URL.Path = upath
	}
	upath = path.Clean(upath)

	//path to file
	name := path.Join(dir, filepath.FromSlash(upath))

	//check if file exists
	f, err := os.Open(name)
	if err != nil {
		if os.IsNotExist(err) {
			fs.NotFoundHandler(w, r)
			return
		}
	}
	defer f.Close()

	http.ServeFile(w, r, name)
}

func containsDotDot(v string) bool {
	if !strings.Contains(v, "..") {
		return false
	}
	for _, ent := range strings.FieldsFunc(v, isSlashRune) {
		if ent == ".." {
			return true
		}
	}
	return false
}

func isSlashRune(r rune) bool {
	return r == '/' || r == '\\'
}

func main() {
	// Server-side cookie store
	//
	sessionKey := []byte("dRgUkXp2s5v8y/B?D(G+KbPeShVmYq3t6w9z$C&F)H@McQfTjWnZr4u7x!A%D*G-")
	encryptionKey := []byte("UjXn2r5u8x/A?D(G+KbPdSgVkYp3s6v9")

	fmt.Print("Creating server-side cookie session store... ")
	store = *sessions.NewCookieStore(sessionKey, encryptionKey)
	fmt.Println("Okay!")

	router := httprouter.New()
	router.POST("/signup", ssl(signUp))
	router.POST("/signin", ssl(signIn))
	router.GET("/signout", authRequired(ssl(signOut)))
	router.GET("/secret", authRequired(ssl(secret)))
	router.GET("/whoami", authRequired(ssl(whoAmI)))
	router.GET("/recipes", authRequired(ssl(recipes)))
	router.GET("/recipes/:page/:pageSize", authRequired(ssl(recipes)))
	router.GET("/setlocale/:country/:locale", ssl(setLocale))
	router.POST("/togglefavourite", authRequired(ssl(toggleFavouriteRecipe)))

	fmt.Println("Starting secure server on 443 (may require sudo)...")
	go func() {
		log.Fatal(http.ListenAndServeTLS(":443", "server.crt", "server.key", context.ClearHandler(router)))
	}()

	// Public server - serves from dist folder
	fmt.Println("Starting public server on 8080...")
	serveIndexHTML := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, fmt.Sprintf("%v/index.html", httpRoot))
	}
	mux := http.NewServeMux()
	mux.Handle("/", CustomFileServer(http.Dir(fmt.Sprintf("%v", httpRoot)), serveIndexHTML))

	log.Fatal(http.ListenAndServeTLS(":8080", "server.crt", "server.key", mux))
}
