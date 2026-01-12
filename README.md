# Hyrox Tracker

Application de suivi des performances Hyrox avec Angular et NestJS.

## Prérequis

- Docker et Docker Compose
- Node.js 20+
- PostgreSQL 15+

## Installation

### Développement local

1. Lancer tous les services :

```bash
docker-compose up -d
```

2. Appliquer les migrations de base de données :

```bash
docker exec -it hyrox-backend npx prisma migrate deploy
```

3. (Optionnel) Remplir la base avec des données de test :

```bash
docker exec -it hyrox-backend npm run prisma:seed
```

4. Accéder à l'application :

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **API Documentation (Swagger)** : http://localhost:3000/api

#### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Accéder à Prisma Studio (interface graphique pour la base de données)
docker exec -it hyrox-backend npx prisma studio
# Puis ouvrir http://localhost:5555
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
