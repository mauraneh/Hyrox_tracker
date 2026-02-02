# Hyrox Tracker — Frontend

Application web de suivi des performances Hyrox (courses, entraînements, objectifs, statistiques). Ce dépôt contient **uniquement le frontend** Angular. L’API backend est dans un autre dépôt. **Tout tourne en local** : frontend (port 4200) et backend (port 3000) sur la même machine.

## Prérequis

- **Node.js** 20+
- **npm** 10+

Aucune base de données ni service backend dans ce projet.

## Installation

```bash
npm ci
```

## Lancer l’application

```bash
npm start
```

L’app est disponible sur **http://localhost:4200**.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Serveur de dev (port 4200, hot reload) |
| `npm run build` | Build de production dans `dist/frontend` |
| `npm run watch` | Build en mode watch (development) |
| `npm test` | Tests unitaires (Karma/Jasmine) |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run lint` | ESLint sur `src/**/*.ts` et `src/**/*.html` |

## Configuration

### API backend

L’URL de l’API est définie dans `src/environments/environment.ts` :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

Tout est en **local** : l’API est sur `http://localhost:3000/api`. Démarrer le backend (autre dépôt) sur la même machine pour que le frontend s’y connecte. La doc **Swagger** est disponible à `http://localhost:3000/api/docs`.

## Mocks en secours (backup)

En cas d’indisponibilité de l’API (maintenance, panne, travail offline), l’équipe peut s’appuyer sur des **mocks** alignés sur le contrat d’API (Swagger).

### Stratégie recommandée

1. **Conserver une référence au contrat d’API**  
   - Lien vers le dépôt backend ou copie du fichier Swagger/OpenAPI dans ce dépôt (ex. `docs/api-spec.yaml`).  
   - Les mocks doivent respecter ce contrat pour éviter les mauvaises surprises au retour de l’API.

2. **Emplacement des mocks**  
   - Stocker les réponses JSON dans `src/assets/mocks/` (ex. `auth-login.json`, `stats-overview.json`, etc.).  
   - Une structure par ressource (auth, stats, goals, courses, users) facilite la maintenance.

3. **Activation des mocks**  
   - Ajouter dans l’environnement un flag du type `useMocks: true` (par ex. dans `environment.ts` ou via `environment.development.ts`).  
   - Dans les services qui appellent `HttpClient`, brancher soit :  
     - un intercepteur HTTP qui, si `useMocks` est vrai, renvoie les JSON des mocks au lieu d’appeler l’API,  
     - soit des services “mock” injectés à la place des vrais services quand `useMocks` est actif.  
   - Les types TypeScript (`src/app/core/types/interfaces.ts`) restent la source de vérité ; les JSON de mocks doivent les respecter.

4. **Aligner les mocks sur Swagger**  
   - À chaque évolution de l’API (backend), mettre à jour le spec Swagger puis les JSON dans `src/assets/mocks/` pour garder le backup utilisable.

Ainsi, en cas de crash ou indisponibilité de l’API, il suffit d’activer les mocks pour continuer à développer ou démontrer le frontend.

## Docker (optionnel)

Le frontend peut être lancé dans un conteneur :

```bash
docker compose up
```

Cela démarre uniquement le service **hyrox-frontend** (port 4200). Aucun backend ni base de données dans ce `docker-compose.yml`.

Pour arrêter et supprimer les conteneurs (et d’éventuels orphelins) :

```bash
docker compose down --remove-orphans
```

## Structure du projet

```
src/
├── app/
│   ├── core/                 # Auth, intercepteur HTTP, types partagés
│   │   ├── auth/
│   │   └── types/
│   ├── features/             # Pages par domaine (auth, dashboard, courses, etc.)
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── stats/
│   │   └── trainings/
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── environments/             # environment.ts (apiUrl, etc.)
├── index.html
├── main.ts
└── styles.css
```

- **Composants** : standalone, préfixe `app`, style avec **Tailwind**.  
- **Routing** : lazy loading des features ; `authGuard` sur les routes protégées.  
- **API** : tous les appels passent par `environment.apiUrl` et l’intercepteur d’auth (token).

## Tests

```bash
npm test
```

Ou avec couverture :

```bash
npm run test:coverage
```

## Lint

```bash
npm run lint
```

## Handover à une autre équipe

- Le **backend** est dans un dépôt séparé ; ce repo ne contient que le frontend.  
- **Tout est en local** : frontend (4200) et backend (3000) sur la même machine ; `apiUrl` pointe déjà vers `localhost`.  
- Les mocks (voir section ci‑dessus) servent de backup si l’API est indisponible. La doc Swagger du backend est la référence pour le contrat d’API.

## Licence

Voir le fichier `LICENSE` à la racine du projet.
