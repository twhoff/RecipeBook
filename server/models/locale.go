package models

// Locale : Struct for maintaining locale server-side
type Locale struct {
	Country string
	Locale  string
}

func (l *Locale) Set(country string, locale string) {
	l.Country = country
	l.Locale = locale
}
