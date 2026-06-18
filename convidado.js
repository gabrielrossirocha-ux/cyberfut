// convidado.js - Controle de permissões

function isModoConvidado() {
    return localStorage.getItem('modoConvidado') === 'true';
}

function verificarPermissao() {
    if (isModoConvidado()) {
        // Esconder botões de ação
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.classList.contains('btn-permitido')) {
                btn.style.display = 'none';
            }
        });
        
        // Desabilitar inputs e selects
        document.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
            el.style.opacity = '0.7';
        });
        
        // Esconder botões de deletar/editar
        document.querySelectorAll('.btn-deletar, .btn-vermelho, .btn-azul, .btn-verde').forEach(btn => {
            if (!btn.classList.contains('btn-permitido')) {
                btn.style.display = 'none';
            }
        });
    }
}

// Sair do modo convidado
function sairModoConvidado() {
    localStorage.removeItem('modoConvidado');
    window.location.reload();
}
