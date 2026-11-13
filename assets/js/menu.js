import { supabase } from './conexao.js';
// js/menu.js
export function setupMenuTabs() {
    const botoesCategoria = document.querySelectorAll('.tab-categoria');
    const itensCardapio = document.querySelectorAll('.item-cardapio');

    if (botoesCategoria.length === 0) return;

    botoesCategoria.forEach(botao => {
        botao.addEventListener('click', (e) => {
            // Remove a classe ativo de todos os botões
            botoesCategoria.forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');

            const categoriaSelecionada = e.target.getAttribute('data-categoria');

            // Filtra os itens exibidos
            itensCardapio.forEach(item => {
                const categoriaItem = item.getAttribute('data-categoria');
                if (categoriaSelecionada === 'todos' || categoriaItem === categoriaSelecionada) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Executa a configuração se estiver na página de cardápio
document.addEventListener('DOMContentLoaded', setupMenuTabs);
