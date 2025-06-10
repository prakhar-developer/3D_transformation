// App.js
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  Text,
  Line,
} from '@react-three/drei';
import './App.css';

// Symbolic Product (Shoe-like) using Torus + Box
function ProductModel({ position, rotation, scale, color = 'orange' }) {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.position.set(...position);
    meshRef.current.rotation.set(...rotation);
    meshRef.current.scale.set(...scale);
  });

  return (
    <group ref={meshRef}>
      {/* Sole (Torus as base of the shoe) */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.1, 16, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Shoe top (box) */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Position label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="bottom"
      >
        ({position.map(v => +v.toFixed(1)).join(', ')})
      </Text>
    </group>
  );
}

function ProjectionLines({ position }) {
  const [x, y, z] = position;
  return (
    <>
      <Line points={[[x, y, z], [x, 0, z]]} color="gray" dashed />
      <Line points={[[x, 0, z], [x, 0, 0]]} color="gray" dashed />
      <Line points={[[x, 0, 0], [0, 0, 0]]} color="gray" dashed />
    </>
  );
}

function Scene({ position, rotation, scale, reflectedPosition, reflectedColor }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <axesHelper args={[10]} />
      <ProductModel position={position} rotation={rotation} scale={scale} />
      {reflectedPosition && (
        <ProductModel
          position={reflectedPosition}
          rotation={[0, 0, 0]}
          scale={[1, 1, 1]}
          color={reflectedColor}
        />
      )}
      <ProjectionLines position={position} />
      <OrbitControls />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
      </GizmoHelper>
      <Text position={[11, 0, 0]} fontSize={0.5} color="red">X</Text>
      <Text position={[0, 11, 0]} fontSize={0.5} color="green">Y</Text>
      <Text position={[0, 0, 11]} fontSize={0.5} color="blue">Z</Text>
    </>
  );
}

function App() {
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [scale, setScale] = useState([1, 1, 1]);
  const [reflectedPosition, setReflectedPosition] = useState(null);
  const [reflectedColor, setReflectedColor] = useState('skyblue');
  const [selectedTransform, setSelectedTransform] = useState('');
  const [inputs, setInputs] = useState({ x: 0, y: 0, z: 0 });

  const handleSubmit = () => {
    const { x, y, z } = inputs;
    switch (selectedTransform) {
      case 'Translation':
        setPosition([+x, +y, +z]);
        setReflectedPosition(null);
        break;
      case 'Rotation':
        setRotation([+x * Math.PI / 180, +y * Math.PI / 180, +z * Math.PI / 180]);
        setReflectedPosition(null);
        break;
      case 'Scaling':
        setScale([+x, +y, +z]);
        setReflectedPosition(null);
        break;
      case 'Shearing':
        setScale([1 + +x * 0.1, 1 + +y * 0.1, 1 + +z * 0.1]);
        setReflectedPosition(null);
        break;
      case 'Reflection':
        const rx = +x ? -position[0] : position[0];
        const ry = +y ? -position[1] : position[1];
        const rz = +z ? -position[2] : position[2];
        setReflectedPosition([rx, ry, rz]);
        setReflectedColor('orange');
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setPosition([0, 0, 0]);
    setRotation([0, 0, 0]);
    setScale([1, 1, 1]);
    setReflectedPosition(null);
    setInputs({ x: 0, y: 0, z: 0 });
    setSelectedTransform('');
  };

  const renderForm = () => (
    <div className="form-container">
      <button className="back-button" onClick={() => setSelectedTransform('')}>← Back</button>
      <h4>{selectedTransform} Parameters</h4>
      <div className="form">
        <label>X: <input type="number" value={inputs.x} onChange={e => setInputs({ ...inputs, x: e.target.value })} /></label>
        <label>Y: <input type="number" value={inputs.y} onChange={e => setInputs({ ...inputs, y: e.target.value })} /></label>
        <label>Z: <input type="number" value={inputs.z} onChange={e => setInputs({ ...inputs, z: e.target.value })} /></label>
        <button onClick={handleSubmit}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );

  return (
    <div>
      <header className="header">
        <div className="logo">🛍️ 3D Product Transform Visualizer</div>
      </header>
      <div className="container">
        <div className="left">
          <div className="card canvas-card">
            <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
              <Scene
                position={position}
                rotation={rotation}
                scale={scale}
                reflectedPosition={reflectedPosition}
                reflectedColor={reflectedColor}
              />
            </Canvas>
          </div>
        </div>
        <div className="right">
          <h2 className="section-title">Apply 3D Transformations</h2>
          {!selectedTransform && (
            <div className="card-grid">
              {['Translation', 'Rotation', 'Scaling', 'Shearing', 'Reflection'].map(type => (
                <div
                  key={type}
                  className="transform-card square-card"
                  onClick={() => {
                    setSelectedTransform(type);
                    setInputs({ x: 0, y: 0, z: 0 });
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
          {selectedTransform && renderForm()}
        </div>
      </div>
    </div>
  );
}

export default App;
