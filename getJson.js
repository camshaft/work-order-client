var http = require("http");
var https = require("https");

// Code shamelessly borrowed from https://github.com/bryanmacfarlane/nodefun/blob/master/express/helloworld/service/rest.js
// Original Author: Bryan McFarlane
// Supplemental Author: Michael Pratt

function doRequest(options, data, onResult) {
    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            try {
                var obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            } catch (e) {
                onResult(res.statusCode, output);
            }
        });
    });

    if (data) {
        req.write(JSON.stringify(data));
    }

    req.end();
}

exports.getJSON = function(options, onResult)
{
    doRequest(options, null, onResult);
};

exports.postJSON = function(options, data, onResult)
{
    options.method = "POST";
    doRequest(options, data, onResult);
};