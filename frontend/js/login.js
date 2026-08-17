const form = document.getElementById("formLogin")
const email = document.getElementById("email")                /*declaro variables que hacen referencias al form*/
const password = document.getElementById("password")


function validarEmail(valor) {
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regexEmail.test(valor);
}                                                            /*validacion del campo email y contraseña*/

function validarPassword(valor) {
return valor.trim().length > 0;
}


form.addEventListener("submit", function (evento) {
  evento.preventDefault();                                     //evita que la página se recargue

const email = inputEmail.value;
const password = inputPassword.value;

if (!validarEmail(email)) {
    alert("El email ingresado no es válido.");             //alertas para el usuario
    return;
}

if (!validarPassword(password)) {
    alert("La contraseña no puede estar vacía.");
    return;
}

console.log("Login válido:", email);                  //console.log para conectar luego con el backend
});