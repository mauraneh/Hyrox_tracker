# Hyrox Tracker

Application de suivi des performances Hyrox avec Angular et NestJS (développement local uniquement).

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

2. Les migrations et le seed sont exécutés automatiquement au démarrage via le service `db-init`.

3. Accéder à l'application :

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **API Documentation (Swagger)** : http://localhost:3000/api/docs
- **Health check** : http://localhost:3000/api/health/liveness

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

- **Frontend** : Angular (port 4200)
- **Backend** : NestJS (port 3000)
- **Database** : PostgreSQL 15 (port 5432)

## Tests

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```
