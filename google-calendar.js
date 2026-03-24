// Serviço de Integração com Google Calendar (Versão Simplificada)
class GoogleCalendarService {
    constructor() {
        console.log('📅 Google Calendar Service inicializado (modo link)');
    }

    // Criar evento via link (funciona imediatamente sem configuração)
    criarEventoViaLink(agendamento) {
        console.log('🔄 Criando lembrete no Google Calendar...');
        
        const dataInicio = this.formatarDataParaGoogle(agendamento.data, agendamento.horario);
        const dataFim = this.calcularDataFim(dataInicio, 15); // 15 minutos de lembrete

        const titulo = encodeURIComponent(`📅 Lembrete: Reposição - ${agendamento.aluno}`);
        const descricao = encodeURIComponent(
            `📋 AGENDAMENTO DE REPOSIÇÃO\n\n` +
            `👤 Aluno: ${agendamento.aluno}\n` +
            `📚 Turma: ${agendamento.turma}\n` +
            `👨‍🏫 Professor: ${agendamento.professor}\n` +
            `📧 E-mail: ${agendamento.email}\n` +
            `💭 Motivo: ${agendamento.motivo}\n` +
            `📊 Status: ${agendamento.status}\n\n` +
            `⏰ Este é um lembrete automático da reposição agendada.\n` +
            `📍 Maikito-san Centro de Idiomas`
        );

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${titulo}` +
            `&dates=${dataInicio.replace(/-:/g, '')}/${dataFim.replace(/-:/g, '')}` +
            `&details=${descricao}` +
            `&location=Maikito-san Centro de Idiomas` +
            `&trp=false` + // Sem opções de reunião
            `&sf=true` + // Mostrar como "ocupado"
            `&src=default`; // Calendário padrão

        // Abrir em nova aba
        window.open(googleCalendarUrl, '_blank');
        
        console.log('✅ Lembrete criado no Google Calendar:', googleCalendarUrl);
        return { success: true, method: 'lembrete', url: googleCalendarUrl };
    }

    // Formatar data para o formato do Google Calendar
    formatarDataParaGoogle(dataString, horario) {
        const [ano, mes, dia] = dataString.split('-');
        const [hora, minuto] = horario.split(':');
        
        return `${ano}${mes}${dia}T${hora}${minuto}00`;
    }

    // Calcular data de fim baseada na duração
    calcularDataFim(dataInicio, duracaoMinutos) {
        const data = new Date();
        const [ano, mes, dia] = dataInicio.slice(0, 8).match(/(\d{4})(\d{2})(\d{2})/).slice(1);
        const [hora, minuto] = dataInicio.slice(9, 13).match(/(\d{2})(\d{2})/).slice(1);
        
        data.setFullYear(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        data.setHours(parseInt(hora), parseInt(minuto) + duracaoMinutos, 0);
        
        const fimAno = data.getFullYear();
        const fimMes = String(data.getMonth() + 1).padStart(2, '0');
        const fimDia = String(data.getDate()).padStart(2, '0');
        const fimHora = String(data.getHours()).padStart(2, '0');
        const fimMinuto = String(data.getMinutes()).padStart(2, '0');
        
        return `${fimAno}${fimMes}${fimDia}T${fimHora}${fimMinuto}00`;
    }

    // Verificar se o usuário está autenticado (sempre false para modo link)
    isAuthenticated() {
        return false;
    }
}

// Exportar para uso global
window.GoogleCalendarService = GoogleCalendarService;
