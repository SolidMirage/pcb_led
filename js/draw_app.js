var CTX;

var CONFIG = {
    "none_color": "#000000",
    "label_font": "10px Arial bold",
    "led_size": 15,
    "image_width": 400,
    "image_height": 400,
    "batBox_width": 40,
    "batBox_height": 20,
    "batBox_color": "gold"
}

var workspace;
var colorPicking = false;
var showImage = true;
/* addLED, moveLED, deleteLED, addBatteryBox, moveBatteryBox, none */
var mode = "none";
var lastLEDColorPicked;
var selectedOffsetX = 0;
var selectedOffsetY = 0;

var imageSelected;
var imageOverlay = new Image();
imageOverlay.onload=function(){
    CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
    workspace.draw();
}
var imageOverlayAlpha = 1;

function selectImage(input){
    if(input.files && input.files[0]){
        var reader = new FileReader();
        reader.onload = function(e){
            loadImage(e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
    workspace.draw();
}

function loadImage(dataURL) {
    imageSelected = dataURL;
    imageOverlay.src = imageSelected;
    if(showImage){
        CTX.globalAlpha=imageOverlayAlpha;
        CTX.globalCompositeOperation = "source-over";
        CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
        CTX.globalCompositeOperation = "screen";
        CTX.globalAlpha=1;
    }
}

function clearCanvas() 
{
    CTX.clearRect(0, 0, canvas.width, canvas.height);
}

function ledColorClicked(){
    if(lastLEDColorPicked){
        lastLEDColorPicked.style.borderColor="black";
    }
    workspace.setColor(this.style.backgroundColor);
    this.style.borderColor = "orange";
    lastLEDColorPicked = this;
}

function removeBatteryBox(){
    workspace.removeBatteryBox();
}

function startDraw()
{
    var mouse_down = false;
    var c = document.getElementById("canvas");
    CTX = c.getContext("2d");
    
    CTX.globalCompositeOperation = "screen";
    
    var leds = [];
    var batBox;

    workspace = new Workspace(leds, batBox, imageOverlay);
    workspace.draw();

    var whiteLedPaletteBlock = document.getElementById("white-led");
    whiteLedPaletteBlock.style.borderColor = "orange";
    lastLEDColorPicked = whiteLedPaletteBlock;

    var paletteItems = document.getElementsByClassName("palette-block");
    for(var i = 0; i < paletteItems.length; i++){
        paletteItems[i].addEventListener('click',ledColorClicked);
    }

    c.onmousedown = function(e)
    {
        if(mode!='moveLED' && mode!='deleteLED' && mode!='moveBatteryBox'){
            return;
        }
        // debugger;
        // then mode is either moveLED, deleteLED, or moveBatteryBox
        var target = workspace.within(e.offsetX, e.offsetY);
        if(target){
            selectedOffsetX = target.x - e.offsetX;
            selectedOffsetY = target.y - e.offsetY;
        }
        else{
            selectedOffsetX = 0;
            selectedOffsetY = 0;
        }
    }

    c.onmousemove = function(e)
    {
        if(workspace.selectedItem && e.buttons && 
            (mode == 'addLED' || mode == 'moveLED' || mode == 'addBatteryBox' || mode=='moveBatteryBox')){
            workspace.selectedItem.x = e.offsetX + selectedOffsetX;
            workspace.selectedItem.y = e.offsetY + selectedOffsetY;
            workspace.draw();
        }
    }

    c.onmouseup = function(e) 
    {
        if(mode =='deleteLED'){
            workspace.removeLED();
        }
        if(mode =='addLED'){
            if(!workspace.selectedItem){
                let newLED = new Led(e.offsetX - CONFIG["led_size"]/2,
                                    e.offsetY - CONFIG["led_size"]/2,
                                    workspace.use_color);
                workspace.addLED(newLED);
            }
        }

        if(mode == 'addBatteryBox'){
            if(!workspace.selectedItem){
                let newBatBox = new BatBox(e.offsetX - CONFIG["batBox_width"]/2,
                                            e.offsetY - CONFIG["batBox_height"]/2
                )
                workspace.batBox = newBatBox;
            }
        }

        if(workspace.selectedItem){
            workspace.deselectItem();
        }
        
        workspace.draw();
    }
}

function setColor(color) 
{
    workspace.setColor(color);
}

function setMode(m) 
{
    mode = m
    if (mode == "addLED" || mode == "addBatteryBox") {
        $('#canvas').css({'cursor': "url('assets/pencilsmall.png') -10 40, pointer"});
    }
    else if (mode == "deleteLED") {
        $('#canvas').css({'cursor': "url('assets/erasersmall.png') -10 40, pointer"});
    }
    else if (mode == "moveLED" || mode == "moveBatteryBox"){
        $('#canvas').css({'cursor': "all-scroll"});
    }
}

function toggleImage(){
    workspace.showImage = !workspace.showImage;
    workspace.draw();
}

function saveToZipFile() {
    workspace.saveToZipFile();
}

function loadFromJson(jsonString) {
    return workspace.loadFromJson(jsonString);
}

function readFile(file) {     
    var zip = new JSZip();
    const output = document.getElementById('output');
    const li = document.createElement('li');
    zip.loadAsync(file).then(
        function(zip) {
            if (zip && zip.file('card_webapp.json') && zip.file('card_webapp_image.png')) {
                li.textContent = `Loaded zip file!`;
                output.appendChild(li);
            }
            zip.file('card_webapp.json').async('string').then((data) => {
                loadFromJson(data);
            });
            zip.file('card_webapp_image.png').async('blob').then((data) => {
                loadImage(URL.createObjectURL(data));
            });
        },
        function (e) {
            li.textContent = `Failed to load zip file. Error: ` + e;
            output.appendChild(li);
        }
    )
}

function attachFileLoaderHandler(){
    const output = document.getElementById('output');
    if (window.FileList && window.File) {
        document.getElementById("file-selector").addEventListener('change', event => {
            output.innerHTML = '';
            for (const file of event.target.files) {
                const li = document.createElement('li');
                const name = file.name ? file.name : 'NOT SUPPORTED';
                //const type = file.type ? file.type : 'NOT SUPPORTED';
                const size = file.size ? file.size : 'NOT SUPPORTED';
                li.textContent = `File name: ${name}, size: ${size}`;
                output.appendChild(li);
                readFile(file);
            }
        }); 
    }
}
