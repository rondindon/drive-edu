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

const Model = ({ url }: { url: string }) => {
  const gltf = useGLTF(url); // Load the GLTF model
  return <primitive object={gltf.scene} scale={1.5} />;
};

const Viewer: React.FC<Props> = ({ group }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // Normalized X (-1 to 1)
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // Normalized Y (-1 to 1)
      setPosition({ x, y });
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
            <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} />
            <Model url={models[group]} />
            {/* Move the model based on cursor position */}
            <mesh position={[position.x * 5, position.y * 5, 0]}>
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial color="blue" />
            </mesh>
            </Canvas>
        </Suspense>
      ) : (
        <p>No model available for the selected group.</p>
      )}
    </div>
  );
};

export default Viewer;