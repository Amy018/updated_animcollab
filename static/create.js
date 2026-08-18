
document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const addFrameBtn = document.getElementById("addFrame");
const framesContainer = document.getElementById("framesContainer");

const brushBtn = document.getElementById("brushTool");
const eraserBtn = document.getElementById("eraserTool");
const clearBtn = document.getElementById("clearCanvas");

const colorPicker = document.getElementById("colorPicker");
const sizeSlider = document.getElementById("sizeSlider");

const playBtn = document.getElementById("playAnimation");
const frameRateSlider = document.getElementById("frameRate");
const fpsValue = document.getElementById("fpsValue");

const exportBtn = document.getElementById("exportBtn");
const exportOptions = document.getElementById("exportOptions");
const exportPNG = document.getElementById("exportPNG");
const exportGIF = document.getElementById("exportGIF");

const onionBtn = document.getElementById("toggleOnion");
const scaleSliderObj = document.getElementById("scaleSliderObj");
const rotateSliderObj = document.getElementById("rotateSliderObj");

const assetSelect = document.getElementById("assetSelect");
const addAssetsBtn = document.getElementById("addAssetsBtn");


let project = { frames: [], currentFrame: 0, fps: 3 };
function createFrame() { return { drawingData: null, objects: [] }; }
project.frames.push(createFrame());


let painting = false;
let currentTool = "brush";
let brushColor = "#000000";
let brushSize = 5;


let selectedObject = null;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;


let onionSkinEnabled = false;
onionBtn.addEventListener("click", () => {
  onionSkinEnabled = !onionSkinEnabled;
  onionBtn.style.background = onionSkinEnabled ? "#00ff88" : "#ff3333";
  renderCanvas();
});


let isPlaying = false;
let playInterval;

playBtn.addEventListener("click", () => {
  if (project.frames.length === 0) return;
  if (!isPlaying) {
    isPlaying = true;
    playBtn.textContent = "⏸ Pause";
    let frameIndex = 0;
    playInterval = setInterval(() => {
      if (frameIndex >= project.frames.length) frameIndex = 0;
      displayFrame(frameIndex);
      highlightPlayingFrame(frameIndex);
      frameIndex++;
    }, 1000 / project.fps);
  } else stopPlayback();
});

function stopPlayback() {
  isPlaying = false;
  playBtn.textContent = "▶ Play";
  clearInterval(playInterval);
  loadFrame(project.currentFrame);
}

function highlightPlayingFrame(index) {
  const thumbs = document.querySelectorAll(".frame-thumbnail");
  thumbs.forEach((thumb, i) => {
    thumb.style.background =
      i === index ? "#00ff88" :
      i === project.currentFrame ? "#ff3333" :
      "#2a2a2f";
  });
}

function displayFrame(index) {
  const frame = project.frames[index];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (frame.drawingData) {
    const img = new Image();
    img.src = frame.drawingData;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      drawObjects(frame);
    };
  } else {
    drawObjects(frame);
  }
}


function renderCanvas() {
  const frame = project.frames[project.currentFrame];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(onionSkinEnabled && project.currentFrame>0){
    const prevFrame = project.frames[project.currentFrame-1];
    if(prevFrame.drawingData){
      const ghost = new Image();
      ghost.src=prevFrame.drawingData;
      ghost.onload=()=>{
        ctx.globalAlpha=0.3;
        ctx.drawImage(ghost,0,0);
        ctx.globalAlpha=1;
        drawObjects(prevFrame);
        drawCurrentFrame();
      };
      return;
    }
  }

  drawCurrentFrame();
}

function drawCurrentFrame(){
  const frame=project.frames[project.currentFrame];
  if(frame.drawingData){
    const img=new Image();
    img.src=frame.drawingData;
    img.onload=()=>{ ctx.drawImage(img,0,0); drawObjects(frame); };
  } else drawObjects(frame);
}


function drawObjects(frame){
  frame.objects.forEach(obj=>{
    const scale = obj.scale || 1;
    const rotation = obj.rotation || 0;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);

    if(obj.type==="ball"){
      ctx.beginPath();
      ctx.arc(0,0,obj.radius,0,Math.PI*2);
      ctx.fillStyle="red";
      ctx.fill();
    } else if(obj.type==="star"){
      drawStar(ctx,0,0,obj.size || 20,5);
    } else if(obj.type==="square"){
      const s = obj.size || 20;
      ctx.fillStyle="blue";
      ctx.fillRect(-s/2,-s/2,s,s);
    }

    ctx.restore();
  });
}

function drawStar(ctx,x,y,radius,points){
  ctx.beginPath();
  for(let i=0;i<2*points;i++){
    const angle = i*Math.PI/points - Math.PI/2;
    const r = i%2===0 ? radius : radius/2;
    ctx.lineTo(r*Math.cos(angle), r*Math.sin(angle));
  }
  ctx.closePath();
  ctx.fillStyle="yellow";
  ctx.fill();
}


addAssetsBtn.addEventListener("click", () => {
  const selectedAssets = Array.from(assetSelect.selectedOptions).map(opt => opt.value);
  const frame = project.frames[project.currentFrame];

  selectedAssets.forEach(assetType => {
    let newObj;
    switch(assetType) {
      case "ball":
        newObj = { type:"ball", x:canvas.width/2, y:canvas.height/2, radius:20, scale:1, rotation:0 };
        break;
      case "star":
        newObj = { type:"star", x:canvas.width/2, y:canvas.height/2, size:30, scale:1, rotation:0 };
        break;
      case "square":
        newObj = { type:"square", x:canvas.width/2, y:canvas.height/2, size:30, scale:1, rotation:0 };
        break;
    }
    if(newObj) frame.objects.push(newObj);
  });

  renderCanvas();
});


scaleSliderObj.addEventListener("input",()=>{
  if(!selectedObject) return;
  selectedObject.scale=parseFloat(scaleSliderObj.value);
  renderCanvas();
});
rotateSliderObj.addEventListener("input",()=>{
  if(!selectedObject) return;
  selectedObject.rotation=parseFloat(rotateSliderObj.value);
  renderCanvas();
});


canvas.addEventListener("mousedown", startAction);
canvas.addEventListener("mouseup", stopAction);
canvas.addEventListener("mousemove", performAction);

function startAction(e){
  const frame = project.frames[project.currentFrame];
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  selectedObject = [...frame.objects].reverse().find(obj=>{
    const dx=mouseX-obj.x;
    const dy=mouseY-obj.y;
    const size = obj.radius || obj.size || 20;
    return Math.sqrt(dx*dx+dy*dy)<size*(obj.scale||1);
  });

  if(selectedObject){
    dragging=true;
    dragOffsetX=mouseX-selectedObject.x;
    dragOffsetY=mouseY-selectedObject.y;
    scaleSliderObj.value=selectedObject.scale;
    rotateSliderObj.value=selectedObject.rotation||0;
    return;
  }

  painting=true;
  ctx.beginPath();
  ctx.moveTo(mouseX,mouseY);
}

function performAction(e){
  const frame=project.frames[project.currentFrame];
  const mouseX=e.offsetX;
  const mouseY=e.offsetY;

  if(dragging && selectedObject){
    selectedObject.x=mouseX-dragOffsetX;
    selectedObject.y=mouseY-dragOffsetY;
    renderCanvas();
    return;
  }

  if(!painting) return;
  ctx.lineWidth=brushSize;
  ctx.lineCap="round";
  ctx.strokeStyle=currentTool==="eraser"?"#ffffff":brushColor;
  ctx.lineTo(mouseX,mouseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouseX,mouseY);
  frame.drawingData=canvas.toDataURL();
}

function stopAction(){
  painting=false;
  dragging=false;
  ctx.beginPath();
  saveCurrentFrame();
}


brushBtn.addEventListener("click",()=>currentTool="brush");
eraserBtn.addEventListener("click",()=>currentTool="eraser");
clearBtn.addEventListener("click",()=>{
  const frame = project.frames[project.currentFrame];
  ctx.clearRect(0,0,canvas.width,canvas.height);
  frame.drawingData=null;
  frame.objects=[];
  renderCanvas();
});

colorPicker.addEventListener("input", e=>brushColor=e.target.value);
sizeSlider.addEventListener("input", e=>brushSize=e.target.value);


frameRateSlider.addEventListener("input",()=>{
  project.fps=frameRateSlider.value;
  fpsValue.textContent=frameRateSlider.value;
});


exportBtn.addEventListener("click",()=>{ exportOptions.style.display=exportOptions.style.display==="none"?"block":"none"; });


function saveCurrentFrame(){
  const frame = project.frames[project.currentFrame];
  frame.drawingData = canvas.toDataURL();
}
function loadFrame(index){
  project.currentFrame=index;
  renderCanvas();
  renderFrames();
}
addFrameBtn.addEventListener("click",()=>{
  saveCurrentFrame();
  project.frames.push(createFrame());
  project.currentFrame=project.frames.length-1;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  renderFrames();
});
function renderFrames(){
  framesContainer.innerHTML="";
  project.frames.forEach((frame,index)=>{
    const frameDiv=document.createElement("div");
    frameDiv.classList.add("frame-thumbnail");
    frameDiv.textContent="Frame "+(index+1);
    frameDiv.style.background=index===project.currentFrame?"#ff3333":"#2a2a2f";
    frameDiv.addEventListener("click",()=>{
      saveCurrentFrame();
      loadFrame(index);
    });
    framesContainer.appendChild(frameDiv);
  });
}


renderFrames();

});


const saveBtn = document.getElementById("saveBtn"); 
const savePrivateBtn = document.getElementById("savePrivateBtn"); 


saveBtn.addEventListener("click", async () => {
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const formData = new FormData();
        formData.append("video", blob, "animation.webm");

        const response = await fetch("/save_animation", { method: "POST", body: formData });
        const data = await response.json();
        if (data.success) {
            alert("Animation saved successfully!");
            window.location.href = "/dashboard";
        } else {
            alert("Error saving animation");
        }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), project.frames.length * (1000 / project.fps));
});

// ---- SAVE PRIVATE ----
savePrivateBtn.addEventListener("click", async () => {
    const password = prompt("Enter your password to save this animation privately:");
    if (!password) return;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const formData = new FormData();
        formData.append("video", blob, "animation_private.webm");
        formData.append("password", password);

        const response = await fetch("/save_private_animation", { method: "POST", body: formData });
        const data = await response.json();
        if (data.success) {
            alert("Private animation saved!");
            window.location.href = "/dashboard/private";
        } else {
            alert("Incorrect password or error saving animation");
        }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), project.frames.length * (1000 / project.fps));
});

// ---- EXPORT PNG / GIF ----
exportPNG.addEventListener("click", () => {
    canvas.toBlob(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "frame.png";
        link.click();
    });
});

exportGIF.addEventListener("click", async () => {
    if (typeof GIF === "undefined") {
        alert("GIF.js library not loaded!");
        return;
    }

    const gif = new GIF({ workers: 2, quality: 10 });
    project.frames.forEach(frame => {
        const img = new Image();
        img.src = frame.drawingData;
        gif.addFrame(img, { delay: 1000 / project.fps });
    });

    gif.on("finished", blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "animation.gif";
        link.click();
    });

    gif.render();
});
let collaborationMode = false;
const collabToggle = document.getElementById("collabToggle");

collabToggle.addEventListener("click", () => {
  collaborationMode = !collaborationMode;

  collabToggle.textContent = collaborationMode
    ? "Disable Collaboration"
    : "Enable Collaboration";
});
function simulateDrawingUsers() {
  if (!collaborationMode) return; // 🔑 THIS LINE

  fakeUsers.forEach(user => {
    let newX = user.x + (Math.random() - 0.5) * 15;
    let newY = user.y + (Math.random() - 0.5) * 15;

    ctx.beginPath();
    ctx.moveTo(user.x, user.y);
    ctx.lineTo(newX, newY);
    ctx.strokeStyle = user.color;
    ctx.stroke();

    user.x = newX;
    user.y = newY;
  });
}

setInterval(simulateDrawingUsers, 100);
