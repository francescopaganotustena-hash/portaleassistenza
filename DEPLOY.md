# Deploy su Render.com (Backend)

## Istruzioni passo-passo

### 1. Accedi a Render.com
- Vai su https://dashboard.render.com
- Clicca **"New +"** → **"Web Service"**

### 2. Collega il repository
- Seleziona **"Build and deploy from a Git repository"**
- Connetti il tuo account GitHub
- Seleziona il repository `portaleassistenza`
- Seleziona il branch `main`

### 3. Configura il servizio
- **Name**: `portale-assistenza`
- **Environment**: `Python`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`

### 4. Variabili d'ambiente
Aggiungi queste variabili:
```
PYTHON_VERSION = 3.11
DEBUG = false
SECRET_KEY = (genera una chiave sicura con: python -c "import secrets; print(secrets.token_hex(32))")
ALLOWED_ORIGINS = ["https://francescopaganotustena-hash.github.io"]
```

### 5. Crea il servizio
- Clicca **"Create Web Service"**
- Attendi il deploy (2-5 minuti)

### 6. URL del backend
Una volta completato, avrai un URL come:
`https://portale-assistenza.onrender.com`

---

# Deploy del Frontend su GitHub Pages

### 1. Abilita GitHub Pages
- Repository → **Settings** → **Pages**
- Source: `main` → `/ (root)`
- Clicca **Save**

### 2. Aggiorna configurazione
Dopo aver deployato il backend su Render, aggiorna `js/config.js`:

```javascript
BASE_URL: 'https://TUO-BACKEND.onrender.com/api',
```

### 3. Commit e push
```bash
git add .
git commit -m "Configurazione produzione"
git push
```

---

# Alternativa: Tutto su Render

Puoi anche servire i file statici da Render aggiungendo un `static.yaml` o usando un servizio separato.
