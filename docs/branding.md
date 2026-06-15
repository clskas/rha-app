# Branding - Ressource Humaine App

## Identité Visuelle

### Nom
**RHA - Ressource Humaine App**

### Logo Concept
Icône : Deux silhouettes stylisées formant un "R" / "H", représentant la collaboration humaine.
Typographie : Sans-serif moderne, graisse medium.

### Palette de Couleurs

| Rôle | Couleur | Hex | Usage |
|------|---------|-----|-------|
| Primaire | Bleu corporate | `#1E3A5F` | Header, sidebar, boutons principaux |
| Secondaire | Bleu clair | `#3B82F6` | Liens, accents, badges |
| Accent | Vert succès | `#10B981` | Validations, statuts positifs |
| Danger | Rouge | `#EF4444` | Suppressions, alertes |
| Warning | Orange | `#F59E0B` | Alertes, statuts en attente |
| Fond | Gris clair | `#F1F5F9` | Arrière-plan des pages |
| Surface | Blanc | `#FFFFFF` | Cartes, modaux, formulaires |
| Texte | Gris foncé | `#1E293B` | Corps de texte |

### Typographie

| Usage | Police | Poids |
|-------|--------|-------|
| Titres | Inter | Bold (700) |
| Sous-titres | Inter | Semi-Bold (600) |
| Corps | Inter | Regular (400) |
| Monospace | JetBrains Mono | Regular (400) |

### Espacement
- Base : 4px
- Composants : 16px (p-4)
- Sections : 24px (p-6)
- Pages : 32px (p-8)

### Iconographie
- **Bibliothèque** : Lucide React Icons
- Style : Outline, stroke-width 1.5, taille 20px par défaut

## Ton et Communication
- **Ton** : Professionnel, clair, bienveillant
- **Langue** : Français
- **Format de dates** : JJ/MM/AAAA
- **Format monétaire** : XOF (Franc CFA)

## Composants UI

### Boutons
```
Primaire :   bg-primary text-white hover:bg-primary-dark
Secondaire : bg-white text-primary border border-primary
Danger :     bg-danger text-white hover:bg-danger-dark
Ghost :      bg-transparent hover:bg-gray-100
```

### Cartes
```
bg-white rounded-xl shadow-sm border border-gray-100 p-6
```

### Formulaires
```
Input :   w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary
Label :   block text-sm font-medium text-gray-700 mb-1
```

### Tableaux
```
En-tête : bg-gray-50 text-gray-600 text-xs font-semibold uppercase
Ligne :   border-b border-gray-100 hover:bg-gray-50
```

## Dashboard - Exemple de Layout
```
┌─────────────────────────────────────────────────┐
│ Header [Logo] [Recherche] [Notifications] [Profil] │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content                         │
│ ─────── │                                        │
│ ● Tableau│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ ● Employés│  │ KPI │ │ KPI │ │ KPI │ │ KPI │    │
│ ● Congés │  └─────┘ └─────┘ └─────┘ └─────┘    │
│ ● Paie   │  ┌─────────────────────────────┐     │
│ ● Recrut │  │   Tableau / Graphiques       │     │
│ ● Éval   │  └─────────────────────────────┘     │
└──────────┴──────────────────────────────────────┘
```
