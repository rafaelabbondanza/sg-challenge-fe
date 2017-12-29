angular.module('app').factory('articleTrackerApi', function($http) {

    var PATH = 'http://localhost:31881/api/articletrackers';

    return {
        getAll: function getAll() {
            return $http.get(PATH).then(function(result) {
                return result.data;
            });
        },

        trackArticle: function trackArticle(tracker) {
            return $http.post(PATH, tracker).then(function(result) {
                return result.data;
            });
        }
    };
});
