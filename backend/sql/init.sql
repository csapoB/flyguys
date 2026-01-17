-- Database init
CREATE DATABASE IF NOT EXISTS FLYGUYS
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

USE FLYGUYS;

-- FareClass Table
CREATE TABLE IF NOT EXISTS FareClass (
	ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Name VARCHAR(50) UNIQUE
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
    FOREIGN KEY (AircraftID) REFERENCES Aircraft(AircraftID),
    FOREIGN KEY (DepartureAirport) REFERENCES Airport(AirportCode),
    FOREIGN KEY (ArrivalAirport) REFERENCES Airport(AirportCode)
);

-- Reservation Table
CREATE TABLE IF NOT EXISTS Reservation (
    ReservationID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    PassengerName VARCHAR(255) NOT NULL,
    PassengerID INT NOT NULL,
    FlightID INT NOT NULL,
    SeatNumber VARCHAR(10) NOT NULL,
    FareClassID INT NOT NULL,
    ISCancelled BOOLEAN NOT NULL,
    FOREIGN KEY (FlightID) REFERENCES Flight(FlightID),
    FOREIGN KEY (PassengerID) REFERENCES UserAccount(UserID),
    FOREIGN KEY (FareClassID) REFERENCES FareClass(ID)
);

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

INSERT INTO fareclass (fareclass.Name) VALUES 
("First Class"),
("Business Class"),
("Economy Class");

INSERT INTO useraccount (useraccount.UserName, useraccount.UserPassword) VALUES
("admin", "adminpassw");