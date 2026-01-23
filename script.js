let dados = [];
let chart;
const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const subcategoria = document.getElementById("subcategoria");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");

// MENU
document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("fechado");
});

// NAVEGAÇÃO
document.querySelectorAll(".menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    abrirSecao(btn.dataset.target);
  });
});

function abrirSecao(id) {
  document.querySelectorAll(".secao").forEach(secao => {
    secao.classList.remove("ativa");
  });
  document.getElementById(id).classList.add("ativa");
}

// FORMULÁRIO
document.getElementById("formLancamento").addEventListener("submit", salvar);

function salvar(e) {
  e.preventDefault();

  const novo = {
    tipo: tipo.value,
    categoria: categoria.value,
    sub: subcategoria.value,
    descricao: descricao.value,
    valor: Number(valor.value),
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("users")
    .doc(userId)
    .collection("lancamentos")
    .add(novo)
    .then(() => {
      e.target.reset();
    });
}

function carregarDados() {
  db.collection("users")
    .doc(userId)
    .collection("lancamentos")
    .orderBy("criadoEm", "asc")
    .onSnapshot(snapshot => {
      dados = snapshot.docs.map(doc => doc.data());
      atualizarTudo();
    });
}


// ATUALIZAÇÕES
function atualizarTudo() {
  atualizarDashboard();
  atualizarTabela();
  atualizarRelatorio();
  atualizarGrafico();
}

function atualizarDashboard() {
  let entradas = 0;
  let saidas = 0;

  dados.forEach(d => {
    d.tipo === "entrada" ? entradas += d.valor : saidas += d.valor;
  });

  document.getElementById("entradas").innerText = `R$ ${entradas.toFixed(2)}`;
  document.getElementById("saidas").innerText = `R$ ${saidas.toFixed(2)}`;
  document.getElementById("saldo").innerText = `R$ ${(entradas - saidas).toFixed(2)}`;
}

function atualizarTabela() {
  const tbody = document.getElementById("tabela");
  tbody.innerHTML = "";

  dados.forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td>${d.tipo}</td>
        <td>${d.categoria}</td>
        <td>${d.sub}</td>
        <td>${d.descricao}</td>
        <td>R$ ${d.valor.toFixed(2)}</td>
      </tr>
    `;
  });
}

function atualizarRelatorio() {
  const categorias = [...new Set(dados.map(d => d.categoria))];

  document.getElementById("textoRelatorio").innerHTML = `
    Total de lançamentos: ${dados.length}<br>
    Categorias distintas: ${categorias.length}
  `;
}

function atualizarGrafico() {
  const categorias = {};

  dados.forEach(d => {
    categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
  });

  const ctx = document.getElementById("grafico");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: ["#4facfe", "#43e97b", "#74b9ff"]
      }]
    }
  });
}
