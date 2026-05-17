# Three.js tutorial — learning notes

Notes from the hands-on projects (**project-2-learning**, **project-3-vite-setup**, **project-4-geometry**). Use this as a quick reference while you code.

---

## Understanding the parts

Three.js scenes are built from a few core ideas: a **world** (scene), a **viewpoint** (camera), **objects** (meshes made from geometry + material), and a **renderer** that draws everything onto a `<canvas>`.

| Piece | What it is | In your code |
|--------|----------------|----------------|
| **Scene** | The 3D “world” container. You add meshes, lights, helpers, etc. here. | `new THREE.Scene()` → `scene.add(mesh)` |
| **PerspectiveCamera** | A camera that mimics human vision: farther objects look smaller. Arguments: **field of view (degrees)**, **aspect ratio** (width ÷ height), **near** clip plane, **far** clip plane. | `new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100)` |
| **BoxGeometry** | The shape data for a box: width, height, depth (here `1, 1, 1`). | `new THREE.BoxGeometry(1, 1, 1)` |
| **MeshBasicMaterial** | A simple material: **one color**, not affected by lights (good for learning and debugging). | `new THREE.MeshBasicMaterial({ color: "red" })` |
| **Mesh** | Combines **geometry** + **material** into one drawable object. | `new THREE.Mesh(box, material)` |
| **WebGLRenderer** | Uses WebGL to turn your scene + camera into pixels on the canvas. | `new THREE.WebGLRenderer({ canvas, antialias: true })` + `setSize(...)` + `render(scene, camera)` |

### WebGLRenderer option: `antialias: true`

The screen is a grid of square **pixels**. Diagonal edges (cube corners, slanted lines) often look **jagged** (“stair steps”) because each pixel is one solid color.

```js
new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
```

- **`antialias: true`** — asks the GPU for **multisample antialiasing (MSAA)** where supported: the renderer samples the scene in a way that **softens those jagged edges** so the image looks smoother.  
- **`antialias: false` (default)** — a bit cheaper on the GPU; edges can look sharper but more “pixelated” on diagonals.

For learning, turning it on is usually worth it. For very heavy scenes on weak devices, you might compare performance with it off.

### How they work together (mental model)

1. **Scene** — holds everything you want to exist in 3D space.  
2. **Camera** — where you stand and which direction you look (e.g. `camera.position.z = 5` moves the camera back so you can see objects near the origin).  
3. **Mesh** — something visible: a box + red material.  
4. **Renderer** — “take a picture” of the scene from that camera and show it on the canvas.

> **Tip:** You must call `renderer.render(scene, camera)` (at least once) to see anything. Later you will call it every frame inside an animation loop.

---

## Coordinate axes (positions)

Use this when you move things with `mesh.position`:

| Axis | Direction (typical convention) |
|------|--------------------------------|
| **x** | Negative = left, positive = right |
| **y** | Negative = down, positive = up |
| **z** | Negative = back, positive = forward (toward the camera depends on setup; moving the mesh or camera changes what you see) |

Examples (same ideas as in your comments):

- `mesh.position.x = 1` — move the box to the **right**  
- `mesh.position.x = -1` — move the box to the **left**  
- `mesh.position.y = 1` — move the box **up**  
- `mesh.position.y = -1` — move the box **down**  
- `mesh.position.z = 1` / `-1` — move the box **forward** or **backward** along **z**

---

## Transformations

A **transform** is how you place, orient, and size an object in the scene. For a `Mesh`, the three main tools are **position**, **rotation**, and **scale**.

### 1. Position (translate)

Moves the object in space without changing its shape or facing.

```js
mesh.position.x = 1;
mesh.position.y = 0;
mesh.position.z = 0;
```

You can also set all at once: `mesh.position.set(1, 0, 0)`.

### 2. Rotation

Rotates the object around an axis through its origin.

```js
mesh.rotation.x = 1; // radians around X
mesh.rotation.y = 1; // radians around Y
mesh.rotation.z = 1; // radians around Z
```

**Important:** In Three.js, rotation values are in **radians**, not degrees.

- A half turn (180°) = **`Math.PI`** radians.  
- A full turn (360°) = **`Math.PI * 2`** radians.

Example for “flip” halfway around Y:

```js
mesh.rotation.y = Math.PI;
```

To convert degrees to radians: `degrees * (Math.PI / 180)`.

### 3. Scale

Stretches or shrinks the object along each axis. `1` means “original size.”

```js
mesh.scale.x = 2; // twice as wide along X
mesh.scale.y = 2;
mesh.scale.z = 2;
```

Uniform scale (same on all axes) keeps proportions; different values on x/y/z squash or stretch the box.

### Order of operations (good to know later)

Position, rotation, and scale combine into one **matrix** per object. For now: experiment with one transform at a time so you can see clearly what each property does.

---

## Animations

### What “animation” means here

In Three.js, **animation** usually means: **change something in the scene over time** (rotation, position, color, camera, etc.), then **redraw** the scene many times per second so your eye sees smooth motion.

A **static** render calls `renderer.render(scene, camera)` **once**. An **animated** scene calls `render` **again and again**, after you update meshes or other values a little bit each time.

---

### How it is done: the render loop

1. Define a function (often named `animate`) that:  
   - updates your objects (e.g. rotation),  
   - calls `renderer.render(scene, camera)`.  
2. At the end of that function, ask the browser to run it again on the **next screen refresh** using **`window.requestAnimationFrame(animate)`**.  
3. Call **`animate()` once** from your script to start the chain.

The browser will keep calling your function in sync with the display (and will **pause or slow** the loop when the tab is in the background, which saves battery).

---

### Your `animate()` — meaning of each line

Example matching **project-2-learning**:

```js
let clock = new THREE.Clock();

function animate() {
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);

    mesh.rotation.y = clock.getElapsedTime();
    // mesh.rotation.y = clock.getElapsedTime() * 2; // spins 2× faster in real time
}

animate();
```

| Line | What it does |
|------|----------------|
| `let clock = new THREE.Clock()` | Creates a **clock** that measures **real time** (wall-clock style). Used so motion depends on **time**, not on “how many frames ran.” |
| `function animate() { ... }` | Defines one **frame** of your app: update state, then draw. |
| `window.requestAnimationFrame(animate)` | Schedules **`animate`** to run again on the **next frame**. Passing the **function name** registers it as the callback for the next paint. |
| `renderer.render(scene, camera)` | Draws the current scene from the camera onto the canvas — **this is what actually updates the picture** each frame. |
| `mesh.rotation.y = clock.getElapsedTime()` | Sets the box’s Y rotation to **seconds elapsed** since the clock was created. Because rotation is in **radians**, the angle grows smoothly with **real time**, not with “frame count.” |
| `animate()` | Runs the first frame; inside it, `requestAnimationFrame` chains all following frames. |

> Without the first `animate()` call, the loop never starts — you would only have your single initial `render` (if any).

---

### Why FPS varies from system to system — and why that matters

**FPS** = **frames per second** = how many times per second your `animate` function runs (roughly). Different machines, browsers, and loads give different FPS:

- A gaming PC might run at **120 FPS** or more.  
- A laptop on battery, a busy background, or a heavy scene might run at **30–60 FPS** or lower.

If you rotate like this each frame:

```js
mesh.rotation.y += 0.01; // fixed step every frame
```

then **each frame** you add the same `0.01` radians — but **more frames per second means more additions per second**. So the same code **spins faster on a high-FPS machine** and **slower on a low-FPS machine**. Motion is tied to **frames**, not to **time**, which feels unfair and inconsistent.

---

### Fixing it with `THREE.Clock`

**`THREE.Clock`** is a small helper that tracks **time** for you:

- **`clock.getElapsedTime()`** — returns **total seconds** since the clock was created (or since you called `clock.start()` / after `autoStart` behavior). **Good** for driving motion like “angle = some function of total time” (as in your line `mesh.rotation.y = clock.getElapsedTime()`). Every frame you **read the current time**; faster FPS does not change how fast real seconds pass, so the motion stays consistent.

- **`clock.getDelta()`** — returns **seconds since the last time you called `getDelta()`** (the length of the **previous** frame in time). **Good** for incremental updates:  
  `mesh.rotation.y += speed * clock.getDelta();`  
  Here, if a frame took longer (low FPS), **`getDelta()` is larger**, so you add more rotation **once**; if frames are short (high FPS), **`getDelta()` is smaller**, so you add less **per frame** — in both cases **radians per second** stays about the same.

So: **Clock connects your updates to real time**, which is what you want for predictable animation across devices.

---

## Project 3 (`project-3-vite-setup`): Vite + Tailwind + Three.js

This folder uses **[Vite](https://vite.dev/)** as the dev server and bundler, **Tailwind CSS v4** with the **official Vite plugin**, and **Three.js** as an npm package (ES modules) instead of a CDN.

### 1. Prerequisites

Install **[Node.js](https://nodejs.org/)** (LTS is fine). That gives you:

- **`node`** — runs JavaScript on your machine  
- **`npm`** — installs packages and runs scripts from `package.json`

Check in a terminal:

```bash
node -v
npm -v
```

### 2. Create a Vite project

On the [Vite site](https://vite.dev/guide/), the usual command is:

```bash
npm create vite@latest
```

The CLI will ask you a few things:

- **Project name** — folder name for the app (or use `.` to scaffold **inside the current empty folder**).  
- **Framework** — choose **Vanilla**.  
- **Variant** — choose **JavaScript** (not TypeScript), unless you want TS.

Example for a **new** folder named `my-app`:

```bash
npm create vite@latest my-app
cd my-app
```

Example when you are **already inside** the project directory (must be empty or Vite may warn):

```bash
cd project-3-vite-setup
npm create vite@latest .
```

### 3. Install dependencies and run the dev server

From the project folder (where `package.json` is):

```bash
npm install
npm run dev
```

Vite prints a **local URL** (often `http://localhost:5173`). Open it in the browser to see the default Vite page.

### 4. Install Tailwind CSS (Vite plugin)

Still in the project root, install Tailwind and the Vite plugin ([Tailwind + Vite docs](https://tailwindcss.com/docs/installation/using-vite)):

```bash
npm install tailwindcss @tailwindcss/vite
```

Add **`vite.config.js`** next to `package.json` and register the plugin:

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

Add a CSS file (e.g. **`src/style.css`**) with:

```css
@import "tailwindcss";
```

Import that CSS from your entry script (e.g. **`src/main.js`**):

```js
import './style.css'
```

Make sure **`index.html`** loads the entry as a module, for example:

```html
<script type="module" src="/src/main.js"></script>
```

### 5. “Run the Tailwind compiler” and the app

With **Tailwind v4 + `@tailwindcss/vite`**, there is usually **no separate Tailwind CLI watch process**. Tailwind is compiled **as part of Vite** when CSS is imported.

So you **run the app** with:

```bash
npm run dev
```

That single command starts Vite, which serves your app and processes Tailwind when it builds your CSS. Edit HTML/JS, save, and the page hot-reloads.

### 6. Install Three.js

From the project root:

```bash
npm i three
```

In **`src/main.js`** (or another module), import what you need, for example:

```js
import * as THREE from 'three'
```

You no longer need a `<script src="...three.min.js">` CDN tag for this setup; the bundler resolves `three` from `node_modules`.

---

## Responsiveness (window resize)

When the user **resizes the browser window**, the canvas and camera must **update** to match the new width and height. If you only set size once at startup, the 3D view can look **stretched**, **squashed**, or **cropped** after resizing.

### What you set at the start

On first load you already match the window:

```js
renderer.setSize(window.innerWidth, window.innerHeight);
// camera was created with:
// new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
```

- **`renderer.setSize(...)`** — how many pixels wide/tall the **canvas** draws.  
- **`camera.aspect`** — width ÷ height; must stay in sync with the canvas so the **field of view** is not distorted.

### Listen for `resize`

When the window size changes, run the same kind of updates again:

```js
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
```

| Line | What it does |
|------|----------------|
| `window.addEventListener('resize', ...)` | Runs your code whenever the user changes the window size (drag edge, maximize, rotate phone, etc.). |
| `renderer.setSize(window.innerWidth, window.innerHeight)` | Resizes the **drawing buffer** so the canvas fills the new window dimensions. |
| `camera.aspect = window.innerWidth / window.innerHeight` | Updates the camera’s **aspect ratio** so it matches the new canvas shape (wide vs tall). |
| `camera.updateProjectionMatrix()` | Tells Three.js to **rebuild** the camera’s internal projection math after you changed `aspect`. **Required** whenever you change aspect (or FOV, near, far on a perspective camera) — without it, the image can look **squeezed** or wrong. |

### Mental model

1. **Renderer** = “how big is the picture on screen?” → `setSize` on resize.  
2. **Camera aspect** = “is the picture wide or tall?” → `aspect = width / height` on resize.  
3. **`updateProjectionMatrix()`** = “apply the new camera math” → call it after changing `aspect` (or other projection settings).

> **Rule of thumb:** If you change **`camera.aspect`**, **`camera.fov`**, **`camera.near`**, or **`camera.far`** on a `PerspectiveCamera`, call **`camera.updateProjectionMatrix()`** before the next `render`.

### Where this lives in your project

In **project-3-vite-setup**, this block sits in **`src/main.js`** after the initial `renderer.setSize(...)` and before your `animate()` loop, so the scene stays correct whenever the window size changes.

---

## OrbitControls (camera with mouse / touch)

**OrbitControls** is an add-on from Three.js that lets the user **orbit** around a target with the mouse or touch: **rotate** around the scene, **pan** sideways, and **zoom** in and out. It updates the **camera** for you based on input.

It ships with the **`three`** npm package (no extra install). Import it from the addons folder:

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

### Create the controls

Pass the **camera** and the **canvas** (the element that receives pointer events):

```js
const controls = new OrbitControls(camera, canvas);
```

The camera still needs a starting position (e.g. `camera.position.z = 5`). OrbitControls then moves that camera around a **target** point (default: the origin `(0, 0, 0)`).

### Default mouse / touch behavior

| Input | Action |
|--------|--------|
| **Left drag** | Rotate (orbit) around the target |
| **Right drag** (or two-finger drag on trackpad) | Pan |
| **Scroll wheel** | Zoom in / out |

You can turn each action on or off with the `enable*` flags below.

### Options used in **project-3-vite-setup**

```js
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;
controls.enableZoom = true;
controls.zoomSpeed = 1.5;
controls.enablePan = true;
controls.panSpeed = 1.5;
controls.enableRotate = true;
controls.rotateSpeed = 1.5;
```

| Property | What it does |
|----------|----------------|
| **`enableDamping`** | Adds **inertia**: after you release the mouse, the camera **eases to a stop** instead of stopping instantly. Feels smoother. |
| **`dampingFactor`** | How strong the damping is when `enableDamping` is `true`. **Smaller** values often feel like movement **coasts longer**; **larger** values settle **faster**. Tweak until it feels right (e.g. `0.05`–`0.25`). |
| **`autoRotate`** | If `true`, the camera **slowly orbits** around the target on its own (good for demos). |
| **`autoRotateSpeed`** | How fast that automatic orbit runs (default is around `2.0`). |
| **`enableZoom`** | Allow zooming with the scroll wheel (or pinch). Set `false` to disable zoom. |
| **`zoomSpeed`** | Multiplier for zoom sensitivity. |
| **`enablePan`** | Allow moving the view sideways / up-down without rotating. Set `false` to lock panning. |
| **`panSpeed`** | Multiplier for pan sensitivity. |
| **`enableRotate`** | Allow orbiting with left-drag. Set `false` to lock rotation. |
| **`rotateSpeed`** | Multiplier for rotate sensitivity. |

### `controls.update()` — call every frame

When **`enableDamping`** or **`autoRotate`** is on, you must call **`controls.update()`** inside your animation loop **before** `renderer.render`:

```js
function animate() {
    window.requestAnimationFrame(animate);

    controls.update(); // apply damping + auto-rotate for this frame

    renderer.render(scene, camera);
}

animate();
```

| Why | Explanation |
|-----|----------------|
| **Damping** | Each frame, OrbitControls **eases** the camera toward rest; `update()` applies that step. Without it, damping (and smooth motion) will not work. |
| **Auto-rotate** | `update()` advances the automatic orbit each frame. |
| **Order** | Call **`controls.update()`** first, then **`renderer.render(scene, camera)`**, so the picture matches the latest camera position. |

If damping and auto-rotate are both **off**, you can still call `update()` every frame; it is harmless and keeps the habit for when you turn those features on.

### Angles (how orbit rotation is described)

OrbitControls moves the camera on a **sphere** around the target. Two angles describe that position:

| Term | Meaning (simple) |
|------|-------------------|
| **Azimuthal angle** | Rotation around the **vertical** axis — like spinning around the object on a **horizontal** circle (left/right around it). |
| **Polar angle** | Rotation **up and down** from the “north pole” of that sphere — how high or low the camera sits above/below the target. |

You rarely set these directly at first; dragging the mouse changes them. Later you can limit them with `minAzimuthAngle`, `maxPolarAngle`, etc., to stop the user from flipping under the floor or going too far overhead.

### Where this lives in your project

In **project-3-vite-setup** → **`src/main.js`**: import at the top, create `controls` after the renderer and resize listener, then call **`controls.update()`** inside **`animate()`** before **`renderer.render`**.

---

## Geometries (`project-4-geometry`)

A **geometry** defines the **shape** of a 3D object: where its **vertices** (points) are and how they connect into **faces** (usually triangles). It does **not** define color or lighting — that is the **material**.

Every visible object follows the same pattern:

```js
const geometry = new THREE.SomeGeometry(/* size & detail args */);
const material = new THREE.MeshBasicMaterial({ color: 'teal' });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

| Step | Role |
|------|------|
| **Geometry** | “What shape?” |
| **Material** | “How does it look?” (color, wireframe, side, etc.) |
| **Mesh** | Geometry + material, ready to add to the scene |
| **`scene.add(mesh)`** | Puts it in the 3D world |

Use **OrbitControls** and offset positions (`mesh.position.x = 2`) when you show **more than one** shape so they do not sit on top of each other.

---

### What are “segments”?

Many geometries take **segment** counts (e.g. `32` around a circle). Segments control **how smooth** curved surfaces look:

- **More segments** → smoother curves, **more triangles**, **heavier** on the GPU.  
- **Fewer segments** → blocky / low-poly look, **faster**.

While learning, values like `8`–`32` are fine. For a final product, increase until the curve looks smooth enough.

---

### Geometries you have built (cube, sphere, cylinder)

#### 1. Box (cube) — `BoxGeometry`

Used in **project-2-learning** and **project-3-vite-setup**.

```js
// BoxGeometry(width, height, depth)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const mesh = new THREE.Mesh(geometry, material);
```

| Argument | Meaning |
|----------|---------|
| **width** | Size along **X** |
| **height** | Size along **Y** |
| **depth** | Size along **Z** |

A cube is a box with **equal** width, height, and depth (e.g. `1, 1, 1`).

---

#### 2. Sphere — `SphereGeometry`

Used in **project-4-geometry** (`src/main.js`).

```js
// SphereGeometry(radius, widthSegments, heightSegments)
const sphereGeometry = new THREE.SphereGeometry(1, 10, 10);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.x = -2;
scene.add(sphere);
```

| Argument | Meaning |
|----------|---------|
| **radius** | Size of the sphere |
| **widthSegments** | Horizontal slices (around the “equator”) |
| **heightSegments** | Vertical slices (pole to pole) |

**Wireframe** (`wireframe: true` on the material) draws only the edges — great for seeing how many segments you have.

---

#### 3. Cylinder — `CylinderGeometry`

Also in **project-4-geometry**.

```js
// CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded)
const cylinderGeometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 16, 1);
const cylinder = new THREE.Mesh(cylinderGeometry, material);
cylinder.position.x = 2;
scene.add(cylinder);
```

| Argument | Meaning |
|----------|---------|
| **radiusTop** | Radius of the **top** face |
| **radiusBottom** | Radius of the **bottom** face |
| **height** | Height along **Y** |
| **radialSegments** | Slices around the circle (smoothness of the round wall) |
| **heightSegments** | Vertical divisions along the height |
| **openEnded** | `false` (default) = closed caps; `true` = open tube, no top/bottom |

**Shapes from the same constructor:**

```js
// Straight cylinder (your setup)
new THREE.CylinderGeometry(0.6, 0.6, 2, 16, 1);

// Cone (top radius 0)
new THREE.CylinderGeometry(0, 0.8, 2, 16);

// Tapered / frustum (different top and bottom radii)
new THREE.CylinderGeometry(0.3, 0.8, 2, 16);

// Hollow tube (no caps)
new THREE.CylinderGeometry(0.6, 0.6, 2, 16, 1, true);
```

**`side: THREE.DoubleSide`** — By default, materials only render the **front** of each face. On thin or open shapes, the **inside** can look invisible from some angles. Use `DoubleSide` when you need both sides drawn (as with your cylinder material):

```js
new THREE.MeshBasicMaterial({ color: 'coral', side: THREE.DoubleSide });
```

---

### More built-in geometries (try later)

Three.js includes many ready-made shapes. Same pattern: `new THREE.XxxGeometry(...)`, then `Mesh` + `scene.add`.

| Geometry | Constructor (summary) | Typical use |
|----------|------------------------|-------------|
| **PlaneGeometry** | `PlaneGeometry(width, height)` | Floors, walls, screens, grass |
| **CircleGeometry** | `CircleGeometry(radius, segments)` | Flat discs, particles, UI-style circles |
| **RingGeometry** | `RingGeometry(innerRadius, outerRadius, thetaSegments)` | Flat rings, portals, selection rings |
| **ConeGeometry** | `ConeGeometry(radius, height, radialSegments)` | Cones (shortcut; cylinder with top radius `0` works too) |
| **TorusGeometry** | `TorusGeometry(radius, tube, radialSegments, tubularSegments)` | Donut / ring shapes |
| **TorusKnotGeometry** | `TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)` | Decorative twisted rings |
| **CapsuleGeometry** | `CapsuleGeometry(radius, length, capSegments, radialSegments)` | Pills, characters, rounded bodies |
| **Polyhedra** | `TetrahedronGeometry`, `OctahedronGeometry`, `DodecahedronGeometry`, `IcosahedronGeometry`, `PolyhedronGeometry` | Crystals, dice, low-poly planets |

**Quick examples to copy:**

```js
// Flat ground plane
new THREE.PlaneGeometry(5, 5);

// Donut
new THREE.TorusGeometry(1, 0.3, 16, 100);

// Cone
new THREE.ConeGeometry(1, 2, 32);
```

---

### Material tips while learning geometries

| Option | Effect |
|--------|--------|
| **`wireframe: true`** | Shows edges and segment layout (good for sphere/cylinder study) |
| **`color: 'teal'`** or **`0x00ffaa`** | Solid color (string or hex number) |
| **`side: THREE.DoubleSide`** | Renders front and back of faces |
| **`side: THREE.FrontSide`** | Default — only front faces |

`MeshBasicMaterial` ignores lights, so you can focus on **shape** first. Later, use **`MeshStandardMaterial`** + lights for realistic surfaces.

---

### Custom geometry (advanced, for later)

- **`BufferGeometry`** — you supply your own vertex positions (and optional normals, UVs). Used for loaded models, particles, and custom meshes.  
- **Loaders** (e.g. **GLTFLoader**) — import `.gltf` / `.glb` models from Blender or other tools instead of only primitives.

For this course stage, **built-in geometries** are enough to learn size, segments, and how meshes sit in the scene.

---

### Checklist — adding a new shape

1. Create geometry with the right constructor and arguments.  
2. Create material (color, wireframe, `side` if needed).  
3. `new THREE.Mesh(geometry, material)`.  
4. Optional: `mesh.position.set(x, y, z)` so it does not overlap others.  
5. `scene.add(mesh)`.  
6. Keep **`renderer.render`** (and **`controls.update()`** if using OrbitControls) in your loop.

**Project folder:** **project-4-geometry** — sphere and cylinder in **`src/main.js`**; cube/box from earlier projects.

---

## Animation timing (summary)

| Approach | Tied to | Problem or use |
|----------|---------|----------------|
| `mesh.rotation.y += 0.01` each frame | **Frame count** | Speed changes when FPS changes. |
| `mesh.rotation.y = clock.getElapsedTime()` | **Total time** | Smooth, consistent spin from absolute time. |
| `mesh.rotation.y += speed * clock.getDelta()` | **Time per frame** | Consistent **speed** when you prefer “add a little each frame.” |

---

## Quick glossary

- **Geometry** — “what shape is it?”  
- **Material** — “how does its surface look (color, reaction to light, etc.)?”  
- **Mesh** — geometry + material, as one object.  
- **Near / far (camera)** — only things between these distances from the camera are drawn; keeps depth precision reasonable.  
- **Aspect ratio** — width ÷ height of the canvas; must match how you draw so shapes are not stretched.
