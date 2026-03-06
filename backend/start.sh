#!/bin/bash

# Script di avvio backend

echo "🚀 Avvio Portale Assistenza Backend..."

# Crea ambiente virtuale se non esiste
if [ ! -d "venv" ]; then
    echo "📦 Creazione ambiente virtuale..."
    python3 -m venv venv
fi

# Attiva ambiente virtuale
echo "⚙️ Attivazione ambiente virtuale..."
source venv/bin/activate

# Installa dipendenze
echo "📚 Installazione dipendenze..."
pip install -r requirements.txt

# Copia file .env.example in .env
if [ ! -f ".env" ]; then
    echo "🔐 Creazione file .env..."
    cp .env.example .env
    echo "⚠️  Modifica il file .env con le tue configurazioni!"
fi

# Avvia server
echo "🌐 Avvio server su http://localhost:8000"
echo "📖 Documentazione API su http://localhost:8000/docs"
echo "Pressione Ctrl+C per fermare il server"
echo ""

python main.py
