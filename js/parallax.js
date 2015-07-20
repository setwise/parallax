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
        var scaleFactor = $(this).attr('data-scale');
        $(this).css({"background-repeat":"no-repeat","background-position":"50% 0%","background-attachment":"fixed","background-size":scaleFactor + "%"});

        //scrolling function
        var $bgobj = $(this); // assigning the object
        var imageHeight = $bgobj.height();

        $(window).scroll(function() {
          var parallaxTop = $('.parallax').position().top;
          var parallaxBottom = parallaxTop + $('.parallax').height();
          var parallaxHeight = $('.parallax').height();


          //determine speed
          var speed = $bgobj.attr('data-speed') / 100;

          var maxHeight = $(window).height();

          if ($window.scrollTop()>parallaxBottom){
            // Normal Scroll
            var yPos =  -($window.scrollTop());
          }else if ($window.scrollTop()>parallaxBottom){
            // Normal Scroll
            var yPos =  -($window.scrollTop());
          }else{
            //alert('middle');
            var yPos =   -(($window.scrollTop()-(parallaxTop)) * speed);
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
        var scaleFactor = $(this).attr('data-scale');
        $(this).css({"background-repeat":"no-repeat","background-position":"50% 50%","background-attachment":"fixed","background-size":scaleFactor + "%"});

        //mousemove function
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

          //parallax dimension variables
          var parallaxBottom = parallaxTop + $('.parallax').height();
          var parallaxHeight = $('.parallax').height();
          var parallaxLeft = $('.parallax').position().left;
          var parallaxTop = $('.parallax').position().top;
          var parallaxWidth = $('.parallax').width();

          //determine mouse distance from center of parallax
          var dxFromCenter = mouseX - parallaxLeft - parallaxWidth/2;
          var dyFromCenter = mouseY - parallaxTop - parallaxHeight/2;

          //calculate movement speed factor
          var speedx = $bgobj.attr('data-speed') / 100;
          var speedy = $bgobj.attr('data-speed') / (50000/parallaxHeight);

          //calculate new image position based on mouse movement and parallax dimensions
          var xPos = 50 + (dxFromCenter / (parallaxWidth / 2) * (scaleFactor / 2) * speedx);
          var yPos = parallaxTop * scaleFactor / 100 - (parallaxHeight / 2) - (dyFromCenter / (2 * parallaxHeight) * (scaleFactor / 2) * speedy) - $window.scrollTop();

          // Put together our final background position
          var coords = xPos + '% '+ yPos + 'px';
          // Move the background
          $bgobj.css({ backgroundPosition: coords });


        });
      });
    }
  }
});
