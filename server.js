const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const loginRouter = require('./login');
const registerRouter = require('./register');
const connection = require('./database'); // Asegúrate de tener la conexión a la base de datos aquí

// Configura EJS como el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

// Middleware de sesión
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar si el usuario está logueado
function verificarSesion(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        if (req.path === '/login.html' || req.path === '/login' || req.path === '/register' || req.path === '/register.html' || req.path.startsWith('/css') || req.path.startsWith('/img') || req.path.startsWith('/js') || req.path.startsWith('/api')) {
            next();
        } else {
            res.redirect('/login.html');
        }
    }
}

// Aplica el middleware de sesión a todas las rutas
app.use(verificarSesion);

app.use('/login', loginRouter);
app.use('/register', registerRouter);

// Ruta pública
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas protegidas
app.get('/asesor-home', (req, res) => {
    if (req.session.tipoUsuario === 'asesor') {
        res.render('asesor-home', { nombreUsuario: req.session.nombreUsuario });
    } else {
        res.redirect('/login.html');
    }
});

app.get('/estudiante-home', (req, res) => {
    if (req.session.tipoUsuario === 'estudiante') {
        res.render('estudiante-home', { nombreUsuario: req.session.nombreUsuario });
    } else {
        res.redirect('/login.html');
    }
});

app.get('/carrera/:id', (req, res) => {
    res.render(`carrera-${req.params.id}`, { nombreUsuario: req.session.nombreUsuario });
});

// API para obtener carreras
app.get('/api/carreras', (req, res) => {
    connection.query('SELECT id_carrera, nombre_carrera FROM carrera', (err, results) => {
        if (err) {
            console.error('Error al obtener las carreras:', err);
            res.status(500).send('Error al obtener las carreras');
            return;
        }
        res.json(results);
    });
});

// API para obtener cuatrimestres por carrera
app.get('/api/cuatrimestres', (req, res) => {
    const carreraId = req.query.carreraId;
    connection.query('SELECT DISTINCT numero_cuatrimestre FROM cuatrimestre WHERE fk_carrera = ?', [carreraId], (err, results) => {
        if (err) {
            console.error('Error al obtener los cuatrimestres:', err);
            res.status(500).send('Error al obtener los cuatrimestres');
            return;
        }
        res.json(results);
    });
});

// API para obtener materias por carrera y cuatrimestre
app.get('/api/materias', (req, res) => {
    const carreraId = req.query.carreraId;
    const cuatrimestre = req.query.cuatrimestre;
    connection.query('SELECT id_materia, nombre_materia FROM materias WHERE fk_carrera = ? AND cuatri_materia = ?', [carreraId, cuatrimestre], (err, results) => {
        if (err) {
            console.error('Error al obtener las materias:', err);
            res.status(500).send('Error al obtener las materias');
            return;
        }
        res.json(results);
    });
});

// API para obtener asesores por carrera
app.get('/api/asesores', (req, res) => {
    const carreraId = req.session.carrera;
    connection.query('SELECT nombre_asesor, disponibilidad, precio_asesoria FROM asesores WHERE fk_carrera = ?', [carreraId], (err, results) => {
        if (err) {
            console.error('Error al obtener los asesores:', err);
            res.status(500).send('Error al obtener los asesores');
            return;
        }
        res.json(results);
    });
});

// Ruta protegida para el pago
app.post('/realizar-pago', (req, res) => {
    if (req.session.loggedin) {
        const asesorSeleccionado = req.body.asesor;
        // Almacena el asesor seleccionado en la sesión
        req.session.asesorSeleccionado = asesorSeleccionado;

        // Lógica del pago
        // Aquí puedes integrar con una pasarela de pago como PayPal, Stripe, etc.
        // Si el pago es exitoso, redirige al usuario a la página de contacto con el asesor
        res.redirect('/contacto-asesor');
    } else {
        res.redirect('/login.html');
    }
});

// Ruta protegida para la página de contacto con el asesor
app.get('/contacto-asesor', (req, res) => {
    if (req.session.loggedin) {
        res.render('contacto-asesor', {
            nombreUsuario: req.session.nombreUsuario,
            asesorSeleccionado: req.session.asesorSeleccionado
        });
    } else {
        res.redirect('/login.html');
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
