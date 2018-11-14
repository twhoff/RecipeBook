package dao

/**
 * Users Data Access Object:
 * Provides MongoDB connectivity and access to the users
 * collection
 */

import (
	"RecipeBook/server/models"
	"fmt"
	"log"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type UsersDAO struct {
	Server   string
	Database string
}

var db *mgo.Database

const COLLECTION = "users"

func (u *UsersDAO) Connect() {
	fmt.Print("Connecting to Mongodb instance... ")
	session, err := mgo.Dial(u.Server)
	if err != nil {
		fmt.Println("Failed.")
		log.Fatal(err)
	}
	db = session.DB(u.Database)
	fmt.Println("Success!")
	// defer session.Close()
}

// FindByID : Find a user in the database by id
func (u *UsersDAO) FindByID(id string) (models.User, error) {
	var user models.User
	err := db.C(COLLECTION).FindId(bson.ObjectIdHex(id)).Select(bson.M{"email": 1, "firstName": 1, "favourites": 1}).One(&user)
	return user, err
}

// FindByEmail : Find a user in the database by email
func (u *UsersDAO) FindByEmail(email string) (models.User, error) {
	var user models.User
	err := db.C(COLLECTION).Find(bson.M{"email": email}).Select(bson.M{"email": 1, "firstName": 1, "favourites": 1}).One(&user)
	return user, err
}

// FindByEmailIncludePassword : Find a user in the database by email
func (u *UsersDAO) FindByEmailIncludePassword(email string) (models.User, error) {
	var user models.User
	err := db.C(COLLECTION).Find(bson.M{"email": email}).Select(bson.M{"email": 1, "firstName": 1, "favourites": 1, "hashed_password": 1}).One(&user)
	return user, err
}

// Insert : Inserts a user into the database
func (u *UsersDAO) Insert(user *models.User) error {
	err := db.C(COLLECTION).Insert(&user)
	return err
}

// GetFavourites : returns only the favourite recipes for a user
func (u *UsersDAO) GetFavourites(id string) (models.User, error) {
	var user models.User
	err := db.C(COLLECTION).FindId(bson.ObjectIdHex(id)).Select(bson.M{"favourites": 1}).One(&user)
	return user, err
}

// UpdateFavourites : Updates user's favourite recipes
func (u *UsersDAO) UpdateFavourites(id string, favourites []string) error {
	update := bson.M{"$set": bson.M{"favourites": favourites}}
	err := db.C(COLLECTION).UpdateId(bson.ObjectIdHex(id), update)
	return err
}
