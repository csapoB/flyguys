-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Máj 04. 16:24
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `flyguys`
--

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `active_flights_en`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `active_flights_en` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDateTime` datetime
,`ArrivalDateTime` datetime
,`FlightTime` time
,`BasePriceInHUF` int(11)
,`AircraftID` int(11)
,`IsCancelled` tinyint(1)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `active_flights_hun`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `active_flights_hun` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDateTime` datetime
,`ArrivalDateTime` datetime
,`FlightTime` time
,`BasePriceInHUF` int(11)
,`AircraftID` int(11)
,`IsCancelled` tinyint(1)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aircraft`
--

CREATE TABLE `aircraft` (
  `AircraftID` int(11) NOT NULL,
  `AircraftModelID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `aircraft`
--

INSERT INTO `aircraft` (`AircraftID`, `AircraftModelID`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `aircraftmodel`
--

CREATE TABLE `aircraftmodel` (
  `AircraftModelID` int(11) NOT NULL,
  `AircraftModelName` varchar(50) DEFAULT NULL,
  `NumberOfSeats` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `aircraftmodel`
--

INSERT INTO `aircraftmodel` (`AircraftModelID`, `AircraftModelName`, `NumberOfSeats`) VALUES
(1, 'Airbus A220-100', 126),
(2, 'Boeing 737-900', 180);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `airport`
--

CREATE TABLE `airport` (
  `AirportCode` varchar(10) NOT NULL,
  `CityID` int(11) NOT NULL,
  `CountryID` int(11) NOT NULL,
  `UTCOffset` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `airport`
--

INSERT INTO `airport` (`AirportCode`, `CityID`, `CountryID`, `UTCOffset`) VALUES
('AMM', 25, 22, '03:00:00'),
('AMS', 3, 3, '01:00:00'),
('ARN', 14, 12, '01:00:00'),
('ATH', 18, 16, '02:00:00'),
('AUH', 22, 19, '04:00:00'),
('BAH', 30, 26, '03:00:00'),
('BCN', 7, 5, '01:00:00'),
('BRU', 16, 14, '01:00:00'),
('BUD', 31, 27, '01:00:00'),
('CDG', 2, 2, '01:00:00'),
('CPH', 10, 8, '01:00:00'),
('DOH', 23, 20, '03:00:00'),
('DUB', 15, 13, '00:00:00'),
('DXB', 21, 19, '04:00:00'),
('FCO', 9, 7, '01:00:00'),
('FRA', 4, 6, '01:00:00'),
('IST', 5, 4, '03:00:00'),
('JED', 29, 25, '03:00:00'),
('KWI', 26, 23, '03:00:00'),
('LHR', 1, 1, '00:00:00'),
('LIS', 17, 15, '00:00:00'),
('MAD', 6, 5, '01:00:00'),
('MCT', 27, 24, '04:00:00'),
('MUC', 8, 6, '01:00:00'),
('OSL', 13, 11, '01:00:00'),
('PRG', 20, 18, '01:00:00'),
('RUH', 28, 25, '03:00:00'),
('TLV', 24, 21, '02:00:00'),
('VIE', 12, 10, '01:00:00'),
('WAW', 19, 17, '01:00:00'),
('ZRH', 11, 9, '01:00:00');

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `airports_in_english`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `airports_in_english` (
`AirportCode` varchar(10)
,`English` varchar(100)
,`City` time
,`Country` varchar(100)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `airports_in_hungarian`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `airports_in_hungarian` (
`AirportCode` varchar(10)
,`Hungarian` varchar(100)
,`City` time
,`Country` varchar(100)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `available_flights_simplified`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `available_flights_simplified` (
`DepartureAirport` varchar(10)
,`ArrivalAirport` varchar(10)
,`DepartureDate` date
,`NumOfAvailableSeats` bigint(22)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `city`
--

CREATE TABLE `city` (
  `CityID` int(11) NOT NULL,
  `Hungarian` varchar(100) NOT NULL,
  `English` varchar(100) NOT NULL,
  `GeographicCoordinates` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `city`
--

INSERT INTO `city` (`CityID`, `Hungarian`, `English`, `GeographicCoordinates`) VALUES
(1, 'London', 'London', '51.507222, -0.127500'),
(2, 'Párizs', 'Paris', '48.856700, 2.352200'),
(3, 'Amszterdam', 'Amsterdam', '52.372778, 4.893611'),
(4, 'Frankfurt', 'Frankfurt', '50.110556, 8.682222'),
(5, 'Isztambul', 'Istanbul', '41.013611, 28.955000'),
(6, 'Madrid', 'Madrid', '40.416667, -3.700000'),
(7, 'Barcelona', 'Barcelona', '41.383333, 2.183333'),
(8, 'München', 'Munich', '48.137500, 11.575000'),
(9, 'Róma', 'Rome', '41.893333, 12.482778'),
(10, 'Koppenhága', 'Copenhagen', '55.676111, 12.568333'),
(11, 'Zürich', 'Zurich', '47.374444, 8.541111'),
(12, 'Bécs', 'Vienna', '48.208300, 16.372500'),
(13, 'Oslo', 'Oslo', '59.913333, 10.738889'),
(14, 'Stockholm', 'Stockholm', '59.329444, 18.068611'),
(15, 'Dublin', 'Dublin', '53.350000, -6.260278'),
(16, 'Brüsszel', 'Brussels', '50.846667, 4.352500'),
(17, 'Lisszabon', 'Lisbon', '38.725278, -9.150000'),
(18, 'Athén', 'Athens', '37.984167, 23.728056'),
(19, 'Varsó', 'Warsaw', '52.230000, 21.011111'),
(20, 'Prága', 'Prague', '50.087500, 14.421389'),
(21, 'Dubaj', 'Dubai', '25.204722, 55.270833'),
(22, 'Abu Dhabi', 'Abu Dhabi', '24.466667, 54.366667'),
(23, 'Doha', 'Doha', '25.286667, 51.533333'),
(24, 'Tel-Aviv', 'Tel Aviv', '32.080000, 34.780000'),
(25, 'Ammán', 'Amman', '31.949722, 35.932778'),
(26, 'Kuvaitváros', 'Kuwait City', '29.369722, 47.978333'),
(27, 'Maszkat', 'Muscat', '23.588889, 58.408333'),
(28, 'Rijád', 'Riyadh', '24.633333, 46.716667'),
(29, 'Dzsidda', 'Jeddah', '21.543333, 39.172778'),
(30, 'Manáma', 'Manama', '26.223333, 50.587500'),
(31, 'Budapest', 'Budapest', '47.492500, 19.051389');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `country`
--

CREATE TABLE `country` (
  `CountryID` int(11) NOT NULL,
  `Hungarian` varchar(100) NOT NULL,
  `English` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `country`
--

INSERT INTO `country` (`CountryID`, `Hungarian`, `English`) VALUES
(1, 'Egyesült Királyság', 'United Kingdom'),
(2, 'Franciaország', 'France'),
(3, 'Hollandia', 'Netherlands'),
(4, 'Törökország', 'Turkey'),
(5, 'Spanyolország', 'Spain'),
(6, 'Németország', 'Germany'),
(7, 'Olaszország', 'Italy'),
(8, 'Dánia', 'Denmark'),
(9, 'Svájc', 'Switzerland'),
(10, 'Ausztria', 'Austria'),
(11, 'Norvégia', 'Norway'),
(12, 'Svédország', 'Sweden'),
(13, 'Írország', 'Ireland'),
(14, 'Belgium', 'Belgium'),
(15, 'Portugália', 'Portugal'),
(16, 'Görögország', 'Greece'),
(17, 'Lengyelország', 'Poland'),
(18, 'Csehország', 'Czech Republic'),
(19, 'Egyesült Arab Emírségek', 'United Arab Emirates'),
(20, 'Katar', 'Qatar'),
(21, 'Izrael', 'Israel'),
(22, 'Jordánia', 'Jordan'),
(23, 'Kuvait', 'Kuwait'),
(24, 'Omán', 'Oman'),
(25, 'Szaúd-Arábia', 'Saudi Arabia'),
(26, 'Bahrein', 'Bahrain'),
(27, 'Magyarország', 'Hungary');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `fareclass`
--

CREATE TABLE `fareclass` (
  `FareClassID` int(11) NOT NULL,
  `FareClassName` varchar(50) DEFAULT NULL,
  `Multiplier` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `fareclass`
--

INSERT INTO `fareclass` (`FareClassID`, `FareClassName`, `Multiplier`) VALUES
(1, 'First Class', 2.5),
(2, 'Business Class', 1.75),
(3, 'Economy Class', 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `flight`
--

CREATE TABLE `flight` (
  `FlightID` int(11) NOT NULL,
  `DepartureAirport` varchar(10) NOT NULL,
  `ArrivalAirport` varchar(10) NOT NULL,
  `DepartureDateTime` datetime NOT NULL,
  `ArrivalDateTime` datetime NOT NULL,
  `AircraftID` int(11) NOT NULL,
  `BasePriceInHUF` int(11) NOT NULL,
  `IsCancelled` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `flight`
--

INSERT INTO `flight` (`FlightID`, `DepartureAirport`, `ArrivalAirport`, `DepartureDateTime`, `ArrivalDateTime`, `AircraftID`, `BasePriceInHUF`, `IsCancelled`) VALUES
(1, 'BUD', 'ZRH', '2026-04-25 12:10:00', '2026-04-25 13:45:00', 4, 39000, 0),
(2, 'BUD', 'ATH', '2026-05-28 10:30:00', '2026-05-28 13:30:00', 1, 15000, 0),
(3, 'BUD', 'MUC', '2026-05-28 15:40:00', '2026-05-28 16:55:00', 3, 8000, 0),
(4, 'ZRH', 'FCO', '2026-06-01 08:10:00', '2026-06-01 09:45:00', 4, 30000, 0),
(5, 'CPH', 'MAD', '2026-06-02 10:10:00', '2026-06-02 13:35:00', 2, 25000, 0),
(6, 'BUD', 'ATH', '2026-06-07 11:30:00', '2026-06-07 14:30:00', 9, 16000, 0),
(7, 'BUD', 'MUC', '2026-06-08 11:40:00', '2026-06-08 12:55:00', 8, 10000, 0),
(8, 'LHR', 'ATH', '2026-06-10 07:40:00', '2026-06-10 13:20:00', 5, 40000, 0),
(9, 'CPH', 'MUC', '2026-06-13 14:05:00', '2026-06-13 15:40:00', 7, 22000, 0),
(10, 'BUD', 'ZRH', '2026-06-14 04:00:00', '2026-06-14 05:40:00', 6, 18000, 0),
(11, 'ZRH', 'BUD', '2026-06-15 16:30:00', '2026-06-15 18:10:00', 6, 26700, 0),
(12, 'ATH', 'WAW', '2026-05-28 15:10:00', '2026-05-28 16:40:00', 1, 30000, 0),
(13, 'MUC', 'ARN', '2026-05-28 18:40:00', '2026-05-28 20:55:00', 3, 80000, 0),
(14, 'FCO', 'OSL', '2026-06-01 11:10:00', '2026-06-01 14:20:00', 4, 32000, 0),
(15, 'MAD', 'CDG', '2026-06-02 14:30:00', '2026-06-02 16:35:00', 2, 75000, 0),
(16, 'ATH', 'LIS', '2026-06-07 17:00:00', '2026-06-07 19:10:00', 9, 96000, 0),
(17, 'MUC', 'AMS', '2026-06-08 19:40:00', '2026-06-08 21:10:00', 8, 44000, 0),
(18, 'ATH', 'PRG', '2026-06-10 14:00:00', '2026-06-10 15:40:00', 5, 50000, 0),
(19, 'MUC', 'LHR', '2026-06-13 16:15:00', '2026-06-13 17:20:00', 7, 39000, 0),
(20, 'BUD', 'FRA', '2026-06-15 23:30:00', '2026-06-16 01:10:00', 6, 26500, 0),
(21, 'WAW', 'BRU', '2026-05-28 18:25:00', '2026-05-28 20:25:00', 1, 21000, 0),
(22, 'ARN', 'OSL', '2026-05-28 22:40:00', '2026-05-28 23:40:00', 3, 7500, 0),
(23, 'OSL', 'DUB', '2026-06-01 16:20:00', '2026-06-01 17:35:00', 4, 66000, 0),
(24, 'CDG', 'LHR', '2026-06-02 17:05:00', '2026-06-02 17:05:00', 2, 7700, 0),
(25, 'LIS', 'DUB', '2026-06-07 22:00:00', '2026-06-08 00:45:00', 9, 106000, 0),
(26, 'AMS', 'IST', '2026-06-08 22:25:00', '2026-06-09 03:50:00', 8, 140000, 0),
(27, 'PRG', 'BRU', '2026-06-10 17:05:00', '2026-06-10 18:35:00', 5, 25000, 0),
(28, 'LHR', 'FCO', '2026-06-13 19:10:00', '2026-06-13 22:50:00', 7, 80000, 0),
(29, 'FRA', 'BCN', '2026-06-16 03:00:00', '2026-06-16 05:10:00', 6, 49500, 0),
(30, 'BRU', 'WAW', '2026-05-28 21:50:00', '2026-05-28 23:50:00', 1, 29000, 0),
(31, 'OSL', 'VIE', '2026-06-01 00:35:00', '2026-06-01 02:55:00', 3, 46000, 0),
(32, 'DUB', 'CPH', '2026-06-01 20:00:00', '2026-06-01 23:10:00', 4, 33000, 0),
(33, 'LHR', 'FRA', '2026-06-02 19:05:00', '2026-06-02 21:50:00', 2, 19800, 0),
(34, 'DUB', 'FCO', '2026-06-08 02:00:00', '2026-06-08 05:10:00', 9, 90000, 0),
(35, 'IST', 'BUD', '2026-06-09 05:00:00', '2026-06-09 05:00:00', 8, 80000, 0),
(36, 'BRU', 'ARN', '2026-06-10 20:05:00', '2026-06-10 22:20:00', 5, 51000, 0),
(37, 'FCO', 'ATH', '2026-06-13 23:30:00', '2026-06-14 02:30:00', 7, 18000, 0),
(38, 'BCN', 'CPH', '2026-06-16 06:00:00', '2026-06-16 09:00:00', 6, 77000, 0);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `flights_with_flight_time_en`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `flights_with_flight_time_en` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDateTime` datetime
,`ArrivalDateTime` datetime
,`FlightTime` time
,`BasePriceInHUF` int(11)
,`AircraftID` int(11)
,`IsCancelled` tinyint(1)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `flights_with_flight_time_hun`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `flights_with_flight_time_hun` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDateTime` datetime
,`ArrivalDateTime` datetime
,`FlightTime` time
,`BasePriceInHUF` int(11)
,`AircraftID` int(11)
,`IsCancelled` tinyint(1)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `loyaltystatus`
--

CREATE TABLE `loyaltystatus` (
  `LoyaltyStatusID` int(11) NOT NULL,
  `LoyaltyStatusName` varchar(50) DEFAULT NULL,
  `DiscountInPercentage` int(8) NOT NULL,
  `NumberOfFlightsRequired` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `loyaltystatus`
--

INSERT INTO `loyaltystatus` (`LoyaltyStatusID`, `LoyaltyStatusName`, `DiscountInPercentage`, `NumberOfFlightsRequired`) VALUES
(1, 'Bronze', 0, 0),
(2, 'Silver', 1, 6),
(3, 'Gold', 5, 16),
(4, 'Platinum', 7, 26),
(5, 'Diamond', 10, 36);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `not_cancelled_reservations`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `not_cancelled_reservations` (
`ReservationID` int(11)
,`PassengerID` int(11)
,`FlightID` int(11)
,`RowID` int(11)
,`ColumnID` char(1)
,`FareClassID` int(11)
,`IsAdult` tinyint(1)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `number_of_flights_of_users`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `number_of_flights_of_users` (
`UserID` int(11)
,`NumberOfFlights` bigint(21)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `num_of_available_seats_on_active_flights_en`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `num_of_available_seats_on_active_flights_en` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDate` date
,`ArrivalDate` date
,`DepartureTime` varchar(10)
,`ArrivalTime` varchar(10)
,`FlightTime` varchar(10)
,`BasePriceInHUF` int(11)
,`AircraftModelID` int(11)
,`NumOfAvailableSeats` bigint(22)
);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `num_of_available_seats_on_active_flights_hun`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `num_of_available_seats_on_active_flights_hun` (
`FlightID` int(11)
,`DepartureAirport` varchar(10)
,`DepartureCity` varchar(100)
,`ArrivalAirport` varchar(10)
,`ArrivalCity` varchar(100)
,`DepartureDate` date
,`ArrivalDate` date
,`DepartureTime` varchar(10)
,`ArrivalTime` varchar(10)
,`FlightTime` varchar(10)
,`BasePriceInHUF` int(11)
,`AircraftModelID` int(11)
,`NumOfAvailableSeats` bigint(22)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reservation`
--

CREATE TABLE `reservation` (
  `ReservationID` int(11) NOT NULL,
  `PassengerID` int(11) NOT NULL,
  `FlightID` int(11) NOT NULL,
  `RowID` int(11) NOT NULL,
  `ColumnID` char(1) NOT NULL,
  `IsCancelled` tinyint(1) NOT NULL,
  `IsAdult` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `reservation`
--

INSERT INTO `reservation` (`ReservationID`, `PassengerID`, `FlightID`, `RowID`, `ColumnID`, `IsCancelled`, `IsAdult`) VALUES
(1, 2, 1, 1, 'A', 0, 1),
(2, 2, 1, 3, 'B', 0, 1),
(3, 2, 1, 10, 'C', 0, 0);

-- --------------------------------------------------------

--
-- A nézet helyettes szerkezete `reservations_with_prices`
-- (Lásd alább az aktuális nézetet)
--
CREATE TABLE `reservations_with_prices` (
`ReservationID` int(11)
,`PassengerID` int(11)
,`FlightID` int(11)
,`RowID` int(11)
,`ColumnID` char(1)
,`FareClassID` int(11)
,`PriceInHun` double
,`IsCancelled` tinyint(1)
,`IsAdult` tinyint(1)
);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `seat`
--

CREATE TABLE `seat` (
  `RowID` int(11) NOT NULL,
  `ColumnID` char(1) NOT NULL,
  `AircraftModelID` int(11) NOT NULL,
  `FareClassID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `seat`
--

INSERT INTO `seat` (`RowID`, `ColumnID`, `AircraftModelID`, `FareClassID`) VALUES
(1, 'A', 1, 1),
(1, 'A', 2, 1),
(1, 'B', 1, 1),
(1, 'B', 2, 1),
(1, 'C', 1, 1),
(1, 'C', 2, 1),
(1, 'D', 1, 1),
(1, 'D', 2, 1),
(1, 'E', 1, 1),
(1, 'E', 2, 1),
(1, 'F', 1, 1),
(1, 'F', 2, 1),
(2, 'A', 1, 2),
(2, 'A', 2, 2),
(2, 'B', 1, 2),
(2, 'B', 2, 2),
(2, 'C', 1, 2),
(2, 'C', 2, 2),
(2, 'D', 1, 2),
(2, 'D', 2, 2),
(2, 'E', 1, 2),
(2, 'E', 2, 2),
(2, 'F', 1, 2),
(2, 'F', 2, 2),
(3, 'A', 1, 2),
(3, 'A', 2, 2),
(3, 'B', 1, 2),
(3, 'B', 2, 2),
(3, 'C', 1, 2),
(3, 'C', 2, 2),
(3, 'D', 1, 2),
(3, 'D', 2, 2),
(3, 'E', 1, 2),
(3, 'E', 2, 2),
(3, 'F', 1, 2),
(3, 'F', 2, 2),
(4, 'A', 1, 3),
(4, 'A', 2, 3),
(4, 'B', 1, 3),
(4, 'B', 2, 3),
(4, 'C', 1, 3),
(4, 'C', 2, 3),
(4, 'D', 1, 3),
(4, 'D', 2, 3),
(4, 'E', 1, 3),
(4, 'E', 2, 3),
(4, 'F', 1, 3),
(4, 'F', 2, 3),
(5, 'A', 1, 3),
(5, 'A', 2, 3),
(5, 'B', 1, 3),
(5, 'B', 2, 3),
(5, 'C', 1, 3),
(5, 'C', 2, 3),
(5, 'D', 1, 3),
(5, 'D', 2, 3),
(5, 'E', 1, 3),
(5, 'E', 2, 3),
(5, 'F', 1, 3),
(5, 'F', 2, 3),
(6, 'A', 1, 3),
(6, 'A', 2, 3),
(6, 'B', 1, 3),
(6, 'B', 2, 3),
(6, 'C', 1, 3),
(6, 'C', 2, 3),
(6, 'D', 1, 3),
(6, 'D', 2, 3),
(6, 'E', 1, 3),
(6, 'E', 2, 3),
(6, 'F', 1, 3),
(6, 'F', 2, 3),
(7, 'A', 1, 3),
(7, 'A', 2, 3),
(7, 'B', 1, 3),
(7, 'B', 2, 3),
(7, 'C', 1, 3),
(7, 'C', 2, 3),
(7, 'D', 1, 3),
(7, 'D', 2, 3),
(7, 'E', 1, 3),
(7, 'E', 2, 3),
(7, 'F', 1, 3),
(7, 'F', 2, 3),
(8, 'A', 1, 3),
(8, 'A', 2, 3),
(8, 'B', 1, 3),
(8, 'B', 2, 3),
(8, 'C', 1, 3),
(8, 'C', 2, 3),
(8, 'D', 1, 3),
(8, 'D', 2, 3),
(8, 'E', 1, 3),
(8, 'E', 2, 3),
(8, 'F', 1, 3),
(8, 'F', 2, 3),
(9, 'A', 1, 3),
(9, 'A', 2, 3),
(9, 'B', 1, 3),
(9, 'B', 2, 3),
(9, 'C', 1, 3),
(9, 'C', 2, 3),
(9, 'D', 1, 3),
(9, 'D', 2, 3),
(9, 'E', 1, 3),
(9, 'E', 2, 3),
(9, 'F', 1, 3),
(9, 'F', 2, 3),
(10, 'A', 1, 3),
(10, 'A', 2, 3),
(10, 'B', 1, 3),
(10, 'B', 2, 3),
(10, 'C', 1, 3),
(10, 'C', 2, 3),
(10, 'D', 1, 3),
(10, 'D', 2, 3),
(10, 'E', 1, 3),
(10, 'E', 2, 3),
(10, 'F', 1, 3),
(10, 'F', 2, 3),
(11, 'A', 1, 3),
(11, 'A', 2, 3),
(11, 'B', 1, 3),
(11, 'B', 2, 3),
(11, 'C', 1, 3),
(11, 'C', 2, 3),
(11, 'D', 1, 3),
(11, 'D', 2, 3),
(11, 'E', 1, 3),
(11, 'E', 2, 3),
(11, 'F', 1, 3),
(11, 'F', 2, 3),
(12, 'A', 1, 3),
(12, 'A', 2, 3),
(12, 'B', 1, 3),
(12, 'B', 2, 3),
(12, 'C', 1, 3),
(12, 'C', 2, 3),
(12, 'D', 1, 3),
(12, 'D', 2, 3),
(12, 'E', 1, 3),
(12, 'E', 2, 3),
(12, 'F', 1, 3),
(12, 'F', 2, 3),
(13, 'A', 1, 3),
(13, 'A', 2, 3),
(13, 'B', 1, 3),
(13, 'B', 2, 3),
(13, 'C', 1, 3),
(13, 'C', 2, 3),
(13, 'D', 1, 3),
(13, 'D', 2, 3),
(13, 'E', 1, 3),
(13, 'E', 2, 3),
(13, 'F', 1, 3),
(13, 'F', 2, 3),
(14, 'A', 1, 3),
(14, 'A', 2, 3),
(14, 'B', 1, 3),
(14, 'B', 2, 3),
(14, 'C', 1, 3),
(14, 'C', 2, 3),
(14, 'D', 1, 3),
(14, 'D', 2, 3),
(14, 'E', 1, 3),
(14, 'E', 2, 3),
(14, 'F', 1, 3),
(14, 'F', 2, 3),
(15, 'A', 1, 3),
(15, 'A', 2, 3),
(15, 'B', 1, 3),
(15, 'B', 2, 3),
(15, 'C', 1, 3),
(15, 'C', 2, 3),
(15, 'D', 1, 3),
(15, 'D', 2, 3),
(15, 'E', 1, 3),
(15, 'E', 2, 3),
(15, 'F', 1, 3),
(15, 'F', 2, 3),
(16, 'A', 1, 3),
(16, 'A', 2, 3),
(16, 'B', 1, 3),
(16, 'B', 2, 3),
(16, 'C', 1, 3),
(16, 'C', 2, 3),
(16, 'D', 1, 3),
(16, 'D', 2, 3),
(16, 'E', 1, 3),
(16, 'E', 2, 3),
(16, 'F', 1, 3),
(16, 'F', 2, 3),
(17, 'A', 1, 3),
(17, 'A', 2, 3),
(17, 'B', 1, 3),
(17, 'B', 2, 3),
(17, 'C', 1, 3),
(17, 'C', 2, 3),
(17, 'D', 1, 3),
(17, 'D', 2, 3),
(17, 'E', 1, 3),
(17, 'E', 2, 3),
(17, 'F', 1, 3),
(17, 'F', 2, 3),
(18, 'A', 1, 3),
(18, 'A', 2, 3),
(18, 'B', 1, 3),
(18, 'B', 2, 3),
(18, 'C', 1, 3),
(18, 'C', 2, 3),
(18, 'D', 1, 3),
(18, 'D', 2, 3),
(18, 'E', 1, 3),
(18, 'E', 2, 3),
(18, 'F', 1, 3),
(18, 'F', 2, 3),
(19, 'A', 1, 3),
(19, 'A', 2, 3),
(19, 'B', 1, 3),
(19, 'B', 2, 3),
(19, 'C', 1, 3),
(19, 'C', 2, 3),
(19, 'D', 1, 3),
(19, 'D', 2, 3),
(19, 'E', 1, 3),
(19, 'E', 2, 3),
(19, 'F', 1, 3),
(19, 'F', 2, 3),
(20, 'A', 1, 3),
(20, 'A', 2, 3),
(20, 'B', 1, 3),
(20, 'B', 2, 3),
(20, 'C', 1, 3),
(20, 'C', 2, 3),
(20, 'D', 1, 3),
(20, 'D', 2, 3),
(20, 'E', 1, 3),
(20, 'E', 2, 3),
(20, 'F', 1, 3),
(20, 'F', 2, 3),
(21, 'A', 1, 3),
(21, 'A', 2, 3),
(21, 'B', 1, 3),
(21, 'B', 2, 3),
(21, 'C', 1, 3),
(21, 'C', 2, 3),
(21, 'D', 1, 3),
(21, 'D', 2, 3),
(21, 'E', 1, 3),
(21, 'E', 2, 3),
(21, 'F', 1, 3),
(21, 'F', 2, 3),
(22, 'A', 2, 3),
(22, 'B', 2, 3),
(22, 'C', 2, 3),
(22, 'D', 2, 3),
(22, 'E', 2, 3),
(22, 'F', 2, 3),
(23, 'A', 2, 3),
(23, 'B', 2, 3),
(23, 'C', 2, 3),
(23, 'D', 2, 3),
(23, 'E', 2, 3),
(23, 'F', 2, 3),
(24, 'A', 2, 3),
(24, 'B', 2, 3),
(24, 'C', 2, 3),
(24, 'D', 2, 3),
(24, 'E', 2, 3),
(24, 'F', 2, 3),
(25, 'A', 2, 3),
(25, 'B', 2, 3),
(25, 'C', 2, 3),
(25, 'D', 2, 3),
(25, 'E', 2, 3),
(25, 'F', 2, 3),
(26, 'A', 2, 3),
(26, 'B', 2, 3),
(26, 'C', 2, 3),
(26, 'D', 2, 3),
(26, 'E', 2, 3),
(26, 'F', 2, 3),
(27, 'A', 2, 3),
(27, 'B', 2, 3),
(27, 'C', 2, 3),
(27, 'D', 2, 3),
(27, 'E', 2, 3),
(27, 'F', 2, 3),
(28, 'A', 2, 3),
(28, 'B', 2, 3),
(28, 'C', 2, 3),
(28, 'D', 2, 3),
(28, 'E', 2, 3),
(28, 'F', 2, 3),
(29, 'A', 2, 3),
(29, 'B', 2, 3),
(29, 'C', 2, 3),
(29, 'D', 2, 3),
(29, 'E', 2, 3),
(29, 'F', 2, 3),
(30, 'A', 2, 3),
(30, 'B', 2, 3),
(30, 'C', 2, 3),
(30, 'D', 2, 3),
(30, 'E', 2, 3),
(30, 'F', 2, 3);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `useraccount`
--

CREATE TABLE `useraccount` (
  `UserID` int(11) NOT NULL,
  `UserName` varchar(255) NOT NULL,
  `UserEmail` varchar(255) DEFAULT NULL,
  `UserPassword` varchar(100) DEFAULT NULL,
  `UserBirthDate` date DEFAULT '2001-09-11',
  `LoyaltyStatusID` int(11) DEFAULT 1,
  `AdminStatus` tinyint(1) DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `useraccount`
--

INSERT INTO `useraccount` (`UserID`, `UserName`, `UserEmail`, `UserPassword`, `UserBirthDate`, `LoyaltyStatusID`, `AdminStatus`, `CreatedAt`) VALUES
(1, 'admin', 'admin@admin.admin', '$2b$10$nAETe84Wnqon6iMkr0LMmORd76sUgCcME/cmaN0D/t2MjEgok5kqK', '2001-09-11', 1, 1, '2026-05-04 14:24:09'),
(2, 'Sulós&Laci', 'suloslaci@gmail.com', '$2b$10$7GqRU5JcV3WwRWjZF00etO.gv213OgbRgpPmyQtAH01LynJx9fv9K', '2001-09-11', 1, 0, '2026-05-04 14:24:09');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `usermessage`
--

CREATE TABLE `usermessage` (
  `MessageID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `MessageHungarian` text DEFAULT NULL,
  `MessageEnglish` text DEFAULT NULL,
  `IsViewed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Nézet szerkezete `active_flights_en`
--
DROP TABLE IF EXISTS `active_flights_en`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_flights_en`  AS SELECT `flights_with_flight_time_en`.`FlightID` AS `FlightID`, `flights_with_flight_time_en`.`DepartureAirport` AS `DepartureAirport`, `flights_with_flight_time_en`.`DepartureCity` AS `DepartureCity`, `flights_with_flight_time_en`.`ArrivalAirport` AS `ArrivalAirport`, `flights_with_flight_time_en`.`ArrivalCity` AS `ArrivalCity`, `flights_with_flight_time_en`.`DepartureDateTime` AS `DepartureDateTime`, `flights_with_flight_time_en`.`ArrivalDateTime` AS `ArrivalDateTime`, `flights_with_flight_time_en`.`FlightTime` AS `FlightTime`, `flights_with_flight_time_en`.`BasePriceInHUF` AS `BasePriceInHUF`, `flights_with_flight_time_en`.`AircraftID` AS `AircraftID`, `flights_with_flight_time_en`.`IsCancelled` AS `IsCancelled` FROM `flights_with_flight_time_en` WHERE `flights_with_flight_time_en`.`DepartureDateTime` > current_timestamp() AND `flights_with_flight_time_en`.`IsCancelled` = 0 ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `active_flights_hun`
--
DROP TABLE IF EXISTS `active_flights_hun`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_flights_hun`  AS SELECT `flights_with_flight_time_hun`.`FlightID` AS `FlightID`, `flights_with_flight_time_hun`.`DepartureAirport` AS `DepartureAirport`, `flights_with_flight_time_hun`.`DepartureCity` AS `DepartureCity`, `flights_with_flight_time_hun`.`ArrivalAirport` AS `ArrivalAirport`, `flights_with_flight_time_hun`.`ArrivalCity` AS `ArrivalCity`, `flights_with_flight_time_hun`.`DepartureDateTime` AS `DepartureDateTime`, `flights_with_flight_time_hun`.`ArrivalDateTime` AS `ArrivalDateTime`, `flights_with_flight_time_hun`.`FlightTime` AS `FlightTime`, `flights_with_flight_time_hun`.`BasePriceInHUF` AS `BasePriceInHUF`, `flights_with_flight_time_hun`.`AircraftID` AS `AircraftID`, `flights_with_flight_time_hun`.`IsCancelled` AS `IsCancelled` FROM `flights_with_flight_time_hun` WHERE `flights_with_flight_time_hun`.`DepartureDateTime` > current_timestamp() AND `flights_with_flight_time_hun`.`IsCancelled` = 0 ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `airports_in_english`
--
DROP TABLE IF EXISTS `airports_in_english`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `airports_in_english`  AS SELECT `airport`.`AirportCode` AS `AirportCode`, `city`.`English` AS `English`, `airport`.`UTCOffset` AS `City`, `country`.`English` AS `Country` FROM ((`airport` join `city` on(`airport`.`CityID` = `city`.`CityID`)) join `country` on(`airport`.`CountryID` = `country`.`CountryID`)) ORDER BY `country`.`English` ASC, `city`.`English` ASC ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `airports_in_hungarian`
--
DROP TABLE IF EXISTS `airports_in_hungarian`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `airports_in_hungarian`  AS SELECT `airport`.`AirportCode` AS `AirportCode`, `city`.`Hungarian` AS `Hungarian`, `airport`.`UTCOffset` AS `City`, `country`.`Hungarian` AS `Country` FROM ((`airport` join `city` on(`airport`.`CityID` = `city`.`CityID`)) join `country` on(`airport`.`CountryID` = `country`.`CountryID`)) ORDER BY `country`.`Hungarian` ASC, `city`.`Hungarian` ASC ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `available_flights_simplified`
--
DROP TABLE IF EXISTS `available_flights_simplified`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `available_flights_simplified`  AS SELECT `num_of_available_seats_on_active_flights_hun`.`DepartureAirport` AS `DepartureAirport`, `num_of_available_seats_on_active_flights_hun`.`ArrivalAirport` AS `ArrivalAirport`, `num_of_available_seats_on_active_flights_hun`.`DepartureDate` AS `DepartureDate`, `num_of_available_seats_on_active_flights_hun`.`NumOfAvailableSeats` AS `NumOfAvailableSeats` FROM `num_of_available_seats_on_active_flights_hun` WHERE `num_of_available_seats_on_active_flights_hun`.`NumOfAvailableSeats` > 0 ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `flights_with_flight_time_en`
--
DROP TABLE IF EXISTS `flights_with_flight_time_en`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `flights_with_flight_time_en`  AS SELECT `flight`.`FlightID` AS `FlightID`, `flight`.`DepartureAirport` AS `DepartureAirport`, `origin_city`.`English` AS `DepartureCity`, `flight`.`ArrivalAirport` AS `ArrivalAirport`, `destination_city`.`English` AS `ArrivalCity`, `flight`.`DepartureDateTime` AS `DepartureDateTime`, `flight`.`ArrivalDateTime` AS `ArrivalDateTime`, timediff(`flight`.`ArrivalDateTime`,addtime(`flight`.`DepartureDateTime`,subtime(cast(abs(cast(`destination`.`UTCOffset` as time)) as time),cast(abs(cast(`origin`.`UTCOffset` as time)) as time)))) AS `FlightTime`, `flight`.`BasePriceInHUF` AS `BasePriceInHUF`, `flight`.`AircraftID` AS `AircraftID`, `flight`.`IsCancelled` AS `IsCancelled` FROM ((((`flight` join `airport` `origin` on(`flight`.`DepartureAirport` = `origin`.`AirportCode`)) join `airport` `destination` on(`flight`.`ArrivalAirport` = `destination`.`AirportCode`)) join `city` `origin_city` on(`origin`.`CityID` = `origin_city`.`CityID`)) join `city` `destination_city` on(`destination`.`CityID` = `destination_city`.`CityID`)) ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `flights_with_flight_time_hun`
--
DROP TABLE IF EXISTS `flights_with_flight_time_hun`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `flights_with_flight_time_hun`  AS SELECT `flight`.`FlightID` AS `FlightID`, `flight`.`DepartureAirport` AS `DepartureAirport`, `origin_city`.`Hungarian` AS `DepartureCity`, `flight`.`ArrivalAirport` AS `ArrivalAirport`, `destination_city`.`Hungarian` AS `ArrivalCity`, `flight`.`DepartureDateTime` AS `DepartureDateTime`, `flight`.`ArrivalDateTime` AS `ArrivalDateTime`, timediff(`flight`.`ArrivalDateTime`,addtime(`flight`.`DepartureDateTime`,subtime(cast(abs(cast(`destination`.`UTCOffset` as time)) as time),cast(abs(cast(`origin`.`UTCOffset` as time)) as time)))) AS `FlightTime`, `flight`.`BasePriceInHUF` AS `BasePriceInHUF`, `flight`.`AircraftID` AS `AircraftID`, `flight`.`IsCancelled` AS `IsCancelled` FROM ((((`flight` join `airport` `origin` on(`flight`.`DepartureAirport` = `origin`.`AirportCode`)) join `airport` `destination` on(`flight`.`ArrivalAirport` = `destination`.`AirportCode`)) join `city` `origin_city` on(`origin`.`CityID` = `origin_city`.`CityID`)) join `city` `destination_city` on(`destination`.`CityID` = `destination_city`.`CityID`)) ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `not_cancelled_reservations`
--
DROP TABLE IF EXISTS `not_cancelled_reservations`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `not_cancelled_reservations`  AS SELECT `reservations_with_prices`.`ReservationID` AS `ReservationID`, `reservations_with_prices`.`PassengerID` AS `PassengerID`, `reservations_with_prices`.`FlightID` AS `FlightID`, `reservations_with_prices`.`RowID` AS `RowID`, `reservations_with_prices`.`ColumnID` AS `ColumnID`, `reservations_with_prices`.`FareClassID` AS `FareClassID`, `reservations_with_prices`.`IsAdult` AS `IsAdult` FROM `reservations_with_prices` WHERE `reservations_with_prices`.`IsCancelled` = 0 ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `number_of_flights_of_users`
--
DROP TABLE IF EXISTS `number_of_flights_of_users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `number_of_flights_of_users`  AS SELECT `useraccount`.`UserID` AS `UserID`, count(distinct `past_reservations`.`FlightID`) AS `NumberOfFlights` FROM (`useraccount` left join (select `not_cancelled_reservations`.`PassengerID` AS `PassengerID`,`not_cancelled_reservations`.`FlightID` AS `FlightID` from (`not_cancelled_reservations` join `flight` on(`not_cancelled_reservations`.`FlightID` = `flight`.`FlightID`)) where `flight`.`DepartureDateTime` < current_timestamp()) `past_reservations` on(`useraccount`.`UserID` = `past_reservations`.`PassengerID`)) GROUP BY `useraccount`.`UserID` ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `num_of_available_seats_on_active_flights_en`
--
DROP TABLE IF EXISTS `num_of_available_seats_on_active_flights_en`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `num_of_available_seats_on_active_flights_en`  AS SELECT `active_flights_en`.`FlightID` AS `FlightID`, `active_flights_en`.`DepartureAirport` AS `DepartureAirport`, `active_flights_en`.`DepartureCity` AS `DepartureCity`, `active_flights_en`.`ArrivalAirport` AS `ArrivalAirport`, `active_flights_en`.`ArrivalCity` AS `ArrivalCity`, cast(`active_flights_en`.`DepartureDateTime` as date) AS `DepartureDate`, cast(`active_flights_en`.`ArrivalDateTime` as date) AS `ArrivalDate`, time_format(cast(`active_flights_en`.`DepartureDateTime` as time),'%H:%i') AS `DepartureTime`, time_format(cast(`active_flights_en`.`ArrivalDateTime` as time),'%H:%i') AS `ArrivalTime`, time_format(cast(`active_flights_en`.`FlightTime` as time),'%H:%i') AS `FlightTime`, `active_flights_en`.`BasePriceInHUF` AS `BasePriceInHUF`, `aircraftmodel`.`AircraftModelID` AS `AircraftModelID`, `aircraftmodel`.`NumberOfSeats`- count(case when `reservation`.`IsCancelled` = 0 then `reservation`.`ReservationID` end) AS `NumOfAvailableSeats` FROM (((`active_flights_en` join `aircraft` on(`active_flights_en`.`AircraftID` = `aircraft`.`AircraftID`)) join `aircraftmodel` on(`aircraft`.`AircraftModelID` = `aircraftmodel`.`AircraftModelID`)) left join `reservation` on(`active_flights_en`.`FlightID` = `reservation`.`FlightID`)) GROUP BY `active_flights_en`.`FlightID` ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `num_of_available_seats_on_active_flights_hun`
--
DROP TABLE IF EXISTS `num_of_available_seats_on_active_flights_hun`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `num_of_available_seats_on_active_flights_hun`  AS SELECT `active_flights_hun`.`FlightID` AS `FlightID`, `active_flights_hun`.`DepartureAirport` AS `DepartureAirport`, `active_flights_hun`.`DepartureCity` AS `DepartureCity`, `active_flights_hun`.`ArrivalAirport` AS `ArrivalAirport`, `active_flights_hun`.`ArrivalCity` AS `ArrivalCity`, cast(`active_flights_hun`.`DepartureDateTime` as date) AS `DepartureDate`, cast(`active_flights_hun`.`ArrivalDateTime` as date) AS `ArrivalDate`, time_format(cast(`active_flights_hun`.`DepartureDateTime` as time),'%H:%i') AS `DepartureTime`, time_format(cast(`active_flights_hun`.`ArrivalDateTime` as time),'%H:%i') AS `ArrivalTime`, time_format(cast(`active_flights_hun`.`FlightTime` as time),'%H:%i') AS `FlightTime`, `active_flights_hun`.`BasePriceInHUF` AS `BasePriceInHUF`, `aircraftmodel`.`AircraftModelID` AS `AircraftModelID`, `aircraftmodel`.`NumberOfSeats`- count(case when `reservation`.`IsCancelled` = 0 then `reservation`.`ReservationID` end) AS `NumOfAvailableSeats` FROM (((`active_flights_hun` join `aircraft` on(`active_flights_hun`.`AircraftID` = `aircraft`.`AircraftID`)) join `aircraftmodel` on(`aircraft`.`AircraftModelID` = `aircraftmodel`.`AircraftModelID`)) left join `reservation` on(`active_flights_hun`.`FlightID` = `reservation`.`FlightID`)) GROUP BY `active_flights_hun`.`FlightID` ;

-- --------------------------------------------------------

--
-- Nézet szerkezete `reservations_with_prices`
--
DROP TABLE IF EXISTS `reservations_with_prices`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `reservations_with_prices`  AS SELECT `reservation`.`ReservationID` AS `ReservationID`, `reservation`.`PassengerID` AS `PassengerID`, `reservation`.`FlightID` AS `FlightID`, `reservation`.`RowID` AS `RowID`, `reservation`.`ColumnID` AS `ColumnID`, `fareclass`.`FareClassID` AS `FareClassID`, `flight`.`BasePriceInHUF`* `fareclass`.`Multiplier` * ((100 - `loyaltystatus`.`DiscountInPercentage`) / 100) AS `PriceInHun`, `reservation`.`IsCancelled` AS `IsCancelled`, `reservation`.`IsAdult` AS `IsAdult` FROM ((((((`reservation` join `flight` on(`reservation`.`FlightID` = `flight`.`FlightID`)) join `aircraft` on(`flight`.`AircraftID` = `aircraft`.`AircraftID`)) join `seat` on(`reservation`.`RowID` = `seat`.`RowID` and `reservation`.`ColumnID` = `seat`.`ColumnID` and `aircraft`.`AircraftModelID` = `seat`.`AircraftModelID`)) join `fareclass` on(`seat`.`FareClassID` = `fareclass`.`FareClassID`)) join `useraccount` on(`reservation`.`PassengerID` = `useraccount`.`UserID`)) join `loyaltystatus` on(`useraccount`.`LoyaltyStatusID` = `loyaltystatus`.`LoyaltyStatusID`)) ;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `aircraft`
--
ALTER TABLE `aircraft`
  ADD PRIMARY KEY (`AircraftID`),
  ADD KEY `AircraftModelID` (`AircraftModelID`);

--
-- A tábla indexei `aircraftmodel`
--
ALTER TABLE `aircraftmodel`
  ADD PRIMARY KEY (`AircraftModelID`),
  ADD UNIQUE KEY `AircraftModelName` (`AircraftModelName`);

--
-- A tábla indexei `airport`
--
ALTER TABLE `airport`
  ADD PRIMARY KEY (`AirportCode`),
  ADD KEY `CityID` (`CityID`),
  ADD KEY `CountryID` (`CountryID`);

--
-- A tábla indexei `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`CityID`);

--
-- A tábla indexei `country`
--
ALTER TABLE `country`
  ADD PRIMARY KEY (`CountryID`);

--
-- A tábla indexei `fareclass`
--
ALTER TABLE `fareclass`
  ADD PRIMARY KEY (`FareClassID`),
  ADD UNIQUE KEY `FareClassName` (`FareClassName`);

--
-- A tábla indexei `flight`
--
ALTER TABLE `flight`
  ADD PRIMARY KEY (`FlightID`),
  ADD KEY `AircraftID` (`AircraftID`),
  ADD KEY `DepartureAirport` (`DepartureAirport`),
  ADD KEY `ArrivalAirport` (`ArrivalAirport`);

--
-- A tábla indexei `loyaltystatus`
--
ALTER TABLE `loyaltystatus`
  ADD PRIMARY KEY (`LoyaltyStatusID`),
  ADD UNIQUE KEY `LoyaltyStatusName` (`LoyaltyStatusName`);

--
-- A tábla indexei `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`ReservationID`),
  ADD KEY `FlightID` (`FlightID`),
  ADD KEY `PassengerID` (`PassengerID`);

--
-- A tábla indexei `seat`
--
ALTER TABLE `seat`
  ADD PRIMARY KEY (`RowID`,`ColumnID`,`AircraftModelID`),
  ADD KEY `FareClassID` (`FareClassID`),
  ADD KEY `AircraftModelID` (`AircraftModelID`);

--
-- A tábla indexei `useraccount`
--
ALTER TABLE `useraccount`
  ADD PRIMARY KEY (`UserID`),
  ADD KEY `LoyaltyStatusID` (`LoyaltyStatusID`);

--
-- A tábla indexei `usermessage`
--
ALTER TABLE `usermessage`
  ADD PRIMARY KEY (`MessageID`),
  ADD KEY `UserID` (`UserID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `aircraft`
--
ALTER TABLE `aircraft`
  MODIFY `AircraftID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `aircraftmodel`
--
ALTER TABLE `aircraftmodel`
  MODIFY `AircraftModelID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `city`
--
ALTER TABLE `city`
  MODIFY `CityID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT a táblához `country`
--
ALTER TABLE `country`
  MODIFY `CountryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT a táblához `fareclass`
--
ALTER TABLE `fareclass`
  MODIFY `FareClassID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `flight`
--
ALTER TABLE `flight`
  MODIFY `FlightID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT a táblához `loyaltystatus`
--
ALTER TABLE `loyaltystatus`
  MODIFY `LoyaltyStatusID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `reservation`
--
ALTER TABLE `reservation`
  MODIFY `ReservationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `useraccount`
--
ALTER TABLE `useraccount`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `usermessage`
--
ALTER TABLE `usermessage`
  MODIFY `MessageID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `aircraft`
--
ALTER TABLE `aircraft`
  ADD CONSTRAINT `aircraft_ibfk_1` FOREIGN KEY (`AircraftModelID`) REFERENCES `aircraftmodel` (`AircraftModelID`);

--
-- Megkötések a táblához `airport`
--
ALTER TABLE `airport`
  ADD CONSTRAINT `airport_ibfk_1` FOREIGN KEY (`CityID`) REFERENCES `city` (`CityID`),
  ADD CONSTRAINT `airport_ibfk_2` FOREIGN KEY (`CountryID`) REFERENCES `country` (`CountryID`);

--
-- Megkötések a táblához `flight`
--
ALTER TABLE `flight`
  ADD CONSTRAINT `flight_ibfk_1` FOREIGN KEY (`AircraftID`) REFERENCES `aircraft` (`AircraftID`),
  ADD CONSTRAINT `flight_ibfk_2` FOREIGN KEY (`DepartureAirport`) REFERENCES `airport` (`AirportCode`),
  ADD CONSTRAINT `flight_ibfk_3` FOREIGN KEY (`ArrivalAirport`) REFERENCES `airport` (`AirportCode`);

--
-- Megkötések a táblához `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`FlightID`) REFERENCES `flight` (`FlightID`),
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`PassengerID`) REFERENCES `useraccount` (`UserID`);

--
-- Megkötések a táblához `seat`
--
ALTER TABLE `seat`
  ADD CONSTRAINT `seat_ibfk_1` FOREIGN KEY (`FareClassID`) REFERENCES `fareclass` (`FareClassID`),
  ADD CONSTRAINT `seat_ibfk_2` FOREIGN KEY (`AircraftModelID`) REFERENCES `aircraftmodel` (`AircraftModelID`);

--
-- Megkötések a táblához `useraccount`
--
ALTER TABLE `useraccount`
  ADD CONSTRAINT `useraccount_ibfk_1` FOREIGN KEY (`LoyaltyStatusID`) REFERENCES `loyaltystatus` (`LoyaltyStatusID`);

--
-- Megkötések a táblához `usermessage`
--
ALTER TABLE `usermessage`
  ADD CONSTRAINT `usermessage_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `useraccount` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
