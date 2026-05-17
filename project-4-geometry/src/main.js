import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// geometry — sphere
// SphereGeometry(radius, widthSegments, heightSegments)
const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'teal', wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = -2;
scene.add(sphere);

// geometry — cylinder
// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded)
// Note --> higher the segments --> more smooth the cylinder --> more time consuming
const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 16, 1);
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 'coral', side: THREE.DoubleSide }); // DoubleSide --> renders both sides of the cylinder
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.x = 2;
scene.add(cylinder);

const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

// responsiveness
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableRotate = true;

function animate() {
    window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();