// Chave para localStorage
const STORAGE_KEY = 'futsal_jogadores';

// Listas pré-preenchidas
const POSICOES = ['Goleiro', 'Fixo', 'Ala Esquerda', 'Ala Direita', 'Pivô'];
const HABILIDADES = ['Veloz', 'Forte', 'Bom passe', 'Marcação forte', 'Finalização', 'Visão de jogo'];

// Estado global
let jogadores = [];
let timeA = [];
let timeB = [];

// Elementos DOM
const formJogador = document.getElementById('formJogador');
const nomeInput = document.getElementById('nome');
const posicaoSelect = document.getElementById('posicao');
const habilidadeSelect = document.getElementById('habilidade');
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

// Adicionar jogador
function adicionarJogador(nome, posicao, habilidade) {
    if (jogadores.length >= 12) {
        exibirMensagem('⚠️ Limite máximo de 12 jogadores atingido!', 'erro');
        return false;
    }
    
    if (!nome || !posicao || !habilidade) {
        exibirMensagem('⚠️ Preencha todos os campos!', 'erro');
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
        habilidade: habilidade
    });
    
    salvarDados();
    atualizarInterface();
    exibirMensagem(`✅ Jogador ${nome} adicionado com sucesso!`);
    return true;
}

// Remover jogador
function removerJogador(id) {
    const jogador = jogadores.find(j => j.id === id);
    jogadores = jogadores.filter(j => j.id !== id);
    salvarDados();
    atualizarInterface();
    exibirMensagem(`🗑️ Jogador ${jogador.nome} removido!`);
    
    // Limpar times sorteados se houver remoção
    if (timeA.length > 0 || timeB.length > 0) {
        timeA = [];
        timeB = [];
        timesContainer.style.display = 'none';
    }
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

// Sortear times
function sortearTimes() {
    if (jogadores.length < 4) {
        exibirMensagem('⚠️ Adicione pelo menos 4 jogadores para sortear os times!', 'erro');
        return;
    }
    
    // Embaralhar jogadores
    const embaralhados = [...jogadores];
    for (let i = embaralhados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]];
    }
    
    // Dividir em dois times alternadamente
    timeA = [];
    timeB = [];
    embaralhados.forEach((jogador, index) => {
        if (index % 2 === 0) {
            timeA.push(jogador);
        } else {
            timeB.push(jogador);
        }
    });
    
    exibirTimes();
    exibirMensagem('🎲 Times sorteados com sucesso!');
}

// Exibir times na tela
function exibirTimes() {
    timeALista.innerHTML = '';
    timeBLista.innerHTML = '';
    
    timeA.forEach(jogador => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${jogador.nome}</strong>
            <span class="posicao">${jogador.posicao}</span>
            <span class="habilidade">${jogador.habilidade}</span>
        `;
        timeALista.appendChild(li);
    });
    
    timeB.forEach(jogador => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${jogador.nome}</strong>
            <span class="posicao">${jogador.posicao}</span>
            <span class="habilidade">${jogador.habilidade}</span>
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
        li.innerHTML = `
            <strong>${jogador.nome}</strong><br>
            <small>📍 ${jogador.posicao} | 💪 ${jogador.habilidade}</small>
            <br>
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
    adicionarJogador(
        nomeInput.value,
        posicaoSelect.value,
        habilidadeSelect.value
    );
    formJogador.reset();
});

btnResetar.addEventListener('click', resetarTudo);
btnSortear.addEventListener('click', sortearTimes);

// Inicializar
carregarDados();
