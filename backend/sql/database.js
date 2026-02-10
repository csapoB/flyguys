const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'flyguys',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
async function getUserById(id){
    const query = 'SELECT * FROM UserAccount WHERE UserID = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}


//Register
async function Register(userName, userEmail, hashedPassword, userBirthDate, numberOfFlights){
    const query = 'INSERT INTO UserAccount (UserName, UserEmail, UserPassword, UserBirthDate, NumberOfFlights) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [userName, userEmail, hashedPassword, userBirthDate, numberOfFlights]);
    return result.affectedRows>0;
}

//LOGIN
async function Login(email){
    const query = 'SELECT UserID, AdminStatus, UserPassword FROM UserAccount WHERE UserEmail = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
}

//!Export
module.exports = {
    Login,
    getUserById,
    Register
};
