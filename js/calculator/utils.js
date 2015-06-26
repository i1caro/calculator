define(['lib/underscore', './pricing'], function(_, pricing) {
  function toBoolean(string) {
    return string === '1';
  }

  function gigaToTera(number) {
    return (number / 1000.0).toFixed(1);
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

    var clean_price = price ? price.toFixed(n) : zeroes(n),
        sign = '';

    if (clean_price < 0) {
      clean_price = clean_price * -1;
      sign = '-';
    }

    return sign + pricing.currency() + clean_price;
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

  function trim(value, min, max) {
    if (value < min)
      return min;
    else if (value > max)
      return max;
    return value;
  }

  var unique_id = {
    build: function() {
      return ++unique_id.prev;
    },
    prev: 0
  };

  function clean_number(number) {
    return Number(number) || 0;
  }

  function returns(val) {
    return function() {
      return val;
    };
  }

  function updateObject(obja, objb) {
    _.each(objb, function(value, key) {
      if (_.keys(value).length)
        updateObject(obja[key], objb[key]);
      else
        obja[key] = value;
    });
  }

  return {
    'calc_checksum': calc_checksum,
    'sum_function': sum_function,
    'format_price': format_price,
    'pageOffset': pageOffset,
    'toBoolean': toBoolean,
    'unique_id': unique_id,
    'clean_number': clean_number,
    'trim': trim,
    'gigaToTera': gigaToTera,
    'updateObject': updateObject,
    'returns': returns
  };
});
