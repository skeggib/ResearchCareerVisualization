function drawTitle(author: string, x: number, y: number) {
    textWithBackground(author, 20, x, y, CENTER, CENTER, color(0));
}

function dashedLine(x1: number, y1: number, x2: number, y2: number) {
    var distance = sqrt(pow(x1-x2, 2) + pow(y1-y2, 2));
    var nbPoints = distance / 2;
    var increment = 1 / nbPoints;
    for (let n = 0; n < 1; n += increment * 2) {
        var lineX1 = lerp(x1, x2, n);
        var lineY1 = lerp(y1, y2, n);
        var lineX2 = lerp(x1, x2, n + increment);
        var lineY2 = lerp(y1, y2, n + increment);
        line(lineX1, lineY1, lineX2, lineY2);
    }
}

function textWithBackground(
    textToDisplay: string,
    size: number,
    x: number,
    y: number,
    hAlign: p5.HORIZ_ALIGN,
    vAlign: p5.VERT_ALIGN,
    color: p5.Color) {

    textAlign(hAlign, vAlign);
    strokeWeight(0);
    textSize(size);
    var textW = textWidth(textToDisplay);
    var rectX = x;
    switch (hAlign) {
        case CENTER:
            rectX -= textW / 2;
            break;
        case RIGHT:
            rectX -= textW;
            break;
    }
    var rectY = y;
    switch (vAlign) {
        case CENTER:
            rectY -= size / 2;
            break;
        case BOTTOM:
            rectY -= size;
            break;
    }
    fill(255);
    rect(rectX, rectY, textW, size);
    fill(color);
    text(textToDisplay, x, y);
}