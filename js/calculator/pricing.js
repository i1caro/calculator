define(['lib/knockout', './constants'], function(ko, CONSTANTS) {


  function Prices() {
    var self = this,
        first_country = 'lon-p';

    for (var key in CONSTANTS.UK_PRICE)
      self[key] = ko.observable();

    self._country = ko.observable();

    function update_prices(value) {
      var prices = CONSTANTS.COUNTRIES_PRICES[value];
      for (var key in CONSTANTS.UK_PRICE) {
        self[key](prices[key]);
      }
    }

    self.country = ko.computed({
      read: function() {
        return self._country();
      },
      write: function(value) {
        self._country(value);
        update_prices(value);
      },
      owner: self
    });
    self.country(first_country);
  }
  var prices = new Prices();
  return prices;
});
