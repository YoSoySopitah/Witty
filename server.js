const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PRjxWLDT4L4UaZVi4zxVL3oXLFhZGHWKTcYRKAcaqV8QcCXoW9VmmWB1Dr16XT17wJ4x42ixI9xXluiPHaKKlyn00dv8spBcw');
const connection = require('./database'); // Importar la configuración de la base de datos
const path = require('path'); // Necesario para manejar rutas
const multer = require('multer');

const app = express();
const port = 3000;


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({ storage: storage });

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
        const asesorId = req.session.user.id_asesores; // Obtener el ID del asesor desde la sesión

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
                res.render('asesor-home', { nombreUsuario: nombre, correo, disponibilidad, carrera, asesorId });
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

app.get('/informacion', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        res.render('informacion', { nombreUsuario: req.session.user.nombre_estudiante });
    } else {
        res.redirect('/login');
    }
});

app.get('/estudiante-admin', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        const estudianteId = req.session.user.id_estudiante; // Obtener el ID del estudiante desde la sesión

        // Consultar la información del estudiante
        connection.query(`
            SELECT estudiantes.nombre_estudiante AS nombre, estudiantes.correo_estudiante AS correo, 
                   carrera.nombre_carrera AS carrera
            FROM estudiantes
            JOIN carrera ON estudiantes.fk_carrera = carrera.id_carrera
            WHERE estudiantes.id_estudiante = ?
        `, [estudianteId], (err, estudianteResults) => {
            if (err) {
                console.error('Error al cargar los datos del estudiante:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                if (estudianteResults.length > 0) {
                    const { nombre, correo, carrera } = estudianteResults[0];

                    // Consultar las asesorías pendientes
                    connection.query(`
                        SELECT ap.fecha_asesoria, ap.duracion_asesoria, c.nombre_carrera, a.nombre_asesor, m.nombre_materia
                        FROM asesoriasPendiente ap
                        JOIN materias m ON ap.fk_materia = m.id_materia
                        JOIN asesores a ON ap.fk_asesor = a.id_asesores
                        JOIN carrera c ON a.fk_carrera = c.id_carrera
                        WHERE ap.fk_estudiante = ?
      
                    `, [estudianteId], (err, asesoriasResults) => {
                        if (err) {
                            console.error('Error al cargar las asesorías pendientes:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            res.render('estudiante-admin', { 
                                nombreUsuario: nombre, 
                                correo, 
                                carrera, 
                                asesorias: asesoriasResults 
                            });
                        }
                    });
                } else {
                    res.status(404).json({ error: 'Estudiante no encontrado' });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});


// Ruta para obtener las materias de un asesor específico
app.get('/api/materias-asesor/:idAsesor', (req, res) => {
    const idAsesor = req.params.idAsesor;
    connection.query(`
        SELECT asesores.nombre_asesor AS nombreAsesor, carrera.nombre_carrera AS nombreCarrera,
               materias.nombre_materia AS nombreMateria, asesores.precio_asesoria AS precio,
               asesores.disponibilidad AS disponibilidad
        FROM asesores
        JOIN carrera ON asesores.fk_carrera = carrera.id_carrera
        JOIN materias ON asesores.fk_materia = materias.id_materia
        WHERE asesores.id_asesores = ?
    `, [idAsesor], (err, results) => {
        if (err) {
            console.error('Error al cargar las materias del asesor:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});
app.post('/registrar-asesoria', (req, res) => {
    const { carrera, cuatrimestre, materia, disponibilidad, horario } = req.body;

    // Obtener el id y nombre del asesor desde la sesión
    const id_asesor = req.session.user.id_asesor;
    const nombre_asesor = req.session.user.nombre_asesor;

    // Insertar el nuevo asesor en la tabla asesores
    connection.query(
        'INSERT INTO asesores (id_asesor, nombre_asesor, carrera, cuatrimestre, materia, disponibilidad, horario) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_asesor, nombre_asesor, carrera, cuatrimestre, materia, disponibilidad, horario],
        (err, result) => {
            if (err) {
                console.error('Error al insertar el asesor:', err);
                res.status(500).json({ error: 'Error interno del servidor al registrar el asesor' });
            } else {
                res.redirect('/asesor-home'); // Redirigir a la página de inicio del asesor
            }
        }
    );
});

// Ruta para cerrar sesión

app.get('/asesor-admin', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'asesor') {
        const asesorId = req.session.user.id_asesores; // Obtener el ID del asesor desde la sesión

        connection.query(`
            SELECT asesores.nombre_asesor AS nombre, asesores.correoA AS correo, asesores.disponibilidad AS disponibilidad, 
                   carrera.nombre_carrera AS carrera, asesores.descripcion AS descripcion, asesores.precio_asesoria AS tarifa,
                   materias.nombre_materia AS materia1
            FROM asesores
            JOIN carrera ON asesores.fk_carrera = carrera.id_carrera
            LEFT JOIN asesorias ON asesores.id_asesores = asesorias.fk_asesor
            LEFT JOIN materias ON asesorias.fk_materia = materias.id_materia
            WHERE asesores.id_asesores = ?
        `, [asesorId], (err, results) => {
            if (err) {
                console.error('Error al cargar los datos del asesor:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                // Desestructurar el primer resultado
                const { nombre, correo, disponibilidad, carrera, descripcion, tarifa, materia1 } = results[0];
                
                // Renderizar la vista 'asesor-admin' con los datos obtenidos
                res.render('asesor-admin', { nombreUsuario: nombre, correo, disponibilidad, carrera, descripcion, tarifa, materia1, asesorId });
            }
        });
    } else {
        res.redirect('/login');
    }
});



// Ruta para actualizar el nombre y carrera del asesor
// En server.js o el archivo principal de tu backend
app.post('/update-asesor', (req, res) => {
    const nuevoNombre = req.body.nuevoNombre;
    const nuevaDescripcion = req.body.nuevaDescripcion;
    const nuevoPrecio = req.body.NuevoPrecio; // Asegúrate de que el nombre coincide con el del formulario
    const nuevaDisponibilidad = req.body.NuevaDisponibilidad;
    const asesorId = req.body.asesorId;

    const sql = `
        UPDATE asesores
        SET nombre_asesor = ?, descripcion = ?, precio_asesoria = ?, disponibilidad = ?
        WHERE id_asesores = ?;
    `;

    const values = [nuevoNombre, nuevaDescripcion, nuevoPrecio, nuevaDisponibilidad, asesorId];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error al actualizar el asesor:', error);
            return res.status(500).send('Error al actualizar el asesor');
        }
        res.redirect('/asesor-admin');
    });
});



// Ruta para actualizar la descripción del asesor

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('No se pudo cerrar la sesión');
        }
        res.redirect('/login');
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

