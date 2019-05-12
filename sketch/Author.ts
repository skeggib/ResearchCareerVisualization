class Author {
    name: string;
    citations: number;
    papers: Paper[];
    minAuthorCitations: number;
    maxAuthorCitations: number;

    x: number;
    y: number;
    displayMode: DisplayMode;
    left: boolean;
    
    currentColor: p5.Color;
    currentConnectionColor: p5.Color;
    highlightColor: p5.Color;
    grayColor: p5.Color;

    constructor(private p: p5, name: string, citations: number) {
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
        this.currentColor = this.p.lerpColor(this.currentColor, targetColor, 0.1);
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
        var area = this.p.map(this.citations, this.minAuthorCitations, this.maxAuthorCitations, minArea, maxArea);
        if (isNaN(area))
            area = (minArea + maxArea) / 2;
        return this.p.sqrt(area / this.p.PI);
    }

    drawShape() {
        var size = this.getSize();
        this.p.fill(this.currentColor);
        this.p.strokeWeight(0);
        this.p.rect(this.x - size / 2, this.y - size / 2, size, size);
    }

    drawConnections() {
        this.p.strokeWeight(1);
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                this.p.stroke(this.currentColor);
                this.papers.forEach(paper => dashedLine(this.p, this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.GRAYED:
                this.p.stroke(this.currentColor);
                this.papers.forEach(paper => dashedLine(this.p, this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.HIGHLIGHTED:
                this.papers.forEach(paper => {
                    if (paper.displayMode == DisplayMode.HIGHLIGHTED) {
                        this.p.stroke(this.highlightColor);
                        this.p.line(this.x, this.y, paper.x, paper.y);
                    } else {
                        this.p.stroke(this.grayColor);
                        this.papers.forEach(paper => dashedLine(this.p, this.x, this.y, paper.x, paper.y));
                    }
                });
                break;
        }
    }

    drawName() {
        var color = this.displayMode == DisplayMode.GRAYED ? this.grayColor : this.highlightColor;
        var titleText = this.name;// + ' (' + this.citations + ' citations)';
        if (this.left)
            textWithBackground(this.p, titleText, 12, this.x - this.getSize() / 2 - 10, this.y, this.p.RIGHT, this.p.CENTER, color);
        else
            textWithBackground(this.p, titleText, 12, this.x + this.getSize() / 2 + 10, this.y, this.p.LEFT, this.p.CENTER, color);
    }
}