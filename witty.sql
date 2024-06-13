CREATE DATABASE Witty;
USE Witty;

-- Creacion de tablas 
CREATE TABLE asesores (
    id_asesores INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_asesor VARCHAR(50),
    fk_carrera INT,
    fk_materia INT,
    disponibilidad VARCHAR(50),
    correoA VARCHAR(50),
    precio_asesoria DECIMAL(10,2),
    fecha_registro DATE,
    contraseña VARCHAR(50)
);

CREATE TABLE estudiantes (
    id_estudiante INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_estudiante VARCHAR(50),
    fk_carrera INT,
    fk_materia INT,
    correo_estudiante VARCHAR(50),
    contraseña_estudiante VARCHAR(50),
    fecha_registro DATE
);

CREATE TABLE materias (
    id_materia INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_materia VARCHAR(100),
    fk_carrera INT,
    cuatri_materia INT 
);

CREATE TABLE carrera (
    id_carrera INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nombre_carrera VARCHAR(50)
);

CREATE TABLE asesorias (
    id_asesoria INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    fk_materia INT,
    fk_asesor INT, 
    fk_estudiante INT,
    fecha_asesoria DATE, 
    fk_costo INT,
    duracion_asesoria INT 
);

CREATE TABLE cuatrimestre (
    id_cuatrimestre INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    fk_materia INT,
    fk_carrera INT,
    numero_cuatrimestre INT 
);

CREATE TABLE costo (
    id_costo INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    precio DECIMAL(10,2),
    fk_materia INT 
);

-- Referenciar llaves foraneas 
-- Asesores
ALTER TABLE asesores ADD
FOREIGN KEY (fk_carrera) REFERENCES carrera(id_carrera);

ALTER TABLE asesores ADD
FOREIGN KEY (fk_materia) REFERENCES materias(id_materia);

-- Estudiantes 
ALTER TABLE estudiantes ADD
FOREIGN KEY (fk_carrera) REFERENCES carrera(id_carrera);
 
ALTER TABLE estudiantes ADD
FOREIGN KEY (fk_materia) REFERENCES materias(id_materia);

-- Asesorias
ALTER TABLE asesorias ADD
FOREIGN KEY (fk_materia) REFERENCES materias(id_materia);

ALTER TABLE asesorias ADD
FOREIGN KEY (fk_asesor) REFERENCES asesores(id_asesores);

ALTER TABLE asesorias ADD
FOREIGN KEY (fk_estudiante) REFERENCES estudiantes(id_estudiante);

ALTER TABLE asesorias ADD
FOREIGN KEY (fk_costo) REFERENCES costo(id_costo);

-- Cuatrimestres 
ALTER TABLE cuatrimestre ADD
FOREIGN KEY (fk_carrera) REFERENCES carrera(id_carrera);

ALTER TABLE cuatrimestre ADD
FOREIGN KEY (fk_materia) REFERENCES materias(id_materia);

-- Costos
ALTER TABLE costo ADD
FOREIGN KEY (fk_materia) REFERENCES materias(id_materia);

-- Inserciones

-- Insert into carrera
INSERT INTO carrera (nombre_carrera) VALUES
('Energías Renovables'),
('Procesos Industriales'),
('Desarrollo de Negocios'),
('Mantenimiento Industrial'),
('Mecatrónica'),
('Tecnologías de la Información');

-- Insert into materias para Energías Renovables
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
-- Técnico Superior Universitario
('Probabilidad y estadística', 1, 1),
('Química básica', 1, 1),
('Electricidad y magnetismo', 1, 1),
('Desarrollo sustentable', 1, 1),
('Informática', 1, 1),
('Circuitos eléctricos', 1, 1),
('Inglés I', 1, 1),
('Expresión oral y escrita I', 1, 1),
('Formación sociocultural I', 1, 1),
('Álgebra lineal', 1, 2),
('Física', 1, 2),
('Termodinámica', 1, 2),
('Instalaciones eléctricas', 1, 2),
('Electrónica industrial', 1, 2),
('Mecánica industrial', 1, 2),
('Inglés II', 1, 2),
('Formación sociocultural II', 1, 2),
('Funciones matemáticas', 1, 3),
('Fisicoquímica', 1, 3),
('Instrumentación industrial', 1, 3),
('Mantenimiento electromecánico', 1, 3),
('Energías renovables', 1, 3),
('Formulación de proyectos', 1, 3),
('Calidad', 1, 3),
('Integradora I', 1, 3),
('Inglés III', 1, 3),
('Cálculo diferencial', 1, 4),
('Estructura y propiedades de los materiales', 1, 4),
('Fisicoquímica aplicada', 1, 4),
('Dibujo industrial', 1, 4),
('Electrónica de potencia', 1, 4),
('Estaciones meteorológicas', 1, 4),
('Procesos industriales', 1, 4),
('Inglés IV', 1, 4),
('Formación sociocultural III', 1, 4),
('Cálculo integral', 1, 5),
('Seguridad industrial', 1, 5),
('Celdas fotovoltaicas', 1, 5),
('Colectores solares', 1, 5),
('Administración de proyectos', 1, 5),
('Adquisición de datos', 1, 5),
('Integradora II', 1, 5),
('Inglés V', 1, 5),
('Expresión oral y escrita II', 1, 5),
('Estadía en Empresa', 1, 6),
-- Ingeniería
('Matemáticas para ingeniería I', 1, 7),
('Física para ingeniería', 1, 7),
('Ingeniería de proyectos en energías renovables', 1, 7),
('Dirección de proyectos de sistemas en energías renovables I', 1, 7),
('Análisis y adquisición de datos', 1, 7),
('Inglés VI', 1, 7),
('Administración del tiempo', 1, 7),
('Matemáticas para ingeniería II', 1, 8),
('Diseño de sistemas', 1, 8),
('Dirección de proyectos de sistemas en energías renovables II', 1, 8),
('Optativa I', 1, 8),
('Inglés VII', 1, 8),
('Planeación y organización del trabajo', 1, 8),
('Caracterización de los recursos energéticos', 1, 9),
('Modelado de sistemas en energías renovables', 1, 9),
('Economía energética', 1, 9),
('Diseño de proyectos de sistemas solares', 1, 9),
('Diseño de proyectos de sistemas en turbo energía', 1, 9),
('Inglés VIII', 1, 9),
('Dirección de equipos de alto rendimiento', 1, 9),
('Diseño de proyectos de sistemas en bioenergía', 1, 10),
('Estrategias de eficiencia energética', 1, 10),
('Legislación y financiamiento ambiental', 1, 10),
('Integradora', 1, 10),
('Optativa II', 1, 10),
('Inglés IX', 1, 10),
('Negociación empresarial', 1, 10),
('Estadía en Empresa', 1, 11);

-- Insert into materias para Procesos Industriales
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
-- Técnico Superior Universitario
('Álgebra lineal', 2, 1),
('Química básica', 2, 1),
('Organización industrial', 2, 1),
('Metrología I', 2, 1),
('Dibujo industrial', 2, 1),
('Herramientas informáticas I', 2, 1),
('Inglés I', 2, 1),
('Expresión oral y escrita I', 2, 1),
('Formación sociocultural I', 2, 1),
('Funciones matemáticas', 2, 2),
('Física', 2, 2),
('Electricidad y magnetismo', 2, 2),
('Administración de la producción I', 2, 2),
('Métodos y sistemas de trabajo I', 2, 2),
('Tópicos de manufactura', 2, 2),
('Costos de producción', 2, 2),
('Inglés II', 2, 2),
('Formación sociocultural II', 2, 2),
('Cálculo diferencial', 2, 3),
('Probabilidad y estadística', 2, 3),
('Química II', 2, 3),
('Control estadístico del proceso', 2, 3),
('Procesos de manufactura I', 2, 3),
('Distribución de planta', 2, 3),
('Integradora I', 2, 3),
('Gestión ambiental', 2, 3),
('Fundamentos de automatización', 2, 3),
('Inglés III', 2, 3),
('Cálculo integral', 2, 4),
('Estructura y propiedades de los materiales', 2, 4),
('Procesos de fabricación de materiales cerámicos I', 2, 4),
('Manejo de materiales', 2, 4),
('Reología', 2, 4),
('Almacenes y control de inventarios', 2, 4),
('Análisis de las condiciones de trabajo', 2, 4),
('Inglés IV', 2, 4),
('Formación sociocultural III', 2, 4),
('Moldes cerámicos', 2, 5),
('Procesos de fabricación de materiales cerámicos II', 2, 5),
('Propiedades y pruebas de materias primas', 2, 5),
('Herramientas informáticas II', 2, 5),
('Automatización', 2, 5),
('Integradora II', 2, 5),
('Inglés V', 2, 5),
('Expresión oral y escrita II', 2, 5),
('Formación sociocultural IV', 2, 5),
('Estadía en empresa', 2, 6),
-- Ingeniería
('Matemáticas para ingeniería I', 2, 7),
('Física para ingeniería', 2, 7),
('Ingeniería de proyectos en procesos industriales', 2, 7),
('Dirección de proyectos de sistemas en procesos industriales I', 2, 7),
('Análisis y adquisición de datos', 2, 7),
('Inglés VI', 2, 7),
('Administración del tiempo', 2, 7),
('Matemáticas para ingeniería II', 2, 8),
('Diseño de sistemas', 2, 8),
('Dirección de proyectos de sistemas en procesos industriales II', 2, 8),
('Optativa I', 2, 8),
('Inglés VII', 2, 8),
('Planeación y organización del trabajo', 2, 8),
('Caracterización de los procesos industriales', 2, 9),
('Modelado de sistemas en procesos industriales', 2, 9),
('Economía industrial', 2, 9),
('Diseño de proyectos de sistemas industriales', 2, 9),
('Diseño de proyectos de sistemas en manufactura', 2, 9),
('Inglés VIII', 2, 9),
('Dirección de equipos de alto rendimiento', 2, 9),
('Diseño de proyectos de sistemas en logística', 2, 10),
('Estrategias de eficiencia industrial', 2, 10),
('Legislación y financiamiento industrial', 2, 10),
('Integradora', 2, 10),
('Optativa II', 2, 10),
('Inglés IX', 2, 10),
('Negociación empresarial', 2, 10),
('Estadía en Empresa', 2, 11);

-- Insert into materias para Desarrollo de Negocios
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
-- Técnico Superior Universitario en Mercadotecnia
('Matemáticas', 3, 1),
('Administración', 3, 1),
('Informática I', 3, 1),
('Economía', 3, 1),
('Mercadotecnia', 3, 1),
('Inglés I', 3, 1),
('Expresión oral y escrita I', 3, 1),
('Formación sociocultural I', 3, 1),
('Estadística', 3, 2),
('Contabilidad', 3, 2),
('Informática II', 3, 2),
('Planeación estratégica', 3, 2),
('Sistema de investigación de mercados', 3, 2),
('Ventas', 3, 2),
('Inglés II', 3, 2),
('Formación sociocultural II', 3, 2),
('Calidad', 3, 3),
('Gestión de proyectos', 3, 3),
('Legislación comercial', 3, 3),
('Sistema de investigación de mercados II', 3, 3),
('Integradora I', 3, 3),
('Estrategias de producto', 3, 3),
('Inglés III', 3, 3),
('Formación sociocultural III', 3, 3),
('Diseño gráfico', 3, 4),
('Logística y distribución', 3, 4),
('Comportamiento del consumidor', 3, 4),
('Estrategias de precio', 3, 4),
('Mezcla promocional I', 3, 4),
('Metodología de la investigación', 3, 4),
('Inglés IV', 3, 4),
('Formación sociocultural IV', 3, 4),
('Mercadotecnia internacional', 3, 5),
('Mezcla promocional II', 3, 5),
('Mercadotecnia digital', 3, 5),
('Mercadotecnia estratégica', 3, 5),
('Integradora II', 3, 5),
('Inglés V', 3, 5),
('Expresión oral y escrita II', 3, 5),
('Estadía en empresa', 3, 6),
-- Licenciatura en Negocios y Mercadotecnia
('Estadística aplicada a los negocios', 3, 7),
('Desarrollo de nuevos productos', 3, 7),
('Inteligencia de mercados', 3, 7),
('Inglés VI', 3, 7),
('Administración del tiempo', 3, 7),
('Tendencias del mercado y consumidor global', 3, 8),
('Administración de la producción', 3, 8),
('Gestión del talento humano', 3, 8),
('Optativa I', 3, 8),
('Inglés VII', 3, 8),
('Planeación y organización del trabajo', 3, 8),
('Comunicación integral de mercadotecnia', 3, 9),
('Planeación y seguimiento de proyectos', 3, 9),
('Finanzas', 3, 9),
('Optativa II', 3, 9),
('Inglés VIII', 3, 9),
('Dirección de equipos de alto rendimiento', 3, 9),
('Comunicación ejecutiva', 3, 10),
('Cadena de suministros', 3, 10),
('Plan de negocios', 3, 10),
('Integradora', 3, 10),
('Inglés IX', 3, 10),
('Negociación empresarial', 3, 10),
('Estadía en empresa', 3, 11);

-- Insert into materias para Mantenimiento Industrial
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
-- Técnico Superior Universitario en Mantenimiento Industrial
('Matemáticas', 4, 1),
('Química aplicada', 4, 1),
('Mecánica', 4, 1),
('Electricidad y magnetismo', 4, 1),
('Taller de investigación I', 4, 1),
('Formación sociocultural I', 4, 1),
('Desarrollo Sustentable', 4, 1),
('Inglés I', 4, 1),
('Álgebra', 4, 2),
('Física aplicada', 4, 2),
('Electrónica', 4, 2),
('Máquinas eléctricas', 4, 2),
('Resistencia de materiales', 4, 2),
('Taller de investigación II', 4, 2),
('Formación sociocultural II', 4, 2),
('Inglés II', 4, 2),
('Estática', 4, 3),
('Dinámica', 4, 3),
('Materiales metálicos', 4, 3),
('Máquinas y herramientas', 4, 3),
('Automatización industrial', 4, 3),
('Hidráulica y neumática', 4, 3),
('Inglés III', 4, 3),
('Formación sociocultural III', 4, 3),
('Taller de investigación III', 4, 3),
('Administración de mantenimiento', 4, 4),
('Instrumentación y control', 4, 4),
('Mantenimiento de sistemas hidráulicos', 4, 4),
('Mantenimiento de sistemas neumáticos', 4, 4),
('Sistemas de control eléctrico', 4, 4),
('Inglés IV', 4, 4),
('Formación sociocultural IV', 4, 4),
('Taller de investigación IV', 4, 4),
('Estadía en empresa', 4, 5);

-- Insert into materias para Mecatrónica
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
-- Técnico Superior Universitario en Mecatrónica
('Matemáticas', 5, 1),
('Física', 5, 1),
('Química', 5, 1),
('Dibujo industrial', 5, 1),
('Informática', 5, 1),
('Formación sociocultural I', 5, 1),
('Inglés I', 5, 1),
('Desarrollo Sustentable', 5, 1),
('Álgebra', 5, 2),
('Estática', 5, 2),
('Dinámica', 5, 2),
('Electricidad y magnetismo', 5, 2),
('Taller de investigación I', 5, 2),
('Formación sociocultural II', 5, 2),
('Inglés II', 5, 2),
('Probabilidad y estadística', 5, 3),
('Resistencia de materiales', 5, 3),
('Electrónica', 5, 3),
('Taller de investigación II', 5, 3),
('Formación sociocultural III', 5, 3),
('Inglés III', 5, 3),
('Diseño de elementos de máquinas', 5, 4),
('Sistemas hidráulicos y neumáticos', 5, 4),
('Microcontroladores', 5, 4),
('Automatización industrial', 5, 4),
('Mecatrónica I', 5, 4),
('Instrumentación', 5, 4),
('Taller de investigación III', 5, 4),
('Formación sociocultural IV', 5, 4),
('Inglés IV', 5, 4),
('Estadía en empresa', 5, 5);

-- Insert for Técnico Superior Universitario en Desarrollo de Software Multiplataforma
INSERT INTO materias (nombre_materia, fk_carrera, cuatri_materia) VALUES
('Álgebra Lineal', 6, 1),
('Desarrollo de habilidades de pensamiento lógico', 6, 1),
('Fundamentos de TI', 6, 1),
('Fundamentos de redes', 6, 1),
('Metodología de la programación', 6, 1),
('Expresión oral y escrita I', 6, 1),
('Inglés I', 6, 1),
('Formación sociocultural I', 6, 1),
('Funciones matemáticas', 6, 2),
('Metodologías de desarrollo de software', 6, 2),
('Interconexión de redes', 6, 2),
('Programación orientada a objetos', 6, 2),
('Introducción al diseño digital', 6, 2),
('Base de datos', 6, 2),
('Inglés II', 6, 2),
('Formación sociocultural II', 6, 2),
('Cálculo diferencial', 6, 3),
('Probabilidad y estadística', 6, 3),
('Sistemas operativos', 6, 3),
('Integradora I', 6, 3),
('Aplicaciones WEB', 6, 3),
('Bases de datos para aplicaciones', 6, 3),
('Inglés III', 6, 3),
('Formación sociocultural III', 6, 3),
('Estándares y métricas para el desarrollo de software', 6, 4),
('Principios para IoT', 6, 4),
('Diseño de APPS', 6, 4),
('Estructura de datos aplicadas', 6, 4),
('Aplicaciones WEB orientadas a servicios', 6, 4),
('Evaluación y mejora para el desarrollo de software', 6, 4),
('Inglés IV', 6, 4),
('Formación sociocultural IV', 6, 4),
('Aplicaciones de IoT', 6, 5),
('Desarrollo móvil multiplataforma', 6, 5),
('Integradora II', 6, 5),
('Aplicaciones WEB para I4.0', 6, 5),
('Bases de datos para cómputo en la nube', 6, 5),
('Inglés V', 6, 5),
('Expresión oral y escrita II', 6, 5),
('Estadía en empresa', 6, 6);


-- Insert into cuatrimestre para Energías Renovables
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(1, 1, 1), (2, 1, 1), (3, 1, 1), (4, 1, 1), (5, 1, 1), (6, 1, 1), (7, 1, 1), (8, 1, 1), (9, 1, 1),
(10, 1, 2), (11, 1, 2), (12, 1, 2), (13, 1, 2), (14, 1, 2), (15, 1, 2), (16, 1, 2), (17, 1, 2),
(18, 1, 3), (19, 1, 3), (20, 1, 3), (21, 1, 3), (22, 1, 3), (23, 1, 3), (24, 1, 3), (25, 1, 3), (26, 1, 3),
(27, 1, 4), (28, 1, 4), (29, 1, 4), (30, 1, 4), (31, 1, 4), (32, 1, 4), (33, 1, 4), (34, 1, 4), (35, 1, 4),
(36, 1, 5), (37, 1, 5), (38, 1, 5), (39, 1, 5), (40, 1, 5), (41, 1, 5), (42, 1, 5), (43, 1, 5), (44, 1, 5),
(45, 1, 6),
(46, 1, 7), (47, 1, 7), (48, 1, 7), (49, 1, 7), (50, 1, 7), (51, 1, 7), 
(52, 1, 8), (53, 1, 8), (54, 1, 8), (55, 1, 8), (56, 1, 8), (57, 1, 8),
(58, 1, 9), (59, 1, 9), (60, 1, 9), (61, 1, 9), (62, 1, 9), (63, 1, 9),
(64, 1, 10), (65, 1, 10), (66, 1, 10), (67, 1, 10), (68, 1, 10), (69, 1, 10),
(70, 1, 11);

-- Insert into cuatrimestre para Procesos Industriales
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(71, 2, 1), (72, 2, 1), (73, 2, 1), (74, 2, 1), (75, 2, 1), (76, 2, 1), (77, 2, 1), (78, 2, 1), (79, 2, 1),
(80, 2, 2), (81, 2, 2), (82, 2, 2), (83, 2, 2), (84, 2, 2), (85, 2, 2), (86, 2, 2), (87, 2, 2),
(88, 2, 3), (89, 2, 3), (90, 2, 3), (91, 2, 3), (92, 2, 3), (93, 2, 3), (94, 2, 3), (95, 2, 3), (96, 2, 3),
(97, 2, 4), (98, 2, 4), (99, 2, 4), (100, 2, 4), (101, 2, 4), (102, 2, 4), (103, 2, 4), (104, 2, 4), (105, 2, 4),
(106, 2, 5), (107, 2, 5), (108, 2, 5), (109, 2, 5), (110, 2, 5), (111, 2, 5), (112, 2, 5), (113, 2, 5), (114, 2, 5),
(115, 2, 6),
(116, 2, 7), (117, 2, 7), (118, 2, 7), (119, 2, 7), (120, 2, 7), (121, 2, 7), 
(122, 2, 8), (123, 2, 8), (124, 2, 8), (125, 2, 8), (126, 2, 8), (127, 2, 8),
(128, 2, 9), (129, 2, 9), (130, 2, 9), (131, 2, 9), (132, 2, 9), (133, 2, 9),
(134, 2, 10), (135, 2, 10), (136, 2, 10), (137, 2, 10), (138, 2, 10), (139, 2, 10),
(140, 2, 11);

-- Insert into cuatrimestre para Desarrollo de Negocios
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(141, 3, 1), (142, 3, 1), (143, 3, 1), (144, 3, 1), (145, 3, 1), (146, 3, 1), (147, 3, 1), (148, 3, 1),
(149, 3, 2), (150, 3, 2), (151, 3, 2), (152, 3, 2), (153, 3, 2), (154, 3, 2), (155, 3, 2), (156, 3, 2),
(157, 3, 3), (158, 3, 3), (159, 3, 3), (160, 3, 3), (161, 3, 3), (162, 3, 3), (163, 3, 3), (164, 3, 3),
(165, 3, 4), (166, 3, 4), (167, 3, 4), (168, 3, 4), (169, 3, 4), (170, 3, 4), (171, 3, 4), (172, 3, 4),
(173, 3, 5), (174, 3, 5), (175, 3, 5), (176, 3, 5), (177, 3, 5), (178, 3, 5), (179, 3, 5),
(180, 3, 6),
(181, 3, 7), (182, 3, 7), (183, 3, 7), (184, 3, 7), (185, 3, 7),
(186, 3, 8), (187, 3, 8), (188, 3, 8), (189, 3, 8), (190, 3, 8), (191, 3, 8),
(192, 3, 9), (193, 3, 9), (194, 3, 9), (195, 3, 9), (196, 3, 9), (197, 3, 9),
(198, 3, 10), (199, 3, 10), (200, 3, 10), (201, 3, 10), (202, 3, 10), (203, 3, 10),
(204, 3, 11);

-- Insert into cuatrimestre para Mantenimiento Industrial
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(205, 4, 1), (206, 4, 1), (207, 4, 1), (208, 4, 1), (209, 4, 1), (210, 4, 1), (211, 4, 1), (212, 4, 1),
(213, 4, 2), (214, 4, 2), (215, 4, 2), (216, 4, 2), (217, 4, 2), (218, 4, 2), (219, 4, 2), (220, 4, 2),
(221, 4, 3), (222, 4, 3), (223, 4, 3), (224, 4, 3), (225, 4, 3), (226, 4, 3), (227, 4, 3), (228, 4, 3),
(229, 4, 4), (230, 4, 4), (231, 4, 4), (232, 4, 4), (233, 4, 4), (234, 4, 4), (235, 4, 4), (236, 4, 4),
(237, 4, 5);

-- Insert into cuatrimestre para Mecatrónica
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(238, 5, 1), (239, 5, 1), (240, 5, 1), (241, 5, 1), (242, 5, 1), (243, 5, 1), (244, 5, 1), (245, 5, 1),
(246, 5, 2), (247, 5, 2), (248, 5, 2), (249, 5, 2), (250, 5, 2), (251, 5, 2), (252, 5, 2),
(253, 5, 3), (254, 5, 3), (255, 5, 3), (256, 5, 3), (257, 5, 3), (258, 5, 3), (259, 5, 3),
(260, 5, 4), (261, 5, 4), (262, 5, 4), (263, 5, 4), (264, 5, 4), (265, 5, 4), (266, 5, 4),
(267, 5, 5);

-- Insert into cuatrimestre para TI
INSERT INTO cuatrimestre (fk_materia, fk_carrera, numero_cuatrimestre) VALUES
(141, 6, 1), (142, 6, 1), (143, 6, 1), (144, 6, 1), (145, 6, 1), (146, 6, 1), (147, 6, 1), (148, 6, 1),
(149, 6, 2), (150, 6, 2), (151, 6, 2), (152, 6, 2), (153, 6, 2), (154, 6, 2), (155, 6, 2), (156, 6, 2),
(157, 6, 3), (158, 6, 3), (159, 6, 3), (160, 6, 3), (161, 6, 3), (162, 6, 3), (163, 6, 3), (164, 6, 3),
(165, 6, 4), (166, 6, 4), (167, 6, 4), (168, 6, 4), (169, 6, 4), (170, 6, 4), (171, 6, 4), (172, 6, 4),
(173, 6, 5), (174, 6, 5), (175, 6, 5), (176, 6, 5), (177, 6, 5), (178, 6, 5), (179, 6, 5),
(180, 6, 6);

-- Insert into asesores
INSERT INTO asesores (nombre_asesor, fk_carrera, fk_materia, disponibilidad, correoA, precio_asesoria, fecha_registro, contraseña) VALUES
('Carlos Ramirez', 1, 1, 'Lunes a Viernes', 'carlos.ramirez@utch.edu.mx', 300.00, '2023-01-01', 'carlos123'),
('Lucia Gomez', 2, 2, 'Lunes a Viernes', 'lucia.gomez@utch.edu.mx', 350.00, '2023-01-02', 'lucia123'),
('Miguel Sanchez', 3, 3, 'Lunes a Viernes', 'miguel.sanchez@utch.edu.mx', 400.00, '2023-01-03', 'miguel123'),
('Ana Torres', 4, 4, 'Lunes a Viernes', 'ana.torres@utch.edu.mx', 250.00, '2023-01-04', 'ana123'),
('Jose Perez', 5, 5, 'Lunes a Viernes', 'jose.perez@utch.edu.mx', 300.00, '2023-01-05', 'jose123'),
('Maria Lopez', 1, 6, 'Lunes a Viernes', 'maria.lopez@utch.edu.mx', 320.00, '2023-01-06', 'maria123'),
('Pedro Hernandez', 2, 7, 'Lunes a Viernes', 'pedro.hernandez@utch.edu.mx', 310.00, '2023-01-07', 'pedro123'),
('Sandra Ruiz', 3, 8, 'Lunes a Viernes', 'sandra.ruiz@utch.edu.mx', 330.00, '2023-01-08', 'sandra123'),
('Luis Garcia', 4, 9, 'Lunes a Viernes', 'luis.garcia@utch.edu.mx', 340.00, '2023-01-09', 'luis123'),
('Rosa Fernandez', 5, 10, 'Lunes a Viernes', 'rosa.fernandez@utch.edu.mx', 360.00, '2023-01-10', 'rosa123'),
('Juan Martinez', 1, 11, 'Lunes a Viernes', 'juan.martinez@utch.edu.mx', 370.00, '2023-01-11', 'juan123'),
('Laura Ortiz', 2, 12, 'Lunes a Viernes', 'laura.ortiz@utch.edu.mx', 380.00, '2023-01-12', 'laura123'),
('Roberto Diaz', 3, 13, 'Lunes a Viernes', 'roberto.diaz@utch.edu.mx', 390.00, '2023-01-13', 'roberto123'),
('Paula Chavez', 4, 14, 'Lunes a Viernes', 'paula.chavez@utch.edu.mx', 410.00, '2023-01-14', 'paula123'),
('Francisco Castillo', 5, 15, 'Lunes a Viernes', 'francisco.castillo@utch.edu.mx', 420.00, '2023-01-15', 'francisco123'),
('Carmen Ramos', 1, 16, 'Lunes a Viernes', 'carmen.ramos@utch.edu.mx', 430.00, '2023-01-16', 'carmen123'),
('Andres Morales', 2, 17, 'Lunes a Viernes', 'andres.morales@utch.edu.mx', 440.00, '2023-01-17', 'andres123'),
('Isabel Vega', 3, 18, 'Lunes a Viernes', 'isabel.vega@utch.edu.mx', 450.00, '2023-01-18', 'isabel123'),
('Victor Soto', 4, 19, 'Lunes a Viernes', 'victor.soto@utch.edu.mx', 460.00, '2023-01-19', 'victor123'),
('Patricia Medina', 5, 20, 'Lunes a Viernes', 'patricia.medina@utch.edu.mx', 470.00, '2023-01-20', 'patricia123');

-- Insert into Estudiantes
INSERT INTO estudiantes (nombre_estudiante, fk_carrera, fk_materia, correo_estudiante, contraseña_estudiante, fecha_registro) VALUES
('Daniela Torres', 1, 1, 'daniela.torres@utch.edu.mx', 'daniela123', '2023-02-01'),
('Mario Gutierrez', 2, 2, 'mario.gutierrez@utch.edu.mx', 'mario123', '2023-02-02'),
('Claudia Sanchez', 3, 3, 'claudia.sanchez@utch.edu.mx', 'claudia123', '2023-02-03'),
('Enrique Morales', 4, 4, 'enrique.morales@utch.edu.mx', 'enrique123', '2023-02-04'),
('Lucia Fernandez', 5, 5, 'lucia.fernandez@utch.edu.mx', 'lucia123', '2023-02-05'),
('Diego Ramirez', 1, 6, 'diego.ramirez@utch.edu.mx', 'diego123', '2023-02-06'),
('Sofia Vargas', 2, 7, 'sofia.vargas@utch.edu.mx', 'sofia123', '2023-02-07'),
('Fernando Martinez', 3, 8, 'fernando.martinez@utch.edu.mx', 'fernando123', '2023-02-08'),
('Valeria Cruz', 4, 9, 'valeria.cruz@utch.edu.mx', 'valeria123', '2023-02-09'),
('Jorge Herrera', 5, 10, 'jorge.herrera@utch.edu.mx', 'jorge123', '2023-02-10'),
('Marta Alvarez', 1, 11, 'marta.alvarez@utch.edu.mx', 'marta123', '2023-02-11'),
('Luis Mendoza', 2, 12, 'luis.mendoza@utch.edu.mx', 'luis123', '2023-02-12'),
('Raquel Romero', 3, 13, 'raquel.romero@utch.edu.mx', 'raquel123', '2023-02-13'),
('Hector Reyes', 4, 14, 'hector.reyes@utch.edu.mx', 'hector123', '2023-02-14'),
('Silvia Diaz', 5, 15, 'silvia.diaz@utch.edu.mx', 'silvia123', '2023-02-15'),
('Arturo Gonzalez', 1, 16, 'arturo.gonzalez@utch.edu.mx', 'arturo123', '2023-02-16'),
('Monica Delgado', 2, 17, 'monica.delgado@utch.edu.mx', 'monica123', '2023-02-17'),
('Antonio Ramos', 3, 18, 'antonio.ramos@utch.edu.mx', 'antonio123', '2023-02-18'),
('Elena Navarro', 4, 19, 'elena.navarro@utch.edu.mx', 'elena123', '2023-02-19'),
('Pablo Ruiz', 5, 20, 'pablo.ruiz@utch.edu.mx', 'pablo123', '2023-02-20');

-- Insert into costos
INSERT INTO costo (precio, fk_materia) VALUES
(100.00, 1),
(200.00, 2),
(300.00, 3),
(400.00, 4),
(500.00, 5),
(600.00, 6),
(700.00, 7),
(800.00, 8),
(900.00, 9),
(1000.00, 10),
(1100.00, 11),
(1200.00, 12),
(1300.00, 13),
(1400.00, 14),
(1500.00, 15),
(1600.00, 16),
(1700.00, 17),
(1800.00, 18),
(1900.00, 19),
(2000.00, 20);

-- Insert into asesorias
INSERT INTO asesorias (fk_materia, fk_asesor, fk_estudiante, fecha_asesoria, fk_costo, duracion_asesoria) VALUES
(1, 1, 1, '2023-06-01', 1, 60),
(2, 2, 2, '2023-06-02', 2, 90),
(3, 3, 3, '2023-06-03', 3, 120),
(4, 4, 4, '2023-06-04', 4, 60),
(5, 5, 5, '2023-06-05', 5, 90),
(6, 6, 6, '2023-06-06', 6, 120),
(7, 7, 7, '2023-06-07', 7, 60),
(8, 8, 8, '2023-06-08', 8, 90),
(9, 9, 9, '2023-06-09', 9, 120),
(10, 10, 10, '2023-06-10', 10, 60),
(11, 11, 11, '2023-06-11', 11, 90),
(12, 12, 12, '2023-06-12', 12, 120),
(13, 13, 13, '2023-06-13', 13, 60),
(14, 14, 14, '2023-06-14', 14, 90),
(15, 15, 15, '2023-06-15', 15, 120),
(16, 16, 16, '2023-06-16', 16, 60),
(17, 17, 17, '2023-06-17', 17, 90),
(18, 18, 18, '2023-06-18', 18, 120),
(19, 19, 19, '2023-06-19', 19, 60),
(20, 20, 20, '2023-06-20', 20, 90);

