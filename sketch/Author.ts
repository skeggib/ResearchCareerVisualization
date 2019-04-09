class Author {
    name: string;
    citations: number;
    papers: Paper[];
    minAuthorCitations: number;
    maxAuthorCitations: number;

    x: number;
    y: number;
    displayMode: DisplayMode;
    color: p5.Color;
    gray: p5.Color;

    constructor(name: string, citations: number) {
        this.name = name;
        this.citations = citations;
        this.papers = new Array<Paper>();
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
        
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                fill(this.color);
                break;
            case DisplayMode.GRAYED:
                fill(this.gray);
                break;
            case DisplayMode.HIGHLIGHTED:
                fill(this.color);
                break;
        }

        strokeWeight(0);
        rect(this.x - size / 2, this.y - size / 2, size, size);
    }

    drawConnections() {
        strokeWeight(1);
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                stroke(this.color);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.GRAYED:
                stroke(this.gray);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.HIGHLIGHTED:
                stroke(this.color);
                this.papers.forEach(paper => {
                    if (paper.displayMode == DisplayMode.HIGHLIGHTED)
                        line(this.x, this.y, paper.x, paper.y)
                });
                break;
        }
    }

    drawName() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.name + ' (' + this.citations + ' citations)';
            textWithBackground(titleText, 12, this.x, this.y + this.getSize() / 2 + 10, CENTER, TOP, this.color);
        }
    }
}