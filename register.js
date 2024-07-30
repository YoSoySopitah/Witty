const express = require('express');
const router = express.Router();
const connection = require('./database');

// Middleware para manejar errores
function handleError(err, res) {
    console.error('Error:', err);
    res.status(500).send('Error al registrar');
}

router.post('/', (req, res) => {
    const { nombre_completo, rusuario, rcontraseña, tipoUsuario, carrera, cuatrimestre, materia, disponibilidad, precio_asesoria } = req.body;

    // Validar campos requeridos
    if (!nombre_completo || !rusuario || !rcontraseña || !tipoUsuario) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    let query;
    let values;

    if (tipoUsuario === 'estudiante') {
        if (!carrera || !materia) {
            return res.status(400).send('Campos de carrera y materia son requeridos para estudiantes');
        }
        query = 'INSERT INTO estudiantes (nombre_estudiante, correo_estudiante, contraseña_estudiante, fk_carrera, fk_materia, fecha_registro) VALUES (?, ?, ?, ?, ?, NOW())';
        values = [nombre_completo, rusuario, rcontraseña, carrera, materia];
    } else if (tipoUsuario === 'asesor') {
        if (!disponibilidad || !precio_asesoria || !carrera || !materia) {
            return res.status(400).send('Campos de disponibilidad, precio de asesoría, carrera y materia son requeridos para asesores');
        }
        query = 'INSERT INTO asesores (nombre_asesor, correoA, contraseña, disponibilidad, precio_asesoria, fk_carrera, fk_materia, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
        values = [nombre_completo, rusuario, rcontraseña, disponibilidad, precio_asesoria, carrera, materia];
    } else {
        return res.status(400).send('Tipo de usuario no válido');
    }

    connection.query(query, values, (err, results) => {
        if (err) {
            return handleError(err, res);
        }

        // Inicia sesión al usuario después del registro
        req.session.loggedin = true;
        req.session.tipoUsuario = tipoUsuario;
        req.session.nombreUsuario = nombre_completo;
        req.session.carrera = carrera;

        // Redirige al usuario a la página de elección de asesor
        res.redirect('/register-info');
    });
});

module.exports = router;
