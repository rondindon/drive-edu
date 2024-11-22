import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";

interface Props {
  group: string | null; // Group can be null or string
}

const models: { [key: string]: string } = {
  B: "/models/car.glb", // Path to car model
  C: "/models/truck.glb", // Path to truck model
};

const Model = ({ url, rotation }: { url: string; rotation: [number, number, number] }) => {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} rotation={rotation} scale={1.5} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [isMouseOver, setIsMouseOver] = useState(false);

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
    setIsMouseOver(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
    setTargetRotation((prev) => [prev[0], prev[1], 0]); // Maintain the current rotation
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
    <div>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%",
          height: "300px",
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
                <Model url={models[group]} rotation={rotation} />
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