class Led 
{
    constructor(x, y, c = CONFIG["none_color"]) 
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
        return (x >= this.posX && x <= this.posX + this.size && y >= this.posY && y <= this.posY + this.size)
    }

    updateColor(color) 
    {
        this.color = color;
    }

    draw() 
    {         
        CTX.beginPath();
        CTX.fillStyle = this.color;
        CTX.arc(this.x, this.y, this.size, 0, Math.PI*2, true);
        CTX.stroke();
        CTX.fill();
    }

}