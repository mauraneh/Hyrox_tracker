# Hyrox Tracker

Application de suivi des performances Hyrox avec Angular et NestJS.

## Prérequis

- Docker et Docker Compose
- Node.js 20+
- PostgreSQL 15+

## Installation

### Développement local

```bash
docker-compose up -d
```

### Staging

1. Copier `.env.staging.example` vers `.env.staging`
2. Remplir les variables d'environnement
3. Lancer le seeding staging :

```bash
cd backend
npm run prisma:seed:staging
```

4. Démarrer avec docker-compose :

```bash
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
```

### Production

1. Copier `.env.production.example` vers `.env.production`
2. Remplir les variables d'environnement
3. Lancer le seeding production :

```bash
cd backend
npm run prisma:seed:production
```

4. Démarrer avec docker-compose :

```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

## Architecture

- **Frontend** : Angular 18 (port 4200 en dev, 80 via Nginx en prod)
- **Backend** : NestJS (port 3000)
- **Database** : PostgreSQL 15
- **Reverse Proxy** : Nginx (port 8080 staging, 80 production)

## Tests

```bash
cd backend
npm test
```

## CI/CD

- **Staging** : Déploiement automatique sur `develop` vers GitHub Container Registry
- **Production** : Déploiement automatique sur `main` vers GitHub Container Registry

Les images Docker sont disponibles sur `ghcr.io/<owner>/<repo>-backend` et `ghcr.io/<owner>/<repo>-frontend`.
