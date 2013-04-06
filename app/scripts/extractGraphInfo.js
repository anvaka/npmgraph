/**
 * Produces slices of data, based on graph: all authors/licenses/keywords, ordered
 * by number of occurrences.
 */
define(function () {
    'use strict';
    function mapList(options) {
        var hash = {},
            keyCallback = options.key,
            entryName = options.entryName,
            mapCallback = options.map;
        return {
            map: function (pkg) {
                var objects = mapCallback(pkg);
                if (objects) {
                    for (var i = 0; i < objects.length; i++) {
                        var obj = objects[i],
                            key = keyCallback(obj);
                        if (!hash.hasOwnProperty(key)) {
                            var entry = {
                                count: 1
                            };
                            entry[entryName] = obj;
                            hash[key] = entry;
                        } else {
                            hash[key].count += 1;
                        }
                    }
                }
            },
            getList : function () {
                var result = [];
                for (var key in hash) {
                    if (hash.hasOwnProperty(key)) {
                        result.push(hash[key]);
                    }
                }
                return result.sort(function (x, y) {
                    return y.count - x.count;
                });
            },
            mapCallback: mapCallback,
            keyCallback: keyCallback
        };
    }

    function extractGraphInfo (graph) {
        var filters = {
            maintainers: mapList({
                entryName: 'person',
                key: function (person) {
                    return person.email;
                },
                map: function(pkg) {
                    return pkg && pkg.maintainers;
                }
            }),
            licenses: mapList({
                entryName: 'license',
                key: function (license) {
                    return license.type;
                },
                map: function(pkg) {
                    return pkg && pkg.licenses;
                }
            }),
            keywords: mapList({
                entryName: 'keyword',
                key: function (keyword) {
                    return keyword;
                },
                map: function(pkg) {
                    return pkg && pkg.keywords;
                }
            })
        };

        graph.forEachNode(function (node) {
            var pkg = node.data;
            filters.maintainers.map(pkg);
            filters.licenses.map(pkg);
            filters.keywords.map(pkg);
        });

        return {
            nodesCount: graph.getNodesCount(),
            linksCount: graph.getLinksCount(),
            maintainers: filters.maintainers.getList(),
            licenses: filters.licenses.getList(),
            keywords: filters.keywords.getList(),
            getFilter: function (filterId) {
                if (filters.hasOwnProperty(filterId)) {
                    return filters[filterId];
                }
            }
        };
    }

    return extractGraphInfo;
});