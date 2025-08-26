# Garage-TraeUI

Administrative interface for the Garage S3 server

This administrative interface was created as a test of the SOLO mode of the Trae development environment, and its code was written entirely by its AI agent (GPT-5).

It is a modern administrative interface, capable of covering most of the management needs for this excellent server.

The internationalized version is currently under development.

The interface is functional, although some of its final features are still under development and a few details need to be ironed out.

This is a sub-project of the LSSA Project (https://github.com/iz0eyj/LSSA) and is released under a separate license specified in the LICENSE-sw.md file.

---

NOTE: We have no affiliation with either Trae or Garage.

Console web amministrativa Garage-TraeUI per Garage S3 - Un'interfaccia moderna e intuitiva per la gestione del tuo cluster Garage.

## 🚀 Caratteristiche

- **Dashboard Completa**: Panoramica in tempo reale dello stato del cluster
- **Gestione Cluster**: Monitoraggio nodi, layout e configurazioni
- **Gestione Bucket**: Creazione, configurazione e gestione bucket S3
- **Chiavi di Accesso**: Gestione completa delle chiavi di accesso e permessi
- **Metriche Avanzate**: Monitoraggio prestazioni e utilizzo risorse
- **Interfaccia Moderna**: UI responsive costruita con React e Tailwind CSS
- **API RESTful**: Backend robusto con Express.js e TypeScript

## 🏗️ Architettura

```
garage-traeui-console/
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Express.js + TypeScript
├── shared/            # Tipi TypeScript condivisi
└── README.md
```

## 📋 Prerequisiti

- **Node.js** >= 18.0.0
- **npm** o **pnpm**
- **Garage S3 Server** v2.x con Admin API abilitata

## ⚙️ Configurazione

### 1. Configurazione Garage

Assicurati che il tuo server Garage abbia l'Admin API abilitata:

```toml
# garage.toml
[admin]
api_bind_addr = "[::]:3903"
admin_token = "your-admin-token-here"
metrics_token = "your-metrics-token-here"
```

### 2. Configurazione Backend

Copia e modifica il file di configurazione:

```bash
cp backend/.env.example backend/.env
```

Modifica `backend/.env`:

```env
# Configurazione Garage
GARAGE_API_URL=http://192.68.x.x:3903
GARAGE_ADMIN_TOKEN=xxxxxx

# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Configurazione Frontend

Il frontend è già configurato per connettersi al backend locale. Se necessario, modifica `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Installazione e Avvio

### Installazione Rapida

```bash
# Installa tutte le dipendenze
npm run install:all

# Avvia frontend e backend contemporaneamente
npm run dev
```

### Installazione Manuale

```bash
# Installa dipendenze root
npm install

# Installa dipendenze backend
cd backend && npm install

# Installa dipendenze frontend
cd ../frontend && npm install

# Installa dipendenze shared
cd ../shared && npm install
```

### Avvio Sviluppo

```bash
# Avvia tutto (consigliato)
npm run dev

# Oppure avvia separatamente:
npm run dev:backend   # Backend su porta 3001
npm run dev:frontend  # Frontend su porta 5173
```

## 🌐 Accesso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 📚 API Endpoints

### Test e Connessione
- `GET /api/test/connection` - Test connessione a Garage
- `GET /api/test/auth` - Test autenticazione
- `GET /api/test/system` - Test completo del sistema

### Cluster
- `GET /api/cluster/status` - Stato del cluster
- `GET /api/cluster/layout` - Layout del cluster
- `GET /api/cluster/info` - Informazioni complete
- `GET /api/cluster/stats` - Statistiche cluster

### Bucket
- `GET /api/buckets` - Lista bucket
- `POST /api/buckets` - Crea bucket
- `GET /api/buckets/:id` - Dettagli bucket
- `PUT /api/buckets/:id` - Aggiorna bucket
- `DELETE /api/buckets/:id` - Elimina bucket
- `GET /api/buckets/stats/summary` - Statistiche bucket

### Chiavi di Accesso
- `GET /api/keys` - Lista chiavi
- `POST /api/keys` - Crea chiave
- `GET /api/keys/:id` - Dettagli chiave
- `PUT /api/keys/:id` - Aggiorna chiave
- `DELETE /api/keys/:id` - Elimina chiave
- `GET /api/keys/stats/summary` - Statistiche chiavi

### Metriche
- `GET /api/metrics` - Metriche elaborate
- `GET /api/metrics/raw` - Metriche Prometheus raw
- `GET /api/metrics/cluster` - Metriche cluster
- `GET /api/metrics/storage` - Metriche storage
- `GET /api/metrics/health` - Health check metriche

## 🔧 Sviluppo

### Struttura del Progetto

```
frontend/
├── src/
│   ├── components/     # Componenti React
│   ├── lib/           # Utilities e API client
│   ├── App.tsx        # Componente principale
│   └── main.tsx       # Entry point
├── public/            # Asset statici
└── dist/              # Build di produzione

backend/
├── src/
│   ├── routes/        # Route API
│   ├── services/      # Servizi (Garage client)
│   ├── middleware/    # Middleware Express
│   ├── utils/         # Utilities
│   └── server.ts      # Server principale
└── dist/              # Build di produzione

shared/
└── types.ts           # Tipi TypeScript condivisi
```

### Script Disponibili

```bash
# Sviluppo
npm run dev              # Avvia frontend + backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Build
npm run build            # Build completo
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Test
npm run test             # Esegui tutti i test
npm run test:frontend    # Test frontend
npm run test:backend     # Test backend

# Utilities
npm run install:all      # Installa tutte le dipendenze
npm run clean            # Pulisci build e node_modules
```

## 🐛 Troubleshooting

### Errori Comuni

**1. Errore di connessione a Garage**
```
Errore: Impossibile connettersi al server Garage
```
- Verifica che Garage sia in esecuzione
- Controlla l'URL in `backend/.env`
- Verifica che l'Admin API sia abilitata

**2. Errore di autenticazione**
```
Errore: Token di autenticazione non valido
```
- Verifica il token admin in `backend/.env`
- Controlla che il token sia corretto in `garage.toml`

**3. Errore CORS**
```
Errore: CORS policy
```
- Verifica `CORS_ORIGIN` in `backend/.env`
- Assicurati che corrisponda all'URL del frontend

### Debug

```bash
# Abilita logging dettagliato
export LOG_LEVEL=debug
npm run dev:backend

# Test connessione manuale
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3903/v1/status
```

## 📦 Deployment

### Build di Produzione

```bash
# Build completo
npm run build

# I file saranno in:
# - frontend/dist/  (file statici)
# - backend/dist/   (server Node.js)
```

### Docker (Opzionale)

```dockerfile
# Dockerfile esempio per il backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/dist ./dist
COPY shared ./shared
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

# 🚀