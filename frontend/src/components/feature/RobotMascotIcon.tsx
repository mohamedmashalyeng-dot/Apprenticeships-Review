import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "/models/robot_mascot_web.glb";
// This particular export uses required KHR_draco_mesh_compression — without a DRACOLoader
// attached, GLTFLoader can't decode the mesh geometry at all: it fails silently (console
// error only) and the scene ends up with lights but no mesh, i.e. an empty transparent
// canvas over the button's background color. Decoder files are self-hosted (copied from
// three/examples/jsm/libs/draco/gltf) rather than pulled from Google's CDN.
const DRACO_DECODER_PATH = "/draco/";

/** Self-contained 3D viewport for the chat widget's trigger — loads the robot mascot GLB,
 *  auto-fits and centers it regardless of the source file's own scale, and idles with a
 *  gentle float/sway (plus a soft contact shadow) for a considered, product-icon feel. */
export default function RobotMascotIcon({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 112;
    const height = container.clientHeight || 112;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    // ACES filmic tone mapping gives the PBR materials richer, less flat/plasticky
    // contrast than the linear default — the difference between "3D asset dropped on a
    // page" and a deliberately lit product icon.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3a3a5c, 1.1);
    scene.add(hemiLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xbcd4ff, 0.5);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    rimLight.position.set(-1, 2, -4);
    scene.add(rimLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let disposed = false;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        // Center and scale to consistently fill the small button frame, regardless of
        // the source file's own coordinate system/scale.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        model.scale.setScalar(2.4 / maxDim);
        // This particular export's front isn't at its own local +Z — confirmed visually
        // (screenshot comparison) that -90° on Y is what actually faces the camera.
        model.rotation.y = -Math.PI / 2;

        modelGroup.add(model);
      },
      undefined,
      (error) => console.error("Failed to load robot mascot model:", error)
    );

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // Face stays put and pointed at the viewer at all times — only a gentle vertical
      // float, no left-right turning-away. (Previously swayed on rotation.y; that made
      // the model periodically turn its face away from the camera, which read as wrong.)
      const t = clock.getElapsedTime();
      modelGroup.position.y = Math.sin(t * 1.1) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      dracoLoader.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Soft contact shadow — grounds the model instead of leaving it looking like it's
          cut out and pasted over the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[20%] bottom-[8%] h-[14%] rounded-full bg-black/25 blur-md"
      />
      <div ref={containerRef} className="relative h-full w-full" />
    </div>
  );
}
