define([
    'lib/knockout',
    'lib/underscore',
    '../pricing',
    '../limiting',
    '../constants',
    './components'
  ],
  function(ko, _, pricing, limiting, constants, Components) {
    var prices = pricing.prices,
        limits = limiting.limits;

    function WindowsServerLicenses(license) {
      Components.ServerLicenses.call(this, {
        choices: constants.WINDOWS_LICENSE_ORDER,
        license: license
      });
    }
    _.extend(
      WindowsServerLicenses.prototype, Components.ServerLicenses.prototype
    );

    function AdditionalLicenses(license) {
      Components.ServerLicenses.call(this, {
        choices: constants.ADDITIONAL_LICENSE_ORDER,
        license: license
      });
    }
    _.extend(
      AdditionalLicenses.prototype, Components.ServerLicenses.prototype
    );

    function DesktopLicenses(value) {
      Components.SimpleInput.call(this, {
        name: 'Windows Remote Desktop Services SAL',
        price: prices.windows_remote_desktop,
        value: value,
        max: limits.subscription.max_remote_desktops
      });
    }
    _.extend(
      DesktopLicenses.prototype, Components.SimpleInput.prototype
    );


    function Licenses(options) {
      /**
      Licenses in models

      Options:
        * windows_server_license: Index for windows server licenses
        * additional_license:     Index for other licenses
        * remote_desktops:        Number of remote desktop licenses
      */
      this.windows_server_licenses = new WindowsServerLicenses(
        options.windows_server_license
      );
      this.additional_licenses = new AdditionalLicenses(
        options.additional_license
      );
      this.remote_desktops = new DesktopLicenses(options.remote_desktops);

      this.price = ko.pureComputed(
        this._compute_license_prices, this
      );
    }
    _.extend(Licenses.prototype, {
      _compute_license_prices: function() {
        var total = 0;

        total += this.sum_attr(this.windows_server_licenses);
        total += this.sum_attr(this.additional_licenses);
        total += this.sum_attr(this.remote_desktops);
        return total;
      },
      sum_attr: function(attribute) {
        if (attribute.price())
          return attribute.price();
        return 0;
      }
    });

    return Licenses;
  }
);
