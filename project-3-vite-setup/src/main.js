import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 'teal', wireframe: true});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

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
    camera.updateProjectionMatrix(); // prevents from squeezing when we shrink window size
                                     // whenever you change camera's value [aspect ratio], updateProjectionMatrix always
})


// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;  // smooths the movement
controls.dampingFactor = 0.25; // speed of the damping --> how quickly the camera stops moving --> lower value means faster damping
controls.autoRotate = true; // automatically rotates the camera
controls.autoRotateSpeed = 2.0; // speed of the automatic rotation
controls.enableZoom = true; // allows zooming in and out
controls.zoomSpeed = 1.5; // speed of the zooming
controls.enablePan = true; // allows panning (moving the camera left and right)
controls.panSpeed = 1.5; // speed of the panning
controls.enableRotate = true; // allows rotating the camera
controls.rotateSpeed = 1.5; // speed of the rotating
controls.enableZoom = true; // allows zooming in and out

// Important:
// Azimuthal angle: the angle in the horizontal plane from the positive x-axis.
// Polar angle: the angle from the positive z-axis.


function animate() {
    window.requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();  // update the controls for each frame render

    renderer.render(scene, camera);
}

animate();