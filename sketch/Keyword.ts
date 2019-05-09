class Keyword {
    label:string;
    count:number;
    color:string;
    papers: Paper [];
    x:number;
    y:number;

    constructor(label: string, color: string) {

        this.label = label;
        this.color = color;
        this.count = 0;
    }

    increment() {
        this.count += 1;
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

    drawShape(size:number) {
        stroke(this.color);
        rect(this.x, this.y, 10, size, 20);
    }

    drawLabel(size:number) {
        noStroke();
	    textSize(12);
        fill(this.color);
        text(this.label, this.x + 30, this.y + size/2);
    }
}