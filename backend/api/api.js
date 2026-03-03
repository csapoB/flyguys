const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const bcrypt = require('bcryptjs'); //?npm install bcrypt

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const session = require('express-session')

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

router.get('/availabledepartureairports', async (request, response) => {
    try {
        const result = await database.selectAvailableDepartureAirports();

        let airportcodes = [];
        for (let i = 0; i < result.length; i++) {
            airportcodes.push(result[i].DepartureAirport);
        }

        response.status(200).json({
            airportcodes: airportcodes
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

router.get('/availablearrivalairports', async (request, response) => {
    try {
        const result = await database.selectAvailableArrivalAirports();

        let airportcodes = [];
        for (let i = 0; i < result.length; i++) {
            airportcodes.push(result[i].ArrivalAirport);
        }

        response.status(200).json({
            airportcodes: airportcodes
        });
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
        const result = await database.selectAvailableDepartureAirportsFilteredHun(((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));


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
        const result = await database.selectAvailableArrivalAirportsFilteredHun(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.departureDate == undefined) ? "" : request.query.departureDate));

        response.status(200).json({
            results: result
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

        const result = await database.selectSwappableFlightsWithSameDepartureDates(((request.query.departureDate == undefined) ? "" : request.query.departureDate));

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

        const result = await database.selectSwappableFlights();

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

router.get('/flights', async (request, response) => {
    try {

        if (request.query.departureAirport == undefined || request.query.arrivalAirport == undefined || request.query.departureDate == undefined || request.query.numOfPassengers == undefined) {
            response.status(400).json({
                error: request.t("errors", {returnObjects : true}).bad_http_get_request
            });
        } else {
            const result = await database.selectAvailableFlightsFiltered(request.query.departureAirport, request.query.arrivalAirport, request.query.departureDate, request.query.numOfPassengers);

            response.status(200).json({
                flights: result
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
            errors: request.t("errors", {returnObjects : true})
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
            flights: request.t("flights", {returnObjects : true})
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
            navbar: request.t("navbar", {returnObjects : true})
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});

/*router.get('/a', (request, response) => {
    try {
        
        

        response.status(200).json({
            message : 
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});*/


router.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body
        if (email && password) {
            const login = await database.Login(email);
            if (!login) {
                return response.status(400).json({
                    message: 'Rossz email vagy jelszó'
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
                            message: 'Sikeres bejelentkezés',
                            admin: true
                        });
                    }
                    response.status(201).json({
                        message: 'Sikeres bejelentkezés',
                        admin: false
                    });
                }
                else {
                    response.status(400).json({
                        message: 'Rossz email vagy jelszó'
                    });
                }
            }
        }
        else {
            response.status(400).json({
                message: 'A felhasználó nem adta meg valamelyik adatot'
            });
        }
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

router.post('/register', async (request, response) => {
    try {
        const { nev, email, jelszo, szuldatum } = request.body
        if (!nev || !email || !jelszo || !szuldatum) {
            return response.status(400).json({
                message: 'A felhasználó nem adta meg valamelyik adatot'
            });
        }
        else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(jelszo, saltRounds);
            const register = await database.Register(nev, email, hashedPassword, szuldatum, 0);
            if (!register) {
                return response.status(400).json({
                    message: 'Sikertelen regisztráció'
                });
            }
            else {
                response.status(200).json({
                    message: 'Sikeres Regisztráció',
                });
            }
        }
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});


router.post('/logout', async (request, response) => {
    try {
        if (!request.session) {
            return response.status(200).json({
                message: 'Nincs aktív session'
            });
        }
        request.session.destroy(err => {
            if (err) {
                console.error('Session destroy hiba:', err);
                return response.status(500).json({ message: 'Sikertelen kijelentkezés' })
            }
            response.clearCookie('connect.sid');
            return response.status(200).json({
                message: 'Sikeres Kijelentkezés'
            })
        })
    } catch (error) {
        console.error('Logout Hiba:', error);
        return response.status(500).json({ message: 'Szerverhiba a kijelentkezés' });
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



module.exports = router;
