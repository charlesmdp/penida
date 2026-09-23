# Connecter Penida à Cloudflare Pages

Le dépôt contient les sources, les images d’origine, les versions optimisées, les polices locales, les articles, les pages légales, les ressources IA et le site HTML généré dans `dist/`.

## 1. Importer le dépôt

1. Ouvrir le [tableau de bord Cloudflare](https://dash.cloudflare.com/).
2. Aller dans **Workers & Pages → Create application → Pages**.
3. Choisir **Import an existing Git repository** / **Connect to Git**.
4. Connecter le compte GitHub et autoriser Cloudflare à accéder au dépôt **charlesmdp/penida**. Si le dépôt manque, vérifier les dépôts autorisés dans l’intégration GitHub Cloudflare.
5. Sélectionner le dépôt, puis **Begin setup**.

## 2. Réglages du build

| Champ | Valeur |
| --- | --- |
| Project name | `penida` (ou un autre nom disponible) |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Laisser vide : racine du dépôt |

La version de Node est définie par `.node-version` : `22.22.3`. Cloudflare installe les dépendances npm avant le build. Ne pas utiliser `exit 0` ici : les pages et les images sont générées par le build.

Dans les variables d’environnement **Production**, ajouter :

| Variable | Valeur |
| --- | --- |
| `SITE_PUBLIC` | `1` |
| `SITE_ORIGIN` | `https://penida.io` |

`SITE_PUBLIC=1` est nécessaire pour retirer le noindex de la version de prévisualisation et générer un robots.txt ouvert. Dans **Preview**, utiliser `SITE_PUBLIC=0`. Les aperçus resteront accessibles par URL sauf si Cloudflare Access est configuré ; noindex bloque l’indexation, pas la consultation.

Aucun secret ni jeton Orka n’est nécessaire. Le widget possède déjà son identifiant public et charge le script officiel.

Cliquer sur **Save and Deploy**. Cloudflare fournit une adresse `*.pages.dev` permettant de contrôler le site avant de basculer le domaine.

## 3. Rattacher penida.io

1. Dans le projet Pages, ouvrir **Custom domains → Set up a domain**.
2. Ajouter **penida.io** et suivre l’assistant DNS.
3. Pour le domaine racine `penida.io`, le domaine doit être une zone du même compte Cloudflare et ses serveurs DNS doivent pointer vers Cloudflare. Si c’est déjà le cas, Cloudflare peut créer l’enregistrement nécessaire.
4. Si un changement de serveurs DNS est nécessaire, reprendre les enregistrements utiles, notamment ceux de l’email, avant la bascule.
5. Ajouter aussi **www.penida.io** si cette adresse est utilisée, puis créer une redirection permanente de `www` vers `https://penida.io` en conservant le chemin et la query string.

Ajouter le domaine dans Pages avant de modifier manuellement un CNAME. La configuration DNS active de penida.io n’a pas été modifiée par la préparation de ce dépôt.

## 4. Vérifier et continuer

Après activation du domaine et de son certificat :

- Ouvrir la page d’accueil, un article, les pages légales, `/ai`, `/llms`, `/llms.txt` et `/llms-full.txt`.
- Vérifier que `/robots.txt` autorise l’exploration et annonce `https://penida.io/sitemap.xml`.
- Vérifier l’ouverture du chat Orka.
- Soumettre `https://penida.io/sitemap.xml` dans Google Search Console.

Les futurs commits poussés sur `main` déclencheront automatiquement un nouveau déploiement de production via l’intégration GitHub.

## Sources officielles

- [Déployer un site HTML sur Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Intégration GitHub](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Versions de Node et environnement de build](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Domaines personnalisés](https://developers.cloudflare.com/pages/configuration/custom-domains/)

Documentation vérifiée le 23 septembre 2026.
