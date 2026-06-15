# RHA - Ressource Humaine App

Application de gestion des ressources humaines pour la République Démocratique du Congo.

## Table des matières

1. [Présentation](#1-présentation)
2. [Installation](#2-installation)
3. [Connexion](#3-connexion)
4. [Tableau de bord](#4-tableau-de-bord)
5. [Employés](#5-employés)
6. [Contrats](#6-contrats)
7. [Postes et Départements](#7-postes-et-départements)
8. [Congés](#8-congés)
9. [Paie](#9-paie)
10. [Recrutement](#10-recrutement)
11. [Évaluations](#11-évaluations)
12. [Formations](#12-formations)
13. [Import Excel](#13-import-excel)
14. [Audit](#14-audit)
15. [Notifications](#15-notifications)
16. [Profil](#16-profil)
17. [API Documentation](#17-api-documentation)

---

## 1. Présentation

RHA est une application web complète de gestion des ressources humaines adaptée au contexte de la RD Congo :

- **Devise** : CDF (Franc Congolais) par défaut, également USD et XOF
- **CNSS** : Calcul automatique des cotisations (5% employé, 5% employeur)
- **Impôts** : Calcul automatique de l'IPR (Impôt Professionnel sur les Rémunérations) avec barème progressif
- **Téléphone** : Format +243
- **Types de contrat** : CDI, CDD, Stage, Freelance, Prestation de services

### Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **Admin** | Accès complet à toutes les fonctionnalités |
| **RH** | Gestion des employés, paie, recrutement, formations, contrats |
| **Manager** | Vue employés, gestion des congés de son équipe, évaluations |
| **Employé** | Vue personnelle : profil, congés, paie, évaluations, formations |

---

## 2. Installation

### Prérequis

- Docker et Docker Compose (recommandé)
- Ou Python 3.12+ et Node.js 18+

### Avec Docker

```bash
docker-compose up -d
```

Accès :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000/api/
- Documentation API : http://localhost:8000/api/docs/
- Admin Django : http://localhost:8000/admin/

### Sans Docker

**Backend :**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Connexion

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@rha.cd | admin123 |
| RH | rh1@rha.cd | rh123 |
| Manager | manager1@rha.cd | rh123 |
| Employé | employe1@rha.cd | rh123 |

### Connexion

1. Ouvrez l'application dans votre navigateur
2. Saisissez votre email et mot de passe
3. Cliquez sur **Se connecter**

---

## 4. Tableau de bord

Le tableau de bord affiche un résumé de l'activité :

- **Cartes statistiques** : Nombre d'employés, congés en attente, offres actives, masse salariale du mois
- **Graphique barres** : Évolution de la masse salariale sur 6 mois
- **Camembert** : Répartition des employés par type de contrat
- **Graphique barres** : Statistiques des congés (approuvés, en attente, refusés)

---

## 5. Employés

### Liste des employés

- Accès via le menu **Employés** (admin, RH, manager)
- Tableau paginé avec recherche par nom, prénom, email
- Filtres par département
- Export CSV disponible

### Création d'un employé

1. Cliquez sur **Nouvel employé**
2. Remplissez les informations :
   - **Utilisateur** : Sélectionnez un utilisateur existant (créé via l'admin)
   - **Informations personnelles** : Département, poste, manager
   - **Contrat** : Type (CDI, CDD, Stage, Freelance, Prestation), date d'embauche
   - **Salaire** : Montant et devise (CDF, USD, XOF)
   - **CNSS** : Numéro de sécurité sociale congolaise
3. Cliquez sur **Enregistrer**

### Détail d'un employé

- Consultez les informations complètes
- **Documents** : Téléchargez des documents (contrats, certificats, etc.)
- Actions : Modifier, supprimer (avec confirmation)

---

## 6. Contrats

- Accès via le menu **Contrats** (admin, RH)
- Historique complet des contrats de chaque employé
- Création et modification de contrats
- **Alerte renouvellement** : Bannière orange pour les contrats expirant dans moins de 30 jours
- Badge de compteur dans la sidebar

### Créer un contrat

1. Cliquez sur **Nouveau contrat**
2. Sélectionnez l'employé, le type de contrat, les dates
3. Définissez le salaire et la devise
4. Téléchargez une copie signée (PDF)
5. Cliquez sur **Enregistrer**

---

## 7. Postes et Départements

### Départements

- Accès via le menu **Départements** (admin, RH)
- Création, modification, suppression de départements

### Postes

- Accès via le menu **Postes** (admin, RH)
- Chaque poste est lié à un département
- Création, modification, suppression

---

## 8. Congés

### Types de congés

- Configurés dans la base de données (Conge annuel, Maladie, Maternité, etc.)
- Chaque type a un nombre de jours par défaut, une couleur et peut exiger un document

### Demander un congé

1. Accès via le menu **Congés**
2. Cliquez sur **Nouvelle demande**
3. Sélectionnez le type de congé, les dates, la raison
4. Joignez un document si nécessaire
5. Soumettez la demande

### Approuver/Refuser

- Les managers et RH peuvent approuver ou refuser les demandes
- Une notification est envoyée à l'employé

### Calendrier des congés

- Accès via le menu **Calendrier congés**
- Vue mensuelle interactive
- Navigation mois précédent/suivant
- Les congés sont affichés avec la couleur de leur type
- Les jours fériés et week-ends sont grisés

---

## 9. Paie

### Bulletins de paie

- Accès via le menu **Paie**
- Liste paginée des bulletins
- Filtres par statut (payé/en attente)
- Export CSV

### Calcul automatique

Le système calcule automatiquement :
- **CNSS employé** : 5% du salaire brut
- **CNSS employeur** : 5% du salaire brut
- **IPR (Impôt Professionnel sur les Rémunérations)** :
  - 0% pour ≤ 100 000 CDF
  - 10% pour 100 001 - 500 000 CDF
  - 15% pour 500 001 - 1 000 000 CDF
  - 20% pour 1 000 001 - 2 000 000 CDF
  - 25% pour > 2 000 000 CDF

### Génération des bulletins

1. **Génération individuelle** : Cliquez sur l'icône PDF à côté d'un bulletin
2. **Génération en masse** : Cliquez sur **Générer la paie**, sélectionnez le mois/année, et la devise

### Téléchargement PDF

- Chaque bulletin peut être téléchargé au format PDF
- Le PDF contient : en-tête, période, informations employé, détail des calculs

---

## 10. Recrutement

### Offres d'emploi

- Création d'offres avec titre, description, département, statut (publiée/brouillon/fermée)
- Liste des offres avec nombre de candidats

### Candidats

- Dépôt de candidature sur une offre
- Suivi du statut (nouveau, présélectionné, entretien, accepté, refusé)
- Téléchargement du CV

---

## 11. Évaluations

### Campagnes d'évaluation

- Les RH peuvent créer des campagnes (ex: "Évaluation annuelle 2026")
- Définition de la période et des employés concernés

### Évaluations

- Les managers évaluent les employés
- Critères : note (1-5), commentaires
- Confidentialité : chaque employé voit ses propres évaluations
- Les managers et RH voient toutes les évaluations

---

## 12. Formations

### Catalogue

- Accès via le menu **Formations**
- Liste des formations (titre, formateur, dates, statut, participants)

### Gestion

- **Admin/RH** : Créer, modifier, supprimer des formations
- **Admin/RH** : Approuver, refuser, valider les inscriptions
- **Employés** : S'inscrire aux formations disponibles

### Statuts

| Statut | Signification |
|--------|--------------|
| Planifiée | Formation à venir |
| En cours | Formation en déroulement |
| Terminée | Formation achevée |
| Annulée | Formation annulée |

---

## 13. Import Excel

- Accès via le menu **Import Excel** (admin, RH)
- Importez des employés en masse depuis un fichier Excel (.xlsx)

### Format du fichier

| Colonne | Description | Requis |
|---------|-------------|--------|
| first_name | Prénom | Oui |
| last_name | Nom | Oui |
| email | Email | Oui |
| phone | Téléphone | Non |
| department_name | Nom du département | Oui |
| position_title | Titre du poste | Oui |
| contract_type | CDI/CDD/stage/freelance/prestation | Oui |
| hire_date | Date d'embauche (YYYY-MM-DD) | Oui |
| salary | Salaire | Non |
| currency | CDF/USD/XOF | Non |
| cnss_number | Numéro CNSS | Non |

### Procédure

1. Cliquez sur **Choisir un fichier**
2. Sélectionnez votre fichier Excel
3. Prévisualisez les données (20 premières lignes)
4. Cliquez sur **Importer**
5. Consultez le résultat (succès + éventuelles erreurs)

---

## 14. Audit

- Accès via le menu **Audit** (admin, RH)
- Journal de toutes les actions importantes :
  - Créations, modifications, suppressions
  - Approbations et refus de congés
- Filtrage par type d'action
- Pagination

---

## 15. Notifications

### In-app

- Icône cloche dans le header
- Badge rouge avec le nombre de notifications non lues
- Dropdown avec les dernières notifications
- Lien direct vers la page concernée
- Bouton **Tout marquer lu**
- Rafraîchissement automatique toutes les 30 secondes

### Notifications automatiques

| Événement | Destinataire |
|-----------|-------------|
| Nouvelle demande de congé | Manager de l'employé |
| Congé approuvé | Employé concerné |
| Congé refusé | Employé concerné |

### Email

- Les notifications sont également envoyées par email (SMTP configurable)
- Configuration dans le fichier `.env` :
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_HOST_USER=votre@email.com
  EMAIL_HOST_PASSWORD=votre-mot-de-passe
  ```

---

## 16. Profil

- Accès via le cercle avec initiales en bas de la sidebar
- Modification du mot de passe
- Consultation de vos informations

---

## 17. API Documentation

L'API REST est documentée avec Swagger/OpenAPI :

- **Swagger UI** : http://localhost:8000/api/docs/
- **ReDoc** : http://localhost:8000/api/redoc/
- **Schema JSON** : http://localhost:8000/api/schema/

### Authentification API

Les endpoints API nécessitent un token JWT :

```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rha.cd", "password": "admin123"}'

# Utiliser le token
curl http://localhost:8000/api/employees/ \
  -H "Authorization: Bearer <votre_token>"
```

---

## Commandes utiles (développement)

```bash
# Backend - Lancer les tests
cd backend
python manage.py test

# Backend - Créer des migrations
python manage.py makemigrations
python manage.py migrate

# Frontend - Build production
cd frontend
npm run build
```

## Déploiement

```bash
docker-compose -f docker-compose.yml up -d
```

Pour la production, configurez les variables d'environnement dans `.env` :
```
DEBUG=False
SECRET_KEY=<votre_cle_secrete>
DATABASE_URL=postgres://user:password@db:5432/rha
EMAIL_HOST=smtp.votre-fournisseur.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre@email.com
EMAIL_HOST_PASSWORD=<mot-de-passe>
```
