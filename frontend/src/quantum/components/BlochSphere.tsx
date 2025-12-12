import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Complex } from "../../types/quantum";

interface BlochSphereProps {
  stateVector: [Complex, Complex];
}

export default function BlochSphere({ stateVector }: BlochSphereProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);

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
      transparent: true,
      opacity: 0.3
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

    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // --- ★ displayVec を Bloch球の座標に変換して反映 ---
  useEffect(() => {
    if (!arrowRef.current) return;

    const [alpha, beta] = stateVector;
    const ar = alpha.re, ai = alpha.im;
    const br = beta.re, bi = beta.im;

    // 密度行列によるブロッホベクトル計算
    // x = 2Re(αβ*)
    const x = 2 * (ar * br + ai * bi);
    // y = 2Im(αβ*)
    const y = 2 * (ai * br - ar * bi);
    // z = |α|^2 - |β|^2
    const z = (ar * ar + ai * ai) - (br * br + bi * bi);

    arrowRef.current.setDirection(new THREE.Vector3(x, z, -y).normalize());
  }, [stateVector]);

  return <div ref={mountRef}></div>;
}
