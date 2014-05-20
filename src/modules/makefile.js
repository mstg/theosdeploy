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
exports.convertToMakefile = function(makejs) {
    var makefile_string = "";
    var tweak_name = "";
    var frameworks = "";
    var private_frameworks = "";
    var after_install = "";
    var archs = "";
    var target = "";
    var files = "";
    var package_version = "";
    var subprojects = "";
    var type = "";
    var install_path = "";
    var internal_stage = "";

    Object.keys(makejs).forEach(function(key) {
        if (key == "name") {
            tweak_name = makejs[key];
        } else if (key == "archs") {
            makejs[key].forEach(function(arch) {
                archs += arch + " ";
            });
        } else if (key == "target") {
            target = makejs[key];
        } else if (key == "frameworks") {
            makejs[key].forEach(function(framework) {
                frameworks += framework + " ";
            });
        } else if (key == "private_frameworks") {
            makejs[key].forEach(function(private_framework) {
                private_frameworks += private_framework + " ";
            });
        } else if (key == "files") {
            makejs[key].forEach(function(file) {
                files += file + " ";
            });
        } else if (key == "version") {
            package_version = makejs[key];
        } else if (key == "after_install") {
            after_install = makejs[key];
        } else if (key == "subprojects") {
            makejs[key].forEach(function(project) {
                subprojects = "SUBPROJECTS += " + project + "\n";
            });
        } else if (key == "type") {
            type = makejs[key].toUpperCase();
        } else if (key == "install_path") {
            install_path = makejs[key];
        } else if (key == "internal_stage") {
            internal_stage = makejs[key];
        }
    });

    makefile_string = "ARCHS = " + archs + "\n";
    makefile_string += "TARGET = " + target + "\n" + "\n";
    makefile_string += "include theos/makefiles/common.mk" + "\n" + "\n";
    makefile_string += type + "_NAME = " + tweak_name + "\n";
    makefile_string += tweak_name + "_FILES = " + files + "\n";

    if (frameworks)
        makefile_string += tweak_name + "_FRAMEWORKS = " + frameworks + "\n";

    if (private_frameworks)
        makefile_string += tweak_name + "_PRIVATE_FRAMEWORKS = " + private_frameworks + "\n";

    if (install_path)
        makefile_string += tweak_name + "_INSTALL_PATH = " + install_path + "\n";

    if (package_version) {
        makefile_string += "THEOS_PACKAGE_BASE_VERSION = " + package_version + "\n";
        makefile_string += "_THEOS_INTERNAL_PACKAGE_VERSION = " + package_version + "\n";
    }

    makefile_string += "include $(THEOS_MAKE_PATH)/" + type.toLowerCase() + ".mk \n";

    if (after_install)
        makefile_string += "after-install:: " + after_install + "\n";

    if (internal_stage)
        makefile_string += "internal_stage:: " + internal_stage + "\n";

    if (subprojects) {
        makefile_string += subprojects;
        makefile_string += "include $(THEOS_MAKE_PATH)/aggregate.mk";
    }

    return makefile_string;
}
