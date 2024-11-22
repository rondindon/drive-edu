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
  const [spinAngle, setSpinAngle] = useState(0);
  const [isResetting, setIsResetting] = useState(false); // Track reset state

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && group && !isResetting) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // Normalized X (0 to 1)
      const y = (e.clientY - rect.top) / rect.height; // Normalized Y (0 to 1)

      // Amplify cursor influence for more noticeable movement
      const newTargetRotation: [number, number, number] = [
        (y - 0.5) * Math.PI / 2, // Tilt up/down (multiplied)
        (x - 0.5) * Math.PI * 2, // Rotate left/right (multiplied)
        0,
      ];
      setTargetRotation(newTargetRotation);
    }
  };

  const handleMouseEnter = () => {
    if (group) {
      setIsMouseOver(true);
      setIsResetting(true); // Start resetting to initial position
      setTargetRotation([0, 0, 0]); // Reset to initial position
      setTimeout(() => setIsResetting(false), 300); // Allow for smooth reset
    }
  };

  const handleMouseLeave = () => {
    if (group) {
      setIsMouseOver(false);
      setIsResetting(true); // Start resetting to initial position
      setTargetRotation([0, 0, 0]); // Reset to initial position
      setTimeout(() => {
        setIsResetting(false);
        setSpinAngle(0); // Restart spin angle after reset
      }, 300); // Allow for smooth reset
    }
  };

  useEffect(() => {
    let animationFrame: number;

    const smoothTransition = () => {
      setRotation((prevRotation) => {
        const step = 0.1; // Smooth transition speed
        const [rx, ry, rz] = prevRotation;
        const [tx, ty, tz] = targetRotation;

        const newRotation: [number, number, number] = [
          rx + (tx - rx) * step,
          ry + (ty - ry) * step,
          rz + (tz - rz) * step,
        ];

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

    if (!isMouseOver && group && !isResetting) {
      spinInterval = window.setInterval(() => {
        setSpinAngle((prevSpinAngle) => prevSpinAngle + 0.03); // Faster spin
        setTargetRotation([0, spinAngle, 0]); // Update target rotation during idle spin
      }, 16); // ~60 FPS
    }

    return () => clearInterval(spinInterval);
  }, [isMouseOver, group, isResetting, spinAngle]);

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