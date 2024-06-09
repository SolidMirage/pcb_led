class Workspace 
{
    constructor(leds, batBox, bgImage) 
    {
        this.leds = leds;
        this.batBox = batBox;
        this.bgImage = bgImage;
        this.selectedItem = undefined;
        this.selectedLEDIndex = -1;
        this.use_color = "white";
        this.showImage = true;
    }

    drawImage(){
        CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
    }

    drawBatBox(){
        if(this.batBox){
            this.batBox.draw();;
        }
    }

    setColor(color){
        this.use_color = color;
    }

    drawLeds(){
        for(const led of this.leds){
            led.draw();
        }
    }

    deselectItem(){
        this.selectedItem = undefined;
        this.selectedLEDIndex = -1;
    }

    clearCanvas(){
        CTX.clearRect(0,0,canvas.width,canvas.height);
    }

    draw() 
    {   
        this.clearCanvas();
        this.drawImage();
        this.drawBatBox();
        this.drawLeds();
    }

    within(x,y){
        // check if in batbox
        if(this.batBox && this.batBox.checkCollision(x,y)){
            this.selectedItem = this.batBox;
            return this.batBox;
        }

        for(let [i,led] of this.leds.entries()){
            if(led.checkCollision(x,y)){
                this.selectedItem = led;
                this.selectedLEDIndex = i;
                return led;
            }
        }

        return undefined;
    }

    addLED(led){
        this.leds.push(led);
    }

    removeLED(){
        if(this.selectedItem && this.selectedItem.name=="LED"){
            this.leds.splice(this.selectedLEDIndex,1);
            this.selectedItem = undefined;
            this.selectedLEDIndex = -1;
        }
        this.draw();
    }

    removeBatteryBox(){
        if(this.batBox){
            this.batBox = undefined;
            this.draw();
        }
    }

    async saveToZipFile(){
        var data = {};

        // save location of batBox
        data.batBox = this.batBox;

        // save location of leds
        data.leds = this.leds;
        const dataJsonString = JSON.stringify(data);

        var zip = new JSZip();
        zip.file("card_webapp.json",dataJsonString);
        const blob = await (await fetch(imageOverlay.src)).blob();
        zip.file("card_webapp_image.png",blob);

        zip.generateAsync({type:"blob"})
        .then(function(content){
            // see FileSaver.js
            saveAs(content,"card_webapp_image.zip");
        });
    }

    loadFromJson(jsonString){
        var data = null;
        try{
            data = JSON.parse(jsonString);
        } catch(e){
            return false;
        }
        if(!data){
            return false;
        }
        
        this.leds = [];
        this.batBox = undefined;

        if (data.leds) {
            data.leds.forEach((led)=>{
                var newLed = new Led(led.x, led.y, led.color);
                this.leds.push(newLed);
            });
        }

        if (data.batBox) {
            this.batBox = new BatBox(data.batBox.x, data.batBox.y);
        }

        this.draw();
        return true;
    }

}