const express = require('express');
const router = express.Router();
const db = require('./database');

router.post('/', (req, res) => {
    const { usuario, contraseña } = req.body;
    const queryText = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
    db.query(queryText, [usuario, contraseña], (err, results) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).send('Error en el servidor');
        } else if (results.length > 0) {
            res.redirect('/home.html');
        } else {
            res.send('Usuario o contraseña incorrectos');
        }
    });
});

module.exports = router;
