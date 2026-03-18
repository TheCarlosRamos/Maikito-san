## 🔧 Instruções para Debug

Se o dashboard não estiver carregando, siga estes passos:

### 1️⃣ **Abra o Console do Navegador**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **"Console"**

### 2️⃣ **Verifique os logs**
Você deve ver mensagens como:
```
🚀 Inicializando dashboard...
📡 Carregando dados_organizados.json...
✅ Dados organizados carregados: { ... }
📊 Horários: 256
📈 Estatísticas: 9
✅ Dados carregados, configurando interface...
🎉 Dashboard inicializado com sucesso!
```

### 3️⃣ **Se houver erro**
Procure por mensagens em vermelho começadas com:
- `❌ Erro ao carregar dados`
- `❌ Erro em renderHorariosCards`
- `ERRO GLOBAL`

### 4️⃣ **Teste a versão simples primeiro**
```
http://localhost:8000/simples.html
```
Se esta funcionar e a principal não, o problema é no CSS ou no JavaScript complexo.

### 5️⃣ **Teste a página de teste**
```
http://localhost:8000/teste.html
```
Se esta falhar, o problema é no servidor HTTP ou no arquivo JSON.

### 6️⃣ **Teste debug dashboard**
```
http://localhost:8000/debug.html
```
Mostra o console lado a lado com o dashboard.

---

## 📋 Resolução de Problemas

| Problema | Solução |
|----------|---------|
| **"Não carrega nada"** | Abra F12 e verifique se há erros no console |
| **"Arquivo não encontrado"** | Certifique-se que `dados_organizados.json` existe |
| **"Dados indefinidos"** | O arquivo JSON pode estar corrompido - regenere com `reorganizar_dados.py` |
| **"Cards em branco"** | Verifique se o CSS está carregando (estilos.css) |

---

## 🔄 Para regenerar os dados:

```bash
python reorganizar_dados.py
```

Isso recria o arquivo `dados_organizados.json` a partir de `dados.json`.
