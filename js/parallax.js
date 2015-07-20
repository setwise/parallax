$(document).ready(function(){
  if ($('.parallax').length ){

    var $window = $(window);

    if($('.parallaxScroll').length ){

      $('.parallaxScroll .parallaxBackground').each(function(){

        //define background image
        var attr = $(this).attr('data-image');
        if (typeof attr !== typeof undefined && attr !== false) {
          $(this).css("background-image","url("+attr+")");
        }

        //css setup
        $(this).css({"background-repeat":"no-repeat","background-position":"50% 0","background-attachment":"fixed","background-size":"100%"});


        //scrolling function
        var $bgobj = $(this); // assigning the object

        $(window).scroll(function() {
          var parallaxTop = $('.parallax').position().top;
          var parallaxBottom = parallaxTop + $('.parallax').height();

          var maxHeight = $(window).height();

          if ($window.scrollTop()>parallaxBottom){
            // Normal Scroll
            var yPos =  -($window.scrollTop());
          }else if ($window.scrollTop()>parallaxBottom){
            // Normal Scroll
            var yPos =  -($window.scrollTop());
          }else{
            //alert('middle');
            var yPos =  -(($window.scrollTop()-(parallaxTop/2)) / $bgobj.data('speed'));
            //yPos = 200;

          }

          // Put together our final background position
          var coords = '50% '+ yPos + 'px';
          // Move the background
          $bgobj.css({ backgroundPosition: coords });


        });
      });
    }

    if($('.parallaxMouse').length ){

      $('.parallaxMouse .parallaxBackground').each(function(){

        //define background image
        var attr = $(this).attr('data-image');
        if (typeof attr !== typeof undefined && attr !== false) {
          $(this).css("background-image","url("+attr+")");
        }

        //css setup
        $(this).css({"background-repeat":"no-repeat","background-position":"50% 50%","background-attachment":"fixed","background-size":"110%"});


        //scrolling function
        var $bgobj = $(this); // assigning the object

        $(window).mousemove(function(e) {

          var windowHeight = $(window).height();
          var windowWidth = $(window).width();

          heightMidpoint = windowHeight/2;
          widthMidpoint = windowWidth/2;

          var mouseX = e.pageX;
          var mouseY = e.pageY;

          if (mouseX<widthMidpoint){
            widthFactor = -1;
          }else if (mouseX>widthMidpoint){
            widthFactor = 1;
          }else{
            widthFactor = 0;
          }

          if (mouseY<heightMidpoint){
            heightFactor = -1;
          }else if (mouseY>heightMidpoint){
            heightFactor = 1;
          }else{
            heightFactor = 0;
          }

          // get speed
          // Somehow relate mouse distance from center to available extra background percentage and adjust accordingly?

          var attr = $bgoj.attr('data-speed');

          //alert('middle');
          var yPos =  -($window.scrollTop() / $bgobj.data('speed'));
          //yPos = 200;
          // Put together our final background position
          var coords = '50% '+ yPos + 'px';
          // Move the background
          $bgobj.css({ backgroundPosition: coords });


        });
      });
    }
  }
});
