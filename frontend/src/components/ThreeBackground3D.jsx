import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground3D({ activeTab = 'workbench', isProcessing = false }) {
  const canvasRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  const isProcessingRef = useRef(isProcessing);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer, animationFrameId;

    try {
      // 1. Scene, Camera, Renderer Setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.022);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 12);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    // 2. Dynamic Point Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x10b981, 5, 35);
    mainLight.position.set(6, 6, 6);
    scene.add(mainLight);

    const secondaryLight = new THREE.PointLight(0x06b6d4, 4, 35);
    secondaryLight.position.set(-6, -6, 6);
    scene.add(secondaryLight);

    const accentLight = new THREE.PointLight(0xf59e0b, 3, 25);
    accentLight.position.set(0, 0, 10);
    scene.add(accentLight);

    // 3. Central 3D Cyber Core Structure (Wireframe TorusKnot + Octahedron + Outer Rings)
    const coreGroup = new THREE.Group();

    // Outer Wireframe TorusKnot
    const torusKnotGeo = new THREE.TorusKnotGeometry(2.8, 0.65, 120, 16);
    const torusKnotMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      wireframe: true,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    coreGroup.add(torusKnot);

    // Inner Glowing Core
    const coreGeo = new THREE.OctahedronGeometry(1.5, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
      flatShading: true
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(innerCore);

    // Outer Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(4.2, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(5.2, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    scene.add(coreGroup);

    // 4. Floating 3D Geometric Mesh Cluster
    const floatingGeometries = [];
    const geoms = [
      new THREE.IcosahedronGeometry(0.65, 0),
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.TetrahedronGeometry(0.7, 0),
      new THREE.TorusGeometry(0.45, 0.15, 12, 24)
    ];

    const colors = [0x10b981, 0x06b6d4, 0xf59e0b, 0x6366f1, 0xec4899];

    for (let i = 0; i < 24; i++) {
      const g = geoms[i % geoms.length];
      const c = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: c,
        wireframe: i % 2 === 0,
        emissive: c,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.7
      });

      const mesh = new THREE.Mesh(g, mat);
      
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      mesh.position.x = radius * Math.cos(theta) * Math.cos(phi);
      mesh.position.y = radius * Math.sin(phi);
      mesh.position.z = (Math.random() - 0.5) * 16 - 2;

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.5 + Math.random() * 1.5,
        floatOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y
      };

      scene.add(mesh);
      floatingGeometries.push(mesh);
    }

    // 5. Particle Network Starfield (800 dynamic 3D nodes)
    const particleCount = 800;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x10b981);
    const c2 = new THREE.Color(0x06b6d4);
    const c3 = new THREE.Color(0x6366f1);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;

      const pick = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      particleColors[i * 3] = pick.r;
      particleColors[i * 3 + 1] = pick.g;
      particleColors[i * 3 + 2] = pick.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. 3D Camera Spatial Coordinates Mapping per Tab
    const tabCameraConfig = {
      workbench:    { posX: 0,   posY: 0,   posZ: 10, rotY: 0,       color: 0x10b981 },
      dashboard:    { posX: 0,   posY: 2,   posZ: 15, rotY: 0,       color: 0x06b6d4 },
      audit:        { posX: -5,  posY: 1,   posZ: 12, rotY: 0.25,    color: 0x6366f1 },
      baseline:     { posX: 5,   posY: 2.5, posZ: 13, rotY: -0.25,   color: 0x10b981 },
      policy:       { posX: 0,   posY: -3,  posZ: 11, rotY: 0,       color: 0xf59e0b },
      architecture: { posX: 0,   posY: 0,   posZ: 7,  rotY: 0,       color: 0xec4899 }
    };

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Render Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Get target 3D camera coordinates for current active tab
      const currentTab = activeTabRef.current || 'workbench';
      const config = tabCameraConfig[currentTab] || tabCameraConfig.workbench;

      const targetCamX = config.posX + mouseX * 2.5;
      const targetCamY = config.posY - mouseY * 2.5;
      const targetCamZ = config.posZ;

      // Smoothly interpolate 3D WebGL Camera position (Spatial Fly-Through)
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0, 0);

      // Processing state acceleration
      const isProc = isProcessingRef.current;
      const speedMultiplier = isProc ? 3.5 : 1.0;

      // Rotate 3D Core Structure
      coreGroup.rotation.y = elapsedTime * 0.25 * speedMultiplier;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.3;

      torusKnot.rotation.z = elapsedTime * 0.12 * speedMultiplier;
      innerCore.rotation.y = -elapsedTime * 0.45 * speedMultiplier;
      ring1.rotation.z = elapsedTime * 0.18 * speedMultiplier;
      ring2.rotation.z = -elapsedTime * 0.22 * speedMultiplier;

      // Dynamically morph core emissive light color matching active tab
      torusKnotMat.color.lerp(new THREE.Color(config.color), 0.03);
      torusKnotMat.emissive.lerp(new THREE.Color(config.color), 0.03);

      // Animate Floating Mesh Cluster
      floatingGeometries.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeedX * speedMultiplier;
        mesh.rotation.y += mesh.userData.rotSpeedY * speedMultiplier;
        mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.4;
      });

      // Rotate Particle Cloud
      particles.rotation.y = elapsedTime * 0.04 * speedMultiplier;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.06;

      renderer.render(scene, camera);
    };

      animate();

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.warn("ThreeBackground3D WebGL initialization skipped:", err);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);


  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full transition-opacity duration-1000"
    />
  );
}
