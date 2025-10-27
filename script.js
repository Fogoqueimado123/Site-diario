const painelDiario = document.getElementById("painelDiario");
const adicionarTexto = document.getElementById("adicionarTexto");
const diarioInput = document.getElementById("diario");
const imagemUpload = document.getElementById("imagemUpload");
const audioUpload = document.getElementById("audioUpload");
const tamanhoDiario = document.getElementById("tamanhoDiario");

// MENU TOGGLE
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// ALTERAR TAMANHO DO DIÁRIO
tamanhoDiario.addEventListener("change", () => {
    painelDiario.className = "painel-diario";
    painelDiario.classList.add(tamanhoDiario.value);
    localStorage.setItem("tamanhoDiario", tamanhoDiario.value);
});

// CARREGAR CARDS SALVOS
window.addEventListener("load", () => {
    const cardsSalvos = JSON.parse(localStorage.getItem("cardsDiario")) || [];
    cardsSalvos.forEach(card => criarCard(card));
    const tamanhoSalvo = localStorage.getItem("tamanhoDiario") || "medio";
    painelDiario.classList.add(tamanhoSalvo);
    tamanhoDiario.value = tamanhoSalvo;
});

// ADICIONAR TEXTO
adicionarTexto.addEventListener("click", () => {
    const texto = diarioInput.value.trim();
    if (!texto) return;
    criarCard({ tipo: "texto", conteudo: texto, top: "10px", left: "10px" });
    diarioInput.value = "";
});

// UPLOAD DE IMAGEM
imagemUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => criarCard({ tipo: "imagem", conteudo: reader.result, top: "10px", left: "10px" });
    reader.readAsDataURL(file);
    imagemUpload.value = "";
});

// UPLOAD DE ÁUDIO
audioUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => criarCard({ tipo: "audio", conteudo: reader.result, top: "10px", left: "10px" });
    reader.readAsDataURL(file);
    audioUpload.value = "";
});

// CRIAR CARD
function criarCard({ tipo, conteudo, top, left }) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.top = top;
    card.style.left = left;

    const editarBtn = document.createElement("button");
    editarBtn.textContent = "✏️ Editar";

    const deletarBtn = document.createElement("button");
    deletarBtn.textContent = "✖️";
    deletarBtn.addEventListener("click", () => {
        if (confirm("Deseja apagar este card?")) {
            card.remove();
            salvarCards();
        }
    });

    if (tipo === "texto") {
        const textarea = document.createElement("textarea");
        textarea.value = conteudo;
        textarea.readOnly = true;
        textarea.addEventListener("input", salvarCards);
        card.appendChild(textarea);

        editarBtn.addEventListener("click", () => {
            textarea.readOnly = !textarea.readOnly;
            if (!textarea.readOnly) textarea.focus();
            salvarCards();
        });

    } else if (tipo === "imagem") {
        const img = document.createElement("img");
        img.src = conteudo;
        img.style.width = "200px";
        card.appendChild(img);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 50;
        slider.max = 400;
        slider.value = 200;
        slider.addEventListener("input", () => {
            img.style.width = slider.value + "px";
            salvarCards();
        });
        card.appendChild(slider);

        editarBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.addEventListener("change", e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    img.src = reader.result;
                    salvarCards();
                };
                reader.readAsDataURL(file);
            });
            input.click();
        });

    } else if (tipo === "audio") {
        const audio = document.createElement("audio");
        audio.src = conteudo;
        audio.controls = true;
        audio.style.width = "300px";
        card.appendChild(audio);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = 150;
        slider.max = 600;
        slider.value = 300;
        slider.addEventListener("input", () => {
            audio.style.width = slider.value + "px";
            salvarCards();
        });
        card.appendChild(slider);

        editarBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "audio/*";
            input.addEventListener("change", e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    audio.src = reader.result;
                    salvarCards();
                };
                reader.readAsDataURL(file);
            });
            input.click();
        });
    }

    card.appendChild(editarBtn);
    card.appendChild(deletarBtn);

    enableDrag(card);
    painelDiario.appendChild(card);
    salvarCards();
}

// DRAG & DROP
function enableDrag(el) {
    let offsetX, offsetY, dragging = false;

    el.addEventListener("pointerdown", e => {
        if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
        dragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        el.setPointerCapture(e.pointerId);
        el.style.zIndex = 1000;
    });

    el.addEventListener("pointermove", e => {
        if (!dragging) return;
        const rect = painelDiario.getBoundingClientRect();
        el.style.left = e.clientX - rect.left - offsetX + "px";
        el.style.top = e.clientY - rect.top - offsetY + "px";
    });

    el.addEventListener("pointerup", () => {
        dragging = false;
        el.style.zIndex = 1;
        salvarCards();
    });
}

// SALVAR CARDS NO LOCALSTORAGE
function salvarCards() {
    const cards = Array.from(painelDiario.children).map(c => {
        let tipo, conteudo;
        if (c.querySelector("textarea")) tipo = "texto", conteudo = c.querySelector("textarea").value;
        else if (c.querySelector("img")) tipo = "imagem", conteudo = c.querySelector("img").src;
        else if (c.querySelector("audio")) tipo = "audio", conteudo = c.querySelector("audio").src;
        return { tipo, conteudo, top: c.style.top, left: c.style.left };
    });
    localStorage.setItem("cardsDiario", JSON.stringify(cards));
}
