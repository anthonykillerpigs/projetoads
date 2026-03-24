function logout(){
    localStorage.removeItem("logado");
    window.location.href="login.html";
}

const STATUS = {
    LIVRE: "livre",
    LOCADO: "locado",
    MANUTENCAO: "manutencao",
    ATRASADO: "atrasado"
};

const PRECOS = {15:20, 30:30, 45:45};
const MULTA_POR_MINUTO = 1;

let bikes = [];
let relatorios = [];
let bloqueado = false;

try{
    bikes = JSON.parse(localStorage.getItem("bikes")) || [];
    relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];
}catch{
    bikes = [];
    relatorios = [];
}

function salvar(){
    localStorage.setItem("bikes", JSON.stringify(bikes));
}

function salvarRelatorios(){
    localStorage.setItem("relatorios", JSON.stringify(relatorios));
}

if(bikes.length === 0){
    criarPatinetes(6);
}

const grid = document.getElementById("grid");

function criarPatinetes(qtd){
    const ultimoId = bikes.length ? bikes[bikes.length-1].id : 0;

    for(let i=1;i<=qtd;i++){
        bikes.push({
            id: ultimoId+i,
            status: STATUS.LIVRE,
            cliente:"",
            telefone:"",
            pagamento:"",
            tempo:0,
            valorBase:0,
            inicio:null
        });
    }

    salvar();
}

function adicionarPatinetes(){
    bloqueado = true;
    const qtd = parseInt(prompt("Quantos patinetes deseja adicionar?"));
    bloqueado = false;

    if(!qtd || qtd<=0) return;

    criarPatinetes(qtd);
    render();
}

function removerPatinete(){

    bloqueado = true;
    const id = parseInt(prompt("Digite o número do patinete para remover:"));
    bloqueado = false;

    const index = bikes.findIndex(b => b.id === id);

    if(index === -1){
        alert("Patinete não encontrado.");
        return;
    }

    if(bikes[index].status !== STATUS.LIVRE){
        alert("Só pode remover patinete disponível.");
        return;
    }

    bikes.splice(index,1);

    salvar();

    render();
}

function atualizarContadores(){

    document.getElementById("qtdLivre").innerText =
    bikes.filter(b=>b.status===STATUS.LIVRE).length;

    document.getElementById("qtdLocado").innerText =
    bikes.filter(b=>b.status===STATUS.LOCADO || b.status===STATUS.ATRASADO).length;

    document.getElementById("qtdManutencao").innerText =
    bikes.filter(b=>b.status===STATUS.MANUTENCAO).length;

}

function calcularTempoRestante(bike){

    if(!bike.inicio) return 0;

    return (bike.inicio + bike.tempo*60000) - Date.now();

}

function calcularValorAtual(bike){

    const restante = calcularTempoRestante(bike);

    if(restante >= 0) return bike.valorBase;

    const atraso = Math.floor(Math.abs(restante)/60000);

    return bike.valorBase + (atraso * MULTA_POR_MINUTO);

}

function toggleAdminMenu(){

    const menu = document.getElementById("adminFloatMenu");

    menu.style.display =
    menu.style.display === "flex" ? "none" : "flex";

}

function render(){

    if(document.getElementById("modal").style.display==="flex" || bloqueado) return;

    grid.innerHTML="";

    bikes.forEach(b=>{

        const restante = calcularTempoRestante(b);

        if(b.status === STATUS.LOCADO && restante<=0){
            b.status = STATUS.ATRASADO;
        }

        const card = document.createElement("div");

        card.classList.add("bike","card-"+b.status);

        let html = `<h2>🛴 ${b.id}</h2><div class="modelo">Patinete ${b.id}</div>`;

        if(b.status === STATUS.LIVRE){

            html+=`<div>Disponível</div>`;

            card.onclick=()=>abrirOpcoes(b.id);

        }

        else if(b.status === STATUS.LOCADO || b.status === STATUS.ATRASADO){

            const min = Math.floor(Math.abs(restante)/60000);
            const seg = Math.floor((Math.abs(restante)%60000)/1000);

            html+=`

            <div><strong>${b.status==="ATRASADO"?"Atrasado":"Alugado"}</strong></div>

            <small><strong>Cliente:</strong> ${b.cliente}</small>

            <small><strong>Telefone:</strong> ${b.telefone}</small>

            <small><strong>Pagamento:</strong> ${b.pagamento}</small>

            <div class="timer">

            ${restante>=0?"⏱ Restante":"⚠ Atraso"}:
            ${min}:${seg.toString().padStart(2,"0")}

            </div>

            <div class="barra-tempo">

            <div class="barra-progresso"
            style="width:${Math.max(0,Math.min(100,(restante/(b.tempo*60000))*100))}%">

            </div>

            </div>
            `;

        }

        else if(b.status === STATUS.MANUTENCAO){

            html+=`<div>Em manutenção</div>`;

            card.onclick=()=>abrirFinalizarManutencao(b.id);

        }

        card.innerHTML = html;

        if(b.status === STATUS.LOCADO || b.status === STATUS.ATRASADO){

            const btn = document.createElement("button");

            btn.className="btn-finalizar";

            btn.innerHTML="✔ Finalizar";

            btn.addEventListener("click",function(e){

                e.stopPropagation();

                abrirFinalizarLocacao(b.id);

            });

            card.appendChild(btn);

        }

        grid.appendChild(card);

    });

    atualizarContadores();

    atualizarCards();

    salvar();

}

function abrirFinalizarLocacao(id){

    const b = bikes.find(x=>x.id===id);

    const valor = calcularValorAtual(b);

    const c = document.getElementById("modalContent");

    c.innerHTML = `

    <h3>Finalizar Aluguel</h3>

    <p><strong>Patinete:</strong> ${b.id}</p>

    <p><strong>Cliente:</strong> ${b.cliente}</p>

    <p><strong>Valor total:</strong> R$ ${valor}</p>

    <button onclick="confirmarFinalizarLocacao(${id})">
    ✔ Confirmar Finalização
    </button>

    <button onclick="fecharModal()">
    Cancelar
    </button>

    `;

    document.getElementById("modal").style.display="flex";

}

function confirmarFinalizarLocacao(id){

    const b = bikes.find(x=>x.id===id);

    const valor = calcularValorAtual(b);

    relatorios.push({
        id:b.id,
        tipo:"locacao",
        cliente:b.cliente,
        valor:valor,
        pagamento:b.pagamento,
        data:new Date().toISOString()
    });

    Object.assign(b,{
        status:STATUS.LIVRE,
        cliente:"",
        telefone:"",
        pagamento:"",
        tempo:0,
        valorBase:0,
        inicio:null
    });

    salvarRelatorios();

    salvar();

    fecharModal();

    render();

}

function abrirOpcoes(id){

    const m = document.getElementById("modal");

    const c = document.getElementById("modalContent");

    c.innerHTML=`

    <h3>Patinete ${id}</h3>

    <button onclick="abrirLocacao(${id})">
    Iniciar Locação
    </button>

    <button onclick="colocarManutencao(${id})">
    Manutenção
    </button>

    <button onclick="fecharModal()">
    Cancelar
    </button>

    `;

    m.style.display="flex";

}

function abrirLocacao(id){

    const c=document.getElementById("modalContent");

    c.innerHTML=`

    <h3>Locação</h3>

    <input id="clienteNome" placeholder="Nome">

    <input id="clienteTelefone" placeholder="Telefone">

    <select id="tempoAlugado">

    <option value="">Tempo</option>

    <option value="15">15 min - R$20</option>

    <option value="30">30 min - R$30</option>

    <option value="45">45 min - R$45</option>

    </select>

    <select id="formaPagamento">

    <option value="">Forma de Pagamento</option>

    <option value="Cartão">Cartão</option>

    <option value="Pix">Pix</option>

    <option value="Dinheiro">Dinheiro</option>

    </select>

    <button onclick="confirmarLocacao(${id})">
    Confirmar
    </button>

    <button onclick="fecharModal()">
    Cancelar
    </button>

    `;

}

function confirmarLocacao(id){

    const nome =
    document.getElementById("clienteNome").value.trim();

    const telefone =
    document.getElementById("clienteTelefone").value.trim();

    const tempo =
    parseInt(document.getElementById("tempoAlugado").value);

    const pagamento =
    document.getElementById("formaPagamento").value;

    if(!nome || !telefone || !tempo || !pagamento){
        alert("Preencha todos os campos");
        return;
    }

    const b=bikes.find(x=>x.id===id);

    Object.assign(b,{
        status:STATUS.LOCADO,
        cliente:nome,
        telefone,
        pagamento,
        tempo,
        valorBase:PRECOS[tempo],
        inicio:Date.now()
    });

    fecharModal();

    salvar();

    render();

}

function colocarManutencao(id){

    bikes.find(x=>x.id===id).status = STATUS.MANUTENCAO;

    fecharModal();

    salvar();

    render();

}

function abrirFinalizarManutencao(id){

    const c=document.getElementById("modalContent");

    c.innerHTML=`

    <h3>Finalizar Manutenção</h3>

    <input id="motivoManutencao"
    placeholder="Motivo da manutenção">

    <input id="valorManutencao"
    type="number"
    placeholder="Valor gasto (R$)">

    <button onclick="confirmarManutencao(${id})">
    Finalizar Manutenção
    </button>

    <button onclick="fecharModal()">
    Cancelar
    </button>

    `;

    document.getElementById("modal").style.display="flex";

}

function confirmarManutencao(id){

    const motivo =
    document.getElementById("motivoManutencao").value.trim();

    const valor =
    parseFloat(document.getElementById("valorManutencao").value);

    if(!motivo || isNaN(valor)){
        alert("Preencha motivo e valor");
        return;
    }

    const b=bikes.find(x=>x.id===id);

    relatorios.push({
        id:b.id,
        tipo:"manutencao",
        motivo:motivo,
        valor:valor,
        data:new Date().toISOString()
    });

    salvarRelatorios();

    b.status=STATUS.LIVRE;

    fecharModal();

    salvar();

    render();

}

function fecharModal(){
    document.getElementById("modal").style.display="none";
}

window.onclick=function(e){
    if(e.target.id==="modal") fecharModal();
};

setInterval(()=>{
    render();
},1000);

function atualizarCards(){

    const rels=
    JSON.parse(localStorage.getItem("relatorios")) || [];

    let hoje=0;
    let semana=0;
    let manutencao=0;

    const agora=new Date();

    rels.forEach(r=>{

        const data=new Date(r.data);

        const diffDias=
        Math.floor((agora-data)/(1000*60*60*24));

        if(r.tipo==="locacao"){

            if(diffDias===0) hoje+=r.valor;

            if(diffDias<=7) semana+=r.valor;

        }

        if(r.tipo==="manutencao"){
            manutencao+=r.valor;
        }

    });

    document.getElementById("totalPatinetes").innerText = bikes.length;

    document.getElementById("ganhoHoje").innerText =
    "R$ " + hoje;

    document.getElementById("ganhoSemana").innerText =
    "R$ " + semana;

    document.getElementById("gastoManutencao").innerText =
    "R$ " + manutencao;

}

function atualizarSistema(){

    const tela=document.getElementById("loadingTela");

    tela.style.display="flex";

    setTimeout(()=>location.reload(),500);

}

render();