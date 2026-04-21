-- Database init
CREATE DATABASE IF NOT EXISTS flyguys
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE flyguys;

-- FareClass Table
CREATE TABLE IF NOT EXISTS fareclass (
	FareClassID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    FareClassName VARCHAR(50) UNIQUE,
    Multiplier DOUBLE NOT NULL
);

-- LoyaltyStatus Table
CREATE TABLE IF NOT EXISTS loyaltystatus (
	LoyaltyStatusID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    LoyaltyStatusName VARCHAR(50) UNIQUE,
    DiscountInPercentage INT(8) NOT NULL,
    NumberOfFlightsRequired INT NOT NULL    
);

-- UserAccount Table
CREATE TABLE IF NOT EXISTS useraccount (
    UserID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    UserName VARCHAR(255) NOT NULL,
    UserEmail VARCHAR(255) UNIQUE,
    UserPassword VARCHAR(100),
    UserBirthDate DATE DEFAULT "2001-09-11",
    LoyaltyStatusID INT DEFAULT 1,
    AdminStatus BOOLEAN DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LoyaltyStatusID) REFERENCES loyaltystatus(LoyaltyStatusID)
);

-- City Table
CREATE TABLE IF NOT EXISTS city (
	CityID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Hungarian VARCHAR(100) NOT NULL,
    English VARCHAR(100) NOT NULL,
    GeographicCoordinates VARCHAR(150) NOT NULL
);

-- Country Table
CREATE TABLE IF NOT EXISTS country (
	CountryID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Hungarian VARCHAR(100) NOT NULL,
    English VARCHAR(100) NOT NULL
);

-- Airport Table
CREATE TABLE IF NOT EXISTS airport (
	AirportCode VARCHAR(10) PRIMARY KEY NOT NULL,
    CityID INT NOT NULL,
    CountryID INT NOT NULL,
    UTCOffset TIME NOT NULL,
    FOREIGN KEY (CityID) REFERENCES city(CityID),
    FOREIGN KEY (CountryID) REFERENCES country(CountryID)
);

-- AircraftModel Table
CREATE TABLE IF NOT EXISTS aircraftmodel (
	AircraftModelID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    AircraftModelName VARCHAR(50) UNIQUE,
    NumberOfSeats INT NOT NULL
);

-- Aircraft Table
CREATE TABLE IF NOT EXISTS aircraft (
    AircraftID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    AircraftModelID INT NOT NULL,
    FOREIGN KEY (AircraftModelID) REFERENCES aircraftmodel(AircraftModelID)
);

-- Seat Table
CREATE TABLE IF NOT EXISTS seat (
	RowID INT NOT NULL,
    ColumnID CHAR(1) NOT NULL,
    AircraftModelID INT NOT NULL,
    FareClassID INT,
    PRIMARY KEY (RowID, ColumnID, AircraftModelID),
    FOREIGN KEY (FareClassID) REFERENCES fareclass(FareClassID),
    FOREIGN KEY (AircraftModelID) REFERENCES aircraftmodel(AircraftModelID)
);

-- Flight Table
CREATE TABLE IF NOT EXISTS flight (
    FlightID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    DepartureAirport VARCHAR(10) NOT NULL,
    ArrivalAirport VARCHAR(10) NOT NULL,
    DepartureDateTime DATETIME NOT NULL,
    ArrivalDateTime DATETIME NOT NULL,
    AircraftID INT NOT NULL,
    BasePriceInHUF INT NOT NULL,
    IsCancelled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (AircraftID) REFERENCES aircraft(AircraftID),
    FOREIGN KEY (DepartureAirport) REFERENCES airport(AirportCode),
    FOREIGN KEY (ArrivalAirport) REFERENCES airport(AirportCode)
);

-- Reservation Table
CREATE TABLE IF NOT EXISTS reservation (
    ReservationID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    PassengerID INT NOT NULL,
    FlightID INT NOT NULL,
    RowID INT NOT NULL,
    ColumnID CHAR(1) NOT NULL,
    IsCancelled BOOLEAN NOT NULL,
    IsAdult BOOLEAN NOT NULL,
    FOREIGN KEY (FlightID) REFERENCES flight(FlightID),
    FOREIGN KEY (PassengerID) REFERENCES useraccount(UserID)
);

CREATE VIEW IF NOT EXISTS reservations_with_prices AS 
	SELECT reservation.ReservationID, reservation.PassengerID, reservation.FlightID, reservation.RowID, reservation.ColumnID, fareclass.FareClassID, (flight.BasePriceInHUF*fareclass.Multiplier)*((100-loyaltystatus.DiscountInPercentage)/100) AS "PriceInHun", reservation.IsCancelled, reservation.IsAdult FROM reservation INNER JOIN flight ON reservation.FlightID = flight.FlightID INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID INNER JOIN seat ON reservation.RowID = seat.RowID AND reservation.ColumnID = seat.ColumnID AND aircraft.AircraftModelID = seat.AircraftModelID INNER JOIN fareclass ON seat.FareClassID = fareclass.FareClassID INNER JOIN useraccount ON reservation.PassengerID = useraccount.UserID INNER JOIN loyaltystatus ON useraccount.LoyaltyStatusID = loyaltystatus.LoyaltyStatusID;

 
CREATE VIEW IF NOT EXISTS airports_in_english AS
	SELECT airport.AirportCode, city.English, airport.UTCOffset AS "City", country.English AS "Country" 
    	FROM airport INNER JOIN city ON airport.CityID = city.CityID INNER JOIN country ON airport.CountryID = country.CountryID ORDER BY country.English ASC, city.English ASC;

CREATE VIEW IF NOT EXISTS airports_in_hungarian AS
	SELECT airport.AirportCode, city.Hungarian, airport.UTCOffset AS "City", country.Hungarian AS "Country" 
    	FROM airport INNER JOIN city ON airport.CityID = city.CityID INNER JOIN country ON airport.CountryID = country.CountryID ORDER BY country.Hungarian ASC, city.Hungarian ASC;

CREATE VIEW IF NOT EXISTS flights_with_flight_time_hun AS
    SELECT flight.FlightID, flight.DepartureAirport, origin_city.Hungarian AS "DepartureCity", flight.ArrivalAirport, destination_city.Hungarian AS "ArrivalCity", flight.DepartureDateTime, flight.ArrivalDateTime, TIMEDIFF(flight.ArrivalDateTime, ADDTIME(flight.DepartureDateTime, SUBTIME(TIME(ABS(TIME(destination.UTCOffset))), TIME(ABS(TIME(origin.UTCOffset))))))  AS "FlightTime", flight.BasePriceInHUF, flight.AircraftID, flight.IsCancelled FROM flight INNER JOIN airport origin ON flight.DepartureAirport = origin.AirportCode INNER JOIN airport destination ON flight.ArrivalAirport = destination.AirportCode INNER JOIN city origin_city ON origin.CityID = origin_city.CityID INNER JOIN city destination_city ON destination.CityID = destination_city.CityID; 

CREATE VIEW IF NOT EXISTS flights_with_flight_time_en AS
    SELECT flight.FlightID, flight.DepartureAirport, origin_city.English AS "DepartureCity", flight.ArrivalAirport, destination_city.English AS "ArrivalCity", flight.DepartureDateTime, flight.ArrivalDateTime, TIMEDIFF(flight.ArrivalDateTime, ADDTIME(flight.DepartureDateTime, SUBTIME(TIME(ABS(TIME(destination.UTCOffset))), TIME(ABS(TIME(origin.UTCOffset))))))  AS "FlightTime", flight.BasePriceInHUF, flight.AircraftID, flight.IsCancelled FROM flight INNER JOIN airport origin ON flight.DepartureAirport = origin.AirportCode INNER JOIN airport destination ON flight.ArrivalAirport = destination.AirportCode INNER JOIN city origin_city ON origin.CityID = origin_city.CityID INNER JOIN city destination_city ON destination.CityID = destination_city.CityID; 
-- SELECT flight.DepartureAirport, flight.ArrivalAirport, flight.DepartureDateTime, flight.ArrivalDateTime, flight.BasePrice FROM flight;

CREATE VIEW IF NOT EXISTS active_flights_hun AS
	SELECT flights_with_flight_time_hun.* FROM flights_with_flight_time_hun WHERE flights_with_flight_time_hun.DepartureDateTime > NOW();

CREATE VIEW IF NOT EXISTS active_flights_en AS
	SELECT flights_with_flight_time_en.* FROM flights_with_flight_time_en WHERE flights_with_flight_time_en.DepartureDateTime > NOW();

 CREATE VIEW IF NOT EXISTS num_of_available_seats_on_active_flights_hun AS
    SELECT active_flights_hun.FlightID, active_flights_hun.DepartureAirport, active_flights_hun.DepartureCity, active_flights_hun.ArrivalAirport, active_flights_hun.ArrivalCity, DATE(active_flights_hun.DepartureDateTime) AS "DepartureDate", DATE(active_flights_hun.ArrivalDateTime) AS "ArrivalDate", TIME_FORMAT(TIME(active_flights_hun.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(active_flights_hun.ArrivalDateTime), '%H:%i') AS "ArrivalTime", TIME_FORMAT(TIME(active_flights_hun.FlightTime), '%H:%i') AS "FlightTime", active_flights_hun.BasePriceInHUF, aircraftmodel.AircraftModelID, (aircraftmodel.NumberOfSeats - COUNT(CASE WHEN reservation.IsCancelled = 0 THEN reservation.ReservationID END)) AS "NumOfAvailableSeats" FROM active_flights_hun INNER JOIN aircraft ON active_flights_hun.AircraftID = aircraft.AircraftID INNER JOIN aircraftmodel ON aircraft.AircraftModelID = aircraftmodel.AircraftModelID LEFT JOIN reservation ON active_flights_hun.FlightID = reservation.FlightID GROUP BY active_flights_hun.FlightID;

 CREATE VIEW IF NOT EXISTS num_of_available_seats_on_active_flights_en AS
    SELECT active_flights_en.FlightID, active_flights_en.DepartureAirport, active_flights_en.DepartureCity, active_flights_en.ArrivalAirport, active_flights_en.ArrivalCity, DATE(active_flights_en.DepartureDateTime) AS "DepartureDate", DATE(active_flights_en.ArrivalDateTime) AS "ArrivalDate", TIME_FORMAT(TIME(active_flights_en.DepartureDateTime), '%H:%i') AS "DepartureTime", TIME_FORMAT(TIME(active_flights_en.ArrivalDateTime), '%H:%i') AS "ArrivalTime", TIME_FORMAT(TIME(active_flights_en.FlightTime), '%H:%i') AS "FlightTime", active_flights_en.BasePriceInHUF, aircraftmodel.AircraftModelID, (aircraftmodel.NumberOfSeats - COUNT(CASE WHEN reservation.IsCancelled = 0 THEN reservation.ReservationID END)) AS "NumOfAvailableSeats" FROM active_flights_en INNER JOIN aircraft ON active_flights_en.AircraftID = aircraft.AircraftID INNER JOIN aircraftmodel ON aircraft.AircraftModelID = aircraftmodel.AircraftModelID LEFT JOIN reservation ON active_flights_en.FlightID = reservation.FlightID GROUP BY active_flights_en.FlightID;

CREATE VIEW IF NOT EXISTS available_flights_simplified AS
	SELECT DepartureAirport, ArrivalAirport, DepartureDate, NumOfAvailableSeats FROM num_of_available_seats_on_active_flights_hun WHERE NumOfAvailableSeats > 0;


-- CREATE VIEW IF NOT EXISTS num_of_available_seats_on_flights AS
--    SELECT flights_with_flight_time.* , (aircraftmodel.NumberOfSeats - COUNT(CASE WHEN reservation.IsCancelled = 0 THEN reservation.ReservationID END)) AS "NumOfAvailableSeats" FROM flights_with_flight_time INNER JOIN aircraft ON flights_with_flight_time.AircraftID = aircraft.AircraftID INNER JOIN aircraftmodel ON aircraft.AircraftModelID = aircraftmodel.AircraftModelID LEFT JOIN reservation ON flights_with_flight_time.FlightID = reservation.FlightID GROUP BY flights_with_flight_time.FlightID;


CREATE VIEW IF NOT EXISTS not_cancelled_reservations AS
	SELECT reservations_with_prices.ReservationID, reservations_with_prices.PassengerID, reservations_with_prices.FlightID, reservations_with_prices.RowID, reservations_with_prices.ColumnID, reservations_with_prices.FareClassID, reservations_with_prices.IsAdult FROM reservations_with_prices WHERE !reservations_with_prices.IsCancelled;

CREATE VIEW IF NOT EXISTS number_of_flights_of_users AS
	SELECT useraccount.UserID, COUNT(DISTINCT not_cancelled_reservations.FlightID) AS "NumberOfFlights" FROM useraccount LEFT JOIN not_cancelled_reservations ON useraccount.UserID = not_cancelled_reservations.PassengerID  INNER JOIN flight ON not_cancelled_reservations.FlightID = flight.FlightID WHERE flight.DepartureDateTime < NOW() AND flight.IsCancelled = 0 GROUP BY useraccount.UserID;

INSERT INTO loyaltystatus (loyaltystatus.LoyaltyStatusName, loyaltystatus.DiscountInPercentage, loyaltystatus.NumberOfFlightsRequired) VALUES 
("Bronze", 0, 0),
("Silver", 1, 6),
("Gold", 5, 16),
("Platinum", 7, 26),
("Diamond", 10, 36);

INSERT INTO city (city.English, city.Hungarian, city.GeographicCoordinates) VALUES
("London","London", "51.507222, -0.127500"),
("Paris","Párizs", "48.856700, 2.352200"),
("Amsterdam","Amszterdam", "52.372778, 4.893611"),
("Frankfurt","Frankfurt", "50.110556, 8.682222"),
("Istanbul","Isztambul", "41.013611, 28.955000"),
("Madrid","Madrid", "40.416667, -3.700000"),
("Barcelona","Barcelona", "41.383333, 2.183333"),
("Munich","München", "48.137500, 11.575000"),
("Rome","Róma", "41.893333, 12.482778"),
("Copenhagen","Koppenhága", "55.676111, 12.568333"),
("Zurich","Zürich", "47.374444, 8.541111"),
("Vienna","Bécs", "48.208300, 16.372500"),
("Oslo","Oslo", "59.913333, 10.738889"),
("Stockholm","Stockholm", "59.329444, 18.068611"),
("Dublin","Dublin", "53.350000, -6.260278"),
("Brussels","Brüsszel", "50.846667, 4.352500"),
("Lisbon","Lisszabon", "38.725278, -9.150000"),
("Athens","Athén", "37.984167, 23.728056"),
("Warsaw","Varsó", "52.230000, 21.011111"),
("Prague","Prága", "50.087500, 14.421389"),
("Dubai","Dubaj", "25.204722, 55.270833"),
("Abu Dhabi","Abu Dhabi", "24.466667, 54.366667"),
("Doha","Doha", "25.286667, 51.533333"),
("Tel Aviv","Tel-Aviv", "32.080000, 34.780000"),
("Amman","Ammán", "31.949722, 35.932778"),
("Kuwait City","Kuvaitváros", "29.369722, 47.978333"),
("Muscat","Maszkat", "23.588889, 58.408333"),
("Riyadh","Rijád", "24.633333, 46.716667"),
("Jeddah","Dzsidda", "21.543333, 39.172778"),
("Manama","Manáma", "26.223333, 50.587500"),
("Budapest", "Budapest", "47.492500, 19.051389");

INSERT INTO country (country.English, country.Hungarian) VALUES
("United Kingdom", "Egyesült Királyság"),
("France", "Franciaország"),
("Netherlands", "Hollandia"),
("Turkey", "Törökország"),
("Spain", "Spanyolország"),
("Germany", "Németország"),
("Italy", "Olaszország"),
("Denmark", "Dánia"),
("Switzerland", "Svájc"),
("Austria", "Ausztria"),
("Norway", "Norvégia"),
("Sweden", "Svédország"),
("Ireland", "Írország"),
("Belgium", "Belgium"),
("Portugal", "Portugália"),
("Greece", "Görögország"),
("Poland", "Lengyelország"),
("Czech Republic", "Csehország"),
("United Arab Emirates", "Egyesült Arab Emírségek"),
("Qatar", "Katar"),
("Israel", "Izrael"),
("Jordan", "Jordánia"),
("Kuwait", "Kuvait"),
("Oman", "Omán"),
("Saudi Arabia", "Szaúd-Arábia"),
("Bahrain", "Bahrein"),
("Hungary", "Magyarország");

INSERT INTO airport (airport.AirportCode, airport.CityID, airport.CountryID, airport.UTCOffset) VALUES
("LHR",(SELECT CityID FROM city WHERE city.English LIKE "London"), (SELECT CountryID FROM country WHERE country.English LIKE "United Kingdom"), "00:00:00"),
("CDG",(SELECT CityID FROM city WHERE city.English LIKE "Paris"), (SELECT CountryID FROM country WHERE country.English LIKE "France"), "01:00:00"),
("AMS",(SELECT CityID FROM city WHERE city.English LIKE "Amsterdam"), (SELECT CountryID FROM country WHERE country.English LIKE "Netherlands"), "01:00:00"),
("FRA",(SELECT CityID FROM city WHERE city.English LIKE "Frankfurt"), (SELECT CountryID FROM country WHERE country.English LIKE "Germany"), "01:00:00"),
("IST",(SELECT CityID FROM city WHERE city.English LIKE "Istanbul"), (SELECT CountryID FROM country WHERE country.English LIKE "Turkey"), "03:00:00"),
("MAD",(SELECT CityID FROM city WHERE city.English LIKE "Madrid"), (SELECT CountryID FROM country WHERE country.English LIKE "Spain"), "01:00:00"),
("BCN",(SELECT CityID FROM city WHERE city.English LIKE "Barcelona"), (SELECT CountryID FROM country WHERE country.English LIKE "Spain"), "01:00:00"),
("MUC",(SELECT CityID FROM city WHERE city.English LIKE "Munich"), (SELECT CountryID FROM country WHERE country.English LIKE "Germany"), "01:00:00"),
("FCO",(SELECT CityID FROM city WHERE city.English LIKE "Rome"), (SELECT CountryID FROM country WHERE country.English LIKE "Italy"), "01:00:00"),
("CPH",(SELECT CityID FROM city WHERE city.English LIKE "Copenhagen"), (SELECT CountryID FROM country WHERE country.English LIKE "Denmark"), "01:00:00"),
("ZRH",(SELECT CityID FROM city WHERE city.English LIKE "Zurich"), (SELECT CountryID FROM country WHERE country.English LIKE "Switzerland"), "01:00:00"),
("VIE",(SELECT CityID FROM city WHERE city.English LIKE "Vienna"), (SELECT CountryID FROM country WHERE country.English LIKE "Austria"), "01:00:00"),
("OSL",(SELECT CityID FROM city WHERE city.English LIKE "Oslo"), (SELECT CountryID FROM country WHERE country.English LIKE "Norway"), "01:00:00"),
("ARN",(SELECT CityID FROM city WHERE city.English LIKE "Stockholm"), (SELECT CountryID FROM country WHERE country.English LIKE "Sweden"), "01:00:00"),
("DUB",(SELECT CityID FROM city WHERE city.English LIKE "Dublin"), (SELECT CountryID FROM country WHERE country.English LIKE "Ireland"), "00:00:00"),
("BRU",(SELECT CityID FROM city WHERE city.English LIKE "Brussels"), (SELECT CountryID FROM country WHERE country.English LIKE "Belgium"), "01:00:00"),
("LIS",(SELECT CityID FROM city WHERE city.English LIKE "Lisbon"), (SELECT CountryID FROM country WHERE country.English LIKE "Portugal"), "00:00:00"),
("ATH",(SELECT CityID FROM city WHERE city.English LIKE "Athens"), (SELECT CountryID FROM country WHERE country.English LIKE "Greece"), "02:00:00"),
("WAW",(SELECT CityID FROM city WHERE city.English LIKE "Warsaw"), (SELECT CountryID FROM country WHERE country.English LIKE "Poland"), "01:00:00"),
("PRG",(SELECT CityID FROM city WHERE city.English LIKE "Prague"), (SELECT CountryID FROM country WHERE country.English LIKE "Czech Republic"), "01:00:00"),
("DXB",(SELECT CityID FROM city WHERE city.English LIKE "Dubai"), (SELECT CountryID FROM country WHERE country.English LIKE "United Arab Emirates"), "04:00:00"),
("AUH",(SELECT CityID FROM city WHERE city.English LIKE "Abu Dhabi"), (SELECT CountryID FROM country WHERE country.English LIKE "United Arab Emirates"), "04:00:00"),
("DOH",(SELECT CityID FROM city WHERE city.English LIKE "Doha"), (SELECT CountryID FROM country WHERE country.English LIKE "Qatar"), "03:00:00"),
("TLV",(SELECT CityID FROM city WHERE city.English LIKE "Tel Aviv"), (SELECT CountryID FROM country WHERE country.English LIKE "Israel"), "02:00:00"),
("AMM",(SELECT CityID FROM city WHERE city.English LIKE "Amman"), (SELECT CountryID FROM country WHERE country.English LIKE "Jordan"), "03:00:00"),
("KWI",(SELECT CityID FROM city WHERE city.English LIKE "Kuwait City"), (SELECT CountryID FROM country WHERE country.English LIKE "Kuwait"), "03:00:00"),
("MCT",(SELECT CityID FROM city WHERE city.English LIKE "Muscat"), (SELECT CountryID FROM country WHERE country.English LIKE "Oman"), "04:00:00"),
("RUH",(SELECT CityID FROM city WHERE city.English LIKE "Riyadh"), (SELECT CountryID FROM country WHERE country.English LIKE "Saudi Arabia"), "03:00:00"),
("JED",(SELECT CityID FROM city WHERE city.English LIKE "Jeddah"), (SELECT CountryID FROM country WHERE country.English LIKE "Saudi Arabia"), "03:00:00"),
("BAH",(SELECT CityID FROM city WHERE city.English LIKE "Manama"), (SELECT CountryID FROM country WHERE country.English LIKE "Bahrain"), "03:00:00"),
("BUD", (SELECT CityID FROM city WHERE city.English LIKE "Budapest"), (SELECT CountryID FROM country WHERE country.English LIKE "Hungary"), "01:00:00");

INSERT INTO aircraftmodel (aircraftmodel.AircraftModelName, aircraftmodel.NumberOfSeats) VALUES
("Airbus A220-100", 126),
("Boeing 737-900", 180);

INSERT INTO aircraft (aircraft.AircraftModelID) VALUES
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900")),
((SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"));

INSERT INTO fareclass (fareclass.FareClassName, fareclass.Multiplier) VALUES 
("First Class", 2.5),
("Business Class", 1.75),
("Economy Class", 1.0);

INSERT INTO seat (seat.RowID, seat.ColumnID, seat.AircraftModelID, seat.FareClassID) VALUES
(1, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(1, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "First Class")),
(2, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(2, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(3, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Business Class")),
(4, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(4, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(5, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(6, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(7, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(8, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(9, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(10, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(11, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(12, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(13, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(14, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(15, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(16, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(17, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(18, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(19, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(20, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Airbus A220-100"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(21, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(22, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(23, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(24, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(25, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(26, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(27, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(28, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(29, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "A", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "B", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "C", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "D", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "E", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class")),
(30, "F", (SELECT aircraftmodel.AircraftModelID FROM aircraftmodel WHERE aircraftmodel.AircraftModelName LIKE "Boeing 737-900"), (SELECT fareclass.FareClassID FROM fareclass WHERE fareclass.FareClassName LIKE "Economy Class"));


INSERT INTO useraccount (useraccount.UserName, useraccount.UserEmail, useraccount.UserPassword, useraccount.AdminStatus) VALUES
("admin", "admin@admin", "$2b$10$nAETe84Wnqon6iMkr0LMmORd76sUgCcME/cmaN0D/t2MjEgok5kqK", 1),
("Sulós Laci", "suloslaci@gmail.com", "$2b$10$7GqRU5JcV3WwRWjZF00etO.gv213OgbRgpPmyQtAH01LynJx9fv9K", 0);

INSERT INTO flight (flight.DepartureAirport, flight.ArrivalAirport, flight.DepartureDateTime, flight.ArrivalDateTime, flight.AircraftID, flight.BasePriceInHUF) VALUES
("BUD", "ATH", CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-28 10:30:00"), CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-28 13:30:00"), 1, 15000),
("BUD", "MUC", CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-28 15:40:00"), CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-28 16:55:00"), 3, 8000),
("ZRH", "FCO", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-01 8:10:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-01 9:45:00"), INTERVAL 1 MONTH), 4, 30000),
("CPH", "MAD", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-02 10:10:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-02 13:35:00"), INTERVAL 1 MONTH), 2, 25000),
("BUD", "ATH", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-07 11:30:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-07 14:30:00"), INTERVAL 1 MONTH), 9, 16000),
("BUD", "MUC", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-08 11:40:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-08 12:55:00"), INTERVAL 1 MONTH), 8, 10000),
("LHR", "ATH", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-10 07:40:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-10 13:20:00"), INTERVAL 1 MONTH), 5, 40000),
("CPH", "MUC", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-13 14:05:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-13 15:40:00"), INTERVAL 1 MONTH), 7, 22000),
("BUD", "ZRH", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-14 4:00:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-14 5:40:00"), INTERVAL 1 MONTH), 6, 18000),
("ZRH", "BUD", DATE_ADD(CONCAT(YEAR(NOW()), "-", MONTH(NOW()), "-14 16:30:00"), INTERVAL 1 MONTH), DATE_ADD(CONCAT(YEAR(NOW()),"-",MONTH(NOW()), "-14 18:10:00"), INTERVAL 1 MONTH), 6, 26700);




