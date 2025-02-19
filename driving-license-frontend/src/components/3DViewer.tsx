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
  BE: "/models/car.glb",
  C: "/models/truck.glb",
  CE: "/models/truck.glb",
  D: "/models/bus.glb",
  DE: "/models/bus.glb",
  A: "/models/bike.glb",
  T: "/models/tractor.glb",
};

const getShadeOfColor = (baseColor: THREE.Color): THREE.Color => {
  const shade = baseColor.clone();
  const lightnessVariation = Math.random() * 0.3 - 0.15;
  shade.offsetHSL(0, 0, lightnessVariation);
  return shade;
};

interface ModelProps {
  url: string;
  rotation: [number, number, number];
  currentColor: THREE.Color;
  targetColor: THREE.Color;
  duration?: number;
  scale?: number;
  animateDirection?: "in" | "out";
}

const Model = ({
  url,
  rotation,
  currentColor,
  targetColor,
  duration = 200,
  scale = 1.5,
  animateDirection = "in",
}: ModelProps) => {
  const gltf = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Color animation
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

  // Scale animation
  useEffect(() => {
    let startTime: number | null = null;
    // For "in", start 0; for "out", start full
    const startScale =
      animateDirection === "in"
        ? new THREE.Vector3(0, 0, 0)
        : new THREE.Vector3(scale, scale, scale);
    const endScale =
      animateDirection === "in"
        ? new THREE.Vector3(scale, scale, scale)
        : new THREE.Vector3(0, 0, 0);

    const animateScale = (time: number) => {
      if (startTime === null) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newScale = startScale.clone().lerp(endScale, progress);
      if (modelRef.current) {
        modelRef.current.scale.copy(newScale);
      }
      if (progress < 1) {
        requestAnimationFrame(animateScale);
      }
    };

    requestAnimationFrame(animateScale);
  }, [scale, duration, animateDirection]);

  return <primitive ref={modelRef} object={gltf.scene} rotation={rotation} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [currentColor, setCurrentColor] = useState(new THREE.Color(1, 1, 1));
  const [targetColor, setTargetColor] = useState(new THREE.Color(1, 1, 1));
  const { theme } = useContext(ThemeContext);

  const transitionDuration = 500;
  const [currentGroup, setCurrentGroup] = useState<string | null>(group);
  const [prevGroup, setPrevGroup] = useState<string | null>(null);

  useEffect(() => {
    if (group !== currentGroup) {
      if (currentGroup !== null) {
        setPrevGroup(currentGroup);
        const timeout = setTimeout(() => {
          setCurrentGroup(group);
          setPrevGroup(null);
        }, transitionDuration);
        return () => clearTimeout(timeout);
      } else {
        setCurrentGroup(group);
      }
    }
  }, [group, currentGroup, transitionDuration]);

  const startingPositions: { [key: string]: [number, number, number] } = {
    B: [0, -70, -200],
    BE: [0, -70, -200],
    A: [0, -20, -200],
    C: [0, -90, -300],
    CE: [0, -90, -300],
    D: [0, -60, -100],
    DE: [0, -60, -100],
    T: [0, -110, -250],
  };
  const defaultPosition: [number, number, number] = [0, -60, 0];

  const modelScales: { [key: string]: number } = {
    A: 0.25,
    C: 0.8,
    CE: 0.8,
    D: 33.0,
    DE: 33.0,
    T: 0.6,
    default: 1.6,
  };

  const modelRotationOffsets: { [key: string]: [number, number, number] } = {
    C: [0, Math.PI, 0],
    CE: [0, Math.PI, 0],
  };

  const tractorStaticOffset: [number, number, number] = [Math.PI / 2, Math.PI, 0];

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

      setTargetRotation([
        calculateContinuousAngle(rotation[0], -angleX),
        calculateContinuousAngle(rotation[1], angleY),
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
    setTargetRotation([rotation[0], rotation[1], 0]);
  };

  // Global spin: update rotation state based on targetRotation
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
        if (
          Math.abs(tx - rx) < 0.001 &&
          Math.abs(ty - ry) < 0.001 &&
          Math.abs(tz - rz) < 0.001
        ) {
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
        setTargetRotation((prevRotation) => [
          prevRotation[0],
          prevRotation[1] + 0.02,
          prevRotation[2],
        ]);
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
        className="rounded-md border shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-95 hover:cursor-move w-full sm:w-2/3 h-64 sm:h-[35rem]"
        style={{
          background: "hsl(var(--card-bg))",
          borderColor: "hsl(var(--border))",
        }}
      >
        {(currentGroup || prevGroup) ? (
          <Suspense
            fallback={
              <p className="text-center text-[hsl(var(--muted-foreground))]">
                Loading 3D model...
              </p>
            }
          >
            <Canvas
              camera={{ position: [0, 50, 500], fov: 35 }}
              style={{ background: "hsl(var(--background))" }}
            >
              <ambientLight intensity={theme === "dark" ? 0.25 : 0.5} />
              <directionalLight
                intensity={theme === "dark" ? 0.6 : 0.8}
                position={[2, 2, 2]}
              />

              {/* Render the exiting (prev) model if any */}
              {prevGroup && (
                <group
                  position={
                    prevGroup in startingPositions
                      ? startingPositions[prevGroup]
                      : defaultPosition
                  }
                >
                  <group rotation={rotation}>
                    {prevGroup === "T" ? (
                      <group rotation={tractorStaticOffset} key={prevGroup}>
                        <Model
                          url={models[prevGroup]}
                          rotation={[0, 0, 0]}
                          currentColor={currentColor}
                          targetColor={targetColor}
                          scale={modelScales[prevGroup] ?? modelScales.default}
                          duration={transitionDuration}
                          animateDirection="out"
                        />
                      </group>
                    ) : (
                      <group
                        rotation={
                          prevGroup in modelRotationOffsets
                            ? modelRotationOffsets[prevGroup]
                            : [0, 0, 0]
                        }
                        key={prevGroup}
                      >
                        <Model
                          url={models[prevGroup]}
                          rotation={[0, 0, 0]}
                          currentColor={currentColor}
                          targetColor={targetColor}
                          scale={modelScales[prevGroup] ?? modelScales.default}
                          duration={transitionDuration}
                          animateDirection="out"
                        />
                      </group>
                    )}
                  </group>
                </group>
              )}

              {/* Render the entering (current) model */}
              {currentGroup && (
                <group
                  position={
                    currentGroup in startingPositions
                      ? startingPositions[currentGroup]
                      : defaultPosition
                  }
                >
                  <group rotation={rotation}>
                    {currentGroup === "T" ? (
                      <group rotation={tractorStaticOffset} key={currentGroup}>
                        <Model
                          url={models[currentGroup]}
                          rotation={[0, 0, 0]}
                          currentColor={currentColor}
                          targetColor={targetColor}
                          scale={modelScales[currentGroup] ?? modelScales.default}
                          duration={transitionDuration}
                          animateDirection="in"
                        />
                      </group>
                    ) : (
                      <group
                        rotation={
                          currentGroup in modelRotationOffsets
                            ? modelRotationOffsets[currentGroup]
                            : [0, 0, 0]
                        }
                        key={currentGroup}
                      >
                        <Model
                          url={models[currentGroup]}
                          rotation={[0, 0, 0]}
                          currentColor={currentColor}
                          targetColor={targetColor}
                          scale={modelScales[currentGroup] ?? modelScales.default}
                          duration={transitionDuration}
                          animateDirection="in"
                        />
                      </group>
                    )}
                  </group>
                </group>
              )}
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