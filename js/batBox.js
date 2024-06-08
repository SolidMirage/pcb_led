class BatBox 
{
    constructor(x, y,) 
    {
        this.x = x;
        this.y = y;
        this.width=CONFIG["batBox_width"];
        this.height=CONFIG["batBox_height"];
        this.color = CONFIG["batBox_color"];
        this.name="batBox";
    }

    getColor() 
    {
        return this.color;
    }

    checkCollision(x, y) 
    {
        return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height)
    }

    draw() 
    {         
        CTX.beginPath();
        CTX.fillStyle = this.color;
        CTX.rect(this.x,this.y,this.width,this.height);
        CTX.stroke();
        CTX.fill();
    }

}