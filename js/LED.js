class Led 
{
    constructor(x, y, c = "#FF0000") 
    {
        this.x = x;
        this.y = y;
        this.color = c;
        this.name="LED";
        
        this.size = CONFIG["led_size"];
    }

    getColor() 
    {
        return this.color;
    }

    checkCollision(x, y) 
    {
        return (x >= this.x && x <= this.x + this.size && y >= this.y && y <= this.y + this.size)
    }

    updateColor(color) 
    {
        this.color = color;
    }

    draw() 
    {         
        CTX.beginPath();
        CTX.fillStyle = this.color;
        CTX.rect(this.x, this.y, this.size, this.size);
        CTX.stroke();
        CTX.fill();
    }

}