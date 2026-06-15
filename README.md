# RHA - Ressource Humaine App

Application de gestion des ressources humaines pour la RD Congo.

## Fonctionnalités

- **Employés** : Gestion complète des employés, documents, upload
- **Congés** : Demandes, approbation/refus, calendrier mensuel interactif
- **Paie** : Bulletins de paie, PDF, calcul automatique CNSS + IPR, génération en masse
- **Recrutement** : Offres d'emploi, candidatures, suivi
- **Évaluations** : Campagnes d'évaluation, notation, commentaires
- **Formations** : Catalogue, inscriptions, approbation
- **Contrats** : Historique, alertes renouvellement
- **Dashboard** : Statistiques, graphiques (recharts)
- **Audit** : Journal de toutes les actions
- **Notifications** : In-app + email (SMTP)
- **Import/Export** : Excel (import), CSV (export)
- **RBAC** : 4 rôles (admin, rh, manager, employee) avec route guards

## Stack technique

- **Frontend** : React 18, Vite 6, Tailwind CSS 4, Recharts, TypeScript
- **Backend** : Django 6, Django REST Framework, JWT, drf-spectacular
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **Infrastructure** : Docker, Nginx

## Démarrage rapide

```bash
docker-compose up -d
```

Accès : http://localhost:3000

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@rha.cd | admin123 |
| RH | rh1@rha.cd | rh123 |
| Manager | manager1@rha.cd | rh123 |
| Employé | employe1@rha.cd | rh123 |

### Documentation

- Manuel utilisateur : `docs/manual-utilisation.md`
- API Swagger : http://localhost:8000/api/docs/
- API ReDoc : http://localhost:8000/api/redoc/
