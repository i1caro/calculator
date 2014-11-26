define(['lib/underscore', './pricing'], function(_, pricing) {

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

  function zeroes(n) {
    if (n <= 0)
      return '0';

    var result = '';

    while (result.length < n)
      result = result + '0';
    return '0.' + result;
  }

  function format_price(price, n) {
    if (_.isUndefined(n)) {
      n = 2;
    }

    var clean_price = price ? price.toFixed(n) : zeroes(n);
    return pricing.currency() + clean_price;
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

  return {
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
    'force_int': force_int
  };
});





