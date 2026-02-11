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
    Name VARCHAR(50) UNIQUE
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
    AdminStatus BOOLEAN DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LoyaltyStatusID) REFERENCES LoyaltyStatus(ID)
);

-- Airport Table
CREATE TABLE IF NOT EXISTS Airport (
	AirportCode VARCHAR(10) PRIMARY KEY NOT NULL,
    City VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL
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

INSERT INTO airport (airport.AirportCode, airport.City, airport.Country) VALUES
("LHR","London","United Kingdom"),
("CDG","Paris","France"),
("AMS","Amsterdam","Netherlands"),
("FRA","Frankfurt","Germany"),
("IST","Istanbul","Turkey"),
("MAD","Madrid","Spain"),
("BCN","Barcelona","Spain"),
("MUC","Munich","Germany"),
("FCO","Rome","Italy"),
("CPH","Copenhagen","Denmark"),
("ZRH","Zurich","Switzerland"),
("VIE","Vienna","Austria"),
("OSL","Oslo","Norway"),
("ARN","Stockholm","Sweden"),
("DUB","Dublin","Ireland"),
("BRU","Brussels","Belgium"),
("LIS","Lisbon","Portugal"),
("ATH","Athens","Greece"),
("WAW","Warsaw","Poland"),
("PRG","Prague","Czech Republic"),
("DXB","Dubai","United Arab Emirates"),
("AUH","Abu Dhabi","United Arab Emirates"),
("DOH","Doha","Qatar"),
("TLV","Tel Aviv","Israel"),
("AMM","Amman","Jordan"),
("KWI","Kuwait City","Kuwait"),
("MCT","Muscat","Oman"),
("RUH","Riyadh","Saudi Arabia"),
("JED","Jeddah","Saudi Arabia"),
("BAH","Manama","Bahrain"),
("BUD", "Budapest", "Hungary");

INSERT INTO fareclass (fareclass.Name, fareclass.Multiplier) VALUES 
("First Class", 2.5),
("Business Class", 1.75),
("Economy Class", 1.0);

INSERT INTO useraccount (useraccount.UserName, useraccount.UserEmail, useraccount.UserPassword, useraccount.AdminStatus) VALUES
("admin", "admin@admin", "$2b$10$nAETe84Wnqon6iMkr0LMmORd76sUgCcME/cmaN0D/t2MjEgok5kqK", 1);

INSERT INTO flight (flight.DepartureAirport, flight.ArrivalAirport, flight.DepartureDateTime, flight.ArrivalDateTime, flight.AircraftID, flight.BasePrice) VALUES
("BUD", "ATH", "2026-01-30 10:30:00", "2026-01-30 13:30:00", 1, 15000),
("BUD", "MUC", "2026-01-30 15:40:00", "2026-01-30 16:55:00", 3, 8000),
("ZRH", "FCO", "2026-02-01 8:10:00", "2026-02-01 9:45:00", 4, 30000),
("CPH", "MAD", "2026-02-2 10:10:00", "2026-02-15 13:35:00", 2, 25000);