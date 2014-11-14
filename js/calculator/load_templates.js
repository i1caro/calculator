define([
    // 'text!./templates/templates.txt',
    'text!./templates/models.txt',
    'text!./templates/components.txt',
  ],
  function(models, components) {
    $("body").append(models);
    $("body").append(components);
  }
);
