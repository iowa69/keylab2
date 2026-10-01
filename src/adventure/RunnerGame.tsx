import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import * as THREE from 'three';
import { Animal, Cone, Planet, Star } from './Art';
import { playTone, speak } from './audio';
import type { GameProps } from './types';
import {
  advanceRunner,
  createRunnerState,
  jumpRunner,
  runnerIslands,
  steerRunner,
  type RunnerState,
} from './runnerModel';
import './runner.css';

type RunnerView = ReturnType<typeof snapshot>;

function snapshot(state: RunnerState) {
  return {
    stars: state.stars,
    island: state.island,
    gate: state.gate,
    x: state.x,
    jump: state.jump,
    time: state.time,
    items: state.items.map((item) => ({ ...item })),
  };
}

function buildWorld(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(53, 1, 0.1, 160);
  camera.position.set(0, 7.1, 13.8);
  // Look slightly down the road so the explorer stays above the touch controls.
  camera.lookAt(0, -2.2, -15);
  scene.add(new THREE.HemisphereLight('#fff9e9', '#93b7b7', 2.4));
  const sun = new THREE.DirectionalLight('#fff2d5', 2.3);
  sun.position.set(-12, 20, 10);
  scene.add(sun);

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Map<string, THREE.Material>();
  const shape = <T extends THREE.BufferGeometry>(value: T) => {
    geometries.add(value);
    return value;
  };
  const ball = shape(new THREE.SphereGeometry(1, 16, 12));
  const cube = shape(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = shape(new THREE.CylinderGeometry(1, 1, 1, 12));
  const cone = shape(new THREE.ConeGeometry(1, 1, 10));
  const disk = shape(new THREE.CircleGeometry(1, 24));
  const arc = shape(new THREE.TorusGeometry(1, 0.045, 7, 32, Math.PI));
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? 0.65 : 0.31;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeometry = shape(
    new THREE.ExtrudeGeometry(starShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    }),
  );
  const material = (color: string, flat = false, opacity = 1) => {
    const key = `${color}:${flat}:${opacity}`;
    let value = materials.get(key);
    if (!value) {
      value = flat
        ? new THREE.MeshBasicMaterial({
            color,
            transparent: opacity < 1,
            opacity,
            depthWrite: opacity === 1,
          })
        : new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0 });
      materials.set(key, value);
    }
    return value;
  };
  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    color: string,
    position: number[],
    scale: number[],
    flat = false,
    opacity = 1,
  ) => {
    const value = new THREE.Mesh(geometry, material(color, flat, opacity));
    value.position.set(position[0], position[1], position[2]);
    value.scale.set(scale[0], scale[1], scale[2]);
    parent.add(value);
    return value;
  };

  const sea = mesh(scene, cube, '#8ed6e3', [0, -0.65, -43], [200, 0.6, 200]);
  const island = mesh(scene, cube, '#7dcfa3', [0, -0.2, -43], [26, 0.65, 135]);
  const road = mesh(scene, cube, '#ffe5a6', [0, 0.16, -43], [7.65, 0.14, 135]);
  const lines: THREE.Mesh[] = [];
  for (let i = 0; i < 27; i++) {
    for (const x of [-1.075, 1.075])
      lines.push(mesh(scene, cube, '#fff9df', [x, 0.25, -i * 4], [0.085, 0.015, 1.6]));
  }
  mesh(scene, cube, '#fff4ca', [-3.9, 0.3, -43], [0.18, 0.28, 135]);
  mesh(scene, cube, '#fff4ca', [3.9, 0.3, -43], [0.18, 0.28, 135]);

  const decor: {
    group: THREE.Group;
    index: number;
    foliage: THREE.Mesh[];
    accent: THREE.Mesh;
    trunk: THREE.Mesh;
  }[] = [];
  for (let i = 0; i < 24; i++) {
    const group = new THREE.Group();
    const side = i % 2 ? 1 : -1;
    group.position.set(side * (5.1 + (i % 3) * 1.6), 0, -i * 4.6);
    const size = 0.8 + (i % 3) * 0.19;
    group.scale.setScalar(size);
    const trunk = mesh(group, cylinder, '#cda179', [0, 1.1, 0], [0.22, 2.1, 0.22]);
    const foliage = [
      mesh(group, ball, '#40aa83', [0, 2.8, 0], [1.2, 1.2, 1]),
      mesh(group, ball, '#40aa83', [-0.6, 2.35, 0], [0.8, 0.75, 0.8]),
      mesh(group, ball, '#40aa83', [0.7, 2.4, 0], [0.8, 0.8, 0.7]),
    ];
    const accent = mesh(group, ball, '#f28a63', [0.45, 2.5, 0.85], [0.22, 0.28, 0.22]);
    const shadow = mesh(group, disk, '#365f65', [0, 0.18, 0], [1.2, 0.8, 1], true, 0.1);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(group);
    decor.push({ group, index: i, foliage, accent, trunk });
  }

  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 7; i++) {
    const cloud = new THREE.Group();
    cloud.position.set((i % 2 ? -1 : 1) * (10 + i * 3), 9 + (i % 3), -20 - i * 11);
    mesh(cloud, ball, '#fffaf1', [0, 0, 0], [3, 0.65, 1]);
    mesh(cloud, ball, '#fffaf1', [-0.9, 0.4, 0], [1.3, 1, 1]);
    mesh(cloud, ball, '#fffaf1', [0.9, 0.25, 0], [1.35, 0.85, 1]);
    clouds.push(cloud);
    scene.add(cloud);
  }
  const sunBall = mesh(scene, ball, '#ffe8a3', [-18, 14, -62], [4, 4, 4], true);
  for (let i = 0; i < 5; i++) {
    mesh(
      scene,
      ball,
      i % 2 ? '#86cdb9' : '#a3dcca',
      [(i - 2) * 14, 0, -87 - (i % 2) * 9],
      [10, 9 + (i % 3) * 2, 8],
    );
  }

  const player = new THREE.Group();
  player.position.z = 3;
  scene.add(player);
  const shadow = mesh(scene, disk, '#355a64', [0, 0.265, 3], [1.3, 1.5, 1], true, 0.15);
  shadow.rotation.x = -Math.PI / 2;
  mesh(player, ball, '#ffc968', [0, 0.72, 0], [0.85, 0.39, 1.3]);
  mesh(player, ball, '#ed9160', [0, 0.8, 0.92], [0.85, 0.38, 0.4]);
  mesh(player, ball, '#fff0bb', [0, 0.98, -0.63], [0.72, 0.25, 0.6]);
  for (const x of [-0.82, 0.82]) {
    for (const z of [-0.7, 0.7]) {
      const wheel = mesh(player, cylinder, '#4d586d', [x, 0.49, z], [0.37, 0.25, 0.37]);
      wheel.rotation.z = Math.PI / 2;
      const hub = mesh(player, cylinder, '#ffe1a1', [x * 1.17, 0.49, z], [0.18, 0.025, 0.18]);
      hub.rotation.z = Math.PI / 2;
    }
  }
  // A tiny bunny guide rides with the child.
  mesh(player, ball, '#fff4df', [0, 1.62, 0.08], [0.5, 0.52, 0.42]);
  for (const x of [-0.24, 0.24]) {
    const ear = mesh(player, ball, '#fff4df', [x, 2.2, 0.08], [0.16, 0.43, 0.16]);
    ear.rotation.z = x * -0.7;
    mesh(player, ball, '#f3b0ab', [x, 2.2, 0.22], [0.08, 0.29, 0.035]);
    mesh(player, ball, '#334356', [x * 0.68, 1.68, 0.455], [0.035, 0.052, 0.03]);
  }
  mesh(player, ball, '#ef967e', [0, 1.5, 0.485], [0.068, 0.045, 0.026]);
  const pennant = mesh(player, cone, '#63c6be', [0.75, 1.83, 0.75], [0.28, 0.5, 0.06]);
  pennant.rotation.z = -Math.PI / 2;
  mesh(player, cylinder, '#fff4da', [0.64, 1.36, 0.75], [0.025, 1.65, 0.025]);

  const gate = new THREE.Group();
  for (const [i, color] of ['#ef9f9b', '#f8c76f', '#a1d6aa', '#7bc9d2', '#b9ace0'].entries()) {
    const scale = 3.8 + i * 0.22;
    mesh(gate, arc, color, [0, 0.55, 0], [scale, scale, scale]);
    for (const side of [-1, 1])
      mesh(gate, cylinder, color, [side * scale, 0.4, 0], [0.12, 0.8, 0.12]);
  }
  scene.add(gate);
  const items = new Map<number, THREE.Group>();
  let currentIsland = -1;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height));
    camera.aspect = Math.max(1, width) / Math.max(1, height);
    camera.fov = width < 600 ? 67 : 53;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  return {
    render(state: RunnerState, calm: boolean) {
      if (state.island !== currentIsland) {
        currentIsland = state.island;
        const colors = runnerIslands[state.island];
        scene.background = new THREE.Color(colors.sky);
        scene.fog = new THREE.Fog(colors.sky, 30, 105);
        island.material = material(colors.ground);
        road.material = material(colors.road);
        sea.material = material(state.island === 2 ? '#858fc5' : '#8ed6e3');
        sunBall.material = material(state.island === 2 ? '#fff4dd' : '#ffe8a3', true);
        for (const tree of decor) {
          for (const top of tree.foliage) top.material = material(colors.tree);
          tree.accent.material = material(colors.detail);
          tree.trunk.material = material(state.island === 1 ? '#fff0ce' : '#cda179');
        }
      }
      player.position.x = state.x;
      player.position.y = state.jump + (calm ? 0 : Math.sin(state.time * 8) * 0.025);
      player.rotation.z = (state.x - (state.lane - 1) * 2.15) * 0.055;
      shadow.position.x = state.x;
      shadow.scale.set(1.3 - state.jump * 0.12, 1.5 - state.jump * 0.12, 1);
      for (let i = 0; i < lines.length; i++)
        lines[i].position.z = 9 - ((Math.floor(i / 2) * 4 - (state.distance % 108) + 108) % 108);
      for (const tree of decor)
        tree.group.position.z =
          13 - ((tree.index * 4.6 - (state.distance % 110.4) + 110.4) % 110.4);
      if (!calm)
        clouds.forEach((cloud, i) => {
          cloud.position.y = 9 + (i % 3) + Math.sin(state.time * 0.3 + i) * 0.15;
        });
      const active = new Set(state.items.map((item) => item.id));
      for (const [id, item] of items)
        if (!active.has(id)) {
          scene.remove(item);
          items.delete(id);
        }
      for (const item of state.items) {
        let group = items.get(item.id);
        if (!group) {
          group = new THREE.Group();
          if (item.kind === 'star') {
            mesh(group, starGeometry, '#ffd167', [0, 1.15, 0], [1, 1, 1]);
            for (const x of [-0.15, 0.15])
              mesh(group, ball, '#9c7339', [x, 1.19, 0.235], [0.032, 0.045, 0.03]);
          } else {
            mesh(group, ball, '#ad96ce', [0, 0.5, 0], [0.73, 0.47, 0.6]);
            mesh(group, ball, '#c5b1df', [-0.21, 0.65, 0.25], [0.23, 0.13, 0.23]);
          }
          const itemShadow = mesh(
            group,
            disk,
            '#6f7261',
            [0, 0.255, 0],
            [0.63, 0.44, 1],
            true,
            0.13,
          );
          itemShadow.rotation.x = -Math.PI / 2;
          items.set(item.id, group);
          scene.add(group);
        }
        group.position.set(item.x, 0, item.z);
        if (item.kind === 'star' && !calm)
          group.children[0].rotation.y = Math.sin(state.time * 2 + item.id) * 0.3;
      }
      gate.position.z = state.gate ?? -77;
      renderer.render(scene, camera);
    },
    dispose() {
      observer.disconnect();
      for (const geometry of geometries) geometry.dispose();
      for (const value of materials.values()) value.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

function IslandArt({ island }: { island: number }) {
  if (island === 1) return <Cone style={{ width: '100%', height: '100%' }} />;
  if (island === 2) return <Planet index={5} style={{ width: '100%', height: '100%' }} />;
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden="true">
      <rect x="43" y="40" width="14" height="53" rx="6" fill="#bd9770" />
      <path
        d="M17 46q-12-25 15-30Q43-9 63 14q26-1 23 26 11 23-16 28H35Q8 66 17 46"
        fill="#5aa981"
      />
      <circle cx="67" cy="45" r="7" fill="#ecab76" />
    </svg>
  );
}

function RainbowArt() {
  return (
    <svg viewBox="0 0 100 65" style={{ width: '100%', height: '100%' }} aria-hidden="true">
      {['#e49a93', '#edbc6f', '#a8c58c', '#86bfc7', '#b0a3cf'].map((color, i) => (
        <path
          key={color}
          d={`M${8 + i * 8} 61a${42 - i * 8} ${42 - i * 8} 0 0 1 ${84 - i * 16} 0`}
          fill="none"
          stroke={color}
          strokeWidth="8"
        />
      ))}
    </svg>
  );
}

function FlatWorld({ view }: { view: RunnerView }) {
  const colors = runnerIslands[view.island];
  return (
    <div
      className="runner-flat-world"
      aria-hidden="true"
      style={
        {
          '--runner-sky': colors.sky,
          '--runner-ground': colors.ground,
          '--runner-road': colors.road,
        } as CSSProperties
      }
    >
      <div className="runner-flat-sun" />
      <div className="runner-flat-cloud runner-flat-cloud-one" />
      <div className="runner-flat-cloud runner-flat-cloud-two" />
      <div className="runner-flat-land" />
      <div className="runner-flat-road" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          className="runner-flat-tree"
          key={i}
          style={{
            left: `${i % 2 ? 84 : 5}%`,
            top: `${42 + Math.floor(i / 2) * 14}%`,
            transform: `scale(${0.6 + Math.floor(i / 2) * 0.27})`,
          }}
        >
          <IslandArt island={view.island} />
        </div>
      ))}
      <div className={`runner-flat-gate ${view.gate !== null ? 'is-open' : ''}`}>
        <RainbowArt />
      </div>
      {view.items.map((item) => {
        const perspective = Math.min(1.4, 12 / (16 - item.z));
        return (
          <div
            className="runner-flat-object"
            key={item.id}
            style={{
              left: `${50 + item.x * 14 * perspective}%`,
              top: `${35 + 52 * perspective}%`,
              transform: `translate(-50%, -50%) scale(${perspective * 1.4})`,
            }}
          >
            {item.kind === 'star' ? (
              <Star />
            ) : (
              <svg viewBox="0 0 100 85" aria-hidden="true">
                <path d="m12 58 11-32 31-14 28 17 10 32-15 13H27z" fill="#a695bd" />
                <path d="m27 31 20-10 10 8-11 13-17 1z" fill="#c4b8d7" />
              </svg>
            )}
          </div>
        );
      })}
      <div
        className="runner-flat-player"
        style={{ left: `${50 + view.x * 12}%`, transform: `translate(-50%, ${-view.jump * 38}px)` }}
      >
        <svg viewBox="0 0 130 130" aria-hidden="true">
          <Animal kind="bunny" x="31" y="-3" width="68" height="77" />
          <path d="m33 52-12 31h88L97 52" fill="#ffd184" />
          <rect x="16" y="73" width="98" height="35" rx="15" fill="#eda572" />
          <rect x="26" y="83" width="77" height="19" rx="9" fill="#f6bd85" />
          <rect x="13" y="87" width="16" height="33" rx="6" fill="#526272" />
          <rect x="102" y="87" width="16" height="33" rx="6" fill="#526272" />
          <circle cx="40" cy="86" r="6" fill="#fff1ce" />
          <circle cx="88" cy="86" r="6" fill="#fff1ce" />
        </svg>
      </div>
    </div>
  );
}

export function RunnerGame({ settings, paused, onCelebrate }: GameProps) {
  const worldHost = useRef<HTMLDivElement>(null);
  const model = useRef(createRunnerState());
  const latest = useRef({ settings, paused, onCelebrate });
  latest.current = { settings, paused, onCelebrate };
  const [view, setView] = useState(() => snapshot(model.current));
  const [flat, setFlat] = useState(false);
  const [caption, setCaption] = useState('Find five stars!');
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);

  const action = (direction: 'left' | 'right' | 'jump') => {
    const current = latest.current;
    if (current.paused || document.hidden) return;
    if (direction === 'jump') {
      if (jumpRunner(model.current)) playTone(4, current.settings, 0.1);
    } else {
      steerRunner(model.current, direction === 'left' ? -1 : 1);
      playTone(direction === 'left' ? 0 : 2, current.settings, 0.07);
    }
  };
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    const host = worldHost.current;
    if (!host) return;
    let world: ReturnType<typeof buildWorld> | null = null;
    let disposed = false;
    try {
      world = buildWorld(host);
      setFlat(false);
    } catch {
      // The same game stays playable on older devices and browsers without WebGL.
      host.replaceChildren();
      setFlat(true);
    }
    let raf = 0;
    let previous = performance.now();
    let lastPaint = 0;
    let messageUntil = 0;
    const loseContext = (event: Event) => {
      event.preventDefault();
      world?.dispose();
      world = null;
      setFlat(true);
    };
    const canvas = host.querySelector('canvas');
    canvas?.addEventListener('webglcontextlost', loseContext);
    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const current = latest.current;
      if (!current.paused && !document.hidden) {
        const state = model.current;
        const event = advanceRunner(
          state,
          dt,
          current.settings.mode === 'baby',
          current.settings.calm,
        );
        if (event.collected) {
          playTone(state.stars + 1, current.settings, 0.16);
          setCaption(`${state.stars} ${state.stars === 1 ? 'star' : 'stars'}!`);
          speak(String(state.stars), current.settings);
          messageUntil = state.time + 1.6;
        }
        if (event.openedGate) {
          setCaption('Rainbow ready!');
          messageUntil = state.time + 6;
          current.onCelebrate('Five stars! A new island!');
          speak('Five stars! Follow the rainbow!', current.settings);
        }
        if (event.newIsland) {
          setCaption(runnerIslands[state.island].name);
          speak(runnerIslands[state.island].name, current.settings);
          messageUntil = state.time + 2.5;
        }
        if (event.bumped) {
          setCaption('Boing! Keep exploring!');
          messageUntil = state.time + 1.7;
        }
        if (messageUntil > 0 && state.time > messageUntil) {
          messageUntil = 0;
          setCaption(state.gate === null ? 'Find five stars!' : 'Through the rainbow!');
        }
        world?.render(state, current.settings.calm);
        if (now - lastPaint > 65) {
          setView(snapshot(state));
          lastPaint = now;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    world?.render(model.current, latest.current.settings.calm);
    raf = requestAnimationFrame(tick);

    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || latest.current.paused)
        return;
      const target = event.target instanceof Element ? event.target : null;
      const ownButton = target?.closest('[data-runner-control]');
      if (target?.closest('input, select, textarea, [contenteditable="true"]')) return;
      if (target?.closest('button, a, [data-ui]') && !ownButton) return;
      if (ownButton && (event.key === ' ' || event.key === 'Enter')) return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault();
        actionRef.current('left');
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault();
        actionRef.current('right');
      } else if (event.key.length === 1 || event.key === 'ArrowUp' || event.key === 'Enter') {
        event.preventDefault();
        actionRef.current('jump');
      }
    };
    window.addEventListener('keydown', keyDown);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', keyDown);
      canvas?.removeEventListener('webglcontextlost', loseContext);
      world?.dispose();
    };
  }, []);

  const finishPointer = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId || paused) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
      action(dx < 0 ? 'left' : 'right');
    } else if (dy < -25) {
      action('jump');
    } else {
      const bounds = event.currentTarget.getBoundingClientRect();
      const part = (event.clientX - bounds.left) / bounds.width;
      action(part < 0.3 ? 'left' : part > 0.7 ? 'right' : 'jump');
    }
  };

  return (
    <section
      className={`runner-game ${settings.calm ? 'runner-is-calm' : ''} ${settings.contrast ? 'runner-high-contrast' : ''}`}
      aria-label="Rainbow run"
      data-testid="runner-game"
    >
      <div className="runner-world" ref={worldHost} />
      {flat && <FlatWorld view={view} />}
      <div
        className="runner-play-surface"
        aria-label="Swipe to steer. Tap the middle to jump."
        role="application"
        tabIndex={0}
        onPointerDown={(event) => {
          if (paused) return;
          pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={finishPointer}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      />
      <div className="runner-heading">
        <span className="runner-island-badge">
          <span aria-hidden="true">
            <IslandArt island={view.island} />
          </span>
          {runnerIslands[view.island].name}
        </span>
        <h2>Rainbow run</h2>
        <p>{caption}</p>
      </div>
      <div className="runner-goal" role="status" aria-label={`${view.stars} of 5 stars collected`}>
        <span className="runner-goal-stars" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={i < view.stars ? 'is-collected' : ''}>
              ★
            </span>
          ))}
        </span>
        <span className="runner-goal-count">
          {view.stars}
          <small>/5</small>
          <span className="runner-small-rainbow" aria-hidden="true">
            <RainbowArt />
          </span>
        </span>
      </div>
      <div className="runner-controls" aria-label="Driving controls">
        <button
          type="button"
          aria-label="Move left"
          data-runner-control
          disabled={paused}
          onClick={() => action('left')}
        >
          <span aria-hidden="true">←</span>
          <small>Left</small>
        </button>
        <button
          type="button"
          className="runner-jump"
          aria-label="Jump"
          data-runner-control
          disabled={paused}
          onClick={() => action('jump')}
        >
          <span aria-hidden="true">↟</span>
          <small>Jump!</small>
        </button>
        <button
          type="button"
          aria-label="Move right"
          data-runner-control
          disabled={paused}
          onClick={() => action('right')}
        >
          <span aria-hidden="true">→</span>
          <small>Right</small>
        </button>
      </div>
      <div className="runner-key-hint" aria-hidden="true">
        ← → steer · space to hop
      </div>
      {paused && (
        <div className="runner-paused" aria-label="Adventure paused">
          <span>
            <svg viewBox="0 0 100 65" aria-hidden="true">
              <path
                d="M17 50q-22-15-4-31 9-8 21-3 18-28 39 1 30-1 22 26-4 12-22 10z"
                fill="#fffaf0"
              />
            </svg>
          </span>
          Taking a little pause
        </div>
      )}
    </section>
  );
}
