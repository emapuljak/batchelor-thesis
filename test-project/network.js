var https = require('https');
var vis = require ('vis');
var querystring = require('querystring');

/*window.onload = function() {
    console.log("bbbbbbbbb");
    adressRequest.write(postData);
    adressRequest.end();
};*/
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

    /*var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://127.0.0.1:27017/";
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("zavrsni");
        var query = {
            $project: {
                _id:0,
                "from": "$source",
                "to": "$target",
                "value":"$type",
                "title": ["$post_id","$comment_id"]
            }
        }
        dbo.collection("demo_edges").aggregate(query).toArray(function(err, result) {
            if (err) throw err;
            var edgesData = result;
            var values = {};
            values = add_values(values);
            edgesData.forEach(x=>{
            x["to"] = x["to"];
            x["from"] = x["from"];
            x["value"] = values[ x["value"]];
            x["label"] = x["value"];
            x["title"] = undefined;
            });
            var query1 = {
                $project: {
                    _id:0,
                    "id": "$id",
                    "name": "$name",
                    "about": "$about"
                }
            }
            dbo.collection("demo_nodes").aggregate(query1).toArray(function(err, result1){
                if(err) throw err;
                var nodesData = result1;
                nodesData.forEach(x => {
                    x["value"] = 20;    // node size
                    x["group"] = 8;
                    x["title"] = x["about"];
                    x["label"] = x["name"];
                    x["name"] = undefined;
                    x["about"] = undefined;
                });
                out = {};
                out["nodes"] = nodesData;
                out["edges"] = edgesData;
                test(out);
            })
        });
    });*/
}

function filter() {
    var elements = document.getElementById("myform").elements;
    //console.log(elements);

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
    postData = obj;
    postBody = querystring.stringify(postData);
    //= JSON.stringify({test: "test"});
    var options = {
        hostname: '',
        path: 'http://localhost:1337/filter',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postBody.length
         }
    };
    var adressRequest = https.request(options, function(res){
        if(res.statusCode == '200'){
            //console.log("gotovo");
            res.on('data', (data) => {
                let responsePayloadObject = JSON.parse(data);
                let dataForApi = {};
                //test(responsepayloadObject); --> pozovi vizualizaciju
                for(var key in responsePayloadObject){
                    if(key == 'nodes'){
                        console.log("usla sam");
                    }
                    //     dataForApi.test = responsePayloadObject[key];
                    //     console.log(key);
                    // }
                };
            })
        }
    });
    //postData = JSON.stringify(obj);
    //console.log(postData);
    adressRequest.write(postBody, function(err) { adressRequest.end() });
};

function test(result) {
    var network;
    var allNodes;

    var nodesData = result["nodes"];
    var edgesData = result["edges"];
    //console.log(typeof(vis));
    var nodes = new vis.DataSet(nodesData);
    var edges = new vis.DataSet(edgesData);

    function redrawAll() {
            //nodes.clear();
            //edges.clear();

            //network = null;

        // create a network

        //nodes.add(nodesData);
        //edges.add(edgesData);
        var container = document.getElementById('mynetwork');
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            /*groups = {
            gold: {
                color: {
                background: '#FFC300', //'#E5C100',
                border: '#FFC300'
                }
            },
            silver: {
                color: {
                background: '#002265', //'silver',
                border: '#002265'
                }
            },
            bronze: {
                color: {
                background: '#DB4A67', //'#d17e67',
                border: '#DB4A67'
                }
            },*/
            nodes: {
                /*borderWidth: 1,
                font: {
                    face: 'arial'
                },
                shape: 'dot',
                radiusMin: 1000,
                radiusMax: 3000,
                fontSize: 12,
                color: {
                    border: 'red',
                    background: 'red',
                    hover: {
                        border: '#2B7CE9',
                        background: '#D2E5FF'
                    }
                }*/
                shape: 'dot',
                font: {
                size: 12,
                face: 'Tahoma'
                }
            },
            edges: {
                width: 1.0,
                inheritColor: false,
                scaling: {
                min: 1,
                max: 100
            }, 
            },
            /*tooltip: {
                delay: 100,
                size: 12,
                color: {
                    background: "#fff"
                }
            },*/
            smoothCurves: {dynamic: false, type: "continuous"},
            interaction: {
                tooltipDelay: 200,
                hideEdgesOnDrag: true
            },
            /*physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                maxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: {iterations: 150}
            },*/
            physics:{
                    barnesHut: {gravitationalConstant: -80000, springLength: 100, springConstant: 0.001, centralGravity: 0},
                    stabilization: false
                }

        };

            network = new a.vis.Network(container, data, options);
            allNodes = nodes.get({returnType:"Object"});
            network.on("click",onClick);
    }


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
                        allNodes[nodeId].color = 'rgba(150,150,150,0.75)';
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
     */
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
     */
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
     */
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
     */
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
        return connectedNodes;
    }

    redrawAll();
}

