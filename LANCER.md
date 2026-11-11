# Wave — concept « Ça glisse » — lancer en local

## Lancer

Ouvrir un terminal (PowerShell) et copier :

```powershell
cd "C:\Users\DELL02\Desktop\Personal Builds\Wave"
python -m http.server 8100 --bind 127.0.0.1 --directory site
```

Puis ouvrir : **http://127.0.0.1:8100/**

Arrêter : `Ctrl + C` dans le terminal.

### Adresses utiles

| Page | Adresse |
|---|---|
| Sénégal, français | http://127.0.0.1:8100/?pays=sn&lang=fr |
| Côte d'Ivoire, français | http://127.0.0.1:8100/?pays=ci&lang=fr |
| Côte d'Ivoire, anglais | http://127.0.0.1:8100/?pays=ci&lang=en |

Le site retient le pays et la langue choisis (navigation privée pour repartir de zéro). On peut aussi changer avec les boutons SN / CI et FR / EN en haut.

## Voir le site sur le téléphone (même Wi-Fi)

```powershell
cd "C:\Users\DELL02\Desktop\Personal Builds\Wave"
python -m http.server 8100 --bind 0.0.0.0 --directory site
```

Puis ouvrir sur le téléphone : **http://192.168.11.104:8100/?pays=ci&lang=fr**

Si l'adresse a changé, la retrouver avec `ipconfig` (ligne « Adresse IPv4 » du Wi-Fi). Si Windows demande l'autorisation du pare-feu pour Python, accepter pour les réseaux privés.
Pour lancer Orange, Yango et Wave d'un coup, voir `Website critics/TELEPHONE.md`.

## Ce que fait la page

**Le fil conducteur : un pingouin en 3D qui descend toute la page en glissant sur le ventre** (dans l'esprit de la vidéo de l'abeille). Il s'arrête à chaque section et change de pose :

| Section | Pose |
|---|---|
| Haut de page | coucou, devant le mot géant « wave » |
| Calculateur | une pile de billets sur la tête, qui grandit avec le montant |
| 0 F | il glisse derrière le « 0 », comme à travers un anneau |
| Payer | il tient le QR, puis saute de joie quand « Payé ✓ » s'affiche |
| Agents | petit, il marche sur la carte jusqu'à l'agent le plus proche |
| Sécurité | gardien, l'aileron sur un coffre |
| Avis | il passe la tête derrière une carte |
| Fin | coucou au-dessus de « Ça glisse. » |

Le reste de la page : calculateur des frais à 1 %, les trois scènes « 0 F » (déposer, retirer, factures Senelec et Woyofal ou CIE et SODECI), le paiement par QR (marchand d'exemple), la carte des agents (points **illustratifs**), la sécurité, les avis d'Aïta et Firmin (repris de wave.com) et les liens des boutiques d'applis (App Store du pays choisi).

**Technique :**
- Le pingouin est construit en code (`site/assets/js/pingouin.js`, three.js en copie locale dans `site/assets/vendor/`) : aucun modèle 3D ni image externe.
- `site/assets/js/scene3d.js` le place : chaque emplacement `data-pingouin="pose"` de la page est un arrêt, et il glisse de l'un à l'autre. Pour déplacer un arrêt, il suffit de déplacer ou redimensionner son emplacement dans le HTML ou le CSS.
- Il est dessiné sur un calque fixe, derrière le texte, qui reste donc toujours lisible.
- Avec « réduire les animations » activé, il ne glisse pas : il passe d'une pose à l'autre.
- Page de test des poses : http://127.0.0.1:8100/essai-pingouin.html?pose=coucou (poses : coucou, glisse, billets, qr, joie, marche, gardien, debout). Aperçu : `references/apercu-pingouin.png`.

## Sources et limites

- **Tarifs :** wave.com/fr (dépôt et retrait gratuits, factures sans frais, transferts à 1 %), relevés le 10 novembre 2026.
- **Hypothèse à vérifier :** les 1 % sont payés par l'expéditeur, et le proche reçoit le montant entier. C'est ce que montre le calculateur.
- **Factures :** Senelec et Woyofal (Sénégal), CIE et SODECI (Côte d'Ivoire), d'après des articles de presse. À confirmer dans l'appli.
- **Numéro d'assistance :** volontairement non affiché, faute de source officielle.
- **Inventé pour la maquette :** les prénoms, les soldes, les marchands (« Exemple »), les points d'agents et le QR (décoratif, il ne mène nulle part).
- Une seule mention « Projet non officiel », en bas de page.
