document.addEventListener("DOMContentLoaded", () => {

  let dados = [];
  let chart;
  let userId = null;
  let lancamentosRef = null;

  // ELEMENTOS
  const tipo = document.getElementById("tipo");
  const categoria = document.getElementById("categoria");
  const subcategoria = document.getElementById("subcategoria");
  const descricao = document.getElementById("descricao");
  const valor = document.getElementById("valor");

  const entradasEl = document.getElementById("entradas");
  const saidasEl = document.getElementById("saidas");
  const saldoEl = document.getElementById("saldo");
  const tabela = document.getElementById("tabela");
  const textoRelatorio = document.getElementById("textoRelatorio");
  const grafico = document.getElementById("grafico");

  /* ================= MENU ================= */
  document.getElementById("menuToggle").onclick = () => {
    document.getElementById("menu").classList.toggle("fechado");
  };

  document.querySelectorAll(".menu button").forEach(btn => {
    btn.onclick = () => abrirSecao(btn.dataset.target);
  });

  function abrirSecao(id) {
    document.querySelectorAll(".secao").forEach(s =>
      s.classList.remove("ativa")
    );
    document.getElementById(id).classList.add("ativa");
  }

  /* ================= AUTH ================= */
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;

    userId = user.uid;

    lancamentosRef = db
      .collection("users")
      .doc(userId)
      .collection("lancamentos");

    carregarDados();
  });

  /* ================= FIRESTORE ================= */
  function carregarDados() {
    lancamentosRef
      .orderBy("criadoEm", "desc")
      .onSnapshot(snapshot => {
        dados = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        atualizarTudo();
      });
  }

  /* ================= FORM ================= */
  document.getElementById("formLancamento").onsubmit = e => {
    e.preventDefault();
    if (!lancamentosRef) return;

    lancamentosRef.add({
      tipo: tipo.value,
      categoria: categoria.value,
      subcategoria: subcategoria.value || "",
      descricao: descricao.value || "",
      valor: Number(valor.value),
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      e.target.reset();
    });
  };

  /* ================= ATUALIZAÇÕES ================= */
  function atualizarTudo() {
  atualizarDashboard();
  atualizarTabela();
  atualizarRelatorio();
  atualizarGrafico();
  atualizarTabelaLancamentos();
}


  function atualizarDashboard() {
    let entradas = 0, saidas = 0;

    dados.forEach(d => {
      d.tipo === "entrada"
        ? entradas += d.valor
        : saidas += d.valor;
    });

    entradasEl.textContent = `R$ ${entradas.toFixed(2)}`;
    saidasEl.textContent = `R$ ${saidas.toFixed(2)}`;
    saldoEl.textContent = `R$ ${(entradas - saidas).toFixed(2)}`;
  }

  function atualizarTabela() {
    tabela.innerHTML = dados.map(d => `
      <tr>
        <td>${d.tipo}</td>
        <td>${d.categoria}</td>
        <td>${d.subcategoria}</td>
        <td>${d.descricao}</td>
        <td>R$ ${d.valor.toFixed(2)}</td>
      </tr>
    `).join("");
  }

  function atualizarRelatorio() {
    const categorias = [...new Set(dados.map(d => d.categoria))];
    textoRelatorio.innerHTML = `
      Total de lançamentos: <b>${dados.length}</b><br>
      Categorias distintas: <b>${categorias.length}</b>
    `;
  }

  function atualizarGrafico() {
    const mapa = {};
    dados.forEach(d => {
      mapa[d.categoria] = (mapa[d.categoria] || 0) + d.valor;
    });

    chart = new Chart(grafico, {
  type: "pie",
  data: {
    labels: Object.keys(mapa),
    datasets: [{
      data: Object.values(mapa)
      }]
    },
    options: {
    responsive: true,
    maintainAspectRatio: false
        }
    });
  }

});

document.querySelectorAll(".aba").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".aba").forEach(b => b.classList.remove("ativa"));
    document.querySelectorAll(".conteudo-aba").forEach(c => c.classList.remove("ativa"));

    btn.classList.add("ativa");
    document.getElementById("aba-" + btn.dataset.aba).classList.add("ativa");
  };
});

const tabelaLancamentos = document.getElementById("tabelaLancamentos");

function atualizarTabelaLancamentos() {
  tabelaLancamentos.innerHTML = dados.map(d => `
    <tr>
      <td>${d.tipo}</td>
      <td>${d.categoria}</td>
      <td>${d.subcategoria || ""}</td>
      <td>${d.descricao || ""}</td>
      <td>R$ ${d.valor.toFixed(2).replace(".", ",")}</td>
      <td>
        <button class="btn-acao btn-editar" onclick="editarLancamento('${d.id}')">Editar</button>
        <button class="btn-acao btn-excluir" onclick="excluirLancamento('${d.id}')">Excluir</button>
      </td>
    </tr>
  `).join("");
}

function excluirLancamento(id) {
  if (confirm("Deseja realmente excluir este lançamento?")) {
    lancamentosRef.doc(id).delete();
  }
}

function editarLancamento(id) {
  const item = dados.find(d => d.id === id);
  if (!item) return;

  document.querySelector('[data-aba="novo"]').click();

  tipo.value = item.tipo;
  categoria.value = item.categoria;
  subcategoria.value = item.subcategoria;
  descricao.value = item.descricao;
  valor.value = item.valor.toFixed(2).replace(".", ",");

  formLancamento.onsubmit = e => {
    e.preventDefault();

    const valorNumerico = Number(valor.value.replace(/\./g, "").replace(",", "."));

    lancamentosRef.doc(id).update({
      tipo: tipo.value,
      categoria: categoria.value,
      subcategoria: subcategoria.value,
      descricao: descricao.value,
      valor: valorNumerico
    });

    formLancamento.reset();
    location.reload();
  };
}
