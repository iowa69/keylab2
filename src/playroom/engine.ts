import type { Preferences, ToyId } from './settings';

export type Point = { x: number; y: number };
export type Friend = Point & {
  id: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  r: number;
  color: number;
  phase: number;
  awake: number;
  growth: number;
  targetGrowth: number;
  rotation: number;
  dragged: boolean;
  born: number;
};
export type Particle = Point & {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: number;
  kind: 'dot' | 'ring' | 'fish' | 'heart' | 'drop';
};
export type Ribbon = { points: Point[]; color: number; life: number; width: number };
type Finger = Point & {
  start: Point;
  previous: Point;
  friend?: number;
  moved: number;
  ribbon?: Ribbon;
  lastAction: number;
  lastFriend?: number;
};
export const LIMITS = { friends: 12, particles: 90, ribbons: 24, ribbonPoints: 100, fingers: 10 };
export const colors = ['#ffb757', '#f48aa0', '#79d8cc', '#b9a1ef', '#ffda71', '#78b9ed'];
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class PlayEngine {
  width = 1;
  height = 1;
  time = 0;
  interactions = 0;
  discoveries = 0;
  friends: Friend[] = [];
  particles: Particle[] = [];
  ribbons: Ribbon[] = [];
  fingers = new Map<number, Finger>();
  settings: Preferences;
  private nextId = 0;
  private nextColor = 0;
  private lastKeyTime = -1;
  private nextReplenish = 0;
  private rng: () => number;
  onSound: (toy: ToyId, tone: number) => void;
  constructor(
    settings: Preferences,
    width: number,
    height: number,
    onSound: (toy: ToyId, tone: number) => void = () => {},
    rng: () => number = Math.random,
  ) {
    this.settings = { ...settings };
    this.rng = rng;
    this.onSound = onSound;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.seed();
  }
  get radius() {
    return clamp(
      Math.min(this.width, this.height) * (this.settings.mode === 'baby' ? 0.145 : 0.115),
      42,
      110,
    );
  }
  get seaCount() {
    return (this.width < this.height ? 3 : 4) + (this.settings.mode === 'toddler' ? 1 : 0);
  }
  get scene() {
    return this.settings.toy;
  }
  configure(settings: Preferences) {
    const reset = settings.toy !== this.scene || settings.mode !== this.settings.mode;
    this.settings = { ...settings };
    if (reset) {
      this.cancelFingers();
      this.seed();
    }
  }
  resize(width: number, height: number) {
    const sx = Math.max(1, width) / this.width,
      sy = Math.max(1, height) / this.height;
    this.friends.forEach((f) => {
      f.x *= sx;
      f.y *= sy;
      f.homeX *= sx;
      f.homeY *= sy;
    });
    this.particles.forEach((p) => {
      p.x *= sx;
      p.y *= sy;
    });
    this.ribbons.forEach((r) =>
      r.points.forEach((p) => {
        p.x *= sx;
        p.y *= sy;
      }),
    );
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.friends.forEach((f) => {
      f.r = this.radius * (this.scene === 'peek' ? 1.25 : 1);
      f.x = clamp(f.x, f.r, this.width - f.r);
      f.y = clamp(f.y, f.r, this.height - f.r);
    });
    this.cancelFingers();
  }
  private friend(x: number, y: number, color?: number): Friend {
    const f = {
      id: ++this.nextId,
      x,
      y,
      homeX: x,
      homeY: y,
      vx: (this.rng() - 0.5) * 24,
      vy: 0,
      r: this.radius,
      color: color ?? this.nextColor++ % 6,
      phase: this.rng() * Math.PI * 2,
      awake: 0,
      growth: 0,
      targetGrowth: 0,
      rotation: 0,
      dragged: false,
      born: this.time,
    };
    this.friends.push(f);
    const maxFriends =
      this.scene === 'sea' ? (this.settings.mode === 'baby' ? 6 : 9) : LIMITS.friends;
    if (this.friends.length > maxFriends) {
      const removable = this.friends.findIndex((item) => !item.dragged && item.id !== f.id);
      if (removable >= 0) this.friends.splice(removable, 1);
    }
    return f;
  }
  private seed() {
    this.friends = [];
    this.particles = [];
    this.ribbons = [];
    this.nextColor = 0;
    this.nextReplenish = 0;
    const w = this.width,
      h = this.height,
      mobile = w < h;
    if (this.scene === 'sea') {
      const points = mobile
        ? [
            [0.26, 0.27],
            [0.73, 0.43],
            [0.3, 0.63],
            [0.72, 0.77],
          ]
        : [
            [0.2, 0.38],
            [0.4, 0.58],
            [0.58, 0.29],
            [0.76, 0.53],
            [0.87, 0.26],
          ];
      points.slice(0, this.seaCount).forEach(([x, y], i) => {
        const f = this.friend(w * x, h * y, i);
        f.r *= i % 2 ? 1.05 : 0.9;
      });
    } else if (this.scene === 'bounce') {
      [0, 1, 2, 3].forEach((i) => {
        const f = this.friend(w * (0.2 + i * 0.2), h * (0.3 + (i % 2) * 0.2), i);
        f.vy = 40;
      });
    } else if (this.scene === 'peek') {
      [0, 1, 2].forEach((i) => {
        const f = this.friend(
          w * (mobile ? 0.5 : 0.24 + i * 0.26),
          h * (mobile ? 0.27 + i * 0.255 : 0.58),
          i,
        );
        f.r = this.radius * 1.25;
      });
    } else if (this.scene === 'garden') {
      [0, 1, 2].forEach((i) => {
        const f = this.friend(
          w * (0.22 + i * 0.28),
          h * (mobile ? 0.63 + (i % 2) * 0.15 : 0.73),
          i,
        );
        f.r = this.radius;
      });
    } else if (this.scene === 'stars') {
      const points = mobile
        ? [
            [0.27, 0.26],
            [0.73, 0.31],
            [0.47, 0.49],
            [0.23, 0.67],
            [0.75, 0.73],
          ]
        : [
            [0.17, 0.45],
            [0.34, 0.3],
            [0.5, 0.57],
            [0.67, 0.34],
            [0.84, 0.54],
          ];
      points.forEach(([x, y], i) => this.friend(w * x, h * y, i));
    } else {
      const f = this.friend(w * 0.5, h * 0.52, 0);
      f.r = this.radius * 0.65;
      this.ribbon(
        [
          { x: w * 0.16, y: h * 0.62 },
          { x: w * 0.3, y: h * 0.38 },
          { x: w * 0.5, y: h * 0.52 },
          { x: w * 0.69, y: h * 0.35 },
          { x: w * 0.85, y: h * 0.57 },
        ],
        2,
        40,
      );
    }
  }
  private closest(p: Point, within = Infinity) {
    let match: Friend | undefined;
    let best = within;
    for (const f of this.friends) {
      const d = distance(p, f);
      if (d < best) {
        best = d;
        match = f;
      }
    }
    return match;
  }
  private addParticle(p: Particle) {
    this.particles.push(p);
    if (this.particles.length > LIMITS.particles)
      this.particles.splice(0, this.particles.length - LIMITS.particles);
  }
  private burst(p: Point, color: number, kind: Particle['kind'] = 'dot', count = 8) {
    const n = this.settings.calm ? Math.min(3, count) : count;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const speed = 35 + this.rng() * 100;
      const life = kind === 'fish' ? 3.6 : 1.2;
      this.addParticle({
        ...p,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life,
        maxLife: life,
        r: kind === 'fish' ? this.radius * 0.48 : 3 + this.rng() * 7,
        color,
        kind,
      });
    }
    this.addParticle({ ...p, vx: 0, vy: 0, life: 0.8, maxLife: 0.8, r: 24, color, kind: 'ring' });
  }
  private ribbon(points: Point[], color: number, life = 8) {
    const ribbon = {
      points: points.slice(-LIMITS.ribbonPoints),
      color,
      life,
      width: this.radius * 0.5,
    };
    this.ribbons.push(ribbon);
    if (this.ribbons.length > LIMITS.ribbons) this.ribbons.shift();
    return ribbon;
  }
  private activate(f: Friend) {
    this.interactions++;
    this.onSound(this.scene, f.color);
    if (this.scene === 'sea') {
      this.burst(f, f.color, 'dot', 10);
      this.burst(f, f.color, 'fish', 1);
      this.friends = this.friends.filter((item) => item.id !== f.id);
      this.discoveries++;
      this.nextReplenish = this.time + 0.3;
    } else if (this.scene === 'bounce') {
      f.vy = -Math.min(580, this.height * 0.65);
      f.vx = (this.rng() - 0.5) * 220;
      f.awake = 1.5;
      this.burst({ x: f.x, y: f.y + f.r }, f.color, 'dot', 4);
    } else if (this.scene === 'peek') {
      f.awake = 4.5;
      f.targetGrowth = 1;
      this.discoveries++;
      this.burst({ x: f.x, y: f.y - f.r }, f.color, 'heart', 4);
    } else if (this.scene === 'garden') {
      f.targetGrowth =
        f.targetGrowth >= 1
          ? 0
          : Math.min(1, f.targetGrowth + (this.settings.mode === 'baby' ? 0.5 : 0.34));
      f.awake = 2;
      this.burst({ x: f.x, y: f.y - f.r * 1.7 }, 2, 'drop', 6);
      if (f.targetGrowth === 1) {
        this.discoveries++;
        this.burst({ x: f.x, y: f.y - f.r * 2 }, f.color, 'heart', 4);
      }
    } else if (this.scene === 'stars') {
      f.awake = 2.2;
      this.discoveries++;
      this.burst(f, f.color, 'dot', 6);
      const previous = this.friends.find((item) => item.id !== f.id && item.awake > 0);
      if (previous)
        this.ribbon(
          [
            { x: previous.x, y: previous.y },
            { x: f.x, y: f.y },
          ],
          f.color,
          3,
        );
    }
  }
  keyboard() {
    // One visual response per distinct keydown, bounded during accidental event storms.
    if (this.time - this.lastKeyTime < 0.028) return;
    this.lastKeyTime = this.time;
    if (this.scene === 'paint') {
      this.interactions++;
      const color = this.nextColor++ % 6,
        w = this.width,
        h = this.height;
      const start = { x: w * (0.15 + this.rng() * 0.55), y: h * (0.25 + this.rng() * 0.45) };
      const points = Array.from({ length: 36 }, (_, i) => ({
        x: clamp(start.x + Math.sin(i * 0.17) * w * 0.22, 30, w - 30),
        y: clamp(start.y + Math.cos(i * 0.21) * h * 0.15, 80, h - 50),
      }));
      this.ribbon(points, color);
      this.burst(start, color, 'dot', 5);
      this.onSound(this.scene, color);
    } else if (this.scene === 'bounce') {
      this.interactions++;
      if (this.friends.length < (this.settings.mode === 'baby' ? 7 : 10)) {
        const f = this.friend(this.width * (0.2 + this.rng() * 0.6), this.height * 0.25);
        f.vy = -100;
        f.awake = 1;
        this.onSound(this.scene, f.color);
      } else this.activate(this.friends[Math.floor(this.rng() * this.friends.length)]);
    } else {
      if (!this.friends.length) this.friend(this.width * 0.5, this.height * 0.4);
      const available = this.friends.filter((f) => !f.dragged);
      const target =
        available.find((f) =>
          this.scene === 'peek'
            ? f.awake <= 0
            : this.scene === 'garden'
              ? f.targetGrowth < 1
              : f.awake <= 0,
        ) ?? available[this.interactions % available.length];
      if (target) this.activate(target);
    }
  }
  down(id: number, p: Point) {
    if (this.fingers.size >= LIMITS.fingers || this.fingers.has(id)) return;
    const finger: Finger = {
      ...p,
      start: { ...p },
      previous: { ...p },
      moved: 0,
      lastAction: this.time,
    };
    this.fingers.set(id, finger);
    if (this.scene === 'paint') {
      this.interactions++;
      finger.ribbon = this.ribbon([{ ...p }, { x: p.x + 1, y: p.y + 1 }], this.nextColor++ % 6);
      this.onSound(this.scene, finger.ribbon.color);
      return;
    }
    const near = this.closest(p);
    if (this.scene === 'bounce' || this.scene === 'sea') {
      let hit =
        near &&
        distance(near, p) < near.r * (this.settings.mode === 'baby' ? 1.65 : 1.25) &&
        !near.dragged
          ? near
          : undefined;
      if (!hit) {
        hit = this.friend(
          clamp(p.x, this.radius, this.width - this.radius),
          clamp(p.y, this.radius + 65, this.height - this.radius),
          this.nextColor++ % 6,
        );
        this.interactions++;
        this.onSound(this.scene, hit.color);
      }
      finger.friend = hit.id;
      hit.dragged = true;
      hit.awake = 1.5;
      return;
    }
    if (near) {
      this.activate(near);
      finger.lastFriend = near.id;
    }
  }
  move(id: number, p: Point) {
    const finger = this.fingers.get(id);
    if (!finger) return;
    const delta = distance(finger, p);
    finger.moved += delta;
    finger.previous = { x: finger.x, y: finger.y };
    finger.x = p.x;
    finger.y = p.y;
    const held = this.friends.find((f) => f.id === finger.friend);
    if (held) {
      held.vx = clamp((p.x - finger.previous.x) * 35, -600, 600);
      held.vy = clamp((p.y - finger.previous.y) * 35, -600, 600);
      held.x = clamp(p.x, held.r, this.width - held.r);
      held.y = clamp(p.y, held.r + 35, this.height - held.r);
      held.awake = 1.5;
    }
    if (this.scene === 'paint' && finger.ribbon && delta > 2) {
      finger.ribbon.points.push({ ...p });
      if (finger.ribbon.points.length > LIMITS.ribbonPoints) finger.ribbon.points.shift();
      finger.ribbon.life = 8;
      if (this.time - finger.lastAction > 0.16) {
        this.interactions++;
        this.onSound(this.scene, finger.ribbon.color);
        finger.lastAction = this.time;
      }
    } else if (
      (this.scene === 'garden' || this.scene === 'stars' || this.scene === 'peek') &&
      this.time - finger.lastAction > 0.25
    ) {
      const near = this.closest(p);
      if (near && near.id !== finger.lastFriend && distance(near, p) < near.r * 2) {
        this.activate(near);
        finger.lastFriend = near.id;
        finger.lastAction = this.time;
      }
    } else if (this.scene === 'sea' && delta > 3 && this.time - finger.lastAction > 0.23) {
      this.burst(p, this.nextColor++ % 6, 'dot', 2);
      finger.lastAction = this.time;
    }
  }
  up(id: number, cancelled = false) {
    const finger = this.fingers.get(id);
    if (!finger) return;
    const held = this.friends.find((f) => f.id === finger.friend);
    if (held) {
      held.dragged = false;
      if (!cancelled) {
        if (finger.moved < 18) this.activate(held);
        else {
          this.interactions++;
          this.onSound(this.scene, held.color);
          held.homeX = held.x;
          held.homeY = held.y;
        }
      } else {
        held.vx = 0;
        held.vy = 0;
      }
    }
    this.fingers.delete(id);
  }
  cancelFingers() {
    for (const id of this.fingers.keys()) this.up(id, true);
  }
  scroll(delta: number) {
    if (Math.abs(delta) < 1) return;
    if (this.scene === 'paint') {
      this.keyboard();
      return;
    }
    if (this.scene === 'sea' || this.scene === 'bounce') {
      for (const f of this.friends) {
        if (!f.dragged) {
          f.vy = clamp(f.vy - delta * 0.55, -400, 400);
          f.awake = 0.6;
        }
      }
    }
    this.keyboard();
  }
  step(rawDt: number) {
    const dt = clamp(rawDt, 0, 0.04);
    this.time += dt;
    for (const f of this.friends) {
      f.awake = Math.max(0, f.awake - dt);
      f.growth += (f.targetGrowth - f.growth) * Math.min(1, dt * 5);
      if (this.scene === 'peek' && f.awake === 0) f.targetGrowth = 0;
      if (f.dragged) continue;
      if (this.scene === 'bounce') {
        f.vy += Math.min(900, this.height * 1.3) * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        const floor = this.height * 0.88 - f.r;
        if (f.y > floor) {
          if (f.vy > 180 && this.interactions > 0) this.onSound(this.scene, f.color);
          f.y = floor;
          f.vy = -Math.abs(f.vy) * 0.72;
          f.vx *= 0.97;
          if (Math.abs(f.vy) < 22) f.vy = 0;
        }
        if (f.y < f.r + 45) {
          f.y = f.r + 45;
          f.vy = Math.abs(f.vy) * 0.6;
        }
        if (f.x < f.r) {
          f.x = f.r;
          f.vx = Math.abs(f.vx) * 0.8;
        }
        if (f.x > this.width - f.r) {
          f.x = this.width - f.r;
          f.vx = -Math.abs(f.vx) * 0.8;
        }
        f.vx *= Math.pow(0.996, dt * 60);
        f.rotation += f.vx * dt * 0.002;
      } else if (this.scene === 'sea') {
        const speed = this.settings.calm ? 0 : 1;
        f.x += (Math.sin(this.time * 0.4 + f.phase) * 5 * speed + f.vx) * dt;
        f.y += (Math.cos(this.time * 0.5 + f.phase) * 10 * speed + f.vy) * dt;
        f.vx *= Math.pow(0.92, dt * 60);
        f.vy *= Math.pow(0.92, dt * 60);
        f.x = clamp(f.x, f.r + 5, this.width - f.r - 5);
        f.y = clamp(f.y, f.r + 85, this.height - f.r - 35);
      }
    }
    if (this.scene === 'bounce') this.collide();
    if (
      this.scene === 'sea' &&
      this.time > this.nextReplenish &&
      this.friends.length < this.seaCount
    ) {
      const r = this.radius;
      let point = { x: this.width * 0.5, y: this.height * 0.5 };
      for (let i = 0; i < 16; i++) {
        point = {
          x: r + this.rng() * (this.width - r * 2),
          y: this.height * (0.23 + this.rng() * 0.48),
        };
        if (!this.friends.some((f) => distance(f, point) < f.r + r + 15)) break;
      }
      this.friend(point.x, point.y);
      this.nextReplenish = this.time + 0.65;
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'drop') p.vy += 200 * dt;
      else if (p.kind === 'fish') p.vx += (p.vx >= 0 ? 1 : -1) * 25 * dt;
      else {
        p.vx *= 0.985;
        p.vy *= 0.985;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const r of this.ribbons) r.life -= dt;
    this.ribbons = this.ribbons.filter(
      (r) => r.life > 0 || [...this.fingers.values()].some((f) => f.ribbon === r),
    );
  }
  private collide() {
    for (let i = 0; i < this.friends.length; i++)
      for (let j = i + 1; j < this.friends.length; j++) {
        const a = this.friends[i],
          b = this.friends[j],
          dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.hypot(dx, dy),
          min = (a.r + b.r) * 0.88;
        if (d >= min) continue;
        const nx = d < 0.001 ? 1 : dx / d,
          ny = d < 0.001 ? 0 : dy / d,
          overlap = min - d;
        if (!a.dragged) {
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
        }
        if (!b.dragged) {
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
        }
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relative < 0) {
          const impulse = -relative * 0.72;
          if (!a.dragged) {
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
          }
          if (!b.dragged) {
            b.vx += impulse * nx;
            b.vy += impulse * ny;
          }
        }
      }
    for (const f of this.friends) {
      f.x = clamp(f.x, f.r, this.width - f.r);
      f.y = clamp(f.y, f.r + 45, this.height * 0.88 - f.r);
      f.vx = clamp(f.vx, -700, 700);
      f.vy = clamp(f.vy, -700, 700);
    }
  }
}
