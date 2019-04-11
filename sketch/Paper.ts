class Paper {
    title: string;
    year: number;
    authors: string[];
    affiliation: string;
    citations: number;
    minCitations: number;
    maxCitations: number;

    x: number;
    y: number;
    displayMode: DisplayMode;

    currentColor: p5.Color;
    currentConnectionColor: p5.Color;
    highlightColor: p5.Color;
    grayColor: p5.Color;
    
    constructor(
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
        this.currentColor = lerpColor(this.currentColor, targetColor, 0.1);

        var targetConnectionColor: p5.Color;
        if (this.displayMode != DisplayMode.GRAYED && previousPaper != undefined && previousPaper.displayMode != DisplayMode.GRAYED)
            targetConnectionColor = this.highlightColor;
        else
            targetConnectionColor = this.grayColor;
        this.currentConnectionColor = lerpColor(this.currentConnectionColor, targetConnectionColor, 0.1);
    }

    isMouseOver(mouseX: number, mouseY: number): boolean {
        return sqrt(pow(mouseX - this.x, 2) + pow(mouseY - this.y, 2)) <= this.getRadius() / 2;
    }
    
    getRadius(): number {
        var minArea = 500;
        var maxArea = 10000;
        var area = map(this.citations, this.minCitations, this.maxCitations, minArea, maxArea);
        var radius = sqrt(area / PI);
        return radius;
    }

    drawShape(previousPaper: Paper) {
        var radius = this.getRadius();
        fill(this.currentColor);
        strokeWeight(0);
        ellipse(this.x, this.y, radius);
        
        var yearSize = 12;
        var textColor = this.displayMode == DisplayMode.GRAYED ? this.grayColor : color(0);
        if (previousPaper !== undefined && this.x < previousPaper.x)
            textWithBackground(this.year.toString(), yearSize, this.x - radius / 2 - 10, this.y, RIGHT, CENTER, textColor);
        else
            textWithBackground(this.year.toString(), yearSize, this.x + radius / 2 + 10, this.y, LEFT, CENTER, textColor);
    }

    drawConnection(previousPaper: Paper) {
        if (previousPaper !== undefined) {
            strokeWeight(1);
            stroke(this.currentConnectionColor);
            line(this.x, this.y, previousPaper.x, previousPaper.y);
        }
    }

    drawTitle() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.title + ' (' + this.citations + ' citations)';
            textWithBackground(titleText, 12, this.x, this.y - this.getRadius()/2 - 10, CENTER, BOTTOM, this.highlightColor);
        }
    }
}