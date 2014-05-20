theosdeploy
===========
Deploy source code to your device, compile, download the package, delete from device

Features
========
* Remote deploy
* Multiple devices
* Compile on the go
* Logs

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
Add ssh key for passwordless login
Add your project to projects folder

Create a makefile.js with following template in the project root
```javascript
exports.makefile = {
    type: "tweak" (tweak, bundle, library or the correct type also from the *_NAME) (REQUIRED),
    name: "test" (REQUIRED),
    frameworks: new Array('UIKit') (OPTIONAL),
    private_frameworks: new Array('preferences') (OPTIONAL),
    after_install: "killall -9 SpringBoard" (OPTIONAL),
    archs: new Array('armv7', 'arm64') (REQUIRED),
    target: "iphone:latest:7.0" (REQUIRED),
    files: new Array('Tweak.xm') (REQUIRED),
    package_version: "1.0" (OPTIONAL),
    subprojects: new Array('Prefs') (OPTIONAL),
    install_path: "/Library/PreferenceBundles" (OPTIONAL),
    internal_stage: "" (OPTIONAL)
}
```

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
