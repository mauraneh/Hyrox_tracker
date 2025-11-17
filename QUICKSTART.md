# Quick Start Guide 🚀

## Ce qui a été créé

Votre projet **Hyrox Tracker** est maintenant complet avec :

### ✅ Backend (NestJS)
- Architecture modulaire complète
- Authentification JWT
- CRUD pour courses et trainings
- API de statistiques
- Documentation Swagger
- Prisma ORM + PostgreSQL
- Health checks
- Tests unitaires

### ✅ Frontend (Angular 21)
- Architecture standalone avec signals
- Pages : Login, Register, Dashboard
- Routing et guards
- Authentification avec interceptors
- Design Tailwind CSS (thème sportif noir/blanc/jaune)
- Responsive

### ✅ Infrastructure
- Docker + Docker Compose
- Dockerfile multi-stage pour prod
- Nginx pour frontend
- CI/CD GitHub Actions

### ✅ Documentation
- `README.md` : Vue d'ensemble complète
- `ARCHITECTURE.md` : Architecture détaillée
- `DEPLOYMENT.md` : Guide de déploiement pas à pas
- `PRESENTATION.md` : Guide pour la soutenance
- `CONTRIBUTING.md` : Guide de contribution

## Prochaines étapes

### 1. Initialiser Git et pousser sur GitHub

```bash
cd /Users/mh/Dev/YNOV/M2/Hyrox_tracker

git init
git add .
git commit -m "Initial commit: Hyrox Tracker cloud-native app"

# Créez un repo sur GitHub puis :
git remote add origin https://github.com/VOTRE-USERNAME/hyrox-tracker.git
git branch -M main
git push -u origin main
```

### 2. Installer les dépendances localement

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 3. Lancer l'application en local avec Docker

```bash
cd /Users/mh/Dev/YNOV/M2/Hyrox_tracker
docker-compose up -d
```

Attendez 1-2 minutes puis :
- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- API Docs : http://localhost:3000/api/docs

### 4. Appliquer les migrations de base de données

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Tester l'application

```bash
# Créez un compte sur http://localhost:4200/auth/register
# Testez la connexion
# Explorez le dashboard
```

## Déploiement en production

Suivez **DEPLOYMENT.md** pour déployer sur :
1. **Supabase** (Database) - 10 min
2. **Railway** (Backend) - 15 min
3. **Vercel** (Frontend) - 10 min
4. **Sentry** (Monitoring) - 5 min

**Temps total : ~40 minutes**

## Structure du projet

```
Hyrox_tracker/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Modules métier
│   │   │   ├── auth/       # Authentification
│   │   │   ├── users/      # Gestion utilisateurs
│   │   │   ├── courses/    # Gestion courses
│   │   │   ├── trainings/  # Gestion entraînements
│   │   │   ├── stats/      # Statistiques
│   │   │   └── health/     # Health checks
│   │   ├── prisma/         # Prisma service
│   │   └── common/         # Guards, decorators, etc.
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # SPA Angular 21
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Services singleton
│   │   │   │   └── auth/  # Auth service, guard, interceptor
│   │   │   ├── features/  # Pages
│   │   │   │   ├── auth/  # Login, Register
│   │   │   │   ├── dashboard/
│   │   │   │   ├── courses/
│   │   │   │   ├── trainings/
│   │   │   │   ├── stats/
│   │   │   │   └── settings/
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── environments/
│   │   └── styles.css     # Tailwind + custom styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # Pipeline CI/CD
│
├── docker-compose.yml     # Dev environment
├── README.md             # Documentation principale
├── ARCHITECTURE.md       # Architecture détaillée
├── DEPLOYMENT.md         # Guide de déploiement
├── PRESENTATION.md       # Guide de soutenance
└── CONTRIBUTING.md       # Guide de contribution
```

## Commandes utiles

### Backend

```bash
cd backend

# Développement
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Prisma
npx prisma studio          # Interface graphique DB
npx prisma migrate dev     # Créer migration
npx prisma migrate deploy  # Appliquer en prod
npx prisma generate        # Générer client

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Développement
npm start

# Build
npm run build
npm run build:prod

# Tests
npm run test
npm run test:coverage

# Lint
npm run lint
```

### Docker

```bash
# Lancer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build

# Supprimer volumes
docker-compose down -v
```

## Fonctionnalités implémentées

### ✅ Authentification
- [x] Inscription
- [x] Connexion
- [x] JWT avec expiration
- [x] Guard pour routes protégées
- [x] Interceptor pour ajout du token

### ✅ Dashboard
- [x] Vue d'ensemble des statistiques
- [x] Total courses et trainings
- [x] Meilleur temps et dernier temps
- [x] Prochain Hyrox
- [x] Navigation

### ✅ API Backend
- [x] Auth endpoints (register, login, me)
- [x] Users CRUD
- [x] Courses CRUD avec times
- [x] Trainings CRUD
- [x] Stats (overview, progression, stations)
- [x] Health check

### ✅ Infrastructure
- [x] Docker multi-stage
- [x] Docker Compose
- [x] CI/CD GitHub Actions
- [x] Documentation Swagger

## Fonctionnalités à développer (bonus)

### Phase 2 - Core Features
- [ ] Page complète courses (liste, création, édition)
- [ ] Page complète trainings (liste, création, édition)
- [ ] Graphiques de progression (Chart.js)
- [ ] Gestion des objectifs
- [ ] Export des données (JSON/CSV)
- [ ] Filtres et tri avancés

### Phase 3 - Advanced Features
- [ ] Système de thème (clair/sombre)
- [ ] Comparaison de performances
- [ ] Analyse par station détaillée
- [ ] PWA (Progressive Web App)
- [ ] Notifications push

### Phase 4 - Community
- [ ] Profils publics
- [ ] Classements
- [ ] Suivi d'amis
- [ ] Partage de courses

## Ressources utiles

### Documentation
- [NestJS](https://docs.nestjs.com)
- [Angular](https://angular.dev)
- [Prisma](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Hébergement gratuit
- [Railway](https://railway.app) - Backend
- [Vercel](https://vercel.com) - Frontend
- [Supabase](https://supabase.com) - Database
- [Sentry](https://sentry.io) - Monitoring

## Troubleshooting

### "Cannot connect to database"
```bash
# Vérifiez que PostgreSQL est lancé
docker-compose ps

# Recréez le container
docker-compose down -v
docker-compose up -d postgres
```

### "Port 3000 already in use"
```bash
# Trouvez le process
lsof -i :3000

# Tuez le process
kill -9 <PID>
```

### "Module not found"
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

## Support

- 📧 Email : votre-email@example.com
- 🐛 Issues : https://github.com/VOTRE-USERNAME/hyrox-tracker/issues
- 📚 Documentation : Ce repository

## Licence

MIT - Voir [LICENSE](LICENSE)

---

## 🎯 Pour la soutenance

1. **Lisez PRESENTATION.md** - Guide complet pour la soutenance
2. **Déployez l'app** - Suivez DEPLOYMENT.md
3. **Testez tout** - Assurez-vous que ça fonctionne
4. **Préparez vos slides** - 12 slides max
5. **Chronométrez** - 15 minutes de présentation

## 🚀 Bon courage !

Vous avez maintenant une application cloud-native complète et professionnelle. Tout le code respecte les bonnes pratiques, l'architecture est scalable, et la documentation est exhaustive.

Pour toute question, n'hésitez pas à ouvrir une issue !


