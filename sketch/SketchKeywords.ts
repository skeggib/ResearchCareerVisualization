class SketchKeywords {
    papersTable: p5.Table;
    authorsTable: p5.Table;
    author = "Alex T. Pang";
    papers: Paper[];
    canvasWidth = window.innerWidth / 5;
    canvasHeight = window.innerHeight;
    topMargin = 130;
    coauthors: Author[];
    yStep = 70;
    allKeywords: string[];
    keywordList: Keyword[] = new Array<Keyword>();
    selectedPaper: Paper;
    colors: string[] = [
        '#e6194b',
        '#3cb44b',
        '#ffe119',
        '#4363d8',
        '#f58231',
        '#911eb4',
        '#46f0f0',
        '#f032e6',
        '#bcf60c',
        '#fabe4a',
        '#008080',
        '#ff8300',
        '#9a6324',
        '#ff0000',
        '#800000',
        '#2aa800',
        '#808000',
        '#b200a3',
        '#000075',
        '#808080'
    ];

    constructor(private p: p5) { }

    changeAuthor(author: string) {
        this.author = author;
        this.papers = this.getAuthorPapers(author, this.papersTable);
        //let authorData = this.authorsTable.findRows(author, 'AuthorNames-Deduped');
        this.keywordList = new Array<Keyword>();
        this.countKeywords();
        this.keywordList = this.keywordList.sort((el1, el2) => {return el2.count - el1.count});
        let sum = 0;

        let i = 0;
        this.keywordList.forEach((value) => {
            if (i < 20) {
                sum += value.count;
            }
            i++;
        })

        let nextY: number = 5;
        i = 0;
        this.keywordList.forEach((value) => {

            if (i < 20) {
                value.size = value.count / sum * (this.canvasHeight - 110);
                value.color = this.colors[i];
                value.setPosition(5, nextY);
                nextY += value.count / sum * (this.canvasHeight - 110);
                nextY += 5;
            }
            i++;
        })
        //console.clear();
        //this.papers.forEach(paper => console.log(paper.keywords));
    }

    preload() {
        this.papersTable = <p5.Table>this.p.loadTable('data/IEEE VIS papers 1990-2018 - Main dataset.csv', <any>'csv', <any>'header');
        this.authorsTable = <p5.Table>this.p.loadTable("data/authors-affiliations-cleaned-March-25-2019.csv", <any>'csv', <any>'header');
    }

    setup() {
        this.canvasHeight = document.getElementById('sketch-keywords').offsetHeight - 48;
        let canvas = this.p.createCanvas(this.canvasWidth, this.canvasHeight);
        this.allKeywords = this.getAllKeywords();
        this.changeAuthor(this.author);
        canvas.parent('sketch-keywords');
    }

    draw() {
        this.p.clear();
        let i = 0;
        this.keywordList.forEach(keyword => {
            if( i < 20) {
                if (this.selectedPaper === undefined || keyword.isInPaper(this.selectedPaper)) {
                    keyword.drawShape();
                    keyword.drawLabel();
                } else {
                    keyword.drawShape(true);
                    keyword.drawLabel(true);
                }
            }
            i++;
        })
    }

    getAllKeywords(): string[] {
        let set = new Set<string>();
        for (var i = 0; i < this.papersTable.getRowCount(); i++) {
            var keywords = this.papersTable.getRow(i).get("AuthorKeywords").toString().toLowerCase().split(",");
            keywords.forEach(keyword => set.add(keyword.trim()));
        }
        return Array.from(set.values());
    }

    countKeywords() {
        this.papers.forEach(paper => {
            paper.keywords.forEach(keywordLabel => {
                keywordLabel = keywordLabel.replace(/ies$/, 'y').replace(/as$/, 'a').replace(/es$/, 'e').replace(/os$/, 'o').replace(/ts$/, 't').replace(/ds$/, 'd');
                if (keywordLabel == '') {
                    return;
                }
                
                let keyword = this.keywordList.find(k => k.label == keywordLabel);
                if (keyword) {
                    keyword.count += 1;
                    if(keyword.papers.find(p => p.title == paper.title) == undefined) {
                        keyword.papers.push(paper);
                    }
                } else {
                    keyword = new Keyword(this.p);
                    keyword.label = keywordLabel;
                    keyword.count = 1;
                    keyword.papers.push(paper);
                    this.keywordList.push(keyword);
                }
            });

            this.allKeywords.forEach(keywordLabel => {
                keywordLabel = keywordLabel.replace(/ies$/, 'y').replace(/as$/, 'a').replace(/es$/, 'e').replace(/os$/, 'o').replace(/ts$/, 't').replace(/ds$/, 'd');
                if (keywordLabel == '' || keywordLabel == 'ct') {
                    return;
                }

                if ((paper.abstract.toLocaleLowerCase().includes(keywordLabel) || paper.title.toLocaleLowerCase().includes(keywordLabel))) {
                    let keyword = this.keywordList.find(k => k.label == keywordLabel);
                    if (keyword) {
                        keyword.count += 1;
                        if(keyword.papers.find(p => p.title == paper.title) == undefined) {
                            keyword.papers.push(paper);
                        }
                    } else {
                        keyword = new Keyword(this.p);
                        keyword.label = keywordLabel;
                        keyword.count = 1;
                        keyword.papers.push(paper);
                        this.keywordList.push(keyword);
                    }
                }
            });
        });
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
                var paper = new Paper(this.p, title, year, authors, affiliation, citations);
                paper.abstract = row.get('Abstract').toString();
                paper.keywords = row.get("AuthorKeywords").toString().toLowerCase().split(",").map(keyword => keyword.trim());
                paper.doi = row.get("DOI").toString();
                papers.push(paper);
            }
        }
        return papers.sort((a, b) => a.year - b.year);;
    }
}