import { clamp, colors, type Friend, type PlayEngine, type Point } from './engine';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
function circle(c: Ctx, x: number, y: number, r: number, fill: string | CanvasGradient) {
  c.beginPath();
  c.arc(x, y, Math.max(0.01, r), 0, TAU);
  c.fillStyle = fill;
  c.fill();
}
function ellipse(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
) {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), 0, 0, TAU);
  c.fillStyle = fill;
  c.fill();
}
function line(c: Ctx, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  c.beginPath();
  c.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i],
      next = points[i + 1];
    c.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  const last = points[points.length - 1];
  c.lineTo(last.x, last.y);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke();
}
function starPath(c: Ctx, r: number, points = 5) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2,
      rr = i % 2 ? r * 0.51 : r;
    const x = Math.cos(a) * rr,
      y = Math.sin(a) * rr;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}
function heart(c: Ctx, r: number, fill: string) {
  c.beginPath();
  c.moveTo(0, r * 0.7);
  c.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.8, -r * 1.1, 0, -r * 0.5);
  c.bezierCurveTo(r * 0.8, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.7);
  c.fillStyle = fill;
  c.fill();
}
function shade(c: Ctx, r: number, color: string) {
  const g = c.createRadialGradient(-r * 0.35, -r * 0.5, 0, 0, 0, r * 1.4);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.18, color);
  g.addColorStop(1, color);
  return g;
}
function face(c: Ctx, r: number, happy = false, target: Point = { x: 0, y: 0 }, closed = false) {
  c.save();
  c.lineWidth = Math.max(2, r * 0.048);
  c.lineCap = 'round';
  const ink = '#274b58',
    eyeY = -r * 0.05,
    eyeX = r * 0.25;
  for (const sign of [-1, 1]) {
    if (closed) {
      c.beginPath();
      c.arc(sign * eyeX, eyeY, r * 0.085, 0, Math.PI);
      c.strokeStyle = ink;
      c.stroke();
    } else {
      ellipse(c, sign * eyeX, eyeY, r * 0.09, r * 0.12, ink);
      circle(
        c,
        sign * eyeX + r * 0.027 + clamp(target.x, -1, 1) * r * 0.025,
        eyeY - r * 0.035 + clamp(target.y, -1, 1) * r * 0.02,
        r * 0.027,
        '#fffdf7',
      );
    }
    ellipse(c, sign * r * 0.43, r * 0.16, r * 0.125, r * 0.065, '#ee859180');
  }
  c.beginPath();
  if (happy) {
    c.ellipse(0, r * 0.24, r * 0.12, r * 0.14, 0, 0, Math.PI);
    c.fillStyle = ink;
    c.fill();
  } else {
    c.arc(0, r * 0.14, r * 0.12, 0.1, Math.PI - 0.1);
    c.strokeStyle = ink;
    c.stroke();
  }
  c.restore();
}
function fish(c: Ctx, x: number, y: number, r: number, color: string, time: number, happy = false) {
  c.save();
  c.translate(x, y);
  const wag = Math.sin(time * 4) * r * 0.05;
  c.beginPath();
  c.moveTo(-r * 0.55, 0);
  c.quadraticCurveTo(-r * 1.2, -r * 0.65 + wag, -r * 1.3, -r * 0.42);
  c.quadraticCurveTo(-r * 1.12, 0, -r * 1.3, r * 0.42);
  c.quadraticCurveTo(-r * 1.2, r * 0.65 + wag, -r * 0.55, 0);
  c.fillStyle = color;
  c.fill();
  const g = c.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, '#fff8e2');
  g.addColorStop(0.25, color);
  g.addColorStop(1, color);
  ellipse(c, 0, 0, r, r * 0.74, g);
  c.save();
  c.translate(-r * 0.15, r * 0.08);
  c.rotate(-0.3);
  ellipse(c, 0, 0, r * 0.25, r * 0.34, color);
  c.restore();
  c.save();
  c.translate(r * 0.26, -r * 0.05);
  face(c, r * 0.7, happy);
  c.restore();
  c.restore();
}
function animal(c: Ctx, r: number, index: number, happy: boolean, time: number, contrast = false) {
  const color = contrast
    ? index % 2
      ? '#ff625a'
      : '#ffffff'
    : ['#efaa6e', '#e6d3f1', '#d2a07d'][index % 3];
  if (index % 3 === 1) {
    ellipse(c, -r * 0.31, -r * 0.83, r * 0.17, r * 0.55, color);
    ellipse(c, r * 0.31, -r * 0.83, r * 0.17, r * 0.55, color);
    ellipse(c, -r * 0.31, -r * 0.86, r * 0.075, r * 0.33, contrast ? '#ffffff' : '#efa6b2');
    ellipse(c, r * 0.31, -r * 0.86, r * 0.075, r * 0.33, contrast ? '#ffffff' : '#efa6b2');
  } else if (index % 3 === 2) {
    circle(c, -r * 0.6, -r * 0.5, r * 0.3, color);
    circle(c, r * 0.6, -r * 0.5, r * 0.3, color);
    circle(c, -r * 0.6, -r * 0.5, r * 0.17, '#edc8a8');
    circle(c, r * 0.6, -r * 0.5, r * 0.17, '#edc8a8');
  } else {
    c.beginPath();
    c.moveTo(-r * 0.75, 0);
    c.lineTo(-r * 0.7, -r * 0.97);
    c.lineTo(-r * 0.17, -r * 0.5);
    c.lineTo(r * 0.17, -r * 0.5);
    c.lineTo(r * 0.7, -r * 0.97);
    c.lineTo(r * 0.75, 0);
    c.fillStyle = color;
    c.fill();
  }
  ellipse(c, 0, 0, r * 0.8, r * 0.69, shade(c, r, color));
  if (index % 3 === 0) {
    c.beginPath();
    c.moveTo(-r * 0.8, -r * 0.15);
    c.quadraticCurveTo(-r * 0.38, -r * 0.1, 0, r * 0.28);
    c.quadraticCurveTo(r * 0.38, -r * 0.1, r * 0.8, -r * 0.15);
    c.quadraticCurveTo(r * 0.72, r * 0.7, 0, r * 0.68);
    c.quadraticCurveTo(-r * 0.72, r * 0.7, -r * 0.8, -r * 0.15);
    c.fillStyle = '#fff4dc';
    c.fill();
  }
  c.save();
  c.translate(0, r * 0.02);
  face(c, r * 0.72, happy, { x: Math.sin(time * 0.5), y: 0 });
  c.restore();
  ellipse(c, -r * 0.45, r * 0.59, r * 0.19, r * 0.13, color);
  ellipse(c, r * 0.45, r * 0.59, r * 0.19, r * 0.13, color);
}
function cloud(c: Ctx, x: number, y: number, s: number, color = '#fffdf5') {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.beginPath();
  c.roundRect(-70, -8, 140, 45, 23);
  c.fillStyle = color;
  c.fill();
  circle(c, -28, -8, 32, color);
  circle(c, 15, -18, 42, color);
  circle(c, 48, 0, 26, color);
  c.restore();
}
function weed(c: Ctx, x: number, y: number, h: number, color: string, time: number) {
  c.save();
  c.translate(x, y);
  const sway = Math.sin(time * 0.6 + x) * h * 0.06;
  c.strokeStyle = color;
  c.lineWidth = h * 0.13;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(-h * 0.22, -h * 0.35, h * 0.25 + sway, -h * 0.63, sway, -h);
  c.stroke();
  for (let i = 1; i < 4; i++) {
    const s = i % 2 ? 1 : -1;
    c.beginPath();
    c.moveTo(0, -h * i * 0.2);
    c.quadraticCurveTo(s * h * 0.4, -h * (i * 0.2 + 0.22), s * h * 0.22, -h * (i * 0.2 + 0.36));
    c.stroke();
  }
  c.restore();
}
function background(c: Ctx, e: PlayEngine) {
  const w = e.width,
    h = e.height,
    t = e.settings.calm ? 0 : e.time;
  if (e.settings.contrast) {
    c.fillStyle = '#111827';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++)
      circle(
        c,
        (((i * 137 + 42) % 997) / 997) * w,
        (((i * 173 + 92) % 773) / 773) * h,
        3,
        '#ffffff50',
      );
    return;
  }
  if (e.scene === 'sea') {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ccf3f1');
    g.addColorStop(0.37, '#a2e0e1');
    g.addColorStop(1, '#62bacb');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    c.globalAlpha = 0.1;
    c.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(w * (0.1 + i * 0.25), 0);
      c.lineTo(w * (0.03 + i * 0.25), h);
      c.lineTo(w * (0.28 + i * 0.25), h);
      c.lineTo(w * (0.18 + i * 0.25), 0);
      c.fill();
    }
    c.globalAlpha = 1;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(w, 0);
    c.lineTo(w, h * 0.13);
    c.bezierCurveTo(w * 0.8, h * 0.05, w * 0.68, h * 0.16, w * 0.48, h * 0.12);
    c.bezierCurveTo(w * 0.28, h * 0.07, w * 0.1, h * 0.17, 0, h * 0.12);
    c.closePath();
    c.fillStyle = '#f7f7e8';
    c.fill();
    circle(c, w * 0.76, h * 0.085, Math.min(w, h) * 0.052, '#ffcd75');
    for (let i = 0; i < 13; i++) {
      const x = (((i * 83 + 11) % 997) / 997) * w,
        y = h * (0.19 + ((i * 71) % 701) / 1000);
      circle(c, x, y + Math.sin(t * 0.35 + i) * 5, 2 + (i % 3), '#effffa65');
    }
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(0, h * 0.94);
    c.bezierCurveTo(w * 0.3, h * 0.88, w * 0.56, h * 1.02, w, h * 0.93);
    c.lineTo(w, h);
    c.fillStyle = '#f1dfb8';
    c.fill();
    weed(c, w * 0.05, h * 0.98, h * 0.19, '#49a5a5', t);
    weed(c, w * 0.12, h, h * 0.11, '#83c7aa', t);
    weed(c, w * 0.91, h * 0.98, h * 0.16, '#82bca2', t);
    weed(c, w * 0.96, h, h * 0.23, '#51a8aa', t);
    c.save();
    c.translate(w * 0.79, h * 0.945);
    c.rotate(0.3);
    starPath(c, Math.min(w, h) * 0.039);
    c.fillStyle = '#f4a58c';
    c.fill();
    face(c, Math.min(w, h) * 0.025);
    c.restore();
    ellipse(c, w * 0.22, h * 0.975, w * 0.045, h * 0.019, '#ddd4b9');
    ellipse(c, w * 0.27, h * 0.98, w * 0.032, h * 0.013, '#e9e6d2');
  } else if (e.scene === 'bounce') {
    c.fillStyle = '#f9eed9';
    c.fillRect(0, 0, w, h);
    circle(c, w * 0.87, h * 0.19, h * 0.14, '#f4dfbc');
    cloud(c, w * 0.17, h * 0.2, Math.min(w, h) / 1100, '#fffbf0');
    c.save();
    c.translate(w * 0.72, h * 0.59);
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.arc(0, 0, h * (0.3 - i * 0.043), Math.PI, 0);
      c.lineWidth = h * 0.025;
      c.strokeStyle = ['#edaa95', '#f0cc83', '#afd0b0', '#b8bed7'][i];
      c.stroke();
    }
    c.restore();
    c.fillStyle = '#e7d8bf';
    c.fillRect(0, h * 0.88, w, h * 0.12);
    c.fillStyle = '#d8c9af';
    c.fillRect(0, h * 0.88, w, 3);
    for (let i = 0; i < 10; i++) {
      c.beginPath();
      c.moveTo(i * w * 0.15, h * 0.88);
      c.lineTo(i * w * 0.15 - h * 0.12, h);
      c.strokeStyle = '#deceb5';
      c.lineWidth = 1;
      c.stroke();
    }
  } else if (e.scene === 'paint') {
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#fff4e6');
    g.addColorStop(0.5, '#fcf0f0');
    g.addColorStop(1, '#ebeffb');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) {
      circle(
        c,
        (((i * 119 + 57) % 997) / 997) * w,
        (((i * 131 + 17) % 773) / 773) * h,
        2,
        '#d8cdd950',
      );
    }
  } else if (e.scene === 'peek' || e.scene === 'garden') {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#edf4d9');
    g.addColorStop(1, '#d6eab9');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    cloud(c, w * 0.22, h * 0.19, Math.min(w, h) / 950);
    cloud(c, w * 0.8, h * 0.32, Math.min(w, h) / 1300);
    circle(c, w * 0.76, h * 0.16, Math.min(w, h) * 0.075, '#ffda79');
    c.save();
    c.translate(w * 0.76, h * 0.16);
    face(c, Math.min(w, h) * 0.053, false, { x: 0, y: 0 }, true);
    c.restore();
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(0, h * 0.85);
    c.bezierCurveTo(w * 0.2, h * 0.7, w * 0.5, h * 0.93, w * 0.7, h * 0.81);
    c.quadraticCurveTo(w * 0.9, h * 0.71, w, h * 0.84);
    c.lineTo(w, h);
    c.fillStyle = '#bdd89d';
    c.fill();
    c.beginPath();
    c.moveTo(0, h);
    c.lineTo(0, h * 0.93);
    c.quadraticCurveTo(w * 0.5, h * 0.86, w, h * 0.95);
    c.lineTo(w, h);
    c.fillStyle = '#a8ca85';
    c.fill();
    for (let i = 0; i < 12; i++) {
      const x = (i * w) / 11,
        y = h * (0.91 + (i % 3) * 0.023);
      c.strokeStyle = '#8db673';
      c.lineWidth = 3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x - 4, y - 15, x - 10, y - 18);
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 2, y - 18, x + 7, y - 24);
      c.stroke();
    }
    if (e.scene === 'garden') {
      c.save();
      c.translate(w * 0.5, h * 0.3);
      cloud(c, 0, 0, Math.min(w, h) / 670, '#fffdf7');
      face(c, Math.min(w, h) * 0.035, false, { x: 0, y: 0 }, false);
      c.restore();
    }
  } else {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#242e54');
    g.addColorStop(1, '#515780');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 42; i++) {
      const x = (((i * 137 + 24) % 997) / 997) * w,
        y = (((i * 173 + 57) % 773) / 773) * h;
      circle(
        c,
        x,
        y,
        1 + (i % 2),
        (i % 3 === 0 ? '#f8e9a8' : '#d7dffc') +
          (e.settings.calm
            ? '80'
            : Math.round((0.32 + Math.sin(t * 0.35 + i) * 0.15) * 255)
                .toString(16)
                .padStart(2, '0')),
      );
    }
    c.save();
    c.translate(w * 0.83, h * 0.15);
    c.rotate(-0.15);
    circle(c, 0, 0, Math.min(w, h) * 0.061, '#f7e3a8');
    circle(c, Math.min(w, h) * 0.025, -Math.min(w, h) * 0.014, Math.min(w, h) * 0.054, '#2c355c');
    c.restore();
    cloud(c, w * 0.15, h * 0.92, Math.min(w, h) / 430, '#696c93');
    cloud(c, w * 0.72, h * 0.99, Math.min(w, h) / 340, '#60638c');
  }
}

function bubble(c: Ctx, e: PlayEngine, f: Friend, t: number) {
  const r = f.r,
    born = clamp((e.time - f.born) * 3, 0, 1),
    scale = 0.55 + 0.45 * Math.sin(born * Math.PI * 0.5),
    color = e.settings.contrast ? '#ffffff' : colors[f.color];
  c.save();
  c.translate(f.x, f.y);
  c.scale(scale, scale);
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffffffbf');
  g.addColorStop(0.65, e.settings.contrast ? '#ffffff30' : color + '50');
  g.addColorStop(0.89, color + '98');
  g.addColorStop(1, '#ffffffcc');
  c.shadowColor = '#397c9122';
  c.shadowBlur = 25;
  c.shadowOffsetY = 12;
  circle(c, 0, 0, r, g);
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  c.beginPath();
  c.arc(0, 0, r - 1, 0, TAU);
  c.strokeStyle = '#fffdf4b3';
  c.lineWidth = 2;
  c.stroke();
  fish(
    c,
    2,
    5,
    r * 0.49,
    e.settings.contrast ? (f.color % 2 ? '#ff645e' : '#ffffff') : colors[f.color],
    t,
    f.dragged,
  );
  c.beginPath();
  c.arc(-r * 0.03, -r * 0.03, r * 0.77, Math.PI * 1.12, Math.PI * 1.46);
  c.lineWidth = r * 0.055;
  c.strokeStyle = '#ffffffd9';
  c.lineCap = 'round';
  c.stroke();
  circle(c, r * 0.54, r * 0.5, r * 0.07, '#ffffff99');
  c.restore();
}
function bouncer(c: Ctx, e: PlayEngine, f: Friend) {
  const color = e.settings.contrast ? (f.color % 2 ? '#ff625a' : '#ffffff') : colors[f.color],
    r = f.r;
  const floor = e.height * 0.88;
  ellipse(c, f.x, floor + r * 0.07, r * 0.76, r * 0.16, '#a18a6322');
  c.save();
  c.translate(f.x, f.y);
  c.rotate(f.rotation * 0.18);
  const squash = 1 - clamp(Math.abs(f.vy) / 2200, 0, 0.12);
  c.scale(squash, 1 / squash);
  c.shadowColor = '#88726022';
  c.shadowBlur = 18;
  c.shadowOffsetY = 8;
  c.fillStyle = shade(c, r, color);
  c.beginPath();
  if (f.color % 3 === 0) c.arc(0, 0, r, 0, TAU);
  else if (f.color % 3 === 1) c.roundRect(-r * 0.84, -r * 0.84, r * 1.68, r * 1.68, r * 0.3);
  else {
    c.moveTo(0, -r);
    c.quadraticCurveTo(r * 0.15, -r, r * 0.25, -r * 0.8);
    c.lineTo(r * 0.92, r * 0.62);
    c.quadraticCurveTo(r * 1.05, r * 0.9, r * 0.67, r * 0.9);
    c.lineTo(-r * 0.67, r * 0.9);
    c.quadraticCurveTo(-r * 1.05, r * 0.9, -r * 0.92, r * 0.62);
    c.lineTo(-r * 0.25, -r * 0.8);
    c.quadraticCurveTo(-r * 0.15, -r, 0, -r);
  }
  c.fill();
  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  face(c, r * 0.8, f.awake > 0);
  c.restore();
}
function egg(c: Ctx, e: PlayEngine, f: Friend, t: number) {
  const r = f.r,
    open = f.growth,
    color = e.settings.contrast ? '#ffffff' : colors[(f.color + 2) % 6];
  ellipse(c, f.x, f.y + r * 0.81, r * 0.91, r * 0.17, '#698a4820');
  c.save();
  c.translate(f.x, f.y);
  c.rotate(Math.sin(t * 1.5 + f.phase) * 0.025 * (1 - open));
  c.save();
  c.translate(0, -open * r * 0.59);
  c.scale(0.5 + open * 0.45, 0.5 + open * 0.45);
  if (open > 0.03) animal(c, r, f.color, f.awake > 0, t, e.settings.contrast);
  c.restore();
  // The two shell halves move apart to reveal the friend, and close again gently.
  c.save();
  c.beginPath();
  c.rect(-r * 1.1, -r * 1.3 - open * r * 1.6, r * 2.2, r * 1.4);
  c.clip();
  c.translate(0, -open * r * 1.6);
  ellipse(c, 0, 0, r * 0.83, r * 1.03, shade(c, r, color));
  for (let i = 0; i < 5; i++)
    circle(c, Math.sin(i * 2.4) * r * 0.55, Math.cos(i * 2.4) * r * 0.7, r * 0.11, '#ffffff7a');
  c.restore();
  c.save();
  c.beginPath();
  c.moveTo(-r, -r * 0.08);
  for (let i = 0; i < 7; i++) c.lineTo(-r + (i * r) / 3, -r * 0.08 + (i % 2 ? r * 0.17 : 0));
  c.lineTo(r, r * 1.3);
  c.lineTo(-r, r * 1.3);
  c.closePath();
  c.clip();
  ellipse(c, 0, 0, r * 0.83, r * 1.03, shade(c, r, color));
  for (let i = 0; i < 4; i++)
    circle(
      c,
      Math.sin(i * 2.4) * r * 0.55,
      r * 0.3 + Math.abs(Math.cos(i * 2.4)) * r * 0.4,
      r * 0.11,
      '#ffffff7a',
    );
  c.restore();
  if (open < 0.08) {
    c.save();
    c.translate(0, -r * 0.03);
    face(c, r * 0.55, false, { x: 0, y: 0 }, true);
    c.restore();
  }
  c.restore();
}
function plant(c: Ctx, e: PlayEngine, f: Friend, t: number) {
  const r = f.r,
    g = f.growth,
    color = e.settings.contrast ? (f.color % 2 ? '#ff625a' : '#ffffff') : colors[f.color];
  c.save();
  c.translate(f.x, f.y);
  ellipse(c, 0, r * 0.35, r * 0.7, r * 0.17, e.settings.contrast ? '#ffffff30' : '#86a56635');
  const height = r * (0.4 + g * 2.1);
  c.lineWidth = r * 0.11;
  c.lineCap = 'round';
  c.strokeStyle = e.settings.contrast ? '#ffffff' : '#659b69';
  c.beginPath();
  c.moveTo(0, r * 0.22);
  c.quadraticCurveTo(Math.sin(t + f.phase) * r * 0.06, -height * 0.5, 0, -height);
  c.stroke();
  if (g > 0.12) {
    c.save();
    c.translate(0, -height * 0.44);
    c.rotate(-0.55);
    ellipse(
      c,
      -r * 0.3,
      -r * 0.13,
      r * 0.37 * g,
      r * 0.2 * g,
      e.settings.contrast ? '#ffffff' : '#91bf76',
    );
    c.restore();
    c.save();
    c.translate(0, -height * 0.64);
    c.rotate(0.55);
    ellipse(
      c,
      r * 0.3,
      -r * 0.13,
      r * 0.37 * g,
      r * 0.2 * g,
      e.settings.contrast ? '#ffffff' : '#76ad72',
    );
    c.restore();
  }
  c.save();
  c.translate(0, -height);
  const bloom = 0.18 + g * 0.82;
  c.scale(bloom, bloom);
  for (let i = 0; i < 6; i++) {
    c.save();
    c.rotate((i * TAU) / 6);
    ellipse(c, 0, -r * 0.49, r * 0.35, r * 0.4, shade(c, r, color));
    c.restore();
  }
  circle(c, 0, 0, r * 0.43, e.settings.contrast ? '#ff625a' : '#ffe49e');
  face(c, r * 0.4, f.awake > 0);
  c.restore();
  // A seed bed gives an obvious big touch target even before the flower grows.
  ellipse(c, 0, r * 0.3, r * 0.49, r * 0.32, e.settings.contrast ? '#ffffff' : '#b38b63');
  ellipse(c, -r * 0.06, r * 0.21, r * 0.24, r * 0.1, e.settings.contrast ? '#ff625a' : '#ceb18b');
  c.restore();
}
function singingStar(c: Ctx, e: PlayEngine, f: Friend, t: number) {
  const r = f.r,
    pulse = f.awake > 0 ? 1 + Math.sin(f.awake * 6) * 0.035 : 1,
    color = e.settings.contrast ? '#ffffff' : colors[(f.color + 4) % 6];
  c.save();
  c.translate(f.x, f.y + (e.settings.calm ? 0 : Math.sin(t * 0.65 + f.phase) * 7));
  c.scale(pulse, pulse);
  c.rotate(Math.sin(t * 0.4 + f.phase) * 0.04);
  if (f.awake > 0) {
    const g = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.8);
    g.addColorStop(0, color + '80');
    g.addColorStop(1, color + '00');
    circle(c, 0, 0, r * 1.8, g);
  }
  c.shadowColor = color + '40';
  c.shadowBlur = 20;
  starPath(c, r);
  c.lineJoin = 'round';
  c.lineWidth = r * 0.08;
  c.fillStyle = shade(c, r, color);
  c.strokeStyle = color;
  c.fill();
  c.stroke();
  c.shadowBlur = 0;
  face(c, r * 0.57, f.awake > 0, { x: 0, y: 0 }, f.awake === 0);
  c.restore();
}

export function render(c: Ctx, e: PlayEngine) {
  c.clearRect(0, 0, e.width, e.height);
  background(c, e);
  const t = e.settings.calm ? 0 : e.time;
  for (const ribbon of e.ribbons) {
    c.save();
    c.globalAlpha = clamp(ribbon.life, 0, 1) * 0.85;
    const color = e.settings.contrast ? '#ffffff' : colors[ribbon.color];
    line(c, ribbon.points, color, ribbon.width);
    line(c, ribbon.points, '#ffffff55', ribbon.width * 0.22);
    c.restore();
  }
  for (const f of e.friends) {
    if (e.scene === 'sea') bubble(c, e, f, t);
    else if (e.scene === 'bounce') bouncer(c, e, f);
    else if (e.scene === 'peek') egg(c, e, f, t);
    else if (e.scene === 'garden') plant(c, e, f, t);
    else if (e.scene === 'stars') singingStar(c, e, f, t);
    else if (e.interactions < 2) {
      c.save();
      c.translate(f.x, f.y);
      const r = f.r;
      circle(c, 0, 0, r, '#ffdda8');
      face(c, r * 0.75);
      c.restore();
    }
  }
  for (const p of e.particles) {
    c.save();
    c.translate(p.x, p.y);
    c.globalAlpha = clamp(p.life / 0.5, 0, 1);
    const color = e.settings.contrast ? '#ffffff' : colors[p.color % 6];
    if (p.kind === 'ring') {
      c.beginPath();
      c.arc(0, 0, p.r + (1 - p.life / p.maxLife) * 65, 0, TAU);
      c.strokeStyle = color;
      c.lineWidth = 2 + p.life * 3;
      c.globalAlpha = (p.life / p.maxLife) * 0.7;
      c.stroke();
    } else if (p.kind === 'fish') {
      if (p.vx < 0) c.scale(-1, 1);
      fish(c, 0, 0, p.r, color, t, true);
    } else if (p.kind === 'heart') {
      c.rotate(Math.sin(t + p.x) * 0.2);
      heart(c, p.r * 1.5, color);
    } else if (p.kind === 'drop') {
      ellipse(c, 0, 0, p.r * 0.5, p.r * 1.2, e.settings.contrast ? '#ffffff' : '#78bcd9');
    } else circle(c, 0, 0, p.r, color);
    c.restore();
  }
  for (const finger of e.fingers.values()) {
    c.save();
    c.globalAlpha = 0.22;
    circle(c, finger.x, finger.y, 24, '#fff');
    c.globalAlpha = 0.65;
    circle(c, finger.x, finger.y, 5, '#fff');
    c.restore();
  }
}
