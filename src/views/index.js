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
var fs = require('fs')
    devices = require('./../modules/devices.js'),
    config = require('./../config.js'),
    projects = new Array(),
    projects_num = 0;

module.exports = function(app) {
    app.get('/', function (req, res) {
        fs.readdir(config["config"]["projects_path"], function (err, files) {
            if (err)
                throw err;

            var newFile = new Array();
            files.forEach(function(file) {
                if (fs.lstatSync(config["config"]["projects_path"] + "/" + file).isDirectory()) {
                    newFile.push(file);
                }
            });
            projects = newFile;
            projects_num = newFile.length;

            devices.device(function() {
                res.render('index', {
                    page_name : 'Home',
                    projects_num : projects_num,
                    projects : projects,
                    devices : devices.devices,
                    devices_num : devices.devices_num
                });
            })
        });
    });
}
