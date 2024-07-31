document.addEventListener('DOMContentLoaded', function() {
    const nombreForm = document.getElementById('nombreForm');
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
    let currentSlide = 0;
    let cropper;
    let isAsesor = false;
    let coverPhotoSelected = false;

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
            return nombre !== '' && apellido !== '';
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
            if (nombre === '') showError('nombreError', 'El nombre es obligatorio.');
            if (apellido === '') showError('apellidoError', 'El apellido es obligatorio.');
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
        updateSlide();
    });

    asesoradoBtn.addEventListener('click', function() {
        asesoradoBtn.classList.add('selected');
        asesorBtn.classList.remove('selected');
        isAsesor = false;
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
                showCropperModal(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function showCropperModal(imageSrc) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.maxHeight = '90%';
        modalContent.style.overflow = 'auto';

        const cropperImage = document.createElement('img');
        cropperImage.src = imageSrc;
        cropperImage.style.maxWidth = '100%';
        cropperImage.style.display = 'block';

        const cropButton = document.createElement('button');
        cropButton.textContent = 'Guardar';
        cropButton.style.marginTop = '10px';
        cropButton.style.padding = '10px 20px';
        cropButton.style.backgroundColor = '#006AD7';
        cropButton.style.color = 'white';
        cropButton.style.border = 'none';
        cropButton.style.borderRadius = '5px';
        cropButton.style.cursor = 'pointer';

        modalContent.appendChild(cropperImage);
        modalContent.appendChild(cropButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
            responsive: true,
        });

        cropButton.addEventListener('click', function() {
            const croppedCanvas = cropper.getCroppedCanvas();
            avatarPreview.src = croppedCanvas.toDataURL('image/jpeg');
            document.body.removeChild(modal);
            cropper.destroy();
        });
    }

    createUserBtn.addEventListener('click', function() {
        if (validateSection()) {
            console.log('Usuario creado exitosamente');
            // Aquí puedes agregar la lógica para enviar los datos del formulario
        } else {
            showSectionErrors();
        }
    });

    galleryItems.forEach(item => {
        const radio = item.querySelector('input[type="radio"]');
        const img = item.querySelector('img');

        img.addEventListener('click', function() {
            radio.checked = true;
            coverPhotoSelected = true;
            updateCoverPhotoSelection();
        });

        radio.addEventListener('change', function() {
            coverPhotoSelected = true;
            updateCoverPhotoSelection();
        });
    });

    function updateCoverPhotoSelection() {
        galleryItems.forEach(item => {
            const radio = item.querySelector('input[type="radio"]');
            item.classList.toggle('selected', radio.checked);
        });

        coverPhotoSelected = Array.from(galleryItems).some(item => item.querySelector('input[type="radio"]').checked);

        nextArrow.style.pointerEvents = coverPhotoSelected ? 'auto' : 'none';
        nextArrow.style.opacity = coverPhotoSelected ? '1' : '0.5';
    }

    updateSlide();
});