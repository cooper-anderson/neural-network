const seedrandom = require("seedrandom");
const Color = require("./Color");

function avatar(attr={}) {
    /*if (typeof seedrandom == "undefined") { let seedrandom = require("/Users/cooperanderson/node_modules/seedrandom") }
    if (typeof jQuery == "undefined") { let jQuery = require("/Users/cooperanderson/node_modules/jQuery") }*/
    let _attr = {name: Math.floor(Math.random() * 1000), threshold: .5, width: 5, height: 5, color: undefined, seed: 38};
    if (typeof attr == "object") {
        attr = jQuery.extend(_attr, attr);
    } else {
        attr = jQuery.extend(_attr, {name: attr});
    }
    attr.width += !(attr.width % 2); attr.height += !(attr.height % 2);
    if (attr.color == undefined) {
        //attr.color = Color.colorsRaw.material[Math.floor(seedrandom(attr.name + "-color")() * (Color.colorsRaw.material.length))];
	    attr.color = Color.colorsRaw.material[Math.floor(seedrandom(attr.name + "-color")() * (Color.colorsRaw.material.length))];
    }
    let data = {name: attr.name, data: [], color: attr.color, width: attr.width, height: attr.height};
    for (let y = 0; y < attr.height; y++) {
        data.data[y] = [];
        for (let x = 0; x < attr.width; x++) {
            let pos = {x: Math.abs(Math.floor(attr.width / 2) - x), y: y};
            data.data[y][x] = seedrandom(attr.name + '-' + pos.x + '-' + pos.y + attr.seed)() < attr.threshold ? 0 : 1;
        }
    }
    return data;
}

function drawAvatar(attr={}, repeat={x: 5, y: 3}) {
    let data = avatar(attr), lines = [], chars = [' ', '█'];
    for (let y = 0; y < data.height; y++) {
        lines[y] = "";
        for (let x = 0; x < data.width; x++) {
            lines[y] += chars[data.data[y][x]].repeat(repeat.x);
        }
        let line = lines[y];
        for (let i = 0; i < repeat.y-1; i++) {
            lines[y] += '\n' + line;
        }
    }
    console.group(data.name);
    console.log('%c' + lines.join('\n'), `color: ${data.color.cssHEX()}`);
    console.groupEnd();
}

function drawAvatars(attr={}, count=10) {
    for (let i = 0; i < count; i++) {
        drawAvatar(attr);
    }
}

function temp(rand = Math.floor(Math.random() * 1000), repeat=undefined) {
    names = ["Cooper", "titanknox", "grady404"];
    clear();
    console.log(rand);
    names.forEach(function(name, index) {
        drawAvatar(name, undefined, undefined, undefined, repeat, undefined, rand);
        //console.log('\n'.repeat(10));
    });
}

module.exports = {avatar, drawAvatar, drawAvatars, temp};