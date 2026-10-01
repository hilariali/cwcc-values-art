/*
 * VALUES GRID — CWCC animated values loop (OpenProcessing)
 * =========================================================
 * A calm, ambient grid inspired by the #WCCChallenge "Love love love"
 * Pride sketch: every cell draws its letter stroke by stroke, rests,
 * then blooms into the next colour — forever.
 *
 * The grid LOOPS through five phases, about 10 seconds each:
 *   1. C · W · C · C        — the four value initials
 *   2. C H E E R F U L      — the full word, spelled across the cells
 *   3. W A R M
 *   4. C O L L A B O R A T I V E
 *   5. C O N F I D E N T
 * …then back to C · W · C · C. Each phase change blooms across the
 * whole grid at once, with the word's name flashing over the grid.
 *
 * School palette: navy #001F47, gold #FBCB09, orange #E85D26,
 * sky blue #00AEEF, cyan #3BBFD9. No libraries, no photo, no
 * interaction — just let it loop.
 */

// ---- value phases: initials, then each full word, then loop ----
const WORDS = [
  ['C', 'W', 'C', 'C'],
  [...'CHEERFUL'],
  [...'WARM'],
  [...'COLLABORATIVE'],
  [...'CONFIDENT'],
];
const WORD_NAMES = ['C · W · C · C', 'CHEERFUL', 'WARM', 'COLLABORATIVE', 'CONFIDENT'];

const PHASE_LEN = 600;   // frames each phase stays up (~10 seconds at 60fps)
const FLASH_LEN = 150;   // frames the word name flashes over the grid on change
let phaseIndex = 0;
let phaseTimer = PHASE_LEN;
let phaseFlash = 0;

function letterFor(wordPos) {
  const w = WORDS[phaseIndex];
  return w[wordPos % w.length];
}

let colorPalette;
let cells = [];

// Geometric stroke font: every letter is a list of strokes, each stroke a
// list of [x, y] points in 0..1 cell space. Drawn progressively, stroke by
// stroke, to match the C/W letter animations below.
const STROKES = {
  'A': [[[0.15,0.85],[0.5,0.15],[0.85,0.85]], [[0.32,0.55],[0.68,0.55]]],
  'B': [[[0.3,0.15],[0.3,0.85]], [[0.3,0.15],[0.5,0.15],[0.62,0.25],[0.62,0.38],[0.5,0.5],[0.3,0.5]], [[0.3,0.5],[0.55,0.5],[0.68,0.62],[0.68,0.75],[0.55,0.85],[0.3,0.85]]],
  'D': [[[0.3,0.15],[0.3,0.85]], [[0.3,0.15],[0.55,0.15],[0.72,0.3],[0.72,0.7],[0.55,0.85],[0.3,0.85]]],
  'E': [[[0.75,0.15],[0.25,0.15],[0.25,0.85],[0.75,0.85]], [[0.25,0.5],[0.65,0.5]]],
  'F': [[[0.75,0.15],[0.25,0.15],[0.25,0.85]], [[0.25,0.5],[0.62,0.5]]],
  'G': [[[0.75,0.2],[0.6,0.13],[0.4,0.13],[0.25,0.25],[0.22,0.5],[0.25,0.75],[0.4,0.87],[0.6,0.87],[0.75,0.75],[0.75,0.6],[0.55,0.6]]],
  'H': [[[0.25,0.15],[0.25,0.85]], [[0.75,0.15],[0.75,0.85]], [[0.25,0.5],[0.75,0.5]]],
  'I': [[[0.3,0.15],[0.7,0.15]], [[0.5,0.15],[0.5,0.85]], [[0.3,0.85],[0.7,0.85]]],
  'J': [[[0.7,0.15],[0.7,0.7],[0.6,0.82],[0.45,0.87],[0.32,0.8]]],
  'K': [[[0.3,0.15],[0.3,0.85]], [[0.72,0.15],[0.3,0.55]], [[0.45,0.62],[0.72,0.85]]],
  'L': [[[0.3,0.15],[0.3,0.85],[0.75,0.85]]],
  'M': [[[0.15,0.85],[0.15,0.15],[0.5,0.55],[0.85,0.15],[0.85,0.85]]],
  'N': [[[0.25,0.85],[0.25,0.15],[0.75,0.85],[0.75,0.15]]],
  'O': [[[0.5,0.15],[0.68,0.18],[0.78,0.32],[0.78,0.68],[0.68,0.82],[0.5,0.85],[0.32,0.82],[0.22,0.68],[0.22,0.32],[0.32,0.18],[0.5,0.15]]],
  'P': [[[0.3,0.85],[0.3,0.15]], [[0.3,0.15],[0.55,0.15],[0.68,0.25],[0.68,0.4],[0.55,0.5],[0.3,0.5]]],
  'Q': [[[0.5,0.15],[0.68,0.18],[0.78,0.32],[0.78,0.68],[0.68,0.82],[0.5,0.85],[0.32,0.82],[0.22,0.68],[0.22,0.32],[0.32,0.18],[0.5,0.15]], [[0.55,0.65],[0.78,0.88]]],
  'R': [[[0.3,0.85],[0.3,0.15]], [[0.3,0.15],[0.55,0.15],[0.66,0.25],[0.66,0.38],[0.55,0.5],[0.3,0.5]], [[0.48,0.5],[0.72,0.85]]],
  'S': [[[0.72,0.25],[0.6,0.15],[0.4,0.15],[0.28,0.25],[0.28,0.38],[0.4,0.48],[0.6,0.52],[0.72,0.62],[0.72,0.75],[0.6,0.85],[0.4,0.85],[0.28,0.75]]],
  'T': [[[0.2,0.15],[0.8,0.15]], [[0.5,0.15],[0.5,0.85]]],
  'U': [[[0.25,0.15],[0.25,0.65],[0.32,0.78],[0.5,0.85],[0.68,0.78],[0.75,0.65],[0.75,0.15]]],
  'V': [[[0.2,0.15],[0.5,0.85],[0.8,0.15]]],
  'X': [[[0.25,0.15],[0.75,0.85]], [[0.75,0.15],[0.25,0.85]]],
  'Y': [[[0.2,0.15],[0.5,0.5]], [[0.8,0.15],[0.5,0.5]], [[0.5,0.5],[0.5,0.85]]],
  'Z': [[[0.25,0.15],[0.75,0.15],[0.25,0.85],[0.75,0.85]]],
};

function setup() {
  const minDim = min(windowWidth, windowHeight);
  createCanvas(minDim, minDim);
  colorPalette = ['#FBCB09', '#00AEEF', '#3BBFD9', '#E85D26'];
  const gridSize = calculateGridSize(minDim);
  const cellSize = minDim / gridSize;
  let idx = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      cells.push(new Cell(i * cellSize, j * cellSize, cellSize, cellSize, idx, idx % colorPalette.length));
      idx++;
    }
  }
}

function draw() {
  background('#001F47');
  noStroke();

  // advance the word phase; the whole grid blooms into the new word at once
  phaseTimer--;
  if (phaseTimer <= 0) {
    phaseIndex = (phaseIndex + 1) % WORDS.length;
    phaseTimer = PHASE_LEN;
    phaseFlash = FLASH_LEN;
    for (const cell of cells) cell.startPhaseBloom();
  }

  cells.forEach(cell => cell.draw());
  drawGrid();

  // word-name flash over the grid when a new phase begins
  if (phaseFlash > 0) {
    const a = map(phaseFlash, 0, FLASH_LEN, 0, 200);
    noStroke(); fill(255, 255, 255, a * 0.9);
    textAlign(CENTER, CENTER); textStyle(BOLD);
    textSize(min(width, height) * 0.11);
    text(WORD_NAMES[phaseIndex], width / 2, height / 2);
    phaseFlash--;
  }
}

function windowResized() {
  const minDim = min(windowWidth, windowHeight);
  resizeCanvas(minDim, minDim);
  cells = [];
  const gridSize = calculateGridSize(minDim);
  const cellSize = minDim / gridSize;
  let idx = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      cells.push(new Cell(i * cellSize, j * cellSize, cellSize, cellSize, idx, idx % colorPalette.length));
      idx++;
    }
  }
}

function calculateGridSize(minDim) {
  const baseSize = floor(minDim / 150);
  return (4 * baseSize) + 1;
}

function drawGrid() {
  stroke(255, 40);
  strokeWeight(1);
  const gridSize = calculateGridSize(min(width, height));
  const cellSize = min(width, height) / gridSize;
  for (let i = 0; i <= gridSize; i++) {
    line(i * cellSize, 0, i * cellSize, height);
    line(0, i * cellSize, width, i * cellSize);
  }
}

class Cell {
  constructor(x, y, w, h, wordPos, colorIndex) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.wordPos = wordPos;                 // fixed position in the word ribbon
    this.letter = letterFor(wordPos);       // current letter, from the active phase
    this.currentColor = colorIndex;
    this.bgColor = colorIndex;
    this.duration = 60;
    this.restDuration = 30;
    this.transitionDuration = 60;
    this.transitionRestDuration = 2;
    this.timer = this.duration;
    this.state = 'animating';
    this.currentEasing = 'easeInOutCubic';  // one shared gentle easing: the grid breathes together
  }


  reset() {
    this.state = 'animating';
    this.timer = this.duration;
    this.bgColor = this.currentColor;
    this.currentColor = (this.currentColor + 1) % colorPalette.length;
    this.letter = letterFor(this.wordPos);  // picks up the new phase's letter
    this.currentEasing = 'easeInOutCubic';  // one shared gentle easing: the grid breathes together
  }

  // called when the global word phase changes: bloom into the new letter now
  startPhaseBloom() {
    this.state = 'transitioning';
    this.timer = this.transitionDuration;
  }

  ease(t) {
    // shared ease-in-out cubic: gentle start, gentle landing, no snapping
    return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
  }

  draw() {
    push();
    translate(this.x, this.y);
    fill(colorPalette[this.bgColor]);
    rect(0, 0, this.w, this.h);

    if (this.state === 'animating') {
      const t = this.ease(1 - this.timer / this.duration);
      this.drawLetter(t, false);
      this.timer--;
      if (this.timer <= 0) { this.state = 'resting'; this.timer = this.restDuration; }
    } else if (this.state === 'resting') {
      this.drawLetter(1, false);
      this.timer--;
      if (this.timer <= 0) { this.state = 'transitioning'; this.timer = this.transitionDuration; }
    } else if (this.state === 'transitioning') {
      this.drawTransitionFill();
      this.timer--;
      if (this.timer <= 0) { this.state = 'transitionRest'; this.timer = this.transitionRestDuration; }
    } else if (this.state === 'transitionRest') {
      fill(colorPalette[this.currentColor]);
      rect(0, 0, this.w, this.h);
      this.timer--;
      if (this.timer <= 0) this.reset();
    }
    pop();
  }

  drawLetter(t, isTransition) {
    if (this.letter === 'C') this.drawLetterC(t);
    else if (this.letter === 'W') this.drawLetterW(t);
    else this.drawStrokeLetter(t);
  }

  // generic progressive stroke-font renderer for every other letter
  drawStrokeLetter(t) {
    const strokes = STROKES[this.letter];
    if (!strokes) return;
    noFill();
    stroke(colorPalette[this.currentColor]);
    strokeWeight(this.w * 0.13);
    strokeCap(ROUND); strokeJoin(ROUND);
    const p = t * strokes.length;
    for (let s = 0; s < strokes.length; s++) {
      if (s > p) break;
      this.drawPartialStroke(strokes[s], constrain(p - s, 0, 1));
    }
  }

  // draws the first `frac` of a polyline, walking it by arc length
  drawPartialStroke(pts, frac) {
    if (frac <= 0 || pts.length === 0) return;
    if (pts.length === 1) {
      strokeWeight(this.w * 0.13);
      point(pts[0][0] * this.w, pts[0][1] * this.h);
      return;
    }
    const lens = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = (pts[i + 1][0] - pts[i][0]) * this.w;
      const dy = (pts[i + 1][1] - pts[i][1]) * this.h;
      const l = sqrt(dx * dx + dy * dy);
      lens.push(l); total += l;
    }
    let remaining = frac * total;
    for (let i = 0; i < lens.length && remaining > 0; i++) {
      const x1 = pts[i][0] * this.w, y1 = pts[i][1] * this.h;
      const x2 = pts[i + 1][0] * this.w, y2 = pts[i + 1][1] * this.h;
      if (remaining >= lens[i]) {
        line(x1, y1, x2, y2);
        remaining -= lens[i];
      } else {
        const f = remaining / lens[i];
        line(x1, y1, lerp(x1, x2, f), lerp(y1, y2, f));
        remaining = 0;
      }
    }
  }

  drawTransitionFill() {
    const t = 1 - this.timer / this.transitionDuration;
    const e = 1 - pow(1 - t, 3);   // ease-out: bloom opens fast, then settles softly
    const centerX = this.w / 2, centerY = this.h / 2;
    const maxR = dist(0, 0, this.w, this.h) / 2;
    const r = e * maxR;
    push();
    this.drawLetter(1, true);
    noStroke();
    fill(colorPalette[this.currentColor]);
    ellipse(centerX, centerY, r * 2, r * 2);
    pop();
  }

  drawLetterC(t) {
    const w = this.w, h = this.h;
    const gapAngle = radians(70);
    const totalAngle = TWO_PI - gapAngle;
    const drawAngle = totalAngle * t;
    noFill();
    stroke(colorPalette[this.currentColor]);
    strokeWeight(w * 0.16);
    strokeCap(ROUND);
    if (drawAngle > 0) arc(w / 2, h / 2, w * 0.62, h * 0.62, gapAngle / 2, gapAngle / 2 + drawAngle);
  }

  drawLetterW(t) {
    const w = this.w, h = this.h;
    const x1 = w * 0.14, x2 = w * 0.32, x3 = w * 0.50, x4 = w * 0.68, x5 = w * 0.86;
    const yTop = h * 0.22, yBottom = h * 0.78;
    const totalSegments = 4;
    const progress = t * totalSegments;
    stroke(colorPalette[this.currentColor]);
    strokeWeight(w * 0.14);
    strokeCap(ROUND);
    noFill();
    const drawSegment = (seg, sx, sy, ex, ey) => {
      if (progress > seg) {
        const segT = min(1, progress - seg);
        line(sx, sy, lerp(sx, ex, segT), lerp(sy, ey, segT));
      }
    };
    drawSegment(0, x1, yTop, x2, yBottom);
    drawSegment(1, x2, yBottom, x3, yTop);
    drawSegment(2, x3, yTop, x4, yBottom);
    drawSegment(3, x4, yBottom, x5, yTop);
  }
}
