# Hyrox Tracker 🏃‍♂️

Application cloud-native full-stack pour le suivi des performances Hyrox.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Fonctionnalités](#fonctionnalités)
- [Installation locale](#installation-locale)
- [Déploiement](#déploiement)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Documentation API](#documentation-api)

## 🎯 Vue d'ensemble

Hyrox Tracker est une application permettant aux athlètes de suivre leurs performances lors des compétitions Hyrox et de leurs entraînements. L'application offre des analyses détaillées, un suivi de progression et des objectifs personnalisés.

**URL de production**: [À venir après déploiement]

## 🏗️ Architecture

L'application suit une architecture cloud-native avec séparation frontend/backend :

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
    ┌────▼────┐
    │   CDN   │ (Vercel Edge Network)
    └────┬────┘
         │
┌────────▼─────────┐
│  Frontend (SPA)  │
│   Angular 21     │ → Vercel (PaaS)
└────────┬─────────┘
         │ HTTPS
         │
┌────────▼─────────┐
│   API Gateway    │
│   NestJS + JWT   │ → Railway/Render (PaaS)
└────┬────┬────────┘
     │    │
     │    └──────────┐
     │               │
┌────▼────┐   ┌─────▼──────┐
│Database │   │  Storage   │
│PostgreSQL│   │  Supabase  │
└─────────┘   └────────────┘
```

### Services Cloud utilisés

| Service | Provider | Usage | Coût |
|---------|----------|-------|------|
| Frontend Hosting | Vercel | Hébergement SPA + CDN | Gratuit |
| Backend Hosting | Railway/Render | API REST conteneurisée | Gratuit |
| Database | Supabase | PostgreSQL managé | Gratuit |
| Storage | Supabase Storage | Stockage fichiers | Gratuit |
| CI/CD | GitHub Actions | Pipeline automatisée | Gratuit |
| Monitoring | Sentry | Error tracking | Gratuit (5k events/mois) |
| Uptime Monitoring | UptimeRobot | Health checks | Gratuit |

## 🚀 Technologies

### Frontend
- **Framework**: Angular 21 (standalone components)
- **Styling**: Tailwind CSS
- **State Management**: Angular Signals
- **HTTP**: HttpClient avec interceptors
- **Charts**: Chart.js / ng2-charts
- **Forms**: Reactive Forms

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Winston (logs)
- **Database**: PostgreSQL 15

## ✨ Fonctionnalités

### 1. Authentification & Profil
- ✅ Inscription / Connexion (email + password)
- ✅ Gestion du profil (nom, catégorie, poids, taille)
- ✅ Objectifs personnels

### 2. Dashboard
- ✅ Vue globale des performances
- ✅ Prochain Hyrox
- ✅ Meilleur temps / Dernier temps
- ✅ Statut par station avec indicateurs

### 3. Gestion des courses
- ✅ CRUD complet des courses
- ✅ Temps par station (8 runs + 8 stations)
- ✅ Notes et commentaires
- ✅ Filtres et tri

### 4. Gestion des entraînements
- ✅ Enregistrement des séances
- ✅ Types variés (Run, Sled, Renfo, Mix)
- ✅ RPE et notes
- ✅ Historique complet

### 5. Analyse & Progression
- ✅ Graphiques d'évolution
- ✅ Comparaisons temporelles
- ✅ Statistiques détaillées
- ✅ Suivi d'objectifs

### 6. Paramètres
- ✅ Thème clair/sombre
- ✅ Export des données (JSON/CSV)
- ✅ Suppression du compte

## 🛠️ Installation locale

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/hyrox-tracker.git
cd hyrox-tracker
```

### 2. Configuration des variables d'environnement

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hyrox_db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:4200
```

**Frontend** (`frontend/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Lancer avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

L'application sera accessible sur :
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

### 4. Installation manuelle (sans Docker)

**Backend**:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**Frontend**:
```bash
cd frontend
npm install
npm start
```

## 🚢 Déploiement

### Frontend (Vercel)

1. **Connecter le repository à Vercel**:
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

2. **Configuration Vercel** (`vercel.json`):
   - Build Command: `npm run build`
   - Output Directory: `dist/frontend/browser`
   - Framework: Angular

3. **Variables d'environnement**:
   - `NG_APP_API_URL`: URL de l'API backend

### Backend (Railway)

1. **Créer un nouveau projet sur Railway**:
   - Connecter le repository GitHub
   - Sélectionner le dossier `backend`

2. **Ajouter PostgreSQL**:
   - Ajouter un service PostgreSQL
   - Railway génère automatiquement `DATABASE_URL`

3. **Variables d'environnement**:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=[généré sécurisé]
   CORS_ORIGIN=https://votre-app.vercel.app
   DATABASE_URL=[auto-généré par Railway]
   ```

4. **Déploiement**:
   ```bash
   railway up
   ```

### Alternative: Render

1. **Backend**:
   - Nouveau Web Service
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm run start:prod`

2. **Database**:
   - Nouveau PostgreSQL
   - Copier l'internal URL dans `DATABASE_URL`

## 🔄 CI/CD

Pipeline GitHub Actions automatisée :

### Workflow (.github/workflows/main.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Tests backend
  backend-test:
    - Lint
    - Unit tests
    - E2E tests
    - Build Docker image

  # Tests frontend
  frontend-test:
    - Lint
    - Unit tests
    - Build production

  # Déploiement automatique
  deploy:
    - Deploy backend to Railway
    - Deploy frontend to Vercel
```

### Checks effectués
- ✅ Lint (ESLint)
- ✅ Tests unitaires (Jest)
- ✅ Tests E2E
- ✅ Build validation
- ✅ Security audit
- ✅ Docker image build

## 📊 Monitoring

### Sentry (Error Tracking)

**Configuration frontend**:
```typescript
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0
});
```

**Configuration backend**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Logs

- **Backend**: Winston pour les logs structurés
- **Format**: JSON pour faciliter l'analyse
- **Niveaux**: error, warn, info, debug

### Health Checks

- **Endpoint**: `GET /health`
- **Monitoring**: UptimeRobot (check toutes les 5 min)

### Métriques collectées

- Temps de réponse API
- Taux d'erreur
- Utilisation CPU/RAM
- Nombre de requêtes
- Temps de chargement frontend

## 📖 Documentation API

La documentation complète de l'API est disponible via Swagger :

**Local**: http://localhost:3000/api/docs
**Production**: https://votre-api.railway.app/api/docs

### Endpoints principaux

#### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Courses
- `GET /api/courses` - Liste des courses
- `POST /api/courses` - Créer une course
- `GET /api/courses/:id` - Détail d'une course
- `PUT /api/courses/:id` - Modifier une course
- `DELETE /api/courses/:id` - Supprimer une course

#### Trainings
- `GET /api/trainings` - Liste des entraînements
- `POST /api/trainings` - Créer un entraînement
- Etc.

#### Stats
- `GET /api/stats/overview` - Statistiques globales
- `GET /api/stats/progression` - Évolution temporelle
- `GET /api/stats/stations` - Performances par station

## 🧪 Tests

### Backend
```bash
cd backend
npm run test          # Tests unitaires
npm run test:e2e      # Tests E2E
npm run test:cov      # Couverture de code
```

### Frontend
```bash
cd frontend
npm run test          # Tests unitaires
npm run test:coverage # Couverture de code
```

## 🔐 Sécurité

- ✅ JWT avec expiration
- ✅ Passwords hashés avec bcrypt (rounds: 10)
- ✅ CORS configuré
- ✅ Rate limiting
- ✅ Helmet.js (headers sécurisés)
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection

## 📝 License

MIT

## 👥 Auteurs

Projet de fin de module - Développer pour le Cloud

## 🙏 Remerciements

- YNOV M2
- Communauté Hyrox


