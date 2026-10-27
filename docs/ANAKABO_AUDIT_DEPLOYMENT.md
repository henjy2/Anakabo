# Audit technique Anakabo

Date de l’audit : 25 octobre 2026.

Ce document décrit l’état du code audité. Il ne constitue pas une preuve de fonctionnement
des services externes tant que les tests de préproduction indiqués ci-dessous ne sont pas exécutés.

## Résumé des corrections

- Restauration des routes authentifiées de préférences et d’historique.
- Validation stricte des corps JSON et isolation des clés de stockage par identifiant Supabase.
- Suppression du stockage serveur anonyme fondé sur un `sessionId` fourni par le client.
- Historique local limité à 20 trajets pour les invités et comme solution de secours.
- Remplacement du faux compte téléphone par Supabase Phone Auth.
- Ajout du consentement SMS, d’un code à six chiffres, d’une expiration visible de dix minutes,
  de cinq tentatives maximales côté interface et d’un délai de renvoi de 60 secondes.
- Correction du mode invité.
- Restriction des itinéraires OSRM aux modes routiers réellement configurés.
- Suppression des tracés directs présentés comme trajets avion, bateau ou hélicoptère.
- Remplacement de « démarrer la navigation » par « aperçu du trajet » : le projet ne possède
  pas encore de guidage GPS continu.
- Suppression des faux annonceurs de la bannière publicitaire.
- Chargement d’AdSense uniquement après consentement.
- Ajout de pages publiques À propos, Confidentialité et Conditions.
- Correction de toutes les erreurs TypeScript détectées.

## État du backend

### Routes locales corrigées

| Méthode | Route | Authentification | Réponse |
| --- | --- | --- | --- |
| GET | `/make-server-7faefafb/health` | aucune | `{ "status": "ok" }` |
| GET | `/make-server-7faefafb/preferences` | JWT Supabase | `{ "preferences": {...} }` |
| POST | `/make-server-7faefafb/preferences` | JWT Supabase | `{ "success": true, "preferences": {...} }` |
| GET | `/make-server-7faefafb/routes/history` | JWT Supabase | `{ "routes": [...] }` |
| POST | `/make-server-7faefafb/routes/history` | JWT Supabase | HTTP 201, `{ "success": true, "route": {...} }` |

La clé utilisateur n’est jamais acceptée dans le corps ou la query string. Elle provient
exclusivement du JWT validé par `auth.getUser()`.

### État du backend déployé lors de l’audit

- `/health` : HTTP 200.
- `/preferences` : HTTP 404.
- `/routes/history` : HTTP 404.

La fonction corrigée n’a donc pas été déployée pendant cet audit.

### Stockage et droits

La fonction utilise `kv_store_7faefafb` via la clé de service disponible uniquement dans
l’environnement Edge. Le frontend ne reçoit jamais cette clé.

À vérifier dans Supabase avant déploiement :

1. La table `kv_store_7faefafb` existe.
2. RLS est activé.
3. Les rôles `anon` et `authenticated` ne peuvent pas lire ou écrire directement cette table.
4. Seule la fonction Edge, via `service_role`, effectue les opérations.
5. Les secrets automatiques `SUPABASE_URL`, `SUPABASE_ANON_KEY` et
   `SUPABASE_SERVICE_ROLE_KEY` sont disponibles dans l’environnement Edge.

## Configuration Twilio et Supabase Phone Auth

Le frontend utilise `supabase.auth.signInWithOtp()` et `verifyOtp()`. Les secrets Twilio
ne doivent pas être ajoutés aux variables Vite ou Vercel publiques.

Dans Supabase Dashboard :

1. Ouvrir **Authentication → Providers → Phone**.
2. Activer Phone Auth.
3. Choisir le fournisseur Twilio adapté au compte :
   - Twilio Verify : Account SID, Auth Token et Verify Service SID;
   - ou l’option Twilio proposée par le tableau de bord, avec le Messaging Service SID demandé.
4. Configurer une durée OTP de 600 secondes et un code à six chiffres si ces options sont disponibles.
5. Configurer **Authentication → Rate Limits** pour limiter les envois et vérifications.
6. Activer CAPTCHA/Turnstile pour `signInWithOtp` avant ouverture publique.
7. Vérifier les pays autorisés et les règles géographiques Twilio.
8. Vérifier les obligations de consentement, d’identification de l’expéditeur et les modèles
   réglementaires propres aux pays desservis.

Identifiants sensibles attendus par Supabase, jamais par le frontend :

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID` ou le Messaging Service SID demandé par le fournisseur choisi

Les noms exacts visibles dans Supabase peuvent différer : utiliser les champs du fournisseur
Phone Auth, pas des variables préfixées `VITE_`.

### Test SMS réel obligatoire

1. Utiliser un projet Supabase de préproduction.
2. Utiliser un numéro réel autorisé par Twilio.
3. Demander un code et confirmer la réception du SMS.
4. Tester un mauvais code, cinq tentatives, l’expiration et le renvoi après 60 secondes.
5. Vérifier la création d’un seul utilisateur dans Supabase Auth.
6. Actualiser la page et confirmer la restauration de session.
7. Se déconnecter et se reconnecter avec le même numéro.
8. Contrôler les logs Twilio et Supabase sans copier de secret dans le navigateur.

Ce test n’a pas été exécuté dans l’environnement d’audit.

## Navigation et fournisseurs

Le service actuel est le serveur public OSRM avec le profil `driving`.

Modes autorisés pour l’aperçu routier actuel :

- voiture;
- taxi;
- covoiturage;
- livraison.

Modes conservés dans l’interface mais bloqués avec un message explicite :

- marche, vélo, trottinette, moto, transport public;
- tourisme, poussette et cheval;
- bateau, avion et hélicoptère.

Fournisseurs ou données nécessaires :

- marche/vélo : instance Valhalla, GraphHopper, OpenRouteService ou OSRM dédiée;
- transport public : moteur GTFS/GTFS-Realtime, par exemple OpenTripPlanner;
- trafic : fournisseur disposant de données trafic pour les pays couverts;
- bateau : réseau maritime et moteur spécialisé;
- avion : horaires/aéroports et fournisseur aérien, pas un tracé routier;
- cheval : réseau de sentiers et règles équestres;
- alertes : backend temps réel, source autorisée et modération.

Le projet ne possède pas encore :

- suivi GPS continu;
- instructions de manœuvre;
- recalcul après déviation;
- cache de trajet pour perte réseau;
- trafic ou alertes temps réel;
- application effective des options péages, autoroutes et ferries.

## Cartes hors ligne

### État

Non implémenté. Le projet web ne contient ni service worker, ni catalogue de régions,
ni stockage de tuiles, ni moteur de routage hors ligne.

Le fond CARTO utilisé en ligne ne doit pas être téléchargé en masse sans contrat autorisant
explicitement cet usage.

### Architecture recommandée

Pour une expérience mobile fiable :

1. Créer une application native ou un conteneur mobile disposant d’un stockage contrôlé.
2. Utiliser MapLibre Native avec des paquets régionaux autorisés, ou un SDK commercial
   dont la licence autorise les régions hors ligne.
3. Pour des données auto-hébergées, produire des extraits OpenStreetMap versionnés et
   des paquets PMTiles/MBTiles conformes à la licence ODbL et à l’attribution requise.
4. Stocker un manifeste par zone : identifiant, version, taille, date et empreinte.
5. Prévoir téléchargement interrompu/repris, progression, espace libre, suppression et mise à jour.
6. Séparer les tuiles hors ligne du routage hors ligne.
7. Choisir un moteur embarqué compatible avec les plateformes cibles ou un SDK de navigation
   autorisant les graphes hors ligne.

### Tests obligatoires

- téléchargement interrompu puis repris;
- espace insuffisant;
- suppression et mise à jour;
- téléphone en mode avion;
- redémarrage de l’application sans réseau;
- attribution visible;
- trajet entièrement inclus puis partiellement hors de la zone téléchargée.

## Apple CarPlay

### État

Non implémenté. Aucun fichier `.xcodeproj`, `.xcworkspace`, code Swift ou cible iOS native
n’existe dans ce dépôt. React/Vite seul ne permet pas une application de navigation CarPlay.

### Prérequis

1. Créer une application iOS native et une cible signée.
2. Demander à Apple le droit CarPlay pour la catégorie navigation.
3. Recevoir l’entitlement approprié; il ne peut pas être inventé ou auto-accordé.
4. Utiliser CarPlay framework et `CPMapTemplate`.
5. Exposer depuis le moteur Anakabo :
   - session de navigation;
   - liste des manœuvres;
   - distance et temps restants;
   - recalcul;
   - état GPS et réseau;
   - arrêt de navigation.
6. Respecter les limites d’interaction et modèles approuvés par Apple.

### Tests obligatoires

- simulateur CarPlay dans Xcode;
- appareil iPhone réel;
- véhicule ou unité compatible;
- permissions de localisation « toujours » selon le besoin;
- arrière-plan, appels téléphoniques et perte réseau;
- revue Apple avec entitlement actif.

## AdSense

### Causes techniques identifiées

- Le projet avait auparavant été configuré avec `noindex` et `Disallow: /`.
- L’application affichait de faux sponsors lorsque aucun bloc AdSense n’était configuré.
- Aucun slot AdSense réel n’est fourni au composant actuel.
- Le contenu principal était derrière un écran de connexion.
- Il n’existait pas de pages publiques À propos, Confidentialité et Conditions.
- Le script AdSense était chargé avant tout choix de consentement.

### Corrections

- Indexation autorisée, sitemap et `ads.txt` présents.
- Canonical `https://anakabo.com/`.
- Métadonnées de produit et Open Graph.
- Mode invité réparé.
- Faux annonceurs et liens `#` supprimés.
- Le composant ne rend aucune annonce sans slot réel.
- Consentement explicite avant chargement du script AdSense.
- Pages publiques factuelles ajoutées au sitemap.
- Promesses non fonctionnelles retirées de l’écran d’authentification.

### Actions externes

1. Déployer sur le domaine canonique.
2. Vérifier les URLs publiques sans authentification.
3. Ajouter un bloc AdSense approuvé et fournir son slot réel.
4. Vérifier `ads.txt` dans AdSense.
5. Déclarer le sitemap dans Search Console et demander une nouvelle exploration.
6. Mettre en place une CMP certifiée Google si elle est requise pour les territoires servis.
7. Soumettre à nouveau le site seulement après indexation des pages publiques.

Aucune approbation AdSense ne peut être garantie.

## Déploiement en préproduction

### Supabase

1. Créer ou sélectionner un projet de préproduction.
2. Vérifier la table et ses droits comme indiqué plus haut.
3. Configurer Phone Auth/Twilio dans ce projet.
4. Déployer `supabase/functions/server` avec le mécanisme Supabase connecté de Figma Make,
   en conservant le nom public `make-server-7faefafb`.
5. Ne jamais copier `SUPABASE_SERVICE_ROLE_KEY` dans Vercel ou dans une variable `VITE_*`.
6. Tester `/health`.
7. Obtenir deux comptes de test et vérifier qu’un compte ne peut jamais lire les préférences
   ou l’historique de l’autre.
8. Vérifier les réponses 401 sans JWT, 400 avec corps invalide et 201 pour un trajet valide.

### Frontend

1. Installer avec `pnpm install --frozen-lockfile`.
2. Exécuter `pnpm test`.
3. Exécuter `pnpm run typecheck`.
4. Exécuter `pnpm run build`.
5. Déployer `dist` sur un environnement de préproduction.
6. Configurer dans Supabase les URLs autorisées pour le domaine de préproduction.
7. Tester mobile et ordinateur avec la console et l’onglet réseau ouverts.

## Matrice de statut

| Fonction | Statut |
| --- | --- |
| Validation backend préférences/historique | Fonctionnelle et testée localement |
| Routes Edge préférences/historique | Corrigée mais non testée en environnement réel |
| Isolation des données par JWT | Corrigée mais non testée en environnement réel |
| Historique invité local | Corrigé mais non testé sur appareil réel |
| Connexion courriel/Google | Bloquée par la configuration Supabase réelle pour le test |
| SMS Supabase avec Twilio | Bloqué par la configuration externe et un vrai SMS |
| Aperçu OSRM routier | Corrigé mais non testé sur toutes les zones réelles |
| Marche/vélo/transit/bateau/avion/hélicoptère | Non implémenté avec un fournisseur adapté |
| Navigation GPS étape par étape | Non implémentée |
| Trafic et alertes en direct | Non implémentés |
| Cartes hors ligne | Non implémentées |
| Routage hors ligne | Non implémenté |
| Apple CarPlay | Non implémenté et bloqué par Apple/projet iOS |
| SEO technique et pages publiques | Fonctionnel et testé par build local |
| AdSense réel | Bloqué par consentement/CMP, slot approuvé, domaine et examen Google |
