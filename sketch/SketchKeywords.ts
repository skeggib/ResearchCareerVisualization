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
    allKeywords:string[];
    keywordCount:Map<any, any>;
    keywordList: Keyword[] = new Array<Keyword>();
    colors:string[] = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];

    constructor(private p: p5) {}

    changeAuthor(author: string) {
        this.author = author;
        let authorData = this.authorsTable.findRows(author, 'AuthorNames-Deduped');
        this.keywordCount = this.getKeywordsCount(authorData);
		let mapSort1 = new Map([...this.keywordCount.entries()].sort((a, b) => b[1] - a[1]));
		let sum = 0;
        
        let i = 0;
        mapSort1.forEach((value, key) => {
            if(i < 20) {
                sum += value;
            }
            i++;
        })

        let nextY = 5;
        i = 0;
        console.log(this.canvasHeight);
        mapSort1.forEach((value, key) => {
            if(i < 20) {
                console.log( value / sum );
                let k = new Keyword(this.p, key, value, +value / sum * (this.canvasHeight - 200), this.colors[i]);
                k.setPosition(5, nextY);
                this.keywordList.push(k);
                nextY += +value / sum * (this.canvasHeight - 200);
                nextY += 5;
                console.log(k.x + " " + k.y + " " + k.size)
            }
            i++;
        })
    }

    preload() {
        // @ts-ignore
        this.papersTable = this.p.loadTable('data/IEEE VIS papers 1990-2018 - Main dataset.csv', <any>'csv', <any>'header');
		this.authorsTable = this.p.loadTable("data/authors-affiliations-cleaned-March-25-2019.csv", <any>'csv', <any>'header');
    }

    setup() {
        this.p.createCanvas(this.canvasWidth, this.canvasHeight);
        this.allKeywords = this.getAllKeywords();
        console.log(this.allKeywords)
        this.changeAuthor(this.author);
    }

    draw() {
        this.keywordList.forEach(k => {
            k.drawShape();
            k.drawLabel();
        })
    }

    getAllKeywords(): string[] {
        let set = new Set<string>();
        for (var i = 0; i < this.papersTable.getRowCount(); i++) {
            var keywords:string[] = this.papersTable.getRow(i).get("AuthorKeywords").toString().split(",");
            keywords.forEach(keyword => set.add(keyword));
        }
        return Array.from(set.values());
    }
    
    getKeywordsCount(datas:any[]) {
        var map1 = new Map();
    
        for (var i = 0; i < datas.length; i++) {
            let paper = this.papersTable.findRow(datas[i].get("DOI"), "DOI");
            let keywordList = paper.get("AuthorKeywords").toString().split(",");
    
            let abstract = paper.get("Abstract").toString();
            let title = paper.get("Title").toString();
    
            for (var j = 0; j < keywordList.length; j++) {
                let key = keywordList[j].trim().replace(/[e']s$/, '').replace(/([^aiou])s/, '$1');
                if (map1.get(key) == undefined && key != "") {
                    map1.set(key, 1);
                } else if (key != "") {
                    map1.set(key, map1.get(key) + 1);
                }
            }
    
            for (var j = 0; j < this.allKeywords.length; j++) {
                let key = this.allKeywords[j].replace(/[e']s$/, '').replace(/([^aiou])s/, '$1');
                if ((abstract.includes(key) || title.includes(key)) && keywordList.find(el => el == key)) {
                    if (map1.get(key) == undefined) {
                        map1.set(key, 1);
                    } else if (key != "") {
                        map1.set(key, map1.get(key) + 1);
                    }
                }
            }
        }
    
        return map1;
    }
}