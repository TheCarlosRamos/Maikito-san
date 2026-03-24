# Configuração do Google Calendar API

## 📋 Visão Geral

O sistema agora suporta integração com Google Calendar para criar eventos automaticamente quando um agendamento é confirmado.

## 🚀 Como Funciona

### 1. **Método Automático (API)**
- Requer configuração no Google Cloud Console
- Cria eventos diretamente via API
- Envia convites por e-mail
- Configura lembretes automáticos

### 2. **Método Alternativo (Link)**
- Não requer configuração
- Abre página do Google Calendar pré-preenchida
- Usuário confirma manualmente
- Funciona imediatamente

## ⚙️ Configuração da API (Opcional)

### Passo 1: Criar Projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Nome: "Maikito-san Dashboard"

### Passo 2: Habilitar Calendar API
1. No menu, vá para "APIs & Services" → "Library"
2. Procure por "Google Calendar API"
3. Clique em "Enable"

### Passo 3: Criar Credenciais
1. Vá para "APIs & Services" → "Credentials"
2. Clique em "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure:
   - **Application type**: Web application
   - **Name**: Maikito-san Dashboard
   - **Authorized JavaScript origins**: `http://localhost:8000`
   - **Authorized redirect URIs**: `http://localhost:8000`

### Passo 4: Obter Chaves
1. Após criar, copie:
   - **Client ID**
   - **API Key** (se necessário)

### Passo 5: Configurar no Sistema
1. Abra `google-calendar.js`
2. Substitua:
   ```javascript
   this.CLIENT_ID = 'YOUR_CLIENT_ID'; // Cole seu Client ID aqui
   this.API_KEY = 'YOUR_API_KEY'; // Cole sua API Key aqui
   ```

## 🎯 Usando o Sistema

### Preenchimento do Formulário
1. **Nome do Aluno**: Digite o nome completo
2. **Turma**: Ex: "KIDS 1 - SEGUNDA"
3. **Professor**: Nome do professor
4. **E-mail**: E-mail do aluno (para convite)
5. **Data e Horário**: Selecione disponibilidade
6. **Motivo**: Descreva o motivo da reposição
7. **☑️ Criar evento**: Mantenha marcado

### Fluxo de Agendamento
1. Preencha todos os campos
2. Clique em "Agendar Reposição"
3. Confirme os dados no modal
4. **Se configurado**: Evento criado automaticamente
5. **Se não configurado**: Link para Google Calendar aberto

## 📧 Funcionalidades do Evento

### Informações Incluídas
- ✅ **Título**: "Reposição: [Nome do Aluno]"
- ✅ **Descrição**: Todos os detalhes do agendamento
- ✅ **Participantes**: E-mail do aluno (se fornecido)
- ✅ **Lembretes**: 1 dia antes (e-mail) + 30 min antes (popup)
- ✅ **Cor**: Baseada no status (verde=confirmado, laranja=pendente)

### Exemplo de Evento Criado
```
📅 Título: Reposição: Millena Queiroz de Assis
📝 Descrição: 
   Agendamento de reposição para Millena Queiroz de Assis
   Turma: FRANCES 2 - SÁBADO
   Professor: Prof. Nome
   Motivo: Falta justificada
   Status: pendente
👥 Participantes: millena@email.com
⏰ Lembretes: 1 dia antes + 30 min antes
```

## 🔧 Solução de Problemas

### Problema: "API não inicializada"
**Causa**: Credenciais não configuradas
**Solução**: Use método alternativo (link) ou configure API

### Problema: "Erro de autorização"
**Causa**: Domínio não autorizado
**Solução**: Adicione seu domínio às origens autorizadas

### Problema: "Evento não criado"
**Causa**: Permissões negadas
**Solução**: Verifique permissões do Calendar

## 🎨 Personalização

### Cores dos Eventos
- `pendente`: Laranja (#6)
- `confirmado`: Verde (#2)
- `realizado`: Verde escuro (#10)
- `cancelado`: Vermelho (#11)

### Duração Padrão
- **60 minutos** (configurável em `calcularDataFim`)

### Fuso Horário
- **America/Sao_Paulo** (configurável)

## 📊 Benefícios

### Para Alunos
- 📧 **Convites automáticos** por e-mail
- ⏰ **Lembretes** inteligentes
- 📱 **Acesso mobile** via Google Calendar
- 🔔 **Notificações** push

### Para Professores
- 📋 **Visibilidade** das reposições
- 🕐 **Controle** de agenda
- 📊 **Relatórios** automáticos
- 🔄 **Sincronização** com outros dispositivos

### Para Secretaria
- 🎯 **Organização** centralizada
- 📈 **Estatísticas** de uso
- 📝 **Histórico** completo
- 🔄 **Backup** automático

## 🚀 Próximos Passos

1. **Teste sem configuração** (funciona imediatamente)
2. **Configure API** (opcional, para automação total)
3. **Personalize cores** e lembretes
4. **Integre com outros sistemas**

## 📞 Suporte

- 📧 **E-mail**: suporte@maikito-san.com
- 📚 **Documentação**: [Google Calendar API](https://developers.google.com/calendar)
- 🎥 **Vídeos**: Tutoriais disponíveis

---

**Nota**: O sistema funciona perfeitamente mesmo sem configurar a API, usando o método de link alternativo!
