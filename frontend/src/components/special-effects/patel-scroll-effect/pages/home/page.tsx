import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";

const SHOW_NAVBAR = false;

interface Particle {
  x: number;
  y: number;
  // A target
  ax: number;
  ay: number;
  aAngle: number;
  aColor: [number, number, number];
  aSize: number;
  aDepth: number;
  // B target
  bx: number;
  by: number;
  bAngle: number;
  bColor: [number, number, number];
  bSize: number;
  bDepth: number;
}

interface SamplePoint {
  x: number;
  y: number;
  angle: number;
  color: [number, number, number];
  size: number;
  depth: number;
}

const IMG_A_URL =
  "https://storage.readdy-site.link/project_files/31e3b409-daf9-46c0-9b9c-6c396aa1afd9/822bd24e-51c5-4b7f-b448-1d8207fc8348_compressed_222.webp";
const IMG_B_URL =
  "https://static.readdy.ai/image/ef1aae41220ad17a1705abffff22a58b/09bb5c062f65345678437229f1c45806.png";

const SAMPLE_STEP = 4;
const MAX_SPREAD = 420;
const PARALLAX = 0.006;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function sampleImage(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  centerX: number,
  centerY: number,
  colorMode: "A" | "B"
): { points: SamplePoint[]; cx: number; cy: number } {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(targetW));
  off.height = Math.max(1, Math.floor(targetH));
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { points: [], cx: centerX, cy: centerY };
  ctx.clearRect(0, 0, off.width, off.height);
  ctx.drawImage(img, 0, 0, off.width, off.height);
  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, off.width, off.height);
  } catch (e) {
    return { points: [], cx: centerX, cy: centerY };
  }
  const px = data.data;

  // First pass: collect raw points to compute centroid
  const raw: { x: number; y: number; r: number; g: number; b: number; darkness: number }[] = [];
  for (let y = 0; y < off.height; y += SAMPLE_STEP) {
    for (let x = 0; x < off.width; x += SAMPLE_STEP) {
      const idx = (y * off.width + x) * 4;
      const r = px[idx];
      const g = px[idx + 1];
      const b = px[idx + 2];
      const a = px[idx + 3];
      if (a < 30) continue;
      if (r > 250 && g > 250 && b > 250) continue;
      const brightness = (r + g + b) / 3 / 255;
      if (brightness > 0.9 && Math.random() < 0.5) continue;
      const darkness = 1 - brightness;
      raw.push({ x, y, r, g, b, darkness });
    }
  }
  if (!raw.length) return { points: [], cx: centerX, cy: centerY };

  // Compute centroid in image space
  let sx = 0;
  let sy = 0;
  for (const p of raw) {
    sx += p.x;
    sy += p.y;
  }
  const localCx = sx / raw.length;
  const localCy = sy / raw.length;

  // Offset so centroid maps to centerX/centerY
  const offsetX = centerX - localCx;
  const offsetY = centerY - localCy;

  const points: SamplePoint[] = raw.map((p) => {
    const worldX = p.x + offsetX;
    const worldY = p.y + offsetY;
    const baseAngle = Math.atan2(p.y - localCy, p.x - localCx);
    const jitter = (Math.random() - 0.5) * (Math.PI / 1.8);
    const angle = baseAngle + jitter;
    const depth = p.darkness * 0.7 + Math.random() * 0.3;

    let color: [number, number, number];
    if (colorMode === "A") {
      // Blue palette by darkness segments
      if (p.darkness > 0.55) {
        color = [29, 78, 216]; // dark blue #1d4ed8
      } else if (p.darkness > 0.25) {
        color = [37, 99, 235]; // medium blue #2563eb
      } else {
        color = [59, 130, 246]; // light blue #3b82f6
      }
    } else {
      // B: keep watercolor, brighten + saturate
      const mx = Math.max(p.r, p.g, p.b);
      const mn = Math.min(p.r, p.g, p.b);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      const boost = 1 + (1 - sat) * 0.15;
      let rr = p.r * boost;
      let gg = p.g * boost;
      let bb = p.b * boost;
      // Warm yellowish areas: r>200 & g>150 & b<150
      if (p.r > 200 && p.g > 150 && p.b < 150) {
        rr = Math.min(255, rr * 1.08 + 8);
        gg = Math.min(255, gg * 1.02 + 4);
        bb = Math.max(0, bb * 0.92);
      }
      color = [
        Math.min(255, Math.max(0, rr)),
        Math.min(255, Math.max(0, gg)),
        Math.min(255, Math.max(0, bb)),
      ];
    }

    const size = 0.8 + depth * 1.6;

    return {
      x: worldX,
      y: worldY,
      angle,
      color,
      size,
      depth,
    };
  });

  return { points, cx: centerX, cy: centerY };
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const centerARef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const centerBRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const imagesRef = useRef<{ a: HTMLImageElement | null; b: HTMLImageElement | null }>({
    a: null,
    b: null,
  });

  // Resample particles based on current viewport
  const buildParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const imgA = imagesRef.current.a;
    const imgB = imagesRef.current.b;
    if (!imgA || !imgB) return;

    // A image — slightly smaller, kept on the right
    const aTargetW = Math.min(w * 0.54, 680);
    const aRatio = imgA.naturalHeight / imgA.naturalWidth;
    const aTargetH = aTargetW * aRatio;
    const aCenterX = w * 0.7;
    const aCenterY = h * 0.5;

    // B image — slightly larger, placed on the right side but not too far
    const bBase = Math.min(w * 0.7, 880);
    const bTargetW = bBase * 1.18;
    const bRatio = imgB.naturalHeight / imgB.naturalWidth;
    const bTargetH = bTargetW * bRatio;
    const bCenterX = w * 0.72;
    const bCenterY = h * 0.5;

    const aResult = sampleImage(imgA, aTargetW, aTargetH, aCenterX, aCenterY, "A");
    const bResult = sampleImage(imgB, bTargetW, bTargetH, bCenterX, bCenterY, "B");

    centerARef.current = { x: aResult.cx, y: aResult.cy };
    centerBRef.current = { x: bResult.cx, y: bResult.cy };

    const aPts = aResult.points;
    const bPts = bResult.points;
    if (!aPts.length || !bPts.length) {
      particlesRef.current = [];
      return;
    }

    const longer = aPts.length >= bPts.length ? aPts : bPts;
    const shorter = aPts.length >= bPts.length ? bPts : aPts;
    const longerIsA = aPts.length >= bPts.length;

    const particles: Particle[] = new Array(longer.length);
    for (let i = 0; i < longer.length; i++) {
      const lp = longer[i];
      const sp = shorter[i % shorter.length];
      const aP = longerIsA ? lp : sp;
      const bP = longerIsA ? sp : lp;
      particles[i] = {
        x: aP.x,
        y: aP.y,
        ax: aP.x,
        ay: aP.y,
        aAngle: aP.angle,
        aColor: aP.color,
        aSize: aP.size,
        aDepth: aP.depth,
        bx: bP.x,
        by: bP.y,
        bAngle: bP.angle,
        bColor: bP.color,
        bSize: bP.size,
        bDepth: bP.depth,
      };
    }
    particlesRef.current = particles;
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scrollMax = document.documentElement.scrollHeight - h;
    const rawProgress = scrollMax > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollMax)) : 0;

    // Ghosting overlay
    ctx.fillStyle = "rgba(252,252,252,0.18)";
    ctx.fillRect(0, 0, w, h);

    const particles = particlesRef.current;
    const cA = centerARef.current;
    const cB = centerBRef.current;
    const mouse = mouseRef.current;
    const breath = 1 - Math.abs(rawProgress - 0.5) * 0.3;

    let phase = 0;
    let phaseT = 0;
    if (rawProgress < 0.5) {
      phase = 1;
      phaseT = rawProgress / 0.5;
    } else {
      phase = 2;
      phaseT = (rawProgress - 0.5) / 0.5;
    }
    const smT = smoothstep(phaseT);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let destX = 0;
      let destY = 0;
      let color: [number, number, number];
      let size: number;
      let depth: number;

      if (phase === 1) {
        const spread = MAX_SPREAD * phaseT * (0.65 + p.aDepth * 0.6);
        destX = p.ax + Math.cos(p.aAngle) * spread;
        destY = p.ay + Math.sin(p.aAngle) * spread;
        color = p.aColor;
        size = p.aSize;
        depth = p.aDepth;
      } else {
        // Phase 2: from spread-A converge to B with twist around cB
        const spread = MAX_SPREAD * (1 - smT) * (0.65 + p.aDepth * 0.6);
        const fromX = p.ax + Math.cos(p.aAngle) * spread;
        const fromY = p.ay + Math.sin(p.aAngle) * spread;
        let tx = fromX + (p.bx - fromX) * smT;
        let ty = fromY + (p.by - fromY) * smT;
        // Rotational twist around cB
        const twist = Math.sin(phaseT * Math.PI) * 0.55;
        const dx = tx - cB.x;
        const dy = ty - cB.y;
        const cs = Math.cos(twist);
        const sn = Math.sin(twist);
        tx = cB.x + dx * cs - dy * sn;
        ty = cB.y + dx * sn + dy * cs;
        destX = tx;
        destY = ty;
        // Color / size / depth interpolation A -> B
        color = [
          p.aColor[0] + (p.bColor[0] - p.aColor[0]) * smT,
          p.aColor[1] + (p.bColor[1] - p.aColor[1]) * smT,
          p.aColor[2] + (p.bColor[2] - p.aColor[2]) * smT,
        ];
        size = p.aSize + (p.bSize - p.aSize) * smT;
        depth = p.aDepth + (p.bDepth - p.aDepth) * smT;
      }

      // Slow motion follow
      p.x += (destX - p.x) * 0.06;
      p.y += (destY - p.y) * 0.06;

      // Mouse parallax weighted by depth
      const parX = (mouse.x - w / 2) * PARALLAX * depth;
      const parY = (mouse.y - h / 2) * PARALLAX * depth;

      const radius = size * breath;
      const alpha = 0.78 + depth * 0.22;
      ctx.fillStyle = `rgba(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x + parX, p.y + parY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    resizeCanvas();

    const handleResize = () => {
      resizeCanvas();
      if (imagesRef.current.a && imagesRef.current.b) {
        buildParticles();
      }
    };
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    let cancelled = false;
    Promise.all([loadImage(IMG_A_URL), loadImage(IMG_B_URL)])
      .then(([a, b]) => {
        if (cancelled) return;
        imagesRef.current.a = a;
        imagesRef.current.b = b;
        buildParticles();
        if (!startedRef.current) {
          startedRef.current = true;
          rafRef.current = requestAnimationFrame(loop);
        }
      })
      .catch(() => {
        // image load failed; keep canvas empty
      });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full" style={{ height: "300vh", backgroundColor: "#fcfcfc" }}>
      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 20 }}
      />

      {/* Fixed UI layer */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 30 }}>
        {SHOW_NAVBAR ? <Navbar /> : null}

        {/* Hero text block */}
        <div
          className="absolute pointer-events-auto"
          style={{ left: "8vw", top: "22vh", maxWidth: "560px" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span
              className="block bg-black/80"
              style={{ width: "32px", height: "1px" }}
            ></span>
            <span
              className="font-serif-display italic uppercase tracking-[0.32em] text-[12px] text-black/70"
              style={{ letterSpacing: "0.32em" }}
            >
              Petal &amp; Pixel
            </span>
          </div>

          <h1
            className="font-serif-display text-black"
            style={{ fontSize: "72px", lineHeight: 1.02, fontWeight: 500 }}
          >
            Where Code
            <br />
            Blooms into Art.
          </h1>

          <p
            className="mt-7 text-[15px] leading-relaxed text-black/55 font-sans-ui"
            style={{ maxWidth: "440px" }}
          >
            A quiet field where typography, watercolor and motion drift across the same canvas — a
            studio sketchbook of generative experiments by Amoura&nbsp;D.
          </p>

          <button
            type="button"
            className="mt-9 inline-flex items-center gap-3 bg-black text-white rounded-full px-7 py-3 text-[13px] tracking-wider whitespace-nowrap transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
          >
            <span>Start travel</span>
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-line text-[14px]"></i>
            </span>
          </button>
        </div>

        {/* Bottom centered scroll indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ bottom: "32px" }}
        >
          <span className="font-serif-display italic text-[12px] tracking-[0.4em] uppercase text-black/55">
            Scroll
          </span>
          <span
            className="block bg-black/40 scroll-line"
            style={{ width: "1px", height: "44px" }}
          ></span>
        </div>

        {/* Bottom left signature */}
        <div
          className="absolute font-serif-display italic text-[13px] text-black/55 tracking-wide"
          style={{ bottom: "28px", left: "32px" }}
        >
          @ Amoura_D
        </div>

        {/* Bottom right tag */}
        <div
          className="absolute font-serif-display text-[12px] tracking-[0.3em] uppercase text-black/55"
          style={{ bottom: "28px", right: "32px" }}
        >
          Iris · 001
        </div>
      </div>

      {/* Scrolling spacer — pure blank, no text */}
      <div className="relative" style={{ zIndex: 0, height: "300vh" }} aria-hidden="true" />
    </div>
  );
}
