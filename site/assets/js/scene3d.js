/* Le pingouin descend toute la page.
 * Chaque emplacement [data-pingouin="pose"] de la page est un arrêt : le pingouin s'y pose (taille = hauteur de l'emplacement),
 * et entre deux arrêts il glisse sur le ventre. Le calque est fixe, derrière le texte. */
import * as THREE from '../vendor/three.module.min.js';
import { creerPingouin, POSES, melanger } from './pingouin.js';

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toile = document.getElementById('calque3d');
let rendu;
try { rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true }); } catch (e) { toile.remove(); }

if (rendu) {
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000); cam.position.z = 2000;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9fdcff, 1.6));
  const soleil = new THREE.DirectionalLight(0xffffff, 2.2); soleil.position.set(3, 6, 5); scene.add(soleil);
  const P = creerPingouin(); scene.add(P.racine);
  P.racine.rotation.x = .12; // on le voit un peu d'en haut

  const HAUT = 2.5; // hauteur du modèle debout
  const places = [...document.querySelectorAll('[data-pingouin]')];
  let ancres = [];

  function taille() {
    rendu.setSize(innerWidth, innerHeight, false);
    cam.right = innerWidth; cam.bottom = -innerHeight; cam.updateProjectionMatrix();
    calculerAncres();
  }
  // position de défilement où chaque arrêt est « atteint »
  function calculerAncres() {
    const max = document.documentElement.scrollHeight - innerHeight;
    let avant = -1;
    ancres = places.map(el => {
      const k = el.dataset.k, sec = el.closest('section');
      let a;
      if (k !== undefined && sec) { const top = sec.getBoundingClientRect().top + scrollY; a = top + (+k) * (sec.offsetHeight - innerHeight); }
      else { const r = el.getBoundingClientRect(); a = r.top + scrollY + r.height / 2 - innerHeight / 2; }
      a = Math.min(max, Math.max(0, a));
      if (a <= avant) a = avant + 1;
      avant = a; return a;
    });
  }
  addEventListener('resize', taille); addEventListener('load', calculerAncres);
  new ResizeObserver(calculerAncres).observe(document.body);
  taille();

  const lisse = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  function etatArret(el) {
    const W = window.waveEtat || {};
    let nom = el.dataset.pingouin, e = { ...POSES[nom] };
    if (nom === 'billets') e.billets = clamp(Math.sqrt((W.montant || 25000) / 300000), .125, 1);
    if (nom === 'qr' && W.pasPayer === 2) e = { ...POSES.joie };
    if (nom === 'marche' && Math.abs(+el.dataset.ry) < .5) e = { ...POSES.debout };
    return e;
  }
  const point = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom, h: r.height, ry: +(el.dataset.ry || 0) }; };

  let pose = { ...POSES.coucou };
  function image(ms) {
    const t = calme ? .4 : ms / 1000, Y = scrollY;
    let i = 0; while (i < ancres.length - 1 && Y >= ancres[i + 1]) i++;
    const A = places[i], B = places[Math.min(i + 1, places.length - 1)];
    let k = A === B ? 0 : (Y - ancres[i]) / (ancres[i + 1] - ancres[i]);
    const h0 = A.dataset.tenir !== undefined ? +A.dataset.tenir : .2, h1 = B.dataset.tenir !== undefined ? +B.dataset.tenir : .2;
    let u = clamp((k - h0) / Math.max(.001, 1 - h0 - h1));
    if (calme) u = u < .5 ? 0 : 1;
    const e = lisse(u), pa = point(A), pb = point(B);
    const x = pa.x + (pb.x - pa.x) * e, y = pa.y + (pb.y - pa.y) * e, h = pa.h + (pb.h - pa.h) * e;
    // pose : on part de l'arrêt A, on se couche pour glisser, on se relève à l'arrêt B
    const sa = etatArret(A), sb = etatArret(B), g = POSES.glisse;
    const dir = Math.abs(pb.x - pa.x) > 20 ? Math.sign(pb.x - pa.x) * 1.35 : 1.35;
    let cible, ry;
    if (u <= 0) { cible = sa; ry = pa.ry; }
    else if (u >= 1) { cible = sb; ry = pb.ry; }
    else if (u < .22) { const q = lisse(u / .22); cible = melanger(sa, g, q); ry = pa.ry + (dir - pa.ry) * q; }
    else if (u > .78) { const q = lisse((u - .78) / .22); cible = melanger(g, sb, q); ry = dir + (pb.ry - dir) * q; }
    else { cible = g; ry = dir; }
    pose = calme ? cible : melanger(pose, cible, .16);
    P.appliquer(pose);
    const s = h / HAUT;
    P.racine.position.set(x, -y, 0);
    P.racine.scale.setScalar(s);
    P.racine.rotation.y += ((ry + (u > 0 && u < 1 ? Math.sin(t * 3) * .05 : 0)) - P.racine.rotation.y) * (calme ? 1 : .18);
    P.racine.visible = h > 4;
    P.animer(t);
    rendu.render(scene, cam);
    if (!calme) requestAnimationFrame(image);
  }
  if (calme) { const un = () => requestAnimationFrame(image); addEventListener('scroll', un, { passive: true }); addEventListener('resize', un); addEventListener('input', un); un(); }
  else requestAnimationFrame(image);
}
