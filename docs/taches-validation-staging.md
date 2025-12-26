# Plan de vérification fonctionnelle

## Tâche 1 : Vérifier la user story « Perrine, 29 ans, acheteuse de kebab à midi »

**Objectif**
- Garantir que Perrine peut découvrir le menu, personnaliser son kebab et finaliser sa commande sans friction.

**Parcours utilisateur attendu**
1. Perrine ouvre la page d’accueil et accède au catalogue (pizza, kebab, menus du midi).
2. Elle sélectionne un kebab depuis la page catalogue ou via la recherche si disponible.
3. Perrine choisit la formule (taille, sauce, accompagnement) et ajoute le kebab au panier.
4. Elle consulte le panier, ajuste éventuellement les quantités ou supprime des articles.
5. Perrine choisit le mode de retrait ou de livraison, renseigne ses coordonnées et valide la commande.
6. Elle reçoit une confirmation (écran de succès ou récapitulatif de commande).

**Critères de vérification**
- [ ] Les éléments du parcours ci-dessus sont réalisables sur l’environnement cible (staging).
- [ ] Aucune erreur console ou blocage UI lors de la navigation.
- [ ] Les totaux du panier se mettent à jour correctement (prix, taxes, frais de livraison).
- [ ] Les règles métier spécifiques au kebab (options obligatoires, disponibilité midi) sont respectées.
- [ ] Une trace de la commande (log ou base staging) est créée à la validation.

**Préparatifs**
- Accès à l’URL de staging avec compte test si nécessaire.
- Jeux de données ou fixtures reflétant l’offre midi.
- Check-list UX pour capturer les points de friction éventuels.

## Tâche 2 : Valider toutes les fonctionnalités sur l’environnement de staging

**Objectif**
- Passer en revue l’intégralité des fonctionnalités livrées afin de confirmer la stabilité avant déploiement.

**Portée fonctionnelle**
- Catalogue (pizzas, kebabs, desserts, boissons).
- Gestion du panier (ajout, modification, suppression, calcul des frais).
- Pages principales (accueil, panier, commande, suivi le cas échéant).
- Authentification/utilisateurs si disponible (inscription, connexion, préférences).
- Routes API et webhooks intégrés.
- Contenus dynamiques (traductions, thèmes, configuration runtime).

**Plan de test**
1. Démarrer sur staging avec un navigateur supporté (Chrome, Firefox).
2. Nettoyer le stockage local/session pour partir d’un état vierge.
3. Exécuter des scénarios représentatifs :
   - Commande standard (kebab midi).
   - Commande mixte (pizza + boisson + dessert).
   - Annulation ou modification panier.
   - Changement de langue/monnaie si disponible.
4. Vérifier les intégrations externes : paiements simulés, analytics, notifications.
5. Contrôler les routes API (statuts 2xx, payload attendus, absence d’erreurs serveur).
6. Saisir les résultats dans un rapport de test partagé (tableau ou outil QA).

**Critères d’acceptation**
- [ ] Tous les scénarios définis sont passés avec succès ou documentés avec anomalies.
- [ ] Les logs d’erreurs (serveur, navigateur) ne contiennent pas de régressions bloquantes.
- [ ] Les variables d’environnement et secrets staging sont présents et valides.
- [ ] Les performances restent dans les budgets définis (temps de chargement, TTFB).
- [ ] Les recommandations post-test sont priorisées et assignées.

**Livrables**
- Rapport de validation détaillant les scénarios, résultats, captures et anomalies.
- Liste des actions correctives à adresser avant la mise en production Vercel.
- Accord de sortie signé par l’équipe produit/QA.
