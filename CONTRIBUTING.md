# Guide de contribution

## Développement local

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/hyrox-tracker.git
cd hyrox-tracker

# Lancer avec Docker Compose
docker-compose up -d

# L'application sera disponible sur :
# - Frontend: http://localhost:4200
# - Backend: http://localhost:3000
# - API Docs: http://localhost:3000/api/docs
```

### Installation manuelle

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos valeurs
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Workflow Git

### Branches

- `main` : Production
- `develop` : Développement
- `feature/xxx` : Nouvelles fonctionnalités
- `fix/xxx` : Corrections de bugs

### Commit messages

Format : `type(scope): message`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemples :
```
feat(auth): add JWT authentication
fix(courses): resolve time calculation bug
docs(readme): update deployment instructions
```

### Pull Requests

1. Créez une branche depuis `develop`
2. Développez votre fonctionnalité
3. Testez localement
4. Créez une PR vers `develop`
5. Attendez la review

## Standards de code

### Backend (NestJS)

- TypeScript strict mode
- ESLint + Prettier
- Pas de `any`
- Documentation des fonctions publiques
- Tests unitaires obligatoires

### Frontend (Angular)

- Standalone components
- Signals pour l'état
- Tailwind CSS uniquement (pas de CSS inline)
- PascalCase pour classes/interfaces
- camelCase pour variables/méthodes
- Pas d'abréviations

## Tests

### Backend

```bash
cd backend
npm run test          # Tests unitaires
npm run test:e2e      # Tests E2E
npm run test:cov      # Couverture
```

### Frontend

```bash
cd frontend
npm run test          # Tests unitaires
npm run test:coverage # Couverture
```

## Documentation

- Commentez le code complexe
- Mettez à jour README.md si changements importants
- Documentez les endpoints API dans Swagger

## Questions ?

Ouvrez une issue sur GitHub !


