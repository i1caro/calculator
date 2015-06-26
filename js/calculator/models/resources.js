define([
  'lib/underscore',
  '../parser',
  '../utils',
  '../constants'
], function(_, parser, utils, CONSTANTS) {

  function common_server_resources() {
    var resources = {},
        storages;


    resources[CONSTANTS.RESOURCES_IDS.ip] = this.ip.chosen() ? 1 : 0;
    resources[CONSTANTS.RESOURCES_IDS.firewall] = this.firewall.chosen() ? 1 : 0;

    storages = parser.serialize_storages(this.storages());

    resources[CONSTANTS.RESOURCES_IDS.ssd] = _.reduce(
      storages['ssd'],
      function(memo, size) {
        return memo + utils.clean_number(size);
      },
      0
    );
    resources[CONSTANTS.RESOURCES_IDS.disk] = _.reduce(
      storages['hdd'],
      function(memo, size) {
        return memo + utils.clean_number(size);
      },
      0
    );

    return resources;
  }

  function licenses_resources() {
    var resources = {};
    resources[
      CONSTANTS.RESOURCES_IDS.windows_remote_desktop
    ] = utils.clean_number(
      this.remote_desktops.value()
    );

    if (this.additional_licenses.value())
      resources[
        this.additional_licenses.value().resource_id
      ] = 1;

    if (this.windows_server_licenses.value())
      resources[
        this.windows_server_licenses.value().resource_id
      ] = 1;

    return resources;
  }

  function virtual_machine_resources(data) {
    var resources = common_server_resources.call(this);

    resources[CONSTANTS.RESOURCES_IDS.vm_cpu] = utils.clean_number(
      this.cpu.chosen()
    );
    resources[CONSTANTS.RESOURCES_IDS.vm_mem] = utils.clean_number(
      this.ram.chosen()
    );

    return _.extend(resources, licenses_resources.call(this.licenses));
  }

  function container_resources() {
    var resources = common_server_resources.call(this);

    resources[CONSTANTS.RESOURCES_IDS.container_cpu] = utils.clean_number(
      this.cpu.chosen()
    );
    resources[CONSTANTS.RESOURCES_IDS.container_mem] = utils.clean_number(
      this.ram.chosen()
    );

    return resources;
  }

  function disconnected_storage_resources(type) {
    var resources = {};

    resources[type] = this.chosen();

    return resources;
  }

  function ssd_folder_resources() {
    return disconnected_storage_resources.call(this, CONSTANTS.RESOURCES_IDS.ssd);
  }

  function hdd_folder_resources() {
    return disconnected_storage_resources.call(this, CONSTANTS.RESOURCES_IDS.hdd);
  }

  function disconnected_ssd_drive_resources() {
    var resources = disconnected_storage_resources.call(
      this.drive, CONSTANTS.RESOURCES_IDS.ssd
    );

    return _.extend(resources, licenses_resources.call(this.licenses));
  }

  function disconnected_hdd_drive_resources() {
    var resources = disconnected_storage_resources.call(
      this.drive, CONSTANTS.RESOURCES_IDS.disk
    );

    return _.extend(resources, licenses_resources.call(this.licenses));
  }

  function account_detail_resources() {
    var resources = {};

    resources[CONSTANTS.RESOURCES_IDS.xfer] = utils.clean_number(
      this.bandwidth.chosen()
    );
    resources[CONSTANTS.RESOURCES_IDS.ip] = utils.clean_number(
      this.additional_ips.chosen()
    );
    resources[CONSTANTS.RESOURCES_IDS.ip6] = 0;
    resources[CONSTANTS.RESOURCES_IDS.vlan] = utils.clean_number(
      this.additional_vlans.chosen()
    );
    return resources;
  }

  return {
    'virtual_machine': virtual_machine_resources,
    'container': container_resources,
    'account_detail': account_detail_resources,
    'ssd_folder': ssd_folder_resources,
    'hdd_folder': hdd_folder_resources,
    'disconnected_hdd_drive': disconnected_hdd_drive_resources,
    'disconnected_ssd_drive': disconnected_ssd_drive_resources
  };
});
