import { supabase } from './conexao.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Mise Nora inicializado com sucesso!");
    
    // 1. Inicializa a mesa via URL
    inicializarMesa();

    // 2. Inicializa o sistema de abas da página de perfil
    inicializarAbasPerfil();

    // 3. Inicializa o ouvinte do formulário de cadastro
    inicializarCadastro();
});

// Função para capturar e salvar o número da mesa
function inicializarMesa() {
    const urlParams = new URLSearchParams(window.location.search);
    const mesaUrl = urlParams.get('mesa');

    if (mesaUrl) {
        localStorage.setItem('mise_mesa', mesaUrl);
        console.log(`Mesa ${mesaUrl} identificada via URL.`);
    }

    const mesaAtual = localStorage.getItem('mise_mesa');
    const elementoMesa = document.getElementById('numero-mesa');
    
    if (elementoMesa && mesaAtual) {
        elementoMesa.textContent = `Mesa: ${mesaAtual}`;
    }
}

// Função unificada para gerenciar as abas do perfil
function inicializarAbasPerfil() {
    const secoes = document.querySelectorAll('main > section');
    const botoesAba = document.querySelectorAll('.botao-aba');

    if (botoesAba.length === 0 || secoes.length === 0) return;

    secoes.forEach((secao, index) => {
        if (index === 0) {
            secao.classList.remove('secao-oculta');
        } else {
            secao.classList.add('secao-oculta');
        }
    });

    botoesAba.forEach(botao => {
        botao.addEventListener('click', () => {
            const idAlvo = botao.getAttribute('data-alvo');

            botoesAba.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');

            secoes.forEach(secao => {
                secao.classList.add('secao-oculta');
            });

            const secaoAtiva = document.getElementById(idAlvo);
            if (secaoAtiva) {
                secaoAtiva.classList.remove('secao-oculta');
            }
        });
    });
}

// Efeito para encolher o cabeçalho ao rolar a página
const verificarScroll = () => {
    const cabecalho = document.querySelector('.header-container');
    if (!cabecalho) return;

    const posicaoScroll = window.scrollY || document.documentElement.scrollTop;

    if (posicaoScroll > 15) {
        cabecalho.classList.add('rolado');
    } else {
        cabecalho.classList.remove('rolado');
    }
};

window.addEventListener('scroll', verificarScroll);
document.addEventListener('scroll', verificarScroll, true);

// Ações globais para os botões Sair e Excluir Conta
document.addEventListener('click', (e) => {
    const btnLogout = e.target.closest('#btn-logout');
    if (btnLogout) {
        e.preventDefault();
        localStorage.removeItem('mise_mesa');
        alert("Sessão encerrada com sucesso!");
        window.location.href = 'login.html';
        return;
    }

    const btnExcluir = e.target.closest('#btn-excluir-conta');
    if (btnExcluir) {
        e.preventDefault();
        if (confirm("Tem certeza de que deseja excluir a sua conta? Esta ação é irreversível.")) {
            localStorage.clear();
            alert("A sua conta foi excluída com sucesso.");
            window.location.href = 'index.html';
        }
        return;
    }
});

// Função de cadastro integrada com o back-end
function inicializarCadastro() {
    const formCadastro = document.querySelector('.form-cadastro');
    
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita o recarregamento da página

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar_senha').value;

            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }

            try {
                const resposta = await fetch('/cadastrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, telefone, senha })
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = 'login.html'; // Redireciona para o login
                } else {
                    alert('Erro ao cadastrar: ' + resultado.erro);
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
}