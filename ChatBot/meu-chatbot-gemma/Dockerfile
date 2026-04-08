# Dockerfile para Hugging Face Spaces
FROM python:3.10-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Define diretório de trabalho
WORKDIR /app

# Copia requirements e instala pacotes Python
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copia o resto do código
COPY --chown=user . .

# Expõe a porta
EXPOSE 7860

# Comando para rodar o app (use porta 7860 para HF)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]