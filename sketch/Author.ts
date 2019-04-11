class Author {
    name: string;
    citations: number;
    papers: Paper[];
    minAuthorCitations: number;
    maxAuthorCitations: number;

    x: number;
    y: number;
    displayMode: DisplayMode;
    
    currentColor: p5.Color;
    currentConnectionColor: p5.Color;
    highlightColor: p5.Color;
    grayColor: p5.Color;

    constructor(name: string, citations: number) {
        this.name = name;
        this.citations = citations;
        this.papers = new Array<Paper>();
    }

    animate() {
        var targetColor: p5.Color;
        if (this.displayMode == DisplayMode.GRAYED)
            targetColor = this.grayColor;
        else
            targetColor = this.highlightColor;
        this.currentColor = lerpColor(this.currentColor, targetColor, 0.1);
    }

    isMouseOver(mouseX: number, mouseY: number): boolean {
        var size = this.getSize();
        return mouseX >= this.x - size / 2 &&
               mouseX <= this.x + size / 2 &&
               mouseY >= this.y - size / 2 &&
               mouseY <= this.y + size / 2;
    }

    getSize(): number {
        var minArea = 250;
        var maxArea = 5000;
        var area = map(this.citations, this.minAuthorCitations, this.maxAuthorCitations, minArea, maxArea);
        return sqrt(area / PI);
    }

    drawShape() {
        var size = this.getSize();
        fill(this.currentColor);
        strokeWeight(0);
        rect(this.x - size / 2, this.y - size / 2, size, size);
    }

    drawConnections() {
        strokeWeight(1);
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                stroke(this.currentColor);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.GRAYED:
                stroke(this.currentColor);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.HIGHLIGHTED:
                this.papers.forEach(paper => {
                    if (paper.displayMode == DisplayMode.HIGHLIGHTED) {
                        stroke(this.highlightColor);
                        line(this.x, this.y, paper.x, paper.y);
                    } else {
                        stroke(this.grayColor);
                        this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                    }
                });
                break;
        }
    }

    drawName() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.name + ' (' + this.citations + ' citations)';
            textWithBackground(titleText, 12, this.x, this.y + this.getSize() / 2 + 10, CENTER, TOP, this.highlightColor);
        }
    }
}