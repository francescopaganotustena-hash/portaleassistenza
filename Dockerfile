# Backend Portale Assistenza - Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copia i file del backend
COPY backend/requirements.txt .
COPY backend/main.py .
COPY backend/app ./app

# Installa dipendenze
RUN pip install --no-cache-dir -r requirements.txt

# Esponi porta
EXPOSE 8000

# Avvia server
CMD ["python", "main.py"]
