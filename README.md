# 🏦 NeoBank — Application Bancaire en Ligne

Application bancaire complète : **backend Express + PostgreSQL** et **frontend React (Vite)**, déployable sur **Vercel** avec une base **Neon** (PostgreSQL serverless).

---

## 🚀 Stack technique

| Technologie | Usage |
|-------------|-------|
| React 18 | Interface utilisateur |
| Vite | Bundler / Dev server |
| Express 4 | API REST backend |
| PostgreSQL (pg) | Base de données (+ Neon en SaaS) |
| JSON Web Token | Authentification stateless |
| bcryptjs | Hashage des mots de passe |
| SSE | Notifications temps réel (fallback polling) |
| Tailwind CSS | Styles et design system |
| Recharts | Graphiques et visualisations |
| React Router v6 | Navigation SPA |
| React Hot Toast | Notifications UI |

---

## 📁 Structure du projet

```
server/
├── index.js                  # App Express (compatible serverless Vercel)
├── config/database.js        # Pool PostgreSQL (SSL auto pour Neon)
├── db/schema.sql             # Schéma SQL complet + features de fondation
├── routes/
│   ├── api.routes.js         # Regroupe toutes les routes API
│   └── events.routes.js      # Endpoint SSE
├── controllers/              # auth, client, admin, transfers, rules, etc.
├── middlewares/              # auth, admin, adminRoles
└── scripts/
    ├── apply-schema.js       # Applique schema.sql     (npm run db:schema)
    └── seed.js               # Crée un admin           (npm run db:seed)

src/
├── pages/
│   ├── AuthPage.jsx          # Login / Register / Forgot
│   ├── DashboardPage.jsx     # Layout client
│   └── AdminPage.jsx         # Panel administrateur
├── services/
│   ├── api.js                # Client axios (base /api)
│   └── sse.js                # Connexion SSE temps réel
├── context/AuthContext.jsx   # État d'authentification
└── ... (composants, styles, utils)
```

---

## ⚙️ Installation (développement local)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Base de données locale (optionnel)

```bash
# Le schéma est appliqué par :
npm run db:schema

# Créer un compte admin :
npm run db:seed
```

Ces scripts lisent `DATABASE_URL` dans un fichier `.env` (voir `.env.example`).

### 3. Configurer `.env`

Copier `.env.example` → `.env` et renseigner `DATABASE_URL`, `JWT_SECRET`.

### 4. Lancer l'application

```bash
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:4000 (proxy `/api` en dev)

---

## ☁️ Déploiement Vercel + Neon

### 1. Créer un projet Neon (base de données)

1. Aller sur https://console.neon.tech → **New Project**.
2. Lancer une instance avec la région la plus proche de tes utilisateurs.
3. Ouvrir **Connection Details** → copier la **Connection string** (driver Node.js) :
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

> Neon exige SSL : le code force le SSL automatiquement dès que l'URL contient `neon.tech`.

### 2. Appliquer le schéma

Depuis la racine du projet, avec la connection string Neon :

```bash
# Windows (PowerShell) — remplace par ta vraie URL entre guillemets
$env:DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
npm run db:schema
```

Ou utiliser **Neon SQL Editor** : copier le contenu de `server/db/schema.sql` puis **Run**.

### 3. Créer le compte admin initial

```bash
$env:SEED_ADMIN_EMAIL="admin@neobank.local"
$env:SEED_ADMIN_PASSWORD="ton_mot_de_passe_fort"
$env:DATABASE_URL="postgresql://..."
npm run db:seed
```

### 4. Déployer sur Vercel

1. Pousser le code sur un dépôt Git (GitHub/GitLab/Bitbucket).
2. **Vercel → Add New → Project** → importer le dépôt.
3. Framework preset : **Vite** (`build`: `vite build` → `dist/`).
4. Ajouter les **Environment Variables** :
   | Variable | Valeur |
   |----------|--------|
   | `DATABASE_URL` | ta connection string Neon |
   | `JWT_SECRET` | longue chaîne aléatoire |
   | `NODE_ENV` | `production` |
   | `PG_MAX_POOL` | `3` (optionnel) |
   | `VITE_API_URL` | vide / absent → utilise `/api` relatif |
5. **Deploy**.

Le fichier `vercel.json` gère le routage : les appels `/api/*` vont vers la fonction Express `@vercel/node`, le reste sert le SPA (`dist/`).

### 5. Vérifier

- `https://ton-projet.vercel.app/` → page d'authentification.
- `https://ton-projet.vercel.app/health` → statut du serveur API.
- Te connecter avec le compte admin créé à l'étape 3.

---

## 🔐 Sécurité

- Mots de passe hashés avec **bcryptjs**.
- Authentification **JWT** (header `Authorization: Bearer <token>`).
- Routes protégées côté React (PrivateRoute, AdminRoute).
- Middlewares serveur `auth`, `admin`, `adminRoles` (superadmin / compliance / finance / support).
- Journal **audit_logs** immutable pour les actions sensibles.

---

## 👑 Comptes administratifs

Après avoir lancé `npm run db:seed`, connecte-toi avec `admin@neobank.local` / ton mot de passe. Le panneau admin est accessible depuis le dashboard (`/admin`).

---

## 🗄️ Base de données

Le schéma (`server/db/schema.sql`) inclut :

- `users`(+ `admin_role`) — clients et administrateurs
- `transactions` — statuts étendus (pending, verifying, suspended, authorized, executed, refused, failed, completed)
- `cards`, `kyc_submissions`, `iban_requests`, `card_requests`, `notifications`
- `account_activation_requests`, `withdrawal_requests`, `withdrawal_steps`, `withdrawal_codes`, `withdrawal_proofs`
- `beneficiaries` — bénéficiaires de virement
- `transfer_rules` — moteur de règles de sécurité configurables
- `audit_logs` — journal d'audit
- `modal_messages`

---

## 📱 Responsive

L'application est entièrement responsive :
- Sidebar rétractable sur mobile
- Grilles adaptatives (1 → 4 colonnes)
- Cartes bancaires et tableaux optimisés pour petits écrans
