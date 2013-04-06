define(['text!../templates/pkgInfo.tmpl', 'handlebars'], function (templateText) {
    'use strict';
    var template = Handlebars.compile(templateText);

    function PkgInfoView(container, registry) {
        this.currentPackage = null;
        var that = this,
            mySpot;
        this.render = function (pkgInfo) {
            that.currentPackage = pkgInfo;
            if (mySpot) {
                mySpot.replaceWith(template(pkgInfo));
                mySpot = container.find('.pkgInfo');
            } else {
                container.append(template(pkgInfo));
                mySpot = container.find('.pkgInfo');
            }

            if (pkgInfo && !pkgInfo.hasOwnProperty('analytics')) {
                registry.getAnalytics(pkgInfo.name, function (analytics) {
                    pkgInfo.analytics = analytics;
                    // if we are still showing this package - update the view
                    if (pkgInfo.name === that.currentPackage.name) {
                        that.render(pkgInfo); //renderAnalytics(analytics);
                    }
                });
            }
            if (pkgInfo && !pkgInfo.hasOwnProperty('github')) {
                registry.getGithubStats(pkgInfo, function (githubData) {
                    pkgInfo.github = githubData;
                    // if we are still showing this package - update the view
                    if (pkgInfo.name === that.currentPackage.name) {
                        that.render(pkgInfo); //renderAnalytics(analytics);
                    }
                });
            }
        };
    }
    return PkgInfoView;
});