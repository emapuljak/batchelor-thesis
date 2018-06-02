var https = require('https');
var vis = require ('vis');
var querystring = require('querystring');

function add_values(values){
    values["LIKE"] = 1;
    values["WOW"] = 2;
    values["HAHA"] = 3;
    values["ANRGY"] = 4;
    values["SAD"] = 5
    values["THANKFUL"] = 6;
    values["LOVE"] = 7;
    values["TAG"] = 8;
    values["COMMENT"] = 10;
    return values;
};
window.onload = function() {
    document.getElementById('submit').addEventListener('click', filter);
    //filter();
}

function filter() {
    var elements = document.getElementById("myform").elements;

    var obj ={};
    for(var i = 0 ; i < elements.length ; i++){
        var item = elements.item(i);
        //console.log(item);
        if(item.type == "checkbox" && item.checked == true){
            if(typeof obj[item.name] === 'undefined'){
                obj[item.name] = [];
                obj[item.name].push(item.value);
            }
            else{
                obj[item.name].push(item.value);
            }
        }
        else if(item.type == "text"){
            obj[item.name] = item.value;
        }
    }

    if(obj['type'] == undefined) {
        obj['type'] = '';
    }

    postData = obj;
    postBody = JSON.stringify(postData);
    console.log(postData);
    console.log(postBody);

    var options = {
        hostname: '',
        path: 'http://localhost:1337/filter',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
         }
    };
    var adressRequest = https.request(options, function(res){
        if(res.statusCode == '200'){
            var buffers = [];
            // res.on('data', (data) => {
            //     console.log(data);
            //     // let responsePayloadObject = JSON.parse(data);
            //     let dataForApi = {};
            //     //test(responsepayloadObject); --> pozovi vizualizaciju
            //     for(var key in responsePayloadObject){
            //         if(key == 'nodes'){
            //             console.log("usla sam");
            //             console.log(responsePayloadObject[key]);
            //         }
            //         //     dataForApi.test = responsePayloadObject[key];
            //         //     console.log(key);
            //         // }
            //     };
            // })
            res
                .on('data', (chunk) => {
                    buffers.push(chunk);
                })
                .on('end', () => {
                    test(JSON.parse(Buffer.concat(buffers).toString()));
                })
        }
    });

    adressRequest.write(postBody, function(err) { adressRequest.end() });
};

var network;

function test(result) {
    document.getElementById('sub').addEventListener('click', fitnetwork);
    document.getElementById('sub').enabled = true;
    
    var allNodes;
    var nodeIDs = [];
    var nodesData = result["nodes"];
    var edgesData = result["edges"];
    
    var nodes = new vis.DataSet(nodesData);
    var edges = new vis.DataSet(edgesData);
    function redrawAll() {
        var nodes = new vis.DataSet(nodesData);
        var edges = new vis.DataSet(edgesData);
        var container = document.getElementById('mynetwork');
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            nodes: {
                shape: 'dot'
            },
            edges: {
                arrows: {
                    to: {
                        type: 'arrow',
                        enabled: true
                    }
                },
                color: {
                    color: '#606060',
                    inherit: false
                },
                scaling: {
                    min: 1,
                    max: 100
                },
                smooth: {
                    type: "dynamic"
                },
                //physics: true
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                //smaxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: {iterations: 100}
            },
            //smoothCurves: {dynamic: false, type: "continuous"},
            interaction: {
                hover: true,
                hideEdgesOnDrag: true,
                hoverConnectedEdges: true
            },
            //manipulation: { enabled: true},
            /*layout: {
                hierarchical: {
                    direction: "UD"
                }
            }*/
        };

        network = new vis.Network(container, data, options);
        //network.on("click",onClick);
        //allNodes = nodes.get({returnType:"Object"});
        nodesData.forEach(x => {
            nodeIDs.push(x.id);
        });
        //console.log(this.nodeIDs);
    }

    function fitnetwork(){
            network.fit({ nodes: nodeIDs, scale: 0.01, animation: false });
    }
    /*
    function onClick(selectedItems) {
        var nodeId;
        var degrees = 2;
        // we get all data from the dataset once to avoid updating multiple times.
        if (selectedItems.nodes.length == 0) {
            // restore on unselect
            for (nodeId in allNodes) {
                if (allNodes.hasOwnProperty(nodeId)) {
                    allNodes[nodeId].color = undefined;
                    if (allNodes[nodeId].oldLabel !== undefined) {
                        allNodes[nodeId].label = allNodes[nodeId].oldLabel;
                        allNodes[nodeId].oldLabel = undefined;
                    }
                    allNodes[nodeId]['levelOfSeperation'] = undefined;
                    allNodes[nodeId]['inConnectionList'] = undefined;
                }
            }
        }
        else {
            var allEdges = edges.get();

            // we clear the level of separation in all nodes.
            clearLevelOfSeperation(allNodes);

            // we will now start to collect all the connected nodes we want to highlight.
            var connectedNodes = selectedItems.nodes;

            // we can store them into levels of separation and we could then later use this to define a color per level
            // any data can be added to a node, this is just stored in the nodeObject.
            storeLevelOfSeperation(connectedNodes,0, allNodes);
            for (var i = 1; i < degrees + 1; i++) {
                appendConnectedNodes(connectedNodes, allEdges);
                storeLevelOfSeperation(connectedNodes, i, allNodes);
            }
            for (nodeId in allNodes) {
                if (allNodes.hasOwnProperty(nodeId)) {
                    if (allNodes[nodeId]['inConnectionList'] == true) {
                        if (allNodes[nodeId]['levelOfSeperation'] !== undefined) {
                            if (allNodes[nodeId]['levelOfSeperation'] >= 2) {
                                allNodes[nodeId].color = 'rgba(150,150,150,0.75)';
                            }
                            else {
                                allNodes[nodeId].color = undefined;
                            }
                        }
                        else {
                            allNodes[nodeId].color = undefined;
                        }
                        if (allNodes[nodeId].oldLabel !== undefined) {
                            allNodes[nodeId].label = allNodes[nodeId].oldLabel;
                            allNodes[nodeId].oldLabel = undefined;
                        }
                    }
                    else {
                        allNodes[nodeId].color = 'rgba(200,200,200,0.5)';
                        if (allNodes[nodeId].oldLabel === undefined) {
                            allNodes[nodeId].oldLabel = allNodes[nodeId].label;
                            allNodes[nodeId].label = "";
                        }
                    }
                }
            }
        }
        var updateArray = [];
        for (nodeId in allNodes) {
            if (allNodes.hasOwnProperty(nodeId)) {
                updateArray.push(allNodes[nodeId]);
            }
        }
        nodes.update(updateArray);
    }


    /**
     * update the allNodes object with the level of separation.
     * Arrays are passed by reference, we do not need to return them because we are working in the same object.
     *
    function storeLevelOfSeperation(connectedNodes, level, allNodes) {
        for (var i = 0; i < connectedNodes.length; i++) {
            var nodeId = connectedNodes[i];
            if (allNodes[nodeId]['levelOfSeperation'] === undefined) {
                allNodes[nodeId]['levelOfSeperation'] = level;
            }
            allNodes[nodeId]['inConnectionList'] = true;
        }
    }

    function clearLevelOfSeperation(allNodes) {
        for (var nodeId in allNodes) {
            if (allNodes.hasOwnProperty(nodeId)) {
                allNodes[nodeId]['levelOfSeperation'] = undefined;
                allNodes[nodeId]['inConnectionList'] = undefined;
            }
        }
    }

    /**
     * Add the connected nodes to the list of nodes we already have
     *
     *
     *
    function appendConnectedNodes(sourceNodes, allEdges) {
        var tempSourceNodes = [];
        // first we make a copy of the nodes so we do not extend the array we loop over.
        for (var i = 0; i < sourceNodes.length; i++) {
            tempSourceNodes.push(sourceNodes[i])
        }

        for (var i = 0; i < tempSourceNodes.length; i++) {
            var nodeId = tempSourceNodes[i];
            if (sourceNodes.indexOf(nodeId) == -1) {
                sourceNodes.push(nodeId);
            }
            addUnique(getConnectedNodes(nodeId, allEdges),sourceNodes);
        }
        tempSourceNodes = null;
    }

    /**
     * Join two arrays without duplicates
     * @param fromArray
     * @param toArray
     *
    function addUnique(fromArray, toArray) {
        for (var i = 0; i < fromArray.length; i++) {
            if (toArray.indexOf(fromArray[i]) == -1) {
                toArray.push(fromArray[i]);
            }
        }
    }

    /**
     * Get a list of nodes that are connected to the supplied nodeId with edges.
     * @param nodeId
     * @returns {Array}
     *
    function getConnectedNodes(nodeId, allEdges) {
        var edgesArray = allEdges;
        var connectedNodes = [];

        for (var i = 0; i < edgesArray.length; i++) {
            var edge = edgesArray[i];
            if (edge.to == nodeId) {
                connectedNodes.push(edge.from);
            }
            else if (edge.from == nodeId) {
                connectedNodes.push(edge.to)
            }
        }
        console.log(connectedNodes.length);
        return connectedNodes;
    }*/

    redrawAll();
}


