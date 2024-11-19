import React, { useRef, useState } from 'react';
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
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]); // Initial rotation

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Normalized X (-1 to 1)
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // Normalized Y (-1 to 1)

      // Reverse the Y-axis effect and map cursor to rotation
      const newRotation: [number, number, number] = [y * Math.PI / 8, x * Math.PI / 2, 0];
      setRotation(newRotation);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
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
              <Model url={models[group]} rotation={rotation} />
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