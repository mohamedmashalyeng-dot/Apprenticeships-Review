import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SmokeShaderProps {
  scale?: number;
  speed?: number;
  density?: number;
  softness?: number;
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
  bgColor?: [number, number, number];
  className?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_mouseVel;
  uniform float u_clickTime;
  uniform vec2 u_clickPos;
  uniform float u_scale;
  uniform float u_speed;
  uniform float u_density;
  uniform float u_softness;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_bgColor;

  varying vec2 vUv;

  float hash(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    return mix(mix(mix( hash(p+vec3(0,0,0)), hash(p+vec3(1,0,0)),f.x),
                   mix( hash(p+vec3(0,1,0)), hash(p+vec3(1,1,0)),f.x),f.y),
               mix(mix( hash(p+vec3(0,0,1)), hash(p+vec3(1,0,1)),f.x),
                   mix( hash(p+vec3(0,1,1)), hash(p+vec3(1,1,1)),f.x),f.y),f.z);
  }

  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 5; ++i) {
      v += a * (noise(x) * 2.0 - 1.0);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  float fbm_wispy(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 6; ++i) {
      float n = noise(x) * 2.0 - 1.0;
      float ridge = 1.0 - abs(n);
      float soft = n * 0.5 + 0.5;
      v += a * mix(ridge, soft, u_softness);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = u_resolution.x / u_resolution.y;

    vec2 p = vUv * 2.0 - 1.0;
    p.x *= aspect;

    vec2 mousePos = u_mouse * 2.0 - 1.0;
    mousePos.x *= aspect;

    vec2 clickPos = u_clickPos * 2.0 - 1.0;
    clickPos.x *= aspect;

    // Vector from cursor to current pixel
    vec2 toMouse = p - mousePos;
    float dist = length(toMouse);
    float angle = atan(toMouse.y, toMouse.x);

    // ===== CLICK SPRAY BURST (fullscreen) =====
    // A wave of smoke that erupts at the click point and sweeps outward
    // until it covers the ENTIRE screen, then slowly dissipates.
    float clickAge = max(u_time - u_clickTime, 0.0);
    float sprayDist = length(p - clickPos);
    // Wavefront travels outward fast — reaches screen edge (~3 units diag) in ~0.7s
    float waveRadius = clickAge * 4.5;
    // Everything inside the wavefront is filled with spray (soft edge)
    float sprayReach = smoothstep(waveRadius, waveRadius - 0.6, sprayDist);
    // Life envelope: quick ignition, hold ~0.8s at full, then fade over ~2s
    float ignite = smoothstep(0.0, 0.06, clickAge);
    float fade = 1.0 - smoothstep(0.9, 2.8, clickAge);
    float sprayLife = ignite * fade;
    float spray = sprayReach * sprayLife;

    // ===== DOMAIN WARP COORDS =====
    vec3 p3 = vec3(p * u_scale, u_time * u_speed);
    p3.y -= u_time * u_speed * 1.2;

    // Mouse-velocity trail: smoke gets dragged behind mouse movement
    float velInfluence = smoothstep(2.2, 0.0, dist);
    p3.xy -= u_mouseVel * 14.0 * velInfluence;

    // Radial outward push: smoke EMITS from cursor outward
    vec2 radial = toMouse / (dist + 0.0001);
    float pushAmt = smoothstep(1.6, 0.0, dist) * 0.7;
    p3.xy += radial * pushAmt;

    // Spray wavefront also distorts/churns the noise so the fill looks alive
    vec2 sprayDir = normalize(p - clickPos + vec2(0.0001));
    p3.xy += sprayDir * spray * 0.8;
    p3.z += spray * 1.5;



    vec3 q = vec3(
      fbm(p3 + vec3(0.0, u_time * u_speed * 0.6, 0.0)),
      fbm(p3 + vec3(5.2, u_time * u_speed * 0.6, 0.0)),
      0.0
    );

    vec3 r = vec3(
      fbm(p3 + q * 1.5 + vec3(1.7, 9.2, u_time * u_speed * 1.0)),
      fbm(p3 + q * 1.5 + vec3(8.3, 2.8, u_time * u_speed * 1.1)),
      0.0
    );

    float n = fbm_wispy(p3 + r * 1.0);

    // ===== BREATHING PULSE =====
    // Two overlaid sine waves at different rates create an organic, never-perfectly-looping breath
    float breathSlow = sin(u_time * 0.55) * 0.5 + 0.5;       // 0 -> 1, ~11s cycle
    float breathFast = sin(u_time * 1.35 + 1.7) * 0.5 + 0.5; // 0 -> 1, faster shimmer
    float breath = mix(breathSlow, breathFast, 0.35);
    // Map to a gentle multiplier around 1.0 (0.78 -> 1.22)
    float breathPulse = 0.78 + breath * 0.44;
    // A subtle secondary ripple emanating from cursor in sync with the breath
    float breathRipple = sin(dist * 5.5 - u_time * 1.6) * 0.5 + 0.5;
    breathRipple *= smoothstep(2.2, 0.2, dist);

    // ===== EMISSION MASK (centered at cursor) =====
    // Emission radius itself breathes, so the plume expands/contracts when idle
    float emissionRadius = 2.6 * breathPulse;
    float emission = smoothstep(emissionRadius, 0.0, dist);
    emission = pow(emission, 1.3);

    // Slight upward bias so it feels like smoke rising
    emission *= smoothstep(2.4, -1.6, p.y - mousePos.y - 0.3);

    // Spray wavefront dumps massive emission across the wavefront area
    emission = max(emission, spray * 3.0);

    float density = n * emission;

    // Density thresholds also breathe so the smoke thins/thickens with the rhythm
    float densityLower = mix(0.65, -0.05, u_density) - (breath - 0.5) * 0.08;
    float densityUpper = mix(1.15, 0.45, u_density) - (breath - 0.5) * 0.08;
    density = smoothstep(densityLower, densityUpper, density);

    // ===== THREE-COLOR PINWHEEL (idle / cursor mode) =====
    // Color is determined by angle around the cursor, rotating over time
    float rotAngle = u_time * 0.45;
    float a = angle + rotAngle + n * 0.6;
    float sector = fract((a + 3.14159) / 6.2831);

    vec3 pinwheelColor;
    float s3 = sector * 3.0;
    if (s3 < 1.0) {
      pinwheelColor = mix(u_color1, u_color2, smoothstep(0.55, 1.0, s3));
    } else if (s3 < 2.0) {
      pinwheelColor = mix(u_color2, u_color3, smoothstep(0.55, 1.0, s3 - 1.0));
    } else {
      pinwheelColor = mix(u_color3, u_color1, smoothstep(0.55, 1.0, s3 - 2.0));
    }

    // ===== UNEVEN SPLATTER MODE (click burst) =====
    // Use large-scale noise fields so colors form irregular blobs/streaks across the screen
    // Each click time tweaks the seed so every click looks different
    float seed = u_clickTime * 0.37;
    float blobA = fbm(vec3(p * 1.1 + vec2(seed, seed * 0.7), seed));
    float blobB = fbm(vec3(p * 1.3 + vec2(-seed * 1.2, seed * 0.4), seed + 11.0));
    // Map to 0..1 with strong contrast so each color claims its own territory
    float wA = smoothstep(-0.25, 0.25, blobA);
    float wB = smoothstep(-0.25, 0.25, blobB);
    vec3 splatterColor = mix(
      mix(u_color1, u_color2, wA),
      u_color3,
      wB * (1.0 - wA * 0.5)
    );
    // Blend between pinwheel and splatter based on click life
    // While spray is active, screen fills with uneven splatter; fades back to pinwheel as it dissipates
    float splatterMix = clamp(sprayLife * 1.3, 0.0, 1.0);
    vec3 smokeColor = mix(pinwheelColor, splatterColor, splatterMix);

    // ===== CLEAR / WHITE-WASH TONE =====
    // Lift the pigments toward white so the palette reads as soft, airy pastels
    // rather than saturated paint. This guarantees no dark/dirty mixing.
    smokeColor = mix(vec3(1.0), smokeColor, 0.78);

    // Breath shimmer kept very subtle and bright-only (no darkening multiplier)
    smokeColor *= 0.96 + breath * 0.08;

    // ===== COMPOSITE (translucent watercolor blend) =====
    // Use the noise field as ALPHA against the white background, so darker areas
    // simply mean less pigment (more white shows through) — never a dark color.
    // n is roughly 0..1; remap to a gentler alpha so the overall wash stays light.
    float pigment = clamp(n * 0.7 + 0.1, 0.0, 1.0);
    float alpha = clamp(density * pigment, 0.0, 1.0);

    // Cap maximum opacity so the pigment never fully covers the white background
    alpha = min(alpha, 0.78);

    // Soft bright halo around cursor adds airiness without introducing dark tones
    float coreGlow = exp(-dist * 4.5) * (0.6 + breath * 0.25);
    alpha = max(alpha, coreGlow * 0.2);

    vec3 finalColor = mix(u_bgColor, smokeColor, alpha);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function SmokeShader({
  scale = 2.0,
  speed = 0.14,
  density = 0.6,
  softness = 0.28,
  color1 = [0.0, 0.8, 0.9],
  color2 = [0.8, 0.2, 0.9],
  color3 = [1.0, 0.8, 0.0],
  bgColor = [1.0, 1.0, 1.0],
  className = "",
}: SmokeShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 1.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.55) },
      u_mouseVel: { value: new THREE.Vector2(0.0, 0.0) },
      u_clickTime: { value: -10.0 },
      u_clickPos: { value: new THREE.Vector2(0.5, 0.5) },
      u_scale: { value: scale },
      u_speed: { value: speed },
      u_density: { value: density },
      u_softness: { value: softness },
      u_color1: { value: new THREE.Color(color1[0], color1[1], color1[2]) },
      u_color2: { value: new THREE.Color(color2[0], color2[1], color2[2]) },
      u_color3: { value: new THREE.Color(color3[0], color3[1], color3[2]) },
      u_bgColor: { value: new THREE.Color(bgColor[0], bgColor[1], bgColor[2]) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const targetMouse = new THREE.Vector2(0.5, 0.55);
    const currentMouse = new THREE.Vector2(0.5, 0.55);
    const lastMouse = new THREE.Vector2(0.5, 0.55);
    const velocity = new THREE.Vector2(0.0, 0.0);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse.x = (event.clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (event.clientY - rect.top) / rect.height;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      const rect = container.getBoundingClientRect();
      targetMouse.x = (event.touches[0].clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (event.touches[0].clientY - rect.top) / rect.height;
    };

    const handleClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) return;
      uniforms.u_clickPos.value.set(
        (event.clientX - rect.left) / rect.width,
        1.0 - (event.clientY - rect.top) / rect.height
      );
      uniforms.u_clickTime.value = clock.getElapsedTime();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      const rect = container.getBoundingClientRect();
      uniforms.u_clickPos.value.set(
        (event.touches[0].clientX - rect.left) / rect.width,
        1.0 - (event.touches[0].clientY - rect.top) / rect.height
      );
      uniforms.u_clickTime.value = clock.getElapsedTime();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.x = w;
      uniforms.u_resolution.value.y = h;
    };

    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      uniforms.u_time.value = clock.getElapsedTime();

      // Snappier follow for very obvious interaction
      currentMouse.lerp(targetMouse, 0.18);
      uniforms.u_mouse.value.copy(currentMouse);

      // Compute mouse velocity (smoothed) and feed to shader for trail
      const dx = currentMouse.x - lastMouse.x;
      const dy = currentMouse.y - lastMouse.y;
      velocity.x = velocity.x * 0.85 + dx * 0.15;
      velocity.y = velocity.y * 0.85 + dy * 0.15;
      uniforms.u_mouseVel.value.copy(velocity);
      lastMouse.copy(currentMouse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
    />
  );
}