var CTX;

var CONFIG = {
    "none_color": "#000000",
    "label_font": "10px Arial bold",
    "led_size": 15,
    "led_spacing": 3,
    "image_width": 400,
    "image_height": 400,
    "batBox_width": 20,
    "batBox_height": 40
}

var workspace;
var colorPicking = false;
var showImage = true;
/* addLED, moveLED, deleteLED, addBatteryBox, moveBatteryBox, none */
var mode = "none";

var imageSelected;
var imageOverlay = new Image();
imageOverlay.onload=function(){
    CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
    animation.draw();
}
var imageOverlayAlpha = 1;

function selectImage(input){
    if(input.files && input.files[0]){
        var reader = new FileReader();
        reader.onload = function(e){
            imageSelected = e.target.result;
            imageOverlay.src = imageSelected;
            // console.log(e.target.result);
                if(showImage){
                    CTX.globalAlpha=imageOverlayAlpha;
                    CTX.globalCompositeOperation = "source-over";
                    CTX.drawImage(imageOverlay,-10,-10,CONFIG["image_width"],CONFIG["image_height"]);
                    CTX.globalCompositeOperation = "screen";
                    CTX.globalAlpha=1;
                }
        }
        reader.readAsDataURL(input.files[0]);
    }
    workspace.draw();
}

function clearCanvas() 
{
    CTX.clearRect(0, 0, canvas.width, canvas.height);
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

    c.onmousedown = function(e)
    {
        if(mode!='moveLED' && mode!='deleteLED' && mode!='moveBatteryBox'){
            return;
        }
        // then mode is either moveLED, deleteLED, or moveBatteryBox
        workspace.within(e.offsetX, e.offsetY);   
    }

    c.onmousemove = function(e)
    {
        if(workspace.selectedItem && e.buttons && 
            (mode == 'addLED' || mode == 'moveLED' || mode == 'addBatteryBox' || mode=='moveBatteryBox')){
            workspace.selectedItem.x = e.offsetX;
            workspace.selectedItem.y = e.offsetY;
            workspace.draw();
        }
    }

    c.onmouseup = function(e) 
    {
        if(mode =='deleteLED'){
            workspace.removeLED();
        }
        if(mode =='addLED'){
            if(!animation.selectedItem){
                let newLED = new Led(e.offsetX,
                                    e.offsetY,
                                    workspace.use_color);
                workspace.addLED(newLED);
            }
        }

        if(mode == 'addBatteryBox'){
            if(!animation.selectedItem){
                let newBatBox = new BatBox(e.offsetX,
                                            e.offsetY
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
        setColor(CONFIG["none_color"])
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

function saveToJsonFile() {
    workspace.saveToJsonFile();
}

function loadFromJsonFile(jsonString) {
    return workspace.loadFromJsonFile(jsonString);
}

function readFile(file) {     
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        const result = event.target.result;
        var loadResult = loadFromJsonFile(result);
        const output = document.getElementById('output');
        const li = document.createElement('li');
        if (loadResult){
            li.textContent = `Loaded workspace file!`;
            output.appendChild(li);
        }
        else{
            li.textContent = `Failed to load backup workspace file :(  Was it a .json file?`;
            output.appendChild(li);
        }
    });
    reader.readAsText(file);
}

function attachFileLoaderHandler(){
    const output = document.getElementById('output');
    if (window.FileList && window.File) {
        document.getElementById('file-selector').addEventListener('change', event => {
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
