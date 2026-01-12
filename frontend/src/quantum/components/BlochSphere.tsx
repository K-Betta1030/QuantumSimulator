import * as THREE from "three";
import { useEffect, useRef } from "react";
import { Complex } from "../../types/quantum";

interface BlochSphereProps {
  stateVector: Complex[];
}

export default function BlochSphere({ stateVector }: BlochSphereProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    // --- Three.js 初期化 (変更なし) ---
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    mount.appendChild(renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const axesHelper = new THREE.AxesHelper(1.5);
    scene.add(axesHelper);

    const dir = new THREE.Vector3(0, 1, 0);
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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // --- ★ 2量子ビット対応ロジック ---
  useEffect(() => {
    if (!arrowRef.current || stateVector.length < 4) return;

    // 状態 |ψ> = c00|00> + c01|01> + c10|10> + c11|11>
    const c00 = stateVector[0];
    const c01 = stateVector[1];
    const c10 = stateVector[2];
    const c11 = stateVector[3];

    // Qubit 0 の密度行列 (Reduced Density Matrix) を計算
    // ρ00 = |c00|^2 + |c01|^2
    const rho00 = (c00.re**2 + c00.im**2) + (c01.re**2 + c01.im**2);
    
    // ρ11 = |c10|^2 + |c11|^2
    const rho11 = (c10.re**2 + c10.im**2) + (c11.re**2 + c11.im**2);

    // 非対角項 ρ01 = c00*conj(c10) + c01*conj(c11)
    // 実部: (re00*re10 + im00*im10) + (re01*re11 + im01*im11)
    const re01 = (c00.re * c10.re + c00.im * c10.im) + (c01.re * c11.re + c01.im * c11.im);
    // 虚部: (im00*re10 - re00*im10) + (im01*re11 - re01*im11)  (注: conjなので虚部の符号注意)
    const im01 = (c00.im * c10.re - c00.re * c10.im) + (c01.im * c11.re - c01.re * c11.im);

    // ブロッホベクトル (x, y, z)
    // x = 2 * Re(ρ01)
    const x = 2 * re01;
    // y = 2 * Im(ρ01)
    const y = 2 * im01;
    // z = ρ00 - ρ11
    const z = rho00 - rho11;

    // Three.js座標系へマップ (Physics Z -> Three Y)
    // 矢印の長さ(Length)も重要。純粋状態なら1、もつれ状態なら1未満になる
    const length = Math.sqrt(x*x + y*y + z*z);
    
    // 方向セット
    if (length > 0.001) {
        arrowRef.current.setDirection(new THREE.Vector3(x, z, -y).normalize());
        arrowRef.current.setLength(length); // もつれると短くなる！
    } else {
        arrowRef.current.setLength(0.001); // ほぼゼロ
    }

  }, [stateVector]);

  return <div ref={mountRef}></div>;
}