JuStTest
=======
This is YAJTL (Yet Another Javascript Testing Library.) It's designed to
test client-side libraries without a browser, while still supporting
async behavior when mocking that out is just too complicated.

It leans quite heavily on existing tools like JSDom and NodeUnit.

Installation
------------
Currently, it is only available via git at
http://github.com/joshmarshall/justtest . Once you have downloaded the
project, you can install to your current directory with:

    npm install path/to/justtest

...or, you can install globally with:

    npm install -g path/to/justtest

That's really only going to work for the test.js executable though.

Usage
-----
Creating the simplest possible test file should look like:

    module.exports = {

        name: "foobar",

        testSomething: function(test) {
            test.ok(true);
            test.done();
        }

    };

We expose the basic assert module syntax, so ok(), equal(),
notEqual(),  etc. are all available on the test argument.

Firing up the test just requires passing it to the test.js file in
./bin (or /usr/local/bin, etc. if you installed it locally):

    test.js my_simple_test.js

The basic rules are:

* Always call test.start() in setUp (if you provide one)
* Always call test.finish() in tearDown (if you provide one)
* ALWAYS call test.done() inside each test function.
* ALWAYS wrap callbacks with test.wrap(callback).

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

    module.exports = domTest("advanced", {

        html: "../base.htm",
        scripts: ["../jquery.js", "../myawesome.js",],

        // setting the default window properties to load
        exportGlobals: ["jQuery"],

        setUp: function(test) {
            // optional: do some set up stuff here...
            test.start();
        },

        testjQuery: function(test) {
            // test.globals holds anything in exportGlobals
            var title = test.globals.jQuery("h1").text()
            test.equals(title, "LOL I HAZ A CAT");
            test.done();

        testMyLibrary: function(test) {
            // window is always attached to test.globals
            // (document is available with test.globals.window.document)
            var result = test.globals.window.MyAwesomeObject.doIHazCat();
            test.ok(result);
            test.done();
        },

        testWithCallback: function(test) {
            // use test.wrap around any callbacks.
            var $ = test.globals.jQuery;
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
JustTest comes with a simple test runner and reporter. If you
installed it globally, it should be available as "test.js", otherwise
it might be in the local node\_modules/.bin folder.

Running it looks like:

    test.js path/to/your_tests.js

Or you can pass in directory, and it will hunt for Javascript files
that begin with "test":

    test.js path/to/tests/

If you don't properly wrap your callbacks with test.wrap (or even
if you do, depending on libraries, etc.) it can stall indefinitely.
So always check your tests before letting an automated build run if
you can.

domTestCase Options
-------------------
By default, a test case only expects one or more functions that start
with "test". However, since we also support DOM tests, it will usually be
important to import some sort of HTML base, as well as other Javascript
libraries to test.

The following is a list of options that domTestCase uses.

* setUp: function(test) - Provides a custom setUp to be called after
  domTestCase has finished setting up.
* tearDown: function(test) - Provides a custom tearDown function to be
  called after domTest as finished running tests.
* htmlPath: string - A path to the HTML content that will be loaded by JSDOM.
* html: string - raw HTML to be used as the DOM base.
* scriptPath: string - The "base" path for anything provided to scripts.
* scripts: array - A list of local Javascript files to load.
* exportGlobals: array - A list of top-level objects to make avalable on the
  domTestCase. These can be used within tests by "test.globals.NAME".

Additionally, justtest.defaultGlobals allows overriding of what's included
on every test by default.

Useful stuff on the test object:

* test.config.timeout: int - the number of milliseconds before a test fails
  from a timeout.
* test.error: function - pass to error handlers, for example RequreJS's
  require.onError.
* test.wrap: function - always wrap callbacks with this function
* test.start: function - called by setUp to start the tests
* test.done: function - called by tearDown to finish the tests
* test.ok/test.equal/etc. function - standard assertion functions
* test.globals: object - holds variables that should be accessible to
  setUp, tearDown, and the test functions.

Contact
-------
This is really, really alpha. So please add Issues, or send me your
success or failure stories. I'd also love patches / ideas / etc. :)
