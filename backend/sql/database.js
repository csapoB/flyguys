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
    const [rows] = await pool.execute(query, [`${departureAirport}`, `${arrivalAirport}`, `${departureDate}`]);
    
    return rows;
}

async function selectSwappableFlightssWithSameDepartureDates() {
    const query = 'SELECT DISTINCT afs1.DepartureAirport FROM available_flights_simplified afs1, available_flights_simplified afs2 WHERE (afs1.DepartureAirport = afs2.ArrivalAirport AND afs1.ArrivalAirport = afs2.DepartureAirport) AND afs1.DepartureDate = afs2.DepartureDate;';
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
    selectAvailableDepartureDatesFiltered,
    selectAvailableReturnDates,
    selectAvailableArrivalDatesFiltered,
    selectSwappableFlightssWithSameDepartureDates
    
};
