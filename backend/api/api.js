const express = require('express');
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

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
        
        const result = await database.selectAvailableDepartureDateFiltered(((request.query.departureAirport == undefined) ? "" : request.query.departureAirport), ((request.query.arrivalAirport == undefined) ? "" : request.query.arrivalAirport));
        
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

/*router.get('/a', async (request, response) => {
    try {
        

        
        response.status(200).json({
            result: await database.a()
        });
    } catch (error) {
        response.status(500).json({
            message: error
        });
    }
});
*/
module.exports = router;
