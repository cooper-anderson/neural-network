/**
 * Created by cooperanderson on 12/4/16 AD.
 */

const seedrandom = require("seedrandom");
const Color = require("./src/common/js/Color");
const {avatar} = require("./src/common/js/avatar");
const {Vector2} = require("./src/common/js/Vectors");
const {Neuron, Synapse, NeuralNetwork, random} = require("./src/common/js/NeuralNetwork");
const clone = require("clone");
const Sigma = require("sigma");

Sigma.svg.edges.def.update = function(edge, line, source, target, settings) {
	var prefix = settings('prefix') || '';

	line.setAttributeNS(null, 'stroke-width', edge[prefix + 'size'] || 1);
	line.setAttributeNS(null, 'stroke', edge.color);
	line.setAttributeNS(null, 'x1', source[prefix + 'x']);
	line.setAttributeNS(null, 'y1', source[prefix + 'y']);
	line.setAttributeNS(null, 'x2', target[prefix + 'x']);
	line.setAttributeNS(null, 'y2', target[prefix + 'y']);

	// Showing
	line.style.display = '';

	return this;
}

class Snake {
	constructor(dna="") {
		this.id = Snake.snakes.push(this);
		this.nodes = [new Vector2()];
		this.rotation = new Vector2(0, 1);
		this.rotationSpeed = 4;
		this.velocity = .5;
		this.size = 2;
		this.sightLines = 5;
		this.sightArc = 90;
		this.viewDistance = 20;
		let colors = {food: Color.colors.material.green[0], snake: Color.colors.material.red[0], wall: Color.colors.material.blueGrey[0], rotation: Color.colors.material.purple[0], left: Color.colors.material.amber[0], right: Color.colors.material.amber[0]};
		this.neuralNetwork = new NeuralNetwork([
			{name: 'F1', color: colors.food}, {name: 'F2', color: colors.food}, {name: 'F3', color: colors.food}, {name: 'F4', color: colors.food}, {name: 'F5', color: colors.food},
			{name: 'S1', color: colors.snake}, {name: 'S2', color: colors.snake}, {name: 'S3', color: colors.snake}, {name: 'S4', color: colors.snake}, {name: 'S5', color: colors.snake},
			{name: 'W1', color: colors.wall}, {name: 'W2', color: colors.wall}, {name: 'W3', color: colors.wall}, {name: 'W4', color: colors.wall}, {name: 'W5', color: colors.wall},
			{name: 'rot', color: colors.rotation}
		], [{name: "left", color: colors.left}, {name: "right", color: colors.right}], [6, 7]);
	}
	update(input) {
		this.rotation.Rotate(input * this.rotationSpeed);
		for (let node in this.nodes) {
			if (node == 0) {
				//this.nodes[node].rotation = this.rotation;
				this.nodes[0].Add(Vector2.Mult(this.rotation, this.velocity));
			} else {
				//this.nodes[node].rotation = Vector2.Sub(Vector2.Sub(this.nodes[node-1].position, Vector2.Mult(this.nodes[node-1].rotation, 16)), this.nodes[node].position).normalized;
				this.nodes[node] = Vector2.Sub(this.nodes[node-1], Vector2.Mult(Vector2.Sub(this.nodes[node-1], this.nodes[node]).normalized, this.size * 2));

				if (Vector2.Distance(this.nodes[0], this.nodes[node]) + .01 < this.size * 2) {
					console.log("test");
				}
			}
			/*for (let other in this.nodes) {
				if (node != other) {
					if (Vector2.Distance(this.nodes[node], this.nodes[other]) + .01 < this.size * 2) {
						console.log("test");
					}
				}
			}*/
		}
	}
	eat() {
		if (this.nodes.length > 1) {
			this.nodes.push(Vector2.Add(this.nodes[this.nodes.length - 1], Vector2.Sub(this.nodes[this.nodes.length - 1], this.nodes[this.nodes.length - 2])));
		} else {
			this.nodes.push(new Vector2());
		}
	}
	think() {
		let thoughts = this.neuralNetwork.Think([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, Math.abs(this.rotation.Angle()/180)]);
		if (Snake.selectedSnake == this.id) {
			this.neuralNetwork.Draw(network);
		}
		this.update((thoughts.left > thoughts.right) ? -1 : 1);
	}
	draw(sigma) {
		function getColor(self, node) {
			return Color.lerp([Color.colors.material.blue[0], new Color(255, 255, 255)], node / self.nodes.length).cssHEX();
		}
		for (let node in this.nodes) {
			if (!sigma.graph.nodes(`snake${this.id}-${node}`)) {
				sigma.graph.addNode({
					id: `snake${this.id}-${node}`,
					label: `snake${this.id}-0`,
					x: this.nodes[node].x,
					y: this.nodes[node].y,
					size: this.size,
					color: getColor(this, node)
				});
			}
			sigma.graph.nodes(`snake${this.id}-${node}`).x = this.nodes[node].x;
			sigma.graph.nodes(`snake${this.id}-${node}`).y = this.nodes[node].y;
			sigma.graph.nodes(`snake${this.id}-${node}`).color = getColor(this, node);
		}
		if (this.id == Snake.selectedSnake) {
			for (let sightLine = 0; sightLine < this.sightLines; sightLine++) {
				let vector = Vector2.Add(
					this.nodes[0], Vector2.Mult(
						Vector2.Rotate(
							this.rotation,
							(-this.sightArc / 2) + ((this.sightArc / (this.sightLines-1)) * (sightLine))
						),
						this.viewDistance
					)
				);
				if (!sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`)) {
					sigma.graph.addNode({
						id: `snake${this.id}-sightpoint${sightLine}`,
						x: vector.x,
						y: vector.y,
						size: .1,
						color: "#000"
					});
					sigma.graph.addEdge({
						id: `snake${this.id}-sightline${sightLine}`,
						source: `snake${this.id}-0`,
						target: `snake${this.id}-sightpoint${sightLine}`,
						color: Color.colors.material.grey[0].cssHEX()
					});
				} else {
					sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`).x = vector.x;
					sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`).y = vector.y;
				}
			}
		} else {
			if (sigma.graph.nodes(`snake${this.id}-sightpoint0`)) {
				for (let sightLine = 0; sightLine < this.sightLines; sightLine++) {
					sigma.graph.dropNode(`snake${this.id}-sightpoint${sightLine}`);
					sigma.graph.dropEdge(`snake${this.id}-sightline${sightLine}`);
				}
			}
		}
	}
	static AddFood(position=undefined) {
		if (position == undefined) {

		}
	}
}
Snake.selectedSnake = 1;
Snake.snakes = []


let randomFunc = seedrandom(1);

var game = new Sigma({
	renderer: {
		container: $("#game").get()[0],
		type: 'svg'
	},
	settings: {
		doubleClickEnabled: false,
		nodesPowRatio: 1,
		edgesPowRatio: 1,
		drawLabels: false,
		labelThreshold: 1000,
		minNodeSize: 0,
		maxNodeSize: 1,
		autoRescale: false,
		zoomingRatio: 1,
		//enableEdgeHovering: true,
		//edgeHoverSizeRatio: 3
	}
});

var network = new Sigma({
	renderer: {
		container: $("#neural-network").get()[0],
		type: 'svg'
	},
	settings: {
		doubleClickEnabled: false,
		nodesPowRatio: 1,
		edgesPowRatio: 1,
		drawLabels: false,
		labelThreshold: 1000,
		sideMargin: .1,
		minEdgeSize: 0,
		maxEdgeSize: 3,
		zoomingRatio: 1,
		dragTimeout: 0,
		//enableEdgeHovering: true,
		//edgeHoverSizeRatio: 3
	}
});

let position = new Vector2(0, 0);
let rotation = new Vector2(0, -1);
/*game.graph.addNode({
	id: "-1-1",
	x: -1,
	y: -1,
	size: 1,
	color: Color.colors.material.purple[0]
});
//game.graph.addNode({
	id: "-11",
	x: -1,
	y: 1,
	size: 1,
	color: Color.colors.material.purple[0]
});
//game.graph.addNode({
	id: "1-1",
	x: 1,
	y: -1,
	size: 1,
	color: Color.colors.material.purple[0]
});
//game.graph.addNode({
	id: "11",
	x: 1,
	y: 1,
	size: 1,
	color: Color.colors.material.purple[0]
});
//game.refresh();*/

let keys = {"ArrowLeft": false, "ArrowRight": false}, rotate = 4;
let snakes = []
let snakesCount = 8;

for (let s = 0; s < snakesCount; s++) {
	snakes.push(new Snake());
}


$(document).on("keydown", function(event) {
	keys[event.key] = true;
	if (event.key == "Shift") {
		for (let snake in snakes) {
			snakes[snake].eat();
		}
	}
})
$(document).on("keyup", function(event) {
	keys[event.key] = false;
})

game.camera.ratio = .1;
setInterval(function() {
	for (let snake in snakes) {
		if (snake != snakes.length - 1) {
			snakes[snake].think();//update(keys["ArrowLeft"] - keys["ArrowRight"], keys["Shift"]);
		} else {
			snakes[snake].update(keys["ArrowLeft"] - keys["ArrowRight"]);
		}
		snakes[snake].draw(game);
	}
	//game.camera.goTo({x: 0, y: 0});
	game.refresh();
}, 1000/60);

/*let inputs = 'a'.repeat(16).split("")
let colors = {food: Color.colors.material.green[0], snake: Color.colors.material.red[0], wall: Color.colors.material.blueGrey[0], rotation: Color.colors.material.purple[0], left: Color.colors.material.amber[0], right: Color.colors.material.amber[0]};
let ann = new NeuralNetwork([
	{name: 'F1', color: colors.food}, {name: 'F2', color: colors.food}, {name: 'F3', color: colors.food}, {name: 'F4', color: colors.food}, {name: 'F5', color: colors.food},
	{name: 'S1', color: colors.snake}, {name: 'S2', color: colors.snake}, {name: 'S3', color: colors.snake}, {name: 'S4', color: colors.snake}, {name: 'S5', color: colors.snake},
	{name: 'W1', color: colors.wall}, {name: 'W2', color: colors.wall}, {name: 'W3', color: colors.wall}, {name: 'W4', color: colors.wall}, {name: 'W5', color: colors.wall},
	{name: 'rot', color: colors.rotation}
], [{name: "left", color: colors.left}, {name: "right", color: colors.right}], [6, 7]);
let keyCodes = [0, 0, 0, 0, 0, 0, 0, 0];
let keyCodeBits = clone(keyCodes);
let drawSynapses = 3, graphColor=Color.colors.material.lightBlue[0], clearEntry = false;
let output = {}
let values = getRandom(inputs.length);
think(values);
color = new Color(128, 128, 255);
function think(values=keyCodeBits) {
	requestAnimationFrame(function() {
		ann.Think(values)
		ann.Draw(sigma, {drawSynapses: drawSynapses, graphColor: graphColor, scale: {x: 0, y: 0}});
	});
}
function clamp(value, min, max) {
	if (value < min) {
		return min;
	} else if (value > max) {
		return max;
	}
	return value;
}
function random2(min=0, max=1, func=function(value) {return value;}, inclusive=true) {
	if (min == 0 && max == 1) {
		return randomFunc();
	} else {
		return func((randomFunc() * (max - min + inclusive)) + min);
	}
}

function getRandom(length) {
	let array = []
	for (let i = 0; i < length; i++) {
		array.push(random2());
	}
	return array;
}

let step = .1;
setInterval(function() {
	for (let i = 0; i < values.length; i++) {
		values[i] = clamp(values[i] + (Math.random() * step * 2) - step, 0, 1);
	}
	think(values);
	//think([color.r / 255, color.b / 255, color.g / 255]);
	//color.hue += .01;
}, 100)*/