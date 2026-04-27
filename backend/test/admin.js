import {
    toBool,
    formatDateTime,
    toLocalDateTimeInputValue,
    addMinutesToInputValue,
    validateCreateFlightForm,
    validateAircraftConstraint,
    getFlightStatus
} from "../../frontend/javascript/toolbox.js";

QUnit.module("admin");

QUnit.test.each("toBool",
  [
    [true, true],
    [1, true],
    ["1", true],
    [false, false],
    [0, false],
    ["0", false],
    ["true", false],
    [null, false],
    [undefined, false],
    ["", false],
    [2, false]
  ], (assert, [value, expected]) => {
    assert.equal(toBool(value), expected);
});

QUnit.test.each("formatDateTime - érvénytelen",
  [
    ["", "hu", ""],
    [null, "hu", ""],
    [undefined, "en", ""],
    ["nem-egy-datum", "hu", "nem-egy-datum"],
    ["I'm a date!", "en", "I'm a date!"]
  ], (assert, [value, language, expected]) => {
    assert.equal(formatDateTime(value, language), expected);
});

QUnit.test("formatDateTime - érvényes dátum hu", assert => {
    const result = formatDateTime("2025-12-25T10:30:00", "hu");
    assert.ok(result.length > 0, "üres helyett formázott string");
    assert.ok(result.includes("2025"), "tartalmazza az évet");
    assert.ok(result.includes("12"), "tartalmazza a hónapot");
    assert.ok(result.includes("25"), "tartalmazza a napot");
});

QUnit.test("formatDateTime - érvényes dátum en", assert => {
    const result = formatDateTime("2025-12-25T10:30:00", "en");
    assert.ok(result.includes("2025"));
    assert.ok(result.includes("25/12") || result.includes("25"), "nap/hónap megjelenik");
});

QUnit.test("formatDateTime - Date objektum input", assert => {
    const d = new Date(2025, 0, 5, 9, 7);
    const result = formatDateTime(d, "hu");
    assert.ok(result.length > 0);
    assert.ok(result.includes("2025"));
});


QUnit.test.each("toLocalDateTimeInputValue",
  [
    [new Date(2025, 0, 5, 9, 7), "2025-01-05T09:07"],
    [new Date(2025, 11, 31, 23, 59), "2025-12-31T23:59"],
    ["invalid-date", ""],
    [undefined, ""]
  ], (assert, [value, expected]) => {
    assert.equal(toLocalDateTimeInputValue(value), expected);
});

QUnit.test.each("addMinutesToInputValue",
  [
    ["2025-01-05T09:00", 30, "2025-01-05T09:30"],
    ["2025-01-05T09:00", 0, "2025-01-05T09:00"],
    ["2025-01-05T09:00", -15, "2025-01-05T08:45"],
    ["2025-01-05T23:50", 20, "2025-01-06T00:10"],
    ["2025-01-31T23:30", 60, "2025-02-01T00:30"],
    ["invalid", 30, ""],
    ["", 10, ""]
  ], (assert, [inputValue, minutes, expected]) => {
    assert.equal(addMinutesToInputValue(inputValue, minutes), expected);
});

const i18n_validate = {
    error: {
        choose_valid_aircraft: "INVALID_AIRCRAFT",
        choose_origin_and_destination_airport: "MISSING_AIRPORTS",
        origin_equals_destination: "AIRPORT_EQUAL",
        choose_valid_dates: "INVALID_DATES",
        new_departure_before_old_departure: "ARRIVAL_BEFORE_DEPARTURE",
        base_price_must_be_positive_integer: "INVALID_PRICE",
        aircraft_must_take_off_here: "TAKEOFF_HERE",
        new_take_off_just_after_previous_take_off: "TOO_EARLY"
    }
};

QUnit.test.each("validateCreateFlightForm",
  [
    [null, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "INVALID_AIRCRAFT"],
    [0, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "INVALID_AIRCRAFT"],
    [1.5, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "INVALID_AIRCRAFT"],
    [1, "", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "MISSING_AIRPORTS"],
    [1, "BUD", "", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "MISSING_AIRPORTS"],
    [1, "BUD", "BUD", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, "AIRPORT_EQUAL"],
    [1, "BUD", "PAR", new Date("invalid"), new Date("2025-12-25T12:00"), 50000, "INVALID_DATES"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("invalid"), 50000, "INVALID_DATES"],
    [1, "BUD", "PAR", new Date("2025-12-25T12:00"), new Date("2025-12-25T10:00"), 50000, "ARRIVAL_BEFORE_DEPARTURE"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T10:00"), 50000, "ARRIVAL_BEFORE_DEPARTURE"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 0, "INVALID_PRICE"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), -100, "INVALID_PRICE"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 1.5, "INVALID_PRICE"],
    [1, "BUD", "PAR", new Date("2025-12-25T10:00"), new Date("2025-12-25T12:00"), 50000, null]
  ], (assert, [aircraftID, dep, arr, depDate, arrDate, price, expected]) => {
    assert.equal(validateCreateFlightForm(aircraftID, dep, arr, depDate, arrDate, price, i18n_validate), expected);
});

QUnit.test("validateAircraftConstraint - null aircraft", assert => {
    assert.equal(validateAircraftConstraint(null, "BUD", new Date("2025-12-25T10:00"), i18n_validate), null);
});

QUnit.test("validateAircraftConstraint - aircraft without LastArrivalAirport", assert => {
    const aircraft = { AircraftID: 1 };
    assert.equal(validateAircraftConstraint(aircraft, "BUD", new Date("2025-12-25T10:00"), i18n_validate), null);
});

QUnit.test("validateAircraftConstraint - mismatched airport", assert => {
    const aircraft = { AircraftID: 1, LastArrivalAirport: "PAR", LastArrivalDateTime: "2025-12-25T08:00:00" };
    const result = validateAircraftConstraint(aircraft, "BUD", new Date("2025-12-25T10:00"), i18n_validate);
    assert.ok(result.startsWith("TAKEOFF_HERE"), "hibakód a stringben");
    assert.ok(result.includes("PAR"), "tartalmazza az elvárt repteret");
});

QUnit.test("validateAircraftConstraint - matching airport, túl korai indulás", assert => {
    const aircraft = { AircraftID: 1, LastArrivalAirport: "BUD", LastArrivalDateTime: "2025-12-25T10:00:00" };
    const tooEarly = new Date("2025-12-25T10:15:00");
    assert.equal(validateAircraftConstraint(aircraft, "BUD", tooEarly, i18n_validate), "TOO_EARLY");
});

QUnit.test("validateAircraftConstraint - matching airport, pont 30 perccel utána", assert => {
    const aircraft = { AircraftID: 1, LastArrivalAirport: "BUD", LastArrivalDateTime: "2025-12-25T10:00:00" };
    const okDate = new Date("2025-12-25T10:30:00");
    assert.equal(validateAircraftConstraint(aircraft, "BUD", okDate, i18n_validate), null);
});

QUnit.test("validateAircraftConstraint - matching airport, kisbetűs input", assert => {
    const aircraft = { AircraftID: 1, LastArrivalAirport: "bud", LastArrivalDateTime: "2025-12-25T10:00:00" };
    const okDate = new Date("2025-12-25T11:00:00");
    assert.equal(validateAircraftConstraint(aircraft, "BUD", okDate, i18n_validate), null);
});

QUnit.test("validateAircraftConstraint - érvénytelen LastArrivalDateTime", assert => {
    const aircraft = { AircraftID: 1, LastArrivalAirport: "BUD", LastArrivalDateTime: "not-a-date" };
    assert.equal(validateAircraftConstraint(aircraft, "BUD", new Date("2025-12-25T10:00"), i18n_validate), null);
});

const i18n_status = {
    tabel: {
        flights: {
            body: {
                status: {
                    mixed: "MIX",
                    flight_deleted: "DEL",
                    cancelled: "CAN",
                    active: "ACT"
                }
            }
        }
    }
};

QUnit.test.each("getFlightStatus",
  [
    [{ FlightIsCancelled: 1, GroupStatus: "aktiv" }, 0, 0, 0, { label: "DEL", className: "status-flight-cancelled" }],
    [{ FlightIsCancelled: true }, 5, 0, 5, { label: "DEL", className: "status-flight-cancelled" }],
    [{ FlightIsCancelled: 0, GroupStatus: "torolt" }, 0, 5, 5, { label: "CAN", className: "status-cancelled" }],
    [{ FlightIsCancelled: 0, GroupStatus: "" }, 0, 3, 3, { label: "CAN", className: "status-cancelled" }],
    [{ FlightIsCancelled: 0, GroupStatus: "aktiv" }, 5, 0, 5, { label: "ACT", className: "status-active" }],
    [{ FlightIsCancelled: 0, GroupStatus: "" }, 5, 0, 5, { label: "ACT", className: "status-active" }],
    [{ FlightIsCancelled: 0, GroupStatus: "" }, 3, 2, 5, { label: "MIX", className: "status-mixed" }],
    [{ FlightIsCancelled: 0, GroupStatus: "" }, 0, 0, 0, { label: "ACT", className: "status-active" }]
  ], (assert, [flight, active, cancelled, total, expected]) => {
    assert.deepEqual(getFlightStatus(flight, active, cancelled, total, i18n_status), expected);
});
