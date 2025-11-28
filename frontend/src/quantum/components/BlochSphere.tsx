import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

interface BlochSphereProps {
  stateVector: [number, number]; // [α, β]
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function BlochSphere({ stateVector }: BlochSphereProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);

  // ★ アニメーション用の表示ベクトル（stateVector の "追従版"）
  const [displayVec, setDisplayVec] = useState<[number, number]>(stateVector);

  // --- Three.js 初期化 ---
  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    mount.appendChild(renderer.domElement);

    // 球（Bloch球）
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      wireframe: true,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // 座標軸
    const axesHelper = new THREE.AxesHelper(1.5);
    scene.add(axesHelper);

    // ベクトル矢印
    const dir = new THREE.Vector3(0, 0, 1);
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1, 0xff0000);
    arrowRef.current = arrow;
    scene.add(arrow);

    camera.position.z = 3;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // --- ★ stateVector → displayVec をアニメーションで追従させる ---
  useEffect(() => {
    let frame: number;
    const duration = 350; // 動きの滑らかさ（ミリ秒）
    const startTime = performance.now();

    const start = displayVec;
    const target = stateVector;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      setDisplayVec([
        lerp(start[0], target[0], t),
        lerp(start[1], target[1], t),
      ]);

      if (t < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [stateVector]);

  // --- ★ displayVec を Bloch球の座標に変換して反映 ---
  useEffect(() => {
    if (!arrowRef.current) return;

    const [alpha, beta] = displayVec;
    const norm = Math.sqrt(alpha ** 2 + beta ** 2) || 1;
    const a = alpha / norm;
    const b = beta / norm;

    const x = 2 * a * b;
    const y = 0; // 現在は簡略化
    const z = a ** 2 - b ** 2;

    arrowRef.current.setDirection(new THREE.Vector3(x, y, z).normalize());
  }, [displayVec]);

  return <div ref={mountRef}></div>;
}
