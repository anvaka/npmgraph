define(['text!../templates/sidebar.tmpl', 'pkgInfoView', 'graphInfoView', 'handlebars'],
    function (templateText, PkgInfoView, GraphInfoView) {
    'use strict';
    var template = Handlebars.compile(templateText);

    function SideBarView(container, registry, graphEvents) {
        this.container = container;
        this.currentPackage = null;
        container.html(template());

        var pkgInfoView = new PkgInfoView(container.find('#sidebarPanes'), registry),
            graphInfoView =  new GraphInfoView(container.find('#sidebarPanes'), graphEvents);

        this.renderPkg = function (pkg) {
            pkgInfoView.render(pkg);
        };
        this.renderGraphInfo = function (graph, rootName) {
            graphInfoView.render(graph, rootName);
        };
    }
    return SideBarView;
});