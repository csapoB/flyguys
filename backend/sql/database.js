const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'flyguys',
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

async function selectAvailableDepartureDateFiltered(departureAirport, arrivalAirport) {
    const query = 'SELECT DISTINCT DepartureDate FROM available_flights_simplified WHERE DepartureAirport LIKE ? AND ArrivalAirport LIKE ?;';
    const [rows] = await pool.execute(query, [`%${departureAirport}%`, `%${arrivalAirport}%`]);
    return rows;
}

/*
async function a() {
    const query = 'SELECT DepartureAirport, ArrivalAirport, DATE(DepartureDate) AS "aaa" FROM available_flights_simplified';
    const [rows] = await pool.execute(query);
    return rows;
}
*/

//!Export
module.exports = {
    selectAllAirportsInHungarian,
    selectAvailableDepartureAirports,
    selectAvailableArrivalAirports,
    selectAvailableFlightsBasedOnParameters,
    selectAvailableDepartureAirportsFilteredHun,
    selectAvailableArrivalAirportsFilteredHun,
    selectAvailableDepartureAirportsFilteredEng,
    selectAvailableArrivalAirportsFilteredEng,
    selectAvailableDepartureDateFiltered
    
};
