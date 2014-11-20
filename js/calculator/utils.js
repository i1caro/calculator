define(['lib/underscore', './constants'], function(_, CONSTANTS) {

  function force_int(value) {
    var result = parseInt(value);
    if (!result)
      return 0;
    return result;
  }
  function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function toBoolean(string) {
    return string === '1';
  }

  function bytes_to_gigabytes(bytes) {
    return Math.ceil(bytes / Math.pow(1024, 3));
  }

  function sum_function(memo, obj) {
    var price = obj.price();
    return memo + price;
  }

  function format_price(price) {
    var clean_price = price ? price.toFixed(2) : '0.00';
    return CONSTANTS.PRICES.currency() + clean_price;
  }

  function get_country_based_on_location() {
    var domain = location.host.split('.').splice(-1, 1)[0],
      local = CONSTANTS.DOMAINS_TO_LOCATION[domain];
    if (local)
      return local;
    return CONSTANTS.DOMAINS_TO_LOCATION['com'];
  }

  function pageOffset() {
    if (window.pageXOffset === undefined) {
      window.pageXOffset = document.documentElement.scrollLeft;
    }
    return window.pageXOffset;
  }

  function calc_checksum(string) {
    var checksum = _.reduce(string, function(memo, c) {
      return memo ^ c.charCodeAt(0);
    }, 123); // salt
    return checksum;
  }

  function limit(distance, lower_bound, upper_bound) {
    if (distance < lower_bound)
      return lower_bound;
    else if (distance > upper_bound)
      return upper_bound;
    return distance;
  }

  // http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
  function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
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

  var unique_id = {
    build: function() {
      unique_id.prev++;
      return unique_id.prev;
    },
    prev: 0
  };

  function dynPop() {
    var timeoutId;
    $('.icon-image, .icon-image').hover(function() {
        if (!timeoutId) {
          timeoutId = window.setTimeout(function() {
            timeoutId = null;
            $("#dynamicpop").text(".icon-image:hover:before, .icon-image:hover:before {white-space:normal; width:180px;content: attr(data-long);}");
          }, 1000);
        }
      },
      function() {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        else {
          $("#dynamicpop").text("");
        }
      });
  }

  function serverSlideDown() {
    jQuery("div.server").first().hide();
    jQuery("div.server").first().slideDown();
  }

  function serverSlideUp(e, callback) {
    jQuery(e).parents(".server").slideUp();
    window.setTimeout(function() {callback();}, 500);
  }

  return {
    'get_country_based_on_location': get_country_based_on_location,
    'bytes_to_gigabytes': bytes_to_gigabytes,
    'calc_checksum': calc_checksum,
    'sum_function': sum_function,
    'format_price': format_price,
    'pageOffset': pageOffset,
    'toBoolean': toBoolean,
    'unique_id': unique_id,
    'limit': limit,
    'copy': copy,
    'post': post,
    'force_int': force_int,
    'dynPop': dynPop,
    'serverSlideDown': serverSlideDown,
    'serverSlideUp': serverSlideUp,
  };
});





