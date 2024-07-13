en server.js tenemos todas las rutas y lo necesario para nuestro proyecto:
1.-tenemos configurado nuestro server para manejar nuestra pagina por vistas
2.-tenemos nuestras rutas:
/login 
.-es para manaejar el login de el usuario, si el usuario es
asesor lo manda a la vista asesor home y si no, lo manda a estudiante-home
/register
.-Pide todos los datos para el registro de un usuario, como
el tipo de usuario, para agregar una foto de perfil y datos personales
/register-info
.-Aqui nos sirve para lo que decia anterior mente, para pedir apellido nombres y correo y tipo de usuario

Luego tenemos 3 API's cada una para llamar a maneria cuatrimestre y carrera de la UTCH
Despues tambien tenemos API's para obtener asesores y vistas como la del asesor como estudiante,
y de ultimo tenemos para mandar un mensaje al inicio del servidor
