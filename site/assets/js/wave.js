/* WAVE — concept « Ça glisse » (non officiel).
 * Pays : ?pays=sn|ci (gardé dans le navigateur). Langue : ?lang=fr|en.
 * Tarifs repris de wave.com : dépôt et retrait gratuits, factures sans frais, transfert 1 %. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const memo = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const F = n => Math.round(n).toLocaleString('fr-FR').replace(/\s/g, ' ') + ' F';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- pays ---------- */
  const PAYS = {
    sn: {
      kicker: { fr: 'Wave · Sénégal', en: 'Wave · Senegal' },
      A: 'Awa · Dakar', B: { fr: 'Maman · Thiès', en: 'Mum · Thiès' },
      factures: ['Senelec', 'Woyofal'],
      g3p: { fr: "Électricité Senelec, crédit Woyofal : tu paies depuis ton téléphone, sans faire la queue et sans frais.", en: 'Senelec electricity, Woyofal credit: pay from your phone, no queue and no fees.' },
      marchand: 'Dibiterie Chez Fatou',
      agents: { fr: "Pour déposer ou retirer, tu vas chez un agent Wave. À Dakar, ils sont partout : au marché, à l'arrêt de bus, à côté de la boutique.", en: 'To deposit or withdraw, you go to a Wave agent. In Dakar they are everywhere: at the market, at the bus stop, next to the corner shop.' },
      liste: [['Envoi à Maman', 'Sent to Mum', -10100, 0], ['Woyofal', 'Woyofal', -5000, 1], ['Dépôt', 'Deposit', 50000, 3]],
      ios: 'sn', carte: 'dakar',
    },
    ci: {
      kicker: { fr: "Wave · Côte d'Ivoire", en: "Wave · Côte d'Ivoire" },
      A: 'Koffi · Abidjan', B: { fr: 'Maman · Bouaké', en: 'Mum · Bouaké' },
      factures: ['CIE', 'SODECI'],
      g3p: { fr: "Électricité CIE, eau SODECI : tu paies depuis ton téléphone, sans faire la queue et sans frais.", en: 'CIE electricity, SODECI water: pay from your phone, no queue and no fees.' },
      marchand: 'Garba Chez Ange',
      agents: { fr: "Pour déposer ou retirer, tu vas chez un agent Wave. À Abidjan, ils sont partout : au marché, au terminus du gbaka, à côté de la boutique.", en: 'To deposit or withdraw, you go to a Wave agent. In Abidjan they are everywhere: at the market, at the gbaka terminus, next to the corner shop.' },
      liste: [['Envoi à Maman', 'Sent to Mum', -10100, 0], ['Facture CIE', 'CIE bill', -18500, 1], ['Dépôt', 'Deposit', 50000, 3]],
      ios: 'ci', carte: 'abidjan',
    },
  };

  /* ---------- textes anglais (le français est dans le HTML) ---------- */
  const EN = {
    saut: 'Skip to content', nav1: 'Send', nav2: 'Free', nav3: 'Pay', nav4: 'Agents', nav5: 'Security', cta: 'Download',
    h1: 'It just glides.', hsous: 'Your mobile money ally. Deposit and withdraw for free, pay your bills with no fees, send money for <b>1%</b>.',
    play1: 'Get it on', ios1: 'Download on', defile: 'Scroll',
    'c-etiq': 'Send money', 'c-titre': 'How much are you sending?', 'c-chapo': 'Slide the cursor. The fee shows right away: 1%, nothing hidden.',
    'c-label': 'Amount sent', 'c-frais': 'Wave fee (1%)', 'c-recu': 'Your loved one receives', 'c-total': 'Taken from your account',
    'c-retrait': 'And when they withdraw: <b>0 F</b>.', 'c-note': "Indicative calculation at 1%, the rate shown by Wave. The exact amount is shown in the app before you confirm.",
    'g-etiq': 'No fees', g1t: 'Deposit', g1p: 'Go to an agent, hand over your cash, it lands in your account. Free.',
    g2t: 'Withdraw', g2p: 'Your loved one withdraws at the local agent. What you sent, they get in full.', g3t: 'Pay your bills',
    'p-etiq': 'Pay at a shop', 'p-titre': 'You scan.<br>It’s paid.', p1: 'The shop shows its Wave QR code.', p2: 'You scan it with the app.', p3: 'Type the amount. Paid.',
    'p-credit': 'And your phone credit, any network, takes two seconds.', 'p-biz': 'Own a shop? Wave Business →', 'p-ex': 'Example',
    'a-etiq': 'Agents', 'a-titre': 'There’s one around the corner.', 'a-note': 'Illustrative map and points, for the mock-up.',
    's-etiq': 'Security', 's-titre': 'Your money is well looked after.',
    s1t: 'One number, free', s1p: 'A problem? One single, free contact number, shown in the app.',
    s2t: 'International-grade security', s2p: 'A security system built to international standards protects your account.',
    s3t: 'Your PIN is yours', s3p: 'Never give your secret code to anyone, even someone claiming to call from Wave.',
    'v-titre': 'They already use it.', v1: '“I top up my Woyofal with Wave. It’s simple, easy and efficient, you can do everything without going anywhere.”',
    v2: '“Now I only use Wave to send money to my family.”', 'v-note': 'Testimonials taken from wave.com.',
    'f-titre': 'It just glides.', 'f-chapo': 'Download the app. The rest glides on its own.',
    pied: 'Unofficial project. Rates taken from wave.com, indicative calculations. Wave is a trademark of Wave Mobile Money Inc.',
  };
  const ARIA_EN = { pays: 'Country', langue: 'Language', burger: 'Open menu', 'c-puces': 'Quick amounts' };
  const MOTS = { fr: ['Envoyé', 'Solde', '+10 000 F reçus', 'Agent le plus proche : 3 min à pied', 'Aujourd’hui', 'Hier', 'il y a 3 jours'],
                 en: ['Sent', 'Balance', '+10,000 F received', 'Nearest agent: 3 min walk', 'Today', 'Yesterday', '3 days ago'] };
  const LEG = { fr: ['Tu envoies 10 000 F à ta mère.', 'Ça glisse…', "Reçu. Frais : 100 F. C'est tout."], en: ['You send 10,000 F to your mum.', 'It glides…', 'Received. Fee: 100 F. That’s it.'] };

  const qs = new URLSearchParams(location.search);
  let pays = PAYS[qs.get('pays')] ? qs.get('pays') : (PAYS[memo.get('wave-pays')] ? memo.get('wave-pays') : 'sn');
  let lang = ['fr', 'en'].includes(qs.get('lang')) ? qs.get('lang') : (memo.get('wave-lang') === 'en' ? 'en' : 'fr');
  const FR = {}; $$('[data-i]').forEach(el => { FR[el.dataset.i] = el.innerHTML; });
  const ARIA_FR = {}; $$('[data-i-aria]').forEach(el => { ARIA_FR[el.dataset.iAria] = el.getAttribute('aria-label'); });
  const L = o => typeof o === 'string' ? o : o[lang];

  function appliquer() {
    const P = PAYS[pays];
    document.documentElement.lang = lang;
    $$('[data-i]').forEach(el => { const k = el.dataset.i; el.innerHTML = lang === 'en' && EN[k] ? EN[k] : FR[k]; });
    $$('[data-i-aria]').forEach(el => { const k = el.dataset.iAria; el.setAttribute('aria-label', lang === 'en' ? ARIA_EN[k] : ARIA_FR[k]); });
    $$('[data-pays]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pays === pays));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    $('#h-kicker').textContent = L(P.kicker);
    $('#f1').textContent = P.factures[0]; $('#f2').textContent = P.factures[1];
    $('#g3p').textContent = L(P.g3p);
    $('#p-marchand').textContent = P.marchand;
    $('#a-chapo').textContent = L(P.agents);
    $('#carte-bulle').textContent = MOTS[lang][3];
    $$('.js-store-ios').forEach(a => a.href = `https://apps.apple.com/${P.ios}/app/wave-mobile-money/id1523884528`);
    $$('.scene-g').forEach(s => s.dataset.motAct = lang === 'en' ? s.dataset.motEn : s.dataset.mot);
    const actif = $('.scene-g.on') || $('.scene-g'); $('#g-mot').textContent = actif.dataset.motAct;
    listePaiements(); carte(); calcul();
    document.title = lang === 'en' ? 'Wave — It just glides.' : 'Wave — Ça glisse.';
  }
  $$('[data-pays]').forEach(b => b.addEventListener('click', () => { pays = b.dataset.pays; memo.set('wave-pays', pays); appliquer(); }));
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; memo.set('wave-lang', lang); appliquer(); }));

  /* ---------- menu mobile ---------- */
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); menu.classList.toggle('ouvert', o); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); menu.classList.remove('ouvert'); }));

  /* ---------- calculateur ---------- */
  window.waveEtat = { montant: 25000, pasPayer: 0 };
  const curseur = $('#c-montant');
  function calcul() {
    const m = +curseur.value, frais = Math.round(m * 0.01); window.waveEtat.montant = m;
    $('#c-sortie').textContent = F(m); $('#c-frais').textContent = F(frais); $('#c-recu').textContent = F(m); $('#c-total').textContent = F(m + frais);
    curseur.style.setProperty('--p', ((m - curseur.min) / (curseur.max - curseur.min) * 100) + '%');
    curseur.setAttribute('aria-valuetext', F(m));
    $$('.calc__puces button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.m === m));
  }
  curseur.addEventListener('input', calcul);
  $$('.calc__puces button').forEach(b => b.addEventListener('click', () => {
    const de = +curseur.value, a = +b.dataset.m;
    if (calme) { curseur.value = a; return calcul(); }
    const t0 = performance.now(), f = t => { const q = clamp((t - t0) / 450), e = 1 - Math.pow(1 - q, 3); curseur.value = Math.round((de + (a - de) * e) / 500) * 500; calcul(); if (q < 1) requestAnimationFrame(f); }; requestAnimationFrame(f);
  }));

  /* ---------- gratuit : le mot change avec la scène ---------- */
  const mot = $('#g-mot');
  const obsG = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.scene-g').forEach(s => s.classList.toggle('on', s === e.target));
    if (mot.textContent === e.target.dataset.motAct) return;
    mot.classList.add('change'); setTimeout(() => { mot.textContent = e.target.dataset.motAct; mot.classList.remove('change'); }, 220);
  }), { rootMargin: '-45% 0px -45% 0px' });
  $$('.scene-g').forEach(s => obsG.observe(s));

  /* ---------- payer : QR, balayage, paiement ---------- */
  (function qr() {
    // QR décoratif : trois repères et un motif pseudo-aléatoire stable
    let s = 7, h = '';
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const repere = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#12125c"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#12125c"/>`;
    for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
      const dansRepere = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
      if (!dansRepere && rnd() > .52) h += `<rect x="${x}" y="${y}" width="1" height="1" fill="#12125c"/>`;
    }
    $('#qr').innerHTML = h + repere(0, 0) + repere(22, 0) + repere(0, 22);
  })();
  function listePaiements() {
    const P = PAYS[pays], m = MOTS[lang];
    $('#p-liste').innerHTML = P.liste.map(([fr, en, v, j]) => `<li><span>${lang === 'en' ? en : fr}<small>${m[j === 0 ? 4 : j === 1 ? 5 : 6]}</small></span><span>${v > 0 ? '+' : '−'}${F(Math.abs(v))}</span></li>`).join('');
    const d = new Date(); $('#p-heure').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  const payer = $('#payer');
  function paiement() {
    const r = payer.getBoundingClientRect(), p = calme ? 1 : clamp((-r.top) / Math.max(1, payer.offsetHeight - innerHeight));
    const pas = p < .3 ? 0 : p < .62 ? 1 : 2;
    window.waveEtat.pasPayer = pas;
    payer.classList.toggle('pas1', pas === 1); payer.classList.toggle('pas2', pas === 2);
    $$('.payer__etapes li').forEach(li => li.classList.toggle('on', +li.dataset.pas <= pas));
  }

  /* ---------- carte des agents (points illustratifs) ---------- */
  const CARTES = {
    dakar: {
      fond: '<rect width="400" height="320" class="eau"/>',
      terre: 'M400 52 L262 62 C210 66 168 84 128 104 C88 122 54 136 38 158 C42 176 70 182 96 176 C122 172 132 194 150 214 C166 230 186 246 202 258 C216 246 232 226 262 220 C302 214 342 224 400 234 Z',
      quartiers: [['Plateau', 200, 240], ['Médina', 178, 206], ['Fann', 138, 186], ['Mermoz', 124, 152], ['Ouakam', 70, 160], ['Yoff', 160, 106], ['Parcelles', 236, 112], ['Guédiawaye', 318, 86], ['Pikine', 318, 176]],
      toi: [250, 200],
    },
    abidjan: {
      fond: '<rect width="400" height="320" class="terre"/><path d="M0 286 C120 276 280 296 400 282 V320 H0 Z" class="eau"/>',
      lagune: 'M-10 176 C70 146 130 214 206 178 C252 156 290 206 330 186 C360 172 380 168 410 180',
      quartiers: [['Yopougon', 62, 112], ['Abobo', 226, 44], ['Adjamé', 186, 100], ['Plateau', 206, 148], ['Cocody', 318, 120], ['Treichville', 192, 226], ['Marcory', 268, 234], ['Koumassi', 342, 236], ['Port-Bouët', 232, 270]],
      toi: [300, 262],
    },
  };
  let carteVue = false, trajet = null;
  function carte() {
    const C = CARTES[PAYS[pays].carte], svg = $('#carte-svg');
    let h = C.fond;
    if (C.terre) h += `<path d="${C.terre}" class="terre" id="c-terre"/>`;
    if (C.lagune) h += `<path d="${C.lagune}" fill="none" stroke="#a6e5fb" stroke-width="34" stroke-linecap="round" id="c-lagune"/>`;
    h += C.quartiers.map(([n, x, y]) => `<text x="${x}" y="${y}" class="quartier">${n}</text>`).join('');
    svg.innerHTML = h;
    // agents : points pseudo-aléatoires gardés sur la terre ferme
    let s = pays === 'sn' ? 11 : 23; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const terre = $('#c-terre'), lagune = $('#c-lagune'), pts = [];
    for (let i = 0; pts.length < 46 && i < 2000; i++) {
      const x = 12 + rnd() * 376, y = 12 + rnd() * 296, P = new DOMPoint(x, y);
      if (terre && !terre.isPointInFill(P)) continue;
      if (lagune && (lagune.isPointInStroke(P) || y > 272)) continue;
      if (C.quartiers.some(([, qx, qy]) => Math.abs(qx - x) < 30 && Math.abs(qy - 4 - y) < 9)) continue;
      pts.push([x, y]);
    }
    const [tx, ty] = C.toi;
    let proche = 0, dmin = 1e9; pts.forEach(([x, y], i) => { const d = Math.hypot(x - tx, y - ty); if (d > 14 && d < dmin) { dmin = d; proche = i; } });
    const [px, py] = pts[proche]; trajet = [tx, ty, px, py];
    let g = `<path class="chemin" d="M${tx} ${ty} Q ${(tx + px) / 2} ${Math.min(ty, py) - 14} ${px} ${py}"/>`;
    g += pts.map(([x, y], i) => `<circle class="agent${i === proche ? ' agent--proche' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === proche ? 7 : 5}" style="transition-delay:${(i * 18)}ms"/>`).join('');
    g += `<circle class="toi-halo" cx="${tx}" cy="${ty}" r="10"/><circle class="toi" cx="${tx}" cy="${ty}" r="7" stroke="#fff" stroke-width="3"/>`;
    svg.insertAdjacentHTML('beforeend', g);
    agentMarche();
    if (carteVue) { const f = $('#carte'); f.classList.remove('on'); requestAnimationFrame(() => requestAnimationFrame(() => f.classList.add('on'))); }
  }
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { carteVue = true; e.target.classList.add('on'); } }), { threshold: .35 }).observe($('#carte'));

  // le repère du pingouin marche de « toi » vers l'agent le plus proche pendant qu'on fait défiler la section
  function agentMarche() {
    if (!trajet) return;
    const fig = $('#carte'), svg = $('#carte-svg'), pl = $('#p-agents');
    const rf = fig.getBoundingClientRect(), rs = svg.getBoundingClientRect();
    const k = calme ? 1 : clamp((innerHeight * .75 - rf.top) / (rf.height * 1.1));
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const [tx, ty, px, py] = trajet, x = tx + (px - tx) * e, y = ty + (py - ty) * e;
    pl.style.left = (rs.left - rf.left + x / 400 * rs.width) + 'px';
    pl.style.top = (rs.top - rf.top + y / 320 * rs.height) + 'px';
    pl.dataset.ry = (px > tx ? 1 : -1) * (k < 1 ? 1.1 : .4);
  }

  /* ---------- boucle de défilement ---------- */
  let att = false;
  const tick = () => { att = false; paiement(); agentMarche(); };
  addEventListener('scroll', () => { if (!att) { att = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', tick);

  appliquer(); paiement(); agentMarche();
  addEventListener('load', agentMarche);
})();
