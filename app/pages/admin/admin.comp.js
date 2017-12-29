angular.module('app').component('admin', {
    templateUrl: 'app/pages/admin/admin.tpl.html',
    bindings: {
        articles: '<'
    },
    controller: function (articleTrackerApi, pixelTag) {
        var $ctrl = this;

        $ctrl.newArticle = _newArticle();
        $ctrl.pixel = null;

        $ctrl.generatePixel = generatePixel;
        $ctrl.isDisabled = isDisabled;

        $ctrl.$onInit = _onInit;

        function generatePixel() {
            articleTrackerApi.trackArticle($ctrl.newArticle).then(function(article) {

                $ctrl.pixel = {
                    title: article.Title,
                    url: article.Url,
                    tag: pixelTag.generateImgTag(article.PixelCode)
                };

                $ctrl.newArticle = _newArticle();

                $ctrl.pixelImgTag = _generateImgTag(article.PixelCode);
                articleTrackerApi.getAll().then(function(articles) {
                    $ctrl.articles = articles;
                    _onInit();
                });
            });
        }

        function isDisabled() {
            return !$ctrl.newArticle.Title || !$ctrl.newArticle.Url;
        }

        function _generateImgTag(pixelCode) {
            if(!pixelCode) {
                return 'NONE.';
            }
            return pixelTag.generateImgTag(pixelCode);
        }

        function _newArticle() {
            return {
                UserId: 1,
                Title: '',
                Url: ''
            };
        }

        function _onInit() {
            $ctrl.pixels = $ctrl.articles.reduce(function(arr, item) {
                if(!item.PixelCode) {
                    return arr;
                }
                arr.push({
                    title: item.Title,
                    url: item.Url,
                    tag: pixelTag.generateImgTag(item.PixelCode)
                });
                return arr;
            }, []);
        }
    }
});
