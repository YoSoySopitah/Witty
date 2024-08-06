const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '89.116.51.221',
    user: 'Witty',
    password: 'sgame360',
    database: 'Witty',
    connectTimeout: 20000
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = connection;


/*const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '198.12.235.72' || DB,
    user: 'WittyUser' || User,
    password: 'SergioRamos3' || Password,
    database: 'Witty' || WittyDB
});*/