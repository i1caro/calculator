define([],
  function() {
    function post(data) {
      var l = $(this);
      $.ajax({
          url: 'http://jonsmarketingfunnel.co.uk:5001/?' + EHhash + EHcookie,
          type: 'GET',
          crossDomain: true
      })
          .done(function() {
              location.href = "/cloud-servers/free-trial/";
          });
      setTimeout(function() {
          location.href = "/cloud-servers/free-trial/";
      }, 5000);
      l.css('cursor', 'wait').text("Just a second...");
      return false;
    }

    return {
      'post': post
    };
});
