-- Database init
CREATE DATABASE FLYGUYS
DEFAULT CHARACTER SET utf8
COLLATE utf8_hungarian_ci;

-- Passenger Table
CREATE TABLE Passenger (
    PassengerID INT PRIMARY KEY NOT NULL,
    PassengerName VARCHAR(255),
    ContactInfo VARCHAR(255),
    FrequentFlyerNumber VARCHAR(50),
    LoyaltyStatus VARCHAR(50)
);

-- Airport Table
CREATE TABLE Airport (
	AirportCode VARCHAR(10) PRIMARY KEY NOT NULL,
    Country VARCHAR(100)
)

-- Aircraft Table
CREATE TABLE Aircraft (
    AircraftID INT PRIMARY KEY NOT NULL,
    AircraftType VARCHAR(50),
    RegistrationNumber VARCHAR(50),
    MaintenanceSchedule VARCHAR(255),
    LastMaintenanceDate DATE
);

-- Flight Table
CREATE TABLE Flight (
    FlightNumber VARCHAR(10) PRIMARY KEY NOT NULL,
    DepartureAirport VARCHAR(10),
    ArrivalAirport VARCHAR(10),
    DepartureDateTime DATETIME,
    ArrivalDateTime DATETIME,
    AircraftID INT,
    FOREIGN KEY (AircraftID) REFERENCES Aircraft(AircraftID),
    FOREIGN KEY (DepartureAirport) REFERENCES Airport(AirportCode),
    FOREIGN KEY (ArrivalAirport) REFERENCES Airport(AirportCode)
);

-- Reservation Table
CREATE TABLE Reservation (
    ReservationID INT PRIMARY KEY NOT NULL,
    PassengerName VARCHAR(255),
    PassengerID INT,
    FlightNumber VARCHAR(10),
    SeatNumber VARCHAR(10),
    FareClass VARCHAR(50),
    FOREIGN KEY (FlightNumber) REFERENCES Flight(FlightNumber),
    FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID)
);

-- MaintenanceTask Table
CREATE TABLE MaintenanceTask (
    TaskID INT PRIMARY KEY NOT NULL,
    TaskDescription VARCHAR(255),
    FrequencyInterval VARCHAR(50)
);


-- AircraftMaintenance Table (to handle Many-to-Many relationship between Aircraft and MaintenanceTask)
CREATE TABLE AircraftMaintenance (
    AircraftID INT,
    TaskID INT,
    PRIMARY KEY (AircraftID, TaskID),
    FOREIGN KEY (AircraftID) REFERENCES Aircraft(AircraftID),
    FOREIGN KEY (TaskID) REFERENCES MaintenanceTask(TaskID)
);