// JavaScript Document

class Node {
    name; //String
    startEarly; //int up left
    startLate; //int down left
    endEarly; //int up right
    endLate; //int down right
    time;
    slack;

    precesors = []; // Node[]
    sucesors = []; // Node[]
    precesorChars; // String[]

    constructor(name, precesorChars, time) {
        this.name = name;
        this.precesorChars = precesorChars;
        this.time = time;
        this.startEarly = 0;
        this.startLate = 0;
        this.endEarly = 0;
        this.endLate = 0;
        this.slack = 0;
    }
}

class Graph {

    start; //Node
    end; //Node
    nodesList; // Node []

    constructor() {
        this.start = new Node("Initial", [], 0);
        this.end = new Node("Finish", [], 0);
        this.nodesList = [];
    }

    addNodes(data) {
        for (var i = 0; i < data.length; i++) {
            this.nodesList.push(new Node(data[i]["name"], data[i]["precesors"].split(","), data[i]["time"]));
        }
    }

    setEdges() {
        for (var i = 0; i < this.nodesList.length; i++) {
            if (this.nodesList[i].precesorChars == "") {
                this.nodesList[i].precesors.push(this.start);
                this.start.sucesors.push(this.nodesList[i]);
            } else {
                for (var j = 0; j < this.nodesList[i].precesorChars.length; j++) {
                    for (var k = 0; k < this.nodesList.length; k++) {
                        if (this.nodesList[k].name == this.nodesList[i].precesorChars[j]) {
                            this.nodesList[i].precesors.push(this.nodesList[k]);
                            this.nodesList[k].sucesors.push(this.nodesList[i]);
                        }
                    }
                }
            }
        }

        for (var i = 0; i < this.nodesList.length; i++) {
            if (this.nodesList[i].sucesors.length == 0) {
                this.nodesList[i].sucesors.push(this.end);
                this.end.precesors.push(this.nodesList[i]);
            }
        }
    }

    calculateEarly() {
        for (var i = 0; i < this.nodesList.length; i++) {
            if (this.nodesList[i].precesors.length == 1) {
                this.nodesList[i].startEarly = this.nodesList[i].precesors[0].endEarly;
                this.nodesList[i].endEarly = this.nodesList[i].startEarly + this.nodesList[i].time;
            } else {
                var max = 0;
                var pos = null;
                for (var j = 0; j < this.nodesList[i].precesors.length; j++) {
                    if (this.nodesList[i].precesors[j].endEarly > max) {
                        max = this.nodesList[i].precesors[j].endEarly;
                        pos = j;
                    }
                }
                if (pos != null) {
                    this.nodesList[i].startEarly = this.nodesList[i].precesors[pos].endEarly;
                    this.nodesList[i].endEarly = this.nodesList[i].startEarly + this.nodesList[i].time;
                }
            }
        }

        if (this.end.precesors.length == 1) {
            this.end.endLate = this.end.startLate = this.end.endEarly = this.end.startEarly = this.end.precesors[0].endEarly;
        } else {
            var max = 0;
            var pos = null;
            for (var j = 0; j < this.end.precesors.length; j++) {
                if (this.end.precesors[j].endEarly > max) {
                    max = this.end.precesors[j].endEarly;
                    pos = j;
                }
            }
            if (pos != null) {
                this.end.endLate = this.end.startLate = this.end.endEarly = this.end.startEarly = this.end.precesors[pos].endEarly;
            }
        }
    }

    calculateLate() {
        for (var i = this.nodesList.length - 1; i >= 0; i--) {

            if (this.nodesList[i].sucesors.length == 1) {
                this.nodesList[i].endLate = this.nodesList[i].sucesors[0].startLate;
                this.nodesList[i].startLate = this.nodesList[i].endLate - this.nodesList[i].time;
                this.nodesList[i].slack = this.nodesList[i].endLate - this.nodesList[i].endEarly;
            } else {
                var min = Number.MAX_SAFE_INTEGER;
                var pos = null;
                for (var j = 0; j < this.nodesList[i].sucesors.length; j++) {
                    if (this.nodesList[i].sucesors[j].startLate < min) {
                        min = this.nodesList[i].sucesors[j].startLate;
                        pos = j;
                    }
                }
                if (pos != null) {
                    this.nodesList[i].endLate = this.nodesList[i].sucesors[pos].startLate;
                    this.nodesList[i].startLate = this.nodesList[i].endLate - this.nodesList[i].time;
                    this.nodesList[i].slack = this.nodesList[i].endLate - this.nodesList[i].endEarly;
                }
            }

        }
    }

    getDataMatrix() {
        var matrix = [];

        for (var i = 0; i < this.nodesList.length; i++) {
            var row = [];

            var precesorsTemp = [];
            for (var j = 0; j < this.nodesList[i].precesors.length; j++) {
                precesorsTemp.push(this.nodesList[i].precesors[j].name);
            }

            var sucesorsTemp = [];
            for (var j = 0; j < this.nodesList[i].sucesors.length; j++) {
                sucesorsTemp.push(this.nodesList[i].sucesors[j].name);
            }

            row["name"] = this.nodesList[i].name;
            row["precesors"] = precesorsTemp.join(",");
            row["sucesors"] = sucesorsTemp.join(",");
            row["time"] = this.nodesList[i].time;
            row["slack"] = this.nodesList[i].slack;
            row["startEarly"] = this.nodesList[i].startEarly;
            row["startLate"] = this.nodesList[i].startLate;
            row["endEarly"] = this.nodesList[i].endEarly;
            row["endLate"] = this.nodesList[i].endLate;

            matrix.push(row);
        }

        return matrix;
    }

    getCriticalRoute(node, route) {

        if (node == this.end) {
            return route;
        } else {
            for (var i = 0; i < node.sucesors.length; i++) {
                if (node.sucesors[i].slack == 0) {
                    route += node.sucesors[i].name + "-";

                    return this.getCriticalRoute(node.sucesors[i], route);
                }
            }

        }
    }

    reset() {
        this.start = new Node("Initial", [], 0);
        this.end = new Node("Finish", [], 0);
        this.nodesList = [];
    }
}

var graph = new Graph();
var dataTable = [];

function issetRow(name) {
    for (var i = 0; i < dataTable.length; i++) {
        if (dataTable[i]["name"] == name) {
            return true;
        }
    }
    return false;
}

function setDataRow() {

    if ($('#name').val() != "" && $('#time').val() != "") {
        if (!issetRow($('#name').val())) {
            var row = [];
            row["name"] = $('#name').val();
            row["precesors"] = $('#precesors').val();
            row["time"] = parseInt($('#time').val());
            dataTable.push(row);
            $('#name').val("");
            $('#precesors').val("");
            $('#time').val("");
            printIniTable();
        } else {
            alert("Activity " + $('#name').val() + " already exists!!");
        }
    } else {
        alert("Data Incomplete");
    }

}

function printIniTable() {
    $('#iniTable').empty();
    for (var i = 0; i < dataTable.length; i++) {
        $('#iniTable').append(
            "<tr><td>" + dataTable[i]["name"] + "</td>" +
            "<td>" + dataTable[i]["precesors"] + "</td>" +
            "<td>" + dataTable[i]["time"] + "</td></tr>"
        );
    }
}

function processIniTable() {
    graph.reset();
    graph.addNodes(dataTable);
    graph.setEdges();
    graph.calculateEarly();
    graph.calculateLate();
    var route = graph.getCriticalRoute(graph.start, "").split("-");
    var routeString = "";
    for (var i = 0; i < route.length - 2; i++) {
        routeString += '<span class="badge badge-pill badge-success">Activity '+route[i]+'</span> '+(i<route.length - 3?' -> ':'');
    }

    $('#criticRoute').html(routeString);
    
    printFinalTable()
}

function printFinalTable() {
    $('#finalTable').empty();
    var matrix = graph.getDataMatrix();
    for (var i = 0; i < matrix.length; i++) {
        var string =
            "<td>" + matrix[i]["name"] + "</td>" +
            "<td>" + matrix[i]["precesors"] + "</td>" +
            "<td>" + matrix[i]["sucesors"] + "</td>" +
            "<td>" + matrix[i]["time"] + "</td>" +
            "<td>" + matrix[i]["slack"] + "</td>" +
            "<td>" + matrix[i]["startEarly"] + "</td>" +
            "<td>" + matrix[i]["startLate"] + "</td>" +
            "<td>" + matrix[i]["endEarly"] + "</td>" +
            "<td>" + matrix[i]["endLate"] + "</td>";

        $('#finalTable').append(
            "<tr>" + string + "</tr>"
        );
    }
    printGraph();
}

function printGraph() {

    // create an array with nodes
    var matrix = graph.getDataMatrix();
    var nodes = [];
    for (var i = 0; i < matrix.length; i++) {
        nodes.push({
            id: matrix[i]["name"],
            level: 2,
            label:
                "Activities " + matrix[i]["name"] + "\n\n" +
                "Duration: " + matrix[i]["time"] + "\n" +
                "Slack: " + matrix[i]["slack"] + "\n" +
                "Start Early: " + matrix[i]["startEarly"] + "\n" +
                "End Late:: " + matrix[i]["startLate"] + "\n" +
                "End Early: " + matrix[i]["endEarly"] + "\n" +
                "End Late: " + matrix[i]["endLate"]
        });
    }
    nodes.push({
        id: graph.start.name,
        label: graph.start.name,
        color: { background: '#dc3545' },
        level: 1,
    });
    nodes.push({
        id: graph.end.name,
        label:
            graph.end.name + "\n\n" +
            "Start Early: " + graph.end.startEarly + "\n" +
            "Start Late: " + graph.end.startLate + "\n" +
            "End Early: " + graph.end.endEarly + "\n" +
            "End Late: " + graph.end.endLate,
        color: { background: '#dc3545' },
        level: 3,
    });
    nodes = new vis.DataSet(nodes);

    // create an array with edges
    var edges = [];
    for (var i = 0; i < graph.nodesList.length; i++) {
        for (var j = 0; j < graph.nodesList[i].sucesors.length; j++) {

            edges.push({
                from: graph.nodesList[i]["name"],
                to: graph.nodesList[i].sucesors[j].name
            });
        }
    }

    for (var i = 0; i < graph.start.sucesors.length; i++) {

        edges.push({
            from: graph.start.name,
            to: graph.start.sucesors[i].name
        });
    }
    edges = new vis.DataSet(edges);

    // create a network
    //var container = $('#mynetwork');
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        edges: {
            arrows: {
                to: { enabled: true }
            }
        },
        nodes: {
            shape: 'box',
            physics: false,
            color: {
                border: '#007bff',
                background: '#28a745',
            },
            font: {
                color: '#ffffff',
                bold: {
                    color: '#ffffff',
                },
            },
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            hideEdgesOnDrag: false,
            hideEdgesOnZoom: false,
            hideNodesOnDrag: false,
            hover: false,
            hoverConnectedEdges: false,//
            keyboard: {
                enabled: false,
                speed: { x: 10, y: 10, zoom: 0.02 },
                bindToWindow: true
            },
            multiselect: false,
            navigationButtons: false,
            selectable: false,//
            selectConnectedEdges: false,//
            tooltipDelay: 10,
            zoomSpeed: 1,
            zoomView: true
        }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);
}

