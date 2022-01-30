(function ($) {
    'use strict';

    /* COUNTDOWN */
    $('#countdown').countdown({
        date: '06 October 2022 00:00:00', // Put your date here
        format: 'on'
    }, () => {
        console.log('Hi there');
    });

    /* jQuery Vegas Slider */
    // For slideshow:
    $.vegas('slideshow', {
        delay: 7000,
        backgrounds: [
            { src: './images/image01.jpg', fade: 1000 },
            { src: './images/image02.jpg', fade: 1000 },
        ]
    })('overlay', {
        src: './img/06.png'
    });

    $('.time').bind('inview', function (event, visible) {
        if (visible === true) {
            $(this).addClass('animated fadeInUp');
        } else {
            $(this).removeClass('animated fadeInUp');
        }
    });

    console.log('Хотите помочь? vk.com/opa_oz');

})(jQuery);
