var app = angular.module("flot-max", []);

var coordonneesSouris = {
    x: 0, y: 0
};

var sourcePoint = '';
var targetPoint = '';
var sourceFlot = '';
var targetFlot = '';
var linkData;
var id;
app
    .service("grapheProvider", function () {
        this.traitements = [];
        var initialNodes = donnees.nodes;
        var initialLinks = donnees.links;

        this.saveInitialState = function () {
            initialNodes = JSON.parse(JSON.stringify(donnees.nodes));
            initialLinks = JSON.parse(JSON.stringify(donnees.links));
        };

        this > this.saveInitialState();

        this.restoreInitialState = function () {
            donnees.nodes = JSON.parse(JSON.stringify(initialNodes));
            donnees.links = JSON.parse(JSON.stringify(initialLinks));
        };

        this.deleteInitialState = function () {
            donnees.nodes = [];
            donnees.links = [];
        };

        this.getGraphe = function () {
            return donnees;
        };

        this.update = function () {
            //g = variable de sauvegarde de grapheprovider
            var g = this;
            //Reconstruction de données
            var arcs = [];
            for (var i = 0; i < donnees.links.length; i++) {
                var link = donnees.links[i];
                var src = donnees.nodes.filter(function (node) {
                    return link.source === node.nom;
                })[0], dest = donnees.nodes.filter(function (node) {
                    return link.target === node.nom;
                })[0];
                arcs.push({
                    source: src,
                    target: dest,
                    flot: link.flot,
                    capacite: link.capacite
                });
            }
            force
                .nodes(donnees.nodes)
                .links(arcs);
            var lineFunction = d3.svg.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .interpolate("line");

            var link = graphe.select(".groupe-path").selectAll(".link")
                .data(force.links())
                .attr("id", function (d, i) {
                    return "path" + i;
                })
                .attr("class", "link")
                .attr("stroke", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                });

            ///Création de nouveaux liens
            link.enter().append("path")
                .attr("id", function (d, i) {
                    return "path" + i;
                })
                .attr("class", "link")
                .attr("stroke", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                })
                .attr("marker-end", "url(#fleche)");
            //Suppression des liens inutiles
            link.exit().remove();
            var capacite = graphe.select(".groupe-capacite").selectAll(".capacite")
                .data(force.links())
                .attr("stroke", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                })
                .attr("fill", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                });

            capacite.select("textPath").text(function (d) { return d.capacite + ' ( ' + d.flot + ' )' });

            capacite.enter().append("text")
                .attr("class", "capacite")
                .attr("stroke", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                })
                .attr("fill", function (d) {
                    return (d.flot == d.capacite) ? "red" : (d.flot != 0) ? "blue" : "white";
                })
                .attr("dy", -10)
                .attr("text-anchor", "middle")
                .append("textPath")
                .attr("startOffset", "40%")
                .attr("xlink:href", function (d, i) { return "#path" + i; })
                .text(function (d) { return d.capacite + ' ( ' + d.flot + ' )' })
                .on("contextmenu", function (d, i) {
                    d3.event.preventDefault();
                    var x = d3.event.pageX;
                    var y = d3.event.pageY;
                    if (x >= 1150) {
                        x = x - 200
                    }
                    if (y >= 342) {
                        y = y - 82;
                    }
                    linkmenucontextuel
                        .style("left", x + "px")
                        .style("top", y + "px")
                        .style("display", "block");
                    pointmenucontextuel.style("display", "none");
                    creerCapacite.style("display", "none");
                    creerPointMenu.style("display", "none");
                    graphemenucontextuel.style("display", "none");
                    linkData = d;
                    id = i;
                });
            capacite.exit().remove();

            //////////////////////////////////////////////////////////////////

            var pt = graphe.select(".groupe-point").selectAll(".point")
                .data(donnees.nodes);
            pt.select("text")
                .text(function (d) {
                    return d.nom;
                });
            pt.enter()
                .append("g")
                .attr("class", "point")
                .on("contextmenu", function (d, i) {
                    var x = d3.event.pageX;
                    var y = d3.event.pageY;
                    if (x >= 1150) {
                        x = x - 200
                    }
                    if (y >= 355) {
                        y = y - 102;
                    }
                    indNodeConcerné = i;
                    pointmenucontextuel
                        .style("left", x + "px")
                        .style("top", y + "px")
                        .style("display", "block");
                    graphemenucontextuel.style("display", "none");
                    creerCapacite.style("display", "none");
                    creerPointMenu.style("display", "none");
                    linkmenucontextuel.style("display", "none");
                });

            var cercle = pt.append("circle")
                .attr("r", 20)
                .attr("stroke", "white")
                .attr("fill", function (d) {
                    return d.nom === sourcePoint || d.nom === targetPoint ? 'red' : d.nom === sourceFlot || d.nom === targetFlot ? 'orange' : '#393939'
                });

            var texte = pt.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", 8)
                .attr("stroke", "white")
                .attr("fill", "white")
                .text(function (d) {
                    return d.nom;
                });

            pt.call(force.drag());

            pt.exit().remove();

            force.start();
            force.on("tick", function () {
                link.attr("d", function (d) {
                    return lineFunction([
                        { x: d.source.x, y: d.source.y },
                        { x: d.target.x, y: d.target.y }
                    ]);
                });
                pt.attr("transform", function (d) {
                    return "translate(" + d.x + ", " + d.y + ")";
                });
            });
        };

        this.createPoint = function (point) {
            donnees.nodes.push(point);
            this.update();
            return donnees;
        };

        this.convertirEnMatrice = function () {
            var matrice = [];
            //Création matrice carée
            for (var i = 0; i < force.nodes().length; i++) {
                var colzero = [];
                for (var j = 0; j < force.nodes().length; j++) {
                    colzero.push(0);
                }
                matrice.push(colzero);
            }
            //Remplissage des liens entre les noeuds dans le matrice
            for (var ind = 0, links = force.links(); ind < links.length; ind++) {
                var lien = links[ind];
                var i = parseInt(lien.source.index),
                    j = parseInt(lien.target.index);

                matrice[i][j] = lien.capacite;
            }

            return matrice;
        };

        this.calculerFlotMax = function (source, target) {
            var matrice = this.convertirEnMatrice();
            var res = fordFulkerson(matrice, source, target); //definit dans scripts/flomax.js
            for (var ind = 0, links = force.links(); ind < links.length; ind++) {
                var lien = links[ind];
                var i = parseInt(lien.source.index),
                    j = parseInt(lien.target.index);
                var flot = eval(lien.capacite - res.grapheresiduel[i][j]);
                donnees.links[ind].flot = flot;
            }
            this.traitements = res.traitements;
            return res.flotmax;
        };

        this.getAllTraitements = function () {
            return this.traitements;
        };

        this.getIndNodeConcerne = function () {
            return indNodeConcerné;
        };

        this.getNodeConcerne = function () {
            return donnees.nodes[indNodeConcerné];
        };

        this.supprimerNodeConcerne = function (indice) {
            var pointSupprimé = donnees.nodes[indice];
            var liensVaovao = donnees.links.filter(function (link) {
                return !(link.source === pointSupprimé.nom || link.target === pointSupprimé.nom);
            });
            donnees.links = liensVaovao;
            donnees.nodes.splice(indice, 1);
        };

        this.creerLien = function (lien) {
            donnees.links.push(lien);
        };

        this.updateLien = function (capacite) {
            capacite = (!capacite) ? d.capacite : (capacite == "" ? 0 : parseInt(capacite));
            donnees.links[id].capacite = capacite;
        };

        this.deleteLien = function (source, target) {
            donnees.links = donnees.links.filter(function (link) {
                return !(link.source === source.nom && link.target === target.nom);
            });
        };
    })
    .service("sourisProvider", function () {
        this.getCoordonnees = function () {
            return coordonneesSouris;
        }
    });
app.controller("pointsAdd", function ($scope, grapheProvider, sourisProvider) {
    $scope.donneesGraphe = grapheProvider.getGraphe();
    $scope.source = null;
    $scope.target = null;
    $scope.linkup = false;
    $scope.pointLienApartir = null;
    $scope.pointLienVers = null;
    $scope.sourceFlot = null;
    $scope.targetFlot = null;
    $scope.sourceError = false;
    $scope.targetError = false;
    $scope.lien = {
        source: null,
        target: null,
        flot: 0,
        capacite: 0
    };

    $scope.point = {
        nom: null,
        fixed: true,
        x: 0,
        y: 0
    };

    $scope.link = null;

    $scope.traitements = [];

    grapheProvider.update();

    grapheProvider.convertirEnMatrice();

    $scope.showModalCreationPoint = function () {
        var coord = sourisProvider.getCoordonnees();
        $scope.point.x = coord.x - 300;
        $scope.point.y = coord.y;
        var x = coord.x;
        if (coord.x >= 1275) {
            x = 1275
        } else {
            x = coord.x
        }
        creerPointMenu
            .style("left", x + "px")
            .style("top", coord.y + "px")
            .style("display", "block");
        jQuery("input[type=text]", jQuery(".creerPointMenu")).focus();
        graphemenucontextuel.style("display", "none");
    };

    $scope.creerPoint = function (point) {
        const nom = donnees.nodes.filter(el => el.nom == point.nom);
        if (nom.length > 0) {
            alert(nom[0].nom + " existe déjà !");
            $scope.point.nom = null;
            jQuery("input[type=text]", jQuery(".creerPointMenu")).focus();
        } else {
            $scope.points = grapheProvider.createPoint(point);
            $scope.donneesGraphe = grapheProvider.getGraphe();
            $scope.point = {
                nom: null,
                fixed: true,
                x: 0,
                y: 0
            };

            creerPointMenu.style("display", "none");
            grapheProvider.convertirEnMatrice();
        }
    };

    $scope.supprPoint = function () {
        grapheProvider.supprimerNodeConcerne(grapheProvider.getIndNodeConcerne());
        grapheProvider.update();
        pointmenucontextuel.style("display", "none");
    };

    $scope.afficherCalculFlotMax = function () {
        jQuery("#modalCalculFlotMax").modal("show");
        jQuery(".graphemenucontextuel").css("display", "none");
        $scope.donneesGraphe = grapheProvider.getGraphe();
    };

    $scope.getSource = () => {
        const src = $scope.donneesGraphe.nodes.filter(el => el.nom === $scope.sourceFlot)[0]
        if ($scope.sourceFlot) {
            if (src) {
                $scope.source = src;
                sourceFlot = $scope.source.nom;
                $scope.sourceError = false;
            } else {
                jQuery(".sourceinput", jQuery(".calculeFlot")).css("border-color", "red");
                jQuery(".sourceinput", jQuery(".calculeFlot")).css("color", "red");
                $scope.sourceError = true;
                sourceFlot = null;
            }
        } else {
            $scope.source = null;
            $scope.sourceError = false;
            sourceFlot = null;
            jQuery(".sourceinput", jQuery(".calculeFlot")).css("border-color", "white");
            jQuery(".sourceinput", jQuery(".calculeFlot")).css("color", "white");
        }
        grapheProvider.update();
    };

    $scope.getTarget = () => {
        if ($scope.sourceFlot == $scope.targetFlot) {
            alert("C'est la même point !");
            $scope.targetFlot = null;
            jQuery(".targetinput", jQuery(".calculeFlot")).focus();
        } else {
            const targ = $scope.donneesGraphe.nodes.filter(el => el.nom === $scope.targetFlot)[0];
            if ($scope.targetFlot) {
                if (targ) {
                    $scope.target = targ;
                    targetFlot = $scope.target.nom;
                    $scope.targetError = false;
                } else {
                    jQuery(".targetinput", jQuery(".calculeFlot")).css("border-color", "red");
                    jQuery(".targetinput", jQuery(".calculeFlot")).css("color", "red");
                    $scope.targetError = true;
                    targetFlot = null;
                }
            } else {
                jQuery(".targetinput", jQuery(".calculeFlot")).css("border-color", "white");
                jQuery(".targetinput", jQuery(".calculeFlot")).css("color", "white");
                $scope.target = null;
                $scope.targetError = false;
                targetFlot = null;
            }
            grapheProvider.update();
        }
    };

    $scope.calculerFlotMax = function () {
        $scope.flotMax = grapheProvider.calculerFlotMax($scope.source.index, $scope.target.index);
        grapheProvider.update();
        setTimeout(() => {
            calculeFlot.style("display", "none");
        }, 500);
        $scope.traitements = grapheProvider.getAllTraitements();
    };

    $scope.lienApartir = function () {
        $scope.pointLienApartir = grapheProvider.getNodeConcerne();
        pointmenucontextuel.style("display", "none");
        $scope.lien.source = $scope.pointLienApartir.nom;
        sourcePoint = $scope.pointLienApartir.nom;
        $scope.sourceNom = $scope.pointLienApartir.nom;
        grapheProvider.update();
    };

    $scope.lienVers = function () {
        $scope.pointLienVers = grapheProvider.getNodeConcerne();
        const link = donnees.links.filter(el =>
            el.source === $scope.pointLienApartir.nom && el.target === $scope.pointLienVers.nom ||
            el.source === $scope.pointLienVers.nom && el.target === $scope.pointLienApartir.nom
        )
        if (link.length > 0) {
            alert('La sommet ' + $scope.pointLienApartir.nom + ' et ' + $scope.pointLienVers.nom + ' sont déjà liées');
            pointmenucontextuel.style("display", "none");
            targetPoint = null;
            sourcePoint = null;
            $scope.sourceNom = null;
            $scope.targetNom = null;
            grapheProvider.update();
        } else {
            $scope.lien.source = $scope.pointLienApartir.nom;
            $scope.targetNom = $scope.pointLienApartir.nom;
            var coord = sourisProvider.getCoordonnees();
            var x = coord.x;
            if (coord.x >= 1275) {
                x = 1275 - 10
            } else {
                x = coord.x + 10
            }
            $scope.lien.capacite = 0;
            $scope.linkup = false;
            if ($scope.lien.source === $scope.pointLienVers.nom) {
                alert('C\'est la meme point .');
                pointmenucontextuel.style("display", "none");
            } else {
                $scope.lien.target = $scope.pointLienVers.nom;
                targetPoint = $scope.pointLienVers.nom;
                grapheProvider.update();
                pointmenucontextuel.style("display", "none");
                creerCapacite
                    .style("left", x + "px")
                    .style("top", coord.y - 50 + "px")
                    .style("display", "block");
                jQuery("input[type=text]", jQuery(".creerCapacite")).focus();
            }
        }
    };

    $scope.modifierLien = function () {
        $scope.linkup = true;
        $scope.lien = linkData;
        var coord = sourisProvider.getCoordonnees();
        var x = coord.x;
        if (coord.x >= 1275) {
            x = 1275 - 10
        } else {
            x = coord.x + 10
        }
        linkmenucontextuel.style("display", "none");
        creerCapacite
            .style("left", x + "px")
            .style("top", coord.y - 50 + "px")
            .style("display", "block");
        jQuery("input[type=text]", jQuery(".creerCapacite")).focus();
    };

    $scope.updateLink = function () {
        grapheProvider.updateLien($scope.lien.capacite);
        grapheProvider.update()
        creerCapacite.style("display", "none");
        $scope.linkup = false;
    };

    $scope.linkBtn = function (lien) {
        $scope.linkup ? $scope.updateLink() : $scope.creerLien(lien)
    };

    $scope.creerLien = function (lien) {
        grapheProvider.creerLien(lien);
        grapheProvider.update();
        $scope.lien = {
            source: null,
            target: null,
            flot: 0,
            capacite: 0
        };
        sourcePoint = '';
        targetPoint = '';
        $scope.sourceNom = '';
        $scope.targetNom = '';
        grapheProvider.update()
        creerCapacite.style("display", "none");
    };

    $scope.supprimerLien = function () {
        var source = linkData.source;
        var target = linkData.target;
        grapheProvider.deleteLien(source, target);
        grapheProvider.update();
        linkmenucontextuel.style("display", "none");
    };

    $scope.refresh = function () {
        grapheProvider.restoreInitialState();
        clear();
        graphemenucontextuel.style("display", "none");
    };

    $scope.enregistrer = function () {
        grapheProvider.saveInitialState();
        graphemenucontextuel.style("display", "none");
    };

    $scope.deleteState = function () {
        grapheProvider.deleteInitialState();
        clear();
        graphemenucontextuel.style("display", "none");
    };

    var clear = function () {
        $scope.traitements = [];
        targetFlot = null;
        sourceFlot = null;
        $scope.targetFlot = null;
        $scope.sourceFlot = null;
        targetPoint = null;
        sourcePoint = null;
        $scope.target = null;
        $scope.source = null;
        $scope.flotMax = 0;
        grapheProvider.update();
    };

    $scope.showModalCalculFlott = function () {
        var coord = sourisProvider.getCoordonnees();
        var x = coord.x;
        var y = coord.y;
        if (x >= 1180) {
            x = x - 120;
        }
        if (y >= 340) {
            y = y - 100;
        }
        graphemenucontextuel.style("display", "none");
        calculeFlot
            .style("left", x + "px")
            .style("top", y + "px")
            .style("display", "block");
        jQuery(".sourceinput", jQuery(".calculeFlot")).focus();
    };

});
