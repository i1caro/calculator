/* globals _ */

define(['./constants'], function(CONSTANTS) {
  function toBoolean(string) {
    return string === '1';
  }
  function sum_function(memo, obj) {
    var price = obj.price();
    return memo + price;
  }
  function format_price(price, signal) {
    var clean_price = price ? price.toFixed(2) : '0.00';
    return signal + clean_price;
  }
  function get_country_based_on_location(){
    var domain = location.host.split('.').splice(-1, 1)[0],
        local = CONSTANTS.DOMAINS_TO_LOCATION[domain];
    if (local)
      return local;
    return CONSTANTS.DOMAINS_TO_LOCATION['com'];
  }
  function pageOffset() {
    if(window.pageXOffset === undefined ){
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
  return {
    'get_country_based_on_location': get_country_based_on_location,
    'calc_checksum': calc_checksum,
    'sum_function': sum_function,
    'format_price': format_price,
    'pageOffset': pageOffset,
    'toBoolean': toBoolean,
    'limit': limit
  };
});
