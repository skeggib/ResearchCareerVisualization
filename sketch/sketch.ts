let table: p5.Table;
let author = "Alex T. Pang";
//let author = "Tamara Munzner";
//let author = "Heidrun Schumann";
let papers: Paper[];
let canvasWidth = window.innerWidth;
let minCitations: number;
let maxCitations: number;
let topMargin = 150;
let coauthors: Author[];
let minAuthorCitations: number;
let maxAuthorCitations: number;
let yStep = 75;
let grayedColor: p5.Color;
let paperColor: p5.Color;
let authorColor: p5.Color;

function preload() {
    // @ts-ignore
    table = loadTable('data/IEEE VIS papers 1990-2018 - Main dataset.csv', 'csv', 'header');
}

function setup() {
    grayedColor = color(210);
    paperColor = color("#11144c");
    authorColor = color("#3a9679");

    papers = getAuthorPapers(author, table);

    minCitations = Infinity;
    maxCitations = 0;
    papers.forEach(paper => {
        if (paper.citations < minCitations)
            minCitations = paper.citations;
        if (paper.citations > maxCitations)
            maxCitations = paper.citations;
    });

    initializePapersPositions(papers);

    coauthors = getUniqueAuthors(papers);
    
    coauthors.remove(coauthor => coauthor.name == author);

    minAuthorCitations = Infinity;
    maxAuthorCitations = 0;
    coauthors.forEach(coauthor => {
        if (coauthor.citations < minAuthorCitations)
            minAuthorCitations = coauthor.citations;
        if (coauthor.citations > maxAuthorCitations)
            maxAuthorCitations = coauthor.citations;
    });
    
    initializeCoauthorsPositions(coauthors);
    
    createCanvas(canvasWidth, papers.length * yStep + topMargin);
}

function draw() {
    clear();
    drawTitle(author);

    var isMouseOverSomething = false;
    var highlightedPaper: Paper = undefined;
    var highlightedCoauthor: Author = undefined;
    papers.forEach(paper => {
        if (paper.isMouseOver(mouseX, mouseY)) {
            isMouseOverSomething = true;
            highlightedPaper = paper;
        }
    });
    coauthors.forEach(coauthor => {
        if (coauthor.isMouseOver(mouseX, mouseY)) {
            isMouseOverSomething = true;
            highlightedCoauthor = coauthor;
        }
    });

    papers.forEach(paper => {
        paper.displayMode = isMouseOverSomething ? DisplayMode.GRAYED : DisplayMode.NORMAL;
    });
    coauthors.forEach(coauthor => {
        coauthor.displayMode = isMouseOverSomething ? DisplayMode.GRAYED : DisplayMode.NORMAL;
    });

    if (highlightedPaper !== undefined) {
        highlightedPaper.displayMode = DisplayMode.HIGHLIGHTED;
        coauthors.forEach(coauthor => {
            if (coauthor.papers.indexOf(highlightedPaper) >= 0)
                coauthor.displayMode = DisplayMode.HIGHLIGHTED;
        });
    }
    if (highlightedCoauthor !== undefined) {
        highlightedCoauthor.displayMode = DisplayMode.HIGHLIGHTED;
        highlightedCoauthor.papers.forEach(paper => paper.displayMode = DisplayMode.HIGHLIGHTED);
    }

    for (let i = 0; i < papers.length; i++)
        papers[i].drawConnection(i > 0 ? papers[i-1] : undefined);

    for (let i = 0; i < coauthors.length; i++)
        coauthors[i].drawConnections();
    
    for (let i = 0; i < papers.length; i++)
        papers[i].drawShape(i > 0 ? papers[i-1] : undefined);

    for (let i = 0; i < coauthors.length; i++)
        coauthors[i].drawShape();

    for (let i = 0; i < coauthors.length; i++)
        coauthors[i].drawName();

    for (let i = 0; i < papers.length; i++)
        papers[i].drawTitle();
}

interface Array<T> {
    remove(predicate: (item: T) => boolean): void;
}

Array.prototype.remove = function(predicate) {
    for (let i = 0; i < this.length; i++) {
        const element = this[i];
        if (predicate(element)) {
            this.splice(i, 1);
            return;
        }
    }
}

function getAuthorCitations(author: string): number {
    var citations = 0;
    for (let i = 0; i < table.getRowCount(); i++) {
        const row = table.getRow(i);
        if (row.get('AuthorNames-Deduped').toString().split(';').indexOf(author) >= 0) {
            var paperCitations = parseInt(row.get('AminerCitationCount_02-2019').toString());
            citations += isNaN(paperCitations) ? 0 : paperCitations;
        }
    }
    return citations;
}

function getUniqueAuthors(papers: Paper[]): Author[] {
    var authors = new Array<Author>();

    papers.forEach(paper => {
        paper.authors.forEach(authorName => {
            // @ts-ignore
            var author = authors.find(author => author.name == authorName);
            if (author == undefined) {
                author = new Author(authorName, getAuthorCitations(authorName));
                author.papers.push(paper);
                authors.push(author);
            } else {
                author.papers.push(paper);
            }
        });
    });

    return authors;
}

function getAuthorPapers(author: string, table: p5.Table): Paper[] {
    var papers = Array<Paper>();
    for (let i = 0; i < table.getRowCount(); i++) {
        const row = table.getRow(i);
        const authorsStr = row.get('AuthorNames-Deduped').toString();
        if (authorsStr.indexOf(author) >= 0) {
            var authors = Array<string>();
            authorsStr.split(';').forEach(author => {
                authors.push(author);
            });
            var title = row.get('Title').toString();
            var year = parseInt(row.get('Year').toString());
            var authors = authors;
            var affiliation = row.get('AuthorAffiliation').toString();
            var citations = parseInt(row.get('AminerCitationCount_02-2019').toString());
            papers.push(new Paper(title, year, authors, affiliation, citations));
        }
    }
    return papers.sort((a, b) => a.year - b.year);;
}

function initializePapersPositions(papers: Paper[]) {
    var maxOffset = 50;
    for (let i = 0; i < papers.length; i++) {
        if (i == 0)
            papers[i].x = canvasWidth / 2;
        else if (papers[i-1].x < canvasWidth / 3)
            papers[i].x = papers[i-1].x + random(0, maxOffset);
        else if (papers[i-1].x > canvasWidth / 3 * 2)
            papers[i].x = papers[i-1].x + random(-maxOffset, 0);
        else
            papers[i].x = papers[i-1].x + random(-maxOffset, maxOffset);

        papers[i].y = topMargin + i * yStep;
    }
}

function initializeCoauthorsPositions(coauthors: Author[]) {
    for (let i = 0; i < coauthors.length; i++) {
        const coauthor = coauthors[i];
        if (coauthor.papers.length == 1) {
            coauthor.x = i%2 == 0 ? coauthor.papers[0].x + 200 : coauthor.papers[0].x - 200;
            coauthor.y = coauthor.papers[0].y + random(-50, 50);
        } else {
            var minX = canvasWidth;
            var maxX = 0;
            var meanY = 0;
            coauthor.papers.forEach(paper => {
                if (paper.x < minX)
                    minX = paper.x;
                if (paper.x > maxX)
                    maxX = paper.x;
                meanY += paper.y;
            });
            meanY /= coauthor.papers.length;

            coauthor.x = i%2 == 0 ? maxX + 300 : minX - 300;
            coauthor.y = meanY;;
        }
    }
}

function drawTitle(author: string) {
    textSize(20);
    textAlign(CENTER, CENTER);
    strokeWeight(0);
    fill(0, 0, 0);
    text(author, canvasWidth / 2, topMargin / 3);
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

class Author {
    name: string;
    citations: number;
    papers: Paper[];

    x: number;
    y: number;
    displayMode: DisplayMode;

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
        var area = map(this.citations, minAuthorCitations, maxAuthorCitations, minArea, maxArea);
        return sqrt(area / PI);
    }

    drawShape() {
        var size = this.getSize();
        
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                fill(authorColor);
                break;
            case DisplayMode.GRAYED:
                fill(grayedColor);
                break;
            case DisplayMode.HIGHLIGHTED:
                fill(authorColor);
                break;
        }

        strokeWeight(0);
        rect(this.x - size / 2, this.y - size / 2, size, size);
    }

    drawConnections() {
        strokeWeight(1);
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                stroke(authorColor);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.GRAYED:
                stroke(grayedColor);
                this.papers.forEach(paper => dashedLine(this.x, this.y, paper.x, paper.y));
                break;
            case DisplayMode.HIGHLIGHTED:
                stroke(authorColor);
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
            textWithBackground(titleText, 12, this.x, this.y + this.getSize() / 2 + 10, CENTER, TOP, authorColor);
        }
    }
}

class Paper {
    title: string;
    year: number;
    authors: string[];
    affiliation: string;
    citations: number;

    x: number;
    y: number;
    displayMode: DisplayMode;
    
    constructor(title: string, year: number, authors: string[], affiliation: string, citations: number) {
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
        var area = map(this.citations, minCitations, maxCitations, minArea, maxArea);
        var radius = sqrt(area / PI);
        return radius;
    }

    drawShape(previousPaper: Paper) {
        var radius = this.getRadius();
        
        switch (this.displayMode) {
            case DisplayMode.NORMAL:
                fill(paperColor);
                break;
            case DisplayMode.GRAYED:
                fill(grayedColor);
                break;
            case DisplayMode.HIGHLIGHTED:
                fill(paperColor);
                break;
        }

        strokeWeight(0);
        ellipse(this.x, this.y, radius);
        
        var yearSize = 12;
        var textColor = this.displayMode == DisplayMode.GRAYED ? grayedColor : color(0);
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
                        stroke(paperColor);
                    else
                        stroke(grayedColor);
                    break;
                case DisplayMode.GRAYED:
                    stroke(grayedColor);
                    break;
                case DisplayMode.HIGHLIGHTED:
                    if (previousPaper.displayMode != DisplayMode.GRAYED)
                        stroke(paperColor);
                    else
                        stroke(grayedColor);
                    break;
            }
            line(this.x, this.y, previousPaper.x, previousPaper.y);
        }
    }

    drawTitle() {
        if (this.displayMode == DisplayMode.HIGHLIGHTED) {
            var titleText = this.title + ' (' + this.citations + ' citations)';
            textWithBackground(titleText, 12, this.x, this.y - this.getRadius()/2 - 10, CENTER, BOTTOM, paperColor);
        }
    }
}

enum DisplayMode {
    NORMAL,
    GRAYED,
    HIGHLIGHTED
}