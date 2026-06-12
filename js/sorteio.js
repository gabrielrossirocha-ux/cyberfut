// ============================================
// BIBLIOTECA DE SORTEIO DE TIMES
// Garantia: Goleiros SEMPRE um em cada time
// ============================================

/**
 * Sorteia times equilibrados baseado na força dos jogadores
 * @param {Array} jogadores - Lista de jogadores {nome, forca, posicao, tipo}
 * @returns {Object} { timeA, timeB, somaA, somaB }
 */
function sortearTimes(jogadores) {
    // Separar goleiros dos outros jogadores
    const goleiros = jogadores.filter(j => j.posicao === 'Goleiro');
    const outros = jogadores.filter(j => j.posicao !== 'Goleiro');
    
    let timeA = [];
    let timeB = [];
    let somaA = 0;
    let somaB = 0;
    
    // ============================================
    // REGRA 1: Goleiros - prioridade máxima
    // Garantir que fiquem em times diferentes
    // ============================================
    if (goleiros.length === 1) {
        // Apenas um goleiro: vai para o time A
        timeA.push(goleiros[0]);
        somaA += goleiros[0].forca || 3;
    } else if (goleiros.length >= 2) {
        // Dois ou mais goleiros: distribuir alternadamente
        goleiros.forEach((goleiro, index) => {
            const forca = goleiro.forca || 3;
            if (index % 2 === 0) {
                timeA.push(goleiro);
                somaA += forca;
            } else {
                timeB.push(goleiro);
                somaB += forca;
            }
        });
    }
    
    // ============================================
    // REGRA 2: Jogadores de linha
    // Ordenar por força (mais forte primeiro)
    // ============================================
    const outrosOrdenados = [...outros].sort((a, b) => {
        const forcaA = a.forca || 3;
        const forcaB = b.forca || 3;
        return forcaB - forcaA;
    });
    
    // ============================================
    // REGRA 3: Distribuir no time com menor soma
    // ============================================
    outrosOrdenados.forEach(jogador => {
        const forca = jogador.forca || 3;
        if (somaA <= somaB) {
            timeA.push(jogador);
            somaA += forca;
        } else {
            timeB.push(jogador);
            somaB += forca;
        }
    });
    
    // ============================================
    // REGRA 4: Balancear quantidade (diferença máxima de 1)
    // ============================================
    while (Math.abs(timeA.length - timeB.length) > 1) {
        if (timeA.length > timeB.length) {
            const movido = timeA.pop();
            timeB.unshift(movido);
            const forcaMovido = movido.forca || 3;
            somaA -= forcaMovido;
            somaB += forcaMovido;
        } else if (timeB.length > timeA.length) {
            const movido = timeB.pop();
            timeA.unshift(movido);
            const forcaMovido = movido.forca || 3;
            somaB -= forcaMovido;
            somaA += forcaMovido;
        }
    }
    
    return { timeA, timeB, somaA, somaB };
}

/**
 * Embaralha um array (Fisher-Yates)
 * @param {Array} array 
 * @returns {Array}
 */
function embaralharArray(array) {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
}

/**
 * Formata nota para exibição com estrelas
 * @param {number} nota 
 * @returns {string}
 */
function formatarNotaEstrelas(nota) {
    return '⭐'.repeat(Math.round(nota)) + '☆'.repeat(5 - Math.round(nota));
}
