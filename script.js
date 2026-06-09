// Chave para localStorage
const STORAGE_KEY = 'futsal_jogadores';

// Lista de características disponíveis
const HABILIDADES_DISPONIVEIS = [
    'Veloz', 'Forte', 'Bom passe', 'Marcação forte', 
    'Finalização', 'Visão de jogo', 'Drible', 'Cabeceio', 
    'Liderança', 'Resistência'
];

// Estado global
let jogadores = [];
let timeA = [];
let timeB = [];

// Elementos DOM
const formJogador = document.getElementById('formJogador');
const nomeInput = document.getElementById('nome');
const posicaoSelect = document.getElementById('posicao');
const habilidadesContainer = document.getElementById('habilidadesContainer');
const totalJogadoresSpan = document.getElementById('totalJogadores');
const listaJogadoresDiv = document.getElementById('listaJogadores');
const timesContainer = document.getElementById('timesContainer');
const timeALista = document.getElementById('timeALista');
const timeBLista = document.getElementById('timeBLista');
const mensagemDiv = document.getElementById('mensagem');
const btnResetar = document.getElementById('btnResetar');
const btnSortear = document.getElementById('btnSortear');

// Carregar dados do localStorage
function carregarDados() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
        jogadores = JSON.parse(dados);
    } else {
        jogadores = [];
    }
    atualizarInterface();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jogadores));
}

// Exibir mensagem temporária
function exibirMensagem(texto, tipo = 'sucesso') {
    mensagemDiv.textContent = texto;
    mensagemDiv.style.backgroundColor = tipo === 'erro' ? '#8b0000' : '#2c5f2d';
    mensagemDiv.style.display = 'block';
    
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 3000);
}

// Criar checkboxes de características
function criarCheckboxesHabilidades() {
    habilidadesContainer.innerHTML = '<label class="label-habilidades">💪 Características (máx 3):</label>';
    
    HABILIDADES_DISPONIVEIS.forEach(habilidade => {
        const checkbox = document.createElement('label');
        checkbox.className = 'checkbox-habilidade';
        checkbox.innerHTML = `
            <input type="checkbox" name="habilidade" value="${habilidade}">
            <span>${habilidade}</span>
        `;
        habilidadesContainer.appendChild(checkbox);
    });
}

// Obter características selecionadas
function getHabilidadesSelecionadas() {
    const checkboxes = document.querySelectorAll('input[name="habilidade"]:checked');
    if (checkboxes.length === 0) {
        return [];
    }
    if (checkboxes.length > 3) {
        exibirMensagem('⚠️ Selecione no máximo 3 características!', 'erro');
        return null;
    }
    return Array.from(checkboxes).map(cb => cb.value);
}

// Adicionar jogador
function adicionarJogador(nome, posicao, habilidades) {
    if (jogadores.length >= 12) {
        exibirMensagem('⚠️ Limite máximo de 12 jogadores atingido!', 'erro');
        return false;
    }
    
    if (!nome || !posicao || !habilidades || habilidades.length === 0) {
        exibirMensagem('⚠️ Preencha todos os campos e selecione pelo menos uma característica!', 'erro');
        return false;
    }
    
    if (habilidades.length > 3) {
        exibirMensagem('⚠️ Máximo de 3 características por jogador!', 'erro');
        return false;
    }
    
    if (jogadores.some(j => j.nome.toLowerCase() === nome.toLowerCase())) {
        exibirMensagem('⚠️ Jogador já cadastrado!', 'erro');
        return false;
    }
    
    jogadores.push({
        id: Date.now(),
        nome: nome.trim(),
        posicao: posicao,
        habilidades: habilidades
    });
    
    salvarDados();
    atualizarInterface();
    exibirMensagem(`✅ Jogador ${nome} adicionado com sucesso!`);
    
    // Limpar formulário
    document.getElementById('nome').value = '';
    document.getElementById('posicao').value = '';
    document.querySelectorAll('input[name="habilidade"]:checked').forEach(cb => cb.checked = false);
    
    // Limpar times sorteados
    timeA = [];
    timeB = [];
    timesContainer.style.display = 'none';
    
    return true;
}

// Remover jogador
function removerJogador(id) {
    const jogador = jogadores.find(j => j.id === id);
    jogadores = jogadores.filter(j => j.id !== id);
    salvarDados();
    atualizarInterface();
    exibirMensagem(`🗑️ Jogador ${jogador.nome} removido!`);
    
    // Limpar times sorteados
    timeA = [];
    timeB = [];
    timesContainer.style.display = 'none';
}

// Resetar tudo
function resetarTudo() {
    if (confirm('⚠️ Tem certeza que deseja resetar toda a lista de jogadores?')) {
        jogadores = [];
        timeA = [];
        timeB = [];
        salvarDados();
        atualizarInterface();
        timesContainer.style.display = 'none';
        exibirMensagem('🔄 Lista resetada com sucesso!');
    }
}

// Função auxiliar para distribuir jogadores alternadamente
function distribuirAlternado(jogadoresLista, timeAArray, timeBArray) {
    jogadoresLista.forEach((jogador, index) => {
        if (index % 2 === 0) {
            timeAArray.push(jogador);
        } else {
            timeBArray.push(jogador);
        }
    });
}

// Embaralhar array
function embaralharArray(array) {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
}

// Balancear quantidade de jogadores nos times
function balancearQuantidadeTimes() {
    while (Math.abs(timeA.length - timeB.length) > 1) {
        if (timeA.length > timeB.length) {
            const jogadorMovido = timeA.pop();
            timeB.unshift(jogadorMovido);
        } else if (timeB.length > timeA.length) {
            const jogadorMovido = timeB.pop();
            timeA.unshift(jogadorMovido);
        }
    }
}

// Sorteio inteligente - distribui posições equilibradamente
function sortearTimes() {
    if (jogadores.length < 4) {
        exibirMensagem('⚠️ Adicione pelo menos 4 jogadores para sortear os times!', 'erro');
        return;
    }
    
    // Separar jogadores por posição
    const goleiros = jogadores.filter(j => j.posicao === 'Goleiro');
    const fixos = jogadores.filter(j => j.posicao === 'Fixo');
    const alasEsquerda = jogadores.filter(j => j.posicao === 'Ala Esquerda');
    const alasDireita = jogadores.filter(j => j.posicao === 'Ala Direita');
    const pivos = jogadores.filter(j => j.posicao === 'Pivô');
    
    // Inicializar times vazios
    timeA = [];
    timeB = [];
    
    // 1. Distribuir goleiros (prioridade máxima - não podem ficar juntos)
    if (goleiros.length === 1) {
        timeA.push(goleiros[0]);
    } else if (goleiros.length >= 2) {
        goleiros.forEach((goleiro, index) => {
            if (index % 2 === 0) {
                timeA.push(goleiro);
            } else {
                timeB.push(goleiro);
            }
        });
    }
    
    // 2. Distribuir Fixos (alternadamente)
    distribuirAlternado(fixos, timeA, timeB);
    
    // 3. Distribuir Alas Esquerda
    distribuirAlternado(alasEsquerda, timeA, timeB);
    
    // 4. Distribuir Alas Direita
    distribuirAlternado(alasDireita, timeA, timeB);
    
    // 5. Distribuir Pivôs
    distribuirAlternado(pivos, timeA, timeB);
    
    // 6. Coletar jogadores que não foram alocados
    const jogadoresJaAlocados = [...timeA, ...timeB];
    const jogadoresRestantes = jogadores.filter(j => !jogadoresJaAlocados.includes(j));
    
    // Distribuir jogadores restantes alternadamente
    distribuirAlternado(jogadoresRestantes, timeA, timeB);
    
    // 7. Verificar e corrigir desbalanceamento numérico
    balancearQuantidadeTimes();
    
    // 8. Embaralhar a ordem dentro de cada time
    timeA = embaralharArray(timeA);
    timeB = embaralharArray(timeB);
    
    exibirTimes();
    exibirMensagem('🎲 Times sorteados com distribuição equilibrada de posições!');
}

// Exibir times na tela
function exibirTimes() {
    timeALista.innerHTML = '';
    timeBLista.innerHTML = '';
    
    timeA.forEach(jogador => {
        const li = document.createElement('li');
        const habilidadesHtml = jogador.habilidades.map(h => `<span class="habilidade">${h}</span>`).join('');
        li.innerHTML = `
            <strong>${jogador.nome}</strong>
            <span class="posicao">${jogador.posicao}</span>
            <div class="habilidades-lista">${habilidadesHtml}</div>
        `;
        timeALista.appendChild(li);
    });
    
    timeB.forEach(jogador => {
        const li = document.createElement('li');
        const habilidadesHtml = jogador.habilidades.map(h => `<span class="habilidade">${h}</span>`).join('');
        li.innerHTML = `
            <strong>${jogador.nome}</strong>
            <span class="posicao">${jogador.posicao}</span>
            <div class="habilidades-lista">${habilidadesHtml}</div>
        `;
        timeBLista.appendChild(li);
    });
    
    timesContainer.style.display = 'block';
    
    // Rolar para os times
    timesContainer.scrollIntoView({ behavior: 'smooth' });
}

// Atualizar interface (lista de jogadores e contador)
function atualizarInterface() {
    // Atualizar contador
    totalJogadoresSpan.textContent = jogadores.length;
    
    // Atualizar lista de jogadores
    if (jogadores.length === 0) {
        listaJogadoresDiv.innerHTML = '<p class="vazio">Nenhum jogador ainda. Adicione acima.</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'lista-jogadores';
    
    jogadores.forEach(jogador => {
        const li = document.createElement('li');
        const habilidadesHtml = jogador.habilidades.map(h => `<span class="habilidade">${h}</span>`).join('');
        li.innerHTML = `
            <div class="jogador-info">
                <strong>${jogador.nome}</strong>
                <span class="posicao">📍 ${jogador.posicao}</span>
                <div class="habilidades-lista">💪 ${habilidadesHtml}</div>
            </div>
            <button class="btn-deletar" onclick="removerJogador(${jogador.id})">❌ Remover</button>
        `;
        ul.appendChild(li);
    });
    
    listaJogadoresDiv.innerHTML = '';
    listaJogadoresDiv.appendChild(ul);
}

// Event Listeners
formJogador.addEventListener('submit', (e) => {
    e.preventDefault();
    const habilidades = getHabilidadesSelecionadas();
    if (habilidades !== null) {
        adicionarJogador(
            nomeInput.value,
            posicaoSelect.value,
            habilidades
        );
    }
});

btnResetar.addEventListener('click', resetarTudo);
btnSortear.addEventListener('click', sortearTimes);

// Inicializar
criarCheckboxesHabilidades();
carregarDados();
