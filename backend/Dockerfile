# Backend Portale Assistenza - Dockerfile
FROM python:3.11-slim

# Imposta variabili d'ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Crea directory di lavoro
WORKDIR /app

# Installa dipendenze di sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia file dipendenze
COPY requirements.txt .

# Installa dipendenze Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia codice applicazione
COPY . .

# Crea directory uploads
RUN mkdir -p uploads

# Esponi porta
EXPOSE 8000

# Comando avvio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
