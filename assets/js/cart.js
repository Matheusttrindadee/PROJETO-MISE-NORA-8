let carrinho = JSON.parse(localStorage.getItem('mise_carrinho')) || [];

export function adicionarAoCarrinho(nome, preco) {
    try {
        const itemExistente = carrinho.find(item => item.name === nome);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({ name: nome, price: preco, quantidade: 1 });
        }

        localStorage.setItem('mise_carrinho', JSON.stringify(carrinho));
        atualizarInterfaceCarrinho();
        
        alert(`"${nome}" (R$ ${preco.toFixed(2)}) foi adicionado ao carrinho!`);
    } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
    }
}

export function removerDoCarrinho(nome) {
    carrinho = carrinho.filter(item => item.name !== nome);
    localStorage.setItem('mise_carrinho', JSON.stringify(carrinho));
    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const containerCarrinho = document.getElementById('lista-carrinho');
    const elementoTotal = document.getElementById('valor-total');

    if (!containerCarrinho) return;

    containerCarrinho.innerHTML = '';
    let total = 0;

    carrinho.forEach(item => {
        const subtotal = item.price * item.quantidade;
        total += subtotal;

        const div = document.createElement('div');
        div.classList.add('item-carrinho-resumo');
        div.innerHTML = `
            <span>${item.name} (x${item.quantidade})</span>
            <span>R$ ${subtotal.toFixed(2)}</span>
        `;
        containerCarrinho.appendChild(div);
    });

    if (elementoTotal) {
        elementoTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
}

export async function finalizarPedido() {
    const carrinhoAtual = JSON.parse(localStorage.getItem('mise_carrinho')) || [];

    if (carrinhoAtual.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // Sempre solicita ou confirma o número da mesa antes de enviar
    const numeroMesa = await solicitarMesaModal();
    
    if (!numeroMesa || numeroMesa.trim() === "") {
        return; // Se cancelou ou não digitou, para aqui
    }
    
    localStorage.setItem('mise_mesa', numeroMesa.trim());

    // Calcula o valor total do carrinho
    const totalGeral = carrinhoAtual.reduce((acc, item) => acc + (item.price * item.quantidade), 0);

    const nomeCliente = localStorage.getItem('mise_nome_cliente') || "Cliente Mesa " + numeroMesa;
    const telefoneCliente = localStorage.getItem('mise_telefone_cliente') || "Não informado";

    try {
        const resposta = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nome_cliente: nomeCliente,
                telefone_cliente: telefoneCliente,
                numero_mesa: numeroMesa, 
                total: totalGeral,
                itens: carrinhoAtual 
            })
        });
        const resultado = await resposta.json();

        if (resposta.ok && resultado.sucesso) {
            alert(`Pedido da Mesa ${numeroMesa} finalizado com sucesso!`);
            limparCarrinhoAposSucesso();
            return;
        } else {
            alert("Erro ao finalizar pedido: " + (resultado.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao conectar com o servidor. Verifique se ele está rodando.");
    }
}

// Função que exibe o modal personalizado na tela
function solicitarMesaModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-mesa');
        const input = document.getElementById('input-numero-mesa');
        const btnConfirmar = document.getElementById('btn-confirmar-mesa');
        const btnCancelar = document.getElementById('btn-cancelar-mesa');

        if (!modal) {
            // Fallback caso esqueça de colocar o HTML na página
            const mesaPrompt = prompt("Por favor, informe o número da sua mesa:");
            return resolve(mesaPrompt);
        }

        modal.style.display = 'flex';
        input.value = '';
        input.focus();

        const fecharModal = (valor) => {
            modal.style.display = 'none';
            btnConfirmar.onclick = null;
            btnCancelar.onclick = null;
            resolve(valor);
        };

        btnConfirmar.onclick = () => {
            const valor = input.value.trim();
            if (!valor) {
                alert("Por favor, insira o número da mesa.");
                return;
            }
            fecharModal(valor);
        };

        btnCancelar.onclick = () => {
            fecharModal(null);
        };
    });
}

function limparCarrinhoAposSucesso() {
    localStorage.removeItem('mise_carrinho');
    carrinho = [];
    atualizarInterfaceCarrinho();
    window.location.href = 'index.html';
}

// Inicialização e escutadores globais
document.addEventListener('DOMContentLoaded', () => {
    atualizarInterfaceCarrinho();
});

document.addEventListener('click', (e) => {
    // 1. Tratamento para botões de adicionar ao carrinho
    const botaoAdd = e.target.closest('.botaoadicionaraocarrinho');
    if (botaoAdd) {
        e.preventDefault();
        const cardItem = botaoAdd.closest('.card-item');
        if (!cardItem) return;

        const h5 = cardItem.querySelector('h5');
        const nome = h5 ? h5.innerText.trim() : "Prato Mise Nora";

        const precoEl = cardItem.querySelector('.preco');
        let preco = 35.00;

        if (precoEl) {
            const textoPreco = precoEl.innerText.replace('R$', '').replace(',', '.').trim();
            preco = parseFloat(textoPreco) || 35.00;
        }

        adicionarAoCarrinho(nome, preco);
        return;
    }

    // 2. Tratamento para botões de finalizar pedido
    const botaoFinalizar = e.target.closest('#btn-finalizar, .botaofinalizar, button[onclick*="finalizar"]');
    if (botaoFinalizar) {
        e.preventDefault();
        finalizarPedido();
    }
});