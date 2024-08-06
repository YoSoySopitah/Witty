const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51PRjxWLDT4L4UaZVi4zxVL3oXLFhZGHWKTcYRKAcaqV8QcCXoW9VmmWB1Dr16XT17wJ4x42ixI9xXluiPHaKKlyn00dv8spBcw');
const connection = require('./database'); // Importar la configuración de la base de datos
const path = require('path'); // Necesario para manejar rutas
const multer = require('multer');
const bcrypt = require('bcrypt');
const cors = require('cors');
const sharp = require('sharp'); 
const fs = require('fs');

const app = express();
const port = 3000;

// Inicializar middlewares
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const upload = multer({
    dest: 'uploads/temp/', // Carpeta temporal para guardar los archivos subidos
});
// Configurar la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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


app.post('/register', upload.fields([{ name: 'photoUpload', maxCount: 1 }]), async (req, res) => {
    try {
        const { userType, nombre, apellido, email, password, confirmPassword, presentationText, coverPhoto, fk_carrera } = req.body;
        let hashedPassword;
        let sql;
        let values;

        // Verificar campos requeridos
        if (!userType || !nombre || !email || !password || !confirmPassword || !coverPhoto || !fk_carrera) {
            return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
        }

        // Comparar contraseñas
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        // Encriptar la contraseña
        hashedPassword = await bcrypt.hash(password, 10);

        // Obtener archivo de foto de perfil si existe
        const photoUpload = req.files['photoUpload'] ? req.files['photoUpload'][0] : null;
        let fotoPerfil = null;

        if (photoUpload) {
            const tempPath = path.join(__dirname, 'uploads/temp', photoUpload.filename);
            const outputPath = path.join(__dirname, 'uploads', `${photoUpload.filename}.png`);

            // Convertir la imagen a PNG y guardarla
            await sharp(tempPath).toFile(outputPath);

            // Borrar el archivo temporal
            fs.unlinkSync(tempPath);

            fotoPerfil = `${photoUpload.filename}.png`;
        }

        if (userType === 'estudiante') {
            sql = `INSERT INTO estudiantes (nombre_estudiante, fk_carrera, correo_estudiante, contraseña_estudiante, fecha_registro, foto_perfil, portada) 
                   VALUES (?, ?, ?, ?, NOW(), ?, ?)`;
            values = [nombre, fk_carrera, email, hashedPassword, fotoPerfil, coverPhoto];
        } else if (userType === 'asesor') {
            sql = `INSERT INTO asesores (nombre_asesor, fk_carrera, correoA, contraseña, fecha_registro, descripcion, foto_perfil, portada) 
                   VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)`;
            values = [nombre, fk_carrera, email, hashedPassword, presentationText, fotoPerfil, coverPhoto];
        } else {
            return res.status(400).json({ error: 'Tipo de usuario no válido' });
        }

        // Ejecutar la consulta
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al registrar:', err);
                return res.status(500).json({ error: 'Error al registrar' });
            }
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error en el registro:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;

    // Buscar en la tabla de estudiantes primero
    connection.query('SELECT * FROM estudiantes WHERE correo_estudiante = ?', [usuario], (err, estResults) => {
        if (err) {
            console.error('Error al buscar en estudiantes:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (estResults.length > 0) {
            // Comparar la contraseña ingresada con la contraseña encriptada en la base de datos
            bcrypt.compare(contraseña, estResults[0].contraseña_estudiante, (err, match) => {
                if (err) {
                    console.error('Error al comparar contraseñas:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                if (match) {
                    req.session.user = estResults[0];
                    req.session.tipoUsuario = 'estudiante';
                    return res.redirect('/estudiante-home');
                } else {
                    // Contraseña incorrecta
                    return res.redirect('/login');
                }
            });
        } else {
            // Si no se encuentra en estudiantes, buscar en la tabla de asesores
            connection.query('SELECT * FROM asesores WHERE correoA = ?', [usuario], (err, asResults) => {
                if (err) {
                    console.error('Error al buscar en asesores:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                if (asResults.length > 0) {
                    // Comparar la contraseña ingresada con la contraseña encriptada en la base de datos
                    bcrypt.compare(contraseña, asResults[0].contraseña, (err, match) => {
                        if (err) {
                            console.error('Error al comparar contraseñas:', err);
                            return res.status(500).send('Error interno del servidor');
                        }

                        if (match) {
                            req.session.user = asResults[0];
                            req.session.tipoUsuario = 'asesor';
                            return res.redirect('/asesor-home');
                        } else {
                            // Contraseña incorrecta
                            return res.redirect('/login');
                        }
                    });
                } else {
                    // No se encontró el usuario en ninguna tabla
                    return res.redirect('/login');
                }
            });
        }
    });
});

app.get('/estudiante-home', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        const estudianteId = req.session.user.id_estudiante;

        connection.query(`
            SELECT nombre_estudiante, correo_estudiante, foto_perfil
            FROM estudiantes
            WHERE id_estudiante = ?
        `, [estudianteId], (err, results) => {
            if (err) {
                console.error('Error al cargar los datos del estudiante:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (results.length > 0) {
                const { nombre_estudiante, correo_estudiante, foto_perfil } = results[0];
                
                // Verifica el valor de foto_perfil
                const imagenPerfilPath = foto_perfil && foto_perfil.trim() !== ''
                    ? `/uploads/${foto_perfil}`
                    : '/img/user.png';

                res.render('estudiante-home', {
                    nombreUsuario: nombre_estudiante,
                    correoUsuario: correo_estudiante,
                    imagenPerfil: imagenPerfilPath
                });
            } else {
                res.status(404).json({ error: 'Estudiante no encontrado' });
            }
        });
    } else {
        res.redirect('/login');
    }
});



// Rutas protegidas
app.get('/register-info', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('register-info', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/agregar-asesoria', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('agregar-asesoria', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/perfil-asesor', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('asesor-profile', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/register-info', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('register-info', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/agregar-asesoria', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('agregar-asesoria', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/perfil-asesor', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('asesor-profile', { nombreUsuario: req.session.user.nombre_estudiante || req.session.user.nombre_asesor });
});

app.get('/estudiante-home', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        const estudianteId = req.session.user.id_estudiante;

        connection.query(`
            SELECT nombre_estudiante, correo_estudiante, foto_perfil
            FROM estudiantes
            WHERE id_estudiante = ?
        `, [estudianteId], (err, results) => {
            if (err) {
                console.error('Error al cargar los datos del estudiante:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (results.length > 0) {
                const { nombre_estudiante, correo_estudiante, foto_perfil } = results[0];
                const imagenPerfilPath = foto_perfil && foto_perfil !== 'null'
                    ? `/uploads/${foto_perfil}`
                    : '/img/user.png';

                res.render('estudiante-home', {
                    nombreUsuario: nombre_estudiante,
                    correoUsuario: correo_estudiante,
                    imagenPerfil: imagenPerfilPath
                });
            } else {
                res.status(404).json({ error: 'Estudiante no encontrado' });
            }
        });
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

app.get('/buscar-tutores', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        res.render('buscar-tutores', { nombreUsuario: req.session.user.nombre_estudiante });
    } else {
        res.redirect('/login');
    }
});


app.get('/estudiante-admin', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'estudiante') {
        const estudianteId = req.session.user.id_estudiante;

        console.log('ID del estudiante:', estudianteId);

        connection.query(`
            SELECT e.nombre_estudiante AS nombre, e.correo_estudiante AS correo, 
                   c.nombre_carrera AS carrera, e.foto_perfil AS fotoPerfil, e.portada AS portada
            FROM estudiantes e
            JOIN carrera c ON e.fk_carrera = c.id_carrera
            WHERE e.id_estudiante = ?
        `, [estudianteId], (err, estudianteResults) => {
            if (err) {
                console.error('Error al cargar los datos del estudiante:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Resultados de la consulta del estudiante:', estudianteResults);
                
                if (estudianteResults.length > 0) {
                    const { nombre, correo, carrera, fotoPerfil, portada } = estudianteResults[0];
                    const imagenPerfilPath = fotoPerfil && fotoPerfil.trim() !== ''
                        ? `/uploads/${fotoPerfil}`
                        : '/img/user.png';
                    const portadaPath = portada && portada.trim() !== ''
                        ? portada  // Ya que la portada está directamente en la base de datos, no se necesita modificar la ruta
                        : '/img/default-cover.png'; // Cambia esto a una ruta de portada predeterminada si no tienes

                    connection.query(`
                        SELECT ap.fecha_asesoria, ap.duracion_asesoria, c.nombre_carrera AS carrera_asesor, 
                               a.nombre_asesor, m.nombre_materia
                        FROM asesoriasPendiente ap
                        JOIN materias m ON ap.fk_materia = m.id_materia
                        JOIN asesores a ON ap.fk_asesor = a.id_asesores
                        JOIN carrera c ON a.fk_carrera = c.id_carrera
                        WHERE ap.fk_estudiante = ?
                    `, [estudianteId], (err, asesoriasResults) => {
                        if (err) {
                            console.error('Error al cargar las asesorías pendientes:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            res.render('estudiante-admin', { 
                                nombreUsuario: nombre, 
                                correo, 
                                carrera, 
                                fotoPerfil: imagenPerfilPath,
                                portada: portadaPath, // Pasar la portada a la vista
                                asesorias: asesoriasResults 
                            });
                        }
                    });
                } else {
                    console.log('Estudiante con ID', estudianteId, 'no encontrado en la base de datos');
                    res.status(404).json({ error: 'Estudiante no encontrado' });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});




app.get('/asesor-home', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'asesor') {
        const asesorId = req.session.user.id_asesores;

        connection.query(`
            SELECT asesores.nombre_asesor AS nombre, asesores.correoA AS correo, asesores.disponibilidad AS disponibilidad, 
                   carrera.nombre_carrera AS carrera, asesores.foto_perfil AS fotoPerfil
            FROM asesores
            JOIN carrera ON asesores.fk_carrera = carrera.id_carrera
            WHERE asesores.id_asesores = ?
        `, [asesorId], (err, results) => {
            if (err) {
                console.error('Error al cargar los datos del asesor:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                if (results.length > 0) {
                    const { nombre, correo, disponibilidad, carrera, fotoPerfil } = results[0];
                    res.render('asesor-home', { nombreUsuario: nombre, correo, disponibilidad, carrera, fotoPerfil, asesorId });
                } else {
                    res.status(404).json({ error: 'Asesor no encontrado' });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});


app.get('/asesor-admin', (req, res) => {
    if (req.session.user && req.session.tipoUsuario === 'asesor') {
        const asesorId = req.session.user.id_asesores;

        connection.query(`
            SELECT asesores.nombre_asesor AS nombre, asesores.correoA AS correo, asesores.disponibilidad AS disponibilidad, 
                   carrera.nombre_carrera AS carrera, asesores.descripcion AS descripcion, asesores.precio_asesoria AS tarifa,
                   materias.nombre_materia AS materia1, asesores.portada AS portada, asesores.foto_perfil AS fotoPerfil
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
                const { nombre, correo, disponibilidad, carrera, descripcion, tarifa, materia1, portada, fotoPerfil } = results[0];
                res.render('asesor-admin', { nombreUsuario: nombre, correo, disponibilidad, carrera, descripcion, tarifa, materia1, portada, fotoPerfil, asesorId });
            }
        });
    } else {
        res.redirect('/login');
    }
});


app.get('/ver-perfil-asesor/:id', (req, res) => {
    const asesorId = req.params.id;
    const sql = `
    SELECT a.id_asesores, a.nombre_asesor, a.descripcion, a.disponibilidad, a.correoA, a.precio_asesoria, c.nombre_carrera, a.foto_perfil, a.portada
    FROM asesores a
    JOIN carrera c ON a.fk_carrera = c.id_carrera
    WHERE a.id_asesores = ?;
    `;

    connection.query(sql, [asesorId], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).send('Error en la consulta');
        }
        
        if (results.length > 0) {
            const asesor = results[0];
            res.render('asesor-profile', { asesor });
        } else {
            res.status(404).send('Asesor no encontrado');
        }
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al destruir la sesión:', err);
            return res.status(500).send('No se pudo cerrar la sesión');
        }
        res.redirect('/');
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
    connection.query('SELECT * FROM materias', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

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

app.get('/search-materias', (req, res) => {
    const { keyword } = req.query;
    const query = `
        SELECT * FROM materias
        WHERE nombre_materia LIKE ? OR descripcion_materia LIKE ?
    `;
    connection.query(query, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
        if (err) {
            console.error('Error al buscar materias:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results);
    });
});

app.get('/ver-perfil-asesor/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT a.*, c.nombre_carrera
        FROM asesores a
        JOIN carrera c ON a.fk_carrera = c.id_carrera
        WHERE a.id_asesores = ?
    `;
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el perfil del asesor:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(results[0]);
    });
});

app.get('/buscar-materias', (req, res) => {
    const query = req.query.q;
    
    // SQL para buscar materias por nombre
    const sql = 'SELECT id_materia, nombre_materia FROM materias WHERE nombre_materia LIKE ?';
    
    connection.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error al buscar materias:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});



app.get('/asesores-por-materia/:id', (req, res) => {
    const materiaId = req.params.id;

    // SQL para obtener asesores por ID de materia
    const sql = 'SELECT * FROM asesores WHERE fk_materia = ?';

    connection.query(sql, [materiaId], (err, results) => {
        if (err) {
            console.error('Error al buscar asesores:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

app.post('/asesoria', (req, res) => {
    const { fk_materia, fk_asesor, fk_cuatrimestre, fecha_asesoria, precio, duracion_asesoria } = req.body;
  
    // Validación básica de datos
    if (!fk_materia || !fk_asesor || !fk_cuatrimestre || !fecha_asesoria || !precio || !duracion_asesoria) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    // Construir la consulta SQL
    const query = 'INSERT INTO asesorias (fk_materia, fk_asesor, fk_cuatrimestre, fecha_asesoria, precio, duracion_asesoria) VALUES (?, ?, ?, ?, ?, ?)';
    
    // Ejecutar la consulta
    db.query(query, [fk_materia, fk_asesor, fk_cuatrimestre, fecha_asesoria, precio, duracion_asesoria], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error al agregar la asesoría', error: err });
      }
      res.status(201).json({ message: 'Asesoría agregada con éxito', id_asesoria: result.insertId });
    });
  });

app.post('/update-asesor', (req, res) => {
    const { asesorId, nuevoNombre, nuevaDescripcion, NuevoPrecio, NuevaDisponibilidad } = req.body;

    // Validar y sanitizar los datos de entrada aquí si es necesario

    // Consulta SQL para actualizar el asesor
    const query = `
        UPDATE asesores
        SET nombre_asesor = ?, descripcion = ?, precio_asesoria = ?, disponibilidad = ?
        WHERE id_asesores = ?
    `;

    connection.query(query, [nuevoNombre, nuevaDescripcion, NuevoPrecio, NuevaDisponibilidad, asesorId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el asesor:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Redirigir o enviar una respuesta de éxito
            res.redirect('/asesor-admin'); // O puedes redirigir a otra página si lo prefieres
        }
    });
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

