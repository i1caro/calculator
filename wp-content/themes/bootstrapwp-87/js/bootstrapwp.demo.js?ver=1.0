/* ===================================================
 * bootstrapwp.demo.js v2.0.4
 * ===================================================
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// NOTICE!! This JS file is included for reference.
// This code is used to power all the JavaScript
// demos and examples for BootstrapWP
// ++++++++++++++++++++++++++++++++++++++++++

!function ($) {

  $(function(){

	//Preload images
	function preload(arrayOfImages) {
		$(arrayOfImages).each(function(){
			$('<img/>')[0].src = this;
		});
	}
	
	//Toggle active on button rollover
	$(".clickable").hover(	function () {
		$(this).toggleClass("active");
	});

    // Adding the needed html to WordPress navigation menus //
    $("ul.dropdown-menu").parent().addClass("dropdown");
    //$("ul.nav li.dropdown a").addClass("dropdown-toggle");
    $("ul.dropdown-menu li a").removeClass("dropdown-toggle");
    $('a.dropdown-toggle').attr('data-toggle', 'dropdown');

    // Adding dropdown caret for dropdown menus, if it does not already exist
    $('.dropdown-toggle:not(:has(b.caret))').append('<b class="caret"></b>');

    // Adding dropdown caret for dropdown menus, if it does not already exist
    $('.dropdown > a:not(:has(b.caret))').append('<b class="caret"></b>');

    // Disable certain links in docs
    $('section [href^=#]').click(function (e) {
      e.preventDefault()
    })

    // make code pretty
    window.prettyPrint && prettyPrint()

    // add-ons
    $('.add-on :checkbox').on('click', function () {
      var $this = $(this)
        , method = $this.attr('checked') ? 'addClass' : 'removeClass'
      $(this).parents('.add-on')[method]('active')
    })

    // position static twipsies for components page
    if ($(".twipsies a").length) {
      $(window).on('load resize', function () {
        $(".twipsies a").each(function () {
          $(this)
            .tooltip({
              placement: $(this).attr('title')
            , trigger: 'manual'
            })
            .tooltip('show')
          })
      })
    }

    // add tipsies to grid for scaffolding
    if ($('#grid-system').length) {
      $('#grid-system').tooltip({
          selector: '.show-grid > div'
        , title: function () { return $(this).width() + 'px' }
      })
    }

    // fix sub nav on scroll
    var $win = $(window)
      , $nav = $('.subnav')
      , navTop = $('.subnav').length && $('.subnav').offset().top - 40
      , isFixed = 0

    processScroll()

    // hack sad times - holdover until rewrite for 2.1
    $nav.on('click', function () {
      if (!isFixed) setTimeout(function () {  $win.scrollTop($win.scrollTop() - 47) }, 10)
    })

    $win.on('scroll', processScroll)

    function processScroll() {
      var i, scrollTop = $win.scrollTop()
      if (scrollTop >= navTop && !isFixed) {
        isFixed = 1
        $nav.addClass('subnav-fixed')
      } else if (scrollTop <= navTop && isFixed) {
        isFixed = 0
        $nav.removeClass('subnav-fixed')
      }
    }

    // tooltip demo
    $('.tooltip-demo.well').tooltip({
      selector: "a[rel=tooltip]"
    })

    $('.tooltip-test').tooltip()
    $('.popover-test').popover()

    // popover demo
    $("a[rel=popover]")
      .popover()
      .click(function(e) {
        e.preventDefault()
      })

    // button state demo
    $('#fat-btn')
      .click(function () {
        var btn = $(this)
        btn.button('loading')
        setTimeout(function () {
          btn.button('reset')
        }, 3000)
      })

    // carousel demo
    $('#myCarousel').carousel()

    // javascript build logic
    var inputsComponent = $("#components.download input")
      , inputsPlugin = $("#plugins.download input")
      , inputsVariables = $("#variables.download input")

    // toggle all plugin checkboxes
    $('#components.download .toggle-all').on('click', function (e) {
      e.preventDefault()
      inputsComponent.attr('checked', !inputsComponent.is(':checked'))
    })

    $('#plugins.download .toggle-all').on('click', function (e) {
      e.preventDefault()
      inputsPlugin.attr('checked', !inputsPlugin.is(':checked'))
    })

    $('#variables.download .toggle-all').on('click', function (e) {
      e.preventDefault()
      inputsVariables.val('')
    })


  })
  
  $("div.clickable").click(
	function()
	{
		if($(this).attr("url") != undefined) {
	    	window.location = $(this).attr("url");
		}
	});
	
	$('.over').each(function(){
		var t=$(this);
    	var src1= t.attr('src'); // initial src
    	var newSrc = src1.substring(0, src1.lastIndexOf('.'));; // let's get file name without extension
    	t.hover(function(){
        	$(this).attr('src', newSrc+ '-o.' + /[^.]+$/.exec(src1)); //last part is for extension   
    	}, function(){
        	$(this).attr('src', newSrc + '.' + /[^.]+$/.exec(src1)); //removing '-o' from the name
    	});
	});
	
	//MT 18/04/2013 Show the FAQ if present
	if(window.location.hash.length > 0) {
		$('div[rel=' + window.location.hash.substring(1) + ']').css('display','block');	
	}

}(window.jQuery)