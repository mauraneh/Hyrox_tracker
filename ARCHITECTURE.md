# Architecture Hyrox Tracker

## Vue d'ensemble

Hyrox Tracker est une application cloud-native full-stack suivant les principes de séparation des responsabilités et de scalabilité.

## Diagramme d'architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Internet / Users                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
        ┌───────────────────▼───────────────────┐
        │         CDN / Edge Network            │
        │         (Vercel Edge)                 │
        │  - Cache statique                     │
        │  - Compression Brotli                 │
        │  - SSL/TLS termination                │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │         Frontend (Angular 21)         │
        │  ┌─────────────────────────────────┐  │
        │  │  - Standalone Components        │  │
        │  │  - Angular Signals              │  │
        │  │  - Tailwind CSS                 │  │
        │  │  - Chart.js                     │  │
        │  │  - Service Workers (PWA)        │  │
        │  └─────────────────────────────────┘  │
        │         Deployed on Vercel            │
        └───────────────────┬───────────────────┘
                            │
                            │ REST API (HTTPS)
                            │ JWT Bearer Token
                            │
        ┌───────────────────▼───────────────────┐
        │      API Gateway / Load Balancer      │
        │         (Railway/Render)              │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │        Backend API (NestJS)           │
        │  ┌─────────────────────────────────┐  │
        │  │  Controllers Layer              │  │
        │  │  - AuthController               │  │
        │  │  - CoursesController            │  │
        │  │  - TrainingsController          │  │
        │  │  - StatsController              │  │
        │  │  - UsersController              │  │
        │  └──────────────┬──────────────────┘  │
        │  ┌──────────────▼──────────────────┐  │
        │  │  Services Layer (Business Logic)│  │
        │  │  - AuthService (JWT)            │  │
        │  │  - CoursesService               │  │
        │  │  - TrainingsService             │  │
        │  │  - StatsService                 │  │
        │  └──────────────┬──────────────────┘  │
        │  ┌──────────────▼──────────────────┐  │
        │  │  Repositories Layer (Prisma)    │  │
        │  └──────────────┬──────────────────┘  │
        │  ┌──────────────▼──────────────────┐  │
        │  │  Middleware & Guards            │  │
        │  │  - JwtAuthGuard                 │  │
        │  │  - ValidationPipe               │  │
        │  │  - LoggerMiddleware             │  │
        │  │  - ExceptionFilter              │  │
        │  └─────────────────────────────────┘  │
        └───────────────────┬───────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
┌───────────▼──────────┐        ┌──────────▼──────────┐
│   PostgreSQL 15      │        │  Supabase Storage   │
│   (Supabase)         │        │                     │
│                      │        │  - User avatars     │
│  Tables:             │        │  - Course images    │
│  - users             │        │                     │
│  - courses           │        └─────────────────────┘
│  - course_times      │
│  - trainings         │
│  - goals             │
│  - user_settings     │
└──────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Observability & Monitoring                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐               │
│  │   Sentry   │  │   Logs     │  │ UptimeRobot  │               │
│  │  (Errors)  │  │ (Winston)  │  │ (Health)     │               │
│  └────────────┘  └────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

## Architecture détaillée

### 1. Frontend Layer (Angular 21)

**Responsabilités**:
- Présentation et interface utilisateur
- Gestion de l'état local avec Signals
- Communication avec l'API backend
- Validation côté client
- Expérience utilisateur optimale

**Structure**:
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Services singleton
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── jwt.interceptor.ts
│   │   │   ├── api/
│   │   │   │   └── api.service.ts
│   │   │   └── error/
│   │   │       └── error-handler.service.ts
│   │   ├── shared/                  # Composants réutilisables
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── chart/
│   │   │   │   └── modal/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── features/                # Modules métier
│   │   │   ├── auth/
│   │   │   │   ├── login.page.ts
│   │   │   │   └── register.page.ts
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.page.ts
│   │   │   ├── courses/
│   │   │   │   ├── courses-list.page.ts
│   │   │   │   ├── course-detail.page.ts
│   │   │   │   └── course-form.page.ts
│   │   │   ├── trainings/
│   │   │   ├── stats/
│   │   │   └── settings/
│   │   └── app.routes.ts
│   ├── assets/
│   └── environments/
```

**Technologies**:
- Angular 21 (Standalone components)
- TypeScript 5.3+
- Tailwind CSS 3
- Chart.js / ng2-charts
- RxJS 7

**Patterns**:
- Smart/Dumb Components
- Reactive Forms
- Signal-based state management
- Route guards pour protection
- Interceptors HTTP

### 2. Backend Layer (NestJS)

**Responsabilités**:
- Logique métier
- Authentification et autorisation
- Validation des données
- Communication avec la base de données
- API RESTful

**Structure**:
```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── courses/
│   │   │   ├── courses.module.ts
│   │   │   ├── courses.controller.ts
│   │   │   ├── courses.service.ts
│   │   │   └── dto/
│   │   ├── trainings/
│   │   ├── stats/
│   │   └── health/
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── test/
```

**Technologies**:
- NestJS 10
- TypeScript 5.3+
- Prisma ORM
- Passport + JWT
- class-validator
- Swagger/OpenAPI

**Patterns**:
- Module-based architecture
- Dependency Injection
- Repository Pattern (via Prisma)
- Guards & Interceptors
- DTO Pattern

### 3. Database Layer (PostgreSQL)

**Schema Prisma**:

```prisma
model User {
  id            String      @id @default(uuid())
  email         String      @unique
  password      String
  firstName     String
  lastName      String
  category      String?     // Men, Women, Pro, etc.
  weight        Float?
  height        Float?
  avatar        String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  courses       Course[]
  trainings     Training[]
  goals         Goal[]
  settings      UserSettings?
}

model Course {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  name          String
  city          String
  date          DateTime
  category      String
  totalTime     Int         // en secondes
  notes         String?
  
  times         CourseTime[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model CourseTime {
  id            String      @id @default(uuid())
  courseId      String
  course        Course      @relation(fields: [courseId], references: [id])
  
  segment       String      // run1, sledPush, run2, etc.
  timeSeconds   Int
  
  @@unique([courseId, segment])
}

model Training {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  type          String      // Run, Sled, Renfo, Mix
  date          DateTime
  duration      Int?        // en minutes
  distance      Float?      // en km
  load          Float?      // en kg
  rpe           Int?        // 1-10
  notes         String?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Goal {
  id            String      @id @default(uuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  
  title         String
  targetTime    Int?        // en secondes
  targetDate    DateTime?
  achieved      Boolean     @default(false)
  achievedAt    DateTime?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model UserSettings {
  id            String      @id @default(uuid())
  userId        String      @unique
  user          User        @relation(fields: [userId], references: [id])
  
  theme         String      @default("light") // light, dark
  notifications Boolean     @default(true)
  language      String      @default("fr")
  
  updatedAt     DateTime    @updatedAt
}
```

### 4. API Design

**RESTful Endpoints**:

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/auth/me` | Profil utilisateur | Oui |
| PUT | `/api/users/:id` | Modifier profil | Oui |
| DELETE | `/api/users/:id` | Supprimer compte | Oui |
| GET | `/api/courses` | Liste des courses | Oui |
| POST | `/api/courses` | Créer une course | Oui |
| GET | `/api/courses/:id` | Détail course | Oui |
| PUT | `/api/courses/:id` | Modifier course | Oui |
| DELETE | `/api/courses/:id` | Supprimer course | Oui |
| GET | `/api/trainings` | Liste entraînements | Oui |
| POST | `/api/trainings` | Créer entraînement | Oui |
| GET | `/api/stats/overview` | Stats globales | Oui |
| GET | `/api/stats/progression` | Évolution | Oui |
| GET | `/api/stats/stations` | Stats par station | Oui |
| GET | `/api/health` | Health check | Non |

**Format de réponse standard**:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [...]
  }
}
```

### 5. Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │   API   │                │ Database │
└────┬────┘                └────┬────┘                └─────┬────┘
     │                          │                           │
     │  POST /auth/register     │                           │
     ├─────────────────────────>│                           │
     │                          │  Hash password (bcrypt)   │
     │                          │                           │
     │                          │  Save user                │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │<──────────────────────────┤
     │                          │  Generate JWT token       │
     │  200 + JWT               │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
     │  Subsequent requests     │                           │
     │  (Authorization: Bearer) │                           │
     ├─────────────────────────>│                           │
     │                          │  Verify JWT               │
     │                          │  Extract user ID          │
     │                          │  Query data               │
     │                          ├──────────────────────────>│
     │                          │<──────────────────────────┤
     │  200 + Data              │                           │
     │<─────────────────────────┤                           │
```

### 6. Deployment Architecture

**Frontend (Vercel)**:
- Build: `ng build --configuration=production`
- Output: Static files (HTML, CSS, JS)
- Deployment: Push to main branch → Auto deploy
- CDN: Vercel Edge Network (Global)
- SSL: Auto-provisioned

**Backend (Railway)**:
- Build: Docker image
- Runtime: Node.js 20
- Auto-scaling: Based on CPU/Memory
- Database: Connection pooling
- Logs: Structured JSON logs

**Database (Supabase)**:
- PostgreSQL 15
- Connection pooling
- Automatic backups
- Read replicas (si nécessaire)

### 7. Security Measures

**Frontend**:
- CSP Headers
- XSS Protection (Angular Sanitizer)
- CSRF Protection
- JWT Storage (httpOnly serait idéal mais pas possible avec SPA → localStorage avec précautions)
- Input validation

**Backend**:
- Helmet.js (Security headers)
- CORS configured
- Rate limiting (express-rate-limit)
- JWT expiration
- Password hashing (bcrypt, rounds: 10)
- Input validation (class-validator)
- SQL Injection protection (Prisma ORM)

**Infrastructure**:
- HTTPS only
- Environment variables pour secrets
- No credentials in code
- Database credentials rotation

### 8. Scalability & Performance

**Frontend**:
- Lazy loading des routes
- Tree-shaking
- AOT compilation
- Gzip/Brotli compression
- Service Worker (PWA)
- CDN caching

**Backend**:
- Connection pooling
- Database indexing
- Caching (Redis si nécessaire)
- Pagination
- Query optimization

**Database**:
- Indexes sur foreign keys
- Indexes sur colonnes fréquemment requêtées
- Partitioning si volume important

### 9. Monitoring & Observability

**Metrics collectées**:
- Response time (p50, p95, p99)
- Error rate
- Request rate
- CPU / Memory usage
- Database query time

**Logs**:
- Format: JSON structuré
- Niveaux: error, warn, info, debug
- Contexte: request ID, user ID, timestamp

**Alerting**:
- Sentry: Errors en temps réel
- UptimeRobot: Downtime
- Email/Slack notifications

## Justification des choix

### Pourquoi Angular 21 ?
- Framework enterprise-grade
- TypeScript natif
- Standalone components (moderne)
- Signals (reactive sans RxJS complexe)
- CLI puissant
- Cohérent avec les règles de code fournies

### Pourquoi NestJS ?
- Architecture modulaire
- TypeScript natif (cohérence avec frontend)
- Dependency Injection
- Ecosystem riche (Passport, Prisma, etc.)
- Swagger intégré
- Testabilité excellente

### Pourquoi PostgreSQL ?
- ACID compliant
- Relations complexes gérées naturellement
- Performance excellente
- JSON support (si besoin)
- Mature et stable

### Pourquoi Prisma ?
- Type-safety complète
- Migrations automatiques
- Dev experience excellente
- Protection SQL injection
- Compatible TypeScript

### Cloud providers gratuits ?
- Vercel: Meilleur pour SPA, CDN global
- Railway/Render: Free tier généreux pour backend
- Supabase: PostgreSQL + Storage gratuit

## Évolutions futures

**Phase 2**:
- WebSockets pour temps réel
- PWA offline mode
- Communauté / Classements
- Export PDF des rapports
- Notifications push

**Phase 3**:
- Mobile app (Ionic/Capacitor)
- Multi-langue
- Intégration wearables (Garmin, Polar)
- IA pour recommandations d'entraînement

**Optimisations**:
- Redis pour caching
- Elasticsearch pour recherche avancée
- Queue system (Bull) pour traitements asynchrones
- CDN pour assets statiques


