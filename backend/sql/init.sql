-- Database init
CREATE DATABASE IF NOT EXISTS FLYGUYS
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE FLYGUYS;

-- FareClass Table
CREATE TABLE IF NOT EXISTS FareClass (
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(50) UNIQUE,
    Multiplier DOUBLE NOT NULL
);

-- LoyaltyStatus Table
CREATE TABLE IF NOT EXISTS LoyaltyStatus (
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(50) UNIQUE,
    DiscountInPercentage INT(8)
);

-- UserAccount Table
CREATE TABLE IF NOT EXISTS UserAccount (
    UserID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    UserName VARCHAR(255) NOT NULL,
    UserEmail VARCHAR(255),
    UserPassword VARCHAR(100) NOT NULL,
    UserBirthDate DATE,
    NumberOfFlights INT,
    LoyaltyStatusID INT,
    FOREIGN KEY (LoyaltyStatusID) REFERENCES LoyaltyStatus(LoyaltyStatusID)
);

-- City Table
CREATE TABLE IF NOT EXISTS City (
	CityID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Hungarian VARCHAR(100),
    English VARCHAR(100)
);

-- Country Table
CREATE TABLE IF NOT EXISTS Country (
	CountryID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Hungarian VARCHAR(100),
    English VARCHAR(100)
);

-- Airport Table
CREATE TABLE IF NOT EXISTS Airport (
	AirportCode VARCHAR(10) PRIMARY KEY NOT NULL,
    CityID INT NOT NULL,
    CountryID INT NOT NULL,
    FOREIGN KEY (CityID) REFERENCES City(CityID),
    FOREIGN KEY (CountryID) REFERENCES Country(CountryID)
);

-- Aircraft Table
CREATE TABLE IF NOT EXISTS Aircraft (
    AircraftID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    AircraftType VARCHAR(50) NOT NULL,
    NumberOfSeats INT NOT NULL
);

-- Flight Table
CREATE TABLE IF NOT EXISTS Flight (
    FlightID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    DepartureAirport VARCHAR(10) NOT NULL,
    ArrivalAirport VARCHAR(10) NOT NULL,
    DepartureDateTime DATETIME NOT NULL,
    ArrivalDateTime DATETIME NOT NULL,
    AircraftID INT NOT NULL,
    BasePrice INT NOT NULL,
    FOREIGN KEY (AircraftID) REFERENCES Aircraft(AircraftID),
    FOREIGN KEY (DepartureAirport) REFERENCES Airport(AirportCode),
    FOREIGN KEY (ArrivalAirport) REFERENCES Airport(AirportCode)
);

-- Reservation Table
CREATE TABLE IF NOT EXISTS Reservation (
    ReservationID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    PassengerID INT NOT NULL,
    FlightID INT NOT NULL,
    SeatNumber VARCHAR(10) NOT NULL,
    FareClassID INT NOT NULL,
    IsCancelled BOOLEAN NOT NULL,
   -- Price INT NOT NULL,
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID),
    FOREIGN KEY (PassengerID) REFERENCES UserAccount(UserID),
    FOREIGN KEY (FareClassID) REFERENCES FareClass(ID)
);

CREATE VIEW Reservations_With_Prices AS 
	SELECT reservation.*, flight.BasePrice*fareclass.Multiplier AS "Price"
    	FROM reservation INNER JOIN flight ON reservation.FlightID = flight.FlightID INNER JOIN fareclass ON reservation.FareClassID = fareclass.ID;

CREATE VIEW Airports_In_English AS
	SELECT airport.AirportCode, city.English AS "City", country.English AS "Country" 
    	FROM airport INNER JOIN city ON airport.CityID = city.CityID INNER JOIN country ON airport.CountryID = country.CountryID ORDER BY country.English ASC, city.English ASC;

CREATE VIEW Flights_Without_IDs AS 
	SELECT flight.DepartureAirport, flight.ArrivalAirport, flight.DepartureDateTime, flight.ArrivalDateTime, flight.BasePrice FROM flight; 


INSERT INTO city (city.English, city.Hungarian) VALUES
("London","London"),
("Paris","Párizs"),
("Amsterdam","Amszterdam"),
("Frankfurt","Frankfurt"),
("Istanbul","Isztambul"),
("Madrid","Madrid"),
("Barcelona","Barcelona"),
("Munich","München"),
("Rome","Róma"),
("Copenhagen","Koppenhága"),
("Zurich","Zürich"),
("Vienna","Bécs"),
("Oslo","Oslo"),
("Stockholm","Stockholm"),
("Dublin","Dublin"),
("Brussels","Brüsszel"),
("Lisbon","Lisszabon"),
("Athens","Athén"),
("Warsaw","Varsó"),
("Prague","Prága"),
("Dubai","Dubaj"),
("Abu Dhabi","Abu Dhabi"),
("Doha","Doha"),
("Tel Aviv","Tel-Aviv"),
("Amman","Ammán"),
("Kuwait City","Kuvaitváros"),
("Muscat","Maszkat"),
("Riyadh","Rijád"),
("Jeddah","Dzsidda"),
("Manama","Manáma"),
("Budapest", "Budapest");

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

INSERT INTO airport (airport.AirportCode, airport.CityID, airport.CountryID) VALUES
("LHR",(SELECT CityID FROM city WHERE city.English LIKE "London"), (SELECT CountryID FROM country WHERE country.English LIKE "United Kingdom")),
("CDG",(SELECT CityID FROM city WHERE city.English LIKE "Paris"), (SELECT CountryID FROM country WHERE country.English LIKE "France")),
("AMS",(SELECT CityID FROM city WHERE city.English LIKE "Amsterdam"), (SELECT CountryID FROM country WHERE country.English LIKE "Netherlands")),
("FRA",(SELECT CityID FROM city WHERE city.English LIKE "Frankfurt"), (SELECT CountryID FROM country WHERE country.English LIKE "Germany")),
("IST",(SELECT CityID FROM city WHERE city.English LIKE "Istanbul"), (SELECT CountryID FROM country WHERE country.English LIKE "Turkey")),
("MAD",(SELECT CityID FROM city WHERE city.English LIKE "Madrid"), (SELECT CountryID FROM country WHERE country.English LIKE "Spain")),
("BCN",(SELECT CityID FROM city WHERE city.English LIKE "Barcelona"), (SELECT CountryID FROM country WHERE country.English LIKE "Spain")),
("MUC",(SELECT CityID FROM city WHERE city.English LIKE "Munich"), (SELECT CountryID FROM country WHERE country.English LIKE "Germany")),
("FCO",(SELECT CityID FROM city WHERE city.English LIKE "Rome"), (SELECT CountryID FROM country WHERE country.English LIKE "Italy")),
("CPH",(SELECT CityID FROM city WHERE city.English LIKE "Copenhagen"), (SELECT CountryID FROM country WHERE country.English LIKE "Denmark")),
("ZRH",(SELECT CityID FROM city WHERE city.English LIKE "Zurich"), (SELECT CountryID FROM country WHERE country.English LIKE "Switzerland")),
("VIE",(SELECT CityID FROM city WHERE city.English LIKE "Vienna"), (SELECT CountryID FROM country WHERE country.English LIKE "Austria")),
("OSL",(SELECT CityID FROM city WHERE city.English LIKE "Oslo"), (SELECT CountryID FROM country WHERE country.English LIKE "Norway")),
("ARN",(SELECT CityID FROM city WHERE city.English LIKE "Stockholm"), (SELECT CountryID FROM country WHERE country.English LIKE "Sweden")),
("DUB",(SELECT CityID FROM city WHERE city.English LIKE "Dublin"), (SELECT CountryID FROM country WHERE country.English LIKE "Ireland")),
("BRU",(SELECT CityID FROM city WHERE city.English LIKE "Brussels"), (SELECT CountryID FROM country WHERE country.English LIKE "Belgium")),
("LIS",(SELECT CityID FROM city WHERE city.English LIKE "Lisbon"), (SELECT CountryID FROM country WHERE country.English LIKE "Portugal")),
("ATH",(SELECT CityID FROM city WHERE city.English LIKE "Athens"), (SELECT CountryID FROM country WHERE country.English LIKE "Greece")),
("WAW",(SELECT CityID FROM city WHERE city.English LIKE "Warsaw"), (SELECT CountryID FROM country WHERE country.English LIKE "Poland")),
("PRG",(SELECT CityID FROM city WHERE city.English LIKE "Prague"), (SELECT CountryID FROM country WHERE country.English LIKE "Czech Republic")),
("DXB",(SELECT CityID FROM city WHERE city.English LIKE "Dubai"), (SELECT CountryID FROM country WHERE country.English LIKE "United Arab Emirates")),
("AUH",(SELECT CityID FROM city WHERE city.English LIKE "Abu Dhabi"), (SELECT CountryID FROM country WHERE country.English LIKE "United Arab Emirates")),
("DOH",(SELECT CityID FROM city WHERE city.English LIKE "Doha"), (SELECT CountryID FROM country WHERE country.English LIKE "Qatar")),
("TLV",(SELECT CityID FROM city WHERE city.English LIKE "Tel Aviv"), (SELECT CountryID FROM country WHERE country.English LIKE "Israel")),
("AMM",(SELECT CityID FROM city WHERE city.English LIKE "Amman"), (SELECT CountryID FROM country WHERE country.English LIKE "Jordan")),
("KWI",(SELECT CityID FROM city WHERE city.English LIKE "Kuwait City"), (SELECT CountryID FROM country WHERE country.English LIKE "Kuwait")),
("MCT",(SELECT CityID FROM city WHERE city.English LIKE "Muscat"), (SELECT CountryID FROM country WHERE country.English LIKE "Oman")),
("RUH",(SELECT CityID FROM city WHERE city.English LIKE "Riyadh"), (SELECT CountryID FROM country WHERE country.English LIKE "Saudi Arabia")),
("JED",(SELECT CityID FROM city WHERE city.English LIKE "Jeddah"), (SELECT CountryID FROM country WHERE country.English LIKE "Saudi Arabia")),
("BAH",(SELECT CityID FROM city WHERE city.English LIKE "Manama"), (SELECT CountryID FROM country WHERE country.English LIKE "Bahrain")),
("BUD", (SELECT CityID FROM city WHERE city.English LIKE "Budapest"), (SELECT CountryID FROM country WHERE country.English LIKE "Hungary"));

INSERT INTO aircraft (aircraft.AircraftType, aircraft.NumberOfSeats) VALUES
("Airbus A220-100",125),
("Airbus A220-100",125),
("Airbus A220-100",125),
("Boeing 737-900",185),
("Boeing 737-900",185),
("Boeing 737-900",185),
("Boeing 737-900",185),
("Boeing 737-900",185),
("Boeing 737-900",185);

INSERT INTO fareclass (fareclass.Name, fareclass.Multiplier) VALUES 
("First Class", 2.5),
("Business Class", 1.75),
("Economy Class", 1.0);


INSERT INTO flight (flight.DepartureAirport, flight.ArrivalAirport, flight.DepartureDateTime, flight.ArrivalDateTime, flight.AircraftID, flight.BasePrice) VALUES
("BUD", "ATH", "2026-01-30 10:30:00", "2026-01-30 13:30:00", 1, 15000),
("BUD", "MUC", "2026-01-30 15:40:00", "2026-01-30 16:55:00", 3, 8000),
("ZRH", "FCO", "2026-02-01 8:10:00", "2026-02-01 9:45:00", 4, 30000),
("CPH", "MAD", "2026-02-2 10:10:00", "2026-02-15 13:35:00", 2, 25000);