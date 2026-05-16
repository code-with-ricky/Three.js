# Three.js tutorial — learning notes

Notes from the hands-on projects (starting with **project-2-learning**). Use this as a quick reference while you code.

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

### Summary

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

---

## Next steps (when you are ready)

- **Lights** + materials like `MeshStandardMaterial` so surfaces respond to light.  
- **Resize** handling so the camera aspect and renderer size stay correct when the window changes.  
- **OrbitControls** or custom input so the user can move the camera with the mouse.

Happy learning.
