define([
    'lib/knockout'
  ], function(ko) {
    var disconnected_drives = ko.observableArray(),
        disconnected_folders = ko.observableArray(),
        servers = ko.observableArray(),
        account_details = ko.observable();

    return {
      'disconnected_drives': disconnected_drives,
      'disconnected_folders': disconnected_folders,
      'servers': servers,
      'account_details': account_details
    };
  }
);
