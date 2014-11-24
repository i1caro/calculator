// Load modules that are loaded by the html
define('$', function() {
    return $;
});

require.config({
  'baseUrl': 'js',
  'paths': {
    'text': 'lib/require.text',
    'css': 'lib/require.css'
  },
  'shim': {
    'lib/underscore': {
      'exports': '_'
    }
  }
});

var LIMITS = {};

// Load the main app module to start the app
require(['main']);



