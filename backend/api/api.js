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
router.get('/LoginCheck', async (request, response) => {
    try {
        if (!LoggedInCheck(request)) {
            return response.status(220).json({
                allapot: false
            })
        }
        else{
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
                admin:false
            })
        }
        else{
            response.status(200).json({
                admin: request.session.user.role == 1
            })
        }
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
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



function LoggedInCheck(request) {
    let vissza = false;
    if (request.session && request.session.user && request.session.user.id && request.session.user.role !== undefined && request.session.user.timestamp) {
        if (Date.now() - request.session.user.timestamp > 600000) {
            request.session.destroy();
        }
        else{
            request.session.user.timestamp = Date.now();
            vissza = true;
        }
    }
    return vissza;
}



module.exports = router;
