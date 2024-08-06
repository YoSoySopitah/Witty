document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('#register-form');
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(registerForm);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = '/'; // Redirigir al inicio después del registro
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema con el registro.');
        }
    });
});
