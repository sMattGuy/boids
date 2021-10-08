//DOM cache
//boid modifiers
let speedSlider = document.getElementById("maxSpeed");
let speedInfo = document.getElementById("speedDisplay");
speedInfo.innerHTML = speedSlider.value;
let unitsSlider = document.getElementById("maxUnits");
let unitsInfo = document.getElementById("unitDisplay");
unitsInfo.innerHTML = unitsSlider.value;
let randomSlider = document.getElementById("maxRandom");
let randomInfo = document.getElementById("randomDisplay");
randomInfo.innerHTML = randomSlider.value;
let visionSlider = document.getElementById("maxVision");
let visionInfo = document.getElementById("visionDisplay");
visionInfo.innerHTML = visionSlider.value;
let seperationSlider = document.getElementById("maxSeperation");
let seperationInfo = document.getElementById("seperationDisplay");
seperationInfo.innerHTML = seperationSlider.value;
let sepIntSlider = document.getElementById("maxSepInt");
let sepIntInfo = document.getElementById("sepIntDisplay");
sepIntInfo.innerHTML = sepIntSlider.value;
let aversionSlider = document.getElementById("maxAversion");
let aversionInfo = document.getElementById("aversionDisplay");
aversionInfo.innerHTML = aversionSlider.value;
//area modifiers
let windSlider = document.getElementById("maxWind");
let windInfo = document.getElementById("windDisplay");
windInfo.innerHTML = windSlider.value;
let windSpeedSlider = document.getElementById("maxWindSpeed");
let windSpeedInfo = document.getElementById("windSpeedDisplay");
windSpeedInfo.innerHTML = windSpeedSlider.value;
let boundSlider = document.getElementById("maxBounds");
let boundInfo = document.getElementById("boundsDisplay");
boundInfo.innerHTML = boundSlider.value;
//canvas settings
let widthSlider = document.getElementById("maxWidth");
let widthInfo = document.getElementById("widthDisplay");
widthInfo.innerHTML = widthSlider.value;
let heightSlider = document.getElementById("maxHeight");
let heightInfo = document.getElementById("heightDisplay");
heightInfo.innerHTML = heightSlider.value;
//drawing
let tileSizeSlider = document.getElementById("tilesizeSlider");
let tileSizeDisplay = document.getElementById("tilesize");
//buttons
let locationButton = document.getElementById("goToLocation");
let windButton = document.getElementById("windActivate");
let colorBiasButton = document.getElementById("colorBias");
let battleButton = document.getElementById("battleToggle");
//view buttons
let viewSphereButton = document.getElementById("viewSphere");
let sepSphereButton = document.getElementById("sepSphere");
let velLineButton = document.getElementById("velLine");
let boarderButton = document.getElementById("boarder");
//drawing
let drawButton = document.getElementById("draw");
let gridButton = document.getElementById("grid");
let clearButton = document.getElementById("drawClear");
let edgeButton = document.getElementById("edge");
let canvas = document.getElementById("myCanvas");
/*
	the container for all the units, pretty much holds
	all the boids. without it, nothing exists
*/
let unitArray = new Array();
//canvas setup
/*
	this defines everything needed to get canvas started
	the flag is what is shown when a user is making the 
	boids go to a specific target (the tiny image);
*/

let ctx = canvas.getContext("2d");
let flag = new Image();
flag.src = "./flag.png";

//constants
/*
	all constants are delcared here so that we can modify them with
	the slider inputs, which are directly below them
*/
//boid constants
let currentUnits = parseInt(unitsSlider.value);
let UNITS = parseInt(unitsSlider.value);
let SPEED = parseInt(speedSlider.value);
let RANDOMNESS = parseInt(randomSlider.value);
let VISIONDISTANCE = parseInt(visionSlider.value);
let SEPERATION = parseInt(seperationSlider.value);
let BOUNDS = parseInt(boundSlider.value);
let SEPINTENSITY = parseInt(sepIntSlider.value);
let AVERSION = parseInt(aversionSlider.value);
let BATTLE = false;
let showEdges = false;
//canvas constants
let FIELDX = canvas.width;
let FIELDY = canvas.height;
//area constants
let XMIN = BOUNDS;
let XMAX = FIELDX - BOUNDS;
let YMIN = BOUNDS;
let YMAX = FIELDY - BOUNDS;

//go to position
/*
	these variables are responsible for handling
	the target location feature. they tell the flag where
	to be and how the boids should go to it
*/
let desiredX = FIELDX / 2;
let desiredY = FIELDY / 2;
let goingToDesired = false;
let tileSize = parseInt(tileSizeSlider.value);

//variables for drawing obsticles
let mouseDown = false;
let drawing = false;
let drawArray = new Array(FIELDX/tileSize);
drawButton.oninput = function(){
	drawing = !drawing;
}
clearButton.onclick = function(){
	edgeMap = new Array();
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			drawArray[i][j] = {'exists':0,'edgeExists':[0,0,0,0],'edgeID':[-1,-1,-1,-1]};
		}
	}
};
let moveDrawing = false;
let removeDrawing = false;
canvas.addEventListener('mousemove', e => {
	//main drawing code
	if(mouseDown && drawing){
		//drawing new tiles
		if(!removeDrawing && (drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists == 1 || moveDrawing)){
			moveDrawing = true;
			drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists = 1;
			convertTilesToEdges();
		}
		//removing old tiles
		else if(!moveDrawing){
			removeDrawing = true;
			drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists = 0;
			convertTilesToEdges();
		}
	}
});
canvas.addEventListener('mouseup', e => {
	mouseDown = false;
	moveDrawing = false;
	removeDrawing = false;
});
//canvas listen to get X and Y of mouse click to place flag
canvas.addEventListener('mousedown', e => {
	if(goingToDesired){
		desiredX = e.offsetX;
		desiredY = e.offsetY;
	}
	mouseDown = true;
	if(drawing){
		if(drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists == 1){
			drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists = 0;
			convertTilesToEdges();
		}
		else{
			drawArray[Math.floor(e.offsetX/tileSize)][Math.floor(e.offsetY/tileSize)].exists = 1;
			convertTilesToEdges();
		}
	}
});

let edgeMap = new Array();

//drawing obsticles 
tileSizeDisplay.innerHTML = tileSizeSlider.value;
//wind variables
/*
	these variables are all for wind. wind vector is whats applied to
	the boid velocity vector to disrupt it
*/
let windAngle = 0;
let windToggle = false;
let windSpeed = 0;
let windVector = {'x':0,'y':0};

//color bias activator
let colorBias = false;
//event updates
/*
	this is where all sliders update values when they are changed
*/
//boid sliders
speedSlider.oninput = function(){
	SPEED = parseInt(this.value);
	speedInfo.innerHTML = this.value;
}
unitsSlider.oninput = function(){
	UNITS = parseInt(this.value);
	unitsInfo.innerHTML = this.value;
}
randomSlider.oninput = function(){
	RANDOMNESS = parseInt(this.value);
	randomInfo.innerHTML = this.value;
}
visionSlider.oninput = function(){
	VISIONDISTANCE = parseInt(this.value);
	visionInfo.innerHTML = this.value;
}
seperationSlider.oninput = function(){
	SEPERATION = parseInt(this.value);
	seperationInfo.innerHTML = this.value;
}
sepIntSlider.oninput = function(){
	SEPINTENSITY = parseInt(this.value);
	sepIntInfo.innerHTML = this.value;
}
aversionSlider.oninput = function(){
	AVERSION = parseInt(this.value);
	aversionInfo.innerHTML = this.value;
}
//area sliders
boundSlider.oninput = function(){
	BOUNDS = parseInt(this.value);
	boundInfo.innerHTML = this.value;
	XMIN = BOUNDS;
	XMAX = FIELDX - BOUNDS;
	YMIN = BOUNDS;
	YMAX = FIELDY - BOUNDS;
}
windSlider.oninput = function(){
	windAngle = parseInt(this.value);
	windInfo.innerHTML = this.value;
	induceWind();
}
windSpeedSlider.oninput = function(){
	windSpeed = parseInt(this.value);
	windSpeedInfo.innerHTML = this.value;
	induceWind();
}
//drawing
tileSizeSlider.oninput = function(){
	tileSize = parseInt(this.value);
	tileSizeDisplay.innerHTML = this.value;
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		drawArray[i] = new Array(Math.floor(FIELDY/tileSize));
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			drawArray[i][j] = {'exists':0,'edgeExists':[0,0,0,0],'edgeID':[-1,-1,-1,-1]};
		}
	}
}
let drawGrid = false;
gridButton.oninput = function(){
	drawGrid = !drawGrid;
}
//canvas sliders
widthSlider.oninput = function(){
	FIELDX = parseInt(this.value);
	canvas.width = this.value;
	widthInfo.innerHTML = this.value;
	XMIN = BOUNDS;
	XMAX = FIELDX - BOUNDS;
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		drawArray[i] = new Array(Math.floor(FIELDY/tileSize));
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			drawArray[i][j] = {'exists':0,'edgeExists':[0,0,0,0],'edgeID':[-1,-1,-1,-1]};
		}
	}
}
heightSlider.oninput = function(){
	FIELDY = parseInt(this.value);
	canvas.height = this.value;
	heightInfo.innerHTML = this.value;
	YMIN = BOUNDS;
	YMAX = FIELDY - BOUNDS;
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		drawArray[i] = new Array(Math.floor(FIELDY/tileSize));
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			drawArray[i][j] = {'exists':0,'edgeExists':[0,0,0,0],'edgeID':[-1,-1,-1,-1]};
		}
	}
}
/*
	button listening, same as above, but just for toggle buttons
*/
windButton.oninput = function(){
	//show elements 
	if(!windToggle){
		let windOpts = document.getElementsByClassName("windOption");
		for(let i=0;i<windOpts.length;i++){
			windOpts[i].style.display = "block";
		}
	}
	//hide elements
	else{
		let windOpts = document.getElementsByClassName("windOption");
		for(let i=0;i<windOpts.length;i++){
			windOpts[i].style.display = "none";
		}
	}
	windToggle = !windToggle;
}
locationButton.oninput = function(){
	goingToDesired = !goingToDesired;
}
edgeButton.oninput = function(){
	showEdges = !showEdges;
}
colorBiasButton.oninput = function(){
	//show elements 
	if(!colorBias){
		let colorOpts = document.getElementsByClassName("colorOption");
		for(let i=0;i<colorOpts.length;i++){
			colorOpts[i].style.display = "block";
		}
	}
	//hide elements
	else{
		let colorOpts = document.getElementsByClassName("colorOption");
		for(let i=0;i<colorOpts.length;i++){
			colorOpts[i].style.display = "none";
		}
	}
	colorBias = !colorBias;
}
let initialUnits = 0;
battleButton.oninput = function(){
	BATTLE = !BATTLE;
	if(BATTLE){
		initialUnits = UNITS;
		for(let i=0;i<unitArray.length;i++){
			for(let j=0;j<unitArray.length;j++){
				if(sameColor(unitArray[i],unitArray[j])){
					unitArray[j].color = unitArray[i].color;
				}
			}
		}
	}
}
let battleGrounds = new Array();
//view buttons
let viewSphere = true;
let sepSphere = true;
let velLine = true;
let boarderView = true;
viewSphereButton.oninput = function(){
	viewSphere = !viewSphere;
}
sepSphereButton.oninput = function(){
	sepSphere = !sepSphere;
}
velLineButton.oninput = function(){
	velLine = !velLine;
}
boarderButton.oninput = function(){
	boarderView = !boarderView;
}
/*
	frame setup, this prevents the boids from just going as fast
	as possible. only have this bc of turan showing me how.
*/
let FPS = 0;
let recentFPS = 0;
let timePassed = 0;
var frames = {
	speed: 32,
	count: 0,
	max: -1,
	timer: '',
	run: function (func) {
		this.timer = setInterval(func, this.speed);
	},
	start: function (func, speed = 100) {
		this.speed = speed;
		this.run(func);
	}
}
//this is what loops the frames indefinietly
async function doFrames() {
	frames.start(() => {
		if(Date.now() - timePassed > 1000){
			recentFPS = FPS;
			FPS = 0;
			timePassed = Date.now();
		}
		FPS++;
		moveAllBoids(unitArray, FIELDX, FIELDY, SPEED);
		if(BATTLE){
			battle();
		}
		draw(unitArray);
		if(currentUnits < UNITS){
			//units added
			let diff = UNITS - currentUnits
			for(let i=0;i<diff;i++){
				unitArray.push(new boid(FIELDX, FIELDY));
				currentUnits++;
			}
		}
		else if(currentUnits > UNITS){
			//units removed
			let diff = currentUnits - UNITS
			for(let i=0;i<diff;i++){
				unitArray.shift();
				currentUnits--;
			}
		}
	}, frames.speed);
}

/*
	this is whats called on page load to kick start everything
	it creates the initial units and triggers the frames
*/
function init(){
	for(let i=0;i<UNITS;i++){
		unitArray.push(new boid(FIELDX, FIELDY));
	}
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		drawArray[i] = new Array(Math.floor(FIELDY/tileSize));
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			drawArray[i][j] = {'exists':0,'edgeExists':[0,0,0,0],'edgeID':[-1,-1,-1,-1]};
		}
	}
	doFrames();
}

function battle(){
	for(let i=0;i<unitArray.length;i++){
		if(unitArray[i] != null){
			for(let j=0;j<unitArray.length;j++){
				if(unitArray[j] != null){
					//check for attack
					if(!sameColor(unitArray[i],unitArray[j]) && unitArray[i].calculateDistance(unitArray[j]) < 5){
						//kill
						unitArray[j] = null;
						let deadZone = {'x':unitArray[i].position.x, 'y':unitArray[i].position.y, 't':50};
						battleGrounds.push(deadZone);
						UNITS -= 1;
						currentUnits--;
						unitsInfo.innerHTML = UNITS;
						unitsSlider.value = UNITS;
					}
				}
			}
		}
	}
	let temp = new Array();
	while(unitArray.length != 0){
		if(unitArray[0] == null){
			unitArray.shift();
		}
		else{
			temp.push(unitArray.shift());
		}
	}
	shuffle(temp);
	unitArray = temp;
	/*
		We want to shrink the field size as the number of units goes down
	*/
	//bounds controls how close we are to the center, increasing it makes the play area smaller
	//we can record how many units we start with, then how many remain
	// initialUnits / UNITS = scale for how many units remain compared to when we started

	let leftScale = initialUnits / UNITS;
	let newBounds = BOUNDS + (BOUNDS * leftScale);
	let xBounds = newBounds;
	if(xBounds > (FIELDX/2) - 100){
		xBounds = (FIELDX/2) - 100;
	}
	XMIN = xBounds;
	XMAX = FIELDX - xBounds;
	let yBounds = newBounds;
	if(yBounds > (FIELDY/2) - 100){
		yBounds = (FIELDY/2) - 100;
	}
	YMIN = yBounds;
	YMAX = FIELDY - yBounds;
}

function shuffle(arr){
	let currentIndex = arr.length;
	let randomIndex = -1;
	while(currentIndex != 0){
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
	}
	return arr;
}

/*
	the canvas draw function, each section is divided up
	the for loop is what draws the actual units
*/
function draw(){
	ctx.fillStyle = '#eee';
	ctx.fillRect(0,0,FIELDX,FIELDY);
	if(drawGrid){
		ctx.strokeStyle = 'rgba(25,25,25,0.03)';
		//draw grid lines for drawing
		for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
			for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
				ctx.beginPath();
				ctx.rect(i*tileSize,j*tileSize,tileSize,tileSize);
				ctx.stroke();
			}
		}
	}
	//draw bounding limit
	if(boarderView){
		ctx.fillStyle = 'rgba(255,0,0,0.05)';
		//left bound
		ctx.fillRect(0,0,XMIN,YMAX);
		//upper
		ctx.fillRect(XMIN,0,FIELDX,YMIN);
		//right
		ctx.fillRect(XMAX,YMIN,FIELDX,FIELDY);
		//lower
		ctx.fillRect(0,YMAX,XMAX,FIELDY);
	}
	//draw wind
	if(windToggle){
		for(let i=0;i<FIELDX/50;i++){
			for(let j=0;j<FIELDY/50;j++){
				//base of wind
				ctx.beginPath();
				ctx.arc(i*50,j*50, 3, 0, 2*Math.PI, false);
				ctx.fillStyle = `rgba(10,10,10,0.05)`;
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(i*50,j*50);
				ctx.lineTo((i*50) + windVector.x * windSpeed, (j*50) + windVector.y * windSpeed);
				ctx.strokeStyle = `rgba(20,20,20,0.10)`;
				ctx.stroke();
			}
		}
	}
	//draw flag
	if(goingToDesired){
		ctx.drawImage(flag, desiredX - 5, desiredY - 5);
	}
	//draw units, their vision, and movement 
	for(let i=0;i<unitArray.length;i++){
		//draw seperation radius
		if(sepSphere){
			ctx.beginPath();
			ctx.arc(unitArray[i].position.x + 5,unitArray[i].position.y + 5, SEPERATION, 0, 2*Math.PI, false);
			ctx.fillStyle = `rgba(255,0,0,${SEPINTENSITY/100})`;
			ctx.fill();
		}
		//draw vision radius
		if(viewSphere){
			ctx.beginPath();
			ctx.arc(unitArray[i].position.x + 5,unitArray[i].position.y + 5, VISIONDISTANCE, 0, 2*Math.PI, false);
			ctx.fillStyle = `rgba(10,10,10,0.05)`;
			ctx.fill();
		}
		//draw plane 
		ctx.fillStyle = `rgb(${unitArray[i].color.r},${unitArray[i].color.g},${unitArray[i].color.b})`;
		ctx.fillRect(unitArray[i].position.x,unitArray[i].position.y,10,10);
		//draw velocity line
		if(velLine){
			ctx.beginPath();
			ctx.moveTo(unitArray[i].position.x + 5,unitArray[i].position.y + 5);
			ctx.lineTo(unitArray[i].position.x + unitArray[i].velocity.x + 5,unitArray[i].position.y + unitArray[i].velocity.y + 5);
			ctx.strokeStyle = `rgb(0,0,0)`;
			ctx.stroke();
		}
		//draw line of site
		if(true){
			for(let x=0;x<unitArray[i].visibilityVector.length;x++){
				ctx.beginPath();
				ctx.moveTo(unitArray[i].position.x + 5, unitArray[i].position.y + 5);
				ctx.lineTo(unitArray[i].visibilityVector[x].minPx * tileSize, unitArray[i].visibilityVector[x].minPy * tileSize);
				ctx.stroke();
			}
		}
	}
	if(BATTLE){
		let markerSize = 10;
		ctx.lineWidth = 5;
		let nextBattleGround = new Array();
		while(battleGrounds.length != 0){
			let battleZone = battleGrounds.shift();
			battleZone.t -= 1;
			if(battleZone.t == 0){
				//do nothing
			}
			else{
				ctx.beginPath();
				ctx.moveTo(battleZone.x - markerSize,battleZone.y - markerSize);
				ctx.lineTo(battleZone.x + markerSize,battleZone.y + markerSize);
				ctx.moveTo(battleZone.x + markerSize,battleZone.y - markerSize);
				ctx.lineTo(battleZone.x - markerSize,battleZone.y + markerSize);
				ctx.strokeStyle = `rgba(255,0,0,0.5)`;
				ctx.stroke();
				//add to back of queue
				nextBattleGround.push(battleZone);
			}
		}
		battleGrounds = nextBattleGround;
		ctx.lineWidth = 1;
		let winner = true;
		for(let b=0;b<unitArray.length;b++){
			for(let bb=0;bb<unitArray.length;bb++){
				if(!sameColor(unitArray[b],unitArray[bb])){
					winner = false;
				}
			}
			if(!winner){
				break;
			}
		}
		if(winner){
			ctx.font = `48px Tahoma`;
			ctx.fillText('WINNER', (FIELDX/2)-91, 50);
		}
	}
	//draw obsticles
	ctx.fillStyle = "black";
	for(let i=0;i<Math.floor(FIELDX/tileSize);i++){
		for(let j=0;j<Math.floor(FIELDY/tileSize);j++){
			if(drawArray[i][j].exists == 1){
				//draw block
				ctx.fillRect(i*tileSize,j*tileSize,tileSize,tileSize);
			}
		}
	}
	//temp code to visulize edge map
	if(showEdges){
		for(let i=0;i<edgeMap.length;i++){
			ctx.beginPath();
			ctx.arc(edgeMap[i].startX * tileSize,edgeMap[i].startY * tileSize, 5, 0, 2*Math.PI, false);
			ctx.fillStyle = `rgb(255,0,0)`;
			ctx.fill();
			ctx.beginPath();
			ctx.arc(edgeMap[i].endX * tileSize,edgeMap[i].endY * tileSize, 5, 0, 2*Math.PI, false);
			ctx.fillStyle = `rgb(255,0,0)`;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(edgeMap[i].startX * tileSize,edgeMap[i].startY * tileSize);
			ctx.lineTo(edgeMap[i].endX * tileSize,edgeMap[i].endY * tileSize);
			ctx.strokeStyle = "red";
			ctx.stroke();
		}
	}
	//write FPS
	ctx.font = `12px Tahoma`;
	ctx.fillText(`FPS:${recentFPS}`,0,10);
}

/*
	the boid class. it stores each units color, position and velocity
	the only special method in this is calculateDistance which can test
	how close a boid is to another boid
*/
class boid{
	position = {'x':0,'y':0};
	velocity = {'x':0,'y':0};
	color = {'r':0,'g':0,'b':0};
	visibilityVector = new Array();
	constructor(boundX, boundY){
		this.position.x = Math.floor(Math.random() * boundX);
		this.position.y = Math.floor(Math.random() * boundY);
		
		this.velocity.x = Math.floor(Math.random() * (SPEED * 2)) - SPEED;
		this.velocity.y = Math.floor(Math.random() * (SPEED * 2)) - SPEED;
		//color is random
		this.color.r = Math.floor(Math.random() * 256);
		this.color.g = Math.floor(Math.random() * 256);
		this.color.b = Math.floor(Math.random() * 256);
	}
	//only special methods for boids
	calculateDistance(unit){
		return Math.sqrt(Math.pow((this.position.x - unit.position.x), 2) + Math.pow((this.position.y - unit.position.y), 2));
	}
}
/*
	this is the driver code for moving the boids
	it works by calling all 3 rules, then it adds their influcences
	on each X and Y. that is then passed through some modifiers
	
*/
function moveAllBoids(planeArray, fieldXSize, fieldYSize, maxSpeed){
	let v1 = {'x':0,'y':0};
	let v2 = {'x':0,'y':0};
	let v3 = {'x':0,'y':0};
	let totalVector = {};
	for(let i=0;i<planeArray.length;i++){
		let prevPosition = planeArray[i].position;
		//wind, boids cannot control their speed in wind and are pushed first
		if(windToggle){
			planeArray[i].position = addVector(planeArray[i].position, windVector);
		}
		//gathering input from rules
		v1 = cohesion(planeArray[i], planeArray);
		v2 = separation(planeArray[i], planeArray);
		v3 = alignment(planeArray[i], planeArray);
		//combine rules
		totalVector = addVector(v1, v2);
		totalVector = addVector(totalVector, v3);
		//tend to place
		if(goingToDesired){
			totalVector = addVector(totalVector, tendToPlace(planeArray[i]));
		}
		//add randomness to the movement modification
		totalVector =  injectRandomness(totalVector, RANDOMNESS);
		//apply total change to the boid
		planeArray[i].velocity = addVector(planeArray[i].velocity, totalVector);
		//limit move speed
		limitSpeed(planeArray[i], maxSpeed);
		//update boids position based on velocity
		planeArray[i].position = addVector(planeArray[i].position, planeArray[i].velocity);
		//edit their position based on if theyre leaving the bounds
		boundPosition(planeArray[i]);
		
		//boids dodge drawn obsticle
		let obsXBound = Math.floor(planeArray[i].position.x/tileSize);
		let obsYBound = Math.floor(planeArray[i].position.y/tileSize);
		if(obsXBound >= drawArray.length - 1){
			obsXBound = drawArray.length - 1;
		}
		if(obsXBound < 0){
			obsXBound = 0;
		}
		if(obsYBound >= drawArray[0].length - 1){
			obsYBound = drawArray[0].length - 1;
		}
		if(obsYBound < 0){
			obsYBound = 0;
		}
		if(drawArray[obsXBound][obsYBound].exists == 1){
			//dodge wall
			let xDiff = planeArray[i].position.x - prevPosition.x;
			let yDiff = planeArray[i].position.y - prevPosition.y;
			const DODGE = 5;
			
			//crude version, just tries turning the boids a way, matching velocity would be better
			planeArray[i].velocity.x += DODGE;
			planeArray[i].velocity.y += DODGE;
			
			planeArray.position = prevPosition;
		}
		planeArray[i].visibilityVector = calculateVisibilityPolygon(planeArray[i].visibilityVector,planeArray[i].position,VISIONDISTANCE);
	}
}
/*
	rule 1: cohesion
	cohesion controls how boids will want to travel to the middle
	of all other nearby boids
	we average their positions together to define where the middle is
	since boids have a vision radius, they are only influenced by
	the boids around them.
*/
function cohesion(currentPlane, planeArray){
	let cohVector = {'x':0,'y':0,'z':0};
	let boidsHit = 0;
	for(let i=0;i<planeArray.length;i++){
		if(planeArray[i] != currentPlane && currentPlane.calculateDistance(planeArray[i]) < VISIONDISTANCE){
			if(colorBias){
				if(BATTLE){
					cohVector = addVector(cohVector, planeArray[i].position);
					boidsHit += 1;
				}
				else{
					//make decision based on color
					if(sameColor(currentPlane, planeArray[i])){
						//boids are the same
						cohVector = addVector(cohVector, planeArray[i].position);
						boidsHit += 1;
					}
					else{
						//boids are not the same
					}
				}
			}
			else{
				cohVector = addVector(cohVector, planeArray[i].position);
				boidsHit += 1;
			}
		}
	}
	if(boidsHit != 0){
		cohVector = divideVector(cohVector, boidsHit);
		let result = subVector(cohVector, currentPlane.position);
		result = divideVector(result, 100);
		return result;
	}
	else{
		//no one around to find
		if(goingToDesired){
			//go to flag
			return cohVector;
		}
		else{
			//fly aimlessly
			return currentPlane.velocity;
		}
	}
}
/*
	rule 2: seperation
	boids will try to avoid hitting each other. this is accomplished
	by seeing if they fall within the seperation distance. if they fall 
	within they try to move away. we dampen this movement to avoid jank
	
	we dont need to check distance in vision since we want vision to be always greater than seperation anyway, but users will be users, so we
	keep it.
*/
function separation(currentPlane, planeArray){
	let sepVector = {'x':0,'y':0};
	for(let i=0;i<planeArray.length;i++){
		if(planeArray[i] != currentPlane && currentPlane.calculateDistance(planeArray[i]) < VISIONDISTANCE){
			if(colorBias){
				if(!sameColor(currentPlane, planeArray[i])){
					if(BATTLE){
						//ignore seperation and go into each other
					}
					else{
						//strong aversion to different colors
						if(currentPlane.calculateDistance(planeArray[i]) < SEPERATION*2){
							let firstSub = subVector(planeArray[i].position,currentPlane.position);
							sepVector = subVector(sepVector, firstSub);
							sepVector = multiplyVector(sepVector,(2 * (AVERSION/100)));
						}
					}
				}
				else if(currentPlane.calculateDistance(planeArray[i]) < SEPERATION){
					//same color
					let firstSub = subVector(planeArray[i].position,currentPlane.position);
					sepVector = subVector(sepVector, firstSub);
				}
			}
			else if(currentPlane.calculateDistance(planeArray[i]) < SEPERATION){
				let firstSub = subVector(planeArray[i].position,currentPlane.position);
				sepVector = subVector(sepVector, firstSub);
			}
		}
	}
	//we can now dampen the seperation intensity
	sepVector = multiplyVector(sepVector, SEPINTENSITY/100);
	return sepVector;
}
/*
	rule 3: alignment
	boids will want to match the velocity of other nearby boids. this is how
	the boids fly together in the same direction. 
*/
function alignment(currentPlane, planeArray){
	let aliVel = {'x':0,'y':0,'z':0};
	let testedBoids = 0;
	for(let i=0;i<planeArray.length;i++){
		if(planeArray[i] != currentPlane && currentPlane.calculateDistance(planeArray[i]) < VISIONDISTANCE){
			if(colorBias){
				if(sameColor(currentPlane, planeArray[i])){
					//boids are the same
					aliVel = addVector(aliVel, planeArray[i].velocity);
					testedBoids += 1;
				}
				else{
					//do nothing
				}
			}
			else{
				aliVel = addVector(aliVel, planeArray[i].velocity);
				testedBoids += 1;
			}
		}
	}
	//we dampen the alignment so that they dont snap
	aliVel = divideVector(aliVel,testedBoids);
	let subStep = subVector(aliVel, currentPlane.velocity);
	let result = divideVector(subStep, 8);
	return result;
}

/*
	the start of helper and aux functions. these act as mostly modifiers
	but the vector math is also stored below these
*/
/*
	limit speed and bound position are what keep our boids moving
	reasonably, without this they would go crazy fast and leave the map
*/
function limitSpeed(plane, maxSpeed){
	if(Math.abs(plane.velocity.x) > maxSpeed){
		plane.velocity.x = (plane.velocity.x / Math.abs(plane.velocity.x)) * maxSpeed;
	}
	if(Math.abs(plane.velocity.y) > maxSpeed){
		plane.velocity.y = (plane.velocity.y / Math.abs(plane.velocity.y)) * maxSpeed;
	}
}
function boundPosition(plane){
	const DODGE = 5;
	if(plane.position.x < XMIN){
		plane.velocity.x += DODGE;
	}
	else if(plane.position.x > XMAX){
		plane.velocity.x -= DODGE;
	}
	if(plane.position.y < YMIN){
		plane.velocity.y += DODGE;
	}
	else if(plane.position.y > YMAX){
		plane.velocity.y -= DODGE;
	}
}

/*
	these external modifiers are used for the check boxs in our site
	these just do the calculations that we want to check
*/
function tendToPlace(unit){
	let place = {'x':desiredX,'y':desiredY};
	place = subVector(place, unit.position);
	place = divideVector(place,100);
	return place;
}
function induceWind(){
	let norm = {'x':1,'y':0};
	let rads = windAngle * (Math.PI / 180);
	let shiftX = norm.x * Math.cos(rads);
	let shiftY = norm.x * Math.sin(rads);
	norm.x = shiftX;
	norm.y = shiftY;
	let dampenedWind = windSpeed / 10;
	norm = multiplyVector(norm, dampenedWind);
	windVector = norm;
	return norm;
}
function sameColor(unit1, unit2){
	//same color is defined by if its highest color value and smallest color value is the same
	/*
		0 is red
		1 is green
		2 is blue
	*/
	let unit1max = '';
	let unit1min = '';
	let unit2max = '';
	let unit2min = '';
	//get unit 1 max color
	if(unit1.color.r >= unit1.color.g && unit1.color.r >= unit1.color.b){
		//red max
		unit1max = 0;
	}
	//red is not max, check green is max
	else if(unit1.color.g >= unit1.color.b){
		//green max
		unit1max = 1;
	}
	//blue is max
	else{
		unit1max = 2;
	}
	//get unit 1 min color
	if(unit1.color.r <= unit1.color.g && unit1.color.r <= unit1.color.b){
		//red min
		unit1min = 0;
	}
	//red is not max, check green is max
	else if(unit1.color.g <= unit1.color.b){
		//green max
		unit1min = 1;
	}
	//blue is max
	else{
		unit1min = 2;
	}
	
	//get unit 2 max color
	if(unit2.color.r >= unit2.color.g && unit2.color.r >= unit2.color.b){
		//red max
		unit2max = 0;
	}
	//red is not max, check green is max
	else if(unit2.color.g >= unit2.color.b){
		//green max
		unit2max = 1;
	}
	//blue is max
	else{
		unit2max = 2;
	}
	//get unit 1 min color
	if(unit2.color.r <= unit2.color.g && unit2.color.r <= unit2.color.b){
		//red min
		unit2min = 0;
	}
	//red is not max, check green is max
	else if(unit2.color.g <= unit2.color.b){
		//green max
		unit2min = 1;
	}
	//blue is max
	else{
		unit2min = 2;
	}
	
	if(unit1max == unit2max && unit1min == unit2min){
		return true;
	}
	return false;
}
/*
	this is where all vector math is handled. functions can be added here
	as needed.
*/
function addVector(vec1, vec2){
	let total = {'x':0,'y':0};
	total.x = vec1.x + vec2.x;
	total.y = vec1.y + vec2.y;
	return total;
}
function divideVector(vec, val){
	let total = {'x':0,'y':0};
	total.x = vec.x / val;
	if(isNaN(total.x))
		total.x = 0;
	total.y = vec.y / val;
	if(isNaN(total.y))
		total.y = 0;
	return total;
}
function multiplyVector(vec, val){
	let total = {'x':0,'y':0};
	total.x = vec.x * val;
	total.y = vec.y * val;
	return total;
}
function subVector(vec1, vec2){
	let total = {'x':0,'y':0};
	total.x = vec1.x - vec2.x;
	total.y = vec1.y - vec2.y;
	return total;
}
//although not necessary math, it does apply to vectors only 
function injectRandomness(vec, intensity){
	let total = {'x':0,'y':0};
	total.x = vec.x + (Math.random() * (intensity * 2)) - intensity;
	total.y = vec.y + (Math.random() * (intensity * 2)) - intensity;
	return total;
}
//edge detection functions
function convertTilesToEdges(){
	const NORTH = 0;
	const SOUTH = 1;
	const EAST = 2;
	const WEST = 3;
	edgeMap = new Array();
	//set boarder as a long edge
	//check tiles in draw array
	for(let i=1;i<drawArray.length-1;i++){
		for(let j=1;j<drawArray[i].length-1;j++){
			if(drawArray[i][j].exists == 1){
				drawArray[i][j].edgeExists = [0,0,0,0];
				drawArray[i][j].edgeID = [-1,-1,-1,-1];
				//block found
				//check for western neighbor
				if(drawArray[i-1][j].exists == 1){
					//western neighbor found
					//since its a wall, we do nothing
				}
				else{
					//no western neighbor
					//check for northern neighbor with a western edge
					if(drawArray[i][j-1].exists){
						//northern neighbor exists, check  for western edge
						if(drawArray[i][j-1].edgeExists[WEST] == 1){
							//northern neighbor has western edge, expand it to current block
							drawArray[i][j].edgeExists[WEST] = 1;
							drawArray[i][j].edgeID[WEST] = drawArray[i][j-1].edgeID[WEST];
							edgeMap[drawArray[i][j].edgeID[WEST]].endY = j+1;
						}
						else{
							//has northern neighbor, but no western edge
							//we create a new western edge
							drawArray[i][j].edgeExists[WEST] = 1;	//set edge as existing
							drawArray[i][j].edgeID[WEST] = edgeMap.length;	//give an edge id
							let newEdgeEntry = {'startX':i,'startY':j,'endX':i,'endY':j+1};
							edgeMap.push(newEdgeEntry);
						}
					}
					else{
						//no northern neighbor
						//we create a new edge here
						drawArray[i][j].edgeExists[WEST] = 1;	//set edge as existing
						drawArray[i][j].edgeID[WEST] = edgeMap.length;	//give an edge id
						let newEdgeEntry = {'startX':i,'startY':j,'endX':i,'endY':j+1};
						edgeMap.push(newEdgeEntry);
					}
				}
				
				//check for eastern neighbor
				if(drawArray[i+1][j].exists == 1){
					//eastern neighbor found
					//since its a wall, we do nothing
				}
				else{
					//no eastern neighbor
					//check for northern neighbor with a eastern edge
					if(drawArray[i][j-1].exists){
						//northern neighbor exists, check  for eastern edge
						if(drawArray[i][j-1].edgeExists[EAST] == 1){
							//northern neighbor has eastern edge, expand it to current block
							drawArray[i][j].edgeExists[EAST] = 1;
							drawArray[i][j].edgeID[EAST] = drawArray[i][j-1].edgeID[EAST];
							edgeMap[drawArray[i][j].edgeID[EAST]].endY = j+1;
						}
						else{
							//has northern neighbor, but no eastern edge
							//we create a new eastern edge
							drawArray[i][j].edgeExists[EAST] = 1;	//set edge as existing
							drawArray[i][j].edgeID[EAST] = edgeMap.length;	//give an edge id
							let newEdgeEntry = {'startX':i+1,'startY':j,'endX':i+1,'endY':j+1};
							edgeMap.push(newEdgeEntry);
						}
					}
					else{
						//no northern neighbor
						//we create a new edge here
						drawArray[i][j].edgeExists[EAST] = 1;	//set edge as existing
						drawArray[i][j].edgeID[EAST] = edgeMap.length;	//give an edge id
						let newEdgeEntry = {'startX':i+1,'startY':j,'endX':i+1,'endY':j+1};
						edgeMap.push(newEdgeEntry);
					}
				}
				
				//check for northern neighbor
				if(drawArray[i][j-1].exists == 1){
					//northern neighbor found
					//since its a wall, we do nothing
				}
				else{
					//no northern neighbor
					//check for western neighbor with a northern edge
					if(drawArray[i-1][j].exists){
						//western neighbor exists, check  for northern edge
						if(drawArray[i-1][j].edgeExists[NORTH] == 1){
							//western neighbor has northern edge, expand it to current block
							drawArray[i][j].edgeExists[NORTH] = 1;
							drawArray[i][j].edgeID[NORTH] = drawArray[i-1][j].edgeID[NORTH];
							edgeMap[drawArray[i][j].edgeID[NORTH]].endX = i+1;
						}
						else{
							//has northern neighbor, but no northern edge
							//we create a new northern edge
							drawArray[i][j].edgeExists[NORTH] = 1;	//set edge as existing
							drawArray[i][j].edgeID[NORTH] = edgeMap.length;	//give an edge id
							let newEdgeEntry = {'startX':i,'startY':j,'endX':i+1,'endY':j};
							edgeMap.push(newEdgeEntry);
						}
					}
					else{
						//no northern neighbor
						//we create a new edge here
						drawArray[i][j].edgeExists[NORTH] = 1;	//set edge as existing
						drawArray[i][j].edgeID[NORTH] = edgeMap.length;	//give an edge id
						let newEdgeEntry = {'startX':i,'startY':j,'endX':i+1,'endY':j};
						edgeMap.push(newEdgeEntry);
					}
				}
				
				//check southern edge
				if(drawArray[i][j+1].exists == 1){
					//southern neighbor found
					//since its a wall, we do nothing
				}
				else{
					//no southern neighbor
					//check for western neighbor with a southern edge
					if(drawArray[i-1][j].exists){
						//western neighbor exists, check  for southern edge
						if(drawArray[i-1][j].edgeExists[SOUTH] == 1){
							//western neighbor has southern edge, expand it to current block
							drawArray[i][j].edgeExists[SOUTH] = 1;
							drawArray[i][j].edgeID[SOUTH] = drawArray[i-1][j].edgeID[SOUTH];
							edgeMap[drawArray[i][j].edgeID[SOUTH]].endX = i+1;
						}
						else{
							//has western neighbor, but no southern edge
							//we create a new southern edge
							drawArray[i][j].edgeExists[SOUTH] = 1;	//set edge as existing
							drawArray[i][j].edgeID[SOUTH] = edgeMap.length;	//give an edge id
							let newEdgeEntry = {'startX':i,'startY':j+1,'endX':i+1,'endY':j+1};
							edgeMap.push(newEdgeEntry);
						}
					}
					else{
						//no western neighbor
						//we create a new edge here
						drawArray[i][j].edgeExists[SOUTH] = 1;	//set edge as existing
						drawArray[i][j].edgeID[SOUTH] = edgeMap.length;	//give an edge id
						let newEdgeEntry = {'startX':i,'startY':j+1,'endX':i+1,'endY':j+1};
						edgeMap.push(newEdgeEntry);
					}
				}
			}
		}
	}
}
function calculateVisibilityPolygon(visibilityArray,position,visionRadius){
	visibilityArray = new Array();
	for(let i=0;i<edgeMap.length;i++){
		for(let j=0;j<2;j++){
			let rdx = (i == 0 ? edgeMap[i].startX : edgeMap[i].endX) - position.x;
			let rdy = (i == 0 ? edgeMap[i].startY : edgeMap[i].endY) - position.y;
			let baseAngle = Math.atan2(rdy, rdx);
			let angle = 0;
			for(let k=0;k<3;k++){
				if(k == 0)
					angle = baseAngle - 0.0001;
				if(k == 1)
					angle = baseAngle;
				if(k == 2)
					angle = baseAngle + 0.0001;
				rdx = visionRadius * Math.cos(angle);
				rdy = visionRadius * Math.sin(angle);
				let minT1 = 99999999;
				let minPx = 0;
				let minPy = 0;
				let minAngle = 0;
				let bValid = false;
				for(let l=0;l<edgeMap.length;l++){
					let sdx = edgeMap[l].endX - edgeMap[l].startX;
					let sdy = edgeMap[l].endY - edgeMap[l].startY;
					if(Math.abs(sdx - rdx) > 0 && Math.abs(sdy - rdy) > 0){
						let t2 = (rdx * (edgeMap[l].startY - position.y) + (rdy * (position.x - edgeMap[l].startX)))/((sdx * rdy) - (sdy * rdx));
						let t1 = (edgeMap[l].startX + (sdx * t2) - position.x)/rdx;
						if(t1 > 0 && t2 >= 0 && t2 <= 1){
							if(t1 < minT1){
								minT1 = t1;
								minPx = position.x + (rdx * t1);
								minPy = position.y + (rdy * t1);
								minAngle = Math.atan2(minPy - position.y, minPx - position.x);
								bValid = true;
							}
						}
					}
				}
				if(bValid){
					visibilityArray.push({minAngle,minPx,minPy});
				}
			}
		}
	}
	visibilityArray.sort(function(a,b){
		return b.minAngle - a.minAngle;
	});
	return visibilityArray;
}