const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'SUA_URL_DO_SUPABASE';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON_DO_SUPABASE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Configura o Express para servir arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));

// Rota principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do Painel Administrativo
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ==========================================
// ROTA DE CADASTRO (Ajustada para 'nome_completo')
// ==========================================
app.post('/cadastrar', async (req, res) => {
    const { nome, email, telefone, senha } = req.body;

    try {
        const { data, error } = await supabase
            .from('clientes')
            .insert([
                { 
                    nome_completo: nome, // Mapeia para a coluna correta do banco
                    email, 
                    telefone, 
                    senha 
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({ sucesso: true, mensagem: "Cadastro realizado com sucesso!", usuario: data[0] });
    } catch (error) {
        console.error("Erro no cadastro:", error.message);
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

// ==========================================
// ROTA DE LOGIN (Para validar no Supabase)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();

        if (error || !data) {
            return res.status(401).json({ sucesso: false, erro: "E-mail ou senha incorretos." });
        }

        res.json({ sucesso: true, mensagem: "Login realizado com sucesso!", usuario: data });
    } catch (error) {
        console.error("Erro no login:", error.message);
        res.status(500).json({ sucesso: false, erro: "Erro ao processar o login." });
    }
});

// ==========================================
// ROTAS DE PEDIDOS (Integradas ao Supabase)
// ==========================================

// Rota para o painel buscar os pedidos e seus itens
app.get('/api/pedidos', async (req, res) => {
    try {
        const { data: pedidos, error: pedidoError } = await supabase
            .from('pedidos')
            .select('*')
            .order('id', { ascending: false });

        if (pedidoError) throw pedidoError;

        for (let pedido of pedidos) {
            const { data: itens, error: itensError } = await supabase
                .from('itens_pedido')
                .select(`
                    id,
                    quantidade,
                    preco_unitario,
                    produto_id,
                    nome_produto,
                    produtos (
                        nome
                    )
                `)
                .eq('pedido_id', pedido.id);

            if (!itensError && itens) {
                pedido.itens_pedido = itens;
            } else {
                pedido.itens_pedido = [];
            }
        }

        res.json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error.message);
        res.status(500).json({ erro: "Erro ao buscar pedidos do banco de dados." });
    }
});

// Rota para criar um novo pedido no Supabase
app.post('/api/pedidos', async (req, res) => {
    console.log("📦 PEDIDO RECEBIDO DO FRONT-END:", JSON.stringify(req.body, null, 2));
    
    const { nome_cliente, telefone_cliente, numero_mesa, total, itens } = req.body;

    try {
        const { data: pedidoData, error: pedidoError } = await supabase
            .from('pedidos')
            .insert([
                { 
                    nome_cliente: nome_cliente || "Cliente Balcão", 
                    telefone_cliente: telefone_cliente || "Não informado", 
                    numero_mesa: numero_mesa || "Não informada", 
                    total: total || 0, 
                    status_pedido: "Pendente" 
                }
            ])
            .select();

        if (pedidoError) throw pedidoError;

        const pedidoCriado = pedidoData[0];
        const pedidoId = pedidoCriado.id;

        if (itens && Array.isArray(itens) && itens.length > 0) {
            const itensParaInserir = itens.map(item => ({
                pedido_id: pedidoId,
                produto_id: item.produto_id || item.id || null,
                quantidade: item.quantidade || 1,
                preco_unitario: item.preco_unitario || item.preco || item.price || 0,
                nome_produto: item.name || item.nome || "Item do Cardápio"
            }));

            const { error: itensError } = await supabase
                .from('itens_pedido')
                .insert(itensParaInserir);

            if (itensError) throw itensError;
        }

        res.status(201).json({ sucesso: true, pedido: pedidoCriado });
    } catch (error) {
        console.error("Erro ao criar pedido:", error.message);
        res.status(500).json({ sucesso: false, erro: "Erro ao salvar o pedido no banco de dados." });
    }
});

// Rota para atualizar o status do pedido no Supabase
app.put('/api/pedidos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status_pedido } = req.body;

    try {
        const { data, error } = await supabase
            .from('pedidos')
            .update({ status_pedido })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({ sucesso: true, pedido: data[0] });
    } catch (error) {
        console.error("Erro ao atualizar status:", error.message);
        res.status(500).json({ erro: "Erro ao atualizar o status no banco de dados."});
    }
});

// ==========================================
// ROTA DE RESERVAS (Integrada ao Supabase)
// ==========================================
app.post('/api/reservas', async (req, res) => {
    console.log("📅 RESERVA RECEBIDA DO FRONT-END:", JSON.stringify(req.body, null, 2));
    
    const { nome_cliente, data_reserva, horario_reserva, horario, qtd_pessoas, numero_mesa, observacoes } = req.body;
    const horaEscolhida = horario_reserva || horario || "12:00";

    try {
        const { data, error } = await supabase
            .from('reservas')
            .insert([
                { 
                    nome: nome_cliente || "Cliente",
                    telefone: "Não informado",
                    data_reserva: data_reserva,
                    horario: horaEscolhida,
                    numero_pessoas: Number(qtd_pessoas) || 1,
                    observacoes: observacoes || "",
                    status: "Confirmada"
                }
            ])
            .select();

        if (error) {
            console.error("❌ Erro do Supabase na reserva:", error.message);
            throw error;
        }

        res.status(201).json({ sucesso: true, reserva: data[0] });
    } catch (error) {
        console.error("Erro ao salvar reserva:", error.message);
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}... Acesse em http://localhost:${PORT}`);
});