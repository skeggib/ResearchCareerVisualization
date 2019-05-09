class Keyword {
    label:string;
    count:number;
    size:number;
    color:string;
    papers: Paper [];
    x:number;
    y:number;

    constructor(private p: p5, label: string, count:number, size:number, color: string) {

        this.label = label;
        this.color = color;
        this.count = count;
        this.size = size;
    }

    setPosition(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    addPaper(paper:Paper) {
        this.papers.push(paper);
    }

    isInPaper(paper:Paper) {
        let isIn:Paper[] = this.papers.filter(p => p.title == paper.title);
        return isIn.length > 0;
    }

    drawShape() {
        this.p.stroke(this.color);
        this.p.fill(this.color);
        this.p.rect(this.x, this.y, 10, this.size, 20);
    }

    drawLabel() {
        this.p.noStroke();
	    this.p.textSize(12);
        this.p.fill(this.color);
        this.p.text(this.label, this.x + 30, this.y + this.size/2);
    }
}