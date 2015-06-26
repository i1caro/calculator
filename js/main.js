define([
  'lib/underscore',
  'lib/knockout',
  'lib/moment',
  'calculator/pricing',
  'calculator/form',
  'calculator/main',
  'marketing_site/constants'
],
  function(_, ko, moment, pricing, form, Calculator, CONSTANTS) {

    function get_country_based_on_location() {
      var domain = location.host.split('.').splice(-1, 1)[0],
        local = CONSTANTS.DOMAINS_TO_LOCATION[domain];
      if (local)
        return local;
      return CONSTANTS.DOMAINS_TO_LOCATION['com'];
    }

    function getCountryPostUrl(country) {
      return 'http://0.0.0.0:4444/accounts/plans/new/'
      return 'https://' + country + '.elastichosts.com/accounts/plans/new/';
    }

    function nextMonth() {
      return moment().add(1, 'month').format('YYYY-MM-DD');
    }

    function viewModel() {
      var self = this;

      self.country = ko.observable(get_country_based_on_location());

      Calculator.call(
        self,
        CONSTANTS.AVAILABLE_ITEMS,
        CONSTANTS.LIMITS,
        CONSTANTS.LOCAL_PRICES[self.country()]
      );

      var initial_data = {
            'virtual_machines': [{
              cpu: 500,
              ram: 256,
              ip: true,
              firewall: false,
              ssd: [],
              hdd: [10]
            }],
            'containers': [],
            'account_details': {
              'bandwidth': 10,
              'ips': 0,
              'vlans': 0
            }
          };

      if (location.hash) {
        var SIZE_COUNTRY_ID = 5,
            hash = location.hash,
            country_id = hash.substring(
              hash.length - SIZE_COUNTRY_ID, hash.length
            ),
            clean_hash;
        if (CONSTANTS.LOCAL_PRICES[country_id]) {
          clean_hash = hash.substring(0, hash.length - SIZE_COUNTRY_ID);
          self.country(country_id);
        }
        else
          clean_hash = hash;

        try {
          initial_data = self.serialize_load(clean_hash);
        }
        catch (err) {}
      }
      self.set_data(initial_data);


      self.change_country = function(data, event) {
        self.country(data.id);
      };

      self.update_prices = ko.computed(function() {
        var country = self.country();

        pricing.set(CONSTANTS.LOCAL_PRICES[country]);
        self.account_details().free_bandwidth(
          CONSTANTS.FREE_BANDWIDTH[country] || false
        );
      });

      self.update_serializer = ko.computed(function() {
        location.hash = self.serialize_dump_to_url() + self.country();
      }).extend({
        rateLimit: 1000
      });

      //Constants
      self.country_flags = CONSTANTS.ZONES;
      self.submit = function() {
        form.post(
          this.resources(),
          nextMonth(),
          getCountryPostUrl(self.country())
        );
      };
    }
    _.extend(viewModel.prototype, Calculator.prototype);

    ko.applyBindings(new viewModel());
  }
);
