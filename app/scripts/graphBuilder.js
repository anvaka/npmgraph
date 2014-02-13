define(['eventify'], function (eventify) {
    'use strict';

    /**
     * Graph builder is responsible for orchestrating process
     * of dependencies resolution and graph creation.
     *
     * @param registry is an npm database
     */
    function GraphBuilder(registry) {
        eventify(this, ['Done']);
        var that = this,
            pkgsPerRequest = 20;

        function addNode(pkg, graph) {
            var pkgName = (pkg._id && pkg._id.split('@')[0]) || pkg.name;
            if (pkgName && !graph.getNode(pkgName)) {
                graph.addNode(pkgName, pkg);
            }
        }
        function buildLinks(graph) {
            graph.forEachNode(function (node) {
                var dependencies = node.data.dependencies;
                for (var key in dependencies) {
                    graph.addLink(node.id, key);
                }
            });
        }
        this.currentGraph = null;

        this.buildGraph = function (rootPkgName, graph) {
            this.currentGraph = graph;
            this.rootPkgName = rootPkgName;
            var queue = [];
            var processed = {};

            var schedulePkg = function (pkgName) {
                    if (!processed.hasOwnProperty(pkgName)) {
                        processed[pkgName] = true;
                        queue.push(pkgName);
                    }
                },
                onPackagesLoaded = function (pkgs, err) {
                    if (err) {
                        throw err;
                    }
                    for (var i = 0; i < pkgs.length; i++) {
                        var pkg = pkgs[i];
                        addNode(pkg, graph);
                        for (var key in pkg.dependencies) {
                            if (pkg.dependencies.hasOwnProperty(key)) {
                                schedulePkg(key);
                            }
                        }
                    }
                    processNext();
                },
                processNext = function () {
                    if (!queue.length) {
                        buildLinks(graph);
                        var rootNode = graph.getNode(rootPkgName);
                        that.fireDone(rootNode && rootNode.data);
                        return;
                    }
                    var packagesToLoad = queue.slice(0, pkgsPerRequest);
                    queue = queue.slice(pkgsPerRequest);
                    registry.findAllPackages(packagesToLoad, onPackagesLoaded);
                };

            schedulePkg(rootPkgName);
            processNext();
        };
    }

    return GraphBuilder;
});
