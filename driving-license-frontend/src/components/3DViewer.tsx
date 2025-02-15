import React, { useRef, useState, useEffect, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { ThemeContext } from "src/context/ThemeContext";

interface Props {
  group: string | null;
}

const models: { [key: string]: string } = {
  B: "/models/car.glb",
  C: "/models/truck.glb",
};

const getShadeOfColor = (baseColor: THREE.Color): THREE.Color => {
  const shade = baseColor.clone();
  const lightnessVariation = Math.random() * 0.3 - 0.15; 
  shade.offsetHSL(0, 0, lightnessVariation);
  return shade;
};

const Model = ({
  url,
  rotation,
  currentColor,
  targetColor,
  duration = 1000,
}: {
  url: string;
  rotation: [number, number, number];
  currentColor: THREE.Color;
  targetColor: THREE.Color;
  duration?: number;
}) => {
  const gltf = useGLTF(url);

  useEffect(() => {
    let startTime: number | null = null;

    const updateColor = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const interpolatedColor = currentColor.clone().lerp(targetColor, progress);

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.color.copy(interpolatedColor);
          }
        }
      });

      if (progress < 1) {
        requestAnimationFrame(updateColor);
      }
    };

    requestAnimationFrame(updateColor);
  }, [targetColor, currentColor, gltf, duration]);

  return <primitive object={gltf.scene} rotation={rotation} scale={1.5} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [currentColor, setCurrentColor] = useState(new THREE.Color(1, 1, 1));
  const [targetColor, setTargetColor] = useState(new THREE.Color(1, 1, 1));
  const { theme } = useContext(ThemeContext);

  const calculateContinuousAngle = (current: number, target: number): number => {
    while (target - current > Math.PI) target -= Math.PI * 2;
    while (target - current < -Math.PI) target += Math.PI * 2;
    return target;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && group) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const normalizedX = x * 2 - 1;
      const normalizedY = -(y * 2 - 1);

      const angleY = Math.atan2(normalizedX, 1);
      const angleX = Math.atan2(normalizedY, 2);

      setTargetRotation((prev) => [
        calculateContinuousAngle(prev[0], -angleX),
        calculateContinuousAngle(prev[1], angleY),
        0,
      ]);
    }
  };

  const handleMouseEnter = () => {
    setIsMouseOver(true);
    setCurrentColor(targetColor.clone());
    setTargetColor(getShadeOfColor(new THREE.Color(1, 1, 1)));
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
    setCurrentColor(targetColor.clone());
    setTargetColor(new THREE.Color(1, 1, 1));
    setTargetRotation((prev) => [prev[0], prev[1], 0]);
  };

  useEffect(() => {
    let animationFrame: number;

    const smoothTransition = () => {
      setRotation((prevRotation) => {
        const step = 0.1;
        const [rx, ry, rz] = prevRotation;
        const [tx, ty, tz] = targetRotation;
        const newRotation: [number, number, number] = [
          rx + (tx - rx) * step,
          ry + (ty - ry) * step,
          rz + (tz - rz) * step,
        ];
        if (Math.abs(tx - rx) < 0.001 && Math.abs(ty - ry) < 0.001 && Math.abs(tz - rz) < 0.001) {
          return targetRotation;
        }
        animationFrame = requestAnimationFrame(smoothTransition);
        return newRotation;
      });
    };

    animationFrame = requestAnimationFrame(smoothTransition);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetRotation]);

  useEffect(() => {
    let spinInterval: number;

    if (!isMouseOver && group) {
      spinInterval = window.setInterval(() => {
        setTargetRotation((prevRotation) => [prevRotation[0], prevRotation[1] + 0.02, prevRotation[2]]);
      }, 16);
    }

    return () => clearInterval(spinInterval);
  }, [isMouseOver, group]);

  return (
    <div className="flex items-center justify-center w-full">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="rounded-md border shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:cursor-move w-full sm:w-2/3 h-64 sm:h-[35rem]"
        style={{
          background: "hsl(var(--card-bg))",
          borderColor: "hsl(var(--border))",
        }}
      >
        {group && group in models ? (
          <Suspense
            fallback={
              <p className="text-center text-[hsl(var(--muted-foreground))]">
                Loading 3D model...
              </p>
            }
          >
            <Canvas
              camera={{
                position: [0, 50, 500],
                fov: 35,
              }}
              style={{
                background: "hsl(var(--background))",
              }}
            >
              <ambientLight intensity={theme === "dark" ? 0.25 : 0.5} />
              <directionalLight intensity={theme === "dark" ? 0.6 : 0.8} position={[2, 2, 2]} />
              <group position={[0, -50, 0]} scale={1.2}>
                <Model
                  url={models[group]}
                  rotation={rotation}
                  currentColor={currentColor}
                  targetColor={targetColor}
                />
              </group>
            </Canvas>
          </Suspense>
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center mt-8">
            Select a group to view the model.
          </p>
        )}
      </div>
    </div>
  );
};

export default Viewer;