<?php
session_start();

// Inicializar lista de jogadores
if (!isset($_SESSION['jogadores'])) {
    $_SESSION['jogadores'] = [];
}

// Listas pré-preenchidas
$posicoes = [
    'Goleiro', 'Fixo', 'Ala Esquerda', 'Ala Direita', 'Pivô'
];

$habilidades = [
    'Veloz', 'Forte', 'Bom passe', 'Marcação forte', 'Finalização', 'Visão de jogo'
];

// Processar cadastro de jogador
$mensagem = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['adicionar'])) {
        $nome = trim($_POST['nome']);
        $posicao = $_POST['posicao'];
        $habilidade = $_POST['habilidade'];

        if ($nome && count($_SESSION['jogadores']) < 12) {
            $_SESSION['jogadores'][] = [
                'nome' => $nome,
                'posicao' => $posicao,
                'habilidade' => $habilidade
            ];
            $mensagem = "✅ Jogador adicionado!";
        } else {
            $mensagem = "⚠️ Nome inválido ou limite de 12 jogadores atingido.";
        }
    }

    if (isset($_POST['resetar'])) {
        $_SESSION['jogadores'] = [];
        $mensagem = "🔄 Lista resetada.";
    }

    if (isset($_POST['sortear'])) {
        if (count($_SESSION['jogadores']) < 4) {
            $mensagem = "⚠️ Adicione pelo menos 4 jogadores para sortear times.";
        } else {
            // Embaralhar jogadores
            $jogadoresEmbaralhados = $_SESSION['jogadores'];
            shuffle($jogadoresEmbaralhados);
            
            // Dividir em dois times
            $timeA = [];
            $timeB = [];
            foreach ($jogadoresEmbaralhados as $index => $jogador) {
                if ($index % 2 == 0) {
                    $timeA[] = $jogador;
                } else {
                    $timeB[] = $jogador;
                }
            }
            
            $_SESSION['timeA'] = $timeA;
            $_SESSION['timeB'] = $timeB;
            $mensagem = "🎲 Times sorteados com sucesso!";
        }
    }
}

// Recuperar dados para exibição
$jogadores = $_SESSION['jogadores'];
$timeA = $_SESSION['timeA'] ?? [];
$timeB = $_SESSION['timeB'] ?? [];
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Futsal Sorteio de Times</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>⚽ Sorteio de Times de Futsal</h1>
        <p class="subtitulo">Cadastre até 12 jogadores e distribua posições automaticamente</p>

        <?php if ($mensagem): ?>
            <div class="mensagem"><?php echo $mensagem; ?></div>
        <?php endif; ?>

        <div class="grid-2colunas">
            <!-- Área de cadastro -->
            <div class="card">
                <h2>📝 Cadastrar Jogador</h2>
                <form method="POST">
                    <input type="text" name="nome" placeholder="Nome do jogador" required maxlength="30">
                    
                    <select name="posicao" required>
                        <option value="">Selecione a posição</option>
                        <?php foreach ($posicoes as $p): ?>
                            <option value="<?php echo $p; ?>"><?php echo $p; ?></option>
                        <?php endforeach; ?>
                    </select>
                    
                    <select name="habilidade" required>
                        <option value="">Característica principal</option>
                        <?php foreach ($habilidades as $h): ?>
                            <option value="<?php echo $h; ?>"><?php echo $h; ?></option>
                        <?php endforeach; ?>
                    </select>
                    
                    <button type="submit" name="adicionar" class="btn-vermelho">➕ Adicionar Jogador</button>
                </form>

                <div class="contador">
                    📊 Jogadores cadastrados: <?php echo count($jogadores); ?> / 12
                </div>

                <form method="POST" onsubmit="return confirm('Resetar toda a lista?');">
                    <button type="submit" name="resetar" class="btn-preto">🗑️ Resetar tudo</button>
                </form>
            </div>

            <!-- Lista de jogadores cadastrados -->
            <div class="card">
                <h2>👥 Jogadores Cadastrados</h2>
                <?php if (empty($jogadores)): ?>
                    <p class="vazio">Nenhum jogador ainda. Adicione acima.</p>
                <?php else: ?>
                    <ul class="lista-jogadores">
                        <?php foreach ($jogadores as $j): ?>
                            <li>
                                <strong><?php echo htmlspecialchars($j['nome']); ?></strong><br>
                                <small>📍 <?php echo $j['posicao']; ?> | 💪 <?php echo $j['habilidade']; ?></small>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </div>

        <!-- Botão de sorteio -->
        <div class="sorteio-area">
            <form method="POST">
                <button type="submit" name="sortear" class="btn-sortear">🎲 SORTEAR TIMES</button>
            </form>
        </div>

        <!-- Exibição dos times sorteados -->
        <?php if (!empty($timeA) && !empty($timeB)): ?>
        <div class="grid-2colunas times">
            <div class="card time-vermelho">
                <h2>🔴 TIME VERMELHO</h2>
                <ul class="lista-times">
                    <?php foreach ($timeA as $j): ?>
                        <li>
                            <strong><?php echo htmlspecialchars($j['nome']); ?></strong>
                            <span class="posicao"><?php echo $j['posicao']; ?></span>
                            <span class="habilidade"><?php echo $j['habilidade']; ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <div class="card time-branco">
                <h2>⚪ TIME BRANCO</h2>
                <ul class="lista-times">
                    <?php foreach ($timeB as $j): ?>
                        <li>
                            <strong><?php echo htmlspecialchars($j['nome']); ?></strong>
                            <span class="posicao"><?php echo $j['posicao']; ?></span>
                            <span class="habilidade"><?php echo $j['habilidade']; ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
