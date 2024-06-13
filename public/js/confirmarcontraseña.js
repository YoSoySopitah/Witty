function validateForm() {
    const password = document.getElementById("rcontraseña").value;
    const confirmPassword = document.getElementById("confirmar_contraseña").value;
    const errorMessage = document.getElementById("error-message");
    
    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.style.display = "none";
    }
    return true;
}