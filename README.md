# Portale Assistenza Studio81 SRL - Documentazione del Progetto

## Panoramica

Sito web completo per la gestione dell'assistenza clienti per **Studio81 SRL** con sistema di ticket, registrazione utente e dashboard personale. Tutte le funzionalità sono implementate lato frontend con persistenza dei dati tramite localStorage.

## Struttura dei File

```
PortaileAssistenza/
├── index.html              # Pagina principale con form ticket e FAQ
├── login.html              # Pagina login
├── registrazione.html      # Pagina registrazione utente
├── dashboard.html         # Dashboard utente con lista ticket
├── profilo.html           # Gestione profilo utente
├── ticket-dettaglio.html  # Dettaglio singolo ticket
├── css/
│   ├── style.css          # Stili principali (tema scuro)
│   ├── auth.css           # Stili pagine autenticazione
│   └── dashboard.css      # Stili dashboard e profilo
├── js/
│   ├── api-client.js      # Client API per comunicazione con backend
│   ├── config.js          # Configurazione generale
│   ├── storage.js         # Gestione localStorage (utenti e ticket)
│   ├── auth.js            # Gestione login/registrazione
│   ├── dashboard.js       # Gestione dashboard e visualizzazione ticket
│   └── main.js            # Funzionalità principali (header, hamburger, form)
├── backend/               # Backend completo in Python + FastAPI
│   ├── main.py            # Entry point del backend
│   ├── requirements.txt   # Dipendenze Python
│   ├── Dockerfile         # Configurazione Docker
│   ├── docker-compose.yml # Orchestrazione Docker
│   ├── start.sh           # Script di avvio
│   ├── .env.example       # Esempio configurazione ambiente
│   └── app/               # Codice sorgente backend
│       ├── controllers/   # Controller API
│       ├── services/      # Logica di business
│       ├── routes/        # Endpoint API
│       ├── schemas/       # Modelli Pydantic
│       ├── models/        # Modelli Database
│       ├── middleware/    # Middleware (auth, error)
│       ├── utils/         # Utility functions
│       └── config.py      # Configurazione backend
├── Dockerfile             # Configurazione Docker frontend
├── docker-compose.yml     # Composizione servizi completa
└── README.md              # Documentazione del progetto
```

## Funzionalità Implementate

### Autenticazione
- **Registrazione**: Creazione account con validazione password (min 8 caratteri, numero, lettera)
- **Login**: Accesso con email/password
- **Sessione**: Persistenza login con localStorage
- **Logout**: Disconnessione e reindirizzamento

### Gestione Ticket
- **Creazione ticket**: Form completo con categoria, priorità, oggetto, messaggio e allegati (accessibile solo agli utenti registrati)
- **Lista ticket**: Visualizzazione con statistiche (aperti, in lavorazione, risolti)
- **Filtri**: Per stato, categoria e ricerca testuale
- **Dettaglio ticket**: Cronologia messaggi completa
- **Aggiunta messaggi**: Possibilità di rispondere ai ticket

### Profilo Utente
- **Visualizzazione**: Dati account e info registrazione
- **Modifica**: Nome, cognome, email, telefono
- **Cambio password**: Con verifica password attuale

### Interfaccia
- **Design**: Tema scuro con colori personalizzati
- **Responsive**: Funziona su desktop, tablet e mobile
- **Accessibilità**: Skip-link, aria-label, focus styles
- **Animazioni**: Fade-in, effetti hover, transizioni

## Colori (CSS Variables)

```css
--primary-dark: #001c20;        /* Sfondo principale */
--bg-light: #e8f4f8;            /* Sfondo chiaro */
--bg-white: #1a3a47;            /* Sfondo secondario (card) */
--accent: #00d4ff;              /* Colore accent (cyan) */
--gray-medium: #5a7a8a;         /* Grigio medio */
--gray-light: #3d5a6a;          /* Grigio chiaro */
--text-dark: #e8f4f8;           /* Testo chiaro */
--text-light: #a8c4d4;          /* Testo grigio chiaro */
--accent-secondary: #a78bfa;   /* Colore secondario (viola) */
```

## Tempo di Risposta

Il sistema indica un tempo di risposta di **2-6 ore** lavorative.

## Come Utilizzare

1. Aprire `login.html` nel browser
2. Cliccare "Registrati" per creare un account
3. Dopo la registrazione, effettuare il login
4. Dalla dashboard è possibile creare e gestire ticket
5. I dati persistono nel browser tramite localStorage

## Note Tecniche

- **Persistenza**: I dati sono salvati nel localStorage del browser. Cancellando i dati del browser si perdono tutti gli account e ticket creati.
- **Sicurezza**: Le password sono semplicemente "hashate" lato client. Per un sito di produzione è necessario un backend con crittografia reale.
- **Simulazione**: Il cambio di stato dei ticket è simulato. In produzione servirebbe un'API per gestire i stati reali.

## 🚀 MIGRAZIONE A BACKEND COMPLETA! ✅

### Backend Implementato

Il progetto ora include un **backend completo** sviluppato con **Python + FastAPI**!

#### Struttura Backend

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
├── Dockerfile              # Configurazione Docker
├── docker-compose.yml      # Orchestrazione
└── README.md               # Documentazione backend
```

#### Come Avviare il Backend

```bash
cd backend

# Opzione 1: Script di avvio
./start.sh

# Opzione 2: Manuale
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Il backend sarà disponibile su:
- **API**: http://localhost:8000
- **Documentazione**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

#### Endpoint API Disponibili

| Endpoint | Descrizione |
|----------|-------------|
| `POST /api/auth/register` | Registra nuovo utente |
| `POST /api/auth/login` | Login utente |
| `POST /api/auth/logout` | Logout utente |
| `GET /api/auth/me` | Ottieni utente corrente |
| `GET /api/users/me` | Ottieni profilo |
| `PUT /api/users/me` | Aggiorna profilo |
| `POST /api/tickets` | Crea ticket |
| `GET /api/tickets` | Lista miei ticket |
| `GET /api/tickets/{id}` | Dettaglio ticket |
| `PUT /api/tickets/{id}` | Aggiorna ticket |
| `POST /api/tickets/{id}/status` | Aggiorna stato |
| `DELETE /api/tickets/{id}` | Elimina ticket |
| `POST /api/{ticket_id}/messages` | Aggiungi messaggio |
| `GET /api/{ticket_id}/messages` | Lista messaggi |
| `GET /api/admin/dashboard/stats` | Statistiche admin |
| `GET /api/admin/tickets` | Lista tutti i ticket |

#### Frontend Aggiornato

I file JavaScript sono stati aggiornati per usare le API:

- ✅ `js/api-client.js` - Nuovo client API
- ✅ `js/storage.js` - Migrato da localStorage a API
- ✅ `js/auth.js` - Aggiornato per usare API
- ✅ `js/config.js` - Nuova configurazione

#### Database

Il backend supporta:
- **SQLite** (default, per sviluppo)
- **PostgreSQL** (raccomandato per produzione)

Per usare PostgreSQL:
```bash
pip install psycopg2-binary
```

Modifica `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/portale_assistenza
```

## Evoluzioni Future Possibili

- ✅ Backend con database reale (IMPLEMENTATO!)
- Notifiche email (nodemailer)
- Upload file reale (AWS S3, etc.)
- Dashboard admin per gestione ticket
- Sistema di assegnazione ticket agli operatori
- Chat in tempo reale (WebSocket)
- FAQ dinamiche gestibili da admin
- Sistema di votazione risoluzione
- Export ticket in PDF
- Notifiche push
- Multi-lingua

## Cronologia Modifiche

### 2026-03-06 - Modifiche al nome e stile

| File | Modifica | Dettaglio |
|------|----------|-----------|
| index.html | Nome sito | Cambiato da "Assistenza Clienti" a "PORTALE Assistenza Studio81 SRL" in title, meta, logo e footer |
| login.html | Nome sito | Aggiornato title, og:title e logo |
| registrazione.html | Nome sito | Aggiornato title, meta description, og:title e logo |
| dashboard.html | Nome sito | Aggiornato title, og:title e logo |
| profilo.html | Nome sito | Aggiornato title, og:title e logo |
| ticket-dettaglio.html | Nome sito | Aggiornato logo |
| js/main.js | Commento | Aggiornato header comment |
| index.html | Stile h1 | Rimosso `<span class="highlight">` da "aiutarti?" per uniformare lo stile al resto del testo |

### 2026-03-09 - Modifiche per rendere il form di creazione ticket accessibile solo agli utenti registrati

| File | Modifica | Dettaglio |
|------|----------|-----------|
| index.html | Rimozione form | Rimosso completamente il form di creazione ticket dalla sezione "Contact CTA" |
| dashboard.html | Aggiunta form | Aggiunto il form di creazione ticket all'interno del dashboard, accessibile solo agli utenti registrati |
| dashboard.html | Aggiornamento navigazione | Modificato il link "Nuovo Ticket" nel sidebar per puntare al form nel dashboard anziché a index.html |
| dashboard.html | Aggiunta logica UI | Aggiunti pulsanti per mostrare/nascondere il form di creazione ticket |
| js/dashboard.js | Aggiunta logica JavaScript | Implementata la funzionalità per mostrare/nascondere il form e gestire l'invio dei ticket |
| js/dashboard.js | Aggiornamento rendering lista vuota | Modificato il link "Nuovo Ticket" nell'area vuota della lista ticket per chiamare la funzione showTicketForm() |

### Miglioramenti Grafici ed Estetici

Di recente sono stati implementati significativi miglioramenti grafici ed estetici al Portale Assistenza:

#### 1. Ottimizzazione del sistema di colori
- Implementato un sistema di variabili CSS completo per garantire coerenza visiva
- Aggiunto supporto per modalità chiara/scuro
- Ottimizzate le palette di colori per migliorare il contrasto e l'accessibilità

#### 2. Ottimizzazione della tipografia
- Aggiunte variabili per dimensioni, pesi e spaziature dei caratteri
- Migliorata la gerarchia visiva e la leggibilità
- Standardizzati i font per tutta l'applicazione

#### 3. Miglioramento dell'interfaccia utente
- Rivisitati i componenti come bottoni, form e card per renderli più coerenti e accattivanti
- Aggiunti effetti hover e transizioni fluide
- Implementati stili più moderni e professionali

#### 4. Miglioramento della dashboard
- Aggiornata l'interfaccia della dashboard con stili più moderni
- Integrate animazioni per una migliore esperienza utente
- Ottimizzata la visualizzazione delle statistiche

#### 5. Miglioramento delle pagine di autenticazione
- Ottimizzato l'aspetto delle pagine di login e registrazione
- Implementato design più coinvolgente e funzionale
- Aggiunti effetti visivi e transizioni

#### 6. Ottimizzazione delle animazioni
- Aggiunte diverse animazioni fluide per migliorare l'esperienza utente
- Implementati effetti di tipo fade-in, slide-in, scale-in
- Ottimizzate le performance delle animazioni

#### 7. Miglioramento della consistenza visiva
- Uniformati gli elementi tra tutte le pagine
- Garantita un'esperienza coerente in tutta l'applicazione
- Standardizzate dimensioni, spaziature e stili

#### 8. Ottimizzazione dell'esperienza mobile
- Implementato un approccio mobile-first
- Aggiunte media queries specifiche per ogni dimensione di schermo
- Garantita un'esperienza ottimale su tutti i dispositivi

### Istruzioni per Rollback

**Per ripristinare il nome precedente (Assistenza Clienti):**
- Sostituire "PORTALE Assistenza Studio81 SRL" con "Assistenza Clienti" nei seguenti file:
  - index.html: linee 6, 9, 10, 26, 206
  - login.html: linee 6, 9, 31
  - registrazione.html: linee 6, 7, 9, 31
  - dashboard.html: linee 6, 8, 22
  - profilo.html: linee 6, 8, 33
  - ticket-dettaglio.html: linea 146
  - js/main.js: linea 2
  - README.md: linea 1

**Per ripristinare lo stile di "aiutarti?" (testo evidenziato):**
- In index.html linea 51, cambiare:
  - Da: `<h1>Come possiamo aiutarti?</h1>`
  - A: `<h1>Come possiamo <span class="highlight">aiutarti?</span></h1>`
