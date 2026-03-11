const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'flyguys',
    dateStrings : true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
async function selectAllAirportsInHungarian() {
    const query = 'SELECT * FROM airports_in_hungarian;';
    const [rows] = await pool.execute(query);
    return rows;
}

async function selectAvailableDepartureAirports() {
    const query = 'SELECT DISTINCT DepartureAirport FROM flights_without_ids WHERE DepartureDateTime > NOW();';
    const [rows] = await pool.execute(query);
    return rows;
}

async function selectAvailableArrivalAirports() {
    const query = 'SELECT DISTINCT ArrivalAirport FROM flights_without_ids WHERE DepartureDateTime > NOW();';
    const [rows] = await pool.execute(query);
    return rows;
}

async function selectAvailableFlightsBasedOnParameters(departureAirport, arrivalAirport, departureDate) {
    const query = 'SELECT * FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableDepartureAirportsFilteredHun(arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT DepartureAirport AS "AirportCode", (SELECT Hungarian FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "City", (SELECT Hungarian FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE DepartureAirport) AS "Country" FROM available_flights_simplified WHERE ArrivalAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${arrivalAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableArrivalAirportsFilteredHun(departureAirport, departureDate) {
    const query = 'SELECT DISTINCT ArrivalAirport AS "AirportCode", (SELECT Hungarian FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "City", (SELECT Hungarian FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE ArrivalAirport) AS "Country" FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableDepartureAirportsFilteredEng(arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT DepartureAirport AS "AirportCode", (SELECT English FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "City", (SELECT English FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE DepartureAirport) AS "Country" FROM available_flights_simplified WHERE ArrivalAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${arrivalAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableArrivalAirportsFilteredEng(departureAirport, departureDate) {
    const query = 'SELECT DISTINCT ArrivalAirport AS "AirportCode", (SELECT English FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "City", (SELECT English FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE ArrivalAirport) AS "Country" FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableDepartureDatesFiltered(departureAirport, arrivalAirport) {
    const query = 'SELECT DISTINCT DepartureDate FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`]);
    return rows;
}

// minden paraméter kötelező
async function selectAvailableReturnDates(departureAirport, arrivalAirport, destinationArrivalDate) {
    const query = 'SELECT DISTINCT DATE(DepartureDate) AS "ReturnDate" FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate >= ?;';
    const [rows] = await pool.execute(query, [`${departureAirport}`, `${arrivalAirport}`, `${destinationArrivalDate}`]);
    return rows;
}

async function selectAvailableArrivalDatesFiltered(departureAirport, arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT DATE(ArrivalDateTime) AS "ArrivalDate" FROM available_flights WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DATE(DepartureDateTime) LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`, `%${departureDate}%`]);
    
    return rows;
}


async function selectSwappableFlightsWithSameDepartureDates(departureDate) {
    const query = 'SELECT DISTINCT afs1.DepartureAirport FROM available_flights_simplified afs1, available_flights_simplified afs2 WHERE (afs1.DepartureAirport = afs2.ArrivalAirport AND afs1.ArrivalAirport = afs2.DepartureAirport) AND (afs1.DepartureDate = afs2.DepartureDate) AND afs1.DepartureDate LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureDate}%`]);
    
    return rows;
}

async function selectSwappableFlights() {
    const query = 'SELECT DISTINCT afs1.DepartureAirport FROM available_flights_simplified afs1, available_flights_simplified afs2 WHERE (afs1.DepartureAirport = afs2.ArrivalAirport AND afs1.ArrivalAirport = afs2.DepartureAirport);';
    const [rows] = await pool.execute(query);
    
    return rows;
}

async function selectAvailableFlightsFiltered(departureAirport, arrivalAirport, departureDate, numOfPassengers) {
    const query = 'SELECT num_of_available_seats_on_available_flights.* FROM num_of_available_seats_on_available_flights WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ?;';
    const [rows] = await pool.execute(query, [`${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`]);
    
    return rows;
}

async function selectAvailableSeatsOnFlight(flightId) {
    const query = 'SELECT seat.RowID, seat.ColumnID, seat.FareClassID, (flight.BasePrice*fareclass.Multiplier)*((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = 2))/100) AS "Price" FROM seat INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID INNER JOIN aircraft ON seat.AircraftModelID = aircraft.AircraftModelID INNER JOIN flight ON aircraft.AircraftID = flight.AircraftID LEFT JOIN not_cancelled_reservations ON flight.FlightID = not_cancelled_reservations.FlightID AND seat.RowID = not_cancelled_reservations.RowID AND seat.ColumnID = not_cancelled_reservations.ColumnID WHERE flight.FlightID = 30 AND not_cancelled_reservations.FlightID IS NULL;';
    const [rows] = await pool.execute(query, [flightId]);
    
    return rows;
}

//Map pinek
async function selectAvailableAirports() {
    const query = 'SELECT airport.AirportCode, city.Hungarian, city.GeographicCoordinates FROM airport INNER JOIN city ON airport.CityID = city.CityID;';
    const [rows] = await pool.execute(query);
    return rows;
}

/*
async function a() {
    const query = 'SELECT DepartureAirport, ArrivalAirport, DATE(DepartureDate) AS "aaa" FROM available_flights_simplified';
    const [rows] = await pool.execute(query);
    return rows;
}
*/
    
async function getUserById(id){
    const query = 'SELECT * FROM UserAccount WHERE UserID = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}


//Register
async function Register(userName, userEmail, hashedPassword, userBirthDate, numberOfFlights){
    const query = 'INSERT INTO UserAccount (UserName, UserEmail, UserPassword, UserBirthDate, NumberOfFlights) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [userName, userEmail, hashedPassword, userBirthDate, numberOfFlights]);
    return result.affectedRows>0;
}

//LOGIN
async function Login(email){
    const query = 'SELECT UserID, AdminStatus, UserPassword FROM UserAccount WHERE UserEmail = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
}

//Hűségprogram
async function Husegprogram(id){
    const query = 'SELECT UserName, NumberOfFlights, LoyaltyStatusName From UserAccount INNER JOIN Loyaltystatus ON UserAccount.LoyaltyStatusID = Loyaltystatus.LoyaltyStatusID WHERE UserAccount.UserId = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

//!Export
module.exports = {
    Login,
    getUserById,
    Register,
    Husegprogram,
    selectAllAirportsInHungarian,
    selectAvailableDepartureAirports,
    selectAvailableArrivalAirports,
    selectAvailableFlightsBasedOnParameters,
    selectAvailableDepartureAirportsFilteredHun,
    selectAvailableArrivalAirportsFilteredHun,
    selectAvailableDepartureAirportsFilteredEng,
    selectAvailableArrivalAirportsFilteredEng,
    selectAvailableDepartureDatesFiltered,
    selectAvailableReturnDates,
    selectAvailableArrivalDatesFiltered,
    selectSwappableFlightsWithSameDepartureDates,
    selectSwappableFlights,
    selectAvailableFlightsFiltered,
    selectAvailableSeatsOnFlight,
    selectAvailableAirports
  
};
