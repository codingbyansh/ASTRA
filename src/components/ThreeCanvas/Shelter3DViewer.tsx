// DRDO Defence Habitat: Parametric 3D Shelter CAD & Solar Ray-Tracing Engine (Three.js)
// Procedural geometry reflecting exact dimensions, materials, openings, orientation & dynamic solar vector.

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShelterDesign } from '../../types';
import { getMaterialById } from '../../data/materials';
import { calculateSolarPosition } from '../../engine/solar';
import { getLocationById } from '../../data/climate';
import {
  RotateCcw,
  Sun,
  Eye,
  Maximize2,
  Compass,
  Layers,
  Flame,
  Grid,
} from 'lucide-react';

interface Shelter3DViewerProps {
  design: ShelterDesign;
  selectedHour?: number;
  onHourChange?: (hour: number) => void;
  heightClass?: string;
  showControls?: boolean;
}

export const Shelter3DViewer: React.FC<Shelter3DViewerProps> = ({
  design,
  selectedHour = 13,
  onHourChange,
  heightClass = 'h-[440px]',
  showControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'realistic' | 'wireframe' | 'thermal_heatmap' | 'cutaway'>('realistic');
  const [showDimensions, setShowDimensions] = useState(true);
  const [showSunPath, setShowSunPath] = useState(true);
  const [hour, setHour] = useState(selectedHour);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const shelterGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const sunRayLineRef = useRef<THREE.Line | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  const location = getLocationById(design.locationId);

  // Sync internal hour with prop
  useEffect(() => {
    setHour(selectedHour);
  }, [selectedHour]);

  const handleSliderHour = (newHour: number) => {
    setHour(newHour);
    if (onHourChange) onHourChange(newHour);
  };

  // Dynamically update terrain, grid and sky colors when location/area changes
  useEffect(() => {
    if (sceneRef.current && location) {
      sceneRef.current.background = new THREE.Color(location.skyColor || '#081220');
    }
    if (groundMeshRef.current && location) {
      (groundMeshRef.current.material as THREE.MeshStandardMaterial).color.set(location.terrainColor || '#090d16');
    }
    if (gridHelperRef.current && location) {
      // Recreate grid helper with area-specific grid colors if needed
      gridHelperRef.current.material.dispose();
      const gridMat = gridHelperRef.current.material as THREE.LineBasicMaterial;
      gridMat.color.set(location.terrainGridColor || '#38bdf8');
    }
  }, [design.locationId, location]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#081220'); // Deep navy engineering backdrop
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go below ground
    controls.minDistance = 4;
    controls.maxDistance = 50;
    controls.target.set(0, design.geometry.heightM / 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x334155, 0.35);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7d6, 1.4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    const d = 16;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Sun Visual Sphere
    const sunGeom = new THREE.SphereGeometry(0.5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd152 });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Sun Ray Line
    const rayGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const rayMat = new THREE.LineDashedMaterial({
      color: 0xffeb3b,
      dashSize: 0.4,
      gapSize: 0.2,
      opacity: 0.6,
      transparent: true,
    });
    const sunRayLine = new THREE.Line(rayGeom, rayMat);
    sunRayLine.computeLineDistances();
    scene.add(sunRayLine);
    sunRayLineRef.current = sunRayLine;

    // Ground Grid & Terrain plane reflecting Area Terrain
    const gridColor1 = location?.terrainGridColor ? new THREE.Color(location.terrainGridColor).getHex() : 0x38bdf8;
    const grid = new THREE.GridHelper(30, 30, gridColor1, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    const groundGeom = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: location?.terrainColor ? new THREE.Color(location.terrainColor).getHex() : 0x090d16,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    groundMeshRef.current = ground;

    // Compass dial on ground
    const compassGroup = createCompassDial();
    compassGroup.position.set(0, 0.02, 0);
    scene.add(compassGroup);

    // Shelter Group
    const shelterGroup = new THREE.Group();
    scene.add(shelterGroup);
    shelterGroupRef.current = shelterGroup;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Shelter Geometry, Materials & Openings
  useEffect(() => {
    if (!shelterGroupRef.current || !sceneRef.current) return;
    const group = shelterGroupRef.current;

    // Clear previous shelter meshes
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const { lengthM: L, widthM: W, heightM: H, shape, roofPitchDeg, overhangLengthM, orientationDeg } = design.geometry;
    const wallMatDef = getMaterialById(design.envelope.wallMaterialId);
    const roofMatDef = getMaterialById(design.envelope.roofMaterialId);

    // Group orientation rotation: rotate around Y-axis (True North reference)
    // 0 deg = South-facing ridge / main wall
    group.rotation.y = (-orientationDeg * Math.PI) / 180;

    // Material Styling according to View Mode
    let wallMaterial: THREE.Material;
    let roofMaterial: THREE.Material;
    let floorMaterial: THREE.Material;
    let windowMaterial: THREE.Material;
    let frameMaterial: THREE.Material;

    if (viewMode === 'wireframe') {
      wallMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
      roofMaterial = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true });
      floorMaterial = new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true });
      windowMaterial = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, wireframe: true });
      frameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    } else if (viewMode === 'thermal_heatmap') {
      // Heatmap mode: South wall & roof get warm orange-red, North cool cyan/blue
      wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xf97316, // Solar heated warm exterior
        roughness: 0.6,
      });
      roofMaterial = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Intense top roof solar gain
        roughness: 0.5,
      });
      floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.8 });
      windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
      });
      frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    } else if (viewMode === 'cutaway') {
      // Cutaway: translucent roof to see internal thermal mass & floor layout
      wallMaterial = new THREE.MeshStandardMaterial({
        color: wallMatDef.hexColor,
        roughness: 0.85,
        metalness: 0.05,
      });
      roofMaterial = new THREE.MeshStandardMaterial({
        color: roofMatDef.hexColor,
        transparent: true,
        opacity: 0.25,
        wireframe: false,
        roughness: 0.4,
      });
      floorMaterial = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 });
      windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
      });
      frameMaterial = new THREE.MeshStandardMaterial({ color: 0x334155 });
    } else {
      // Realistic Material mode
      wallMaterial = new THREE.MeshStandardMaterial({
        color: wallMatDef.hexColor,
        roughness: 0.85,
        metalness: 0.05,
      });
      roofMaterial = new THREE.MeshStandardMaterial({
        color: roofMatDef.hexColor,
        roughness: 0.7,
        metalness: 0.15,
      });
      floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.9,
      });
      windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transmission: 0.8,
        opacity: 0.6,
        transparent: true,
        roughness: 0.1,
        metalness: 0.1,
        reflectivity: 0.9,
      });
      frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
      });
    }

    // 1. Floor Slab
    const floorGeom = new THREE.BoxGeometry(L, 0.2, W);
    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial);
    floorMesh.position.set(0, 0.1, 0);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = true;
    group.add(floorMesh);

    // 2. Main Walls
    const wallThick = 0.25;

    // North Wall (Z = -W/2 + wallThick/2)
    const northWallGeom = new THREE.BoxGeometry(L, H, wallThick);
    const northWallMesh = new THREE.Mesh(northWallGeom, wallMaterial);
    northWallMesh.position.set(0, H / 2 + 0.2, -W / 2 + wallThick / 2);
    northWallMesh.castShadow = true;
    northWallMesh.receiveShadow = true;
    group.add(northWallMesh);

    // South Wall (Z = +W/2 - wallThick/2)
    // Create South wall with window cutout if windows exist
    const southWallGeom = new THREE.BoxGeometry(L, H, wallThick);
    const southWallMesh = new THREE.Mesh(southWallGeom, wallMaterial);
    southWallMesh.position.set(0, H / 2 + 0.2, W / 2 - wallThick / 2);
    southWallMesh.castShadow = true;
    southWallMesh.receiveShadow = true;
    group.add(southWallMesh);

    // East Wall (X = +L/2 - wallThick/2)
    const eastWallGeom = new THREE.BoxGeometry(wallThick, H, W - 2 * wallThick);
    const eastWallMesh = new THREE.Mesh(eastWallGeom, wallMaterial);
    eastWallMesh.position.set(L / 2 - wallThick / 2, H / 2 + 0.2, 0);
    eastWallMesh.castShadow = true;
    eastWallMesh.receiveShadow = true;
    group.add(eastWallMesh);

    // West Wall (X = -L/2 + wallThick/2)
    const westWallGeom = new THREE.BoxGeometry(wallThick, H, W - 2 * wallThick);
    const westWallMesh = new THREE.Mesh(westWallGeom, wallMaterial);
    westWallMesh.position.set(-L / 2 + wallThick / 2, H / 2 + 0.2, 0);
    westWallMesh.castShadow = true;
    westWallMesh.receiveShadow = true;
    group.add(westWallMesh);

    // 3. Roof Structures
    const pitchRad = (roofPitchDeg * Math.PI) / 180;
    const ridgeHeight = (W / 2) * Math.tan(pitchRad);

    if (shape === 'gable') {
      // Gable Roof: Left and Right sloping planes
      const rafterHalfLength = Math.sqrt(Math.pow(W / 2, 2) + Math.pow(ridgeHeight, 2)) + overhangLengthM;
      const roofPlaneGeom1 = new THREE.BoxGeometry(L + 2 * overhangLengthM, 0.12, rafterHalfLength);
      
      // South-facing slope
      const roofSlopeSouth = new THREE.Mesh(roofPlaneGeom1, roofMaterial);
      roofSlopeSouth.position.set(0, H + 0.2 + ridgeHeight / 2, (W / 4));
      roofSlopeSouth.rotation.x = pitchRad;
      roofSlopeSouth.castShadow = true;
      roofSlopeSouth.receiveShadow = true;
      group.add(roofSlopeSouth);

      // North-facing slope
      const roofPlaneGeom2 = new THREE.BoxGeometry(L + 2 * overhangLengthM, 0.12, rafterHalfLength);
      const roofSlopeNorth = new THREE.Mesh(roofPlaneGeom2, roofMaterial);
      roofSlopeNorth.position.set(0, H + 0.2 + ridgeHeight / 2, -(W / 4));
      roofSlopeNorth.rotation.x = -pitchRad;
      roofSlopeNorth.castShadow = true;
      roofSlopeNorth.receiveShadow = true;
      group.add(roofSlopeNorth);

      // Triangular Gable Wall Infill (East & West ends)
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-W / 2, 0);
      gableShape.lineTo(W / 2, 0);
      gableShape.lineTo(0, ridgeHeight);
      gableShape.closePath();

      const extrudeSettings = { depth: wallThick, bevelEnabled: false };
      const gableGeom = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);

      const eastGable = new THREE.Mesh(gableGeom, wallMaterial);
      eastGable.position.set(L / 2 - wallThick, H + 0.2, 0);
      eastGable.rotation.y = Math.PI / 2;
      eastGable.castShadow = true;
      group.add(eastGable);

      const westGable = new THREE.Mesh(gableGeom, wallMaterial);
      westGable.position.set(-L / 2, H + 0.2, 0);
      westGable.rotation.y = Math.PI / 2;
      westGable.castShadow = true;
      group.add(westGable);
    } else if (shape === 'pitched') {
      // Single shed pitch (higher at North, slopes down to South)
      const rise = W * Math.tan(pitchRad);
      const rafterLength = Math.sqrt(Math.pow(W, 2) + Math.pow(rise, 2)) + overhangLengthM;
      const roofGeom = new THREE.BoxGeometry(L + 2 * overhangLengthM, 0.12, rafterLength);
      const roofMesh = new THREE.Mesh(roofGeom, roofMaterial);
      roofMesh.position.set(0, H + 0.2 + rise / 2, 0);
      roofMesh.rotation.x = pitchRad;
      roofMesh.castShadow = true;
      roofMesh.receiveShadow = true;
      group.add(roofMesh);
    } else {
      // Flat Roof with parapet edge
      const flatRoofGeom = new THREE.BoxGeometry(L + 2 * overhangLengthM, 0.18, W + 2 * overhangLengthM);
      const flatRoofMesh = new THREE.Mesh(flatRoofGeom, roofMaterial);
      flatRoofMesh.position.set(0, H + 0.2 + 0.09, 0);
      flatRoofMesh.castShadow = true;
      flatRoofMesh.receiveShadow = true;
      group.add(flatRoofMesh);
    }

    // 4. Windows (South facade primary solar collector)
    const southWinArea = design.openings.windowAreaSouthM2;
    if (southWinArea > 0) {
      const winHeight = 1.3;
      const winWidth = Math.min(L * 0.8, southWinArea / winHeight);
      const winGeom = new THREE.PlaneGeometry(winWidth, winHeight);
      const winMesh = new THREE.Mesh(winGeom, windowMaterial);
      winMesh.position.set(0, 0.2 + H / 2, W / 2 + 0.01);
      group.add(winMesh);

      // Window Frame
      const frameGeom = new THREE.BoxGeometry(winWidth + 0.1, winHeight + 0.1, 0.06);
      const frameMesh = new THREE.Mesh(frameGeom, frameMaterial);
      frameMesh.position.set(0, 0.2 + H / 2, W / 2);
      group.add(frameMesh);
    }

    // Door on South/East
    const doorGeom = new THREE.PlaneGeometry(0.9, 2.0);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const doorMesh = new THREE.Mesh(doorGeom, doorMat);
    doorMesh.position.set(L / 2 - 1.0, 1.2, W / 2 + 0.01);
    group.add(doorMesh);

    // 5. Internal Thermal Mass Visualizer (when in cutaway view)
    if (viewMode === 'cutaway') {
      // Internal partition thermal mass wall & occupants
      const massGeom = new THREE.BoxGeometry(0.3, H * 0.8, W * 0.5);
      const massMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
      const massWall = new THREE.Mesh(massGeom, massMat);
      massWall.position.set(0, 0.2 + (H * 0.8) / 2, 0);
      massWall.castShadow = true;
      group.add(massWall);

      // Occupant cylinder indicators
      const occupantGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 12);
      const occupantMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
      for (let i = 0; i < Math.min(8, design.occupants.count); i++) {
        const occMesh = new THREE.Mesh(occupantGeom, occupantMat);
        const offsetX = -L / 3 + (i % 4) * 0.9;
        const offsetZ = -W / 3 + Math.floor(i / 4) * 1.2;
        occMesh.position.set(offsetX, 1.0, offsetZ);
        group.add(occMesh);
      }
    }

    // 6. 3D Dimension Overlays
    if (showDimensions) {
      const dimGroup = createDimensionLines(L, W, H);
      group.add(dimGroup);
    }
  }, [design, viewMode, showDimensions]);

  // Update Solar Position & Ray-Casting
  useEffect(() => {
    if (!sunLightRef.current || !sunMeshRef.current || !sunRayLineRef.current) return;

    const dayOfYear = design.simulationSettings.season === 'winter' ? 15 : design.simulationSettings.season === 'summer' ? 165 : 210;
    const solarPos = calculateSolarPosition(location.latitude, dayOfYear, hour);

    const radius = 18; // Orbit radius
    const altRad = (solarPos.altitudeDeg * Math.PI) / 180;
    const azRad = (solarPos.azimuthDeg * Math.PI) / 180;

    // Three.js Coordinate system:
    // +Y = Up
    // -Z = North
    // +Z = South
    // +X = East
    // -X = West
    // Azimuth 0 = North (-Z), 90 = East (+X), 180 = South (+Z), 270 = West (-X)
    const x = radius * Math.cos(altRad) * Math.sin(azRad);
    const y = Math.max(0.5, radius * Math.sin(altRad));
    const z = radius * Math.cos(altRad) * -Math.cos(azRad);

    const sunPos = new THREE.Vector3(x, y, z);
    sunLightRef.current.position.copy(sunPos);
    sunLightRef.current.target.position.set(0, design.geometry.heightM / 2, 0);
    sunLightRef.current.target.updateMatrixWorld();

    sunMeshRef.current.position.copy(sunPos);
    sunMeshRef.current.visible = showSunPath && solarPos.altitudeDeg > 0;

    // Update Ray line from Sun to Shelter center
    const rayPositions = new Float32Array([x, y, z, 0, design.geometry.heightM / 2, 0]);
    sunRayLineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
    sunRayLineRef.current.geometry.attributes.position.needsUpdate = true;
    sunRayLineRef.current.visible = showSunPath && solarPos.altitudeDeg > 0;

    // Adjust light intensity based on day/night
    if (solarPos.altitudeDeg <= 0) {
      sunLightRef.current.intensity = 0.05; // Night starlight/moonlight
      if (sceneRef.current) sceneRef.current.background = new THREE.Color('#030712');
    } else {
      sunLightRef.current.intensity = 1.35 * Math.sin(altRad);
      if (sceneRef.current) sceneRef.current.background = new THREE.Color('#0b1329');
    }
  }, [hour, design.locationId, design.simulationSettings.season, location.latitude, showSunPath, design.geometry.heightM]);

  const resetCamera = (preset: 'iso' | 'top' | 'south' | 'east') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const H = design.geometry.heightM;

    if (preset === 'iso') {
      cam.position.set(12, 10, 14);
      ctrl.target.set(0, H / 2, 0);
    } else if (preset === 'top') {
      cam.position.set(0, 20, 0.01);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'south') {
      cam.position.set(0, H / 2, 15);
      ctrl.target.set(0, H / 2, 0);
    } else if (preset === 'east') {
      cam.position.set(16, H / 2, 0);
      ctrl.target.set(0, H / 2, 0);
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl flex flex-col">
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className={`w-full ${heightClass} relative cursor-grab active:cursor-grabbing`} />

      {/* Top Floating Overlay Controls */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* View Presets & Modes */}
          <div className="flex items-center gap-1.5 bg-[#0c1829]/90 backdrop-blur-md border border-[#1f3352] p-1.5 rounded-lg pointer-events-auto shadow-lg">
            <button
              onClick={() => setViewMode('realistic')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'realistic' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-[#162a47]'
              }`}
              title="Realistic Physical Materials"
            >
              Realistic
            </button>
            <button
              onClick={() => setViewMode('cutaway')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'cutaway' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-[#162a47]'
              }`}
              title="Cutaway & Internal Thermal Mass"
            >
              Cutaway
            </button>
            <button
              onClick={() => setViewMode('thermal_heatmap')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'thermal_heatmap' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-[#162a47]'
              }`}
              title="Thermal Heat Absorption Map"
            >
              Thermal Map
            </button>
            <button
              onClick={() => setViewMode('wireframe')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                viewMode === 'wireframe' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-[#162a47]'
              }`}
              title="CAD Wireframe"
            >
              Wireframe
            </button>
          </div>

          {/* Area-Specific CAD Identifier Badge */}
          <div className="hidden md:flex items-center gap-2 bg-[#0c1829]/95 backdrop-blur-md border border-[#1f3352] px-3 py-1.5 rounded-lg pointer-events-auto shadow-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold text-amber-300">{location?.shortName || 'Area'}:</span>
            <span className="text-slate-100 font-semibold truncate max-w-[200px]">{design.name}</span>
            <span className="text-slate-400 text-[10px] hidden lg:inline">
              ({location?.altitudeMeters}m MSL · {location?.climateZone.replace('_', ' ')})
            </span>
          </div>

          {/* Camera Presets & Toggles */}
          <div className="flex items-center gap-1.5 bg-[#0c1829]/90 backdrop-blur-md border border-[#1f3352] p-1.5 rounded-lg pointer-events-auto shadow-lg">
            <button
              onClick={() => resetCamera('south')}
              className="px-2 py-1 text-xs text-slate-300 hover:bg-[#162a47] rounded"
              title="South Facade (Solar Face)"
            >
              South (Front)
            </button>
            <button
              onClick={() => resetCamera('top')}
              className="px-2 py-1 text-xs text-slate-300 hover:bg-[#162a47] rounded"
              title="Top View (Roof Plan)"
            >
              Top
            </button>
            <button
              onClick={() => resetCamera('iso')}
              className="p-1.5 text-slate-300 hover:bg-[#162a47] rounded"
              title="Reset 3D Perspective"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`p-1.5 rounded transition ${showDimensions ? 'text-amber-400 bg-[#162a47]' : 'text-slate-400 hover:bg-[#162a47]'}`}
              title="Toggle Dimensions"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSunPath(!showSunPath)}
              className={`p-1.5 rounded transition ${showSunPath ? 'text-amber-400 bg-[#162a47]' : 'text-slate-400 hover:bg-[#162a47]'}`}
              title="Toggle Sun Position Vector"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Solar Time Scrubbing Bar */}
      <div className="bg-[#0c1829]/95 border-t border-[#1f3352] p-2.5 px-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Solar Position:</span>
          <span className="font-mono text-amber-300 bg-[#081220] px-2 py-0.5 rounded border border-[#192b45]">
            {String(Math.floor(hour)).padStart(2, '0')}:00 hrs
          </span>
        </div>

        <div className="flex-1 max-w-md flex items-center gap-3">
          <span className="text-[11px] text-slate-400">06:00 (Dawn)</span>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={hour}
            onChange={(e) => handleSliderHour(Number(e.target.value))}
            className="w-full h-1.5 bg-[#081220] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[11px] text-slate-400">18:00 (Dusk)</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          {location && (
            <span className="flex items-center gap-1 font-mono text-amber-300/90 hidden lg:inline">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {location.shortName} ({location.latitude}°N, {location.longitude}°E)
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Orientation: {design.geometry.orientationDeg}° (True South)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Dim: {design.geometry.lengthM}m × {design.geometry.widthM}m × {design.geometry.heightM}m
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper: Procedural Compass Dial on the ground plane
function createCompassDial(): THREE.Group {
  const group = new THREE.Group();

  const circleGeom = new THREE.RingGeometry(5.8, 6.0, 32);
  const circleMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
  });
  const circle = new THREE.Mesh(circleGeom, circleMat);
  circle.rotation.x = -Math.PI / 2;
  group.add(circle);

  // South Indicator Arrow (Facing +Z)
  const arrowSouthGeom = new THREE.ConeGeometry(0.4, 1.2, 4);
  const arrowSouthMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red South (Solar side)
  const arrowSouth = new THREE.Mesh(arrowSouthGeom, arrowSouthMat);
  arrowSouth.position.set(0, 0.05, 6.5);
  arrowSouth.rotation.x = Math.PI / 2;
  group.add(arrowSouth);

  // North Indicator (Facing -Z)
  const arrowNorthGeom = new THREE.ConeGeometry(0.3, 0.8, 4);
  const arrowNorthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const arrowNorth = new THREE.Mesh(arrowNorthGeom, arrowNorthMat);
  arrowNorth.position.set(0, 0.05, -6.5);
  arrowNorth.rotation.x = -Math.PI / 2;
  group.add(arrowNorth);

  return group;
}

// Helper: 3D Dimension lines with measurement annotations
function createDimensionLines(L: number, W: number, H: number): THREE.Group {
  const group = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });

  // Length dimension (Along X)
  const lengthPoints = [
    new THREE.Vector3(-L / 2, 0.05, W / 2 + 0.8),
    new THREE.Vector3(L / 2, 0.05, W / 2 + 0.8),
  ];
  const lengthGeom = new THREE.BufferGeometry().setFromPoints(lengthPoints);
  const lengthLine = new THREE.Line(lengthGeom, lineMat);
  group.add(lengthLine);

  // Width dimension (Along Z)
  const widthPoints = [
    new THREE.Vector3(L / 2 + 0.8, 0.05, -W / 2),
    new THREE.Vector3(L / 2 + 0.8, 0.05, W / 2),
  ];
  const widthGeom = new THREE.BufferGeometry().setFromPoints(widthPoints);
  const widthLine = new THREE.Line(widthGeom, lineMat);
  group.add(widthLine);

  // Height dimension (Along Y)
  const heightPoints = [
    new THREE.Vector3(-L / 2 - 0.8, 0.1, W / 2),
    new THREE.Vector3(-L / 2 - 0.8, H + 0.2, W / 2),
  ];
  const heightGeom = new THREE.BufferGeometry().setFromPoints(heightPoints);
  const heightLine = new THREE.Line(heightGeom, lineMat);
  group.add(heightLine);

  return group;
}
