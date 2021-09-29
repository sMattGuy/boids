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
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let flag = new Image();
flag.src = "./flag.png";

//sliders
/*
	this is every slider in the index, it is seperated
	by the category of the sliders (boid, area, canvas, etc)
	as new sliders are added, they are to be init. here
*/
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

//buttons
/*
	here are the toggle buttons for the index
	these are designed to just toggle other features
*/
let locationButton = document.getElementById("goToLocation");
let windButton = document.getElementById("windActivate");

//constants
/*
	all constants are delcared here so that we can modify them with
	the slider inputs, which are directly below them
*/
//boid constants
let UNITS = unitsSlider.value;
let SPEED = speedSlider.value;
let RANDOMNESS = randomSlider.value;
let VISIONDISTANCE = visionSlider.value;
let SEPERATION = seperationSlider.value;
let BOUNDS = boundSlider.value;
let SEPINTENSITY = sepIntSlider.value;
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
//canvas listen to get X and Y of mouse click to place flag
canvas.addEventListener('mousedown', e => {
	desiredX = e.offsetX;
	desiredY = e.offsetY;
});

//wind variables
/*
	these variables are all for wind. wind vector is whats applied to
	the boid velocity vector to disrupt it
*/
let windAngle = 0;
let windToggle = false;
let windSpeed = 0;
let windVector = {'x':0,'y':0};

//event updates
/*
	this is where all sliders update values when they are changed
*/
//boid sliders
speedSlider.oninput = function(){
	SPEED = this.value;
	speedInfo.innerHTML = this.value;
}
unitsSlider.oninput = function(){
	let prev = UNITS;
	UNITS = this.value;
	unitsInfo.innerHTML = this.value;
	if(prev < UNITS){
		//units added
		let diff = UNITS - prev
		for(let i=0;i<diff;i++){
			unitArray.push(new boid(FIELDX, FIELDY));
		}
	}
	else if(prev > UNITS){
		//units removed
		let diff = prev - UNITS
		for(let i=0;i<diff;i++){
			unitArray.shift();
		}
	}
}
randomSlider.oninput = function(){
	RANDOMNESS = this.value;
	randomInfo.innerHTML = this.value;
}
visionSlider.oninput = function(){
	VISIONDISTANCE = this.value;
	visionInfo.innerHTML = this.value;
}
seperationSlider.oninput = function(){
	SEPERATION = this.value;
	seperationInfo.innerHTML = this.value;
}
sepIntSlider.oninput = function(){
	SEPINTENSITY = this.value;
	sepIntInfo.innerHTML = this.value;
}
//area sliders
boundSlider.oninput = function(){
	BOUNDS = this.value;
	boundInfo.innerHTML = this.value;
	XMIN = BOUNDS;
	XMAX = FIELDX - BOUNDS;
	YMIN = BOUNDS;
	YMAX = FIELDY - BOUNDS;
}
windSlider.oninput = function(){
	windAngle = this.value;
	windInfo.innerHTML = this.value;
	induceWind();
}
windSpeedSlider.oninput = function(){
	windSpeed = this.value;
	windSpeedInfo.innerHTML = this.value;
	induceWind();
}
//canvas sliders
widthSlider.oninput = function(){
	FIELDX = this.value;
	canvas.width = this.value;
	widthInfo.innerHTML = this.value;
	XMIN = BOUNDS;
	XMAX = FIELDX - BOUNDS;
}
heightSlider.oninput = function(){
	FIELDY = this.value;
	canvas.height = this.value;
	heightInfo.innerHTML = this.value;
	YMIN = BOUNDS;
	YMAX = FIELDY - BOUNDS;
}
/*
	button listening, same as above, but just for toggle buttons
*/
windButton.oninput = function(){
	windToggle = !windToggle;
}
locationButton.oninput = function(){
	goingToDesired = !goingToDesired;
}

/*
	frame setup, this prevents the boids from just going as fast
	as possible. only have this bc of turan showing me how.
*/
var frames = {
	speed: (8000 / 144),
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
		moveAllBoids(unitArray, FIELDX, FIELDY, SPEED);
		draw(unitArray);
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
	doFrames();
}

/*
	the canvas draw function, each section is divided up
	the for loop is what draws the actual units
*/
function draw(){
	ctx.fillStyle = '#eee';
	ctx.fillRect(0,0,FIELDX,FIELDY);
	//draw bounding limit
	ctx.fillStyle = 'rgba(255,0,0,0.05)';
	//left bound
	ctx.fillRect(0,0,XMIN,YMAX);
	//upper
	ctx.fillRect(XMIN,0,FIELDX,YMIN);
	//right
	ctx.fillRect(XMAX,YMIN,FIELDX,FIELDY);
	//lower
	ctx.fillRect(0,YMAX,XMAX,FIELDY);
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
		//draw vision radius
		ctx.beginPath();
		ctx.arc(unitArray[i].position.x + 5,unitArray[i].position.y + 5, VISIONDISTANCE, 0, 2*Math.PI, false);
		ctx.fillStyle = `rgba(10,10,10,0.05)`;
		ctx.fill();
		//draw plane 
		ctx.fillStyle = `rgb(${unitArray[i].color.r},${unitArray[i].color.g},${unitArray[i].color.b})`;
		ctx.fillRect(unitArray[i].position.x,unitArray[i].position.y,10,10);
		//draw velocity line
		ctx.beginPath();
		ctx.moveTo(unitArray[i].position.x + 5,unitArray[i].position.y + 5);
		ctx.lineTo(unitArray[i].position.x + unitArray[i].velocity.x + 5,unitArray[i].position.y + unitArray[i].velocity.y + 5);
		ctx.strokeStyle = `rgb(0,0,0)`;
		ctx.stroke();
	}
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
		//wind, boids cannot control their speed in wind
		if(windToggle){
			planeArray[i].velocity = addVector(planeArray[i].velocity, windVector);
		}
		//update boids position based on velocity
		planeArray[i].position = addVector(planeArray[i].position, planeArray[i].velocity);
		//edit their position based on if theyre leaving the bounds
		boundPosition(planeArray[i]);
	}
}
/*
	rule 1: cohesion
	cohesion controls how boids will want to travel to the middle
	of all other nearby boids
	we average their positions together to define where the middle is
	since boids have a vision radius, they are only influenced by
	the boids around them.
	
	TODO: add color bias as well
*/
function cohesion(currentPlane, planeArray){
	let cohVector = {'x':0,'y':0,'z':0};
	let boidsHit = 0;
	for(let i=0;i<planeArray.length;i++){
		if(planeArray[i] != currentPlane && currentPlane.calculateDistance(planeArray[i]) < VISIONDISTANCE){
			cohVector = addVector(cohVector, planeArray[i].position);
			boidsHit += 1;
		}
	}
	cohVector = divideVector(cohVector, boidsHit);
	let result = subVector(cohVector, currentPlane.position);
	result = divideVector(result, 100);
	return result;
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
			if(currentPlane.calculateDistance(planeArray[i]) < SEPERATION){
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
			aliVel = addVector(aliVel, planeArray[i].velocity);
			testedBoids += 1;
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
//although not necessarly math, it does apply to vectors only 
function injectRandomness(vec, intensity){
	let total = {'x':0,'y':0};
	total.x = vec.x + (Math.random() * (intensity * 2)) - intensity;
	total.y = vec.y + (Math.random() * (intensity * 2)) - intensity;
	return total;
}