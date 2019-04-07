let table: p5.Table;
let author = "Alex T. Pang";
let papers: Paper[];
let canvasWidth = window.innerWidth;
let minCitations: number;
let maxCitations: number;
let topMargin = 200;
let coauthors: Author[];
let minAuthorCitations: number;
let maxAuthorCitations: number;
let yStep = 75;

function preload() {
    table = loadTable(
        'data/IEEE VIS papers 1990-2018 - Main dataset.csv',
        'csv', 
        'header');
}

function setup() {    
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
    coauthors.splice( coauthors.find(author => author.name == author), 1 );

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

function getAuthorCitations(author: string) {
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

function draw() {
    clear();

    drawTitle(author);

    var previousPaper: Paper = null;
    papers.forEach(paper => {
        drawPaper(paper, previousPaper);
        previousPaper = paper;
    });

    coauthors.forEach(coauthor => {
        drawCoauthor(coauthor);
    });
}

function drawCoauthor(coauthor: Author) {
    fill(0, 0, 0);
    strokeWeight(0);
    var minArea = 250;
    var maxArea = 5000;
    var area = map(coauthor.citations, minAuthorCitations, maxAuthorCitations, minArea, maxArea);
    var size = sqrt(area / PI);
    rect(coauthor.x - size / 2, coauthor.y - size / 2, size, size);

    var mouseOver = 
        mouseX >= coauthor.x - size / 2 &&
        mouseX <= coauthor.x + size / 2 &&
        mouseY >= coauthor.y - size / 2 &&
        mouseY <= coauthor.y + size / 2;
    if (mouseOver) {
        var titleText = coauthor.name + ' (' + coauthor.citations + ' citations)';
        textAlign(CENTER, BOTTOM);
        strokeWeight(0);
        var textW = textWidth(titleText);
        fill(255);
        rect(coauthor.x - textW / 2, coauthor.y - size / 2 - 10 - 12, textW, 12);
        fill(0);
        text(titleText, coauthor.x, coauthor.y - size / 2 - 10);
    }
    
    strokeWeight(1);
    stroke(0, 0, 0);
    coauthor.papers.forEach(paper => {
        if (mouseOver) {
            line(coauthor.x, coauthor.y, paper.x, paper.y);
        } else {
            dashedLine(coauthor.x, coauthor.y, paper.x, paper.y);
        }
    });
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

function drawTitle(author: string) {
    textSize(20);
    textAlign(CENTER, CENTER);
    strokeWeight(0);
    fill(0, 0, 0);
    text(author, canvasWidth / 2, topMargin / 3);
}

function drawPaper(paper: Paper, previousPaper: Paper = null) {
    var minArea = 500;
    var maxArea = 10000;
    var area = map(paper.citations, minCitations, maxCitations, minArea, maxArea);
    var radius = sqrt(area / PI);
    fill(0, 0, 0);
    stroke(0, 0, 0);
    strokeWeight(0);
    textSize(12);
    ellipse(paper.x, paper.y, radius);
    if (previousPaper != null && paper.x < previousPaper.x) {
        textAlign(RIGHT, CENTER);
        text(paper.year, paper.x - radius / 2 - 10, paper.y);
    } else {
        textAlign(LEFT, CENTER);
        text(paper.year, paper.x + radius / 2 + 10, paper.y);
    }
    if (previousPaper != null) {
        strokeWeight(1);
        line(paper.x, paper.y, previousPaper.x, previousPaper.y);
    }

    var mouseOver = sqrt(pow(mouseX - paper.x, 2) + pow(mouseY - paper.y, 2)) <= radius / 2;
    if (mouseOver) {
        var titleText = paper.title + ' (' + paper.citations + ' citations)';
        textAlign(CENTER, BOTTOM);
        strokeWeight(0);
        var textW = textWidth(titleText);
        fill(255);
        rect(paper.x - textW / 2, paper.y - radius / 2 - 10 - 12, textW, 12);
        fill(0);
        text(titleText, paper.x, paper.y - radius / 2 - 10);
    }
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

class Author {
    name: string;
    citations: number;
    papers: Paper[];

    x: number;
    y: number;

    constructor(name: string, citations: number) {
        this.name = name;
        this.citations = citations;
        this.papers = new Array<Paper>();
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
    
    constructor(title: string, year: number, authors: string[], affiliation: string, citations: number) {
        this.title = title;
        this.year = year;
        this.authors = authors;
        this.affiliation = affiliation;
        this.citations = citations;
        if (this.citations == null || isNaN(this.citations))
            this.citations = 0;
    }
}