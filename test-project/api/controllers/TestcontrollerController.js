/**
 * TestcontrollerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    func: function(req, res) {
        console.log(req.body);
        var params = req.body;
        console.log(params['type']);
    }

};

