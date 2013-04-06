define(['vivagraph'], function () {
    'use strict';
    var palette = ['#FF5600', '#BF6030', '#A63800', '#FF8040', '#FFA273', '#FFD300', '#BFA730', '#A68900', '#FFDE40', '#FFE773', '#3914AF', '#412C84', '#200772', '#6A48D7', '#876ED7', '#00AA72', '#207F60', '#006E4A', '#35D4A0', '#60D4AE'];
    return {
        getNiceColor: function (stringKey) {
            var rnd = Viva.random(stringKey);
            return palette[rnd.next(1000) % palette.length];
        },
        getForegroundForBackground: function (hexColor) {
            var r = parseInt(hexColor.substr(1, 2), 16),
                g = parseInt(hexColor.substr(3, 2), 16),
                b = parseInt(hexColor.substr(5, 2), 16);
            if (186 < (r*0.299 + g*0.587 + b*0.114)) {
                return '#000000';
            }
            return '#ffffff';
        }
    };
});