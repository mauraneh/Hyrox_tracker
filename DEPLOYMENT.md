# Guide de Déploiement Hyrox Tracker

Ce guide détaille les étapes pour déployer l'application Hyrox Tracker sur les services cloud gratuits.

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration de la base de données (Supabase)](#1-configuration-de-la-base-de-données-supabase)
3. [Déploiement du Backend (Railway)](#2-déploiement-du-backend-railway)
4. [Déploiement du Frontend (Vercel)](#3-déploiement-du-frontend-vercel)
5. [Configuration du monitoring](#4-configuration-du-monitoring)
6. [Vérification du déploiement](#5-vérification-du-déploiement)

## Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Compte Railway (gratuit)
- Compte Supabase (gratuit)
- Compte Sentry (gratuit, optionnel)

## 1. Configuration de la base de données (Supabase)

### Étape 1.1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Choisissez une région proche (Europe West recommandé)
4. Notez le mot de passe de la base de données

### Étape 1.2 : Récupérer l'URL de connexion

1. Dans le dashboard Supabase, allez dans **Settings** → **Database**
2. Trouvez la section **Connection string** → **URI**
3. Copiez l'URL (format : `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### Étape 1.3 : Appliquer les migrations Prisma

Depuis votre machine locale :

```bash
cd backend
export DATABASE_URL="your-supabase-connection-url"
npx prisma migrate deploy
npx prisma generate
```

## 2. Déploiement du Backend (Railway)

### Étape 2.1 : Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte avec GitHub
3. Cliquez sur **New Project**

### Étape 2.2 : Déployer depuis GitHub

1. Sélectionnez **Deploy from GitHub repo**
2. Choisissez votre repository `Hyrox_tracker`
3. Railway détecte automatiquement le backend

### Étape 2.3 : Configurer les variables d'environnement

Dans le dashboard Railway, allez dans **Variables** et ajoutez :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-supabase-connection-url
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d
CORS_ORIGIN=https://your-app.vercel.app
```

**Important** : 
- Générez un JWT_SECRET sécurisé : `openssl rand -base64 32`
- Remplacez `CORS_ORIGIN` par l'URL de votre frontend Vercel (vous l'aurez à l'étape 3)

### Étape 2.4 : Configurer le build

Railway détecte automatiquement le Dockerfile. Si besoin, configurez :

- **Root Directory** : `/backend`
- **Build Command** : Automatique (Docker)
- **Start Command** : Automatique (Docker)

### Étape 2.5 : Déployer

1. Cliquez sur **Deploy**
2. Attendez la fin du build (2-3 minutes)
3. Railway génère une URL : `https://your-app.up.railway.app`
4. Notez cette URL pour le frontend

### Étape 2.6 : Exécuter les migrations

Dans le terminal Railway (ou localement avec l'URL Railway) :

```bash
npx prisma migrate deploy
```

## 3. Déploiement du Frontend (Vercel)

### Étape 3.1 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte avec GitHub

### Étape 3.2 : Importer le projet

1. Cliquez sur **Add New...** → **Project**
2. Importez votre repository GitHub `Hyrox_tracker`
3. Vercel détecte Angular automatiquement

### Étape 3.3 : Configuration du build

- **Framework Preset** : Angular
- **Root Directory** : `frontend`
- **Build Command** : `npm run build:prod`
- **Output Directory** : `dist/frontend/browser`
- **Install Command** : `npm ci`

### Étape 3.4 : Variables d'environnement

Ajoutez dans **Environment Variables** :

```env
NG_APP_API_URL=https://your-backend.up.railway.app/api
```

Remplacez par l'URL Railway de l'étape 2.5.

### Étape 3.5 : Déployer

1. Cliquez sur **Deploy**
2. Attendez la fin du build (2-3 minutes)
3. Vercel génère une URL : `https://your-app.vercel.app`

### Étape 3.6 : Configurer le domaine personnalisé (optionnel)

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions Vercel

## 4. Configuration du monitoring

### Étape 4.1 : Sentry (Error tracking)

#### Backend

1. Créez un compte sur [sentry.io](https://sentry.io)
2. Créez un projet **Node.js**
3. Copiez le DSN
4. Ajoutez dans Railway :

```env
SENTRY_DSN=your-sentry-dsn
```

5. Installez le SDK :

```bash
cd backend
npm install @sentry/node
```

6. Ajoutez dans `main.ts` :

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Frontend

1. Créez un projet **Angular** dans Sentry
2. Copiez le DSN
3. Ajoutez dans Vercel :

```env
NG_SENTRY_DSN=your-sentry-dsn
```

4. Installez le SDK :

```bash
cd frontend
npm install @sentry/angular
```

### Étape 4.2 : UptimeRobot (Monitoring uptime)

1. Créez un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Ajoutez un nouveau monitor :
   - **Monitor Type** : HTTP(s)
   - **URL** : `https://your-backend.up.railway.app/health`
   - **Monitoring Interval** : 5 minutes
   - **Alert Contacts** : Votre email
3. Répétez pour le frontend : `https://your-app.vercel.app`

## 5. Vérification du déploiement

### Checklist de vérification

- [ ] Backend accessible : `https://your-backend.up.railway.app/health`
- [ ] API Documentation : `https://your-backend.up.railway.app/api/docs`
- [ ] Frontend accessible : `https://your-app.vercel.app`
- [ ] Connexion fonctionnelle : Testez login/register
- [ ] Base de données : Créez un utilisateur de test
- [ ] CORS configuré : Pas d'erreurs dans la console
- [ ] Monitoring actif : Vérifiez Sentry et UptimeRobot

### Tests manuels

```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test register
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST https://your-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

## 6. Configuration CI/CD (GitHub Actions)

### Étape 6.1 : Configurer les secrets GitHub

Allez dans **Settings** → **Secrets and variables** → **Actions** et ajoutez :

#### Vercel
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

Pour obtenir ces valeurs :
```bash
npm i -g vercel
cd frontend
vercel link
cat .vercel/project.json
```

#### Railway

Railway déploie automatiquement depuis GitHub. Pas de secrets nécessaires.

### Étape 6.2 : Activer GitHub Actions

1. Vérifiez que le fichier `.github/workflows/ci-cd.yml` existe
2. Poussez un commit sur `main` :

```bash
git add .
git commit -m "Configure CI/CD"
git push origin main
```

3. Allez dans **Actions** dans GitHub pour voir le workflow

## 7. Mise à jour de l'application

### Déploiement automatique

Tout push sur `main` déclenche :
1. Tests backend & frontend
2. Build Docker
3. Déploiement sur Railway (backend)
4. Déploiement sur Vercel (frontend)

### Déploiement manuel

#### Backend (Railway)
```bash
git push origin main
# Railway déploie automatiquement
```

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## 8. Rollback en cas de problème

### Railway
1. Allez dans le dashboard Railway
2. **Deployments** → Sélectionnez un déploiement précédent
3. Cliquez sur les trois points → **Redeploy**

### Vercel
1. Allez dans le dashboard Vercel
2. **Deployments** → Sélectionnez un déploiement précédent
3. Cliquez sur les trois points → **Promote to Production**

## 9. Coûts et limites (Free tier)

### Railway
- **Gratuit** : $5 de crédit/mois
- **Limites** : 500 heures d'exécution, 1GB RAM, 1GB stockage
- **Dépassement** : L'app s'arrête automatiquement

### Vercel
- **Gratuit** : Illimité pour usage personnel
- **Limites** : 100GB bande passante/mois, 100 déploiements/jour

### Supabase
- **Gratuit** : 500MB database, 1GB stockage
- **Limites** : 2 projets actifs, 500MB transfers
- **Note** : Base se met en pause après 1 semaine d'inactivité

### Sentry
- **Gratuit** : 5,000 événements/mois
- **Suffisant** : Pour le développement et faible trafic

### UptimeRobot
- **Gratuit** : 50 monitors, check toutes les 5 minutes
- **Suffisant** : Pour notre cas d'usage

## 10. Optimisations de performance

### Backend
- [ ] Activer la compression Gzip
- [ ] Mettre en cache les requêtes fréquentes
- [ ] Indexer les colonnes de recherche
- [ ] Pagination pour les listes

### Frontend
- [ ] Lazy loading des routes
- [ ] Service Worker pour PWA
- [ ] Optimisation des images
- [ ] Code splitting

## 11. Support et dépannage

### Logs Backend (Railway)
```bash
railway logs
```

Ou dans le dashboard Railway : **View Logs**

### Logs Frontend (Vercel)
Dans le dashboard Vercel : **Deployments** → Sélectionnez un déploiement → **View Function Logs**

### Erreurs communes

**CORS Error**
- Vérifiez que `CORS_ORIGIN` dans Railway correspond à l'URL Vercel

**Database Connection Failed**
- Vérifiez que `DATABASE_URL` est correct
- Assurez-vous que les migrations sont appliquées

**JWT Invalid**
- Vérifiez que `JWT_SECRET` est identique entre déploiements
- Doit faire au moins 32 caractères

**Build Failed**
- Vérifiez les logs dans Railway/Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`

## Félicitations ! 🎉

Votre application Hyrox Tracker est maintenant déployée en production !

**URLs importantes :**
- Frontend : https://your-app.vercel.app
- Backend API : https://your-backend.up.railway.app
- API Docs : https://your-backend.up.railway.app/api/docs
- Monitoring : https://uptimerobot.com
- Error Tracking : https://sentry.io


