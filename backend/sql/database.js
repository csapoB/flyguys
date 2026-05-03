const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    dateStrings: true,
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

async function selectAvailableDepartureAirportsFilteredHun(arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT DepartureAirport AS "AirportCode", (SELECT Hungarian FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "City", (SELECT city.GeographicCoordinates FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "GeographicCoordinates", (SELECT Hungarian FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE DepartureAirport) AS "Country" FROM available_flights_simplified WHERE ArrivalAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${arrivalAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableArrivalAirportsFilteredHun(departureAirport, departureDate) {
    const query = 'SELECT DISTINCT ArrivalAirport AS "AirportCode", (SELECT Hungarian FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "City", (SELECT city.GeographicCoordinates FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "GeographicCoordinates", (SELECT Hungarian FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE ArrivalAirport) AS "Country" FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableDepartureAirportsFilteredEn(arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT DepartureAirport AS "AirportCode", (SELECT English FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "City", (SELECT city.GeographicCoordinates FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE DepartureAirport) AS "GeographicCoordinates", (SELECT English FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE DepartureAirport) AS "Country" FROM available_flights_simplified WHERE ArrivalAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${arrivalAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableArrivalAirportsFilteredEn(departureAirport, departureDate) {
    const query = 'SELECT DISTINCT ArrivalAirport AS "AirportCode", (SELECT English FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "City", (SELECT city.GeographicCoordinates FROM city INNER JOIN airport ON city.CityID = airport.CityId WHERE airport.AirportCode LIKE ArrivalAirport) AS "GeographicCoordinates", (SELECT English FROM country INNER JOIN airport ON country.CountryID = airport.CountryId WHERE airport.AirportCode LIKE ArrivalAirport) AS "Country" FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND DepartureDate LIKE ? ORDER BY Country ASC, City ASC;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${departureDate}%`]);
    return rows;
}

async function selectAvailableDepartureDatesFiltered(departureAirport, arrivalAirport) {
    const query = 'SELECT DISTINCT DepartureDate FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`]);
    return rows;
}

// minden paraméter kötelező
async function selectAvailableReturnDates(departureAirport, arrivalAirport, destinationArrivalDateTime) {
    const query = 'SELECT DISTINCT DATE(DepartureDateTime) AS "ReturnDate" FROM active_flights_hun WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDateTime > ?;';
    const [rows] = await pool.execute(query, [`${departureAirport}`, `${arrivalAirport}`, `${destinationArrivalDateTime}`]);
    return rows;
}

async function selectAvailableArrivalDatesFiltered(departureAirport, arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT ArrivalDateTime AS "ArrivalDate" FROM active_flights_hun WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DATE(DepartureDateTime) LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`, `%${departureDate}%`]);

    return rows;
}


async function selectSwappableFlightsWithSameDepartureDates(departureAirport, arrivalAirport, departureDate) {
    const query = 'SELECT DISTINCT afs1.DepartureAirport FROM available_flights_simplified afs1, available_flights_simplified afs2 WHERE (afs1.DepartureAirport LIKE ? AND afs2.DepartureAirport LIKE ?) AND (afs1.ArrivalAirport LIKE ? AND afs2.ArrivalAirport LIKE ?) AND afs1.DepartureDate LIKE ? AND afs2.DepartureDate LIKE ?;';
    const [rows] = await pool.execute(query, [departureAirport, arrivalAirport, arrivalAirport, departureAirport, `%${departureDate}%`, `%${departureDate}%`]);

    return rows;
}

async function selectSwappableFlights(departureAirport, arrivalAirport) {
    const query = 'SELECT DISTINCT afs1.DepartureAirport FROM available_flights_simplified afs1, available_flights_simplified afs2 WHERE (afs1.DepartureAirport LIKE ? AND afs2.DepartureAirport LIKE ?) AND (afs1.ArrivalAirport LIKE ? AND afs2.ArrivalAirport LIKE ?)';
    const [rows] = await pool.execute(query, [departureAirport, arrivalAirport, arrivalAirport, departureAirport]);

    return rows;
}

async function selectAvailableFlightsFilteredHun(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId) {
    const query = 'SELECT num_of_available_seats_on_active_flights_hun.FlightID, num_of_available_seats_on_active_flights_hun.DepartureAirport, num_of_available_seats_on_active_flights_hun.DepartureCity, num_of_available_seats_on_active_flights_hun.ArrivalCity, num_of_available_seats_on_active_flights_hun.ArrivalAirport, num_of_available_seats_on_active_flights_hun.DepartureDate, num_of_available_seats_on_active_flights_hun.ArrivalDate, num_of_available_seats_on_active_flights_hun.DepartureTime, num_of_available_seats_on_active_flights_hun.ArrivalTime, num_of_available_seats_on_active_flights_hun.FlightTime, num_of_available_seats_on_active_flights_hun.AircraftModelID, num_of_available_seats_on_active_flights_hun.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_hun.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_hun WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`]);

    return rows;
}

async function selectAvailableFlightsFilteredEn(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId) {
    const query = 'SELECT num_of_available_seats_on_active_flights_en.FlightID, num_of_available_seats_on_active_flights_en.DepartureAirport, num_of_available_seats_on_active_flights_en.DepartureCity, num_of_available_seats_on_active_flights_en.ArrivalCity, num_of_available_seats_on_active_flights_en.ArrivalAirport, num_of_available_seats_on_active_flights_en.DepartureDate, num_of_available_seats_on_active_flights_en.ArrivalDate, num_of_available_seats_on_active_flights_en.DepartureTime, num_of_available_seats_on_active_flights_en.ArrivalTime, num_of_available_seats_on_active_flights_en.FlightTime, num_of_available_seats_on_active_flights_en.AircraftModelID, num_of_available_seats_on_active_flights_en.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_en.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_en WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`]);

    return rows;
}

async function selectAvailableFlightsFilteredHunByDepartureTime(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId, departureTime) {
    const query = 'SELECT num_of_available_seats_on_active_flights_hun.FlightID, num_of_available_seats_on_active_flights_hun.DepartureAirport, num_of_available_seats_on_active_flights_hun.DepartureCity, num_of_available_seats_on_active_flights_hun.ArrivalCity, num_of_available_seats_on_active_flights_hun.ArrivalAirport, num_of_available_seats_on_active_flights_hun.DepartureDate, num_of_available_seats_on_active_flights_hun.ArrivalDate, num_of_available_seats_on_active_flights_hun.DepartureTime, num_of_available_seats_on_active_flights_hun.ArrivalTime, num_of_available_seats_on_active_flights_hun.FlightTime, num_of_available_seats_on_active_flights_hun.AircraftModelID, num_of_available_seats_on_active_flights_hun.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_hun.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_hun WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? AND ArrivalTime < ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`, `${departureTime}`]);

    return rows;
}

async function selectAvailableFlightsFilteredEnByDepartureTime(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId, departureTime) {
    const query = 'SELECT num_of_available_seats_on_active_flights_en.FlightID, num_of_available_seats_on_active_flights_en.DepartureAirport, num_of_available_seats_on_active_flights_en.DepartureCity, num_of_available_seats_on_active_flights_en.ArrivalCity, num_of_available_seats_on_active_flights_en.ArrivalAirport, num_of_available_seats_on_active_flights_en.DepartureDate, num_of_available_seats_on_active_flights_en.ArrivalDate, num_of_available_seats_on_active_flights_en.DepartureTime, num_of_available_seats_on_active_flights_en.ArrivalTime, num_of_available_seats_on_active_flights_en.FlightTime, num_of_available_seats_on_active_flights_en.AircraftModelID, num_of_available_seats_on_active_flights_en.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_en.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_en WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? AND ArrivalTime < ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`, `${departureTime}`]);

    return rows;
}

async function selectAvailableFlightsFilteredHunByArrivalTime(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId, arrivalTime) {
    const query = 'SELECT num_of_available_seats_on_active_flights_hun.FlightID, num_of_available_seats_on_active_flights_hun.DepartureAirport, num_of_available_seats_on_active_flights_hun.DepartureCity, num_of_available_seats_on_active_flights_hun.ArrivalCity, num_of_available_seats_on_active_flights_hun.ArrivalAirport, num_of_available_seats_on_active_flights_hun.DepartureDate, num_of_available_seats_on_active_flights_hun.ArrivalDate, num_of_available_seats_on_active_flights_hun.DepartureTime, num_of_available_seats_on_active_flights_hun.ArrivalTime, num_of_available_seats_on_active_flights_hun.FlightTime, num_of_available_seats_on_active_flights_hun.AircraftModelID, num_of_available_seats_on_active_flights_hun.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_hun.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_hun WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? AND DepartureTime > ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`, `${arrivalTime}`]);

    return rows;
}

async function selectAvailableFlightsFilteredEnByArrivalTime(departureAirport, arrivalAirport, departureDate, numOfPassengers, userId, arrivalTime) {
    const query = 'SELECT num_of_available_seats_on_active_flights_en.FlightID, num_of_available_seats_on_active_flights_en.DepartureAirport, num_of_available_seats_on_active_flights_en.DepartureCity, num_of_available_seats_on_active_flights_en.ArrivalCity, num_of_available_seats_on_active_flights_en.ArrivalAirport, num_of_available_seats_on_active_flights_en.DepartureDate, num_of_available_seats_on_active_flights_en.ArrivalDate, num_of_available_seats_on_active_flights_en.DepartureTime, num_of_available_seats_on_active_flights_en.ArrivalTime, num_of_available_seats_on_active_flights_en.FlightTime, num_of_available_seats_on_active_flights_en.AircraftModelID, num_of_available_seats_on_active_flights_en.NumOfAvailableSeats, ROUND(num_of_available_seats_on_active_flights_en.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF" FROM num_of_available_seats_on_active_flights_en WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ? AND DepartureDate LIKE ? AND NumOfAvailableSeats >= ? AND DepartureTime > ? ORDER BY DepartureTime ASC;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`, `${departureAirport}`, `${arrivalAirport}`, `${departureDate}`, `${numOfPassengers}`, `${arrivalTime}`]);

    return rows;
}

async function selectAvailableSeatsOnFlight(flightId, userId) {
    const query = 'SELECT seat.RowID, seat.ColumnID, seat.FareClassID, ROUND((flight.BasePriceInHUF*fareclass.Multiplier)*((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100)) AS "PriceInHUF", (CASE WHEN not_cancelled_reservations.FlightID IS NULL THEN FALSE ELSE TRUE END) AS "IsOccupied" FROM seat INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID INNER JOIN aircraft ON seat.AircraftModelID = aircraft.AircraftModelID INNER JOIN flight ON aircraft.AircraftID = flight.AircraftID LEFT JOIN not_cancelled_reservations ON flight.FlightID = not_cancelled_reservations.FlightID AND seat.RowID = not_cancelled_reservations.RowID AND seat.ColumnID = not_cancelled_reservations.ColumnID WHERE flight.FlightID = ?;';
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function selectAvailableAirportsEn() {
    const query = 'SELECT DISTINCT active_flights_en.DepartureAirport, active_flights_en.DepartureCity AS "CityName", city.GeographicCoordinates FROM active_flights_en INNER JOIN airport ON active_flights_en.DepartureAirport = airport.AirportCode INNER JOIN city ON airport.CityID = city.CityID;';
    const [rows] = await pool.execute(query);

    return rows;
}

async function selectAvailableAirportsHun() {
    const query = 'SELECT DISTINCT active_flights_hun.DepartureAirport, active_flights_hun.DepartureCity AS "CityName", city.GeographicCoordinates FROM active_flights_hun INNER JOIN airport ON active_flights_hun.DepartureAirport = airport.AirportCode INNER JOIN city ON airport.CityID = city.CityID;';
    const [rows] = await pool.execute(query);

    return rows;
}

async function selectTop4CheapestOneWayFlightsEn(userId) {
    const query = 'SELECT num_of_available_seats_on_active_flights_en.FlightID, num_of_available_seats_on_active_flights_en.DepartureAirport, num_of_available_seats_on_active_flights_en.DepartureCity, num_of_available_seats_on_active_flights_en.ArrivalAirport, num_of_available_seats_on_active_flights_en.ArrivalCity, num_of_available_seats_on_active_flights_en.DepartureDate, num_of_available_seats_on_active_flights_en.DepartureTime, num_of_available_seats_on_active_flights_en.ArrivalTime, num_of_available_seats_on_active_flights_en.FlightTime, ROUND(num_of_available_seats_on_active_flights_en.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF", num_of_available_seats_on_active_flights_en.NumOfAvailableSeats FROM num_of_available_seats_on_active_flights_en WHERE NumOfAvailableSeats > 0 ORDER BY num_of_available_seats_on_active_flights_en.BasePriceInHUF ASC LIMIT 4;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`]);

    return rows;
}

async function selectTop4CheapestOneWayFlightsHun(userId) {
    const query = 'SELECT num_of_available_seats_on_active_flights_hun.FlightID, num_of_available_seats_on_active_flights_hun.DepartureAirport, num_of_available_seats_on_active_flights_hun.DepartureCity, num_of_available_seats_on_active_flights_hun.ArrivalAirport, num_of_available_seats_on_active_flights_hun.ArrivalCity, num_of_available_seats_on_active_flights_hun.DepartureDate, num_of_available_seats_on_active_flights_hun.DepartureTime, num_of_available_seats_on_active_flights_hun.ArrivalTime, num_of_available_seats_on_active_flights_hun.FlightTime, ROUND(num_of_available_seats_on_active_flights_hun.BasePriceInHUF*(CASE WHEN ? LIKE "NULL" THEN 1 ELSE ((100-(SELECT loyaltystatus.DiscountInPercentage FROM useraccount INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserID = ?))/100) END)) AS "PriceInHUF", num_of_available_seats_on_active_flights_hun.NumOfAvailableSeats FROM num_of_available_seats_on_active_flights_hun WHERE NumOfAvailableSeats > 0 ORDER BY num_of_available_seats_on_active_flights_hun.BasePriceInHUF ASC LIMIT 4;';
    const [rows] = await pool.execute(query, [`${userId}`, `${userId}`]);

    return rows;
}


async function selectActiveFlightsByUserIdEn(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_en.FlightID, flights_with_flight_time_en.DepartureAirport, flights_with_flight_time_en.DepartureCity, flights_with_flight_time_en.ArrivalAirport, flights_with_flight_time_en.ArrivalCity, DATE(flights_with_flight_time_en.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_en.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_en.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_en INNER JOIN not_cancelled_reservations ON flights_with_flight_time_en.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_en.DepartureDateTime > NOW() AND flights_with_flight_time_en.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}
async function selectActiveFlightsByUserIdHun(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_hun.FlightID, flights_with_flight_time_hun.DepartureAirport, flights_with_flight_time_hun.DepartureCity, flights_with_flight_time_hun.ArrivalAirport, flights_with_flight_time_hun.ArrivalCity, DATE(flights_with_flight_time_hun.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_hun.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_hun.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_hun INNER JOIN not_cancelled_reservations ON flights_with_flight_time_hun.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_hun.DepartureDateTime > NOW() AND flights_with_flight_time_hun.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}

async function selectNotCancelledBookingsCancelledFlightsByUserIdEn(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_en.FlightID, flights_with_flight_time_en.DepartureAirport, flights_with_flight_time_en.DepartureCity, flights_with_flight_time_en.ArrivalAirport, flights_with_flight_time_en.ArrivalCity, DATE(flights_with_flight_time_en.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_en.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_en.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_en INNER JOIN not_cancelled_reservations ON flights_with_flight_time_en.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_en.IsCancelled = 1 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}
async function selectNotCancelledBookingsCancelledFlightsByUserIdHun(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_hun.FlightID, flights_with_flight_time_hun.DepartureAirport, flights_with_flight_time_hun.DepartureCity, flights_with_flight_time_hun.ArrivalAirport, flights_with_flight_time_hun.ArrivalCity, DATE(flights_with_flight_time_hun.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_hun.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_hun.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_hun INNER JOIN not_cancelled_reservations ON flights_with_flight_time_hun.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_hun.IsCancelled = 1 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}

async function selectPreviousFlightsByUserIdEn(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_en.FlightID, flights_with_flight_time_en.DepartureAirport, flights_with_flight_time_en.DepartureCity, flights_with_flight_time_en.ArrivalAirport, flights_with_flight_time_en.ArrivalCity, DATE(flights_with_flight_time_en.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_en.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_en.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_en INNER JOIN not_cancelled_reservations ON flights_with_flight_time_en.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_en.DepartureDateTime < NOW() AND flights_with_flight_time_en.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}
async function selectPreviousFlightsByUserIdHun(userId) {
    const query = `SELECT DISTINCT flights_with_flight_time_hun.FlightID, flights_with_flight_time_hun.DepartureAirport, flights_with_flight_time_hun.DepartureCity, flights_with_flight_time_hun.ArrivalAirport, flights_with_flight_time_hun.ArrivalCity, DATE(flights_with_flight_time_hun.DepartureDateTime) AS "DepartureDate", TIME_FORMAT(TIME(flights_with_flight_time_hun.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(flights_with_flight_time_hun.ArrivalDateTime), '%H:%i') AS "ArrivalTime" FROM flights_with_flight_time_hun INNER JOIN not_cancelled_reservations ON flights_with_flight_time_hun.FlightID = not_cancelled_reservations.FlightID WHERE flights_with_flight_time_hun.DepartureDateTime < NOW() AND flights_with_flight_time_hun.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ?;`;
    const [rows] = await pool.execute(query, [`${userId}`]);

    return rows;
}
async function getUserById(id) {
    const query = 'SELECT * FROM useraccount WHERE UserID = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}


//Register
async function Register(userName, userEmail, hashedPassword, userBirthDate) {
    const query = 'INSERT INTO useraccount (UserName, UserEmail, UserPassword, UserBirthDate, LoyaltyStatusID) VALUES (?, ?, ?, ?, 1)';
    const [result] = await pool.execute(query, [userName, userEmail, hashedPassword, userBirthDate]);
    return result.affectedRows > 0;
}

//LOGIN
async function Login(email, password){
    const query = 'SELECT UserID, AdminStatus, UserPassword FROM useraccount WHERE UserEmail = ?';
    const [rows] = await pool.execute(query, [email]);
    const siker = rows.length > 0 && await bcrypt.compare(password, rows[0].UserPassword);
    return siker ? { UserID: rows[0].UserID, AdminStatus: rows[0].AdminStatus } : null;
}

//Hűségprogram
async function Husegprogram(id) {
    const query = 'SELECT UserName, NumberOfFlights, LoyaltyStatusName From useraccount LEFT JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID INNER JOIN number_of_flights_of_users ON useraccount.UserID = number_of_flights_of_users.UserID WHERE useraccount.UserId = ? ';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}


//Helyfoglalas INSERT
async function SeatReservation(PassengerID, flightID, rowID, columnID, adult) {
    let lekerdezes = 'SELECT ReservationID FROM reservation WHERE FlightID = ? AND RowID = ? AND ColumnID = ? AND NOT IsCancelled'
    const [sorok] = await pool.execute(lekerdezes, [flightID, rowID, columnID]);
    let vissza = false;
    if (sorok.length == 0) {
        const query = 'INSERT INTO reservation (PassengerID, FlightID, RowID, ColumnID, IsCancelled, IsAdult) VALUES (?, ?, ?, ?, 0, ?)';
        const [rows] = await pool.execute(query, [PassengerID, flightID, rowID, columnID, adult]);
        vissza = rows.affectedRows > 0;
    }
    return vissza;
}

// Profil
async function Profil(id) {
    const query = 'SELECT UserName, UserEmail, LoyaltyStatusName, UserBirthDate From useraccount LEFT JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID WHERE useraccount.UserId = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function selectActiveReservationsByUserIdAndFlightId(userId, flightId) {
    const query = 'SELECT not_cancelled_reservations.ReservationID, not_cancelled_reservations.RowID, not_cancelled_reservations.ColumnID, fareclass.FareClassName, not_cancelled_reservations.IsAdult FROM not_cancelled_reservations INNER JOIN flight ON not_cancelled_reservations.FlightID = flight.FlightID INNER JOIN fareclass ON fareclass.FareClassID = not_cancelled_reservations.FareClassID WHERE flight.DepartureDateTime > NOW() AND flight.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ? AND not_cancelled_reservations.FlightID = ? ORDER BY not_cancelled_reservations.RowID ASC, not_cancelled_reservations.ColumnID;';
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function selectPreviousReservationsByUserIdAndFlightId(userId, flightId) {
    const query = 'SELECT not_cancelled_reservations.RowID, not_cancelled_reservations.ColumnID, fareclass.FareClassName, not_cancelled_reservations.IsAdult FROM not_cancelled_reservations INNER JOIN flight ON not_cancelled_reservations.FlightID = flight.FlightID INNER JOIN fareclass ON fareclass.FareClassID = not_cancelled_reservations.FareClassID WHERE flight.DepartureDateTime < NOW() AND flight.IsCancelled = 0 AND not_cancelled_reservations.PassengerID = ? AND not_cancelled_reservations.FlightID = ? ORDER BY not_cancelled_reservations.RowID ASC, not_cancelled_reservations.ColumnID;';
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function selectFlightCancelledReservationsByUserIdAndFlightId(userId, flightId) {
    const query = 'SELECT not_cancelled_reservations.RowID, not_cancelled_reservations.ColumnID, fareclass.FareClassName, not_cancelled_reservations.IsAdult FROM not_cancelled_reservations INNER JOIN flight ON not_cancelled_reservations.FlightID = flight.FlightID INNER JOIN fareclass ON fareclass.FareClassID = not_cancelled_reservations.FareClassID WHERE flight.IsCancelled = 1 AND not_cancelled_reservations.PassengerID = ? AND not_cancelled_reservations.FlightID = ? ORDER BY not_cancelled_reservations.RowID ASC, not_cancelled_reservations.ColumnID;';
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function updateUserProfile(userId, userName, email, password, birthDate) {
    const query = 'UPDATE useraccount SET UserName = ?, UserEmail = ?, UserPassword = ?, UserBirthDate = ? WHERE UserID = ?;';
    const [result] = await pool.execute(query, [userName, email, password, birthDate, userId]);
    return result;
}

async function deleteUserProfile(userId) {
    const query = 'UPDATE useraccount SET UserName = "User&Deleted", UserEmail = NULL, UserPassword = NULL, UserBirthDate = NULL, LoyaltyStatusID = NULL, AdminStatus = NULL WHERE UserID = ?;';
    const [result] = await pool.execute(query, [userId]);
    return result;
}

async function cancelReservations(reservation_ids, userId) {
    let formatted_reservation_ids = reservation_ids.map((x) => parseInt(x));
    const query = `UPDATE reservation SET IsCancelled = 1 WHERE ReservationID IN (?) AND PassengerID = ? AND FlightID NOT IN (SELECT flight.FlightID FROM flight WHERE flight.DepartureDateTime < NOW() OR flight.IsCancelled = 1);`;
    const [result] = await pool.query(query, [formatted_reservation_ids, userId]);
    return result;
}
async function AdminGetUsers(){
    const query = `
        SELECT
            useraccount.UserID,
            useraccount.UserName,
            useraccount.UserEmail,
            useraccount.UserBirthDate,
            COALESCE(user_flights.NumberOfFlights, 0) AS "NumberOfFlights",
            loyaltystatus.LoyaltyStatusName,
            useraccount.CreatedAt
        FROM useraccount
        INNER JOIN loyaltystatus ON loyaltystatus.LoyaltyStatusID = useraccount.LoyaltyStatusID
        LEFT JOIN (
            SELECT
                reservation.PassengerID AS "UserID",
                COUNT(DISTINCT reservation.FlightID) AS "NumberOfFlights"
            FROM reservation
            INNER JOIN flight ON flight.FlightID = reservation.FlightID
            WHERE reservation.IsCancelled = 0
                AND flight.IsCancelled = 0
            GROUP BY reservation.PassengerID
        ) user_flights ON user_flights.UserID = useraccount.UserID
        WHERE NOT useraccount.AdminStatus
        ORDER BY useraccount.CreatedAt DESC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function AdminSearchUsers(email){
    const query = `
        SELECT
            useraccount.UserID,
            useraccount.UserName,
            useraccount.UserEmail,
            useraccount.UserBirthDate,
            COALESCE(user_flights.NumberOfFlights, 0) AS "NumberOfFlights",
            loyaltystatus.LoyaltyStatusName,
            useraccount.CreatedAt
        FROM useraccount
        INNER JOIN loyaltystatus ON loyaltystatus.LoyaltyStatusID = useraccount.LoyaltyStatusID
        LEFT JOIN (
            SELECT
                reservation.PassengerID AS "UserID",
                COUNT(DISTINCT reservation.FlightID) AS "NumberOfFlights"
            FROM reservation
            INNER JOIN flight ON flight.FlightID = reservation.FlightID
            WHERE reservation.IsCancelled = 0
                AND flight.IsCancelled = 0
            GROUP BY reservation.PassengerID
        ) user_flights ON user_flights.UserID = useraccount.UserID
        WHERE NOT useraccount.AdminStatus
            AND useraccount.UserEmail LIKE ?
        ORDER BY useraccount.CreatedAt DESC;
    `;
    const filter = `%${email}%`;
    const [rows] = await pool.execute(query, [filter]);
    return rows;
}

async function AdminGetUserReservationsHun(userId){
    const query = `
        SELECT
            reservation.ReservationID,
            reservation.PassengerID AS "UserID",
            reservation.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.Hungarian AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            reservation.RowID,
            reservation.ColumnID,
            reservation.IsAdult,
            reservation.IsCancelled,
            fareclass.FareClassName,
            ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100)) AS "Price"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ?
        ORDER BY flight.DepartureDateTime DESC, reservation.ReservationID DESC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function AdminGetUserReservationsEn(userId){
    const query = `
        SELECT
            reservation.ReservationID,
            reservation.PassengerID AS "UserID",
            reservation.FlightID,
            flight.DepartureAirport,
            departure_city.English AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.English AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            reservation.RowID,
            reservation.ColumnID,
            reservation.IsAdult,
            reservation.IsCancelled,
            fareclass.FareClassName,
            ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100)) AS "Price"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ?
        ORDER BY flight.DepartureDateTime DESC, reservation.ReservationID DESC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function AdminGetUserFlightsHun(userId){
    const query = `
        SELECT
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.Hungarian AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled AS "FlightIsCancelled",
            COUNT(reservation.ReservationID) AS "ReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 1 THEN 1 ELSE 0 END) AS "CancelledReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) AS "ActiveReservationCount",
            SUM(ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100))) AS "TotalPrice",
            CASE
                WHEN SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) = 0 THEN 'Törölt'
                WHEN SUM(CASE WHEN reservation.IsCancelled = 1 THEN 1 ELSE 0 END) = 0 THEN 'Aktív'
                ELSE 'Vegyes'
            END AS "GroupStatus"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ?
        GROUP BY
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian,
            flight.ArrivalAirport,
            arrival_city.Hungarian,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled
        ORDER BY flight.DepartureDateTime DESC, flight.FlightID DESC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function AdminGetUserFlightsEn(userId){
    const query = `
        SELECT
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.English AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.English AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled AS "FlightIsCancelled",
            COUNT(reservation.ReservationID) AS "ReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 1 THEN 1 ELSE 0 END) AS "CancelledReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) AS "ActiveReservationCount",
            SUM(ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100))) AS "TotalPrice",
            CASE
                WHEN SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) = 0 THEN 'Törölt'
                WHEN SUM(CASE WHEN reservation.IsCancelled = 1 THEN 1 ELSE 0 END) = 0 THEN 'Aktív'
                ELSE 'Vegyes'
            END AS "GroupStatus"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ?
        GROUP BY
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.English,
            flight.ArrivalAirport,
            arrival_city.English,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled
        ORDER BY flight.DepartureDateTime DESC, flight.FlightID DESC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function AdminGetUserFlightSeatsHun(userId, flightId){
    const query = `
        SELECT
            reservation.ReservationID,
            reservation.PassengerID AS "UserID",
            reservation.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.Hungarian AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled AS "FlightIsCancelled",
            reservation.RowID,
            reservation.ColumnID,
            reservation.IsAdult,
            reservation.IsCancelled,
            fareclass.FareClassName,
            ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100)) AS "Price"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ? AND reservation.FlightID = ?
        ORDER BY reservation.RowID ASC, reservation.ColumnID ASC, reservation.ReservationID DESC;
    `;
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function AdminGetUserFlightSeatsEn(userId, flightId){
    const query = `
        SELECT
            reservation.ReservationID,
            reservation.PassengerID AS "UserID",
            reservation.FlightID,
            flight.DepartureAirport,
            departure_city.English AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.English AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.IsCancelled AS "FlightIsCancelled",
            reservation.RowID,
            reservation.ColumnID,
            reservation.IsAdult,
            reservation.IsCancelled,
            fareclass.FareClassName,
            ROUND((flight.BasePriceInHUF * fareclass.Multiplier) * ((100 - loyaltystatus.DiscountInPercentage) / 100)) AS "Price"
        FROM reservation
        INNER JOIN flight ON reservation.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON reservation.RowID = seat.RowID
            AND reservation.ColumnID = seat.ColumnID
            AND aircraft.AircraftModelID = seat.AircraftModelID
        INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID
        INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID
        INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID
        INNER JOIN airport departure_airport ON flight.DepartureAirport = departure_airport.AirportCode
        INNER JOIN city departure_city ON departure_airport.CityID = departure_city.CityID
        INNER JOIN airport arrival_airport ON flight.ArrivalAirport = arrival_airport.AirportCode
        INNER JOIN city arrival_city ON arrival_airport.CityID = arrival_city.CityID
        WHERE reservation.PassengerID = ? AND reservation.FlightID = ?
        ORDER BY reservation.RowID ASC, reservation.ColumnID ASC, reservation.ReservationID DESC;
    `;
    const [rows] = await pool.execute(query, [userId, flightId]);
    return rows;
}

async function AdminGetFlightsHun(){
    const query = `
        SELECT
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.Hungarian AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.AircraftID,
            aircraftmodel.AircraftModelName,
            flight.BasePriceInHUF,
            flight.IsCancelled,
            COUNT(reservation.ReservationID) AS "ReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) AS "ActiveReservationCount"
        FROM flight
        INNER JOIN aircraft ON aircraft.AircraftID = flight.AircraftID
        INNER JOIN aircraftmodel ON aircraftmodel.AircraftModelID = aircraft.AircraftModelID
        INNER JOIN airport departure_airport ON departure_airport.AirportCode = flight.DepartureAirport
        INNER JOIN city departure_city ON departure_city.CityID = departure_airport.CityID
        INNER JOIN airport arrival_airport ON arrival_airport.AirportCode = flight.ArrivalAirport
        INNER JOIN city arrival_city ON arrival_city.CityID = arrival_airport.CityID
        LEFT JOIN reservation ON reservation.FlightID = flight.FlightID
        GROUP BY
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.Hungarian,
            flight.ArrivalAirport,
            arrival_city.Hungarian,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.AircraftID,
            aircraftmodel.AircraftModelName,
            flight.BasePriceInHUF,
            flight.IsCancelled
        ORDER BY flight.DepartureDateTime DESC, flight.FlightID DESC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function AdminGetFlightsEn(){
    const query = `
        SELECT
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.English AS "DepartureCity",
            flight.ArrivalAirport,
            arrival_city.English AS "ArrivalCity",
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.AircraftID,
            aircraftmodel.AircraftModelName,
            flight.BasePriceInHUF,
            flight.IsCancelled,
            COUNT(reservation.ReservationID) AS "ReservationCount",
            SUM(CASE WHEN reservation.IsCancelled = 0 THEN 1 ELSE 0 END) AS "ActiveReservationCount"
        FROM flight
        INNER JOIN aircraft ON aircraft.AircraftID = flight.AircraftID
        INNER JOIN aircraftmodel ON aircraftmodel.AircraftModelID = aircraft.AircraftModelID
        INNER JOIN airport departure_airport ON departure_airport.AirportCode = flight.DepartureAirport
        INNER JOIN city departure_city ON departure_city.CityID = departure_airport.CityID
        INNER JOIN airport arrival_airport ON arrival_airport.AirportCode = flight.ArrivalAirport
        INNER JOIN city arrival_city ON arrival_city.CityID = arrival_airport.CityID
        LEFT JOIN reservation ON reservation.FlightID = flight.FlightID
        GROUP BY
            flight.FlightID,
            flight.DepartureAirport,
            departure_city.English,
            flight.ArrivalAirport,
            arrival_city.English,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            flight.AircraftID,
            aircraftmodel.AircraftModelName,
            flight.BasePriceInHUF,
            flight.IsCancelled
        ORDER BY flight.DepartureDateTime DESC, flight.FlightID DESC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function AdminCancelFlight(flightId){
    const query = 'UPDATE flight SET IsCancelled = 1 WHERE FlightID = ? AND IsCancelled = 0;';
    const [result] = await pool.execute(query, [flightId]);
    return result;
}

async function AdminGetFlightById(flightId){
    const query = 'SELECT FlightID, IsCancelled FROM flight WHERE FlightID = ?;';
    const [rows] = await pool.execute(query, [flightId]);
    return rows[0] || null;
}

async function AdminGetFlightCreateContextHun(){
    const airportQuery = `
        SELECT
            airport.AirportCode,
            city.Hungarian AS "City",
            country.Hungarian AS "Country"
        FROM airport
        INNER JOIN city ON city.CityID = airport.CityID
        INNER JOIN country ON country.CountryID = airport.CountryID
        ORDER BY country.Hungarian ASC, city.Hungarian ASC;
    `;

    const aircraftQuery = `
        SELECT
            aircraft.AircraftID,
            aircraftmodel.AircraftModelName,
            latest_flight.ArrivalAirport AS "LastArrivalAirport",
            latest_flight.ArrivalDateTime AS "LastArrivalDateTime"
        FROM aircraft
        INNER JOIN aircraftmodel ON aircraftmodel.AircraftModelID = aircraft.AircraftModelID
        LEFT JOIN flight latest_flight ON latest_flight.FlightID = (
            SELECT f2.FlightID
            FROM flight f2
            WHERE f2.AircraftID = aircraft.AircraftID
                AND f2.IsCancelled = 0
            ORDER BY f2.ArrivalDateTime DESC, f2.FlightID DESC
            LIMIT 1
        )
        ORDER BY aircraft.AircraftID ASC;
    `;

    const [airports] = await pool.execute(airportQuery);
    const [aircraft] = await pool.execute(aircraftQuery);

    return {
        airports,
        aircraft
    };
}

async function AdminGetFlightCreateContextEn(){
    const airportQuery = `
        SELECT
            airport.AirportCode,
            city.English AS "City",
            country.English AS "Country"
        FROM airport
        INNER JOIN city ON city.CityID = airport.CityID
        INNER JOIN country ON country.CountryID = airport.CountryID
        ORDER BY country.English ASC, city.English ASC;
    `;

    const aircraftQuery = `
        SELECT
            aircraft.AircraftID,
            aircraftmodel.AircraftModelName,
            latest_flight.ArrivalAirport AS "LastArrivalAirport",
            latest_flight.ArrivalDateTime AS "LastArrivalDateTime"
        FROM aircraft
        INNER JOIN aircraftmodel ON aircraftmodel.AircraftModelID = aircraft.AircraftModelID
        LEFT JOIN flight latest_flight ON latest_flight.FlightID = (
            SELECT f2.FlightID
            FROM flight f2
            WHERE f2.AircraftID = aircraft.AircraftID
                AND f2.IsCancelled = 0
            ORDER BY f2.ArrivalDateTime DESC, f2.FlightID DESC
            LIMIT 1
        )
        ORDER BY aircraft.AircraftID ASC;
    `;

    const [airports] = await pool.execute(airportQuery);
    const [aircraft] = await pool.execute(aircraftQuery);

    return {
        airports,
        aircraft
    };
}

async function AdminGetLatestKnownAircraftLeg(aircraftId){
    const query = `
        SELECT
            aircraft.AircraftID,
            latest_flight.ArrivalAirport AS "LastArrivalAirport",
            latest_flight.ArrivalDateTime AS "LastArrivalDateTime"
        FROM aircraft
        LEFT JOIN flight latest_flight ON latest_flight.FlightID = (
            SELECT f2.FlightID
            FROM flight f2
            WHERE f2.AircraftID = aircraft.AircraftID
                AND f2.IsCancelled = 0
            ORDER BY f2.ArrivalDateTime DESC, f2.FlightID DESC
            LIMIT 1
        )
        WHERE aircraft.AircraftID = ?;
    `;
    const [rows] = await pool.execute(query, [aircraftId]);
    return rows[0] || null;
}

async function AdminHasFlightOverlap(aircraftId, departureDateTime, arrivalDateTime){
    const query = `
        SELECT COUNT(*) AS "OverlapCount"
        FROM flight
        WHERE AircraftID = ?
            AND IsCancelled = 0
            AND NOT (ArrivalDateTime <= ? OR DepartureDateTime >= ?);
    `;
    const [rows] = await pool.execute(query, [aircraftId, departureDateTime, arrivalDateTime]);
    const overlapCount = Number.parseInt(rows[0].OverlapCount, 10);
    return overlapCount > 0;
}

async function AdminCreateFlight(departureAirport, arrivalAirport, departureDateTime, arrivalDateTime, aircraftId, basePriceInHUF){
    const query = `
        INSERT INTO flight (
            DepartureAirport,
            ArrivalAirport,
            DepartureDateTime,
            ArrivalDateTime,
            AircraftID,
            BasePriceInHUF,
            IsCancelled
        ) VALUES (?, ?, ?, ?, ?, ?, 0);
    `;
    const [result] = await pool.execute(query, [
        departureAirport,
        arrivalAirport,
        departureDateTime,
        arrivalDateTime,
        aircraftId,
        basePriceInHUF
    ]);
    return result;
}


async function cancelAllReservationsOfUser(userId) {
    const query = `UPDATE reservation SET IsCancelled = 1 WHERE ReservationID IN (SELECT ReservationID FROM reservation r1 WHERE r1.PassengerID = ? AND r1.IsCancelled = 0) AND FlightID NOT IN (SELECT flight.FlightID FROM flight WHERE flight.DepartureDateTime < NOW() OR flight.IsCancelled = 1);`;
    const [result] = await pool.query(query, [userId]);
    return result;
}

async function updateLoyaltyStatus(userId) {
    const query = 'UPDATE useraccount SET useraccount.LoyaltyStatusID = (CASE WHEN (SELECT COUNT(l1.NumberOfFlightsRequired) FROM loyaltystatus l1 WHERE l1.LoyaltyStatusID = useraccount.LoyaltyStatusID+1) = 1 THEN (CASE WHEN (SELECT number_of_flights_of_users.NumberOfFlights FROM number_of_flights_of_users WHERE number_of_flights_of_users.UserID = ?) >= (SELECT l2.NumberOfFlightsRequired FROM loyaltystatus l2 WHERE l2.LoyaltyStatusID = useraccount.LoyaltyStatusID+1) THEN useraccount.LoyaltyStatusID+1 ELSE useraccount.LoyaltyStatusID END) ELSE useraccount.LoyaltyStatusID END) WHERE useraccount.UserID = ?';
    const [result] = await pool.execute(query, [userId, userId]);
    return result;
}

async function cancelReservationCheckForRemainingOnlyChildren(reservation_ids, userId) {
    let formatted_reservation_ids = reservation_ids.map((x) => parseInt(x));
    const query = `SELECT COUNT(not_cancelled_reservations.ReservationID) AS "NumberOfPassengers", not_cancelled_reservations.IsAdult, not_cancelled_reservations.FlightID FROM not_cancelled_reservations INNER JOIN flight ON not_cancelled_reservations.FlightID = flight.FlightID WHERE not_cancelled_reservations.PassengerID = ? AND flight.DepartureDateTime > NOW() AND not_cancelled_reservations.FlightID IN(SELECT DISTINCT r1.FlightID FROM reservation r1 WHERE r1.ReservationID IN(?)) AND not_cancelled_reservations.ReservationID NOT IN(?) GROUP BY not_cancelled_reservations.FlightID, not_cancelled_reservations.IsAdult ASC;`;
    const [result] = await pool.query(query, [userId, formatted_reservation_ids, formatted_reservation_ids]);
    
    let flag = false;
    let i = 0;
    while (i < result.length && !(flag)){
        if (result[i].IsAdult == 0) {
            if (i+1 == result.length) {
                flag = true
            } else {
                if (result[i].FlightID != result[i+1].FlightID) {
                    flag = true;
                }
            }
        }
        i++;
    }

    return flag;
}

async function createUserMessage(userId, messageHungarian, messageEnglish) {
    const query = 'INSERT INTO usermessage (UserID, MessageHungarian, MessageEnglish) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [userId, messageHungarian, messageEnglish]);
    return result.affectedRows > 0;
}

async function selectUserIDByReservationFlightID(flightId) {
    const query = 'SELECT DISTINCT not_cancelled_reservations.PassengerID FROM not_cancelled_reservations WHERE not_cancelled_reservations.FlightID = ?;';
    const [result] = await pool.execute(query, [flightId]);
    return result
}

async function selectFlightByID(flightId) {
    const query = `SELECT flight.DepartureAirport, origin_city.Hungarian AS "DepartureCityHungarian", origin_city.English AS "DepartureCityEnglish", flight.ArrivalAirport, destination_city.Hungarian AS "ArrivalCityHungarian", destination_city.English AS "ArrivalCityEnglish", CONCAT(YEAR(flight.DepartureDateTime), ".", (CASE WHEN MONTH(flight.DepartureDateTime) < 10 THEN CONCAT("0", MONTH(flight.DepartureDateTime)) ELSE MONTH(flight.DepartureDateTime) END), ".", (CASE WHEN DAY(flight.DepartureDateTime) < 10 THEN CONCAT("0", DAY(flight.DepartureDateTime)) ELSE DAY(flight.DepartureDateTime) END), ".", " ", TIME_FORMAT(TIME(flight.DepartureDateTime), '%H:%i')) AS "DepartureDateTimeHungarian", CONCAT((CASE WHEN DAY(flight.DepartureDateTime) < 10 THEN CONCAT("0", DAY(flight.DepartureDateTime)) ELSE DAY(flight.DepartureDateTime) END), "/", (CASE WHEN MONTH(flight.DepartureDateTime) < 10 THEN CONCAT("0", MONTH(flight.DepartureDateTime)) ELSE MONTH(flight.DepartureDateTime) END), "/", YEAR(flight.DepartureDateTime), " , ", TIME_FORMAT(TIME(flight.DepartureDateTime), '%H:%i')) AS "DepartureDateTimeEnglish" FROM flight INNER JOIN airport origin ON flight.DepartureAirport = origin.AirportCode INNER JOIN airport destination ON flight.ArrivalAirport = destination.AirportCode INNER JOIN city origin_city ON origin.CityID = origin_city.CityID INNER JOIN city destination_city ON destination.CityID = destination_city.CityID WHERE flight.FlightID = ?;`;
    const [result] = await pool.execute(query, [flightId]);
    return result
}

async function setUserMessageIsViewedTrueByMessageId(messageId) {
    const query = 'UPDATE usermessage SET IsViewed = 1 WHERE MessageID = ?;';
    const [result] = await pool.execute(query, [messageId]);
    return result;
}

async function selectUnreadUserMessageByUserID(userId) {
    const query = `SELECT MessageID, MessageHungarian, MessageEnglish FROM usermessage WHERE IsViewed = 0 AND UserID = ?;`;
    const [result] = await pool.execute(query, [userId]);
    return result
}

async function selectBookingDetails(flightId, rowId, columnId, userId) {
    const query = `
        SELECT
            flight.DepartureAirport,
            dep_city.Hungarian AS DepartureCityHun,
            dep_city.English AS DepartureCityEn,
            flight.ArrivalAirport,
            arr_city.Hungarian AS ArrivalCityHun,
            arr_city.English AS ArrivalCityEn,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            fareclass.FareClassName,
            ROUND(flight.BasePriceInHUF * fareclass.Multiplier * ((100 - ls.DiscountInPercentage) / 100)) AS PriceInHUF
        FROM flight
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON seat.AircraftModelID = aircraft.AircraftModelID AND seat.RowID = ? AND seat.ColumnID = ?
        INNER JOIN fareclass ON fareclass.FareClassID = seat.FareClassID
        INNER JOIN airport dep_ap ON dep_ap.AirportCode = flight.DepartureAirport
        INNER JOIN city dep_city ON dep_city.CityID = dep_ap.CityID
        INNER JOIN airport arr_ap ON arr_ap.AirportCode = flight.ArrivalAirport
        INNER JOIN city arr_city ON arr_city.CityID = arr_ap.CityID
        INNER JOIN useraccount ON useraccount.UserID = ?
        INNER JOIN loyaltystatus ls ON ls.LoyaltyStatusID = useraccount.LoyaltyStatusID
        WHERE flight.FlightID = ?;
    `;
    const [rows] = await pool.execute(query, [rowId, columnId, userId, flightId]);
    return rows[0] || null;
}

async function selectCancellableReservationDetails(reservationIds, userId) {
    const formatted = reservationIds.map(x => parseInt(x));
    const query = `
        SELECT
            r.ReservationID,
            r.RowID,
            r.ColumnID,
            r.IsAdult,
            r.FlightID,
            flight.DepartureAirport,
            dep_city.Hungarian AS DepartureCityHun,
            dep_city.English AS DepartureCityEn,
            flight.ArrivalAirport,
            arr_city.Hungarian AS ArrivalCityHun,
            arr_city.English AS ArrivalCityEn,
            flight.DepartureDateTime,
            flight.ArrivalDateTime,
            fareclass.FareClassName
        FROM reservation r
        INNER JOIN flight ON r.FlightID = flight.FlightID
        INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
        INNER JOIN seat ON seat.AircraftModelID = aircraft.AircraftModelID
            AND seat.RowID = r.RowID AND seat.ColumnID = r.ColumnID
        INNER JOIN fareclass ON fareclass.FareClassID = seat.FareClassID
        INNER JOIN airport dep_ap ON dep_ap.AirportCode = flight.DepartureAirport
        INNER JOIN city dep_city ON dep_city.CityID = dep_ap.CityID
        INNER JOIN airport arr_ap ON arr_ap.AirportCode = flight.ArrivalAirport
        INNER JOIN city arr_city ON arr_city.CityID = arr_ap.CityID
        WHERE r.ReservationID IN (?) AND r.PassengerID = ?
            AND r.IsCancelled = 0
            AND flight.DepartureDateTime > NOW() AND flight.IsCancelled = 0
        ORDER BY flight.DepartureDateTime ASC, r.ReservationID ASC;
    `;
    const [rows] = await pool.query(query, [formatted, userId]);
    return rows;
}

async function checkEmailInDatabase(userEmail) {
    const query = "SELECT UserEmail FROM useraccount WHERE UserEmail LIKE ? "
    const [result] = await pool.execute(query, [userEmail]);

    return result.length > 0;
}
async function checkEmailOfUser(userId, userEmail) {
    const query = "SELECT UserID, UserEmail FROM useraccount WHERE UserEmail LIKE ? "
    const [result] = await pool.execute(query, [userEmail]);

    return result[0].UserID == userId;
}

//!Export
module.exports = {
    Login,
    getUserById,
    Register,
    Husegprogram,
    Profil,
    selectAllAirportsInHungarian,
    selectAvailableDepartureAirportsFilteredHun,
    selectAvailableArrivalAirportsFilteredHun,
    selectAvailableDepartureAirportsFilteredEn,
    selectAvailableArrivalAirportsFilteredEn,
    selectAvailableDepartureDatesFiltered,
    selectAvailableReturnDates,
    selectAvailableArrivalDatesFiltered,
    selectSwappableFlightsWithSameDepartureDates,
    selectSwappableFlights,
    selectAvailableFlightsFilteredHun,
    selectAvailableFlightsFilteredEn,
    selectAvailableSeatsOnFlight,
    SeatReservation,
    selectAvailableAirportsEn,
    selectAvailableAirportsHun,
    selectTop4CheapestOneWayFlightsEn,
    selectTop4CheapestOneWayFlightsHun,
    selectActiveReservationsByUserIdAndFlightId,
    selectPreviousReservationsByUserIdAndFlightId,
    updateUserProfile,
    deleteUserProfile,
    selectActiveFlightsByUserIdEn,
    selectActiveFlightsByUserIdHun,
    selectPreviousFlightsByUserIdEn,
    selectPreviousFlightsByUserIdHun,
    cancelReservations,
    cancelAllReservationsOfUser,
    updateLoyaltyStatus,
    cancelReservationCheckForRemainingOnlyChildren,
    AdminSearchUsers,
    AdminGetUsers,
    AdminGetUserReservationsHun,
    AdminGetUserReservationsEn,
    AdminGetUserFlightsHun,
    AdminGetUserFlightsEn,
    AdminGetUserFlightSeatsHun,
    AdminGetUserFlightSeatsEn,
    AdminGetFlightsHun,
    AdminGetFlightsEn,
    AdminCancelFlight,
    AdminGetFlightById,
    AdminGetFlightCreateContextHun,
    AdminGetFlightCreateContextEn,
    AdminGetLatestKnownAircraftLeg,
    AdminHasFlightOverlap,
    AdminCreateFlight,
    createUserMessage,
    selectUserIDByReservationFlightID,
    selectFlightByID,
    setUserMessageIsViewedTrueByMessageId,
    selectUnreadUserMessageByUserID,
    selectNotCancelledBookingsCancelledFlightsByUserIdHun,
    selectNotCancelledBookingsCancelledFlightsByUserIdEn,
    selectFlightCancelledReservationsByUserIdAndFlightId,
    selectBookingDetails,
    selectCancellableReservationDetails,
    checkEmailInDatabase,
    checkEmailOfUser,
    selectAvailableFlightsFilteredHunByDepartureTime,
    selectAvailableFlightsFilteredEnByDepartureTime,
    selectAvailableFlightsFilteredHunByArrivalTime,
    selectAvailableFlightsFilteredEnByArrivalTime
};
