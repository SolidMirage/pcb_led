class Workspace 
{
    constructor(leds, batBox, bgImage) 
    {
        this.leds = leds;
        this.batBox = batBox;
        this.bgImage = bgImage;
        this.selectedItem = undefined;
        this.selectedLEDIndex = -1;
        this.use_color = CONFIG["none_color"];
        this.showImage = true;
    }

    drawImage(){
        CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
    }

    drawBatBox(){
        this.batBox.draw();;
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

    draw() 
    {   
        this.drawImage();
        this.drawBatBox();
        this.drawLeds();
    }

    within(x,y){
        // check if in batbox
        if(this.batBox.checkCollision(x,y)){
            this.selectedItem = batBox;
            return this.batBox;
        }

        for(let [i,led] of this.leds.entries()){
            const led = this.leds[i]
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
        if(this.selectedItem.name=="LED"){
            this.leds.splice(this.selectedLEDIndex,1);
            this.selectedItem = undefined;
            this.selectedLEDIndex = -1;
        }
    }

    saveToJsonFile(){
        var data = {};

        // save location of batBox
        data.batBox = this.batBox;

        // save location of leds
        data.leds = this.leds;
        const dataJson = JSON.stringify(data);

        var blob = new Blob([dataJson], {type: "application/octet-stream"});
        var blobUrl = URL.createObjectURL(blob);
        
        var fileLink = document.createElement('a');
        fileLink.href = blobUrl;
        // TODO add file text input
        // var fileTextInput = document.getElementById('saveFileNameInput');
        // fileLink.download = fileTextInput.value + "animation.txt"
        fileLink.download = "card_webapp.json";
        fileLink.click();
    }

    loadFromJsonFile(jsonString){
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

        data.leds.forEach((led)=>{
            var newLed = new Led(led.x, led.y, led.color);
            this.leds.push(led);
        });

        this.batBox = new BatBox(data.batBox.x, data.batBox.y);

        this.draw();
        return true;
    }

}