import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface Props {
  group: string;
}

const models: { [key: string]: string } = {
  B: '/models/car.glb', // Path to car model
  C: '/models/truck.glb', // Path to truck model
  // Add more groups and their corresponding model paths
};

const Model = ({ url, rotation }: { url: string; rotation: [number, number, number] }) => {
  const gltf = useGLTF(url); // Load the GLTF model
  return <primitive object={gltf.scene} rotation={rotation} scale={1.5} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]); // Current rotation
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]); // Target rotation
  const [isMouseOver, setIsMouseOver] = useState(false); // Track if the mouse is over the div
  const [spin, setSpin] = useState(0); // Spin angle for idle state

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Normalized X (-1 to 1)
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // Normalized Y (-1 to 1)

      const newTargetRotation: [number, number, number] = [y * Math.PI / 8, x * Math.PI / 2, 0];
      setTargetRotation(newTargetRotation);
    }
  };

  const handleMouseEnter = () => {
    setIsMouseOver(true);
    setTargetRotation([0, 0, 0]); // Reset to initial position first
  };

  const handleMouseLeave = () => {
    setIsMouseOver(false);
    setTargetRotation([0, 0, 0]); // Reset to initial position
  };

  useEffect(() => {
    let animationFrame: number;

    const smoothTransition = () => {
      setRotation((prevRotation) => {
        const step = 0.03; // Smooth transition speed
        const [rx, ry, rz] = prevRotation;
        const [tx, ty, tz] = isMouseOver ? targetRotation : [0, spin, 0];

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
  }, [targetRotation, isMouseOver, spin]);

  // Spin the model when idle
  useEffect(() => {
    let spinInterval: number;
    if (!isMouseOver) {
      spinInterval = window.setInterval(() => {
        setSpin((prevSpin) => (prevSpin + 0.01) % (2 * Math.PI)); // Increment spin angle
      }, 16); // ~60 FPS
    } else {
      setSpin(0); // Reset spin angle when mouse enters
    }

    return () => clearInterval(spinInterval);
  }, [isMouseOver]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '300px',
        border: '1px solid black',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {group in models ? (
        <Suspense fallback={<p>Loading 3D model...</p>}>
          <Canvas
            camera={{
              position: [0, 50, 500], // Same initial position as before
              fov: 30, // Field of view
            }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} />
            <group position={[0, -50, 0]} scale={1.2}>
              {/* Pass rotation to the model */}
              <Model
                url={models[group]}
                rotation={rotation} // Smoothly transitions based on hover state
              />
            </group>
          </Canvas>
        </Suspense>
      ) : (
        <p>No model available for the selected group.</p>
      )}
    </div>
  );
};

export default Viewer;