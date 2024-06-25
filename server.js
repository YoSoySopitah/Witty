const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const stripe = require('stripe')('your-stripe-secret-key');
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
    const { usuario, contraseña, tipoUsuario } = req.body;

    const table = tipoUsuario === 'estudiante' ? 'estudiantes' : 'asesores';
    const emailColumn = tipoUsuario === 'estudiante' ? 'correo_estudiante' : 'correoA';
    const passwordColumn = tipoUsuario === 'estudiante' ? 'contraseña_estudiante' : 'contraseña';

    connection.query(`SELECT * FROM ${table} WHERE ${emailColumn} = ? AND ${passwordColumn} = ?`, [usuario, contraseña], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
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
            res.redirect('/elegir-asesor'); // Redirigir a la página de selección de asesor
        });
    });
});

// Ruta para elegir asesor
app.get('/elegir-asesor', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('elegir-asesor', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
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

app.get('/success', (req, res) => {
    if (req.session.user) {
        const user = req.session.user;
        connection.query('INSERT INTO asesorias (fk_materia, fk_asesor, fk_estudiante, fecha_asesoria, fk_costo, duracion_asesoria) VALUES (?, ?, ?, NOW(), ?, ?)', [1, 1, user.id_estudiante, 1, 60], (err, result) => {
            if (err) throw err;
            res.redirect('/mis-asesorias');
        });
    } else {
        res.redirect('/');
    }
});

app.get('/cancel', (req, res) => {
    res.redirect('/');
});

app.get('/mis-asesorias', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const user = req.session.user;
    connection.query('SELECT * FROM asesorias WHERE fk_estudiante = ?', [user.id_estudiante], (err, results) => {
        if (err) throw err;
        res.render('mis-asesorias', { user, asesorias: results });
    });
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
