const password = document.getElementById("password");

const toggle = document.getElementById("togglePassword");

toggle.addEventListener("click",()=>{

    if(password.type==="password"){

        password.type="text";

        toggle.innerHTML="🙈";

    }else{

        password.type="password";

        toggle.innerHTML="👁";

    }

});

const form=document.querySelector("form");

const boton=document.getElementById("btnLogin");

const texto=document.getElementById("btnText");

form.addEventListener("submit",()=>{

    boton.disabled=true;

    texto.innerHTML="Ingresando...";

});