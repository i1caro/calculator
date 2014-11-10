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

// Load the main app module to start the app
require(['calculator/main']);

