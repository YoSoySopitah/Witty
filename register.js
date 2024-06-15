const express = require('express');
const router = express.Router();
const connection = require('./database');

router.post('/', (req, res) => {
    const { nombre_completo, rusuario, rcontraseña, tipoUsuario, carrera, cuatrimestre, materia, disponibilidad, precio_asesoria } = req.body;

    let query;
    let values;

    if (tipoUsuario === 'estudiante') {
        query = 'INSERT INTO estudiantes (nombre_estudiante, correo_estudiante, contraseña_estudiante, fk_carrera, fk_materia) VALUES (?, ?, ?, ?, ?)';
        values = [nombre_completo, rusuario, rcontraseña, carrera, materia];
    } else if (tipoUsuario === 'asesor') {
        query = 'INSERT INTO asesores (nombre_asesor, correoA, contraseñaA, disponibilidad, precio_asesoria) VALUES (?, ?, ?, ?, ?)';
        values = [nombre_completo, rusuario, rcontraseña, disponibilidad, precio_asesoria];
    }

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al registrar:', err);
            res.status(500).send('Error al registrar');
            return;
        }

        // Inicia sesión al usuario después del registro
        req.session.loggedin = true;
        req.session.tipoUsuario = tipoUsuario;
        req.session.nombreUsuario = nombre_completo;
        req.session.carrera = carrera;

        // Redirige al usuario a la página de elección de asesor
        res.redirect('/elegir-asesor');
    });
});

module.exports = router;
