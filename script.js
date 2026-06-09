// Chave para localStorage
const STORAGE_KEY = 'futsal_jogadores';

// Lista de características disponíveis
const HABILIDADES_DISPONIVEIS = [
    'Veloz', 'Bom passe', 'Marcação', 
    'Finalização', 'Visão de jogo', 'Drible', 'Resistência'
];

// Estado global
let jogadores = [];
let timeA = [];
let timeB = [];

// Elementos DOM
const formJogador = document.getElementById('formJogador');
const nomeInput = document.getElementById('nome');
const posicaoSelect = document.getElementById('posicao');
const totalJogadoresSpan = document.getElementById('totalJogadores');
const listaJogadoresDiv = document.getElementById('listaJogadores');
const timesContainer = document.getElementById('timesContainer');
const timeALista = document.getElementById('timeALista');
const timeBLista = document.getElementById('timeBLista');
const mensagemDiv = document.getElementById('mensagem');
const btnResetar = document.getElementById('btnResetar');
const btnSortear = document.getElementById('btnSortear');
const contadorCaracteristicas = document.getElementById('contadorCaracteristicas');

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

// Atualizar contador de características selecionadas
function atualizarContadorCaracteristicas() {
    const checkboxes = document.querySelectorAll('input[name="habilidade"]:checked');
    const quantidade = checkboxes.length;
    if (contadorCaracteristicas) {
        contadorCaracteristicas.textContent = `${quantidade} selecionadas (mínimo 2, máximo 3)`;
        if (quantidade < 2) {
            contadorCaracteristicas.style.color = '#8b0000';
        } else if (quantidade > 3) {
            contadorCaracteristicas.style.color = '#8b0000';
        } else {
            contadorCaracteristicas.style.color = '#2c5f2d';
        }
    }
}

// Criar checkboxes de características
function criarCheckboxesHabilidades() {
    const container = document.getElementById('habilidadesContainer');
    if (!container) {
        console.error('Container de habilidades não encontrado!');
        return;
    }
    
    container.innerHTML = '';
    
    HABILIDADES_DISPONIVEIS.forEach(habilidade => {
        const label = document.createElement('label');
        label.className = 'checkbox-habilidade';
        label.innerHTML = `
            <input type="checkbox" name="habilidade" value="${habilidade}">
            <span>${habilidade}</span>
        `;
        container.appendChild(label);
    });
    
    // Adicionar evento para contar características selecionadas
    document.querySelectorAll('input[name="habilidade"]').forEach(checkbox => {
        checkbox.addEventListener('change', atualizarContadorCaracteristicas);
    });
    
    atualizarContadorCaracteristicas();
}

// Obter características selecionadas
function getHabilidadesSelecionadas() {
    const checkboxes = document.querySelectorAll('input[name="habilidade"]:checked');
    const quantidade = checkboxes.length;
    
    if (quantidade === 0) {
        exibirMensagem('⚠️ Selecione pelo menos uma característica!', 'erro');
        return null;
    }
    
    if (quantidade < 2) {
        exibirMensagem('⚠️ Selecione no MÍNIMO 2 características por jogador!', 'erro');
        return null;
    }
    
    if (quantidade > 3) {
        exibirMensagem('⚠️ Selecione no MÁXIMO 3 características por jogador!', 'erro');
        return null;
    }
    
    return Array.from(checkboxes).map(cb => cb.value);
}

// Adicionar jogador
function adicionarJogador(nome, posicao, habilidades) {
    // Validações
    if (jogadores.length >= 12) {
        exibirMensagem('⚠️ Limite máximo de 12 jogadores atingido!', 'erro');
        return false;
    }
    
    if (!nome || !posicao || !habilidades || habilidades.length === 0) {
        exibirMensagem('⚠️ Preencha todos os campos e selecione as características!', 'erro');
        return false;
    }
    
    if (habilidades.length < 2) {
        exibirMensagem('⚠️ Selecione no MÍNIMO 2 características por jogador!', 'erro');
        return false;
    }
    
    if (habilidades.length > 3) {
        exibirMensagem('⚠️ Selecione no MÁXIMO 3 características por jogador!', 'erro');
        return false;
    }
    
    if (jogadores.some(j => j.nome.toLowerCase() === nome.toLowerCase())) {
        exibirMensagem('⚠️ Jogador já cadastrado!', 'erro');
        return false;
    }
    
    // Adicionar jogador
    const novoJogador = {
        id: Date.now(),
        nome: nome.trim(),
        posicao: posicao,
        habilidades: habilidades
    };
    
    jogadores.push(novoJogador);
    salvarDados();
    atualizarInterface();
    exibirMensagem(`✅ Jogador ${nome} adicionado com sucesso!`);
    
    // Limpar formulário
    nomeInput.value = '';
    posicaoSelect.value = '';
    document.querySelectorAll('input[name="habilidade"]:checked').forEach(cb => cb.checked = false);
    atualizarContadorCaracteristicas();
    
    // Limpar times sorteados
    timeA = [];
    timeB = [];
    timesContainer.style.display = 'none';
    
    return true;
}

// Remover jogador (função global para o onclick)
window.removerJogador = function(id) {
    const jogador = jogadores.find(j => j.id === id);
    if (!jogador) return;
    
    jogadores = jogadores.filter(j => j.id !== id);
    salvarDados();
    atualizarInterface();
    exibirMensagem(`🗑️ Jogador ${jogador.nome} removido!`);
    
    // Limpar times sorteados
    timeA = [];
    timeB = [];
    timesContainer.style.display = 'none';
};

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
    
    // 2. Distribuir outras posições
    distribuirAlternado(fixos, timeA, timeB);
    distribuirAlternado(alasEsquerda, timeA, timeB);
    distribuirAlternado(alasDireita, timeA, timeB);
    distribuirAlternado(pivos, timeA, timeB);
    
    // 3. Coletar jogadores que não foram alocados
    const jogadoresJaAlocados = [...timeA, ...timeB];
    const jogadoresRestantes = jogadores.filter(j => !jogadoresJaAlocados.includes(j));
    
    // Distribuir jogadores restantes
    distribuirAlternado(jogadoresRestantes, timeA, timeB);
    
    // 4. Balancear números
    balancearQuantidadeTimes();
    
    // 5. Embaralhar dentro de cada time
    timeA = embaralharArray(timeA);
    timeB = embaralharArray(timeB);
    
    exibirTimes();
    exibirMensagem('🎲 Times sorteados com distribuição equilibrada!');
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
    timesContainer.scrollIntoView({ behavior: 'smooth' });
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar contador
    totalJogadoresSpan.textContent = jogadores.length;
    
    // Lista de jogadores
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
if (formJogador) {
    formJogador.addEventListener('submit', (e) => {
        e.preventDefault();
        const habilidades = getHabilidadesSelecionadas();
        if (habilidades !== null) {
            adicionarJogador(nomeInput.value, posicaoSelect.value, habilidades);
        }
    });
}

if (btnResetar) btnResetar.addEventListener('click', resetarTudo);
if (btnSortear) btnSortear.addEventListener('click', sortearTimes);

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    criarCheckboxesHabilidades();
    carregarDados();
});
