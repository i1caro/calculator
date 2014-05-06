/* globals _ */

define(['./constants', './pricing'], function(CONSTANTS, pricing) {

  function extend_objects(child, parent) {
      for (var property in parent)
        if (parent.hasOwnProperty(property))
          child[property] = parent[property];
      function child_constructor() {
        this.constructor = child;
      }
      child_constructor.prototype = parent.prototype;
      child.prototype = new child_constructor();
  }
  var extend = this.extend || extend_objects;

  function toBoolean(string) {
    return string === '1';
  }

  function sum_function(memo, obj) {
    var price = obj.price();
    return memo + price;
  }

  function format_price(price) {
    var clean_price = price ? price.toFixed(2) : '0.00';
    return pricing.currency() + clean_price;
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

  function dynPop() {
    var timeoutId;
    $('.drive-icon, .server-icon').hover(function() {
        if (!timeoutId) {
          timeoutId = window.setTimeout(function() {
            timeoutId = null;
            $("#dynamicpop").text(".drive-icon:hover:before, .server-icon:hover:before {white-space:normal; width:180px;content: attr(data-long);}");
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

  return {
    'get_country_based_on_location': get_country_based_on_location,
    'calc_checksum': calc_checksum,
    'sum_function': sum_function,
    'format_price': format_price,
    'pageOffset': pageOffset,
    'toBoolean': toBoolean,
    'limit': limit,
    'dynPop': dynPop,
    'serverSlideDown': serverSlideDown,
    'extend': extend
  };
});
