import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

interface Props {
  group: string | null; // Group can be null or string
}

const models: { [key: string]: string } = {
  B: "/models/car.glb", // Path to car model
  C: "/models/truck.glb", // Path to truck model
};

const getRandomColor = () => {
  const color = new THREE.Color(Math.random(), Math.random(), Math.random()); // Generate random RGB color
  console.log("[DEBUG] Generated Random Color:", color.getStyle());
  return color;
};

const Model = ({
  url,
  rotation,
  targetColor,
  duration = 3000, // Color transition duration in milliseconds
}: {
  url: string;
  rotation: [number, number, number];
  targetColor: THREE.Color;
  duration?: number;
}) => {
  const gltf = useGLTF(url);

  useEffect(() => {
    console.log("[DEBUG] Transition Start: targetColor", targetColor.getStyle());

    let startTime: number | null = null;

    const updateColor = (time: number) => {
      if (!startTime) {
        startTime = time; // Set start time when the animation begins
      }

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1); // Clamp progress to [0, 1]

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;

            // Get the current color directly from the material
            const currentColor = material.color.clone();
            console.log(
              "[DEBUG] Current Material Color:",
              currentColor.getStyle(),
              "| Target Color:",
              targetColor.getStyle()
            );

            // Interpolate to the target color
            const interpolatedColor = currentColor.lerp(targetColor, progress);
            console.log(
              "[DEBUG] Transition Progress:",
              progress.toFixed(2),
              "| Interpolated Color:",
              interpolatedColor.getStyle()
            );

            // Apply the interpolated color back to the material
            material.color.copy(interpolatedColor);
          }
        }
      });

      // Continue the animation if not complete
      if (progress < 1) {
        requestAnimationFrame(updateColor);
      }
    };

    requestAnimationFrame(updateColor);
  }, [targetColor, gltf, duration]);

  return <primitive object={gltf.scene} rotation={rotation} scale={1.5} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [targetColor, setTargetColor] = useState(new THREE.Color(1, 1, 1)); // Default target color

  const calculateContinuousAngle = (current: number, target: number): number => {
    // Adjust target to the nearest equivalent angle for a smooth transition
    while (target - current > Math.PI) {
      target -= Math.PI * 2;
    }
    while (target - current < -Math.PI) {
      target += Math.PI * 2;
    }
    return target;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && group) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // Normalized X (0 to 1)
      const y = (e.clientY - rect.top) / rect.height; // Normalized Y (0 to 1)

      // Center cursor position in normalized coordinates (-1 to 1)
      const normalizedX = x * 2 - 1;
      const normalizedY = -(y * 2 - 1);

      // Calculate the angle to point the model toward the cursor
      const angleY = Math.atan2(normalizedX, 1); // Horizontal rotation
      const angleX = Math.atan2(normalizedY, 2); // Vertical tilt (optional)

      // Set target rotation based on calculated angles
      setTargetRotation((prev) => [
        calculateContinuousAngle(prev[0], -angleX),
        calculateContinuousAngle(prev[1], angleY),
        0,
      ]);
    }
  };

  const handleMouseEnter = () => {
    console.log("[DEBUG] Mouse Entered Div");
    setIsMouseOver(true);
    setTargetColor(getRandomColor()); // Generate a new random color
  };

  const handleMouseLeave = () => {
    console.log("[DEBUG] Mouse Left Div");
    setIsMouseOver(false);
    setTargetColor(new THREE.Color(1, 1, 1)); // Transition back to default white
  };

  useEffect(() => {
    let animationFrame: number;

    const smoothTransition = () => {
      setRotation((prevRotation) => {
        const step = 0.1; // Adjust the step size for smoother transition
        const [rx, ry, rz] = prevRotation;
        const [tx, ty, tz] = targetRotation;

        // Interpolate between current rotation and target rotation
        const newRotation: [number, number, number] = [
          rx + (tx - rx) * step,
          ry + (ty - ry) * step,
          rz + (tz - rz) * step,
        ];

        // Stop the animation if the rotation is very close to the target
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

  // Spin the model when idle
  useEffect(() => {
    let spinInterval: number;

    if (!isMouseOver && group) {
      spinInterval = window.setInterval(() => {
        setTargetRotation((prevRotation) => [
          prevRotation[0],
          prevRotation[1] + 0.02, // Increment the Y-axis angle
          prevRotation[2],
        ]);
      }, 16); // ~60 FPS
    }

    return () => clearInterval(spinInterval);
  }, [isMouseOver, group]);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "66%",
          height: "35rem",
          border: "1px solid black",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {group && group in models ? (
          <Suspense fallback={<p>Loading 3D model...</p>}>
            <Canvas
              camera={{
                position: [0, 50, 500], // Camera position
                fov: 30, // Field of view
              }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 2]} />
              <group position={[0, -50, 0]} scale={1.2}>
                <Model
                  url={models[group]}
                  rotation={rotation}
                  targetColor={targetColor}
                />
              </group>
            </Canvas>
          </Suspense>
        ) : (
          <p>Select a group to view the model.</p>
        )}
      </div>
    </div>
  );
};

export default Viewer;