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
        '#fabebe',
        '#008080',
        '#e6beff',
        '#9a6324',
        '#fffac8',
        '#800000',
        '#aaffc3',
        '#808000',
        '#ffd8b1',
        '#000075',
        '#808080'
    ];

    constructor(private p: p5) { }

    changeAuthor(author: string) {
        this.author = author;
        this.papers = this.getAuthorPapers(author, this.papersTable);
        //let authorData = this.authorsTable.findRows(author, 'AuthorNames-Deduped');
        this.getKeywordsCount();
        this.keywordList = this.keywordList.sort((el1, el2) => {return el2.count - el1.count});
        let sum = 0;

        let i = 0;
        this.keywordList.forEach((value) => {
            if (i < 20) {
                sum += value.count;
            }
            i++;
        })
        console.log(sum);

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
        console.log(this.keywordList);
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
        this.keywordList.forEach(k => {
            if( i < 20) {
                k.drawShape();
                k.drawLabel();
            }
            i++;
        })
    }

    getAllKeywords(): string[] {
        let set = new Set<string>();
        for (var i = 0; i < this.papersTable.getRowCount(); i++) {
            var keywords: string[] = this.papersTable.getRow(i).get("AuthorKeywords").toString().toLowerCase().split(",");
            keywords.forEach(keyword => set.add(keyword));
        }
        return Array.from(set.values());
    }

    getKeywordsCount() {
        for (var i = 0; i < this.papers.length; i++) {
            for (var j = 0; j < this.papers[i].keywords.length; j++) {
                let key = this.papers[i].keywords[j].trim().replace(/[e']s$/, '').replace(/([^aiou])s/, '$1');
                let k = this.keywordList.find(el => el.label == key);
                if (k && key != "") {
                    k.count += 1;
                    if(k.papers.find(p => p.doi == this.papers[i].doi) == undefined) {
                        k.papers.push(this.papers[i]);
                    }
                } else if (key != "") {
                    k = new Keyword(this.p);
                    k.label = key;
                    k.count = 1;
                    k.papers.push(this.papers[i]);
                    this.keywordList.push(k);
                }
            }

            for (var j = 0; j < this.allKeywords.length; j++) {
                let key = this.allKeywords[j].replace(/[e']s$/, '').replace(/([^aiou])s/, '$1');
                if ((this.papers[i].abstract.includes(key) || this.papers[i].title.includes(key)) && this.papers[i].keywords.find(el => el == key)) {
                    let k = this.keywordList.find(el => el.label == key);
                    if (k && key != "") {
                        k.count += 1;
                    } else if (key != "") {
                        k = new Keyword(this.p);
                        k.label = key;
                        k.count = 1;
                        this.keywordList.push(k);
                    }
                }
            }
        }
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
                paper.keywords = row.get("AuthorKeywords").toString().toLowerCase().split(",");
                paper.doi = row.get("DOI").toString();
                papers.push(paper);
            }
        }
        return papers.sort((a, b) => a.year - b.year);;
    }
}