define(['lib/underscore', 'calculator/constants'],
  function(_, CONSTANTS) {
    // http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
    function post(path, params, method) {
      method = method || "post"; // Set method to post by default if not specified.

      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", path);

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);

          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit();
    }

    // Add toISOString to date if it doesn't exist
    // http://stackoverflow.com/questions/12907862/ie8-date-compatibility-error
    if (!Date.prototype.toISOString) {
      (function() {
        function pad(number) {
          var r = String(number);
          if (r.length === 1) {
            r = '0' + r;
          }
          return r;
        }
        Date.prototype.toISOString = function() {
          return (this.getUTCFullYear()
            + '-' + pad(this.getUTCMonth() + 1)
            + '-' + pad(this.getUTCDate())
            + 'T' + pad(this.getUTCHours())
            + ':' + pad(this.getUTCMinutes())
            + ':' + pad(this.getUTCSeconds())
            + '.' + String(
              (this.getUTCMilliseconds() / 1000).toFixed(3)
            ).slice(2, 5)
            + 'Z'
          );
        };
      }());
    }

    function post_to_view(resources, end_date, form_url) {
      var defaults = {}, attributes;

      _.each(CONSTANTS.RESOURCES_IDS, function(value) {
        defaults[value] = 0;
      });

      attributes = _.extend(defaults, resources, {
        name: 'First Plan',
        auto_renew: true
      });

      // if (data_diggers.has_licenses(attributes)) {
      //   var clean_date = end_date.replace(/-/g, '/'),
      //       date = new Date(clean_date);
      //   attributes['end'] = date.toISOString().substring(0, 10);
      // }
      // else
      attributes['end'] = end_date;
      post(form_url, attributes);
    }

    return {'post': post_to_view};
});
