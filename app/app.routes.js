angular.module('app').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('hn-news', {
            url: '/news',
            component: 'news',
            resolve: {
                articles: function(articleTrackerApi) {
                    return articleTrackerApi.getAll();
                }
            }
        })
        .state('hn-not-implemented', {
            url: '/ni',
            template: '<div>NOT YET IMPLEMENTED</div>'
        })
        .state('hn-admin', {
            url: '/admin',
            component: 'admin',
            resolve: {
                articles: function(articleTrackerApi) {
                    return articleTrackerApi.getAll();
                }
            }
        });

    // default routes
    $urlRouterProvider
        .when('', '/news')
        .when('/', '/news')

});
