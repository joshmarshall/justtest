JuStTest
========
This is YAJTL (Yet Another Javascript Testing Library.) It's designed to
test client-side libraries without a browser, while still supporting
async behavior when mocking that out is just too complicated.

It's pretty much just a wrapper around existing tools like JSDom and NodeUnit.

Installation
------------
Currently, it is only available via git at
http://github.com/joshmarshall/justtest . Once you have downloaded the
project, you can install to your current directory with:

    npm install path/to/justtest

Usage
-----
By default, it passes everything through to NodeUnit, so a basic test
looks like:

    module.exports = {

        testSomething: function(test) {
            test.ok(true);
            test.done();
        }

    };

...and you can call it with the nodeunit executable like:

    nodeunit tests/test_basic.js

The binary may be in different places depending on how you installed
it, so the path could be `./node_modules/.bin/nodeunit` , or it might
be globally available as  `nodeunit`, or even something hideous like
`./node_modules/justtest/node_modules/.bin/nodeunit`.

Testing Browser-ish Javascript
------------------------------
Once you move beyond simple unit tests, any real usage is going to require
external dependencies. A sample project structure might look like:

    ./
    ./base.htm
    ./js
    ./js/jquery.min.js
    ./js/myawesome.js
    ./tests
    ./tests/test_advanced.js

...and test\_advanced.js might look something like:

    var domTest = require("justtest").domTestCase;

    module.exports = domTest({

        html: "../base.htm",
        scripts: ["../jquery.js", "../myawesome.js",],

        // setting the default window properties to load
        exportGlobals: ["jQuery"],

        setUp: function(callback) {
            // optional: do some set up stuff here...
            this.globals.myAwesomeVar = true;
            callback();
        },

        testjQuery: function(test) {
            // test.globals holds anything in exportGlobals
            test.equals(this.globals.myAwesomeVar, true);
            var title = this.globals.jQuery("h1").text()
            test.equals(title, "LOL I HAZ A CAT");
            test.done();
        },

        testMyLibrary: function(test) {
            // window is always attached to test.globals
            // (document is available with test.globals.window.document)
            var result = this.globals.window.MyAwesomeObject.doIHazCat();
            test.ok(result);
            test.done();
        },

        testWithCallback: function(test) {
            // use test.wrap around any callbacks.
            var $ = this.globals.jQuery;
            $.get("http://www.google.com", test.wrap(function(data) {
                // ...test response...
                test.done();
            });
        },

        tearDown: function(callback) {
            // optional: undo what you did in setUp
            callback();
        }

    });

The options that can be passed into domTestCase are listed below.

Running Tests
-------------
I've gotten rid of the custom test runner that used to be in this project
and coupled it more with NodeUnit. Just refer to the NodeUnit project for
the options that you can pass to it.

domTestCase Options
-------------------
The following is a list of options that domTestCase uses.

* setUp: function(callback) - Provides a custom setUp to be called after
  domTestCase has finished setting up.
* tearDown: function(callback) - Provides a custom tearDown function to be
  called after domTest as finished running tests.
* htmlPath: string - A path to the HTML content that will be loaded by JSDOM.
* html: string - raw HTML to be used as the DOM base.
* scriptPath: string - The "base" path for anything provided to scripts.
* scripts: array - A list of local Javascript files to load.
* exportGlobals: array - A list of top-level objects to make avalable on the
  domTestCase. These can be used within tests by "test.globals.NAME".

Additionally, justtest.defaultGlobals allows overriding of what's included
on every test by default.

Contact
-------
This is really, really alpha. So please add Issues, or send me your
success or failure stories. I'd also love patches / ideas / etc. :)
