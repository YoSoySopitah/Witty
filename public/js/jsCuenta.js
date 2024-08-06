document.addEventListener('DOMContentLoaded', function() {
    // Definición de variables
    const nombreForm = document.getElementById('registro-form'); // Asegúrate de usar el ID correcto
    const nextArrow = document.getElementById('nextArrow');
    const prevArrow = document.getElementById('prevArrow');
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('.content');
    const uploadButton = document.getElementById('uploadButton');
    const photoUpload = document.getElementById('photoUpload');
    const avatarPreview = document.getElementById('avatarPreview');
    const asesorBtn = document.getElementById('asesorBtn');
    const asesoradoBtn = document.getElementById('asesoradoBtn');
    const createUserBtn = document.getElementById('createUserBtn');
    const coverPhotoSection = document.getElementById('coverPhotoSection');
    const galleryItems = coverPhotoSection.querySelectorAll('.gallery-item');
    const carreraSelect = document.getElementById('carrera'); // Selección de carrera
    let currentSlide = 0;
    let cropper;
    let isAsesor = false;
    let coverPhotoSelected = false;
    let selectedCoverPhoto = null;
    let formData = new FormData();

    // Funciones de manejo de errores
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    }

    function showError(messageId, message) {
        const errorElement = document.getElementById(messageId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function validateSection() {
        clearErrors();
        const currentSection = sections[currentSlide];

        if (currentSlide === 0) {
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            let valid = nombre !== '' && apellido !== '' && email !== '' && password !== '' && confirmPassword !== '';
            
            if (valid) {
                valid = password === confirmPassword;
            }
            
            if (!valid) {
                if (nombre === '') showError('nombreError', 'El nombre es obligatorio.');
                if (apellido === '') showError('apellidoError', 'El apellido es obligatorio.');
                if (email === '') showError('emailError', 'El correo electrónico es obligatorio.');
                if (password === '') showError('passwordError', 'La contraseña es obligatoria.');
                if (confirmPassword === '') showError('confirmPasswordError', 'La confirmación de la contraseña es obligatoria.');
                if (password !== confirmPassword) showError('confirmPasswordError', 'Las contraseñas no coinciden.');
            }
            
            return valid;
        } else if (currentSlide === 1) {
            return asesorBtn.classList.contains('selected') || asesoradoBtn.classList.contains('selected');
        } else if (currentSlide === 2 && isAsesor) {
            const textarea = currentSection.querySelector('textarea');
            return textarea && textarea.value.trim() !== '';
        } else if (currentSlide === 3 || (currentSlide === 2 && !isAsesor)) {
            return coverPhotoSelected;
        } else if (currentSlide === 4 || (currentSlide === 3 && !isAsesor)) {
            return avatarPreview.src && !avatarPreview.src.endsWith('Perfil.png');
        }
        return true;
    }

    function showSectionErrors() {
        if (currentSlide === 0) {
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (nombre === '') showError('nombreError', 'El nombre es obligatorio.');
            if (apellido === '') showError('apellidoError', 'El apellido es obligatorio.');
            if (email === '') showError('emailError', 'El correo electrónico es obligatorio.');
            if (password === '') showError('passwordError', 'La contraseña es obligatoria.');
            if (confirmPassword === '') showError('confirmPasswordError', 'La confirmación de la contraseña es obligatoria.');
            if (password !== confirmPassword) showError('confirmPasswordError', 'Las contraseñas no coinciden.');
        } else if (currentSlide === 1) {
            if (!(asesorBtn.classList.contains('selected') || asesoradoBtn.classList.contains('selected'))) {
                showError('userTypeError', 'Selecciona un tipo de usuario.');
            }
        } else if (currentSlide === 2 && isAsesor) {
            const textarea = sections[currentSlide].querySelector('textarea');
            if (textarea && textarea.value.trim() === '') {
                showError('presentationError', 'El texto de presentación es obligatorio para asesores.');
            }
        } else if (currentSlide === 3 || (currentSlide === 2 && !isAsesor)) {
            if (!coverPhotoSelected) {
                showError('coverPhotoError', 'Selecciona una foto de portada.');
            }
        } else if (currentSlide === 4 || (currentSlide === 3 && !isAsesor)) {
            if (!avatarPreview.src || avatarPreview.src.endsWith('Perfil.png')) {
                showError('photoUploadError', 'Por favor, suba su foto.');
            }
        }
    }

    function updateSlide() {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
        
        sections.forEach(section => section.classList.add('hidden'));

        sections[currentSlide].classList.remove('hidden');
        sections[currentSlide].classList.add('slide-in');
        
        prevArrow.style.display = currentSlide === 0 ? 'none' : 'flex';
        nextArrow.style.display = currentSlide === dots.length - 1 ? 'none' : 'flex';

        dots[2].style.display = isAsesor ? 'block' : 'none';

        if (currentSlide === 3 || (currentSlide === 2 && !isAsesor)) {
            updateCoverPhotoSelection();
        }
    }

    function moveToSlide(index) {
        if (Math.abs(index - currentSlide) !== 1) {
            return;
        }

        if (validateSection()) {
            const currentSection = sections[currentSlide];
            const isMovingForward = index > currentSlide;

            currentSection.classList.add(isMovingForward ? 'slide-out-left' : 'slide-out-right');

            setTimeout(() => {
                if (!isAsesor) {
                    if (currentSlide === 1 && index === 2) {
                        index = 3;
                    } else if (currentSlide === 3 && index === 2) {
                        index = 1;
                    }
                }

                currentSlide = index;
                updateSlide();
                currentSection.classList.remove('slide-out-left', 'slide-out-right');
            }, 300);
        } else {
            showSectionErrors();
        }
    }

    nextArrow.addEventListener('click', function(event) {
        event.preventDefault();
        moveToSlide((currentSlide + 1) % dots.length);
    });

    prevArrow.addEventListener('click', function(event) {
        event.preventDefault();
        moveToSlide((currentSlide - 1 + dots.length) % dots.length);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(event) {
            event.preventDefault();
            // No hacer nada cuando se hace clic en los puntos
        });
    });

    asesorBtn.addEventListener('click', function() {
        asesorBtn.classList.add('selected');
        asesoradoBtn.classList.remove('selected');
        isAsesor = true;
        document.getElementById('userTypeInput').value = 'asesor';
        updateSlide();
    });
    
    asesoradoBtn.addEventListener('click', function() {
        asesoradoBtn.classList.add('selected');
        asesorBtn.classList.remove('selected');
        isAsesor = false;
        document.getElementById('userTypeInput').value = 'estudiante';
        updateSlide();
    });

    uploadButton.addEventListener('click', function() {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
                formData.append('photoUpload', file);
                showCropperModal(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function showCropperModal(imageSrc) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        
        const cropperImage = document.createElement('img');
        cropperImage.src = imageSrc;
        modalContent.appendChild(cropperImage);

        const cropButton = document.createElement('button');
        cropButton.textContent = 'Recortar';
        cropButton.addEventListener('click', function() {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas();
                canvas.toBlob(function(blob) {
                    const file = new File([blob], 'avatar.png', { type: 'image/png' });
                    formData.append('photoUpload', file);
                    avatarPreview.src = URL.createObjectURL(blob);
                    modal.remove();
                });
            }
        });
        modalContent.appendChild(cropButton);

        document.body.appendChild(modal);
        cropper = new Cropper(cropperImage);
    }

    function updateCoverPhotoSelection() {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                selectedCoverPhoto = item.querySelector('img').src;
                coverPhotoSelected = true;
                galleryItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    function loadCarreras() {
        fetch('/api/carreras')
            .then(response => response.json())
            .then(carreras => {
                carreraSelect.innerHTML = ''; // Limpiar las opciones existentes

                carreras.forEach(carrera => {
                    const option = document.createElement('option');
                    option.value = carrera.id_carrera; // Asegúrate de que el campo en tu tabla sea id_carrera
                    option.textContent = carrera.nombre_carrera; // Asegúrate de que el campo en tu tabla sea nombre_carrera
                    carreraSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar las carreras:', error);
            });
    }

    createUserBtn.addEventListener('click', function() {
        // Recopilar datos del formulario y agregarlos a FormData
        formData.append('userType', isAsesor ? 'asesor' : 'estudiante');
        formData.append('nombre', document.getElementById('nombre').value.trim());
        formData.append('apellido', document.getElementById('apellido').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('password', document.getElementById('password').value.trim());
        formData.append('confirmPassword', document.getElementById('confirmPassword').value.trim());
        formData.append('presentationText', isAsesor ? document.querySelector('textarea').value.trim() : '');
        formData.append('coverPhoto', selectedCoverPhoto || '');
        formData.append('fk_carrera', carreraSelect.value || null); // Agregar valor de carrera
        formData.append('fecha_registro', null); // Establecer fecha_registro en null
    
        if (avatarPreview.src && !avatarPreview.src.endsWith('Perfil.png')) {
            fetch(avatarPreview.src)
                .then(res => res.blob())
                .then(blob => {
                    formData.append('photoUpload', blob, 'avatar.png');
                    return fetch('http://localhost:3000/register', {
                        method: 'POST',
                        body: formData
                    });
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Usuario creado exitosamente') {
                        alert('Usuario creado exitosamente.');
                        window.location.href = '/success';
                    } else {
                        alert('Error al crear el usuario: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al enviar el formulario:', error);
                    alert('Error en el envío del formulario. Por favor, intente nuevamente.');
                });
        } else {
            fetch('http://localhost:3000/register', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Usuario creado exitosamente') {
                    alert('Usuario creado exitosamente.');
                    window.location.href = '/success';
                } else {
                    alert('Error al crear el usuario: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error al enviar el formulario:', error);
                alert('Error en el envío del formulario. Por favor, intente nuevamente.');
            });
        }
    });

    loadCarreras(); // Cargar las carreras cuando el DOM esté listo
    updateSlide();
});
