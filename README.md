theosdeploy
===========
Deploy source code to your device, compile, download the package, delete from device

Features
========
* Remote deploy
* Multiple devices
* Compile on the go

What you need on your iOS device
=============
* Theos
* LVM+Clang
* Perl
* LD64
* Darwin CC Tools
* iOS sdk

What you need on your computer
=============
* Cygwin (if on windows)
* rsync

Usage
=====
```
$ npm install
```

Add ssh key for passwordless login

Add your project to projects folder

Create a folder with device's name in the devices folder

Create device.js file in your device folder
```javascript
exports.device = {
    device_name: "Mustafa-USB",
    device_ip: "10.0.0.13",
    device_port: 22,
    device_password: "alpine",
    device_project_path: "/User/Documents/projects",
    device_theos_path: "/var/theos"
}
```
All required

If you have subprojects, change this in the Makefile for the subproject:
```
include theos/makefiles/common.mk
```

to

```
include ../theos/makefiles/common.mk
```

To start the server:
```
$ cd src
$ node site.js
```
