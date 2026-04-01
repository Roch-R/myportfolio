import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3D({ imageUrl }) {
  const containerRef = useRef(null);
  const hoveredRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationTargetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 3;

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const rimLight = new THREE.DirectionalLight(0x4f6ef7, 0.5);
      rimLight.position.set(-5, 3, 5);
      scene.add(rimLight);

      // Card geometry
      const cardGeometry = new THREE.PlaneGeometry(2, 2.66, 16, 16);
      
      const cardMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.1,
        metalness: 0.1,
        envMapIntensity: 1,
        color: 0xffffff,
      });

      const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
      cardMesh.castShadow = true;
      cardMesh.receiveShadow = true;
      scene.add(cardMesh);

      // Create gradient canvas fallback
      const createGradientCanvas = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 682;
        const ctx = canvas.getContext("2d");
        
        const gradient = ctx.createLinearGradient(0, 0, 512, 682);
        gradient.addColorStop(0, "#1a1a2e");
        gradient.addColorStop(0.5, "#4f6ef7");
        gradient.addColorStop(1, "#312e81");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 682);
        
        ctx.font = "bold 120px 'Playfair Display', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillText("R", 256, 280);
        
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText("Frontend Developer", 256, 600);
        
        return new THREE.CanvasTexture(canvas);
      };

      // Set initial texture
      const gradientTexture = createGradientCanvas();
      cardMaterial.map = gradientTexture;
      cardMaterial.needsUpdate = true;

      // Load image if provided
      if (imageUrl) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          imageUrl,
          (loadedTexture) => {
            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            cardMaterial.map = loadedTexture;
            cardMaterial.needsUpdate = true;
          },
          undefined,
          () => {
            console.warn("Image failed to load, keeping gradient");
          }
        );
      }

      // Border glow
      const borderGeometry = new THREE.PlaneGeometry(2.05, 2.71);
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0x4f6ef7,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      });
      const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
      borderMesh.position.z = -0.01;
      cardMesh.add(borderMesh);

      // Particles
      const particleCount = 40;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 3 + Math.random() * 2;
        particlePositions[i * 3] = Math.cos(angle) * distance;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
        particlePositions[i * 3 + 2] = Math.sin(angle) * distance;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x4f6ef7,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Animation loop
      let animationId;
      let elapsedTime = 0;

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        elapsedTime += 0.016;

        // Smooth rotation
        cardMesh.rotation.x += (rotationTargetRef.current.x - cardMesh.rotation.x) * 0.1;
        cardMesh.rotation.y += (rotationTargetRef.current.y - cardMesh.rotation.y) * 0.1;

        // Float animation
        cardMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.15;

        // Scale on hover
        const targetScale = hoveredRef.current ? 1.05 : 1.0;
        cardMesh.scale.x += (targetScale - cardMesh.scale.x) * 0.05;
        cardMesh.scale.y += (targetScale - cardMesh.scale.y) * 0.05;

        // Particle orbits
        const posAttr = particleGeometry.getAttribute("position");
        const pos = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + elapsedTime * 0.3;
          const distance = 3 + Math.sin(elapsedTime * 0.5 + i) * 0.5;
          pos[i * 3] = Math.cos(angle) * distance;
          pos[i * 3 + 1] = Math.sin(elapsedTime * 0.7 + i * 0.5) * 1.5;
          pos[i * 3 + 2] = Math.sin(angle) * distance;
        }
        posAttr.needsUpdate = true;

        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0003;

        renderer.render(scene, camera);
      };

      animate();

      // Event handlers
      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        rotationTargetRef.current.y = mouseRef.current.x * 0.5;
        rotationTargetRef.current.x = mouseRef.current.y * 0.3;
        hoveredRef.current = true;
      };

      const onMouseLeave = () => {
        rotationTargetRef.current = { x: 0, y: 0 };
        hoveredRef.current = false;
      };

      const onWindowResize = () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      window.addEventListener("resize", onWindowResize);

      // Cleanup function
      return () => {
        cancelAnimationFrame(animationId);
        if (container) {
          container.removeEventListener("mousemove", onMouseMove);
          container.removeEventListener("mouseleave", onMouseLeave);
        }
        window.removeEventListener("resize", onWindowResize);
        
        renderer.dispose();
        cardGeometry.dispose();
        cardMaterial.dispose();
        borderGeometry.dispose();
        borderMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        gradientTexture.dispose();
        
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (error) {
      console.error("Hero3D initialization error:", error);
    }
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 380,
        height: 500,
        margin: "0 auto",
        cursor: "grab",
        borderRadius: 20,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}