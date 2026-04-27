import { createLayout, utils, stagger, spring, createTimer, createAnimatable } from 'https://esm.sh/animejs@4.3.0';

// --- HOLOGRAPHIC LOGO ANIMATION ---
anime({ targets: '.ring-1', rotateX: [0, 360], rotateY: [0, 360], rotateZ: [0, 360], duration: 8000, loop: true, easing: 'linear' });
anime({ targets: '.ring-2', rotateX: [0, 360], rotateY: [120, 480], rotateZ: [0, 360], duration: 10000, loop: true, easing: 'linear' });
anime({ targets: '.ring-3', rotateX: [0, 360], rotateY: [240, 600], rotateZ: [0, 360], duration: 12000, loop: true, easing: 'linear' });
anime({ targets: '.logo-core', scale: [1, 1.5], opacity: [1, 0.7], duration: 1500, direction: 'alternate', loop: true, easing: 'easeInOutSine' });

// --- DATA ---
const ELEMENT_FIELDS = { SYMBOL: 0, NAME: 1, COLOR: 2, COLUMN: 3, ROW: 4, ATOMIC_MASS: 5, DENSITY: 6, MELTING_POINT: 7, BOILING_POINT: 8 };
const ELEMENT_STRIDE = 9;

const elements = [
  'H', 'Hydrogen', 0, 1, 1, 1.008, 0.08988, -259.16, -252.88,
  'He', 'Helium', 1, 18, 1, 4.0026022, 0.1786, -272.2, -268.93,
  'Li', 'Lithium', 2, 1, 2, 6.94, 0.534, 180.5, 1329.85,
  'Be', 'Beryllium', 3, 2, 2, 9.01218315, 1.85, 1286.85, 2468.85,
  'B', 'Boron', 4, 13, 2, 10.81, 2.08, 2075.85, 3926.85,
  'C', 'Carbon', 0, 14, 2, 12.011, 1.821, null, null,
  'N', 'Nitrogen', 0, 15, 2, 14.007, 1.251, -210, -195.79,
  'O', 'Oxygen', 0, 16, 2, 15.999, 1.429, -218.79, -182.96,
  'F', 'Fluorine', 0, 17, 2, 18.9984031636, 1.696, -219.67, -188.12,
  'Ne', 'Neon', 1, 18, 2, 20.17976, 0.9002, -248.59, -246.05,
  'Na', 'Sodium', 2, 1, 3, 22.989769282, 0.968, 97.79, 882.94,
  'Mg', 'Magnesium', 3, 2, 3, 24.305, 1.738, 649.85, 1089.85,
  'Al', 'Aluminium', 5, 13, 3, 26.98153857, 2.7, 660.32, 2469.85,
  'Si', 'Silicon', 4, 14, 3, 28.085, 2.329, 1413.85, 3264.85,
  'P', 'Phosphorus', 0, 15, 3, 30.9737619985, 1.823, null, null,
  'S', 'Sulfur', 0, 16, 3, 32.06, 2.07, 115.21, 444.65,
  'Cl', 'Chlorine', 0, 17, 3, 35.45, 3.2, -101.55, -34.04,
  'Ar', 'Argon', 1, 18, 3, 39.9481, 1.784, -189.34, -185.85,
  'K', 'Potassium', 2, 1, 4, 39.09831, 0.862, 63.55, 758.85,
  'Ca', 'Calcium', 3, 2, 4, 40.0784, 1.55, 841.85, 1483.85,
  'Sc', 'Scandium', 6, 3, 4, 44.9559085, 2.985, 1540.85, 2835.85,
  'Ti', 'Titanium', 6, 4, 4, 47.8671, 4.506, 1667.85, 3286.85,
  'V', 'Vanadium', 6, 5, 4, 50.94151, 6, 1909.85, 3406.85,
  'Cr', 'Chromium', 6, 6, 4, 51.99616, 7.19, 1906.85, 2670.85,
  'Mn', 'Manganese', 6, 7, 4, 54.9380443, 7.21, 1245.85, 2060.85,
  'Fe', 'Iron', 6, 8, 4, 55.8452, 7.874, 1537.85, 2860.85,
  'Co', 'Cobalt', 6, 9, 4, 58.9331944, 8.9, 1494.85, 2926.85,
  'Ni', 'Nickel', 6, 10, 4, 58.69344, 8.908, 1454.85, 2729.85,
  'Cu', 'Copper', 6, 11, 4, 63.5463, 8.96, 1084.62, 2561.85,
  'Zn', 'Zinc', 5, 12, 4, 65.382, 7.14, 419.53, 906.85,
  'Ga', 'Gallium', 5, 13, 4, 69.7231, 5.91, 29.76, 2399.85,
  'Ge', 'Germanium', 4, 14, 4, 72.6308, 5.323, 938.25, 2832.85,
  'As', 'Arsenic', 4, 15, 4, 74.9215956, 5.727, null, null,
  'Se', 'Selenium', 0, 16, 4, 78.9718, 4.81, 220.85, 684.85,
  'Br', 'Bromine', 0, 17, 4, 79.904, 3.1028, -7.35, 58.85,
  'Kr', 'Krypton', 1, 18, 4, 83.7982, 3.749, -157.37, -153.22,
  'Rb', 'Rubidium', 2, 1, 5, 85.46783, 1.532, 39.3, 687.85,
  'Sr', 'Strontium', 3, 2, 5, 87.621, 2.64, 776.85, 1376.85,
  'Y', 'Yttrium', 6, 3, 5, 88.905842, 4.472, 1525.85, 2929.85,
  'Zr', 'Zirconium', 6, 4, 5, 91.2242, 6.52, 1854.85, 4376.85,
  'Nb', 'Niobium', 6, 5, 5, 92.906372, 8.57, 2476.85, 4743.85,
  'Mo', 'Molybdenum', 6, 6, 5, 95.951, 10.28, 2622.85, 4638.85,
  'Tc', 'Technetium', 6, 7, 5, 98, 11, 2156.85, 4264.85,
  'Ru', 'Ruthenium', 6, 8, 5, 101.072, 12.45, 2333.85, 4149.85,
  'Rh', 'Rhodium', 6, 9, 5, 102.905502, 12.41, 1963.85, 3694.85,
  'Pd', 'Palladium', 6, 10, 5, 106.421, 12.023, 1554.9, 2962.85,
  'Ag', 'Silver', 6, 11, 5, 107.86822, 10.49, 961.78, 2161.85,
  'Cd', 'Cadmium', 5, 12, 5, 112.4144, 8.65, 321.07, 766.85,
  'In', 'Indium', 5, 13, 5, 114.8181, 7.31, 156.6, 2071.85,
  'Sn', 'Tin', 5, 14, 5, 118.7107, 7.365, 231.93, 2601.85,
  'Sb', 'Antimony', 4, 15, 5, 121.7601, 6.697, 630.63, 1634.85,
  'Te', 'Tellurium', 4, 16, 5, 127.603, 6.24, 449.51, 987.85,
  'I', 'Iodine', 0, 17, 5, 126.904473, 4.933, 113.7, 184.25,
  'Xe', 'Xenon', 1, 18, 5, 131.2936, 5.894, -111.75, -108.1,
  'Cs', 'Cesium', 2, 1, 6, 132.905451966, 1.93, 28.55, 670.85,
  'Ba', 'Barium', 3, 2, 6, 137.3277, 3.51, 726.85, 1844.85,
  'Hf', 'Hafnium', 6, 4, 6, 178.492, 13.31, 2232.85, 4602.85,
  'Ta', 'Tantalum', 6, 5, 6, 180.947882, 16.69, 3016.85, 5457.85,
  'W', 'Tungsten', 6, 6, 6, 183.841, 19.25, 3421.85, 5929.85,
  'Re', 'Rhenium', 6, 7, 6, 186.2071, 21.02, 3185.85, 5595.85,
  'Os', 'Osmium', 6, 8, 6, 190.233, 22.59, 3032.85, 5011.85,
  'Ir', 'Iridium', 6, 9, 6, 192.2173, 22.56, 2445.85, 4129.85,
  'Pt', 'Platinum', 6, 10, 6, 195.0849, 21.45, 1768.25, 3824.85,
  'Au', 'Gold', 6, 11, 6, 196.9665695, 19.3, 1064.18, 2969.85,
  'Hg', 'Mercury', 5, 12, 6, 200.5923, 13.534, -38.83, 356.73,
  'Tl', 'Thallium', 5, 13, 6, 204.38, 11.85, 303.85, 1472.85,
  'Pb', 'Lead', 5, 14, 6, 207.21, 11.34, 327.46, 1748.85,
  'Bi', 'Bismuth', 5, 15, 6, 208.980401, 9.78, 271.55, 1563.85,
  'Po', 'Polonium', 4, 16, 6, 209, 9.196, 253.85, 961.85,
  'At', 'Astatine', 0, 17, 6, 210, 6.35, 301.85, 336.85,
  'Rn', 'Radon', 1, 18, 6, 222, 9.73, -71.15, -61.65,
  'Fr', 'Francium', 2, 1, 7, 223, 1.87, 26.85, 676.85,
  'Ra', 'Radium', 3, 2, 7, 226, 5.5, 959.85, 1736.85,
  'Rf', 'Rutherfordium', 6, 4, 7, 267, 23.2, 2126.85, 5526.85,
  'Db', 'Dubnium', 6, 5, 7, 268, 29.3, null, null,
  'Sg', 'Seaborgium', 6, 6, 7, 269, 35, null, null,
  'Bh', 'Bohrium', 6, 7, 7, 270, 37.1, null, null,
  'Hs', 'Hassium', 6, 8, 7, 269, 40.7, -147.15, null,
  'Mt', 'Meitnerium', 9, 9, 7, 278, 37.4, null, null,
  'Ds', 'Darmstadtium', 9, 10, 7, 281, 34.8, null, null,
  'Rg', 'Roentgenium', 9, 11, 7, 282, 28.7, null, null,
  'Cn', 'Copernicium', 9, 12, 7, 285, 14, null, 3296.85,
  'Nh', 'Nihonium', 9, 13, 7, 286, 16, 426.85, 1156.85,
  'Fl', 'Flerovium', 9, 14, 7, 289, 14, 66.85, 146.85,
  'Mc', 'Moscovium', 9, 15, 7, 289, 13.5, 396.85, 1126.85,
  'Lv', 'Livermorium', 9, 16, 7, 293, 12.9, 435.85, 811.85,
  'Ts', 'Tennessine', 9, 17, 7, 294, 7.17, 449.85, 609.85,
  'Og', 'Oganesson', 9, 18, 7, 294, 4.95, null, 76.85,
  'La', 'Lanthanum', 7, 3, 8, 138.905477, 6.162, 919.85, 3463.85,
  'Ce', 'Cerium', 7, 4, 8, 140.1161, 6.77, 794.85, 3442.85,
  'Pr', 'Praseodymium', 7, 5, 8, 140.907662, 6.77, 934.85, 3129.85,
  'Nd', 'Neodymium', 7, 6, 8, 144.2423, 7.01, 1023.85, 3073.85,
  'Pm', 'Promethium', 7, 7, 8, 145, 7.26, 1041.85, 2999.85,
  'Sm', 'Samarium', 7, 8, 8, 150.362, 7.52, 1071.85, 1899.85,
  'Eu', 'Europium', 7, 9, 8, 151.9641, 5.264, 825.85, 1528.85,
  'Gd', 'Gadolinium', 7, 10, 8, 157.253, 7.9, 1311.85, 2999.85,
  'Tb', 'Terbium', 7, 11, 8, 158.925352, 8.23, 1355.85, 3122.85,
  'Dy', 'Dysprosium', 7, 12, 8, 162.5001, 8.54, 1406.85, 2566.85,
  'Ho', 'Holmium', 7, 13, 8, 164.930332, 8.79, 1460.85, 2599.85,
  'Er', 'Erbium', 7, 14, 8, 167.2593, 9.066, 1528.85, 2867.85,
  'Tm', 'Thulium', 7, 15, 8, 168.934222, 9.32, 1544.85, 1949.85,
  'Yb', 'Ytterbium', 7, 16, 8, 173.0451, 6.9, 823.85, 1195.85,
  'Lu', 'Lutetium', 7, 17, 8, 174.96681, 9.841, 1651.85, 3401.85,
  'Ac', 'Actinium', 8, 3, 9, 227, 10, 1226.85, 3226.85,
  'Th', 'Thorium', 8, 4, 9, 232.03774, 11.724, 1749.85, 4787.85,
  'Pa', 'Protactinium', 8, 5, 9, 231.035882, 15.37, 1567.85, 4026.85,
  'U', 'Uranium', 8, 6, 9, 238.028913, 19.1, 1132.15, 4130.85,
  'Np', 'Neptunium', 8, 7, 9, 237, 20.45, 638.85, 4173.85,
  'Pu', 'Plutonium', 8, 8, 9, 244, 19.816, 639.35, 3231.85,
  'Am', 'Americium', 8, 9, 9, 243, 12, 1175.85, 2606.85,
  'Cm', 'Curium', 8, 10, 9, 247, 13.51, 1339.85, 3109.85,
  'Bk', 'Berkelium', 8, 11, 9, 247, 14.78, 985.85, 2626.85,
  'Cf', 'Californium', 8, 12, 9, 251, 15.1, 899.85, 1469.85,
  'Es', 'Einsteinium', 8, 13, 9, 252, 8.84, 859.85, 995.85,
  'Fm', 'Fermium', 8, 14, 9, 257, null, 1526.85, null,
  'Md', 'Mendelevium', 8, 15, 9, 258, null, 826.85, null,
  'No', 'Nobelium', 8, 16, 9, 259, null, 826.85, null,
  'Lr', 'Lawrencium', 8, 17, 9, 266, null, 1626.85, null,
];

// --- DOM SETUP ---
const [ $sceneContent ] = utils.$('#scene-content');
const [ $template ] = utils.$('#element');

for (let i = 0, l = elements.length / ELEMENT_STRIDE; i < l; i += 1) {
  const offset = i * ELEMENT_STRIDE;
  const $el = $template.content.cloneNode(true);
  const $element = $el.querySelector('.element');
  const $number = $element.querySelector('.element-number');
  const $symbol = $element.querySelector('.element-symbol');
  const $title = $element.querySelector('.element-title');
  const $description = $element.querySelector('.element-description');
  
  $number.textContent = i + 1;
  $symbol.textContent = elements[offset + ELEMENT_FIELDS.SYMBOL];
  $title.textContent = elements[offset + ELEMENT_FIELDS.NAME];
  $element.dataset.color = elements[offset + ELEMENT_FIELDS.COLOR];
  $element.style.gridColumn = elements[offset + ELEMENT_FIELDS.COLUMN];
  $element.style.gridRow = elements[offset + ELEMENT_FIELDS.ROW];
  
  $description.innerHTML = [
    `<span style="opacity:.5">SYS_MASS:</span> ${elements[offset + ELEMENT_FIELDS.ATOMIC_MASS]} u`,
    `<span style="opacity:.5">DENSITY :</span> ${elements[offset + ELEMENT_FIELDS.DENSITY]} g/cm³`,
    `<span style="opacity:.5">T_MELT  :</span> ${elements[offset + ELEMENT_FIELDS.MELTING_POINT]} &deg;C`,
    `<span style="opacity:.5">T_BOIL  :</span> ${elements[offset + ELEMENT_FIELDS.BOILING_POINT]} &deg;C`,
    `<br><span style="color:var(--neon-cyan)">> STATUS: STABLE</span>`
  ].join('<br>');
  
  $sceneContent.appendChild($el);
}

const cards = utils.$('#scene-content .element');
const elementsLayout = createLayout($sceneContent, { properties: ['font-size'], duration: 2000, ease: 'inOutExpo' });

// --- RESPONSIVE CALCULATION ---
const getResponsiveValue = (baseValue) => {
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  return (minDim / 800) * baseValue; 
};

// --- LAYOUTS ---
const transformLayout = {
  table: () => {
    pointer.rotateX = 15;
    pointer.rotateY = 20;
    cards.forEach($el => {
      $el.style.opacity = 1;
      $el.style.transform = $el.classList.contains('is-expanded') ? 'translateZ(60px)' : 'translateZ(10px)';
    });
  },
  sphere: () => {
    const radius = getResponsiveValue(300); 
    pointer.rotateX = 40; pointer.rotateY = 360;
    cards.forEach(($el, i) => {
      const offsetZ = $el.classList.contains('is-expanded') ? 30 : 0;
      const phi = Math.acos(-1 + (2 * i) / cards.length);
      const theta = Math.sqrt(cards.length * Math.PI) * phi;
      const sinPhi = Math.sin(phi);
      const x = radius * sinPhi * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * sinPhi * Math.sin(theta);
      const yaw = Math.atan2(x, z);
      const pitch = -Math.atan2(y, Math.hypot(x, z));
      $el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yaw}rad) rotateX(${pitch}rad) translateZ(${offsetZ}px)`;
    });
  },
  helix: () => {
    const radius = getResponsiveValue(350); 
    pointer.rotateX = 30; pointer.rotateY = 300;
    const verticalSpacing = getResponsiveValue(4); 
    const yOffset = (cards.length * verticalSpacing) / 2;
    cards.forEach(($el, i) => {
      const offsetZ = $el.classList.contains('is-expanded') ? 30 : 0;
      const theta = i * 0.16 + Math.PI;
      const y = -(i * verticalSpacing) + yOffset;
      const x = radius * Math.sin(theta);
      const z = radius * Math.cos(theta);
      const yaw = Math.atan2(x, z);
      const pitch = -Math.atan2(y, Math.hypot(x, z) * 2);
      $el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yaw}rad) rotateX(${pitch}rad) translateZ(${offsetZ}px)`;
    });
  },
  grid: () => {
    pointer.rotateX = 10; pointer.rotateY = 60;
    const colGap = getResponsiveValue(150);
    const rowGap = getResponsiveValue(100);
    const depthGap = getResponsiveValue(150);
    const perLayer = 25;
    const layers = Math.ceil(cards.length / perLayer);
    cards.forEach(($el, i) => {
      const offsetZ = $el.classList.contains('is-expanded') ? 30 : 0;
      const col = i % 5;
      const row = Math.floor(i / 5) % 5;
      const layer = Math.floor(i / perLayer);
      const x = (col - 2) * colGap;
      const y = (2 - row) * rowGap;
      const z = offsetZ + ((layer - (layers - 1) / 2) * depthGap);
      $el.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    });
  },
  random: () => {
    pointer.rotateX = 15; pointer.rotateY = 20;
    const spread = getResponsiveValue(600);
    utils.set(cards, { x: () => utils.random(-spread, spread), y: () => utils.random(-spread, spread), z: () => utils.random(-spread, spread)})
  },
};

// Window Resize Auto-Align
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => { transformLayout[$sceneContent.dataset.layout](); }, 200);
});

// --- SMOOTH 3D ROTATION ENGINE ---
const sceneAnimatable = createAnimatable('#scene', { rotateX: 150, rotateY: 150 });
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, rotateX: 20, rotateY: 30, rx: 0, ry: 0 };

createTimer({
  onUpdate: () => {
    pointer.x = utils.lerp(pointer.x, pointer.targetX, 0.05);
    pointer.y = utils.lerp(pointer.y, pointer.targetY, 0.05);
    pointer.rx = utils.lerp(pointer.rx, pointer.rotateX, 0.05);
    pointer.ry = utils.lerp(pointer.ry, pointer.rotateY, 0.05);
    sceneAnimatable.rotateX(pointer.y * pointer.rx);
    sceneAnimatable.rotateY(pointer.x * pointer.ry);
  }
});

// --- SAFE CLICK LISTENER (ONLY ONE DECLARATION OF TOGGLES) ---
const toggles = utils.$('.controls button.toggle'); // Make sure this is the only time 'toggles' is declared!
let lastClickTime = 0; 

document.addEventListener('click', event => {
  const now = Date.now();
  
  // Top Menu Buttons
  const $toggle = event.target.closest('.controls button.toggle');
  if ($toggle) {
    if (now - lastClickTime < 1000) return; // 1-second cooldown
    lastClickTime = now;

    toggles.forEach(button => button.classList.remove('is-active'));
    $toggle.classList.add('is-active');
    const layoutType = $toggle.id;
    
    elementsLayout.update(() => {
      cards.forEach($el => $el.classList.remove('is-expanded'));
      $sceneContent.dataset.layout = layoutType;
      transformLayout[layoutType]();
    }, { delay: stagger([0, 750], { from: 'random' }) });
    return;
  }

  // Periodic Elements
  const $card = event.target.closest('#scene-content .element');
  if ($card) {
    if (now - lastClickTime < 500) return; // Half-second cooldown
    lastClickTime = now;

    const shouldExpand = !$card.classList.contains('is-expanded');
    elementsLayout.update(() => {
      cards.forEach($el => $el.classList.remove('is-expanded'));
      if (shouldExpand) $card.classList.add('is-expanded');
      transformLayout[$sceneContent.dataset.layout]();
    },{ ease: spring({ bounce: .2, duration: 350 }) });
  }
});

// --- INTRO ANIMATION ---
transformLayout.random();
utils.set(cards, { opacity: 0 });
elementsLayout.update(() => transformLayout.table(), { delay: stagger([0, 750], { from: 'random' }) });


// --- AR TRACKING (AIM & FIRE) ---
const videoElement = document.querySelector('.input_video');
const cursor1 = document.querySelector('#hand-cursor-1'); 
const cursor2 = document.querySelector('#hand-cursor-2'); 

let aimCursorX = window.innerWidth / 2;
let aimCursorY = window.innerHeight / 2;

let cursor1Target = { x: -100, y: -100, visible: false };
let cursor2Target = { x: -100, y: -100, visible: false };

const pinchState = {
  'Left': { isPinching: false, lastClick: 0 },
  'Right': { isPinching: false, lastClick: 0 }
};

// 60FPS Cursor Rendering Loop
function renderCursors() {
  if (cursor1Target.visible) {
    cursor1.style.display = 'block';
    cursor1.style.transform = `translate3d(${cursor1Target.x}px, ${cursor1Target.y}px, 0) translate(-50%, -50%)`;
  } else { cursor1.style.display = 'none'; }

  if (cursor2Target.visible) {
    cursor2.style.display = 'block';
    cursor2.style.transform = `translate3d(${cursor2Target.x}px, ${cursor2Target.y}px, 0) translate(-50%, -50%)`;
  } else { cursor2.style.display = 'none'; }

  requestAnimationFrame(renderCursors);
}
requestAnimationFrame(renderCursors);

function processHand(landmarks, handednessLabel) {
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const xPos = (1 - indexTip.x) * window.innerWidth;
  const yPos = indexTip.y * window.innerHeight;
  const isPrimary = handednessLabel === 'Left'; 
  const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

  if (isPrimary) {
    // BLUE HAND: Aim and Rotate
    cursor1Target.visible = true;
    cursor1Target.x = xPos;
    cursor1Target.y = yPos;
    aimCursorX = xPos;
    aimCursorY = yPos;
    pointer.targetX = utils.mapRange((1 - indexTip.x), 0, 1, 1, -1);
    pointer.targetY = utils.mapRange(indexTip.y, 0, 1, -1, 1);
  } else {
    // PURPLE HAND: Fire / Click at Blue Hand Location
    cursor2Target.visible = true;
    cursor2Target.x = xPos;
    cursor2Target.y = yPos;

    if (distance < 0.06) { 
      if (!pinchState[handednessLabel].isPinching) {
        pinchState[handednessLabel].isPinching = true;
        cursor2.classList.add('pinching'); 
        
        const now = Date.now();
        if (now - pinchState[handednessLabel].lastClick > 500) { 
          setTimeout(() => {
            const elementBelowCursor = document.elementFromPoint(aimCursorX, aimCursorY);
            if (elementBelowCursor) elementBelowCursor.click(); 
          }, 0);
          
          cursor1.classList.add('pinching');
          setTimeout(() => cursor1.classList.remove('pinching'), 200);
          pinchState[handednessLabel].lastClick = now;
        }
      }
    } else {
      pinchState[handednessLabel].isPinching = false;
      cursor2.classList.remove('pinching');
    }
  }
}

function onResults(results) {
  cursor1Target.visible = false;
  cursor2Target.visible = false;
  if (results.multiHandLandmarks && results.multiHandedness) {
    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness[index].label; 
      processHand(landmarks, handedness);
    });
  }
}

const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await hands.send({image: videoElement}); },
  width: 1280, height: 720
});
camera.start();