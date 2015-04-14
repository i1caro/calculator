// Load modules that are loaded by the html
define('$', function() {
    return $;
});

require.config({
  // BaseUrl must be removed for the live site for some reason
  // 'baseUrl': 'js',
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

// Load the main app module to start the app
require(['main']);



