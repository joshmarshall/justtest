// Libraries
/*jsl:declare __dirname*/
var jsdom = require("jsdom").jsdom;
var fs = require("fs");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var path = require("path");
var console = require("console");
var testCase = require("nodeunit").testCase;

// the main function used for tests
exports.domTestCase = function(name, overrideOptions) {

    // the window "globals" (like $ for jQuery) to make available
    var exportGlobals = (overrideOptions.exportGlobals) ?
        overrideOptions.exportGlobals : [];

    var htmlPath = overrideOptions.htmlPath;
    var html = (overrideOptions.html) ? overrideOptions.html :
        "<html><head></head><body></body></html>";
    if (htmlPath) {
        html = fs.readFileSync(htmlPath).toString();
    }
    var scripts = (overrideOptions.scripts) ?
        overrideOptions.scripts : [];

    // default setUp function, wraps the override setUp function
    var setUp = function(callback) {
        // seems like there should be a more efficient way, but
        // we don't have access to the path outside of test.
        // set up default (empty) HTML or override
        var basePath = process.cwd();
        // a relative or absolute path to the javascript directory
        var scriptPath = (overrideOptions.scriptPath) ?
            path.resolve(basePath, overrideOptions.scriptPath) :
                basePath;
        if (!scriptPath.substr(-1) === "/") {
            scriptPath += "/";
        }

        var finalSetup = callback;
        if (overrideOptions.setUp) {
            finalSetup = function() {
                console.log("Final setup!");
                overrideOptions.setUp(callback);
            };
        }
        var self = this;
        self.globals = {}; // overwriting globals
        jsdom.env({
            html: html,
            scripts: scripts.map(function(script) {
              return path.join(scriptPath, script); 
            }),
            done: function(errors, window) {
                if (errors) {
                  console.log(errors);
                }
                self.globals.window = window;
                self.globals.window.XMLHttpRequest = XMLHttpRequest;
                self.globals.window.console = console; // HACK!!!
                self.globals.document = window.document;
                for (var i=0; i<exportGlobals.length; i++) {
                    var exportGlobal = exportGlobals[i];
                    var globalType = typeof window[exportGlobal];
                    if (globalType != "undefined") {
                        self.globals[exportGlobal] = window[exportGlobal];
                    } else {
                        console.log("Unknown global "+exportGlobal);
                    }
                }
                finalSetup();
            }
        });
    };

    // the default test options
    var baseTestOptions = {
        name: (name) ? name : overrideOptions.name,
        setUp: setUp
    };

    // look for test methods in the options passed in
    for (var obj in overrideOptions) {
        if (!overrideOptions.hasOwnProperty(obj)) {
            // not sure this is as necessary in node?
            continue;
        }
        if (!obj.match(/^test/i)) {
            // does not start with "test"
            continue;
        }
        // attach test methods / attributes to domTest object
        baseTestOptions[obj] = overrideOptions[obj];
    }

    // default teardown
    if (overrideOptions.tearDown) {
      baseTestOptions.tearDown = overrideOptions.tearDown;
    }

    // return new wrapped test case
    return testCase(baseTestOptions);
};

