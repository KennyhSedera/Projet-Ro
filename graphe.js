
var donnees = {
	"nodes": [
		{ nom: 'A', fixed: true, x: 50, y: 250 },
		{ nom: 'B', fixed: true, x: 250, y: 100 },
		{ nom: 'C', fixed: true, x: 500, y: 80 },
		{ nom: 'D', fixed: true, x: 250, y: 450 },
		{ nom: 'E', fixed: true, x: 350, y: 250 },
		{ nom: 'F', fixed: true, x: 650, y: 240 },
		{ nom: 'G', fixed: true, x: 550, y: 420 },
		{ nom: 'H', fixed: true, x: 850, y: 400 },
		{ nom: 'I', fixed: true, x: 780, y: 100 },
		{ nom: 'J', fixed: true, x: 950, y: 250 },
	],
	"links": [
		{ "source": 'A', "target": 'B', "flot": 0, "capacite": 60 },
		{ "source": 'A', "target": 'E', "flot": 0, "capacite": 25 },
		{ "source": 'A', "target": 'D', "flot": 0, "capacite": 40 },
		{ "source": 'B', "target": 'C', "flot": 0, "capacite": 40 },
		{ "source": 'B', "target": 'E', "flot": 0, "capacite": 30 },
		{ "source": 'C', "target": 'I', "flot": 0, "capacite": 5 },
		{ "source": 'C', "target": 'F', "flot": 0, "capacite": 20 },
		{ "source": 'D', "target": 'G', "flot": 0, "capacite": 20 },
		{ "source": 'E', "target": 'C', "flot": 0, "capacite": 15 },
		{ "source": 'E', "target": 'D', "flot": 0, "capacite": 20 },
		{ "source": 'E', "target": 'G', "flot": 0, "capacite": 10 },
		{ "source": 'E', "target": 'H', "flot": 0, "capacite": 20 },
		{ "source": 'F', "target": 'E', "flot": 0, "capacite": 10 },
		{ "source": 'F', "target": 'I', "flot": 0, "capacite": 5 },
		{ "source": 'F', "target": 'H', "flot": 0, "capacite": 10 },
		{ "source": 'G', "target": 'F', "flot": 0, "capacite": 15 },
		{ "source": 'G', "target": 'H', "flot": 0, "capacite": 30 },
		{ "source": 'H', "target": 'J', "flot": 0, "capacite": 55 },
		{ "source": 'I', "target": 'H', "flot": 0, "capacite": 20 },
		{ "source": 'I', "target": 'J', "flot": 0, "capacite": 60 }
	]
};

var indNodeConcerné = null;

var pointmenucontextuel = d3.select(".pointmenucontextuel");
var graphemenucontextuel = d3.select(".graphemenucontextuel");
var linkmenucontextuel = d3.select(".linkmenucontextuel");
var creerPointMenu = d3.select(".creerPointMenu");
var creerCapacite = d3.select(".creerCapacite");
var calculeFlot = d3.select(".calculeFlot");
pointmenucontextuel.style("display", "none");
graphemenucontextuel.style("display", "none");
linkmenucontextuel.style("display", "none");
creerPointMenu.style("display", "none");
creerCapacite.style("display", "none");
calculeFlot.style("display", "none");

var graphe = d3.select("#graphe")
	.append("svg")	// graphe = svg
	.on("click", function (d, i) {
		pointmenucontextuel
			.style("display", "none");
		graphemenucontextuel
			.style("display", "none");
		linkmenucontextuel
			.style("display", "none");
		creerPointMenu
			.style("display", "none");
		creerCapacite
			.style("display", "none");
		calculeFlot
			.style("display", "none");
		d3.event.preventDefault();
	})
	.on("contextmenu", function (d, i) {
		var x = d3.event.pageX;
		var xm = d3.event.pageX;
		var y = d3.event.pageY;
		if (xm >= 1138) {
			xm = xm - 200;
		}
		if (y >= 302.5) {
			y = y - 162;
		}
		var elementPointe = d3.event.target.nodeName;
		if (elementPointe == "svg") {
			graphemenucontextuel
				.style("left", xm + "px")
				.style("top", y + "px")
				.style("display", "block");
			pointmenucontextuel.style("display", "none");
			creerCapacite.style("display", "none");
			creerPointMenu.style("display", "none");
			linkmenucontextuel.style("display", "none");
			calculeFlot.style("display", "none");
		}
		if (x >= 1250) {
			x = 1250;
		}
		coordonneesSouris.x = x;
		coordonneesSouris.y = y;
		d3.event.preventDefault();
	});
graphe.append("g")
	.attr("class", "groupe-path");

graphe.append("g")
	.attr("class", "groupe-capacite");

graphe.append("g")
	.attr("class", "groupe-point");

graphe.attr("width", "100%")
	.attr("height", "500px");

var defs = graphe.append("defs")
	.append("marker")
	.attr("id", "fleche")
	.attr({
		"viewBox": "0 -5 10 10",
		"refX": 30,
		"refY": 0,
		"markerWidth": 15,
		"markerHeight": 10,
		"orient": "auto"
	})
	.append("path")
	.attr("d", "M0,-5L10,0L0,5")
	.attr("fill", "white")
	.attr("class", "arrowHead");


var force = d3.layout.force()
	.size([750, 500]);
