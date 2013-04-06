define(['text!../templates/graphInfo.tmpl', 'colorUtils', 'extractGraphInfo', 'handlebars'], function (templateText, colorUtils, extractGraphInfo) {
    'use strict';
    var template = Handlebars.compile(templateText);

    function GraphInfoView(container, graphEvents) {
        var mySpot,
            graphInfo;
        this.render = function (graph, rootName) {
            graphInfo = extractGraphInfo(graph);
            graphInfo.rootName = rootName;
            if (mySpot) {
                mySpot.replaceWith(template(graphInfo));
                mySpot = container.find('.graphInfo');
            } else {
                container.append(template(graphInfo));
                mySpot = container.find('.graphInfo');
            }
        };
        container.on('click', '.canfilter', function (e) {
            if(e.meta || e.ctrlKey) { return; }
            e.preventDefault();
            e.stopPropagation();
            var el = $(this),
                name = el.data('name'),
                filter = graphInfo.getFilter(el.data('filter')),
                niceColor = colorUtils.getNiceColor(name),
                niceForeground = colorUtils.getForegroundForBackground(niceColor),
                matchPredicate = function (pkg) {
                    var collection = filter.mapCallback(pkg);
                    if (!collection) {
                        return false;
                    }
                    for (var i = 0; i < collection.length; i++) {
                        if (filter.keyCallback(collection[i]) === name) {
                            return true;
                        }
                    }
                    return false;
                };

            if (el.hasClass('selected')) {
                el.css({backgroundColor: '', color: ''}).removeClass('selected');
                el.find('a').css({color: ''});
                graphEvents.fireHighlight('', matchPredicate);
            } else {
                el.css({backgroundColor: niceColor, color: niceForeground}).addClass('selected');
                el.find('a').css({color: niceForeground});
                graphEvents.fireHighlight(niceColor, matchPredicate);
            }
        });
    }
    return GraphInfoView;
});