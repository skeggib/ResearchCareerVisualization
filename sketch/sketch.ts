let table: p5.Table;
let author = "Alex T. Pang";
//let author = "Tamara Munzner";
//let author = "Heidrun Schumann";
let papers: Paper[];
let canvasWidth = window.innerWidth;
let topMargin = 130;
let coauthors: Author[];
let yStep = 70;

function preload() {
    // @ts-ignore
    table = loadTable('data/IEEE VIS papers 1990-2018 - Main dataset.csv', 'csv', 'header');
}

function setup() {
    papers = getAuthorPapers(author, table);

    var minCitations = Infinity;
    var maxCitations = 0;
    papers.forEach(paper => {
        if (paper.citations < minCitations)
            minCitations = paper.citations;
        if (paper.citations > maxCitations)
            maxCitations = paper.citations;
    });
    papers.forEach(paper => {
        paper.minCitations = minCitations;
        paper.maxCitations = maxCitations;
        paper.color = color("#11144c");
        paper.gray = color(210);
    });

    initializePapersPositions(papers);

    coauthors = getUniqueAuthors(papers);
    
    removeFirst(coauthors, coauthor => coauthor.name == author);

    var minAuthorCitations = Infinity;
    var maxAuthorCitations = 0;
    coauthors.forEach(coauthor => {
        if (coauthor.citations < minAuthorCitations)
            minAuthorCitations = coauthor.citations;
        if (coauthor.citations > maxAuthorCitations)
            maxAuthorCitations = coauthor.citations;
    });
    coauthors.forEach(coauthor => {
        coauthor.minAuthorCitations = minAuthorCitations;
        coauthor.maxAuthorCitations = maxAuthorCitations;
        coauthor.color = color("#3a9679");
        coauthor.gray = color(210);
    });
    
    initializeCoauthorsPositions(coauthors);
    
    createCanvas(canvasWidth, papers.length * yStep + topMargin);
}

function draw() {
    clear();
    drawTitle(author, canvasWidth / 2, topMargin / 2);

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

function removeFirst<T>(array: Array<T>, predicate: (item: T) => boolean) {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if (predicate(element)) {
            array.splice(i, 1);
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