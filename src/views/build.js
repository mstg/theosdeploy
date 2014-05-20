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
    makefile = require(config["config"]["path"] + '/modules/' + 'makefile.js'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    ssh = new ssh_module();

module.exports = function(app) {
    app.get('/build/:project/:device', function (req, res) {
        var device = require(config["config"]["devices_path"] + "/" + req.param('device') + "/device.js"),
            project_path = path.normalize(config["config"]["projects_path"] + "/" + req.param('project')),
            project_makefile = require(project_path + "/makefile.js"),
            on_device_project_path = device.device["device_project_path"] + "/" + req.param('project');

        ssh.on('ready', function() {
            io.sockets.on('connection', function (socket) {
                socket.emit('ssh', { response: "Connected to " + device.device["device_name"] });

                if (fs.existsSync(project_path + "/Makefile")) {
                    fs.unlinkSync(project_path + "/Makefile");
                    socket.emit('ssh', { response: "Deleted old Makefile for project" });
                }

                if (fs.existsSync(project_path + "/theos")) {
                    fs.unlinkSync(project_path + "/theos");
                    socket.emit('ssh', { response: "Deleted old theos symlink for project" });
                }

                var makefile_string = makefile.convertToMakefile(project_makefile.makefile);
                socket.emit('ssh', { response: "Makefile.js converted to Makefile" });

                if (project_makefile.makefile.subprojects) {
                    var sub_makefile = {

                    };

                    project_makefile.makefile.subprojects.forEach(function(project) {
                        if (fs.existsSync(project_path + "/" + project + "/Makefile")) {
                            fs.unlinkSync(project_path + "/" + project + "/Makefile");
                            socket.emit('ssh', { response: "Deleted old Makefile for subproject " + project });
                        }

                        if (fs.existsSync(project_path + "/" + project + "/theos")) {
                            fs.unlinkSync(project_path + "/" + project + "/theos");
                            socket.emit('ssh', { response: "Deleted old theos symlink for subproject " + project });
                        }

                        var tmpProject = require(project_path + "/" + project + "/makefile.js");
                        var tmpMakefile = makefile.convertToMakefile(tmpProject.makefile)
                        sub_makefile[project] = tmpMakefile;
                    });

                    for (make in sub_makefile) {
                        fs.writeFile(project_path + "/" + make + "/Makefile", sub_makefile[make]);
                        socket.emit('ssh', { response: "Created makefile for subproject " + make });
                    }
                }

                fs.writeFile(project_path + "/Makefile", makefile_string, function() {
                    socket.emit('ssh', { response: "Created Makefile from converted Makefile.js" });

                    ssh.exec("rm -rf " + on_device_project_path, function(err, stream) {
                        socket.emit('ssh', { response: "Deleted folder " + on_device_project_path + ", if exists" });

                        var rsync_query = "rsync -avz -e ssh";
                        rsync_query += " .";
                        rsync_query += " " + "root@" + device.device["device_ip"] + ":" + on_device_project_path;

                        exec("cd " + project_path + " & " + rsync_query, function(err, stdout, stderr) {
                            socket.emit('ssh', { response: "Project moved to device" });

                            if (sub_makefile) {
                                for (sub in sub_makefile) {
                                    ssh.exec("chmod 755 " + on_device_project_path + " -R; ln -s /var/theos " + on_device_project_path + "/" + sub + "/theos", function(err, stream) {

                                    });
                                }
                            }

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
