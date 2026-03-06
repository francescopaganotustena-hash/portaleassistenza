# Backend Portale Assistenza Studio81

Backend API completo per il Portale Assistenza Studio81 SRL, sviluppato con **Python + FastAPI**.

## 🚀 Quick Start

### 1. Installazione

```bash
cd backend

# Crea ambiente virtuale
python3 -m venv venv

# Attiva ambiente virtuale
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Installa dipendenze
pip install -r requirements.txt
```

### 2. Configurazione

```bash
# Copia file configurazione
cp .env.example .env

# Modifica .env con le tue impostazioni
nano .env
```

### 3. Avvio

```bash
# Opzione A: Usa lo script di avvio
./start.sh

# Opzione B: Avvio manuale
python main.py
```

Il server sarà disponibile su:
- **API**: http://localhost:8000
- **Documentazione**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Struttura Progetto

```
backend/
├── app/
│   ├── controllers/        # Controller API
│   ├── services/           # Logica di business
│   │   ├── auth_service.py
│   │   ├── ticket_service.py
│   │   └── message_service.py
│   ├── routes/             # Endpoint API
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── ticket_routes.py
│   │   ├── message_routes.py
│   │   └── admin_routes.py
│   ├── schemas/            # Modelli Pydantic
│   ├── models/             # Modelli Database
│   ├── utils/              # Utility functions
│   ├── middleware/         # Middleware (auth, error)
│   ├── config.py           # Configurazione
│   └── database.py         # Configurazione DB
├── main.py                 # Entry point
├── requirements.txt        # Dipendenze Python
├── .env.example            # Esempio configurazione
└── start.sh                # Script avvio
```

## 🔧 Endpoint API

### Autenticazione
- `POST /api/auth/register` - Registra nuovo utente
- `POST /api/auth/login` - Login utente
- `POST /api/auth/logout` - Logout utente
- `GET /api/auth/me` - Ottieni utente corrente

### Utenti
- `GET /api/users/me` - Ottieni profilo
- `PUT /api/users/me` - Aggiorna profilo
- `GET /api/users` - Lista utenti (admin)
- `GET /api/users/{id}` - Ottieni utente

### Ticket
- `POST /api/tickets` - Crea ticket
- `GET /api/tickets` - Lista miei ticket
- `GET /api/tickets/{id}` - Dettaglio ticket
- `PUT /api/tickets/{id}` - Aggiorna ticket
- `POST /api/tickets/{id}/status` - Aggiorna stato
- `DELETE /api/tickets/{id}` - Elimina ticket

### Messaggi
- `POST /api/{ticket_id}/messages` - Aggiungi messaggio
- `GET /api/{ticket_id}/messages` - Lista messaggi

### Admin
- `GET /api/admin/dashboard/stats` - Statistiche dashboard
- `GET /api/admin/tickets` - Lista tutti i ticket
- `PUT /api/admin/tickets/{id}/assign` - Assegna ticket
- `PUT /api/admin/users/{id}/toggle-status` - Attiva/Disattiva utente

## 🗄️ Database

Il backend usa **SQLAlchemy** con supporto per:
- **SQLite** (default, per sviluppo)
- **PostgreSQL** (raccomandato per produzione)

### Per usare PostgreSQL:

```bash
# Installa driver
pip install psycopg2-binary

# Modifica .env
DATABASE_URL=postgresql://user:password@localhost:5432/portale_assistenza
```

## 🔐 Sicurezza

- ✅ Hashing password con bcrypt
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ Input validation con Pydantic
- ✅ CORS configurabile
- ✅ SQL injection prevention

## 📝 Variabili d'Ambiente

```env
# Application
APP_NAME="Portale Assistenza Studio81"
DEBUG=true
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./database.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (opzionale)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🧪 Testing

```bash
# Installa pytest
pip install pytest pytest-asyncio

# Esegui test
pytest
```

## 🚢 Deployment

### Opzione 1: VPS (DigitalOcean, Linode, etc.)

```bash
# Installa Python 3.11+
# Clona repository
# Crea ambiente virtuale
# Installa dipendenze
# Configura .env
# Avvia con systemd o supervisor
```

### Opzione 2: Docker

```bash
# Crea Dockerfile
docker build -t portale-assistenza-backend .
docker run -p 8000:8000 --env-file .env portale-assistenza-backend
```

### Opzione 3: PaaS (Railway, Render, Heroku)

```bash
# Push su GitHub
# Collega repository su Railway/Render
# Configura variabili d'ambiente
# Deploy automatico
```

## 🔄 Migrazione Frontend

Per collegare il frontend esistente:

1. **Aggiorna `js/storage.js`** per usare le API invece di localStorage
2. **Aggiorna `js/auth.js`** per usare endpoint `/api/auth/*`
3. **Aggiorna `js/dashboard.js`** per usare endpoint `/api/tickets/*`

Esempio di chiamata API:

```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.access_token);
```

## 📚 Documentazione API Completa

Una volta avviato il server, visita:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Sviluppo

### Aggiungi nuovo endpoint:

1. Crea service in `app/services/`
2. Crea route in `app/routes/`
3. Registra route in `main.py`
4. Aggiungi validazione in `app/schemas.py`

### Modella database:

1. Aggiungi modello in `app/models.py`
2. Crea migrazione: `alembic revision --autogenerate -m "descrizione"`
3. Applica migrazione: `alembic upgrade head`

## 📞 Supporto

Per problemi o domande, consulta:
- `BACKEND_GUIDA_COMPLETA.md`
- `BACKEND_CHECKLIST.md`
- `RIEPILOGO_MIGRAZIONE.md`

## 📄 Licenza

Proprietario: Studio81 SRL
