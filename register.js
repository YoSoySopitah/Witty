const express = require('express');
const router = express.Router();
const db = require('./database');

router.post('/', (req, res) => {
    const { rusuario, rcontraseña } = req.body;
    const queryText = 'INSERT INTO usuarios (correo, contraseña) VALUES (?, ?)';
    db.query(queryText, [rusuario, rcontraseña], (err, results) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).send('Error en el servidor');
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
