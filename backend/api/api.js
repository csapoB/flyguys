const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcryptjs'); //?npm install bcrypt

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const session = require('express-session');
const { default: i18next } = require('i18next');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });




//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/airports', async (request, response) => {
    try {
        const airports = await database.selectAllAirportsInHungarian();
        response.status(200).json({
            results: airports
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});
router.get('/LoginCheck', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                allapot: false
            })
        }
        else {
            response.status(200).json({
                allapot: true,
                admin: request.session.user.role == 1
            })
        }
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.get('/AdminCheck', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                admin: false
            })
        }
        else {
            response.status(200).json({
                admin: request.session.user.role == 1
            })
        }
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});


router.get('/availableflights', async (request, response) => {
    try {
        const result = await database.selectAvailableFlightsBasedOnParameters(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));


        response.status(200).json({
            result: result
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availabledepartureairportsfiltered', async (request, response) => {
    try {
        let result;
        if (request.get("Accept-Language") == "hu") {
            result = await database.selectAvailableDepartureAirportsFilteredHun(((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));
        } else {
            result = await database.selectAvailableDepartureAirportsFilteredEn(((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));
        }



        response.status(200).json({
            results: result
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availablearrivalairportsfiltered', async (request, response) => {
    try {
        let result;
        if (request.get("Accept-Language") == "hu") {
            result = await database.selectAvailableArrivalAirportsFilteredHun(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));
        } else {
            result = await database.selectAvailableArrivalAirportsFilteredEn(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));
        }

        response.status(200).json({
            results: result
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/flight', async (request, response) => {
    try {
        let result;
        if (request.get("Accept-Language") == "hu") {
            result = await database.selectAvailableFlightByIdHun(request.query.flight_id);
        } else {
            result = await database.selectAvailableFlightByIdEn(request.query.flight_id);
        }

        response.status(200).json({
            result: result[0]
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availabledeparturedatesfiltered', async (request, response) => {
    try {

        const result = await database.selectAvailableDepartureDatesFiltered(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport));

        let departuredates = [];
        for (let i = 0; i < result.length; i++) {
            departuredates.push(result[i].DepartureDate);
        }

        response.status(200).json({
            departuredates: departuredates
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availablearrivaldatesfiltered', async (request, response) => {
    try {

        const result = await database.selectAvailableArrivalDatesFiltered(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate);

        let arrivaldates = [];
        for (let i = 0; i < result.length; i++) {
            arrivaldates.push(result[i].ArrivalDate);
        }

        response.status(200).json({
            arrivaldates: arrivaldates
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availablereturndates', async (request, response) => {
    try {

        const result = await database.selectAvailableReturnDates(request.query.departureAirport, request.query.arrivalAirport, request.query.destinationArrivalDate);

        let returndates = [];

        for (let i = 0; i < result.length; i++) {
            returndates.push(result[i].ReturnDate);
        }

        response.status(200).json({
            returndates: returndates
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/swappableairportswithsamedeparturedates', async (request, response) => {
    try {

        const result = await database.selectSwappableFlightsWithSameDepartureDates(request.query.departureAirport, request.query.arrivalAirport, ((request.query.departureDate == undefined) ? "" : request.query.departureDate));

        let airports = [];
        for (let i = 0; i < result.length; i++) {
            airports.push(result[i].DepartureAirport)

        }

        response.status(200).json({
            airports: airports
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/swappableairports', async (request, response) => {
    try {

        const result = await database.selectSwappableFlights(request.query.departureAirport, request.query.arrivalAirport);

        let airports = [];
        for (let i = 0; i < result.length; i++) {
            airports.push(result[i].DepartureAirport)

        }

        response.status(200).json({
            airports: airports
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/hu/flights', async (request, response) => {
    try {

        if (request.query.departureAirport == undefined || request.query.arrivalAirport == undefined || request.query.departureDate == undefined || request.query.numOfAdults == undefined || request.query.numOfChildren == undefined) {
            response.status(400).json({
                error: "A HTTP-GET lekérdezés nem megfelelő!"
            });
        } else {

            let data;
            if (LoggedInCheck(request)) {
                data = await database.selectAvailableFlightsFilteredHun(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate,parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), request.session.user.id);
            } else {
                data = await database.selectAvailableFlightsFilteredHun(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate,parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), "NULL");
            }

            response.status(200).json({
                flights: data
            });

        }
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/en/flights', async (request, response) => {
    try {

        if (request.query.departureAirport == undefined || request.query.arrivalAirport == undefined || request.query.departureDate == undefined || request.query.numOfAdults == undefined || request.query.numOfChildren == undefined) {
            response.status(400).json({
                error: "The HTTP-GET request isn't proper!"
            });
        } else {


            let data;
            let current_eur_exch_rate;

            try {
                current_eur_exch_rate = (await (await fetch("https://api.frankfurter.dev/v1/latest?base=HUF&symbols=EUR", { method: "GET" })).json()).rates.EUR;
            } catch {
                current_eur_exch_rate = 0.00259;
            }
            if (LoggedInCheck(request)) {
                data = await database.selectAvailableFlightsFilteredEn(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate, parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), request.session.user.id);
            } else {
                data = await database.selectAvailableFlightsFilteredEn(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate, parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), "NULL");
            }


            data.map(x => x.PriceInHUF = Math.round(x.PriceInHUF * current_eur_exch_rate));

            response.status(200).json({
                flights: data
            });
        }
    } catch {
        response.status(500).json({
            error: request.t("server_error")
        });
    }
});

router.get('/cheapestflights', async (request, response) => {
    try {
        let one_way;
        if (request.get("Accept-Language") == "hu") {
            if (LoggedInCheck(request)) {

                one_way = await database.selectTop4CheapestOneWayFlightsHun(request.session.user.id);
            } else {
                one_way = await database.selectTop4CheapestOneWayFlightsHun("NULL");
            }

            //return_ = await database.selectCheapestReturnFlightsHun();
        } else {
            let current_eur_exch_rate;

            try {
                current_eur_exch_rate = (await (await fetch("https://api.frankfurter.dev/v1/latest?base=HUF&symbols=EUR", { method: "GET" })).json()).rates.EUR;
            } catch {
                current_eur_exch_rate = 0.00259;
            }

            if (LoggedInCheck(request)) {
                one_way = await database.selectTop4CheapestOneWayFlightsEn(request.session.user.id);
            } else {
                one_way = await database.selectTop4CheapestOneWayFlightsEn("NULL");
            }
            //return_ = await database.selectCheapestReturnFlightsEn()
            one_way.map(x => x.PriceInHUF = Math.round(x.PriceInHUF * current_eur_exch_rate));
            //return_.map(x => x.PriceInHUF = `${Math.round(x.PriceInHUF * current_eur_exch_rate)}`);

        }

        response.status(200).json({
            results: { "one_way": one_way }
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/reservations', async (request, response) => {
    try {

        if (request.session && request.session.user && request.session.user.id) {
            const active_reservations = await database.selectActiveReservationsByUserId(request.session.user.id);
            const previous_reservations = await database.selectPreviousReservationsByUserId(request.session.user.id)
            response.status(200).json({
                reservations: { active_reservations, previous_reservations }
            });
        } else {

            response.status(220).json({
                message: request.t("login_needed")
            });
        }


    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/geterrors', (request, response) => {
    try {

        response.status(200).json({
            errors: request.t("errors", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getindex', (request, response) => {
    try {

        response.status(200).json({
            index: request.t("index", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getflights', (request, response) => {
    try {

        response.status(200).json({
            flights: request.t("flights", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getnavbar', (request, response) => {
    try {

        response.status(200).json({
            navbar: request.t("navbar", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getplanner', (request, response) => {
    try {

        response.status(200).json({
            planner: request.t("planner", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getplannerpassengerspopover', (request, response) => {
    try {

        response.status(200).json({
            planner_passengers_popover: request.t("planner_passengers_popover", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getfooter', (request, response) => {
    try {

        response.status(200).json({
            footer: request.t("footer", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getlocale', (request, response) => {
    try {

        response.status(200).json({
            locale: request.t("locale", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getmodal', (request, response) => {
    try {

        response.status(200).json({
            modal: request.t("modal", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getmap', (request, response) => {
    try {

        response.status(200).json({
            map: request.t("map", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getaboutus', (request, response) => {
    try {

        response.status(200).json({
            about_us: request.t("about_us", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getseatchooser', (request, response) => {
    try {

        response.status(200).json({
            seat_chooser: request.t("seat_chooser", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getprofile', (request, response) => {
    try {

        response.status(200).json({
            profile: request.t("profile", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getloyaltyprogram', (request, response) => {
    try {

        response.status(200).json({
            loyalty_program: request.t("loyalty_program", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/getcommonmessages', (request, response) => {
    try {

        response.status(200).json({
            common_messages: request.t("common_messages", { returnObjects: true })
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/checklogin', (request, response) => {
    try {
        response.status(200).json({
            logged_in: LoggedInCheck(request)
        });
    } catch {
        response.status(500).json({
            message: "SERVER ERROR"
        });
    }
});

router.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body
        if (email && password) {
            const login = await database.Login(email);
            if (!login) {
                return response.status(400).json({
                    message: request.t("wrong_email_or_password")
                });
            }
            else {
                if (await bcrypt.compare(password, login.UserPassword)) {
                    request.session.user = {
                        id: login.UserID,
                        role: login.AdminStatus,
                        timestamp: Date.now()
                    }
                    console.log(request.session.user)
                    if (request.session.user.role === 1) {
                        response.status(201).json({
                            message: request.t("login_successful"),
                            admin: true
                        });
                    }
                    response.status(201).json({
                        message: request.t("login_successful"),
                        admin: false
                    });
                }
                else {
                    response.status(400).json({
                        message: request.t("wrong_email_or_password")
                    });
                }
            }
        }
        else {
            response.status(400).json({
                message: request.t("missing_data_by_user")
            });
        }
    } catch (error) {
        response.status(500).json({
            message: request.t("end_point_not_working")
        });
    }
});

router.post('/register', async (request, response) => {
    try {
        const { nev, email, jelszo, szuldatum } = request.body
        if (!nev || !email || !jelszo || !szuldatum) {
            return response.status(400).json({
                message: request.t("missing_data_by_user")
            });
        }
        else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
            const register = await database.Register(nev, email, hashedPassword, szuldatum);
            if (!register) {
                return response.status(400).json({
                    message: request.t("registration_unsuccessful")
                });
            }
            else {
                response.status(200).json({
                    message: request.t("registration_successful"),
                });
            }
        }
    } catch (error) {
        response.status(500).json({
            message: request.t("end_point_not_working")
        });
    }
});


router.post('/logout', async (request, response) => {
    try {
        if (!request.session) {
            return response.status(200).json({
                message: request.t("no_active_session")
            });
        }
        request.session.destroy(err => {
            if (err) {
                console.error('Session destroy error:', err);
                return response.status(500).json({ message: request.t("logout_unsuccessful") })
            }
            response.clearCookie('connect.sid');
            return response.status(200).json({
                message: request.t("logout_successful")
            })
        })
    } catch (error) {
        console.error('Logout error:', error);
        return response.status(500).json({ message: request.t("end_point_not_working") });
    }
});

router.get('/husegprogram', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                message: "Nem vagy bejelentkezve!"
            })
        }
        else {
            const user = await database.Husegprogram(request.session.user.id);
            response.status(200).json({
                message: "Siker",
                result: user
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.get('/profil', async (request, response) => {
    try {
        const user = await database.Profil(request.session.user.id);
        response.status(200).json({
            message: "Siker",
            result: user
        })

    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.post('/verifypassword', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                message: request.t("login_needed")
            });
        }

        const { password } = request.body;
        if (!password) {
            return response.status(400).json({
                message: request.t("missing_data_by_user")
            });
        }

        const user = await database.getUserById(request.session.user.id);
        
        if (!user) {
            return response.status(400).json({
                message: request.t("user_not_found")
            });
        }

        if (await bcrypt.compare(password, user[0].UserPassword)) {
            response.status(200).json({
                message: request.t("password_correct"),
                verified: true
            });
        } else {
            response.status(400).json({
                message: request.t("wrong_password"),
                verified: false
            });
        }
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: request.t("end_point_not_working")
        });
    }
});

router.post('/updateprofile', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                message: request.t("not_logged_in")
            });
        }

        const { userName, email, password } = request.body;
        
        if (!userName || !email || !password) {
            return response.status(400).json({
                message: request.t("missing_data_by_user")
            });
        }

        const user = await database.getUserById(request.session.user.id);
        
        if (!user) {
            return response.status(400).json({
                message: request.t("user_not_found")
            });
        }

        // Verify password first
        if (!(await bcrypt.compare(password, user[0].UserPassword))) {
            return response.status(400).json({
                message: request.t("wrong_password")
            });
        }

        // Update profile
        await database.updateUserProfile(request.session.user.id, userName, email);
        
        response.status(200).json({
            message: request.t("profile_updated_successfully")
        });

    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: request.t("end_point_not_working")
        });
    }
});


function LoggedInCheck(request) {
    let vissza = false;
    if (request.session && request.session.user && request.session.user.id && request.session.user.role !== undefined && request.session.user.timestamp) {
        if (Date.now() - request.session.user.timestamp > 600000) {
            request.session.destroy();
        }
        else {
            request.session.user.timestamp = Date.now();
            vissza = true;
        }
    }
    return vissza;
}


router.get('/helyfoglalas', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(220).json({
                message: "Nem vagy bejelentkezve!"
            });
        }
        else {
            let id = request.query.id;
            if (!id) {
                throw new Error("Nincs járat id")
            }
            const helyek = await database.selectAvailableSeatsOnFlight(id, request.session.user.id);

            if (request.get("Accept-Language") == "en") {
                let current_eur_exch_rate;

                try {
                    current_eur_exch_rate = (await (await fetch("https://api.frankfurter.dev/v1/latest?base=HUF&symbols=EUR", { method: "GET" })).json()).rates.EUR;
                } catch {
                    current_eur_exch_rate = 0.00259;
                }

                helyek.map(x => x.PriceInHUF = Math.round(x.PriceInHUF * current_eur_exch_rate))
            }
            response.status(200).json({
                helyek: helyek
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: error.message
        });
    }
});

router.post('/helyfoglalas', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(220).json({
                message: "Nem vagy bejelentkezve!"
            });
        }
        else {
            const { flightID, rowID, columnID, isAdult } = request.body;
            const parsedIsAdult = Number(isAdult);
            if (!Number.isInteger(parsedIsAdult) || (parsedIsAdult !== 0 && parsedIsAdult !== 1)) {
                throw new Error("Hibás az isAdult")
            }

            if (!flightID || !rowID || !columnID) {
                throw new Error(request.t("missing_data"))
            }
            const siker = await database.SeatReservation(request.session.user.id, flightID, rowID, columnID, parsedIsAdult);
            if (!siker) {
                throw new Error("Ez a hely már foglalva van")
            }
            response.status(200).json({
                siker: siker
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).json({
            message: error.message
        });
    }
});



module.exports = router;
