package models

import (
	"regexp"
	"time"
	"unicode"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2/bson"
)

// User : User Model
type User struct {
	ID         bson.ObjectId `bson:"_id" json:"id"`
	Gender     string        `bson:"gender" json:"gender,omitempty"`
	FirstName  string        `bson:"firstName" json:"firstName,omitempty"`
	LastName   string        `bson:"lastName" json:"lastName,omitempty"`
	Email      string        `bson:"email" json:"email,omitempty"`
	Password   string        `bson:"hashed_password" json:"password,omitempty"`
	Birthday   *time.Time    `bson:"birthday" json:"birthday,omitempty"`
	Favourites []string      `bson:"favourites,omitempty" json:"favourites"`
	Errors     []interface{} `bson:",omitempty" json:",omitempty"`
}

// Validate : validates the user data
func (u *User) Validate() bool {
	if u.Gender != "m" && u.Gender != "f" {
		u.Errors = append(u.Errors, "FORM_ERROR_REQUIRED_FIELD")
	}

	if len(u.FirstName) == 0 ||
		len(u.LastName) == 0 ||
		len(u.Email) == 0 ||
		len(u.Password) == 0 {
		u.Errors = append(u.Errors, "FORM_ERROR_REQUIRED_FIELD")
	}

	if len(u.FirstName) < 2 {
		u.Errors = append(u.Errors, "SIGNUP_FIRSTNAME_ERROR")
	}

	if len(u.LastName) < 2 {
		u.Errors = append(u.Errors, "SIGNUP_LASTNAME_ERROR")
	}

	re := regexp.MustCompile(".+@.+\\..+")
	matched := re.Match([]byte(u.Email))
	if matched == false {
		u.Errors = append(u.Errors, "FORM_ERROR_INVALID_EMAIL")
	}

	eightOrMore, number, upper, special := verifyPassword(u.Password)

	if !eightOrMore || !(number || upper || special) {
		u.Errors = append(u.Errors, []interface{}{"FORM_ERROR_PASSWORD_STRENGTH", 8, 1})
	}

	return len(u.Errors) == 0
}

func verifyPassword(s string) (eightOrMore, number, upper, special bool) {
	letters := 0
	for _, s := range s {
		switch {
		case unicode.IsNumber(s):
			number = true
			letters++
		case unicode.IsUpper(s):
			upper = true
			letters++
		case unicode.IsPunct(s) || unicode.IsSymbol(s):
			special = true
			letters++
		case unicode.IsLetter(s) || s == ' ':
			letters++
		default:
			//return false, false, false, false
		}
	}
	eightOrMore = letters >= 8
	return
}

// HashPassword : Hashes and salts the plain text password to be stored in the DB
func (u *User) HashPassword() error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	u.Password = string(bytes)
	return err
}

// CheckPasswordHash : Compares the plaintext password against the hash to validate it
func (u *User) CheckPasswordHash(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
