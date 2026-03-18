#!/usr/bin/env python
import urllib.request
import json
import sys

print("🧪 Testando Dashboard API")
print("-" * 50)

# Test 1: Fetch dados_organizados.json
print("\n1️⃣  Testando carregamento de dados_organizados.json...")
try:
    response = urllib.request.urlopen('http://localhost:8000/dados_organizados.json')
    data = json.loads(response.read().decode())
    print(f"✅ JSON carregado com sucesso!")
    print(f"   - Horários: {len(data.get('horarios', []))}")
    print(f"   - Estatísticas: {len(data.get('estatisticas', []))}")
    print(f"   - Arquivo válido: {data.get('metadata', {})}")
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

# Test 2: Fetch index.html
print("\n2️⃣  Testando carregamento de index.html...")
try:
    response = urllib.request.urlopen('http://localhost:8000/index.html')
    content = response.read().decode('utf-8', errors='ignore')
    
    # Check key elements
    checks = {
        'Document has <!DOCTYPE': '<!DOCTYPE' in content,
        'Navigation exists': 'navItems' in content,
        'Content container exists': 'contentContainer' in content,
        'Font Awesome loaded': 'fontawesome' in content.lower() or 'font awesome' in content.lower(),
        'script.js referenced': 'script.js' in content,
        'styles.css referenced': 'styles.css' in content
    }
    
    print(f"✅ HTML carregado com sucesso!")
    for check, result in checks.items():
        status = "✅" if result else "❌"
        print(f"   {status} {check}")
    
    if not all(checks.values()):
        print("⚠️  Alguns elementos está faltando!")
        
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

# Test 3: Fetch script.js
print("\n3️⃣  Testando carregamento de script.js...")
try:
    response = urllib.request.urlopen('http://localhost:8000/script.js')
    content = response.read().decode('utf-8', errors='ignore')
    
    checks = {
        'Class Dashboard defined': 'class Dashboard' in content,
        'loadData() method': 'loadData()' in content or 'loadData () {' in content,
        'renderCards() method': 'renderCards()' in content or 'renderCards () {' in content,
        'createHorarioCard() method': 'createHorarioCard(' in content,
    }
    
    print(f"✅ script.js carregado com sucesso!")
    for check, result in checks.items():
        status = "✅" if result else "❌"
        print(f"   {status} {check}")
        
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

# Test 4: Fetch styles.css
print("\n4️⃣  Testando carregamento de styles.css...")
try:
    response = urllib.request.urlopen('http://localhost:8000/styles.css')
    content = response.read().decode('utf-8', errors='ignore')
    print(f"✅ styles.css carregado com sucesso ({len(content)} bytes)")
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)

print("\n" + "=" * 50)
print("🎉 Todos os testes passaram!")
print("=" * 50)
print("\n📌 Próximos passos:")
print("1. Abra http://localhost:8000/index.html no navegador")
print("2. Pressione F12 para abrir DevTools e checar Console")
print("3. Verifique se aparecem mensagens como:")
print("   🚀 Inicializando dashboard...")
print("   ✅ Dados carregados, configurando interface...")
print("   🎉 Dashboard inicializado com sucesso!")
