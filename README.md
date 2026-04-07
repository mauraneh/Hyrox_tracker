# Hyrox Tracker — Frontend

Application web Angular pour suivre les performances Hyrox : courses, entraînements, statistiques, objectifs et profils.

Ce dépôt contient **uniquement le frontend**. Le backend (API NestJS + base de données) est dans un dépôt séparé.

---

## 1) Stack technique

- Angular (standalone components)
- TypeScript
- Tailwind CSS
- RxJS / HttpClient
- ApexCharts (`ng-apexcharts`) pour les graphiques
- Jasmine / Karma (tests)
- ESLint (lint)

---

## 2) Prérequis

- Node.js 20+
- npm 10+
- Backend du projet lancé localement (ou environnement compatible)

---

## 3) Installation

```bash
npm ci
```

---

## 4) Lancer l’application

```bash
npm start
```

Frontend disponible sur :
- [http://localhost:4200](http://localhost:4200)

Le frontend attend une API sur :
- `http://localhost:3000/api`

---

## 5) Scripts utiles

| Commande | Description |
|---|---|
| `npm start` | Lance le serveur de dev Angular |
| `npm run build` | Build de production |
| `npm run watch` | Build en mode watch |
| `npm test` | Lance les tests unitaires |
| `npm run test:coverage` | Lance les tests avec couverture |
| `npm run lint` | Analyse lint TypeScript + templates Angular |

---

## 6) Configuration environnement

Fichier principal :
- `src/environments/environment.ts`

Exemple :

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

Le backend expose généralement Swagger sur :
- `http://localhost:3000/api/docs`

---

## 7) Fonctionnalités principales

### Authentification
- Connexion / inscription
- Gestion token via service et intercepteur auth
- Protection des routes via `authGuard`

### Dashboard
- Vue synthèse utilisateur
- Accès rapide aux sections principales

### Courses
- Liste des courses avec filtres/tri
- Ajout / édition / suppression
- Détail d’une course avec segments
- Import des résultats
- Export CSV

### Trainings
- Liste, détail, création, modification, suppression
- Filtres (date, type, niveau)
- Confirmation de suppression

### Statistiques
- KPIs globaux (meilleur, moyenne, dernier, etc.)
- Stats par station
- Graphiques comparatifs

### Recherche utilisateurs
- Accès via l’icône loupe
- Recherche profils publics
- Validation UX : minimum 3 caractères, maximum 30 caractères

### Easter Egg
- Route dédiée `/easter-egg`
- Déclenchement via interaction clavier/souris (selon implémentation de la branche concernée)

---

## 8) Structure du projet

```text
src/
├── app/
│   ├── core/
│   │   ├── auth/            # Guard, interceptor, auth service
│   │   └── types/           # Interfaces / enums partagés
│   ├── features/
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── search/
│   │   ├── settings/
│   │   ├── stats/
│   │   └── trainings/
│   ├── shared/
│   │   └── charts/          # Composants de graphiques réutilisables
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
├── index.html
├── main.ts
└── styles.css
```

---

## 9) Qualité et CI

Avant toute PR :

```bash
npm run lint
npm test
```

Recommandé aussi :

```bash
npm run build
```

---

## 10) Docker (optionnel)

Lancer avec Docker Compose :

```bash
docker compose up
```

Arrêter et nettoyer :

```bash
docker compose down --remove-orphans
```

---

## 11) Workflow Git recommandé

1. Créer une branche feature depuis `main`
2. Développer et committer sur la branche feature
3. Ouvrir une Pull Request vers `main`
4. Résoudre les conflits éventuels sur la branche feature
5. Merger uniquement après checks CI au vert

---

## 12) Dépannage rapide

### `Cannot GET /` sur localhost:4200
- Vérifier que le frontend tourne réellement (`npm start` ou conteneur en cours)
- Vérifier le port exposé et l’URL utilisée

### Erreurs lint Angular template
- Les éléments cliquables non natifs doivent être focusables et gérer le clavier (`tabindex`, `keydown.enter`, etc.)

### Conflit d’image en PR
- Souvent dû à un fichier binaire ajouté/supprimé différemment entre branches
- Résoudre explicitement la version à conserver puis commit de merge

---

## 13) Licence

Voir `LICENSE`.
