// Captura o envio do formulário de reserva
const formReserva = document.querySelector('form');

if (formReserva) {
    formReserva.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita que a página recarregue sozinha

        // Pega os valores digitados nos inputs do formulário de reserva
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const dataReserva = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const pessoas = document.getElementById('pessoas').value;
        const obs = document.getElementById('obs') ? document.getElementById('obs').value : '';

        // Envia os dados para a tabela 'reservas' no Supabase usando a conexão centralizada
        const { data, error } = await supabase
            .from('reservas')
            .insert([
                { 
                    nome: nome, 
                    telefone: telefone, 
                    data_reserva: dataReserva, 
                    horario: horario, 
                    numero_pessoas: parseInt(pessoas), 
                    observacoes: obs 
                }
            ]);

        if (error) {
            console.error('Erro ao salvar reserva:', error);
            alert('Erro ao realizar a reserva. Verifique o console.');
        } else {
            alert('Reserva realizada com sucesso!');
            formReserva.reset(); // Limpa o formulário após enviar
        }
    });
}