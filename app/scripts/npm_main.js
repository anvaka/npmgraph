require.config({
    paths: {
        jquery: '../components/jquery/jquery',
        underscore: '../components/underscore/underscore',
        text: '../components/requirejs-text/text',
        backbone: '../components/backbone/backbone',
        handlebars: '../components/handlebars/handlebars',
        bootstrap: 'vendor/bootstrap',
        vivagraph: '../components/vivagraph/dist/vivagraph.min'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        backbone: {
            deps: ['underscore', 'jquery']
        }
    }
});

define(function (require) {
    'use strict';
    require('bootstrap');
    require('backbone');
    require('vivagraph');

    var SearchView = require('searchView'),
        GraphBuilder = require('graphBuilder'),
        GraphView = require('graphView'),
        SideBarView = require('sidebarView');


    var app = require('app'),
        eventify = require('eventify'),
        registry = require('registry');

    var graphEvents = eventify({},['Highlight']);

    var sidebar = new SideBarView($('#sidebar'), registry, graphEvents);
    var search = new SearchView($('#npmSearchPackageName'), registry);
    $('#npmSearchPackageName').focus();
    $('.navbar-form').submit(function (e){
        e.preventDefault();
        var pkgName = $('#npmSearchPackageName').val();
        if (pkgName) {
            app.navigate(pkgName);
        }
    });

    search.onSelected(function (pkgName) {
        app.navigate(pkgName);
    });

    var graphBuilder = new GraphBuilder(registry);
    var graphView = new GraphView($('#graph')[0], graphBuilder, graphEvents);

    app.onShowPackage(function (packageName) {
        graphView.showDependencies(packageName);
        search.show(packageName);
    });
    graphView.onShowInfo(function (pkg) {
        sidebar.renderPkg(pkg);
    });
    graphBuilder.onDone(function (pkg) {
        sidebar.renderPkg(pkg);
        sidebar.renderGraphInfo(graphBuilder.currentGraph, graphBuilder.rootPkgName);
    });
    app.start();
});