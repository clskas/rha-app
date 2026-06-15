# Cahier des Charges - Application de Gestion des Ressources Humaines

## 1. Présentation du Projet

### 1.1 Contexte
Développement d'une application web de gestion des ressources humaines (GRH) permettant de centraliser et d'automatiser la gestion administrative du personnel au sein d'une organisation.

### 1.2 Objectifs
- Centraliser les informations des employés
- Automatiser la gestion des congés et absences
- Faciliter le processus de recrutement
- Assurer le suivi des performances
- Gérer la paie et les documents administratifs
- Offrir une plateforme collaborative RH/Manager/Employé

## 2. Architecture Technique

### 2.1 Stack Technologique
| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + React Router + Axios |
| Backend | Python Django 5 + Django REST Framework |
| Base de données | PostgreSQL |
| Authentification | JWT (djangorestframework-simplejwt) |
| UI Framework | Tailwind CSS 3 |
| État global | React Context + Hooks |

### 2.2 Structure du Projet
```
Ressourcehumaineapp/
├── backend/                 # Projet Django
│   ├── config/             # Configuration Django
│   ├── apps/               # Applications Django
│   │   ├── employees/      # Gestion des employés
│   │   ├── leaves/         # Gestion des congés
│   │   ├── payroll/        # Gestion de la paie
│   │   ├── recruitment/    # Gestion du recrutement
│   │   ├── evaluations/    # Évaluations des performances
│   │   └── accounts/       # Authentification et rôles
│   └── requirements.txt
├── frontend/                # Projet React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── contexts/       # Contextes React
│   │   ├── services/       # Services API
│   │   └── styles/         # Styles Tailwind
│   └── package.json
└── docs/                    # Documentation
```

### 2.3 Système de Rôles et Permissions
| Rôle | Accès |
|------|-------|
| Super Admin | Accès total à toutes les fonctionnalités |
| RH | Gestion des employés, congés, recrutement, paie, évaluations |
| Manager | Gestion de son équipe, validation des congés |
| Employé | Profil personnel, demande de congés, documents |

## 3. Fonctionnalités Détaillées

### 3.1 Module Employés
- CRUD complet des employés
- Fiche employé avec informations personnelles, professionnelles, contractuelles
- Historique des postes et services
- Upload de documents (CV, contrats, certificats)
- Recherche et filtres avancés

### 3.2 Module Congés et Absences
- Types de congés (annuels, maladie, maternité, etc.)
- Demande de congé avec validation hiérarchique
- Calendrier des absences
- Solde de congés calculé automatiquement
- Workflow de validation (Employé → Manager → RH)

### 3.3 Module Paie
- Configuration des grilles salariales
- Bulletin de paie (consultation et historique)
- Déclarations sociales
- Export des données comptables

### 3.4 Module Recrutement
- Gestion des offres d'emploi
- Candidatures et suivi
- Planning des entretiens
- Décision d'embauche

### 3.5 Module Évaluations
- Campagnes d'évaluation
- Grilles d'évaluation personnalisables
- Auto-évaluation et évaluation manager
- Historique des performances
- Objectifs et suivi

## 4. Contraintes Techniques

### 4.1 Performance
- Temps de réponse API < 500ms
- Pagination sur toutes les listes
- Optimisation des requêtes N+1

### 4.2 Sécurité
- Authentification JWT
- Permissions basées sur les rôles
- Validation des données côté serveur
- Protection CSRF
- Hachage des mots de passe (Argon2)

### 4.3 Qualité
- Tests unitaires et d'intégration
- Documentation des API (OpenAPI/Swagger)
- Code Review et linting (ESLint, Flake8)

## 5. Livrables
1. Code source complet (backend + frontend)
2. Documentation technique
3. Scripts de déploiement
4. Jeux de données de démonstration
