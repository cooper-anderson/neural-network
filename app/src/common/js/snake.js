/**
 * Created by cooperanderson on 12/4/16 AD.
 */

const seedrandom = require("seedrandom");
const Color = require("./src/common/js/Color");
const {avatar} = require("./src/common/js/avatar");
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

let randomFunc = seedrandom(1);

var sigma = new Sigma({
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
		sideMargin: 1,
		minEdgeSize: 0,
		maxEdgeSize: 3,
		zoomingRatio: 1.7,
		dragTimeout: 0,
		//enableEdgeHovering: true,
		//edgeHoverSizeRatio: 3
	}
});

let inputs = 'a'.repeat(6).split("")
let ann = new NeuralNetwork(inputs, ['a', 'b'], [8, 8]);
let keyCodes = [0, 0, 0, 0, 0, 0, 0, 0];
let keyCodeBits = clone(keyCodes);
let drawSynapses = 3, drawLabels = true, graphColor=Color.colors.material.blue[0], clearEntry = false;
let output = {}
let values = getRandom(inputs.length);
think(values);
color = new Color(128, 128, 255);
function think(values=keyCodeBits) {
	requestAnimationFrame(function() {
		ann.Think(values)
		ann.Draw(sigma, drawSynapses, drawLabels, graphColor);
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
function setValues(value=1) {
	ann.synapses[0][0][0] = -value;
	ann.synapses[0][0][1] = value;
	ann.synapses[0][0][2] = value;
	ann.synapses[0][1][0] = value;
	ann.synapses[0][1][1] = -value;
	ann.synapses[0][1][2] = value;
	ann.synapses[0][2][0] = value;
	ann.synapses[0][2][1] = value;
	ann.synapses[0][2][2] = -value;

	ann.synapses[1][0][0] = value;
	ann.synapses[1][0][1] = -value;
	ann.synapses[1][0][2] = -value;
	ann.synapses[1][1][0] = -value;
	ann.synapses[1][1][1] = value;
	ann.synapses[1][1][2] = -value;
	ann.synapses[1][2][0] = -value;
	ann.synapses[1][2][1] = -value;
	ann.synapses[1][2][2] = value;
}
function setValues2(value=1) {
	ann.synapses[0][0][0] = value;
	ann.synapses[0][0][1] = -value;
	ann.synapses[0][0][2] = -value;
	ann.synapses[0][1][0] = -value;
	ann.synapses[0][1][1] = value;
	ann.synapses[0][1][2] = -value;
	ann.synapses[0][2][0] = -value;
	ann.synapses[0][2][1] = -value;
	ann.synapses[0][2][2] = value;

	ann.synapses[1][0][0] = -value;
	ann.synapses[1][0][1] = value;
	ann.synapses[1][0][2] = -value;
	ann.synapses[1][1][0] = -value;
	ann.synapses[1][1][1] = -value;
	ann.synapses[1][1][2] = value;
	ann.synapses[1][2][0] = value;
	ann.synapses[1][2][1] = -value;
	ann.synapses[1][2][2] = -value;

	ann.synapses[2][0][0] = -value;
	ann.synapses[2][0][1] = -value;
	ann.synapses[2][0][2] = value;
	ann.synapses[2][1][0] = value;
	ann.synapses[2][1][1] = -value;
	ann.synapses[2][1][2] = -value;
	ann.synapses[2][2][0] = -value;
	ann.synapses[2][2][1] = value;
	ann.synapses[2][2][2] = -value;
}

/*$(document).on("keydown", function(event) {
	let keyCode = event.keyCode.toString(2);
	keyCode = '0'.repeat(keyCodeBits.length - keyCode.length) + keyCode;
	keyCodeBits = keyCode.split("");
	for (let i in keyCodeBits) {
		keyCodeBits[i] = Number(keyCodeBits[i]);
	}
	rgb = think();
});

$(document).on("keyup", function(event) {
	if (clearEntry) {
		keyCodeBits = clone(keyCodes);
		rgb = think();
	}
});*/

let step = [.1];
setInterval(function() {
	for (let i = 0; i < values.length; i++) {
		values[i] = clamp(values[i] + (Math.random() * step * 2) - step, 0, 1);
	}
	think(values);
	//think([color.r / 255, color.b / 255, color.g / 255]);
	//color.hue += .01;
}, 100)