define([
    'text!./templates/templates.txt',
  ],
  function(templates) {
    $("body").append(templates);
  }
);
