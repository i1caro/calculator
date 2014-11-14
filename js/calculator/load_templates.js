define([
    'text!./templates/models.txt',
    'text!./templates/components.txt',
  ],
  function(models, components) {
    $("body").append(models);
    $("body").append(components);
  }
);
