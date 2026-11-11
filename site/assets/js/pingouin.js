/* Pingouin Wave en 3D, construit en code (three.js). Aucun modèle externe.
 * creerPingouin(THREE) -> { racine, appliquer(etat), animer(t) }
 * L'état est un objet de nombres qu'on peut interpoler entre deux poses (voir POSES). */
import * as THREE from '../vendor/three.module.min.js';

const C = { nuit: 0x15155e, blanc: 0xffffff, orange: 0xff8c1a, ciel: 0x1cb3e8, vert: 0x2fd27a, vertClair: 0x5fe39a, coffre: 0x4b4ed6 };

function degrade() {
  // trois paliers de lumière : rendu « cartoon » proche du logo
  const d = new Uint8Array([90, 170, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
}

export const POSES = {
  // corps : bascule (couché sur le ventre = 1.45), aileG/aileD : écartement (0 = le long du corps), aileDAvant : aileron vers l'avant,
  // salut : amplitude du coucou, tete : inclinaison, teteLeve : relève la tête, saut : bond, dandine : marche, croise : bras croisés,
  // billets : nombre de billets sur la tête (0-8), qr : carte QR tenue, coffre : coffre visible
  debout:   { corps: 0, aileG: .18, aileD: .18, aileDAvant: 0, salut: 0, tete: 0, teteLeve: 0, saut: 0, dandine: 0, croise: 0, billets: 0, qr: 0, coffre: 0 },
  coucou:   { corps: 0, aileG: .2, aileD: 2.5, aileDAvant: 0, salut: 1, tete: .12, teteLeve: 0, saut: 0, dandine: 0, croise: 0, billets: 0, qr: 0, coffre: 0 },
  glisse:   { corps: 1.45, aileG: .22, aileD: .22, aileDAvant: 0, salut: 0, tete: 0, teteLeve: .95, saut: 0, dandine: 0, croise: 0, billets: 0, qr: 0, coffre: 0 },
  billets:  { corps: 0, aileG: .5, aileD: .5, aileDAvant: 0, salut: 0, tete: -.1, teteLeve: .15, saut: 0, dandine: 0, croise: 0, billets: 1, qr: 0, coffre: 0 },
  qr:       { corps: 0, aileG: .2, aileD: .5, aileDAvant: 1.1, salut: 0, tete: .1, teteLeve: 0, saut: 0, dandine: 0, croise: 0, billets: 0, qr: 1, coffre: 0 },
  joie:     { corps: 0, aileG: 2.4, aileD: 2.4, aileDAvant: 0, salut: .4, tete: 0, teteLeve: .25, saut: 1, dandine: 0, croise: 0, billets: 0, qr: 1, coffre: 0 },
  marche:   { corps: 0, aileG: .45, aileD: .45, aileDAvant: 0, salut: 0, tete: 0, teteLeve: 0, saut: 0, dandine: 1, croise: 0, billets: 0, qr: 0, coffre: 0 },
  gardien:  { corps: 0, aileG: .2, aileD: .95, aileDAvant: .25, salut: 0, tete: .12, teteLeve: -.05, saut: 0, dandine: 0, croise: 0, billets: 0, qr: 0, coffre: 1 },
};

export function creerPingouin() {
  const grad = degrade();
  const mat = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const M = { nuit: mat(C.nuit), blanc: mat(C.blanc), orange: mat(C.orange), ciel: mat(C.ciel), vert: mat(C.vert), vertClair: mat(C.vertClair), coffre: mat(C.coffre) };
  const boule = (m, sx, sy, sz, seg = 40) => { const g = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg * .75 | 0), m); g.scale.set(sx, sy, sz); g.castShadow = true; return g; };

  const racine = new THREE.Group();          // placée par la page (position, rotation, taille)
  const bond = new THREE.Group(); racine.add(bond);        // saut
  const dandine = new THREE.Group(); bond.add(dandine);    // balancement de la marche
  const posture = new THREE.Group(); dandine.add(posture); // bascule sur le ventre (pivot au centre du corps)
  posture.position.y = 1;
  const corpsG = new THREE.Group(); corpsG.position.y = -1; posture.add(corpsG);

  // corps et ventre
  const corps = boule(M.nuit, .78, 1.02, .72); corps.position.y = 1.0; corpsG.add(corps);
  const ventre = boule(M.blanc, .6, .82, .5); ventre.position.set(0, .92, .27); corpsG.add(ventre);
  // écharpe bleue Wave
  const echarpe = new THREE.Mesh(new THREE.TorusGeometry(.56, .1, 16, 48), M.ciel); echarpe.rotation.x = Math.PI / 2; echarpe.position.y = 1.5; echarpe.scale.set(1, 1.04, 1); corpsG.add(echarpe);
  const pan = boule(M.ciel, .13, .3, .07); pan.position.set(.3, 1.28, .5); pan.rotation.z = .35; corpsG.add(pan);

  // tête
  const tete = new THREE.Group(); tete.position.y = 1.55; corpsG.add(tete);
  const crane = boule(M.nuit, .55, .52, .52); crane.position.y = .38; tete.add(crane);
  const visage = boule(M.blanc, .4, .32, .22); visage.position.set(0, .34, .36); tete.add(visage);
  const yeux = [];
  for (const s of [-1, 1]) {
    const oeil = boule(M.blanc, .135, .15, .1, 24); oeil.position.set(s * .17, .46, .49); tete.add(oeil);
    const pupille = boule(M.nuit, .07, .085, .05, 20); pupille.position.set(s * .17 + s * .01, .45, .575); tete.add(pupille);
    const reflet = boule(M.blanc, .022, .022, .02, 10); reflet.position.set(s * .17 + .03, .49, .615); tete.add(reflet);
    yeux.push(pupille);
  }
  const bec = new THREE.Mesh(new THREE.ConeGeometry(.11, .26, 24), M.orange); bec.rotation.x = Math.PI / 2; bec.position.set(0, .29, .66); bec.scale.set(1.25, 1, .8); tete.add(bec);

  // ailerons (pivot à l'épaule)
  const ailes = [-1, 1].map(s => {
    const pivot = new THREE.Group(); pivot.position.set(s * .7, 1.32, 0); corpsG.add(pivot);
    const a = boule(M.nuit, .14, .58, .32); a.position.set(s * .04, -.48, 0); a.rotation.z = s * .08; pivot.add(a);
    return pivot;
  });
  // carte QR tenue par l'aileron droit
  const carte = new THREE.Group(); carte.position.set(.12, -.95, .2); ailes[1].add(carte);
  const cadre = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .04), M.ciel); carte.add(cadre);
  const fondQr = new THREE.Mesh(new THREE.BoxGeometry(.36, .36, .05), M.blanc); carte.add(fondQr);
  for (const [x, y] of [[-.11, .11], [.11, .11], [-.11, -.11], [.03, -.02], [.1, -.1], [-.02, .05]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .06), M.nuit); p.position.set(x, y, 0); carte.add(p);
  }

  // pieds
  const pieds = [-1, 1].map(s => { const p = boule(M.orange, .22, .08, .32, 24); p.position.set(s * .28, .06, .26); corpsG.add(p); return p; });

  // pile de billets sur la tête
  const pile = new THREE.Group(); pile.position.set(0, .92, -.02); tete.add(pile);
  const billets = Array.from({ length: 8 }, (_, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(.72, .07, .4), i % 2 ? M.vert : M.vertClair);
    b.position.y = i * .08; b.rotation.y = (i * 0.37) % .5 - .25; b.castShadow = true; pile.add(b); return b;
  });

  // coffre (posé devant, pour la sécurité)
  const coffre = new THREE.Group(); coffre.position.set(1.25, .45, .45); coffre.rotation.y = -.45; racine.add(coffre);
  const boite = new THREE.Mesh(new THREE.BoxGeometry(1.1, .9, .7), M.coffre); coffre.add(boite);
  const porte = new THREE.Mesh(new THREE.BoxGeometry(.8, .62, .06), M.ciel); porte.position.z = .36; coffre.add(porte);
  const roue = new THREE.Mesh(new THREE.TorusGeometry(.15, .045, 12, 32), M.blanc); roue.position.z = .41; coffre.add(roue);

  // ombre douce
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(.9, 40), new THREE.MeshBasicMaterial({ color: 0x0b0b40, transparent: true, opacity: .18, depthWrite: false }));
  ombre.rotation.x = -Math.PI / 2; ombre.position.y = .005; racine.add(ombre);

  let E = { ...POSES.debout };
  const appliquer = e => { E = e; };

  function animer(t) {
    const s = E;
    posture.rotation.x = s.corps;
    // tête : relevée quand on glisse, sinon petite respiration
    tete.rotation.x = -s.teteLeve * 1.0 + Math.sin(t * 1.3) * .03;
    tete.rotation.z = s.tete + Math.sin(t * .9) * .03;
    // ailerons
    const coucou = s.salut * Math.sin(t * 9) * .35;
    ailes[0].rotation.z = -s.aileG - s.croise * -.35;
    ailes[1].rotation.z = s.aileD + coucou + s.croise * -.35;
    ailes[0].rotation.x = -s.croise * 1.25 - s.corps * .25;
    ailes[1].rotation.x = -s.aileDAvant - s.croise * 1.25 - s.corps * .25;
    ailes[0].rotation.y = s.croise * .5; ailes[1].rotation.y = -s.croise * .5;
    // saut et marche
    bond.position.y = s.saut * Math.abs(Math.sin(t * 4.2)) * .45;
    dandine.rotation.z = s.dandine * Math.sin(t * 7) * .14;
    pieds[0].position.z = .26 + s.dandine * Math.sin(t * 7) * .12;
    pieds[1].position.z = .26 - s.dandine * Math.sin(t * 7) * .12;
    // respiration
    corps.scale.y = 1.02 + Math.sin(t * 1.6) * .012 * (1 - s.corps / 1.45);
    // accessoires
    const n = Math.round(s.billets * 8);
    billets.forEach((b, i) => { b.visible = i < n; });
    pile.visible = n > 0;
    carte.visible = s.qr > .5; carte.scale.setScalar(Math.max(.001, (s.qr - .5) * 2) * 1.35); carte.rotation.set(s.aileDAvant * .9, -.5 * s.aileDAvant, -s.aileD);
    coffre.visible = s.coffre > .05; coffre.scale.setScalar(Math.max(.001, s.coffre) * .85); roue.rotation.z = t * .6;
    ombre.material.opacity = .18 * (1 - s.saut * .5 * Math.abs(Math.sin(t * 4.2)));
    ombre.scale.set(1 + s.corps * .2, 1 + s.corps * .5, 1);
    // les pupilles regardent un peu de côté de temps en temps
    const regard = Math.sin(t * .7) > .85 ? .02 : 0; yeux.forEach(p => { p.position.x += (Math.sign(p.position.x) * .18 + regard - p.position.x) * .1; });
  }

  return { racine, appliquer, animer };
}

export const melanger = (a, b, k) => { const o = {}; for (const c in a) o[c] = a[c] + (b[c] - a[c]) * k; return o; };
