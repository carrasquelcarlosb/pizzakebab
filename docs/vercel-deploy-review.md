# Revue des fonctionnalités pour la déployabilité Vercel

## Contexte général
Les derniers développements ont introduit plusieurs fonctionnalités clés (catalogue enrichi, contexte panier global, page de commande détaillée, utilitaires partagés, routes API) dont la compatibilité avec l'environnement serverless de Vercel doit être confirmée. Cette note récapitule les points déjà couverts par le code et les éventuels ajustements à surveiller.

## Routes API compatibles serverless
- **Catalogue du menu** : la route `GET /api/menu` et sa contrepartie `POST` reposent sur les _route handlers_ natifs de Next (`NextResponse`) et manipulent uniquement des structures en mémoire dérivées du catalogue statique, ce qui correspond au modèle des fonctions serverless de Vercel.【F:app/api/menu/route.ts†L1-L68】
- **Panier** : les handlers `GET`, `POST` et `DELETE` exposent un tableau en mémoire pour simuler la persistance. Ce choix reste fonctionnel sur Vercel (chaque exécution dispose de son propre état) mais ne garantit pas la persistance entre invocations ; il faudra prévoir un stockage durable (Edge Config, KV, base de données) avant la mise en production.【F:app/api/cart/route.ts†L1-L78】

## Gestion du panier côté client
- **Contexte React** : `CartProvider` gère l'état du panier et les totaux via `useState`, `useMemo` et des utilitaires purs (`calculateTotals`, `calculateItemCount`). Le contexte est explicitement marqué `"use client"`, ce qui évite les appels à `localStorage` ou `window` sur le serveur lors du rendu initial Vercel.【F:src/contexts/cart-context.tsx†L1-L82】【F:src/lib/cart.ts†L1-L38】
- **Intégration des providers** : `AppProviders` compose le `LanguageProvider` et le `CartProvider`, garantissant une hiérarchie cohérente pour toutes les pages clientes (cart et order).【F:src/components/app-providers.tsx†L1-L12】

## Page de commande et expérience panier
- **OrderClientPage** : la page utilise exclusivement des hooks côté client (`useState`, `useMemo`) et des utilitaires purs (`calculatePricingBreakdown`, `validateAddressFields`). Les interactions (validation, affichage conditionnel du panier vide) ne dépendent d'aucune API Node.js, assurant un rendu hybride compatible avec Vercel.【F:src/app/order/OrderClientPage.tsx†L1-L161】【F:src/lib/pricing.ts†L1-L43】【F:src/lib/address.ts†L1-L34】
- **CartClientPage** : l'expérience panier s'appuie sur les mêmes providers clients et sur les utilitaires de formatage/pricing, sans dépendances serveur. Les actions (ajout, suppression, changement de mode livraison/retrait) restent purement clients et prêtes pour un rendu sur Vercel.【F:src/app/cart/CartClientPage.tsx†L1-L144】

## Catalogue et utilitaires partagés
- **Catalogue enrichi** : `menuCatalog` expose pizzas, kebabs, wraps, boissons et desserts via un simple objet exporté ; cette structure est compatible avec le bundling statique de Next/Vercel et évite toute dépendance I/O.【F:src/data/menu-catalog.ts†L1-L118】
- **Calculs partagés** : `pricing.ts` et `address.ts` proposent des fonctions pures sans effets de bord. Elles peuvent être réutilisées aussi bien côté client que côté serveur sans configuration spécifique pour Vercel.【F:src/lib/pricing.ts†L1-L43】【F:src/lib/address.ts†L1-L34】

## Points de vigilance restants
1. **Persistance du panier côté API** : l'état en mémoire de `app/api/cart/route.ts` disparaîtra à chaque warm-up/froid d'une fonction serverless. Prévoir un stockage persistant avant le go-live Vercel.【F:app/api/cart/route.ts†L1-L78】
2. **Hydratation des providers** : `LanguageProvider` lit/écrit dans `localStorage` uniquement dans un `useEffect`, ce qui reste sûr, mais il faudra s'assurer que les pages utilisant ce provider sont bien marquées `"use client"` (actuellement le cas via `AppProviders`).【F:src/contexts/language-context.tsx†L1-L48】
3. **Configuration Next.js** : le `next.config.ts` est minimal ; pour Vercel, vérifier en amont s'il faut activer des options spécifiques (`output`, `experimental`) selon la cible (app router).【F:next.config.ts†L1-L7】

## Recommandations pour la mise en production Vercel
- Ajouter un stockage persistant (PostgreSQL, Supabase, Vercel KV) pour le panier et toute donnée mutable.
- Documenter/automatiser les variables d'environnement sensibles dans le tableau de bord Vercel (clés analytics, éventuelles API externes).
- Exécuter `npm run lint` et `npm run test` dans le pipeline CI afin de détecter tout usage involontaire d'APIs non compatibles Edge/Serverless.
- Si des fonctions doivent tourner en mode Edge, expliciter `export const runtime = "edge";` dans les handlers concernés pour bénéficier de la latence minimale une fois sur Vercel.
