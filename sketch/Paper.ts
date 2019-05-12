class Paper {
    title: string;
    year: number;
    authors: string[];
    affiliation: string;
    citations: number;
    minCitations: number;
    maxCitations: number;
    keywords: string[];
    abstract: string;
    doi: string;

    x: number;
    y: number;
    displayMode: DisplayMode;

    currentColor: p5.Color;
    currentConnectionColor: p5.Color;
    highlightColor: p5.Color;
    grayColor: p5.Color;
    
    constructor(
        private p: p5,
        title: string,
        year: number,
        authors: string[],
        affiliation: string,
        citations: number) {

        this.title = title;
        this.year = year;
        this.authors = authors;
        this.affiliation = affiliation;
        this.citations = citations;
        if (this.citations == null || isNaN(this.citations))
            this.citations = 0;
    }

    animate(previousPaper: Paper) {
        var targetColor: p5.Color;
        if (this.displayMode == DisplayMode.GRAYED)
            targetColor = this.grayColor;
        else
            targetColor = this.highlightColor;
        this.currentColor = this.p.lerpColor(this.currentColor, targetColor, 0.1);

        var targetConnectionColor: p5.Color;
        if (this.displayMode != DisplayMode.GRAYED && previousPaper != undefined && previousPaper.displayMode != DisplayMode.GRAYED)
            targetConnectionColor = this.highlightColor;
        else
            targetConnectionColor = this.grayColor;
        this.currentConnectionColor = this.p.lerpColor(this.currentConnectionColor, targetConnectionColor, 0.1);
    }

    isMouseOver(mouseX: number, mouseY: number): boolean {
        return this.p.sqrt(this.p.pow(mouseX - this.x, 2) + this.p.pow(mouseY - this.y, 2)) <= this.getRadius() / 2;
    }
    
    getRadius(): number {
        var minArea = 500;
        var maxArea = 10000;
        var area = this.p.map(this.citations, this.minCitations, this.maxCitations, minArea, maxArea);
        if (isNaN(area))
            area = (minArea + maxArea) / 2;
        var radius = this.p.sqrt(area / this.p.PI);
        return radius;
    }

    drawShape(previousPaper: Paper) {
        var radius = this.getRadius();
        this.p.fill(this.currentColor);
        this.p.strokeWeight(0);
        this.p.ellipse(this.x, this.y, radius);
        
        var yearSize = 12;
        var textColor = this.displayMode == DisplayMode.GRAYED ? this.grayColor : this.p.color(0);
        if (previousPaper === undefined || previousPaper.year != this.year) {
            if (previousPaper !== undefined && this.x < previousPaper.x)
                textWithBackground(this.p, this.year.toString(), yearSize, this.x - radius / 2 - 10, this.y, this.p.RIGHT, this.p.CENTER, textColor);
            else
                textWithBackground(this.p, this.year.toString(), yearSize, this.x + radius / 2 + 10, this.y, this.p.LEFT, this.p.CENTER, textColor);
        }
    }

    drawConnection(previousPaper: Paper) {
        if (previousPaper !== undefined) {
            this.p.strokeWeight(1);
            this.p.stroke(this.currentConnectionColor);
            this.p.line(this.x, this.y, previousPaper.x, previousPaper.y);
        }
    }

    drawTitle() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.title + ' (' + this.citations + ' citations)';
            textWithBackground(this.p, titleText, 12, this.x, this.y - this.getRadius()/2 - 10, this.p.CENTER, this.p.BOTTOM, this.highlightColor);
        }
    }
}