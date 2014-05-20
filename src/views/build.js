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
var io = require('socket.io').listen(5050),
    ssh_module = require('ssh2'),
    config = require('./../config.js'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    ssh = new ssh_module();

module.exports = function(app) {
    app.get('/build/:project/:device', function (req, res) {
        var device = require(config["config"]["devices_path"] + "/" + req.param('device') + "/device.js"),
            project_path = path.normalize(config["config"]["projects_path"] + "/" + req.param('project')),
            on_device_project_path = device.device["device_project_path"] + "/" + req.param('project');

        ssh.on('ready', function() {
            io.sockets.on('connection', function (socket) {
                socket.emit('ssh', { response: "Connected to " + device.device["device_name"] });

                if (fs.existsSync(project_path + "/theos")) {
                    fs.unlinkSync(project_path + "/theos");
                    socket.emit('ssh', { response: "Deleted old theos symlink for project" });
                }
                socket.emit('ssh', { response: "Created Makefile from converted Makefile.js" });

                ssh.exec("rm -rf " + on_device_project_path, function(err, stream) {
                    socket.emit('ssh', { response: "Deleted folder " + on_device_project_path + ", if exists" });

                    var rsync_query = "rsync -avz -e ssh";
                    rsync_query += " .";
                    rsync_query += " " + "root@" + device.device["device_ip"] + ":" + on_device_project_path;

                    exec("cd " + project_path + " & " + rsync_query, function(err, stdout, stderr) {
                        socket.emit('ssh', { response: "Project moved to device" });

                        ssh.exec("ln -s /var/theos " + on_device_project_path + "/theos", function(err, stream) {

                            ssh.exec("cd " + on_device_project_path + " && make package", function(err, stream) {
                                stream.on('data', function(data, extended) {
                                    var dat = (extended === '' ? '' : '') + data;
                                    socket.emit('ssh', { response: dat.replace(/\r?\n|\r/, "") });

                                    if (dat.indexOf("dpkg-deb: building package") > -1) {
                                        var pack = dat.substring(dat.indexOf("in `"), dat.lastIndexOf("'.")).replace("in `.", "");

                                        rsync_query = "rsync -avz -e ssh";
                                        rsync_query += " " + "root@" + device.device["device_ip"] + ":" + on_device_project_path + pack;
                                        rsync_query += " .";

                                        exec("cd " + project_path + " & " + rsync_query, function(err, stdout, stderr) {
                                            socket.emit('ssh', { response: "Package moved to project root. " + project_path });

                                            ssh.exec("rm -rf " + on_device_project_path, function(err, stream) {
                                                socket.emit('ssh', { response: "Deleted project from device" });
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });

        ssh.connect({
            host: device.device["device_ip"],
            port: device.device["device_port"],
            username: 'root',
            password: device.device["device_password"]
        });

        res.render('build', {
            page_name : 'Building',
            project_name : req.param('project')
        });
    });
}
