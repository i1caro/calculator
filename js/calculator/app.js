/* exported LIMITS, PRICES, CURRENCY, LOCAL_PRICES, DEVICE_LIST */

require.config({
  'baseUrl': 'js',
  'paths': {
    'text': 'lib/require.text',
    'css': 'lib/require.css'
  },
  'shim': {
    'lib/underscore': {
      'exports': '_'
    }
  }
});

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

var DEVICE_LIST = [
  'ide:0:0', 'ide:0:1', 'ide:1:0', 'ide:1:1',
  'block:0', 'block:1', 'block:2', 'block:3',
  'block:4', 'block:5', 'block:6', 'block:7',
  'ata:0:0', 'ata:0:1', 'ata:0:2', 'ata:0:3', 'ata:0:4', 'ata:0:5',
  'scsi:0:0', 'scsi:0:1', 'scsi:0:2', 'scsi:0:3',
  'scsi:0:4', 'scsi:0:5', 'scsi:0:6'
];

// Globals
var POUND_PRICES = {
      vm_cpu: 0.012,
      vm_mem: 0.016,
      container_cpu: 0.005,
      container_mem: 0.007,
      // Disk/transfer costs.
      disk: 0.06,
      ssd: 0.15,
      xfer: 0.06,
      // Extra costs
      ip: 2.00,
      vlan: 5.00,
      firewall: 5.00,
      msft_6wc_00002: 4.00, // Desktop cals
      msft_lwa_00135: 10.00, // Windows Server Web
      msft_p73_04837: 20.00, // windows Server Standard
      msft_p72_04169: 45.00, // Windows Server Enterprise
      msft_tfa_00009: 15.00, // Microsoft Sql Server Web
      msft_228_03159: 240.00, // Microsoft Sql Server Standard
      msft_p73_04837_2012std: 240.00, // Microsoft Sql Server 2012
      currency: '£'
    },
    EURO_PRICES = {
      vm_cpu: 0.015,
      vm_mem: 0.02,
      container_cpu: 0.006,
      container_mem: 0.009,
      // Disk/transfer costs.
      disk: 0.07,
      ssd: 0.18,
      xfer: 0.06,
      // Extra costs
      ip: 2.50,
      vlan: 6.00,
      firewall: 6.00,
      msft_6wc_00002: 5.00,  // Desktop cals
      msft_lwa_00135: 12.00, // Windows Server Web
      msft_p73_04837: 24.00, // windows Server Standard
      msft_p72_04169: 55.00, // Windows Server Enterprise
      msft_tfa_00009: 18.00, // Microsoft Sql Server Web
      msft_228_03159: 300.00, // Microsoft Sql Server Standard
      msft_p73_04837_2012std: 300.00, // Microsoft Sql Server 2012
      currency: '€'
    },
    DOLAR_PRICES = {
      vm_cpu: 0.018,
      vm_mem: 0.025,
      container_cpu: 0.008,
      container_mem: 0.011,
      // Disk/transfer costs.
      disk: 0.10,
      ssd: 0.25,
      xfer: 0.15,
      // Extra costs
      ip: 3.00,
      vlan: 7.50,
      firewall: 7.50,
      msft_6wc_00002: 5.50,  // Desktop cals
      msft_lwa_00135: 15.00, // Windows Server Web
      msft_p73_04837: 30.00, // windows Server Standard
      msft_p72_04169: 75.00, // Windows Server Enterprise
      msft_tfa_00009: 22.50, // Microsoft Sql Server Web
      msft_228_03159: 385.00, // Microsoft Sql Server Standard
      msft_p73_04837_2012std: 385.00, // Microsoft Sql Server 2012
      currency: '$'
    };

var US_SAN_JOSE_PRICE = clone(DOLAR_PRICES),
    HONG_KONG_PRICE = clone(DOLAR_PRICES),
    AUSTRALIA_PRICE = clone(DOLAR_PRICES);

US_SAN_JOSE_PRICE.bandwidth_per_gb = 0.05;
HONG_KONG_PRICE.bandwidth_per_gb = 0.40;
AUSTRALIA_PRICE.bandwidth_per_gb = 0.65;

var LOCAL_PRICES = {
  'lon-b': POUND_PRICES,
  'lon-p': POUND_PRICES,
  'ams-e': EURO_PRICES,
  'sjc-c': US_SAN_JOSE_PRICE,
  'mmi-a': DOLAR_PRICES,
  'dal-a': DOLAR_PRICES,
  'lax-p': DOLAR_PRICES,
  'sat-p': DOLAR_PRICES,
  'tor-p': DOLAR_PRICES,
  'hkg-e': HONG_KONG_PRICE,
  'syd-v': AUSTRALIA_PRICE
};

var LIMITS = {},
    PRICES = POUND_PRICES,
    CURRENCY = POUND_PRICES.currency;


// Load the main app module to start the app
require(['calculator/main']);

