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
    color: p5.Color;
    gray: p5.Color;
    
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
        ellipse(this.x, this.y, radius);
        
        var yearSize = 12;
        var textColor = this.displayMode == DisplayMode.GRAYED ? this.gray : color(0);
        if (previousPaper !== undefined && this.x < previousPaper.x)
            textWithBackground(this.year.toString(), yearSize, this.x - radius / 2 - 10, this.y, RIGHT, CENTER, textColor);
        else
            textWithBackground(this.year.toString(), yearSize, this.x + radius / 2 + 10, this.y, LEFT, CENTER, textColor);
    }

    drawConnection(previousPaper: Paper) {
        if (previousPaper !== undefined) {
            strokeWeight(1);
            switch (this.displayMode) {
                case DisplayMode.NORMAL:
                    if (previousPaper.displayMode != DisplayMode.GRAYED)
                        stroke(this.color);
                    else
                        stroke(this.gray);
                    break;
                case DisplayMode.GRAYED:
                    stroke(this.gray);
                    break;
                case DisplayMode.HIGHLIGHTED:
                    if (previousPaper.displayMode != DisplayMode.GRAYED)
                        stroke(this.color);
                    else
                        stroke(this.gray);
                    break;
            }
            line(this.x, this.y, previousPaper.x, previousPaper.y);
        }
    }

    drawTitle() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.title + ' (' + this.citations + ' citations)';
            textWithBackground(titleText, 12, this.x, this.y - this.getRadius()/2 - 10, CENTER, BOTTOM, this.color);
        }
    }
}