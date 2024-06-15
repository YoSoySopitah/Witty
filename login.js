const express = require('express');
const router = express.Router();
const connection = require('./database');

router.post('/', (req, res) => {
    const { usuario, contraseña } = req.body;

    connection.query('SELECT * FROM asesores WHERE correoA = ? AND contraseña = ?', [usuario, contraseña], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.tipoUsuario = 'asesor';
            req.session.nombreUsuario = results[0].nombre_asesor; // Guarda el nombre del asesor
            res.redirect('/asesor-home');
        } else {
            connection.query('SELECT * FROM estudiantes WHERE correo_estudiante = ? AND contraseña_estudiante = ?', [usuario, contraseña], (err, results) => {
                if (err) throw err;
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.tipoUsuario = 'estudiante';
                    req.session.nombreUsuario = results[0].nombre_estudiante; // Guarda el nombre del estudiante
                    res.redirect('/estudiante-home');
                } else {
                    res.send('Usuario o contraseña incorrectos');
                }
            });
        }
    });
});

module.exports = router;
