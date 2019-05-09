function drawTitle(p: p5, author: string, x: number, y: number) {
    textWithBackground(p, author, 20, x, y, p.CENTER, p.CENTER, p.color(0));
}

function dashedLine(p: p5, x1: number, y1: number, x2: number, y2: number) {
    var distance = p.sqrt(p.pow(x1-x2, 2) + p.pow(y1-y2, 2));
    var nbPoints = distance / 2;
    var increment = 1 / nbPoints;
    for (let n = 0; n < 1; n += increment * 2) {
        var lineX1 = p.lerp(x1, x2, n);
        var lineY1 = p.lerp(y1, y2, n);
        var lineX2 = p.lerp(x1, x2, n + increment);
        var lineY2 = p.lerp(y1, y2, n + increment);
        p.line(lineX1, lineY1, lineX2, lineY2);
    }
}

function textWithBackground(
    p: p5,
    textToDisplay: string,
    size: number,
    x: number,
    y: number,
    hAlign: p5.HORIZ_ALIGN,
    vAlign: p5.VERT_ALIGN,
    color: p5.Color) {

    p.textAlign(hAlign, vAlign);
    p.strokeWeight(0);
    p.textSize(size);
    var textW = p.textWidth(textToDisplay);
    var rectX = x;
    switch (hAlign) {
        case p.CENTER:
            rectX -= textW / 2;
            break;
        case p.RIGHT:
            rectX -= textW;
            break;
    }
    var rectY = y;
    switch (vAlign) {
        case p.CENTER:
            rectY -= size / 2;
            break;
        case p.BOTTOM:
            rectY -= size;
            break;
    }
    p.fill(255);
    p.rect(rectX, rectY, textW, size);
    p.fill(color);
    p.text(textToDisplay, x, y);
}