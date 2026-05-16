// Create Scene --> entire 3d world
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5
scene.add(camera);

let box = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ color: "red" });
let mesh = new THREE.Mesh(box, material);

// Transfromations --> scale, rotate, translate

// positions --> x, y, z
// x --> left (-), right (+)
// y --> top(+), bottom(-)
// z --> front(+), back(-)
// mesh.position.x = 1; // moves the box to the right side
// mesh.position.x = -1; // moves the box to the left side
// mesh.position.y = 1; // moves the box up
// mesh.position.y = -1; // moves the box down
// mesh.position.z = 1; // moves the box forward
// mesh.position.z = -1; // moves the box backward

// Rotation
// mesh.rotation.x = 1; // rotates the box around the x-axis
// mesh.rotation.y = 1; // rotates the box around the y-axis
// mesh.rotation.z = 1; // rotates the box around the z-axis

// scaling
// mesh.scale.x = 2; // scales the box to 2 times its original size
// mesh.scale.y = 2; // scales the box to 2 times its original size
// mesh.scale.z = 2; // scales the box to 2 times its original size

// Note --> rotate 180 deg --> Math.PI (3.14)
// mesh.rotation.y = Math.PI;

// NOTE --> values are given in radians and internally converted to degrees


scene.add(mesh);

const canvas = document.querySelector('#draw');
let renderer = new THREE.WebGLRenderer({ canvas: canvas,antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

// clock --> keeps track of the time
let clock = new THREE.Clock();

// animations --> keep calling the function over and over again
function animate() {
    // render as many times as your computer can per seconds
    // more fps, more times this function will be called
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // mesh.rotation.y += 0.01;
    mesh.rotation.y = clock.getElapsedTime();
    // mesh.rotation.y = clock.getElapsedTime() * 2; --> 2 times faster
}

animate()