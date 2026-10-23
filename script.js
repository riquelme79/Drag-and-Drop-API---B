const CHAVE = "kanban.estudos";
const colunas = document.querySelectorAll(".coluna");
const form = document.getElementById("form");

let tarefas = carregar(); // [{id, titulo, status}]
let arrastadoId = null;

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(dados)) return dados;
  } catch {}
  return [
    { id: 1, titulo: "Revisar funções (Matemática)", status: "fazer" },
    { id: 2, titulo: "Redação do Enem", status: "andamento" },
    { id: 3, titulo: "Resumo de Geografia", status: "concluido" }
  ];
}

function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(tarefas)); } catch {}
}

function criarCard(t) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = t.id;

  const texto = document.createElement("span");
  texto.textContent = t.titulo; // textContent evita HTML injetado

  const remover = document.createElement("button");
  remover.textContent = "✕";
  remover.setAttribute("aria-label", "Remover tarefa");
  remover.addEventListener("click", () => {
    tarefas = tarefas.filter(x => x.id !== t.id);
    salvar();
    renderizar();
  });

  card.addEventListener("dragstart", e => {
    arrastadoId = t.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(t.id));
    setTimeout(() => card.classList.add("arrastando"), 0);
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("arrastando");
    colunas.forEach(c => c.classList.remove("sobre"));
  });

  card.append(texto, remover);
  return card;
}

function renderizar() {
  colunas.forEach(col => {
    const lista = col.querySelector(".lista");
    const itens = tarefas.filter(t => t.status === col.dataset.status);
    lista.replaceChildren(...itens.map(criarCard));
    col.querySelector(".conta").textContent = itens.length;
  });
}

// Qualquer coluna aceita qualquer card
colunas.forEach(col => {
  col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("sobre"); });
  col.addEventListener("dragleave", e => { if (!col.contains(e.relatedTarget)) col.classList.remove("sobre"); });
  col.addEventListener("drop", e => {
    e.preventDefault();
    col.classList.remove("sobre");
    const tarefa = tarefas.find(t => t.id === arrastadoId);
    if (!tarefa) return;
    tarefa.status = col.dataset.status;
    // reposiciona no fim da coluna de destino
    tarefas = tarefas.filter(t => t !== tarefa).concat(tarefa);
    salvar();
    renderizar();
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const titulo = form.titulo.value.trim();
  if (!titulo) return;
  tarefas.push({ id: Date.now(), titulo, status: "fazer" });
  salvar();
  form.reset();
  renderizar();
});

renderizar();
