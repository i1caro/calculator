define(['lib/underscore', 'lib/knockout', 'calculator/main', 'marketing_site/constants'],
  function(_, ko, calculator, CONSTANTS) {

    function get_country_based_on_location() {
      var domain = location.host.split('.').splice(-1, 1)[0],
        local = CONSTANTS.DOMAINS_TO_LOCATION[domain];
      if (local)
        return local;
      return CONSTANTS.DOMAINS_TO_LOCATION['com'];
    }

    function serverSlideDown() {
      jQuery('#server-list>div').first().hide();
      jQuery('#server-list>div').first().slideDown();
    }

    function serverSlideUp(e, callback) {
      jQuery(e.target).parents('.server-panel').slideUp();
      window.setTimeout(function() {
        callback();
      }, 500);
    }

    function viewModel() {
      var self = this;

      self.country = ko.observable(get_country_based_on_location());

      ko.utils.extend(self, new calculator(
        CONSTANTS.LIMITS,
        CONSTANTS.LOCAL_PRICES[self.country()]
      ));

      // Overwrite
      self.remove_server = function(data, e) {
        serverSlideUp(e, function() {
          self.servers.remove(data.server);
        });
      };

      self.add_container = function() {
        self.servers.unshift(new self.models.container({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [10],
          hdd: []
        }));
        serverSlideDown();
      };
      self.add_virtual_machine = function() {
        self.servers.unshift(new self.models.virtual_machine({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [10]
        }));
        serverSlideDown();
      };

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

        self.set_pricing(CONSTANTS.LOCAL_PRICES[country]);
        self.account_details.free_bandwidth(
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
    }

    ko.applyBindings(new viewModel());
  }
);
