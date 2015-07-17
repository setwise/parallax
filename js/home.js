$(document).ready(function(){
  if ($('.parallax').length ){

    $('.parallax').css("position","relative");

    var $window = $(window);

    if($('.parallaxScroll').length ){

      $('.parallaxScroll .parallaxBackground').each(function(){

        //define background image
        var attr = $(this).attr('data-image');
        if (typeof attr !== typeof undefined && attr !== false) {
          $(this).css("background-image","url("+attr+")");
        }

        //css setup
        $(this).css({"background-repeat":"no-repeat","background-position":"50% 0","background-attachment":"fixed","background-size":"110%"});


        //scrolling function
        var $bgobj = $(this); // assigning the object

        $(window).scroll(function() {
          var yPos =  -($window.scrollTop() / $bgobj.data('speed'));

          // Put together our final background position
          var coords = '50% '+ yPos + 'px';
          // Move the background
          $bgobj.css({ backgroundPosition: coords });
        });
      });
    }
  }
});