let sketchKeywords: SketchKeywords;
let p5Keywords = new p5((p: p5) => {
    sketchKeywords = new SketchKeywords(p);
    p.preload = () => sketchKeywords.preload();
    p.setup = () => sketchKeywords.setup();
    p.draw = () => sketchKeywords.draw();
}, document.getElementById('canvas-keywords'));

let sketchPapers: SketchPapers;
let p5Papers = new p5((p: p5) => {
    sketchPapers = new SketchPapers(p);
    p.preload = () => sketchPapers.preload();
    p.setup = () => sketchPapers.setup();
    p.draw = () => sketchPapers.draw();
}, document.getElementById('canvas-papers'));