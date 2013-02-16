'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('../../../../');
var feature_utils = require('../utils/feature_utils')


module.exports = AppGenerator;

function AppGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // Parse options for the config.xml file 
  this.option('app-version', {
    'desc': 'The version of the app',
    'type': String,
    'banner': 'The version of the app as included in config.xml'
  });
  this.options['app-version'] = this.options['app-version'] || '1.0.0';

  // App id will just be app_name.firstWord().toLowerCase()
  this.option('app-name', {
    'desc': 'The name of the app',
    'type': String,
    'banner': 'The name of the app as included in config.xml'
  });
  this.options['app-name'] = this.options['app-name'] || 'sampleApp';
  this.app_id = this.options['app-name'].split(' ')[0].toLowerCase();

  this.option('app-lang', {
    'desc': 'The Language of the app',
    'type': String,
    'banner': 'The language of the app as included in config.xml'
  });
  this.options['app-lang'] = this.options['app-lang'] || 'en';

  this.option('author-href', {
    'desc': 'The link to the author\'s website',
    'type': String,
    'banner': 'The website of the author of the app as included in config.xml'
  });
  this.options['author-href'] = this.options['author-href'] || 'http://www.example.com/';

  this.option('author-name', {
    'desc': 'The name of the author',
    'type': String,
    'banner': 'The name of the author of the app as included in config.xml'
  });
  this.options['author-name'] = this.options['author-name'] || 'John Smith';

  this.option('author-copyright', {
    'desc': 'The copyright information of the author',
    'type': String,
    'banner': 'The copyright information of the author as included in config.xml'
  });
  this.options['author-copyright'] = this.options['author-copyright'] || ('copyright ' + new Date().getFullYear());

  this.option('app-index', {
    'desc': 'The index page for the app',
    'type': String,
    'banner': 'The index page for the app as included in config.xml'
  });
  this.options['app-index'] = this.options['app-index'] || 'index.html';

  this.option('app-icon', {
    'desc': 'The icon of the app (include "imgs/" directory)',
    'type': String,
    'banner': 'The path to the icon for the app as included in config.xml'
  });
  this.options['app-icon'] = this.options['app-icon'] || 'imgs/icon.png';

  this.option('app-description', {
    'desc': 'The description of the app',
    'type': String,
    'banner': 'The description for the app as included in config.xml'
  });
  this.options['app-description'] = this.options['app-description'] || 'Sample application';

  this.option('access-uri');

  this.feature_hook = feature_utils.featureHook;

  // setup the test-framework property, Gruntfile template will need this
  this.test_framework = options['test-framework'] || 'mocha';

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.sourceRoot(path.join(__dirname, 'templates'));
  this.appname = path.basename(process.cwd());
  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.mainJsFile = '';
  this.yeoman = yeoman;

  this.on('end', function () {
    console.log('\nI\'m all done. Just run ' + 'npm install && bower install'.bold.yellow + ' to install the required dependencies.');
  });
}

util.inherits(AppGenerator, yeoman.generators.NamedBase);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  var welcome =
  '\n     _-----_' +
  '\n    |       |' +
  '\n    |'+'--(o)--'.red+'|   .--------------------------.' +
  '\n   `---------´  |    '+'Welcome to Yeoman,'.yellow.bold+'    |' +
  '\n    '+'( '.yellow+'_'+'´U`'.yellow+'_'+' )'.yellow+'   |   '+'ladies and gentlemen!'.yellow.bold+'  |' +
  '\n    /___A___\\   \'__________________________\'' +
  '\n     |  ~  |'.yellow +
  '\n   __'+'\'.___.\''.yellow+'__' +
  '\n ´   '+'`  |'.red+'° '+'´ Y'.red+' `\n';

  console.log(welcome);
  console.log('Out of the box I include HTML5 Boilerplate and jQuery');

  var prompts = [{
    name: 'compassBootstrap',
    message: 'Would you like to include Twitter Bootstrap for Sass?',
    default: 'Y/n',
    warning: 'Yes: All Twitter Bootstrap files will be placed into the styles directory.'
  },
  {
    name: 'includeRequireJS',
    message: 'Would you like to include RequireJS (for AMD support)?',
    default: 'Y/n',
    warning: 'Yes: RequireJS will be placed into the JavaScript vendor directory.'
  }];

  this.prompt(prompts, function (err, props) {
    if (err) {
      return this.emit('error', err);
    }

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.compassBootstrap = (/y/i).test(props.compassBootstrap);
    this.includeRequireJS = (/y/i).test(props.includeRequireJS);

    cb();
  }.bind(this));
};

AppGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js', 'Gruntfile.js');
};

AppGenerator.prototype.packageJSON = function packageJSON() {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_component.json', 'component.json');
};

AppGenerator.prototype.jshint = function jshint() {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.bootstrapJs = function bootstrapJs() {
  // TODO: create a Bower component for this
  if (this.includeRequireJS) {
    this.copy('bootstrap.js', 'app/scripts/vendor/bootstrap.js');
  }
};

AppGenerator.prototype.mainStylesheet = function mainStylesheet() {
  if (this.compassBootstrap) {
    this.write('app/styles/main.scss', ''); //@import \'compass_twitter_bootstrap\';\n\n.hero-unit {\n    margin: 50px auto 0 auto;\n    width: 250px;\n}');
  } else {
    this.write('app/styles/main.css', 'body {\n    background: #fafafa;\n}\n\n.hero-unit {\n    margin: 50px auto 0 auto;\n    width: 250px;\n}');
  }
};

AppGenerator.prototype.writeIndex = function writeIndex() {
  // prepare default content text
  var defaults = ['BB10 WebWorks API', 'HTML5 Boilerplate', 'Twitter Bootstrap'];
  var contentText = [
    '        <div class="container">',
    '            <div class="hero-unit">',
    '                <h1>\'Allo, \'Allo!</h1>',
    '                <p>You now have</p>',
    '                <ul>'
  ];

  if (this.compassBootstrap && !this.includeRequireJS) {
    // wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'components/sass-bootstrap/js/bootstrap-affix.js',
      'components/sass-bootstrap/js/bootstrap-alert.js',
      'components/sass-bootstrap/js/bootstrap-dropdown.js',
      'components/sass-bootstrap/js/bootstrap-tooltip.js',
      'components/sass-bootstrap/js/bootstrap-modal.js',
      'components/sass-bootstrap/js/bootstrap-transition.js',
      'components/sass-bootstrap/js/bootstrap-button.js',
      'components/sass-bootstrap/js/bootstrap-popover.js',
      'components/sass-bootstrap/js/bootstrap-typeahead.js',
      'components/sass-bootstrap/js/bootstrap-carousel.js',
      'components/sass-bootstrap/js/bootstrap-scrollspy.js',
      'components/sass-bootstrap/js/bootstrap-collapse.js',
      'components/sass-bootstrap/js/bootstrap-tab.js'
    ]);
  }

  if (this.includeRequireJS) {
    defaults.push('RequireJS');
  } else {
    this.mainJsFile = 'console.log(\'\\\'Allo \\\'Allo!\');';
  }

  // iterate over defaults and create content string
  defaults.forEach(function (el) {
    contentText.push('                    <li>' + el  +'</li>');
  });

  contentText = contentText.concat([
    '                </ul>',
    '                <p>installed.</p>',
    '                <h3>Enjoy coding! - Yeoman</h3>',
    '            </div>',
    '        </div>',
    ''
  ]);

  // append the default content
  this.indexFile = this.indexFile.replace('<body>', '<body>\n' + contentText.join('\n'));
};

// TODO(mklabs): to be put in a subgenerator like rjs:app
AppGenerator.prototype.requirejs = function requirejs() {
  if (this.includeRequireJS) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', ['components/requirejs/require.js'], {
      'data-main': 'scripts/main'
    });

    // add a basic amd module
    this.write('app/scripts/app.js', [
      '/*global define */',
      'define([], function () {',
      '    \'use strict\';\n',
      '    return \'\\\'Allo \\\'Allo!\';',
      '});'
    ].join('\n'));

    this.mainJsFile = [
      'require.config({',
      '    paths: {',
      '        jquery: \'../components/jquery/jquery\',',
      '        bootstrap: \'vendor/bootstrap\'',
      '    },',
      '    shim: {',
      '        boostrap: {',
      '            deps: [\'jquery\'],',
      '            exports: \'jquery\'',
      '        }',
      '    }',
      '});',
      '',
      'require([\'app\', \'jquery\', \'bootstrap\'], function (app, $) {',
      '    \'use strict\';',
      '    // use app here',
      '    console.log(app);',
      '    console.log(\'Running jQuery %s\', $().version);',
      '});'
    ].join('\n');
  }
};

AppGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.write('app/index.html', this.indexFile);
  this.write('app/scripts/main.js', this.mainJsFile);
  this.template('config.xml', 'app/config.xml');
};
