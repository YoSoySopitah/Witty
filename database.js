const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '198.12.235.72' || DB,
    user: 'WittyUser' || User,
    password: 'SergioRamos3' || Password,
    database: 'WittyDB' || WittyDB
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = connection;
