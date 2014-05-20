/*The MIT License (MIT)

Copyright (c) 2014 Mustafa Gezen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/
var fs = require('fs'),
    devices = require('./../modules/devices.js'),
    config = require('./../config.js'),
    project = null;

module.exports = function(app) {
    app.get('/project/:project_name', function (req, res) {
        var path = config["config"]["projects_path"] + req.param('project_name') + '/makefile.js';
        project = require(path);

        var tempName = require.resolve(path);
        delete require.cache[tempName];

        project = require(path);

        var tempPath = "/build/" + req.param('project_name');
        devices.device(function(){
            res.render('project', {
                page_name : 'Project',
                project : project.makefile,
                path : tempPath,
                devices : devices.devices
            });
        });
    });
}
