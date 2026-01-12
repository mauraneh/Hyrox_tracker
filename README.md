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

## Configuration pour Staging et Production

Des fichiers d'exemple sont fournis pour configurer les variables d'environnement nécessaires au déploiement.

### Staging

1. **Copier le fichier d'exemple** :
```bash
cp .env.staging.example .env.staging
```

2. **Éditer le fichier `.env.staging`** selon vos besoins :
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME` : Identifiants de la base de données (valeurs par défaut disponibles)
   - `JWT_SECRET` : Clé secrète pour JWT (obligatoire)
   - `CORS_ORIGIN` : Origine autorisée pour CORS (par défaut: http://localhost)
   - `NGINX_PORT` : Port pour Nginx (par défaut: 8080)

3. **Utiliser avec docker-compose** :
```bash
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
```

### Production

1. **Copier le fichier d'exemple** :
```bash
cp .env.production.example .env.production
```

2. **Éditer le fichier `.env.production`** avec des valeurs sécurisées (⚠️ toutes les variables sont obligatoires) :
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME` : Identifiants de la base de données (utilisez des mots de passe forts)
   - `JWT_SECRET` : Clé secrète forte et unique pour JWT
   - `CORS_ORIGIN` : Domaine de votre application en production (ex: https://votre-domaine.com)
   - `NGINX_PORT` : Port pour Nginx (par défaut: 80)

3. **Utiliser avec docker-compose** :
```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

**⚠️ Important** : Ne commitez jamais les fichiers `.env.staging` ou `.env.production` dans Git. Seuls les fichiers `.example` doivent être versionnés.

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
