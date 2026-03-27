// Serviço de Integração com WhatsApp (Versão Gratuita)
class WhatsAppService {
    constructor() {
        console.log('📱 WhatsApp Service inicializado (modo web)');
    }

    // Formatar número de telefone para o formato do WhatsApp
    formatarNumero(telefone) {
        // Remove todos os caracteres não numéricos
        const numeros = telefone.replace(/\D/g, '');
        
        // Verifica se começa com 0 (DDD) e remove
        if (numeros.length === 11 && numeros.startsWith('0')) {
            return '55' + numeros.substring(1);
        }
        
        // Verifica se já tem 55 (código do Brasil)
        if (numeros.length === 13 && numeros.startsWith('55')) {
            return numeros;
        }
        
        // Adiciona 55 se não tiver
        if (numeros.length === 11) {
            return '55' + numeros;
        }
        
        return numeros;
    }

    // Criar mensagem para WhatsApp
    criarMensagem(agendamento) {
        const mensagem = ` *LEMBRETE DE REPOSIÇÃO* \n\n` +
            ` *Aluno:* ${agendamento.aluno}\n` +
            ` *Turma:* ${agendamento.turma}\n` +
            ` *Professor:* ${agendamento.professor}\n` +
            ` *E-mail:* ${agendamento.email}\n` +
            ` *Data:* ${this.formatarData(agendamento.data)}\n` +
            ` *Horário:* ${agendamento.horario}\n` +
            ` *Motivo:* ${agendamento.motivo}\n\n` +
            ` *Este é um lembrete automático da sua reposição agendada.*\n` +
            ` *Confirmar presença e chegar com 10 minutos de antecedência.*`;

        return mensagem;
    }

    // Formatar data para exibição
    formatarData(dataString) {
        // Se já estiver no formato DD/MM/YYYY, só precisa converter para Date
        if (dataString.includes('/')) {
            const [dia, mes, ano] = dataString.split('/');
            const data = new Date(ano, mes - 1, dia);
            const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            
            return `${diasSemana[data.getDay()]}, ${dia}/${mes}/${ano}`;
        }
        
        // Se estiver no formato YYYY-MM-DD
        if (dataString.includes('-')) {
            const [ano, mes, dia] = dataString.split('-');
            const data = new Date(ano, mes - 1, dia);
            const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            
            return `${diasSemana[data.getDay()]}, ${dia}/${mes}/${ano}`;
        }
        
        // Fallback
        return dataString;
    }

    // Enviar mensagem via WhatsApp Web
    enviarMensagem(agendamento) {
        try {
            console.log('📱 Enviando mensagem via WhatsApp...');
            
            const numeroFormatado = this.formatarNumero(agendamento.telefone);
            const mensagem = this.criarMensagem(agendamento);
            const mensagemEncoded = encodeURIComponent(mensagem);
            
            const whatsappUrl = `https://wa.me/${numeroFormatado}?text=${mensagemEncoded}`;
            
            // Abrir em nova aba
            window.open(whatsappUrl, '_blank');
            
            console.log('✅ WhatsApp aberto com mensagem:', whatsappUrl);
            return { 
                success: true, 
                method: 'whatsapp-web', 
                url: whatsappUrl,
                numero: numeroFormatado
            };
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
            return { success: false, error: error.message };
        }
    }

    // Validar número de telefone
    validarNumero(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        
        // Verifica se tem 10 ou 11 dígitos (com DDD)
        if (numeros.length === 10 || numeros.length === 11) {
            return true;
        }
        
        // Verifica se tem 12 ou 13 dígitos (com código do país)
        if (numeros.length === 12 || numeros.length === 13) {
            return true;
        }
        
        return false;
    }

    // Aplicar máscara de telefone enquanto digita
    aplicarMascara(input) {
        let valor = input.value.replace(/\D/g, '');
        
        if (valor.length > 0) {
            // Adiciona parênteses no DDD
            if (valor.length <= 2) {
                valor = `(${valor}`;
            } else if (valor.length <= 6) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
            } else if (valor.length <= 10) {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
            } else {
                valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
            }
        }
        
        input.value = valor;
    }
}

// Exportar para uso global
window.WhatsAppService = WhatsAppService;
