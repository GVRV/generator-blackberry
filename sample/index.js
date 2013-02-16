'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('../../../../');
var feature_utils = require('../utils/feature_utils');
var grunt = require('grunt');

module.exports = Generator;

function Generator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);

    this.sourceRoot(path.join(__dirname, 'templates'));
    this.appname = path.basename(process.cwd());
};

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.fetchSample = function fetchSample() {

    var cb = this.async();
    var self = this;

    return this.remote('GVRV', 'generator-blackberry-samples', function (err, remote) {
        if (err) { return cb(err); }

        try {
            self.featuresFile = self.readFileAsString(path.join(remote.cachePath, self.name + '/config.xml'));
            self.indexFile = self.readFileAsString(path.join(remote.cachePath, self.name + '/index.html'));
            self.jsFile = self.readFileAsString(path.join(remote.cachePath, self.name + '/app.js'));

            // Add the config
            var file = 'app/config.xml'; 
            var body = grunt.file.read(file);

            body = feature_utils.rewrite({
                needle: feature_utils.featureHook,
                haystack: body,
                splicable: self.featuresFile.split("\n")
            });

            grunt.file.write(file, body);

            // Add the index.html markup
            file = 'app/index.html';
            body = grunt.file.read(file);

            body = feature_utils.rewrite({
                needle: feature_utils.sampleHTMLHook,
                haystack: body,
                splicable: self.indexFile.split("\n")
            });

            grunt.file.write(file, body);

            // Add the JavaScript code 
            // Assume usage of RequireJS 
            try {
                file = 'app/scripts/main.js';
                body = grunt.file.read(file);

                body = feature_utils.rewrite({
                    needle: feature_utils.sampleHook,
                    haystack: body,
                    splicable: self.jsFile.split("\n")
                });

                grunt.file.write(file, body);
            } catch (x) {
                // if they don't use RequireJS, append it to the 
                // end of the html file. 
                file = 'app/index.html';
                body = grunt.file.read(file);

                body = feature_utils.rewrite({
                    needle: '</body>',
                    haystack: body,
                    splicable: self.jsFile.split("\n")
                });

                grunt.file.write(file, body);
            }

        } catch (x) {
            console.log(x);
            console.log(self.name);
            throw {
                name: 'SampleNotFoundException',
                message: 'Cannot find sample: \'' + self.name + '\''
            };
        }

        cb();
    });
};
