# Guide de Présentation - Soutenance Hyrox Tracker

## Informations générales

- **Durée** : 15-20 minutes
- **Structure** : 10-12 min présentation + 5-8 min questions
- **Support** : Slides + Démonstration live

## Plan de présentation (15 minutes)

### 1. Introduction (2 minutes)

**Slide 1 : Page de titre**
- Nom du projet : Hyrox Tracker
- Votre nom
- Date
- YNOV M2 - Développer pour le Cloud

**Slide 2 : Contexte et objectifs**
- Problématique : Les athlètes Hyrox ont besoin de suivre leurs performances
- Solution : Application web cloud-native full-stack
- Objectifs techniques :
  - Architecture scalable
  - Déploiement 100% gratuit
  - CI/CD automatisée
  - Monitoring et observabilité

**Points à mentionner** :
> "Hyrox est une compétition de fitness qui combine course et stations. Les athlètes ont besoin d'analyser leurs performances pour progresser. J'ai développé une solution cloud-native complète pour répondre à ce besoin."

### 2. Architecture technique (4 minutes)

**Slide 3 : Vue d'ensemble de l'architecture**
```
[Schéma d'architecture présent dans ARCHITECTURE.md]
```

**Points clés à expliquer** :
- Séparation frontend/backend (cloud-native)
- Frontend : Angular 21 (standalone, signals)
- Backend : NestJS + PostgreSQL
- Tous les services sur des PaaS gratuits

**Slide 4 : Stack technique**

| Composant | Technologie | Hébergement | Coût |
|-----------|-------------|-------------|------|
| Frontend | Angular 21 + Tailwind | Vercel | Gratuit |
| Backend | NestJS + TypeScript | Railway | Gratuit |
| Database | PostgreSQL | Supabase | Gratuit |
| CI/CD | GitHub Actions | GitHub | Gratuit |
| Monitoring | Sentry + UptimeRobot | Cloud | Gratuit |

**Points à mentionner** :
> "J'ai choisi des technologies modernes et une architecture PaaS pour optimiser la scalabilité et réduire les coûts d'infrastructure à zéro."

### 3. Services Cloud utilisés (3 minutes)

**Slide 5 : Services cloud managés**

**Vercel (Frontend)**
- CDN global automatique
- SSL/TLS auto-provisionné
- Edge Network pour performance optimale
- Déploiement automatique depuis GitHub

**Railway (Backend)**
- Container orchestration
- Auto-scaling
- Health checks
- Logs structurés

**Supabase (Database)**
- PostgreSQL managé
- Backups automatiques
- Connection pooling
- Storage pour fichiers

**Points à mentionner** :
> "J'ai privilégié des PaaS plutôt que de l'IaaS pour me concentrer sur le code et déléguer l'infrastructure. Vercel gère le CDN et le SSL, Railway orchestre les containers, et Supabase administre PostgreSQL."

**Slide 6 : Justification des choix**

**Pourquoi ces services ?**
- ✅ Free tier généreux (production viable)
- ✅ DX (Developer Experience) excellente
- ✅ Scalabilité automatique
- ✅ Monitoring intégré
- ✅ Déploiement simplifié

### 4. CI/CD Pipeline (3 minutes)

**Slide 7 : Pipeline d'intégration continue**

```yaml
Push sur main
    ↓
[Tests Backend] + [Tests Frontend]
    ↓
[Lint & Security Audit]
    ↓
[Build Docker Images]
    ↓
[Deploy Railway] + [Deploy Vercel]
    ↓
[Health Checks]
```

**Étapes automatisées** :
1. **Tests** : Jest (backend) + Jasmine (frontend)
2. **Linting** : ESLint (TypeScript strict)
3. **Security** : npm audit
4. **Build** : Docker multi-stage
5. **Deploy** : Automatique vers Railway & Vercel
6. **Monitoring** : Sentry error tracking

**Points à mentionner** :
> "Chaque push sur main déclenche la pipeline complète. Si les tests échouent, le déploiement est bloqué. Les déploiements réussis sont automatiquement mis en production avec zero-downtime."

**Slide 8 : Stratégie de déploiement**

**Blue-Green Deployment** (géré par Railway/Vercel) :
- Nouvelle version déployée en parallèle
- Tests de santé automatiques
- Bascule automatique si succès
- Rollback instantané si échec

### 5. Monitoring et Observabilité (2 minutes)

**Slide 9 : Monitoring en place**

**Sentry (Error Tracking)**
- Capture automatique des erreurs
- Stack traces détaillées
- Alertes email en temps réel
- 5,000 événements/mois gratuits

**UptimeRobot (Availability)**
- Monitoring toutes les 5 minutes
- Alertes si downtime
- Statistiques uptime

**Logs structurés**
- Format JSON
- Niveaux : error, warn, info, debug
- Contexte : request ID, user ID, timestamp

**Métriques collectées** :
- Temps de réponse API (p50, p95, p99)
- Taux d'erreur
- Utilisation CPU/RAM
- Temps de chargement frontend

**Points à mentionner** :
> "Le monitoring est crucial en production. Sentry me notifie instantanément des erreurs, et UptimeRobot surveille la disponibilité. Les logs structurés facilitent le debugging."

### 6. Démonstration live (3 minutes)

**Préparer ces URLs à l'avance** :
- Frontend : `https://your-app.vercel.app`
- API Docs : `https://your-backend.up.railway.app/api/docs`
- GitHub repo avec CI/CD actif

**Scénario de démonstration** :

1. **Inscription + Connexion** (30s)
   - Montrer la page de register
   - Créer un compte de test
   - Se connecter

2. **Dashboard** (30s)
   - Montrer les statistiques
   - Navigation dans l'interface

3. **API Documentation (Swagger)** (30s)
   - Ouvrir `/api/docs`
   - Montrer les endpoints
   - Tester un endpoint

4. **CI/CD en action** (30s)
   - Montrer GitHub Actions
   - Pipeline complète
   - Historique des déploiements

5. **Monitoring** (30s)
   - Sentry dashboard
   - UptimeRobot status

**Points à mentionner** :
> "L'application est actuellement en production et accessible publiquement. Toute la stack est automatisée du développement au déploiement."

### 7. Sécurité (2 minutes)

**Slide 10 : Mesures de sécurité**

**Backend** :
- ✅ JWT avec expiration (7 jours)
- ✅ Passwords hashés (bcrypt, 10 rounds)
- ✅ CORS configuré
- ✅ Rate limiting (throttling)
- ✅ Helmet.js (headers sécurisés)
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (Prisma ORM)

**Frontend** :
- ✅ XSS protection (Angular Sanitizer)
- ✅ CSP Headers
- ✅ HTTPS only
- ✅ Secure token storage

**Infrastructure** :
- ✅ Variables d'environnement pour secrets
- ✅ Pas de credentials dans le code
- ✅ SSL/TLS automatique

**Points à mentionner** :
> "La sécurité est intégrée à chaque niveau : authentification JWT, validation stricte des entrées, protection contre les injections SQL, et chiffrement de bout en bout avec SSL."

### 8. Conclusion (1 minute)

**Slide 11 : Bilan du projet**

**Objectifs atteints** :
- ✅ Architecture cloud-native scalable
- ✅ Application full-stack fonctionnelle
- ✅ Déploiement 100% gratuit
- ✅ CI/CD automatisée
- ✅ Monitoring et observabilité
- ✅ Documentation complète

**Compétences mobilisées** :
- Conception d'architecture cloud
- Développement full-stack moderne
- DevOps et CI/CD
- Sécurité applicative
- Monitoring et observabilité

**Slide 12 : Améliorations futures**

**Phase 2 (court terme)** :
- Implémentation complète des fonctionnalités (courses, trainings)
- Graphiques de progression (Chart.js)
- Export des données (CSV/JSON)
- PWA (Progressive Web App)

**Phase 3 (moyen terme)** :
- Système de communauté et classements
- Application mobile (Ionic)
- Intégration wearables (Garmin, Polar)
- IA pour recommandations

**Points à mentionner** :
> "J'ai développé une base solide et scalable. Les fondations cloud-native permettront d'ajouter facilement de nouvelles fonctionnalités sans refactoring majeur."

## Questions fréquentes du jury

### Q1 : Pourquoi avoir choisi ces technologies ?

**Réponse structurée** :
> "J'ai choisi Angular 21 pour le frontend car c'est un framework enterprise-grade avec une architecture moderne (standalone components, signals). NestJS pour le backend car il offre une architecture modulaire similaire à Angular, ce qui assure une cohérence dans le projet. Les deux utilisent TypeScript, ce qui garantit la type-safety de bout en bout. Pour l'hébergement, j'ai privilégié des PaaS gratuits (Vercel, Railway, Supabase) pour optimiser les coûts tout en gardant une architecture professionnelle."

### Q2 : Comment gérez-vous la scalabilité ?

**Réponse structurée** :
> "La scalabilité est gérée à plusieurs niveaux :
> - **Frontend** : CDN global Vercel qui met en cache les assets statiques partout dans le monde
> - **Backend** : Railway peut auto-scaler horizontalement si le trafic augmente
> - **Database** : Supabase offre du connection pooling et des read replicas
> - **Architecture** : Séparation frontend/backend permet de scaler indépendamment
> - **Code** : Lazy loading des routes, pagination des listes, indexation des requêtes DB"

### Q3 : Quelles sont les limites du free tier ?

**Réponse structurée** :
> "Railway offre $5 de crédit/mois, soit environ 500 heures d'exécution. Vercel est illimité pour usage personnel. Supabase limite à 500MB de données. Pour une application en développement ou avec faible trafic, c'est largement suffisant. Si le projet décolle, la migration vers les plans payants est fluide et les coûts restent raisonnables (environ $20-30/mois pour commencer)."

### Q4 : Comment gérez-vous les erreurs en production ?

**Réponse structurée** :
> "J'ai mis en place plusieurs mécanismes :
> - **Sentry** capture toutes les erreurs avec contexte (stack trace, user, environnement)
> - **Logs structurés** au format JSON avec winston
> - **Health checks** toutes les 5 minutes via UptimeRobot
> - **Alertes** par email si erreur critique ou downtime
> - **Rollback** possible en 1 clic dans Railway/Vercel si déploiement problématique"

### Q5 : Quelle est la différence entre PaaS et IaaS ?

**Réponse structurée** :
> "**IaaS** (Infrastructure as a Service) comme AWS EC2 vous donne des serveurs virtuels que vous devez configurer et maintenir vous-même. Vous gérez l'OS, le réseau, les mises à jour.
> 
> **PaaS** (Platform as a Service) comme Railway ou Vercel gère toute l'infrastructure pour vous. Vous déployez juste votre code et la plateforme s'occupe du scaling, des sauvegardes, du monitoring.
> 
> J'ai choisi PaaS car pour ce projet, je voulais me concentrer sur le code métier plutôt que sur l'administration système. Le PaaS offre aussi un time-to-market plus rapide."

### Q6 : Comment sécurisez-vous l'API ?

**Réponse structurée** :
> "Plusieurs couches de sécurité :
> - **Authentification** : JWT avec expiration, refresh token possible
> - **Autorisation** : Guards NestJS vérifient les permissions
> - **Validation** : class-validator valide tous les inputs
> - **Rate limiting** : Throttling pour éviter les abus
> - **CORS** : Seulement le frontend autorisé
> - **Headers** : Helmet.js ajoute des headers de sécurité
> - **ORM** : Prisma protège contre les injections SQL
> - **HTTPS** : Tout le trafic est chiffré"

### Q7 : Pourquoi Docker avec un PaaS ?

**Réponse structurée** :
> "Même avec un PaaS, Docker apporte des avantages :
> - **Cohérence** : environnement identique en dev, staging, prod
> - **Reproductibilité** : n'importe qui peut lancer le projet localement avec docker-compose
> - **Portabilité** : si je veux changer de PaaS, Docker facilite la migration
> - **CI/CD** : les images Docker sont testées dans la pipeline
> Railway supporte Docker nativement, ce qui simplifie le déploiement."

### Q8 : Comment testez-vous l'application ?

**Réponse structurée** :
> "Plusieurs niveaux de tests :
> - **Tests unitaires** : Jest pour backend, Jasmine pour frontend
> - **Tests d'intégration** : Tests E2E avec supertest
> - **Tests de sécurité** : npm audit dans la CI/CD
> - **Tests manuels** : Scénarios utilisateur avant chaque release
> - **Monitoring production** : Sentry détecte les bugs en temps réel
> 
> La CI/CD bloque automatiquement le déploiement si les tests échouent."

## Conseils pour la soutenance

### Préparation

1. **Testez votre démo** : Assurez-vous que tout fonctionne le jour J
2. **Préparez des comptes de test** : Credentials prêts à l'avance
3. **Ayez un plan B** : Screenshots si la connexion internet coupe
4. **Chronométrez** : Répétez pour tenir dans les 15 minutes
5. **Anticipez les questions** : Relisez l'architecture et les choix techniques

### Pendant la présentation

1. **Soyez clair et concis** : Évitez le jargon inutile
2. **Montrez votre maîtrise** : Expliquez vos choix techniques
3. **Soyez honnête** : Si vous ne savez pas, dites-le
4. **Gérez votre temps** : Gardez 5 minutes pour les questions
5. **Soyez enthousiaste** : Montrez votre passion pour le projet

### Structure des réponses

Pour chaque question du jury :
1. **Répondez directement** (10-15 secondes)
2. **Justifiez techniquement** (20-30 secondes)
3. **Donnez un exemple concret** (10-15 secondes)

**Exemple** :
> Q : "Pourquoi NestJS ?"
> 
> R : "J'ai choisi NestJS pour trois raisons principales. 
> 
> D'abord, l'architecture modulaire facilite la maintenance et la scalabilité. 
> 
> Ensuite, le support natif de TypeScript assure la cohérence avec le frontend Angular. 
> 
> Enfin, l'écosystème riche (Passport, Prisma, Swagger) accélère le développement. Par exemple, Swagger génère automatiquement la documentation API que je peux montrer."

## Checklist avant la soutenance

### Technique
- [ ] Application déployée et accessible
- [ ] Tous les services cloud fonctionnent
- [ ] CI/CD pipeline verte
- [ ] Monitoring actif (Sentry, UptimeRobot)
- [ ] Compte de test créé et fonctionnel
- [ ] Documentation à jour
- [ ] Repository GitHub propre

### Présentation
- [ ] Slides préparées (12 slides max)
- [ ] Démo testée et chronométrée
- [ ] URLs notées et accessibles
- [ ] Questions fréquentes préparées
- [ ] Timing respecté (15 min)
- [ ] Plan B en cas de problème technique

### Matériel
- [ ] Ordinateur chargé
- [ ] Connexion internet testée
- [ ] Adaptateur HDMI/VGA si nécessaire
- [ ] Backup des slides (USB, cloud)
- [ ] Screenshots de l'application

## Bon courage ! 🚀

N'oubliez pas : vous avez développé une application professionnelle avec une architecture moderne. Ayez confiance en votre travail et vos compétences !


