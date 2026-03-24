function voltar(){
history.back();
}

const relatorios = JSON.parse(localStorage.getItem("relatorios")) || [];

const tabelaGanhos=document.getElementById("tabelaGanhos");
const tabelaManutencao=document.getElementById("tabelaManutencao");

let totalGanhos=0;
let totalGastos=0;

relatorios.forEach(r=>{

const data=new Date(r.data).toLocaleString();

if(r.tipo==="locacao"){

totalGanhos+=r.valor;

tabelaGanhos.innerHTML+=`
<tr>
<td>${r.id}</td>
<td>${r.cliente}</td>
<td>${r.pagamento}</td>
<td>R$ ${r.valor}</td>
<td>${data}</td>
</tr>
`;

}

if(r.tipo==="manutencao"){

totalGastos+=r.valor;

tabelaManutencao.innerHTML+=`
<tr>
<td>${r.id}</td>
<td>${r.motivo}</td>
<td>R$ ${r.valor}</td>
<td>${data}</td>
</tr>
`;

}

});

document.getElementById("totalGanhos").innerText="R$ "+totalGanhos;
document.getElementById("totalGastos").innerText="R$ "+totalGastos;
document.getElementById("lucro").innerText="R$ "+(totalGanhos-totalGastos);



/* EXPORTAR PDF */

async function exportarPDF(){
const { jsPDF } = window.jspdf;
const elemento=document.getElementById("areaRelatorio");
const canvas=await html2canvas(elemento);
const img=canvas.toDataURL("image/png");
const pdf=new jsPDF("p","mm","a4");
const largura=210;
const altura=(canvas.height * largura) / canvas.width;
pdf.addImage(img,"PNG",0,0,largura,altura);
pdf.save("relatorio-financeiro.pdf");
}