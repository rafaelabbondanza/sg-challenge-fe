angular.module('app')

.component('hnNewsArticle', {
    bindings: {
        article: '<hnArticle',
    },
    templateUrl: 'app/components/news-article/news-article.tpl.html',
    controller: function() {}
});
