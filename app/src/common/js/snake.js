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

function clamp(value, min=0, max=1) {
	if (value < min) {
		return min;
	} else if (value > max) {
		return max;
	}
	return value;
}

class Snake {
	constructor(dna="") {
		Snake.snakeIDs++;
		this.id = Snake.snakeIDs;
		this.maxLife = 10 * 60;
		this.lifeTime = this.maxLife / 2;
		this.time = 0;
		this.nodes = [new Vector2()];
		this.rotation = new Vector2(0, 1);
		this.rotationSpeed = 4;
		this.velocity = .5;
		this.size = 2;
		this.sightLines = []
		this.sightLinesCount = 2;
		for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
			this.sightLines.push(Vector2.Mult(
				Vector2.Rotate(
					this.rotation,
					(-this.sightArc / 2) + ((this.sightArc / (this.sightLinesCount-1)) * (sightLine))
				),
				this.viewDistance
			));
		}
		this.sightArc = 120;
		this.viewDistance = 20;
		this.alive = true;
		this.alpha = .9;
		let colors = {food: Color.colors.material.green[0], snake: Color.colors.material.red[0], wall: Color.colors.material.blueGrey[0], rotation: Color.colors.material.purple[0], left: Color.colors.material.amber[0], right: Color.colors.material.amber[0]};
		this.vision = {"rot1": 0, "rot2": 0};
		let inputs = [];
		let outputs = [{name: "left", color: colors.left}, {name: "right", color: colors.right}];
		let hiddenLayers = [];
		for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
			inputs.push({name: `F${sightLine}`, color: colors.food});
			this.vision[`F${sightLine}`] = 0;
		}
		for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
			inputs.push({name: `S${sightLine}`, color: colors.snake});
			this.vision[`S${sightLine}`] = 0;
		}
		for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
			inputs.push({name: `W${sightLine}`, color: colors.wall});
			this.vision[`W${sightLine}`] = 0;
		}
		inputs.push({name: "life", color: Color.colors.material.pink[0]});
		inputs.push({name: "rot1", color: colors.rotation});
		inputs.push({name: "rot2", color: colors.rotation});
		this.emptyVision = clone(this.vision);
		let synapseCount = NeuralNetwork.GetSynapseCount(inputs, outputs, hiddenLayers);
		this.dna = dna;
		this.color = Color.GetRandomColor("material");
		if (this.dna == "") {
			for (let synapse = 0; synapse < synapseCount; synapse++) {
				this.dna =
					"00000000" +
					"11111111" +
					"11111111" +
					"00000000" +
					"11111111" +
					"00000000" +
					"00000000" +
					"11111111" +
					"11111111" +
					"00000000" +
					"00000000" +
					"11111111" +
					"10000000" +
					"10000000" +
					"11110000" +
					"10000000" +
					"10000000" +
					"11110000"
				/*let byte = "";
				for (let i = 0; i < 8; i++) {
					byte += Math.round(Math.random());
				}
				this.dna += byte;*/
			}
		} else {
			this.color = new Color(
				parseInt(this.dna.slice((synapseCount * 8), ((synapseCount+1) * 8)), 2),
				parseInt(this.dna.slice(((synapseCount+1) * 8), ((synapseCount+2) * 8)), 2),
				parseInt(this.dna.slice(((synapseCount+2) * 8), ((synapseCount+3) * 8)), 2)
			)
		}
		this.dna += (Color.GetBinary(this.color));
		this.neuralNetwork = new NeuralNetwork(inputs, outputs, hiddenLayers, this.dna);
	}
	update(input) {
		if (this.alive) {
			this.rotation.Rotate(input * this.rotationSpeed);
			this.sightLines = []
			for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
				this.sightLines.push(Vector2.Mult(
					Vector2.Rotate(
						this.rotation,
						(-this.sightArc / 2) + ((this.sightArc / (this.sightLinesCount-1)) * (sightLine))
					),
					this.viewDistance
				));
			}
			for (let node in this.nodes) {
				if (node == 0) {
					this.nodes[0].Add(Vector2.Mult(this.rotation, this.velocity));

					for (let f in Snake.food) {
						if (Vector2.Distance(this.nodes[0], Snake.food[f].position) + .01 < this.size + Snake.foodSize) {
							Snake.food.splice(f, 1);
							this.eat();
						}
					}
				} else {
					this.nodes[node] = Vector2.Sub(this.nodes[node - 1], Vector2.Mult(Vector2.Sub(this.nodes[node - 1], this.nodes[node]).normalized, this.size * 2));

					if (Vector2.Distance(this.nodes[0], this.nodes[node]) + .01 < this.size * 2) {
						this.alive = false;
					}
				}
			}
			if (
				this.nodes[0].x > Snake.boundingBox[0]/2 - this.size ||
				this.nodes[0].x < -Snake.boundingBox[0]/2 + this.size ||
				this.nodes[0].y > Snake.boundingBox[1]/2 - this.size ||
				this.nodes[0].y < -Snake.boundingBox[1]/2 + this.size
			) {
				this.alive = false;
			}
			this.lifeTime--;
			this.time++;
			if (!this.lifeTime) {
				this.alive = false;
			}
		} else {
			this.alpha = clamp(this.alpha - .02, -1, 1);
			if (this.alpha < -.1) {
				Snake.snakes.splice(Snake.snakes.indexOf(this), 1);
			}
		}
	}
	eat() {
		if (this.nodes.length > 1) {
			this.nodes.push(Vector2.Add(this.nodes[this.nodes.length - 1], Vector2.Sub(this.nodes[this.nodes.length - 1], this.nodes[this.nodes.length - 2])));
		} else {
			this.nodes.push(clone(this.nodes[0]));
		}
		this.lifeTime = clamp(this.lifeTime + 60 * 2.5, 0, this.maxLife);
	}
	think() {
		//let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ];
		this.vision = clone(this.emptyVision);
		for (let sightLine in this.sightLines) {
			let vector = this.sightLines[sightLine];
			for (let food in Snake.food) {
				if (Vector2.areClockwise(Vector2.Add(this.sightLines[0], new Vector2(-this.sightLines[0].y, this.sightLines[0].x)), Vector2.Sub(Snake.food[food].position, this.nodes[0])) && !Vector2.areClockwise(Vector2.Sub(this.sightLines[this.sightLinesCount - 1], new Vector2(-this.sightLines[this.sightLinesCount - 1].y, this.sightLines[this.sightLinesCount - 1].x)), Vector2.Sub(Snake.food[food].position, this.nodes[0]))) {
					if (Vector2.DistanceFromVectorToPoint(vector, Vector2.Sub(Snake.food[food].position, this.nodes[0])) <= Snake.foodSize && Vector2.Distance(this.nodes[0], Snake.food[food].position) <= this.viewDistance) {
						this.vision[`F${sightLine}`] = 1 - clamp(Vector2.Distance(Snake.food[food].position, this.nodes[0]) / this.viewDistance);
					}
				}
			}
			for (let node in this.nodes) {
				if (Vector2.areClockwise(Vector2.Add(this.sightLines[0], new Vector2(-this.sightLines[0].y, this.sightLines[0].x)), Vector2.Sub(this.nodes[node], this.nodes[0])) && !Vector2.areClockwise(Vector2.Sub(this.sightLines[this.sightLinesCount - 1], new Vector2(-this.sightLines[this.sightLinesCount - 1].y, this.sightLines[this.sightLinesCount - 1].x)), Vector2.Sub(this.nodes[node], this.nodes[0]))) {
					if (Vector2.DistanceFromVectorToPoint(vector, Vector2.Sub(this.nodes[node], this.nodes[0])) <= this.size && Vector2.Distance(this.nodes[0], this.nodes[node]) <= this.viewDistance) {
						this.vision[`S${sightLine}`] = 1 - clamp(Vector2.Distance(this.nodes[node], this.nodes[0]) / this.viewDistance);
					}
				}
			}
			if (Vector2.Add(this.nodes[0], this.sightLines[sightLine]).x > Snake.boundingBox[0] / 2) {
				let adjacent = Math.abs(this.nodes[0].x - (Snake.boundingBox[0] - this.size)/2);
				let theta = Vector2.Angle(new Vector2(1, 0), this.sightLines[sightLine]);
				let hypotenuse = adjacent / Math.cos(theta * Math.deg2rad);
				this.vision[`W${sightLine}`] = 1 - (hypotenuse / this.viewDistance);
			} else if (Vector2.Add(this.nodes[0], this.sightLines[sightLine]).x < -Snake.boundingBox[0] / 2) {
				let adjacent = Math.abs(this.nodes[0].x + (Snake.boundingBox[0] - this.size)/2);
				let theta = Vector2.Angle(new Vector2(-1, 0), this.sightLines[sightLine]);
				let hypotenuse = adjacent / Math.cos(theta * Math.deg2rad);
				this.vision[`W${sightLine}`] = 1 - (hypotenuse / this.viewDistance);
			} else if (Vector2.Add(this.nodes[0], this.sightLines[sightLine]).y > Snake.boundingBox[1] / 2) {
				let adjacent = Math.abs(this.nodes[0].y - (Snake.boundingBox[1] - this.size)/2);
				let theta = Vector2.Angle(new Vector2(0, 1), this.sightLines[sightLine]);
				let hypotenuse = adjacent / Math.cos(theta * Math.deg2rad);
				this.vision[`W${sightLine}`] = 1 - (hypotenuse / this.viewDistance);
			} else if (Vector2.Add(this.nodes[0], this.sightLines[sightLine]).y < -Snake.boundingBox[1] / 2) {
				let adjacent = Math.abs(this.nodes[0].y + (Snake.boundingBox[1] - this.size)/2);
				let theta = Vector2.Angle(new Vector2(0, -1), this.sightLines[sightLine]);
				let hypotenuse = adjacent / Math.cos(theta * Math.deg2rad);
				this.vision[`W${sightLine}`] = 1 - (hypotenuse / this.viewDistance);
			} else {
				this.vision[`W${sightLine}`] = 0;
			}
		}
		this.vision["rot1"] = (Math.sin(this.time / 10) + 1) / 2;
		this.vision["rot2"] = 1-(Math.sin(this.time / 10) + 1) / 2;
		this.vision["life"] = (this.maxLife - this.lifeTime) / this.maxLife;
		let thoughts = this.neuralNetwork.Think(this.vision);
		if (Snake.selectedSnake.id == this.id) {
			this.neuralNetwork.Draw(network);
		}
		//this.update((thoughts.straight > thoughts.left && thoughts.straight > thoughts.right) ? 0 : ((thoughts.left > thoughts.right) ? -1 : 1));
		let direction = 0;
		//if (thoughts.straight > thoughts.left && thoughts.straight > thoughts.right) {
			//direction = 0
		//} else
		if (thoughts.left > thoughts.right) {
			direction = thoughts.left;
		} else {
			direction = thoughts.right;
		}
		if (this.id == Snake.selectedSnake.id && keys["Shift"]) {
			this.update(keys["ArrowLeft"] - keys["ArrowRight"]);
		} else {
			this.update((thoughts.left - thoughts.right) * 10);
		}
		//this.update(((thoughts.left - thoughts.right) * 10 * (1 - keys["Shift"])) + ((keys["ArrowLeft"] - keys["ArrowRight"]) * (this.id == Snake.selectedSnake.id)) * (keys["Shift"]))// + Math.sin(this.time / 10));
	}
	draw(sigma) {
		function getColor(self, node) {
			return Color.lerp([self.color, new Color(255, 255, 255)], node / self.nodes.length).setAlpha(self.alpha).cssRGBA();
		}
		for (let node in this.nodes) {
			if (!sigma.graph.nodes(`snake${this.id}-${node}`)) {
				sigma.graph.addNode({
					id: `snake${this.id}-${node}`,
					//label: `snake${this.id}-0`,
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
		/*if (this.id == Snake.selectedSnake) {
			for (let sightLine in this.sightLines) {
				let vector = this.sightLines[sightLine];
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
					let color = Color.colors.material.grey[0];
					sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`).x = Vector2.Add(this.nodes[0], vector).x;
					sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`).y = Vector2.Add(this.nodes[0], vector).y;
					sigma.graph.nodes(`snake${this.id}-sightpoint${sightLine}`).color = new Color().setAlpha(this.alpha).cssRGBA();
					if (this.alive) {
						sigma.graph.edges(`snake${this.id}-sightline${sightLine}`).color = color.setAlpha(this.alpha).cssRGBA();
					}
				}
			}
		} else {
			if (sigma.graph.nodes(`snake${this.id}-sightpoint0`) && this.alive) {
				for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
					sigma.graph.dropNode(`snake${this.id}-sightpoint${sightLine}`);
					sigma.graph.dropEdge(`snake${this.id}-sightline${sightLine}`);
				}
			}
		}*/
		if (this.alive == false && this.alpha <= .1) {
			for (let node in this.nodes) {
				sigma.graph.dropNode(`snake${this.id}-${node}`);
			}
			/*for (let sightLine = 0; sightLine < this.sightLinesCount; sightLine++) {
				if (sigma.graph.nodes(`snake${this.id}-sightpoint${this.id}`)) {
					sigma.graph.dropNode(`snake${this.id}-sightpoint${sightLine}`);
					sigma.graph.dropEdge(`snake${this.id}-sightline${sightLine}`);
				}
			}*/
		}
	}
	getDNA() {
		return this.dna;
	}
	static Update() {
		for (let f = 0; f < Snake.foodCount; f++) {
			if (Snake.food.length < Snake.foodCount) {
				Snake.AddFood();
			}
			Snake.food[f].position = Vector2.Add(Snake.food[f].position, Vector2.Mult(Snake.food[f].rotation, Snake.food[f].velocity));
			Snake.food[f].alpha = clamp(Snake.food[f].alpha + .05, 0, 1);
			if (
				Snake.food[f].position.x > (Snake.boundingBox[0] - Snake.foodSize*2)/2 ||
				Snake.food[f].position.x < -(Snake.boundingBox[0] - Snake.foodSize*2)/2 ||
				Snake.food[f].position.y > (Snake.boundingBox[1] - Snake.foodSize*2)/2 ||
				Snake.food[f].position.y < -(Snake.boundingBox[1] - Snake.foodSize*2)/2
			) {
				Snake.food.splice(f, 1);
				Snake.AddFood();
			}
		}
	}
	static Draw(sigma) {
		for (let f = 0; f < Snake.foodCount; f++) {
			if (!sigma.graph.nodes(`Snake-food${f}`)) {
				sigma.graph.addNode({
					id: `Snake-food${f}`,
					x: Snake.food[f].position.x,
					y: Snake.food[f].position.y,
					size: Snake.foodSize,
					color: Color.colors.material.green[0].setAlpha(Snake.food[f].alpha).cssRGBA()
				});
			}
			sigma.graph.nodes(`Snake-food${f}`).x = Snake.food[f].position.x;
			sigma.graph.nodes(`Snake-food${f}`).y = Snake.food[f].position.y;
			sigma.graph.nodes(`Snake-food${f}`).color = Color.colors.material.green[0].setAlpha(Snake.food[f].alpha).cssRGBA();
			sigma.refresh();
		}
	}
	static AddFood(position=undefined) {
		if (position == undefined) {
			Snake.food.push({
				position: new Vector2(((Math.random() * 2) - 1) * (Snake.boundingBox[0] - Snake.foodSize * 2), ((Math.random() * 2) - 1) * (Snake.boundingBox[1] - Snake.foodSize * 2)),
				rotation: new Vector2((Math.random() * 2) - 1, (Math.random() * 2) - 1).normalized,
				velocity: .01,
				alpha: 0
			});
		}
	}
}
Snake.snakeIDs = 0;
Snake.selectedSnake = {id: -1, alpha: 0};
Snake.foodCount = 16;
Snake.foodSize = 1;
Snake.food = [];
Snake.snakes = [];
Snake.boundingBox = [128, 128];

let randomFunc = seedrandom(1);

var game = new Sigma({
	renderer: {
		container: $("#game").get()[0],
		type: 'webGL'
	},
	settings: {
		doubleClickEnabled: false,
		nodesPowRatio: 1,
		edgesPowRatio: 1,
		drawLabels: false,
		labelThreshold: 1000,
		minNodeSize: 0,
		maxNodeSize: 1,//20,
		//sideMargin: 10
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

{
	let size = .1;
	game.graph.addNode({
		id: "topLeft",
		x: -Snake.boundingBox[0]/2,
		y: -Snake.boundingBox[1]/2,
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addNode({
		id: "topRight",
		x: Snake.boundingBox[0]/2,
		y: -Snake.boundingBox[1]/2,
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addNode({
		id: "bottomLeft",
		x: -Snake.boundingBox[0]/2,
		y: Snake.boundingBox[1]/2,
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addNode({
		id: "bottomRight",
		x: Snake.boundingBox[0]/2,
		y: Snake.boundingBox[1]/2,
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addEdge({
		id: "top",
		source: "topLeft",
		target: "topRight",
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addEdge({
		id: "bottom",
		source: "bottomLeft",
		target: "bottomRight",
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addEdge({
		id: "left",
		source: "bottomLeft",
		target: "topLeft",
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addEdge({
		id: "right",
		source: "bottomRight",
		target: "topRight",
		size: size,
		color: Color.colors.material.red[0].cssRGBA()
	});
	game.graph.addNode({
		id: "selected",
		x: 0,
		y: 0,
		size: .5,
		color: Color.colors.material.pink[0].cssRGBA()
	})
}

let keys = {"ArrowLeft": false, "ArrowRight": false, "Shift": false};
let snakesCount = 1;

game.bind("click", function(event) {
	let selectedSnake = undefined;
	let currentDistance = 10000;
	let position = Vector2.Mult(Vector2.Sub(new Vector2(event.data.x - $("#game").position().left, event.data.y - $("#game").position().top), Vector2.Div(new Vector2(game.renderers[0].width, game.renderers[0].height), 2)), game.camera.ratio);
	for (let snake of Snake.snakes) {
		let distance = Vector2.Distance(snake.nodes[0], position)
		if (distance < currentDistance) {
			selectedSnake = snake;
			currentDistance = distance;
		}
	}
	console.log(Snake.selectedSnake.id, selectedSnake.id);
	Snake.selectedSnake = selectedSnake;
	console.log(Snake.selectedSnake.id, selectedSnake.id);
});

$(document).on("keydown", function(event) {
	keys[event.key] = true;
	if (event.key == "Shift") {
		for (let snake in Snake.snakes) {
			//Snake.snakes[snake].eat();
		}
	}
})
$(document).on("keyup", function(event) {
	keys[event.key] = false;
})

for (let s = 0; s < snakesCount; s++) {
	Snake.snakes.push(new Snake());
}

setInterval(function() {
	game.camera.ratio = Math.max(Snake.boundingBox[0] / game.renderers[0].width, Snake.boundingBox[1] / game.renderers[0].height);
	Snake.Update();
	Snake.Draw(game);
	if (Snake.snakes.length < snakesCount) {
		Snake.snakes.push(new Snake(Snake.snakes[0].getDNA())/*Snake.snakes[0].getDNA()*/);
	}
	if (Snake.selectedSnake.alpha < .9) {
		Snake.selectedSnake = Snake.snakes[0];
	}
	//Snake.selectedSnake = Snake.snakes[0];
	Snake.snakes.forEach(function(snake, index) {
		//if (snake != Snake.snakes.length - 1) {
		snake.think();//update(keys["ArrowLeft"] - keys["ArrowRight"], keys["Shift"]);
		//} else {
			//Snake.snakes[snake].update((keys["ArrowLeft"] - keys["ArrowRight"]));
		//}
		snake.draw(game);
	});
	game.graph.nodes("selected").x = Snake.selectedSnake.nodes[0].x + Vector2.Mult(Snake.selectedSnake.rotation, Snake.selectedSnake.size).x;
	game.graph.nodes("selected").y = Snake.selectedSnake.nodes[0].y + Vector2.Mult(Snake.selectedSnake.rotation, Snake.selectedSnake.size).y;
	//game.camera.goTo({x: 0, y: 0});
	game.refresh();
}, 1000/60);
