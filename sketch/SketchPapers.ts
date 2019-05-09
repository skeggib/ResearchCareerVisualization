class SketchPapers {
    papersTable: p5.Table;
    authorsTable: p5.Table;
    author = "Alex T. Pang";
    papers: Paper[];
    canvasWidth = window.innerWidth * 0.75;
    topMargin = 130;
    coauthors: Author[];
    yStep = 70;

    constructor(private p: p5) {}

    changeAuthor(author: string) {
        this.author = author;
        this.papers = this.getAuthorPapers(author, this.papersTable);

        var minCitations = Infinity;
        var maxCitations = 0;
        this.papers.forEach(paper => {
            if (paper.citations < minCitations)
                minCitations = paper.citations;
            if (paper.citations > maxCitations)
                maxCitations = paper.citations;
        });
        this.papers.forEach(paper => {
            paper.minCitations = minCitations;
            paper.maxCitations = maxCitations;
            paper.currentColor = this.p.color("#11144c");
            paper.currentConnectionColor = this.p.color("#11144c");
            paper.highlightColor = this.p.color("#11144c");
            paper.grayColor = this.p.color(210);
        });

        this.initializePapersPositions(this.papers);

        this.coauthors = this.getUniqueAuthors(this.papers);
        
        this.removeFirst(this.coauthors, coauthor => coauthor.name == this.author);

        var minAuthorCitations = Infinity;
        var maxAuthorCitations = 0;
        this.coauthors.forEach(coauthor => {
            if (coauthor.citations < minAuthorCitations)
                minAuthorCitations = coauthor.citations;
            if (coauthor.citations > maxAuthorCitations)
                maxAuthorCitations = coauthor.citations;
        });
        this.coauthors.forEach(coauthor => {
            coauthor.minAuthorCitations = minAuthorCitations;
            coauthor.maxAuthorCitations = maxAuthorCitations;
            coauthor.highlightColor = this.p.color("#3a9679");
            coauthor.currentColor = this.p.color("#3a9679");
            coauthor.currentConnectionColor = this.p.color("#3a9679");
            coauthor.grayColor = this.p.color(210);
        });
        
        this.initializeCoauthorsPositions(this.coauthors);
    }

    preload() {
        this.papersTable = <p5.Table>this.p.loadTable('data/IEEE VIS papers 1990-2018 - Main dataset.csv', <any>'csv', <any>'header');
		this.authorsTable = <p5.Table>this.p.loadTable("data/authors-affiliations-cleaned-March-25-2019.csv", <any>'csv', <any>'header');
    }

    setup() {
		setupSearch(this.authorsTable);
        this.changeAuthor(this.author);        
        let canvas = this.p.createCanvas(this.canvasWidth, this.papers.length * this.yStep + this.topMargin);
        canvas.parent('sketch-papers');
    }

    draw() {
        for (let i = 0; i < this.papers.length; i++) {
            this.papers[i].animate(i > 0 ? this.papers[i-1] : undefined);
        }
        this.coauthors.forEach(coauthor => coauthor.animate());

        this.p.clear();
        drawTitle(this.p, this.author, this.canvasWidth / 2, this.topMargin / 2);

        var isMouseOverSomething = false;
        var highlightedPaper: Paper = undefined;
        var highlightedCoauthor: Author = undefined;
        this.papers.forEach(paper => {
            if (paper.isMouseOver(this.p.mouseX, this.p.mouseY)) {
                isMouseOverSomething = true;
                highlightedPaper = paper;
            }
        });
        this.coauthors.forEach(coauthor => {
            if (coauthor.isMouseOver(this.p.mouseX, this.p.mouseY)) {
                isMouseOverSomething = true;
                highlightedCoauthor = coauthor;
            }
        });

        this.papers.forEach(paper => {
            paper.displayMode = isMouseOverSomething ? DisplayMode.GRAYED : DisplayMode.NORMAL;
        });
        this.coauthors.forEach(coauthor => {
            coauthor.displayMode = isMouseOverSomething ? DisplayMode.GRAYED : DisplayMode.NORMAL;
        });

        if (highlightedPaper !== undefined) {
            highlightedPaper.displayMode = DisplayMode.HIGHLIGHTED;
            this.coauthors.forEach(coauthor => {
                if (coauthor.papers.indexOf(highlightedPaper) >= 0)
                    coauthor.displayMode = DisplayMode.HIGHLIGHTED;
            });
        }
        if (highlightedCoauthor !== undefined) {
            highlightedCoauthor.displayMode = DisplayMode.HIGHLIGHTED;
            highlightedCoauthor.papers.forEach(paper => paper.displayMode = DisplayMode.HIGHLIGHTED);
        }

        for (let i = 0; i < this.papers.length; i++)
            this.papers[i].drawConnection(i > 0 ? this.papers[i-1] : undefined);

        for (let i = 0; i < this.coauthors.length; i++)
            this.coauthors[i].drawConnections();
        
        for (let i = 0; i < this.papers.length; i++)
            this.papers[i].drawShape(i > 0 ? this.papers[i-1] : undefined);

        for (let i = 0; i < this.coauthors.length; i++)
            this.coauthors[i].drawShape();

        for (let i = 0; i < this.coauthors.length; i++)
            this.coauthors[i].drawName();

        for (let i = 0; i < this.papers.length; i++)
            this.papers[i].drawTitle();
    }

    removeFirst<T>(array: Array<T>, predicate: (item: T) => boolean) {
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (predicate(element)) {
                array.splice(i, 1);
                return;
            }
        }
    }

    getAuthorCitations(author: string): number {
        var citations = 0;
        for (let i = 0; i < this.papersTable.getRowCount(); i++) {
            const row = this.papersTable.getRow(i);
            if (row.get('AuthorNames-Deduped').toString().split(';').indexOf(author) >= 0) {
                var paperCitations = parseInt(row.get('AminerCitationCount_02-2019').toString());
                citations += isNaN(paperCitations) ? 0 : paperCitations;
            }
        }
        return citations;
    }

    getUniqueAuthors(papers: Paper[]): Author[] {
        var authors = new Array<Author>();

        papers.forEach(paper => {
            paper.authors.forEach(authorName => {
                // @ts-ignore
                var author = authors.find(author => author.name == authorName);
                if (author == undefined) {
                    author = new Author(this.p, authorName, this.getAuthorCitations(authorName));
                    author.papers.push(paper);
                    authors.push(author);
                } else {
                    author.papers.push(paper);
                }
            });
        });

        return authors;
    }

    getAuthorPapers(author: string, table: p5.Table): Paper[] {
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
                papers.push(new Paper(this.p, title, year, authors, affiliation, citations));
            }
        }
        return papers.sort((a, b) => a.year - b.year);;
    }

    initializePapersPositions(papers: Paper[]) {
        var maxOffset = 50;
        for (let i = 0; i < papers.length; i++) {
            if (i == 0)
                papers[i].x = this.canvasWidth / 2;
            else if (papers[i-1].x < this.canvasWidth / 3)
                papers[i].x = papers[i-1].x + this.p.random(0, maxOffset);
            else if (papers[i-1].x > this.canvasWidth / 3 * 2)
                papers[i].x = papers[i-1].x + this.p.random(-maxOffset, 0);
            else
                papers[i].x = papers[i-1].x + this.p.random(-maxOffset, maxOffset);

            papers[i].y = this.topMargin + i * this.yStep;
        }
    }

    initializeCoauthorsPositions(coauthors: Author[]) {
        for (let i = 0; i < coauthors.length; i++) {
            const coauthor = coauthors[i];
            if (coauthor.papers.length == 1) {
                coauthor.x = i%2 == 0 ? coauthor.papers[0].x + 200 : coauthor.papers[0].x - 200;
                coauthor.y = coauthor.papers[0].y + this.p.random(-50, 50);
            } else {
                var minX = this.canvasWidth;
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
}