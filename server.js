const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PRjxWLDT4L4UaZVi4zxVL3oXLFhZGHWKTcYRKAcaqV8QcCXoW9VmmWB1Dr16XT17wJ4x42ixI9xXluiPHaKKlyn00dv8spBcw');
const connection = require('./database'); // Importar la configuración de la base de datos
const path = require('path'); // Necesario para manejar rutas

const app = express();
const port = 3000;

// Configurar la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

z

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login');
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register');
});

app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;

    // Buscar en la tabla de estudiantes primero
    connection.query(`SELECT * FROM estudiantes WHERE correo_estudiante = ? AND contraseña_estudiante = ?`, [usuario, contraseña], (err, estResults) => {
        if (err) throw err;

        if (estResults.length > 0) {
            req.session.user = estResults[0];
            req.session.tipoUsuario = 'estudiante';
            return res.redirect('/estudiante-home');
        }

        // Si no se encuentra en estudiantes, buscar en la tabla de asesores
        connection.query(`SELECT * FROM asesores WHERE correoA = ? AND contraseña = ?`, [usuario, contraseña], (err, asResults) => {
            if (err) throw err;

            if (asResults.length > 0) {
                req.session.user = asResults[0];
                req.session.tipoUsuario = 'asesor';
                return res.redirect('/asesor-home');
            }

            // Si no se encuentra en ninguna tabla, redirigir al login
            res.redirect('/login');
        });
    });
});

app.post('/register', (req, res) => {
    const { nombre_completo, rusuario, rcontraseña, tipoUsuario, carrera, materia, disponibilidad, precio_asesoria } = req.body;

    let user = {
        fk_carrera: carrera,
        fk_materia: materia
    };

    let table;

    if (tipoUsuario === 'estudiante') {
        user = {
            ...user,
            nombre_estudiante: nombre_completo,
            correo_estudiante: rusuario,
            contraseña_estudiante: rcontraseña,
            fecha_registro: new Date()
        };
        table = 'estudiantes';
    } else if (tipoUsuario === 'asesor') {
        user = {
            ...user,
            nombre_asesor: nombre_completo,
            correoA: rusuario,
            contraseña: rcontraseña,
            disponibilidad: disponibilidad,
            precio_asesoria: precio_asesoria,
            fecha_registro: new Date()
        };
        table = 'asesores';
    }

    connection.query(`INSERT INTO ${table} SET ?`, user, (err, result) => {
        if (err) throw err;

        // Recuperar el ID del usuario recién creado
        connection.query(`SELECT * FROM ${table} WHERE ${tipoUsuario === 'estudiante' ? 'correo_estudiante' : 'correoA'} = ?`, [rusuario], (err, results) => {
            if (err) throw err;
            req.session.user = results[0];
            req.session.tipoUsuario = tipoUsuario;
            res.redirect('/register-info'); // Redirigir a la página de selección de asesor
        });
    });
});

// Ruta para registrar info
app.get('/register-info', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('register-info', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});
    
app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Asesoría',
                },
                unit_amount: 1000,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
});

app.get('/api/carreras', (req, res) => {
    connection.query('SELECT * FROM carrera', (err, results) => {
        if (err) {
            console.error('Error al cargar las carreras:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/cuatrimestres', (req, res) => {
    const carreraId = req.query.carreraId;
    connection.query('SELECT DISTINCT numero_cuatrimestre FROM cuatrimestre WHERE fk_carrera = ?', [carreraId], (err, results) => {
        if (err) {
            console.error('Error al cargar los cuatrimestres:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/materias', (req, res) => {
    const { carreraId, cuatrimestre } = req.query;
    connection.query('SELECT * FROM materias WHERE fk_carrera = ? AND cuatri_materia = ?', [carreraId, cuatrimestre], (err, results) => {
        if (err) {
            console.error('Error al cargar las materias:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// API para obtener los asesores (según se deduce del mensaje de error)
app.get('/api/asesores', (req, res) => {
    connection.query('SELECT * FROM asesores', (err, results) => {
        if (err) {
            console.error('Error al cargar los asesores:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});

// Rutas para las páginas de inicio de asesores y estudiantes
app.get('/asesor-home', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'asesor') {
        const asesorId = req.session.user.id_asesores;

        connection.query(`
            SELECT asesores.nombre_asesor AS nombre, asesores.correoA AS correo, asesores.disponibilidad AS disponibilidad, carrera.nombre_carrera AS carrera
            FROM asesores
            JOIN carrera ON asesores.fk_carrera = carrera.id_carrera
            WHERE asesores.id_asesores = ?
        `, [asesorId], (err, results) => {
            if (err) {
                console.error('Error al cargar los datos del asesor:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const { nombre, correo, disponibilidad, carrera } = results[0];
                res.render('asesor-home', { nombreUsuario: nombre, correo, disponibilidad, carrera });
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/estudiante-home', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        res.render('estudiante-home', { nombreUsuario: req.session.user.nombre_estudiante });
    } else {
        res.redirect('/login');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
