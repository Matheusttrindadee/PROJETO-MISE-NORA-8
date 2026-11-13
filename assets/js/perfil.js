document.addEventListener('DOMContentLoaded', () => {
    const botoesAbas = document.querySelectorAll('.botao-aba');
    
    // Seleciona todas as seções dentro do <main> (exceto o menu de abas se houver)
    const secoes = document.querySelectorAll('main > section');

    if (botoesAbas.length === 0 || secoes.length === 0) return;

    // Estado inicial: mostra apenas a primeira seção (Foto) e oculta as outras
    secoes.forEach(secao => {
        secao.style.display = 'none';
    });
    
    const secaoInicial = document.getElementById('secao-avatar');
    if (secaoInicial) {
        secaoInicial.style.display = 'block';
    }

    // Adiciona o evento de clique em cada botão de aba
    botoesAbas.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Remove a classe 'ativo' de todos os botões e adiciona no clicado
            botoesAbas.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            // 2. Oculta todas as seções
            secoes.forEach(secao => {
                secao.style.display = 'none';
            });

            // 3. Pega o ID alvo através do atributo data-alvo e exibe apenas ele
            const idAlvo = botao.getAttribute('data-alvo');
            const secaoAlvo = document.getElementById(idAlvo);
            
            if (secaoAlvo) {
                secaoAlvo.style.display = 'block';
            }
        });
    });
});