let sketch: Sketch;
let p5instance = new p5((p: p5) => {
    sketch = new Sketch(p);
    p.preload = () => sketch.preload();
    p.setup = () => sketch.setup();
    p.draw = () => sketch.draw();
}, document.getElementById('canvas'));