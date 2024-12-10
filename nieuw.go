package main


import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

// Structuur voor reserveringen
type Reservation struct {
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	DateOfBirth    string `json:"dateOfBirth"`
	Email          string `json:"email"`
	PhoneNumber    string `json:"phoneNumber"`
}

// Functie om de database te initialiseren
func initDatabase() *sql.DB {
	dsn := "root@tcp(localhost:3306)/reservations"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Kan geen verbinding maken met de database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Databaseverbinding niet succesvol:", err)
	}
	fmt.Println("Verbonden met de database!")
	return db
}

// Functie om een reservering toe te voegen aan de database
func addReservation(db *sql.DB, res Reservation) error {
	query := "INSERT INTO reservations (FirstName, LastName, Date_of_birth, Email, PhoneNumber) VALUES (?, ?, ?, ?, ?)"
	_, err := db.Exec(query, res.FirstName, res.LastName, res.DateOfBirth, res.Email, res.PhoneNumber)
	return err
}

// Handler om reserveringsgegevens te verwerken
func submitReservation(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Ongeldige methode", http.StatusMethodNotAllowed)
			return
		}

		// Parse formuliergegevens
		err := r.ParseForm()
		if err != nil {
			http.Error(w, "Fout bij het verwerken van formulier", http.StatusBadRequest)
			return
		}

		reservation := Reservation{
			FirstName:   r.FormValue("firstName"),
			LastName:    r.FormValue("lastName"),
			DateOfBirth: r.FormValue("dateOfBirth"),
			Email:       r.FormValue("email"),
			PhoneNumber: r.FormValue("phoneNumber"),
		}

		// Validatie
		if reservation.FirstName == "" || reservation.LastName == "" || reservation.Email == "" {
			http.Error(w, "Voornaam, achternaam en e-mail zijn verplicht", http.StatusBadRequest)
			return
		}

		// Voeg reservering toe aan de database
		err = addReservation(db, reservation)
		if err != nil {
			http.Error(w, "Fout bij het toevoegen van reservering", http.StatusInternalServerError)
			return
		}

		// JSON-respons
		w.Header().Set("Content-Type", "application/json")
		response := map[string]string{
			"message": "Reservering succesvol toegevoegd!",
			"name":    reservation.FirstName + " " + reservation.LastName,
		}
		json.NewEncoder(w).Encode(response)
	}
}

func main() {
	db := initDatabase()
	defer db.Close()

	http.HandleFunc("/submit", submitReservation(db))
	fmt.Println("Server gestart op http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
