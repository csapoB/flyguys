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
const { error } = require('console');

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
router.get('/airports', async (request, response) => {
    try {
        const airports = await database.selectAllAirportsInHungarian();
        response.status(200).json({
            results: airports
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});
router.get('/LoginCheck', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminCheck', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                admin: false
            })
        }
        else {
            response.status(200).json({
                admin: request.session.user.role == 1
            })
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/flightsofuser', async (request, response) => {
    try {

        if (LoggedInCheck(request)) {
            let active_flights;
            let previous_flights;
            if (request.get("Accept-Language") == "hu") {
                active_flights = await database.selectActiveFlightsByUserIdHun(request.session.user.id);
                previous_flights = await database.selectPreviousFlightsByUserIdHun(request.session.user.id);
            } else {
                active_flights = await database.selectActiveFlightsByUserIdEn(request.session.user.id);
                previous_flights = await database.selectPreviousFlightsByUserIdEn(request.session.user.id);
            }
            response.status(200).json({
                flights: { active_flights, previous_flights }
            });
        } else {

            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
                await database.updateLoyaltyStatus(request.session.user.id);
                data = await database.selectAvailableFlightsFilteredHun(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate, parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), request.session.user.id);
            } else {
                data = await database.selectAvailableFlightsFilteredHun(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate, parseInt(request.query.numOfAdults) + parseInt(request.query.numOfChildren), "NULL");
            }

            response.status(200).json({
                flights: data
            });

        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
                await database.updateLoyaltyStatus(request.session.user.id);
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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
                await database.updateLoyaltyStatus(request.session.user.id);
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/activereservations', async (request, response) => {
    try {

        if (LoggedInCheck(request)) {

            if (request.query.flight_id == undefined) {

                response.status(400).json({
                    message: request.t("errors.missing_url_parameter", { returnObjects: true })
                });
            } else {
                const active_reservations = await database.selectActiveReservationsByUserIdAndFlightId(request.session.user.id, request.query.flight_id);

                response.status(200).json({
                    reservations: active_reservations
                });
            }


        } else {

            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        }


    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/previousreservations', async (request, response) => {
    try {

        if (LoggedInCheck(request)) {
            if (request.query.flight_id == undefined) {

                response.status(400).json({
                    message: request.t("errors.missing_url_parameter", { returnObjects: true })
                });
            } else {
                const previous_reservations = await database.selectPreviousReservationsByUserIdAndFlightId(request.session.user.id, request.query.flight_id);

                response.status(200).json({
                    reservations: previous_reservations
                });
            }


        } else {

            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        }


    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/geterrors', (request, response) => {
    try {

        response.status(200).json({
            errors: request.t("errors", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getindex', (request, response) => {
    try {

        response.status(200).json({
            index: request.t("index", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getflights', (request, response) => {
    try {

        response.status(200).json({
            flights: request.t("flights", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getnavbar', (request, response) => {
    try {

        response.status(200).json({
            navbar: request.t("navbar", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getplanner', (request, response) => {
    try {

        response.status(200).json({
            planner: request.t("planner", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getplannerpassengerspopover', (request, response) => {
    try {

        response.status(200).json({
            planner_passengers_popover: request.t("planner_passengers_popover", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getfooter', (request, response) => {
    try {

        response.status(200).json({
            footer: request.t("footer", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getlocale', (request, response) => {
    try {

        response.status(200).json({
            locale: request.t("locale", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getmodal', (request, response) => {
    try {

        response.status(200).json({
            modal: request.t("modal", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getmap', (request, response) => {
    try {

        response.status(200).json({
            map: request.t("map", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getaboutus', (request, response) => {
    try {

        response.status(200).json({
            about_us: request.t("about_us", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getseatchooser', (request, response) => {
    try {

        response.status(200).json({
            seat_chooser: request.t("seat_chooser", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getprofile', (request, response) => {
    try {

        response.status(200).json({
            profile: request.t("profile", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getloyaltyprogram', (request, response) => {
    try {

        response.status(200).json({
            loyalty_program: request.t("loyalty_program", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/getadmin', (request, response) => {
    try {

        response.status(200).json({
            admin: request.t("admin", { returnObjects: true })
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/checklogin', (request, response) => {
    try {
        response.status(200).json({
            logged_in: LoggedInCheck(request)
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body
        if (email && password) {
            const login = await database.Login(email, password);
            if (!login) {
                response.status(400).json({
                    error: request.t("modal.error.wrong_email_or_password", { returnObjects: true })
                });
            }
            else {
                request.session.user = {
                    id: login.UserID,
                    role: login.AdminStatus,
                    timestamp: Date.now()
                };
                response.status(201).json({
                    message: request.t("modal.success.login_successful", { returnObjects: true }),
                    admin: login.AdminStatus === 1
                });
            }
        }
        else {
            response.status(400).json({
                error: request.t("modal.error.wrong_email_or_password", { returnObjects: true })
            });
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/register', async (request, response) => {
    try {
        const { nev, email, jelszo, szuldatum } = request.body
        if (!nev || !email || !jelszo || !szuldatum) {
            return response.status(400).json({
                error: request.t("errors.missing_data", { returnObjects: true })
            });
        }
        else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
            const register = await database.Register(nev, email, hashedPassword, szuldatum);
            if (!register) {
                return response.status(400).json({
                    error: request.t("modal.error.registration_unsuccessful", { returnObjects: true })
                });
            }
            else {
                response.status(200).json({
                    message: request.t("modal.success.registration_successful", { returnObjects: true }),
                });
            }
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});


router.post('/logout', async (request, response) => {
    try {
        if (!request.session) {
            response.status(400).json({
                message: request.t("errors.no_active_session", { returnObjects: true })
            });
        } else {
            request.session.destroy(err => {
                if (err) {
                    console.error('Session destroy error:', err);
                    response.status(500).json({ error: request.t("modal.error.logout_unsuccessful", { returnObjects: true }) })
                } else {
                    response.clearCookie('connect.sid');
                    response.status(200).json({
                        message: request.t("modal.success.logout_successful", { returnObjects: true })
                    });
                }

            })
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/husegprogram', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            })
        }
        else {
            await database.updateLoyaltyStatus(request.session.user.id);
            const user = await database.Husegprogram(request.session.user.id);
            response.status(200).json({
                result: user
            })
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/profil', async (request, response) => {
    try {
        if (LoggedInCheck(request)) {
            await database.updateLoyaltyStatus(request.session.user.id);
            const user = await database.Profil(request.session.user.id);
            response.status(200).json({
                result: user
            });
        } else {
            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/verifypassword', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        } else {

            const { password } = request.body;

            const user = await database.getUserById(request.session.user.id);

            if (!user) {
                response.status(400).json({
                    message: request.t("profile.error.user_not_found", { returnObjects: true })
                });
            } else {

                if (!(await bcrypt.compare(password, user[0].UserPassword)) || !password) {
                    response.status(400).json({
                        error: request.t("modal.error.wrong_password", { returnObjects: true }),
                        verified: false
                    });

                } else {

                    response.status(200).json({
                        message: request.t("modal.success.password_verified", { returnObjects: true }),
                        verified: true
                    });
                }
            }
        }

    } catch (error) {
        console.log(error);
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.put('/updateprofile', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        } else {
            const { nev, email, jelszo, szuldatum } = request.body;

            if (!nev || !email || !jelszo || !szuldatum) {
                response.status(400).json({
                    error: request.t("errors.missing_data", { returnObjects: true })
                });
            } else {
                const user = await database.getUserById(request.session.user.id);

                if (!user) {
                    response.status(400).json({
                        error: request.t("profile.error.user_not_found", { returnObjects: true })
                    });
                } else {
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
                    await database.updateUserProfile(request.session.user.id, nev, email, hashedPassword, szuldatum);

                    response.status(200).json({
                        message: request.t("modal.success.profile_updated_successfully", { returnObjects: true })
                    });
                }
            }
        }

    } catch (error) {
        console.log(error);
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.put('/deleteprofile', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_delete", { returnObjects: true })
            });
        } else {

            const user = await database.getUserById(request.session.user.id);

            if (!user) {
                response.status(400).json({
                    error: request.t("profile.error.user_not_found", { returnObjects: true })
                });
            } else {
                await database.deleteUserProfile(request.session.user.id);
                await database.cancelAllReservationsOfUser(request.session.user.id);
                request.session.destroy(err => {
                    if (err) {
                        console.error('Session destroy error:', err);
                        response.status(500).json({ error: request.t("modal.error.logout_unsuccessful", { returnObjects: true }) })
                    } else {
                        response.clearCookie('connect.sid');
                        response.status(200).json({
                            message: request.t("modal.success.profile_deleted_successfully", { returnObjects: true })
                        });
                    }

                })
            }


        }

    } catch (error) {
        console.log(error);
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.put('/cancelreservations', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        } else {

            let { reservations } = request.body;

            if (reservations == undefined) {
                response.status(400).json({
                    error: request.t("errors.missing_data", { returnObjects: true })
                });
            } else {

                if (await database.cancelReservationCheckForRemainingOnlyChildren(reservations, request.session.user.id)) {
                    response.status(400).json({
                        error: request.t("modal.error.cancel_bookings_no_adults", { returnObjects: true })
                    });
                } else {
                    await database.cancelReservations(reservations, request.session.user.id);
                    response.status(200).json({
                        message: request.t("modal.success.bookings_have_been_cancelled_successfully", { returnObjects: true })
                    });
                }

            }
        }

    } catch (error) {
        console.log(error);
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
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

function EnsureAdminSession(request) {
    let vissza = true;
    if (!LoggedInCheck(request) || request.session.user.role != 1) {
        vissza = false;
    }
    return vissza;
}

function ToSqlDateTime(dateObject) {
    const pad = (value) => `${value}`.padStart(2, '0');
    return `${dateObject.getFullYear()}-${pad(dateObject.getMonth() + 1)}-${pad(dateObject.getDate())} ${pad(dateObject.getHours())}:${pad(dateObject.getMinutes())}:${pad(dateObject.getSeconds())}`;
}


router.get('/helyfoglalas', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        }
        else {
            let id = request.query.id;
            if (!id) {
                throw new Error("Nincs járat id")
            }
            await database.updateLoyaltyStatus(request.session.user.id);
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
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/helyfoglalas', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            response.status(401).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        }
        else {
            const { flightID, rowID, columnID, isAdult } = request.body;
            const parsedIsAdult = Number(isAdult);
            if (!Number.isInteger(parsedIsAdult) || (parsedIsAdult !== 0 && parsedIsAdult !== 1)) {
                response.status(400).json({
                    error: request.t("seat_chooser.error.no_adults", { returnObjects: true })
                });
            }

            if (!flightID || !rowID || !columnID) {
                response.status(400).json({
                    error: request.t("errors.missing_data", { returnObjects: true })
                });

            } else {
                const siker = await database.SeatReservation(request.session.user.id, flightID, rowID, columnID, parsedIsAdult);
                if (!siker) {
                    response.status(400).json({
                        error: request.t("seat_chooser.error.already_booked_seat", { returnObjects: true })
                    });
                } else {
                    response.status(200).json({
                        siker: siker
                    });
                }
            }


        }
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetUsers', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const adatvissza = await database.AdminGetUsers();
            response.status(200).json({
                adat: adatvissza
            });
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminSearchUsers', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });

        } else {

            if (typeof request.query.email !== 'string') {
                response.status(400).json({
                    error: request.t("admin.error.wrong_email", { returnObjects: true })
                });
            } else {
                const email = request.query.email.trim();
                const adatvissza = await database.AdminSearchUsers(email);
                response.status(200).json({
                    adat: adatvissza
                });
            }
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetUserReservations', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const rawUserID = request.query.userID ?? request.query.userId;
            const userID = Number.parseInt(rawUserID, 10);
            if (!Number.isInteger(userID) || userID <= 0) {
                response.status(400).json({
                    error: request.t("admin.error.wrong_userid", { returnObjects: true })
                });
            } else {
                const adatvissza = await database.AdminGetUserReservations(userID);
                response.status(200).json({
                    adat: adatvissza
                });
            }
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetUserFlights', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const rawUserID = request.query.userID ?? request.query.userId;
            const userID = Number.parseInt(rawUserID, 10);
            if (!Number.isInteger(userID) || userID <= 0) {
                response.status(400).json({
                    error: request.t("admin.error.wrong_userid", { returnObjects: true })
                });
            } else {
                const adatvissza = await database.AdminGetUserFlights(userID);
                response.status(200).json({
                    adat: adatvissza
                });
            }
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetUserFlightSeats', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const rawUserID = request.query.userID ?? request.query.userId;
            const userID = Number.parseInt(rawUserID, 10);

            if (!Number.isInteger(userID) || userID <= 0) {
                response.status(400).json({
                    error: request.t("admin.error.wrong_userid", { returnObjects: true })
                });
            } else {
                const rawFlightID = request.query.flightID ?? request.query.flightId;
                const flightID = Number.parseInt(rawFlightID, 10);

                if (!Number.isInteger(flightID) || flightID <= 0) {
                    response.status(400).json({
                        error: request.t("admin.error.wrong_flightid", { returnObjects: true })
                    });
                } else {
                    const adatvissza = await database.AdminGetUserFlightSeats(userID, flightID);
                    response.status(200).json({
                        adat: adatvissza
                    });
                }
            }
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetFlights', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const adatvissza = await database.AdminGetFlights();
            response.status(200).json({
                adat: adatvissza
            });
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/AdminCancelFlight', async (request, response) => {
    try {
        if (!EnsureAdminSession(request)) {
            response.status(400).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        } else {
            const rawFlightID = request.body.flightID ?? request.body.flightId;
            const flightID = Number.parseInt(rawFlightID, 10);

            if (!Number.isInteger(flightID) || flightID <= 0) {
                response.status(400).json({
                    error: request.t("admin.error.wrong_flightid", { returnObjects: true })
                });
            } else {
                const existingFlight = await database.AdminGetFlightById(flightID);
                if (!existingFlight) {
                    response.status(400).json({
                        error: request.t("admin.error.flight_not_exist", { returnObjects: true })
                    });
                } else {
                    let message = request.t("admin.success.flight_cancelled_successfully", { returnObjects: true });
                    if (existingFlight.IsCancelled === 1 || existingFlight.IsCancelled === true) {
                        message = request.t("admin.success.flight_was_already_cancelled", { returnObjects: true });
                    }
                    else {
                        await database.AdminCancelFlight(flightID);
                    }
                    response.status(200).json({
                        message
                    });
                }
            }
        }

    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.get('/AdminGetFlightCreateContext', async (request, response) => {
    try {
        if (!EnsureAdminSession(request, response)) {
            response.status(400).json({
                error: request.t("errors.login_needed_get", { returnObjects: true })
            });
        } else {
            const adatvissza = await database.AdminGetFlightCreateContext();
            response.status(200).json({
                adat: adatvissza
            });
        }


    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

router.post('/AdminCreateFlight', async (request, response) => {
    try {
        if (!EnsureAdminSession(request, response)) {
            response.status(400).json({
                error: request.t("errors.login_needed_post", { returnObjects: true })
            });
        }

        const {
            departureAirport,
            arrivalAirport,
            departureDateTime,
            arrivalDateTime,
            aircraftID,
            basePriceInHUF
        } = request.body;

        if (!departureAirport || !arrivalAirport || !departureDateTime || !arrivalDateTime || aircraftID === undefined || basePriceInHUF === undefined) {
            return response.status(400).json({
                message: 'Hiányzó adatok'
            });
        }

        const normalizedDepartureAirport = `${departureAirport}`.trim().toUpperCase();
        const normalizedArrivalAirport = `${arrivalAirport}`.trim().toUpperCase();
        const parsedAircraftID = Number.parseInt(aircraftID, 10);
        const parsedBasePrice = Number.parseInt(basePriceInHUF, 10);

        if (normalizedDepartureAirport.length === 0 || normalizedArrivalAirport.length === 0) {
            return response.status(400).json({
                message: 'Hibás reptér kód'
            });
        }

        if (normalizedDepartureAirport === normalizedArrivalAirport) {
            return response.status(400).json({
                message: 'Az induló és érkező reptér nem lehet ugyanaz'
            });
        }

        if (!Number.isInteger(parsedAircraftID) || parsedAircraftID <= 0) {
            return response.status(400).json({
                message: 'Hibás aircraftID'
            });
        }

        if (!Number.isInteger(parsedBasePrice) || parsedBasePrice <= 0) {
            return response.status(400).json({
                message: 'Hibás alapár'
            });
        }

        const parsedDepartureDate = new Date(departureDateTime);
        const parsedArrivalDate = new Date(arrivalDateTime);

        if (Number.isNaN(parsedDepartureDate.getTime()) || Number.isNaN(parsedArrivalDate.getTime())) {
            return response.status(400).json({
                message: 'Hibás dátum formátum'
            });
        }

        if (parsedArrivalDate <= parsedDepartureDate) {
            return response.status(400).json({
                message: 'Az érkezés időpontja később kell legyen, mint az indulás'
            });
        }

        const latestKnownLeg = await database.AdminGetLatestKnownAircraftLeg(parsedAircraftID);
        if (!latestKnownLeg) {
            return response.status(400).json({
                message: 'Nem létező repülő'
            });
        }

        if (latestKnownLeg.LastArrivalAirport) {
            if (`${latestKnownLeg.LastArrivalAirport}`.toUpperCase() !== normalizedDepartureAirport) {
                return response.status(400).json({
                    message: `A repülő csak innen indulhat: ${latestKnownLeg.LastArrivalAirport}`
                });
            }

            const latestArrivalDate = new Date(latestKnownLeg.LastArrivalDateTime);
            if (!Number.isNaN(latestArrivalDate.getTime()) && parsedDepartureDate <= latestArrivalDate) {
                return response.status(400).json({
                    message: 'Az indulásnak későbbinek kell lennie, mint az utolsó érkezés'
                });
            }
        }

        const sqlDepartureDateTime = ToSqlDateTime(parsedDepartureDate);
        const sqlArrivalDateTime = ToSqlDateTime(parsedArrivalDate);
        const hasOverlap = await database.AdminHasFlightOverlap(parsedAircraftID, sqlDepartureDateTime, sqlArrivalDateTime);

        if (hasOverlap) {
            return response.status(400).json({
                message: 'A repülő időben ütköző járattal mar foglalt'
            });
        }

        const eredmeny = await database.AdminCreateFlight(
            normalizedDepartureAirport,
            normalizedArrivalAirport,
            sqlDepartureDateTime,
            sqlArrivalDateTime,
            parsedAircraftID,
            parsedBasePrice
        );

        response.status(201).json({
            message: 'A járat sikeresen létrehozva',
            flightID: eredmeny.insertId
        });
    } catch (error) {
        console.error(error)
        response.status(500).json({
            error: request.t("errors.server_error", { returnObjects: true })
        });
    }
});

module.exports = router;
