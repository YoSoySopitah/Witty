document.addEventListener('DOMContentLoaded', () => {
    const opc1 = document.querySelector('.opc1');
    const opc2 = document.querySelector('.opc2');
    const opc3 = document.querySelector('.opc3');

    opc1.addEventListener('click', mostrarInformacion);
    opc2.addEventListener('click', mostrarFormulario);
    opc3.addEventListener('click', mostrarCitasAgendadas);

    function mostrarInformacion(event) {
        event.preventDefault(); 

        const userData = document.getElementById('user-data');
        const nombreUsuario = userData.getAttribute('data-nombre-usuario');
        const correo = userData.getAttribute('data-correo');
        const carrera = userData.getAttribute('data-carrera');
        const disponibilidad = userData.getAttribute('data-disponibilidad');

        const contenido = `
            <div class="containerinfo">
                <div class="informacion">
                    <h1 class="i1">Nombre:</h1>
                    <h1 class="i1" id="bk">${nombreUsuario}</h1>
                    <h1 class="i2">Correo:</h1>
                    <h1 class="i2" id="bk">${correo}</h1>
                    <h1 class="i1">Carrera:</h1>
                    <h1 class="i1" id="bk">${carrera}</h1>
                    <h1 class="i2">Horario:</h1>
                    <h1 class="i2" id="bk">${disponibilidad}</h1>
                </div>
                <div class="fotoasesor">
                    <img src="https://pbs.twimg.com/profile_images/1734712433799774208/xVVE-2vF_400x400.jpg" alt="">
                </div>
            </div>
        `;

        document.getElementById('contenido-dinamico').innerHTML = contenido;
    }

    function mostrarFormulario(event) {
        event.preventDefault(); 

        const idAsesor = document.getElementById('contenido-dinamico').getAttribute('data-asesor-id'); 

        fetch(`/api/materias-asesor/${idAsesor}`)
            .then(response => response.json())
            .then(data => {
                console.log(data); 

                const primerRegistro = Array.isArray(data) ? data[0] : data;

                const formulario = `
                    <div class="asesoriasi">
                        <div class="asesoriainfo">
                            <h1>${primerRegistro.nombreAsesor}</h1>
                            <h2>Carrera:</h2>
                            <h2>${primerRegistro.nombreCarrera}</h2>
                            <h2>Precio:</h2>
                            <h2>${primerRegistro.precio}</h2>
                            <h2>Materia:</h2>
                            <h2>${primerRegistro.nombreMateria}</h2>
                            <h2>Horario:</h2>
                            <h2>${primerRegistro.disponibilidad}</h2>
                        </div>
                        <div class="asesoriainfo">
                            <div class="asesoriaadd">
                                <img src="https://i.imgur.com/lR7c7Ee.png" alt="">
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('contenido-dinamico').innerHTML = formulario;

                // Agregar el evento de clic al div
                document.querySelector('.asesoriaadd').addEventListener('click', abrirModal);
            })
            .catch(error => {
                console.error('Error al obtener datos:', error);
            });
    }

    function mostrarCitasAgendadas(event) {
        event.preventDefault(); 

        const citas = `
            <!-- Contenido de citas agendadas -->
        `;

        document.getElementById('contenido-dinamico').innerHTML = citas;
    }

    function abrirModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'block';

        // Cargar las carreras cuando se abra el modal
        loadCarreras();

        // Agregar el evento de clic al botón de cerrar
        document.querySelector('.close').addEventListener('click', cerrarModal);

        // Cerrar el modal si se hace clic fuera del contenido del modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                cerrarModal();
            }
        });
    }

    function cerrarModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    function loadCarreras() {
        fetch('/api/carreras')
            .then(response => response.json())
            .then(carreras => {
                const carreraSelect = document.getElementById('carrera');
                carreraSelect.innerHTML = '<option value="" disabled selected>Seleccione una carrera</option>';
                carreras.forEach(carrera => {
                    const option = document.createElement('option');
                    option.value = carrera.id_carrera;
                    option.textContent = carrera.nombre_carrera;
                    carreraSelect.appendChild(option);
                });
                carreraSelect.addEventListener('change', loadCuatrimestres);
            })
            .catch(error => {
                console.error('Error al cargar las carreras:', error);
            });
    }

    function loadCuatrimestres() {
        const carreraId = document.getElementById('carrera').value;
        fetch(`/api/cuatrimestres?carreraId=${carreraId}`)
            .then(response => response.json())
            .then(cuatrimestres => {
                const cuatrimestreSelect = document.getElementById('cuatrimestre');
                cuatrimestreSelect.innerHTML = '<option value="" disabled selected>Seleccione un cuatrimestre</option>';
                cuatrimestres.forEach(cuatrimestre => {
                    const option = document.createElement('option');
                    option.value = cuatrimestre.numero_cuatrimestre;
                    option.textContent = cuatrimestre.numero_cuatrimestre;
                    cuatrimestreSelect.appendChild(option);
                });
                cuatrimestreSelect.addEventListener('change', loadMaterias);
            })
            .catch(error => {
                console.error('Error al cargar los cuatrimestres:', error);
            });
    }

    function loadMaterias() {
        const carreraId = document.getElementById('carrera').value;
        const cuatrimestre = document.getElementById('cuatrimestre').value;
        fetch(`/api/materias?carreraId=${carreraId}&cuatrimestre=${cuatrimestre}`)
            .then(response => response.json())
            .then(materias => {
                const materiaSelect = document.getElementById('materia');
                materiaSelect.innerHTML = '<option value="" disabled selected>Seleccione una materia</option>';
                materias.forEach(materia => {
                    const option = document.createElement('option');
                    option.value = materia.id_materia;
                    option.textContent = materia.nombre_materia;
                    materiaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar las materias:', error);
            });
    }
});
