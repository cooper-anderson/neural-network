/**
 * Created by cooperanderson on 12/9/16 AD.
 */

const Color = require("./Color");
const seedrandom = require("seedrandom");
const clone = require("clone");

let seed = 1;
let seedRandom = seedrandom(seed);

function random(min=0, max=1, func=function(value) {return value;}, inclusive=true) {
	if (min == 0 && max == 1) {
		return seedRandom();
	} else {
		return func((seedRandom() * (max - min + inclusive)) + min);
	}
}

function maxArray(array=[0]) {
	let max = array[0];
	for (let i = 0; i < array.length; i++) {
		if (max < array[i]) {
			max = array[i];
		}
	}
	return max;
}
function minArray(array=[0]) {
	let min = array[0];
	for (let i = 0; i < array.length; i++) {
		if (min > array[i]) {
			min = array[i];
		}
	}
	return min;
}

/**
 * The Neuron class
 */
class Neuron {
	constructor(isInput=false) {
		this.isInput = isInput;
		this.size = 10;
		this.color = Color.colors.material.lightBlue[0];
		this.value = 0;
	}
	Sigmoid(value) {
		return 1/(1+Math.pow(Math.E, -value));
	}
	GetValue() {
		return this.value;
	}
	SetValue(value) {
		this.value = value;
	}
	Update(synapses=[]) {
		if (!this.isInput) {
			let total = 0;
			for (let s in synapses) {
				total += synapses[s].weight * synapses[s].neuron.Update();
			}
			this.SetValue(this.Sigmoid(total));

		}
		return this.GetValue();
	}
}

/**
 * The Synapse
 */
class Synapse {
	constructor(neuron) {
		this.neuron = neuron;
		this.weight = 1;
	}
}

/**
 * The Neural Network class
 */
class NeuralNetwork {
	constructor(inputLayer=['A', 'B', 'C'], outputLayer=['O'], hiddenLayers=[]) {
		this.inputs = clone(inputLayer);
		this.outputs = clone(outputLayer);
		this.values = []
		for (let i = 0; i < this.inputs.length; i++) {
			if (typeof this.inputs[i] == 'string') {
				this.inputs[i] = {name: this.inputs[i]};
			}
			if (this.inputs[i].color == undefined) {
				this.inputs[i].color = Color.colors.material.blue[0];
			}
		}
		for (let i = 0; i < this.outputs.length; i++) {
			if (typeof this.outputs[i] == 'string') {
				this.outputs[i] = {name: this.outputs[i]};
			}
			if (this.outputs[i].color == undefined) {
				this.outputs[i].color = Color.colors.material.blue[0];
			}
		}
		this.synapses = [];
		this.layers = [this.inputs.length];
		for (let layer = 0; layer < hiddenLayers.length; layer++) {
			this.layers.push(hiddenLayers[layer]);
		}
		this.layers.push(this.outputs.length);
		this.maxLayerCount = maxArray(this.layers);
		for (let synapseLayer = 0; synapseLayer < this.layers.length - 1; synapseLayer++) {
			this.synapses.push([]);
			for (let neuronA = 0; neuronA < this.layers[synapseLayer]; neuronA++) {
				this.synapses[synapseLayer].push([]);
				for (let neuronB = 0; neuronB < this.layers[synapseLayer + 1]; neuronB++) {
					this.synapses[synapseLayer][neuronA].push(random(-1, 1, undefined, false));
				}
			}
		}
	}
	static Sigmoid(value) {
		return 1/(1+Math.pow(Math.E, -value));
	}
	Think(inputs=[]) {
		this.values = [inputs];

		for (let layer = 1; layer < this.layers.length; layer++) {
			this.values.push([]);
			for (let nodeB = 0; nodeB < this.layers[layer]; nodeB++) {
				let total = 0;
				for (let nodeA = 0; nodeA < this.synapses[layer-1].length; nodeA++) {
					total += this.values[layer-1][nodeA] * this.synapses[layer-1][nodeA][nodeB];
				}
				this.values[layer].push(NeuralNetwork.Sigmoid(total));
			}
		}
		let output = {};
		let count = 0;
		for (let index in this.outputs) {
			output[this.outputs[index].name] = this.values[this.values.length - 1][index];
		}
		return output;
	}
	Draw(sigma=undefined, drawSynapses=1, drawLabels=true, graphColor=Color.colors.material.lightBlue[0]) {
		if (sigma.graph.nodes().length < 1) {
			for (let x = 0; x < this.layers.length; x++) {
				for (let y = 0; y < this.layers[x]; y++) {
					sigma.graph.addNode({
						id: `${x}-${y}`,
						label: (drawLabels) ? Number(this.values[x][y].toFixed(2)).toLocaleString() : undefined,
						x: x * 1, /** 8/3,/*///* (sigma.renderers[0].width / this.layers.length),
						y: (((this.maxLayerCount - this.layers[x]) / 2) + y),// * (sigma.renderers[0].height / this.maxLayerCount),
						size: 10,
						color: function (self) {
							if (x == 0) {
								return Color.parse(self.inputs[y].color.cssHEX()).setLightness(self.values[x][y]).cssHEX();
							} else if (x == self.layers.length - 1) {
								return Color.parse(self.outputs[y].color.cssHEX()).setLightness(self.values[x][y]).cssHEX();
							}
							return Color.parse(graphColor.cssRGB()).setLightness(self.values[x][y]).cssHEX()
						}(this)
					});
				}
			}
			if (drawSynapses) {
				for (let layer = 0; layer < this.synapses.length; layer++) {
					for (let a = 0; a < this.synapses[layer].length; a++) {
						for (let b = 0; b < this.synapses[layer][a].length; b++) {
							//if (!(values[layer][a] == 0 && (drawSynapses == 2 || drawSynapses == 3))) {
							sigma.graph.addEdge({
								id: `${layer}-${a}-${b}`,
								source: `${layer}-${a}`,
								target: `${layer + 1}-${b}`,
								size: Math.abs(this.synapses[layer][a][b]),
								label: (drawLabels) ? this.synapses[layer][a][b].toString() : undefined,
								color: function (self) {
									if (drawSynapses == 1) {
										return Color.lerp([Color.colors.material.red[0], Color.colors.material.grey[0], Color.colors.material.grey[0], Color.colors.material.lightGreen[0]], (self.synapses[layer][a][b] + 1) / 2).cssHEX();
									} else if (drawSynapses == 2) {
										return Color.lerp([new Color("#2a2a2b"), Color.lerp([Color.colors.material.red[0], Color.colors.material.grey[0], Color.colors.material.grey[0], Color.colors.material.lightGreen[0]], (self.synapses[layer][a][b] + 1) / 2)], self.values[layer][a]).cssHEX();
									} else if (drawSynapses == 3) {
										let color = undefined;
										if (Math.sign((self.synapses[layer][a][b])) == -1) {
											color = Color.colors.material.red[0];
										} else if (Math.sign((self.synapses[layer][a][b])) == 1) {
											color = Color.colors.material.green[0];
										} else {
											color = Color.colors.material.grey[0];
										}
										return color.setAlpha((self.values[layer][a] * .95) + .05).cssRGBA();
									}
								}(this)
							});
						}
					}
				}
			}
		} else {
			for (let x = 0; x < this.layers.length; x++) {
				for (let y = 0; y < this.layers[x]; y++) {
					sigma.graph.nodes(`${x}-${y}`).label = (drawLabels) ? Number(this.values[x][y].toFixed(2)).toLocaleString() : undefined;
					sigma.graph.nodes(`${x}-${y}`).color = (function (self) {
						if (x == 0) {
							return Color.parse(self.inputs[y].color.cssHEX()).setLightness(self.values[x][y]).cssHEX();
						} else if (x == self.layers.length - 1) {
							return Color.parse(self.outputs[y].color.cssHEX()).setLightness(self.values[x][y]).cssHEX();
						}
						return Color.parse(graphColor.cssRGB()).setLightness(self.values[x][y]).cssHEX()
					})(this);
				}
			}
			if (drawSynapses) {
				for (let layer = 0; layer < this.synapses.length; layer++) {
					for (let a = 0; a < this.synapses[layer].length; a++) {
						for (let b = 0; b < this.synapses[layer][a].length; b++) {
							sigma.graph.edges(`${layer}-${a}-${b}`).color = (function (self) {
								if (drawSynapses == 1) {
									return Color.lerp([Color.colors.material.red[0], Color.colors.material.grey[0], Color.colors.material.grey[0], Color.colors.material.lightGreen[0]], (self.synapses[layer][a][b] + 1) / 2).cssHEX();
								} else if (drawSynapses == 2) {
									return Color.lerp([new Color("#2a2a2b"), Color.lerp([Color.colors.material.red[0], Color.colors.material.grey[0], Color.colors.material.grey[0], Color.colors.material.lightGreen[0]], (self.synapses[layer][a][b] + 1) / 2)], self.values[layer][a]).cssHEX();
								} else if (drawSynapses == 3) {
									let color = undefined;
									if (Math.sign((self.synapses[layer][a][b])) == -1) {
										color = Color.colors.material.red[0];
									} else if (Math.sign((self.synapses[layer][a][b])) == 1) {
										color = Color.colors.material.green[0];
									} else {
										color = Color.colors.material.grey[0];
									}
									/*if (Math.sign((self.synapses[layer][a][b])) == -1) {
										color.setAlpha(1 - ((self.values[layer][a] * .95) + .05));
									} else {
										color.setAlpha((self.values[layer][a] * .95) + .05);
									}
									return color.cssRGBA();*/
									//return color.setAlpha(Math.abs((self.values[layer][a] * 2) - 1)).cssRGBA();
									return color.setAlpha((self.values[layer][a] * .95) + .05).cssRGBA();
								}
							})(this);
						}
					}
				}
			}
		}
		sigma.refresh();

	}
}

module.exports = {Neuron, Synapse, NeuralNetwork, random};