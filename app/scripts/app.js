define(['eventify', 'backbone'], function (eventify) {
    'use strict';
    var AppRouter = Backbone.Router.extend({
            routes: {
                'view/:pkgName': 'showPackage'
            },
            showPackage: function (pkgName) {
                if (pkgName) {
                    app.fireShowPackage(pkgName);
                }
            }
        });
    var router = new AppRouter();
    var app = {
        navigate : function (pkgName) {
            router.navigate('view/' + pkgName, {trigger: true});
        },
        start: function () {
            Backbone.history.start();
        }
    };

    // publicly exposed events:
    eventify(app, [
        'ShowPackage' // occurs when showPackage route is executed.
    ]);

    return app;
});