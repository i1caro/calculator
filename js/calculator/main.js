define(
  [
    'lib/knockout',
    'lib/underscore',
    './pricing',
    './limiting',
    './availability',
    './utils',
    './parser',
    './mouse_actions',
    './set_calculator_data',
    './collections',
    './resources',
    './models/account_details',
    './load_templates'
  ],
  function(
    ko,
    _,
    pricing,
    limiting,
    availability,
    utils,
    parser,
    mouse_actions,
    SetCalculatorData,
    collections,
    resources,
    AccountDetails
  ) {
    function Calculator(available_items, limits, prices, initial_data) {
      /**
      Calculator model

      Options:
        * available_items: Structure of booleans indicating availability for the following features
          - virtual_machine
          - drives
           - ssd
           - hdd
          - container
          - folders
           - ssd
           - hdd
        * limits: Structure of numbers for the following limits
          - instance:
            - cpu_min
            - cpu_max
            - cpu_step
            - mem_min
            - mem_max
            - mem_step
            - disk_min
            - disk_max
          - subscription
            - min_container_cpu
            - max_container_cpu
            - min_vm_cpu
            - max_vm_cpu
            - min_container_mem
            - max_container_mem
            - min_vm_mem
            - max_vm_mem
            - min_disk
            - max_disk
            - min_xfer
            - max_xfer
            - max_remote_desktops
            - max_ip
            - max_ip6
            - max_vlan
        * prices: Structure of numbers for the following prices
            - vm_cpu
            - vm_mem
            - container_cpu
            - container_mem
            - disk
            - ssd
            - xfer
            - ip
            - vlan
            - firewall
            - windows_remote_desktop
            - windows_server_2008_web
            - windows_server_2008_standard
            - windows_server_2008_enterprise
            - windows_server_2012
            - microsoft_sql_server_2008_web
            - microsoft_sql_server_2008_standard
            - microsoft_sql_server_2012_standard
            - cpanel_vm

        * initial_data: Data with the following structure
            {
              virtual_machine: [
                {
                  cpu: Number,
                  ram: Number,
                  hdd: [Number, ...],
                  ssd: [Number, ...],
                  ip: Boolean,
                  firewall: Boolean,
                  windows_server_license: Index,
                  additional_license: Index,
                  remote_desktops: Number
                },
                ...
              ]
              containers: [
                {
                  cpu: Number,
                  ram: Number,
                  hdd: [Number, ...],
                  ssd: [Number, ...],
                  ip: Boolean,
                  firewall: Boolean,
                },
                ...
              ],
              account_details: [
                bandwidth: Number,
                vlans: Number,
                ips: Number,
              ]
              disconnected_drives: {
                hdd: [
                  {
                    size: Number,
                    windows_server_license: Index,
                    additional_license: Index,
                    remote_desktops: Number
                  },
                  ...
                ]
              },
              disconnected_folders: {
                sdd: [Number, ...]
              }
            }
      */

      // __init__
      this.available_items = available_items;
      availability.set(available_items);
      pricing.set(prices);
      limiting.set(limits);
      collections.account_details(new AccountDetails({
        bandwidth: 0,
        virtual_lans: 0,
        ips: 0
      }));

      // attributes
      this.disconnected_drives = collections.disconnected_drives;
      this.disconnected_folders = collections.disconnected_folders;
      this.servers = collections.servers;
      this.account_details = collections.account_details;

      // External
      this.pricing = pricing;

      // __init__
      SetCalculatorData.call(this, initial_data);
      _.bindAll(this, 'remove_server');

      // Computed
      this.price = ko.pureComputed(this._compute_price, this);

      this.formatted_price = ko.pureComputed(
        this._compute_formatted_price, this
      );
      this.formatted_hour_price = ko.pureComputed(
        this._compute_formatted_hour_price, this
      );
      this.has_disconnected_storages = ko.pureComputed(
        this._len_disconnected_storages, this
      );
      this.has_resources = ko.pureComputed(
        this._has_resources, this
      );
      this.resources = ko.pureComputed(resources, this);
    }
    _.extend(Calculator.prototype, SetCalculatorData.prototype, mouse_actions, {
      _has_resources: function() {
        return !_.isEmpty(this.resources());
      },
      _len_disconnected_storages: function() {
        return (
          this.disconnected_drives().length ||
          this.disconnected_folders().length
        );
      },
      _compute_price: function() {
        var total = 0;
        total += _.reduce(this.servers(), utils.sum_function, 0);
        total += _.reduce(this.disconnected_folders(), utils.sum_function, 0);
        total += _.reduce(this.disconnected_drives(), utils.sum_function, 0);
        total += this.account_details().price();

        return total;
      },
      _compute_formatted_price: function() {
        return utils.format_price(this.price());
      },
      _compute_formatted_hour_price: function() {
        var price = this.price() / pricing.MONTHS_HOURS;
        return utils.format_price(price, 4);
      },
      // External Actions
      remove_server: function(data) {
        this.servers.remove(data.server);
      },
      remove_storage: function(data) {
        this.disconnected_drives.remove(data);
        this.disconnected_folders.remove(data);
      },
      remove_all_disconnected_storages: function() {
        this.disconnected_drives.removeAll();
        this.disconnected_folders.removeAll();
      },
      add_preset_container: function() {
        this.add_container({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [10],
          hdd: []
        });
      },
      add_preset_virtual_machine: function() {
        this.add_virtual_machine({
          cpu: 500,
          ram: 126,
          ip: true,
          firewall: false,
          ssd: [],
          hdd: [10]
        });
      },
      serialize_dump: parser.serialize_dump,
      serialize_load: parser.serialize_load,
      serialize_dump_to_url: parser.serialize_dump_to_url,
    });

    return Calculator;
  }
);

