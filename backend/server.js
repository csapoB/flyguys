//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const path = require('path');
const i18next = require('i18next');
const i18next_fs_backend = require('i18next-fs-backend');
const i18next_http_middleware = require('i18next-http-middleware');


//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Session beállítása:
app.use(
    session({
        secret: 'titkos_kulcs', //?Ezt generálni kell a későbbiekben
        resave: false,
        saveUninitialized: true
    })
);

i18next.use(i18next_fs_backend).use(i18next_http_middleware.LanguageDetector).init(
    {
        fallbackLng : 'en',
        backend : {
            loadPath : './locales/{{lng}}/translation.json'
        }

    }
);

app.use(i18next_http_middleware.handle(i18next));

//!Routing
//?Főoldal:
router.get('/', async (request, response) => {
    
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
    
});

router.get('/en', async (request, response) => {
    
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
    
});

router.get('/hu', async (request, response) => {
    
    response.sendFile(path.join(__dirname, '../frontend/html/index.html'));
    
});

//? Map
router.get('/map', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/map.html'));
});

router.get('/en/map', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/map.html'));
});

router.get('/hu/map', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/map.html'));
});

router.get('/magazin', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/magazin.html'));
});

router.get('/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/hu/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/en/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/husegprogram', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/husegprogram.html'));
});

router.get('/hu/husegprogram', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/husegprogram.html'));
});

router.get('/en/husegprogram', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/husegprogram.html'));
});

router.get('/profil', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});

router.get('/en/profil', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});

router.get('/hu/profil', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});

router.get('/hu/admin', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});

router.get('/en/admin', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/admin.html'));
});

router.get('/flights', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/flights.html'));
});

router.get('/en/flights', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/flights.html'));
});

router.get('/hu/flights', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/flights.html'));
});

router.get('/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/en/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/hu/helyfoglalas', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/helyfoglalas.html'));
});

router.get('/rolunk', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/rolunk.html'));
});

router.get('/en/rolunk', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/rolunk.html'));
});

router.get('/hu/rolunk', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/rolunk.html'));
});

//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
