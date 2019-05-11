class Keyword {
    label: string;
    count: number;
    size: number;
    color: string;
    papers: Paper [] = new Array<Paper>();
    x: number;
    y: number;

    constructor(private p: p5) {

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

    drawShape(grayed: boolean = false) {
        let color: string;
        if (grayed)
            color = '#DDD';
        else
            color = this.color;
        this.p.stroke(color);
        this.p.fill(color);
        this.p.rect(this.x, this.y, 10, this.size, 20);
    }

    drawLabel(grayed: boolean = false) {
        let color: string;
        if (grayed)
            color = '#DDD';
        else
            color = this.color;
        this.p.noStroke();
	    this.p.textSize(12);
        this.p.fill(color);
        this.p.text(this.label, this.x + 30, this.y + this.size/2);
    }
}