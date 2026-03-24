/* LOGIN */

function login(){

const usuario=document.getElementById("usuario").value;
const senha=document.getElementById("senha").value;

const usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

const user=usuarios.find(u=>u.usuario===usuario && u.senha===senha);

if(user){

localStorage.setItem("logado","true");

window.location.href="patinete.html";

}else{

alert("Usuário ou senha incorretos");

}

}


/* MOSTRAR CADASTRO */

function mostrarCadastro(){

document.getElementById("titulo").innerText="Cadastro";

document.getElementById("camposLogin").innerHTML=`

<input id="nome" placeholder="Nome completo">
<input id="telefone" placeholder="Telefone">
<input id="email" placeholder="Email">
<input id="cpf" placeholder="CPF">
<input id="usuario" placeholder="Usuário">
<input type="password" id="senha" placeholder="Senha">

`;

document.getElementById("btnAcao").innerText="Cadastrar";

document.getElementById("btnAcao").onclick=cadastrar;

document.getElementById("linkTroca").innerText="Voltar para login";

document.getElementById("linkTroca").onclick=()=>location.reload();

}


/* CADASTRO */

function cadastrar(){

const nome=document.getElementById("nome").value;
const telefone=document.getElementById("telefone").value;
const email=document.getElementById("email").value;
const cpf=document.getElementById("cpf").value;
const usuario=document.getElementById("usuario").value;
const senha=document.getElementById("senha").value;

if(!nome||!telefone||!email||!cpf||!usuario||!senha){

alert("Preencha todos os campos");
return;

}

let usuarios=JSON.parse(localStorage.getItem("usuarios"))||[];

if(usuarios.find(u=>u.usuario===usuario)){

alert("Usuário já existe");
return;

}

usuarios.push({
nome,
telefone,
email,
cpf,
usuario,
senha
});

localStorage.setItem("usuarios",JSON.stringify(usuarios));

alert("Cadastro realizado com sucesso!");

location.reload();

}


/* ENTER FAZ LOGIN */

document.addEventListener("keypress", function(e){

if(e.key === "Enter"){

document.getElementById("btnAcao").click();

}

});