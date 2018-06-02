/**
 * FacebooknodesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


var out = {};
module.exports = {
  jsonData: function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://127.0.0.1:27017/";

    function removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    };
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

    var params = req.body;
    console.log(params);
    //parametar type
    var type = params['type'];
    //console.log(type);
    if(type==""){
        var param1 = ["LIKE", "COMMENT", "TAG", "LOVE", "HAHA", "WOW", "SAD", "ANRGY", "THANKFUL"]
    }else{
        var param1 = type;
    };

    //parametar numofusers
    var numofusersfrom = params['NumofUsersFrom'];
    var numofusersto = params['NumofUsersTo'];

    var param2from = parseInt(numofusersfrom);
    var param2to = parseInt(numofusersto);

    if(numofusersfrom == '') {
        param2from = 0;
    }

    if(numofusersto == '') {
        param2to = Number.MAX_SAFE_INTEGER;
    }

    //parametar date
    var dateFrom = params['DateFrom'];
    var dateTo = params['DateTo'];

    if(dateFrom == '') {
        dateFrom = '1980-01-01T00:00:00+0000';
    }else{
        dateFrom.concat('+0000');
    }

    if(dateTo == '') {
        dateTo = '2020-01-01T00:00:00+0000';
    }else{
        dateTo.concat('+0000');
    }

    console.log(dateFrom + " " + dateTo + " " + param2from + " " + param2to);

    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        var dbo = db.db("zavrsni");
        var query = [
            {
                $match:
                    {
                        numOfUsers: { $gte: param2from , $lt: param2to },
                        created_time: {$gte: dateFrom, $lt: dateTo }
                    }
            },
            { 
                $project: 
                    { 
                        "_id": 0,
                        "post_id": "$post_id"
                    }
            },
            {
                $out: "specified_posts"
            }
        ];
        dbo.collection("posts").aggregate(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log(result);
            var query1 = [
                {
                    $match: { type: { $in: param1 }}
                },
                {
                    $lookup: {
                        from: "specified_posts",
                        localField: "post_id",
                        foreignField: "post_id",
                        as: "edges"
                    }
                },
                {
                    $match: {
                        "edges": { $ne: [] }
                    }
                },
                {
                    $out: "edges_collection"
                }
            ];
            dbo.collection("edges").aggregate(query1).toArray(function(err, result0) {
                if (err) throw err;
                //var edgesDocs = result0;
                //console.log(result0);
                var query2 = [
                    {
                        $lookup:
                            {
                                from: "nodes",
                                localField: "source",
                                foreignField: "id",
                                as: "sources"
                            }
                    },
                    {
                        $unwind: "$sources"
                    },
                    {
                        $replaceRoot: { newRoot: "$sources" }
                    },
                    { 
                        $project: { _id: 0}
                    }
                ];
                dbo.collection("edges_collection").aggregate(query2).toArray(function(err, result1) {
                    if (err) throw err;
                    var nodesSource = result1;
                    //console.log(nodesSource);
                    var query3 = [
                        {
                            $lookup:
                                {
                                    from: "nodes",
                                    localField: "target",
                                    foreignField: "id",
                                    as: "targets"
                                }
                        },
                        {
                            $unwind: "$targets"
                        },
                        {
                            $replaceRoot: { newRoot: "$targets" }
                        },
                        { 
                            $project: { _id: 0 }
                        }
                    ];
                    dbo.collection("edges_collection").aggregate(query3).toArray(function(err, result2) {
                        if (err) throw err;
                        var nodesTarget = result2;
                        //console.log(nodesTarget);
                        var query4 = [
                            {
                                $project: {
                                    _id:0,
                                    "from": "$source",
                                    "to": "$target",
                                    "value":"$type",
                                    "title": ["$post_id","$comment_id"]
                                }
                            }
                        ];
                        dbo.collection("edges_collection").aggregate(query4).toArray(function(err, result3) {
                            if (err) throw err;
                            var edges = result3;
                            db.close();
                            var nodesUnion = nodesSource.concat(nodesTarget);
                            var nodes = removeDuplicates(nodesUnion, "id");
                            var values = {};
                            values = add_values(values);
                            var from = {};
                            edges.forEach(x=>{
                            x["to"] = x["to"];
                            x["from"] = x["from"];
                            x["value"] = values[ x["value"]];
                            x["label"] = x["value"];
                            x["title"] = undefined;
                            //from[x["from"]]=values[ x["value"]]
                            });
                            nodes.forEach(x => {
                            x["value"] = 20;
                            x["group"] = 8;
                            x["title"] = x["about"];
                            x["label"] = x["name"];
                            x["name"] = undefined;
                            x["about"] = undefined;
                            });
                            out["nodes"] = nodes;
                            out["edges"] = edges;
                            res.json(out);
                        });
                    });
                });
            });
        });
    });
  }
};
