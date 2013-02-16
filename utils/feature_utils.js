function rewrite (args) {

  // check if splicable is already in the body text
  var re = new RegExp(args.splicable.map(function (line) {
    return '\s*' + escapeRegExp(line);
  }).join('\n'));
  if (re.test(args.haystack)) {
    return args.haystack;
  }

  var lines = args.haystack.split('\n');

  var otherwiseLineIndex = 0;
  lines.forEach(function (line, i) {
    if (line.indexOf(args.needle) !== -1) {
      otherwiseLineIndex = i;
    }
  });

  var spaces = 0;
  while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
    spaces += 1;
  }

  var spaceStr = '';
  while ((spaces -= 1) >= 0) {
    spaceStr += ' ';
  }

  lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
    return spaceStr + line;
  }).join('\n'));

  return lines.join('\n');
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var FeatureUtils = {
    applyOptions: function () {
        this.option('required');
        this.option('fversion', {
            'desc': 'What version of the blackberry API is needed',
            'type': String,
            'banner': 'What version of the blackberry API is needed'
        });
        this.options['fversion'] = this.options['fversion'] || "1.0.0.0"
    },
    featureHook: "<!-- features inserted here -->",
    sampleHook: "// samples inserted here", // Keep in sync with app/templates/index.html
    sampleHTMLHook: "<!-- samples inserted here -->", // Keep in sync with app/templates/index.html
    rewrite: rewrite
};

module.exports = FeatureUtils;