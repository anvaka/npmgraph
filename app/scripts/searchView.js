define(function (require) {
    'use strict';
    var eventify = require('eventify');

    function SearchView(container, registry) {
        var that = this;
        eventify(this, ['Selected']);

        container.typeahead({
            source: function (query, process) {
                registry.findPackage(query, function (packages) {
                    var result = [];
                    for (var i = 0; i < packages.length; ++i) {
                        var pkg = packages[i];
                        result.push(pkg.id + ': ' + pkg.value.description);
                    }
                    process(result);
                });
            },
            highlighter: function (name) {
                var parts = name.split(':'),
                    pkgName = parts[0],
                    description = parts.slice(1).join(':');
                return '<strong>' + pkgName + '</strong>' +
                        '<small>' + description + '</small>';
            },
            updater: function (name) {
                var selectedName = name.split(':')[0];
                that.fireSelected(selectedName);
                return selectedName;
            }
        });

        this.show = function (packageName) {
            container.val(packageName);
        };
    }

    return SearchView;
});