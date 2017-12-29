angular.module('app').factory('pixelTag', function($http) {

    var PATH = 'http://localhost:31881/api/pixels?code=';

    return {
        generateImgTag: function generateImgTag(pixelCode) {
            return '<img src="' + PATH + pixelCode +'" height="0" width="0" />';        }
    };
});
