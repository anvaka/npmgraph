define(['eventify'], function (eventify) {
    'use strict';
    var theme = {
        nodeColor: '#00a2e8',
        currentNode: '#ff0000',
        highlightNode: 'orange',
        textHighlightNode: 'black',
        textColor: '#cccccc',
        nodeStrokeColor: '#ffffff',
        baseSize: 12
    };

    function NodeUI(node, defaultColor) {
        eventify(this, ['Click']);
        this.defaultColor = defaultColor || theme.nodeColor;
        this.color = theme.nodeColor;
        this.textColor = theme.textColor;
        this.node = node;
        this.ui = this.svgText = this.rect = null;
        this._render();
        this._listenEvents();
    }

    NodeUI.prototype._render = function () {
        this.ui = Viva.Graph.svg('g');
        this.svgText = Viva.Graph.svg('text')
                .attr('y', '-4px')
                .attr('fill', theme.textColor)
                .text(this.node.id);
        this.rect = Viva.Graph.svg('rect')
                .attr('width', theme.baseSize)
                .attr('height', theme.baseSize)
                .attr('fill', this.color)
                .attr('stroke', theme.nodeStrokeColor)
                .attr('stroke-width', 1);

        this.ui.append(this.svgText);
        this.ui.append(this.rect);
    };

    NodeUI.prototype._listenEvents = function () {
        var that = this;
        $(this.ui).mouseenter(function () {
            that.rect.attr('fill', theme.highlightNode);
            that.svgText.attr('fill', theme.textHighlightNode)
                .attr('font-weight', 'bold')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.2);
        }).mouseleave(function () {
            that.rect.attr('fill', that.color);
            that.svgText.attr('fill', that.textColor)
                .attr('font-weight', 'normal')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0);
        }).click(function () {
            that.fireClick(that.node.data);
        });
    };

    NodeUI.prototype.setColor = function (color, textColor) {
        if (textColor) {
            this.textColor = textColor;
            this.svgText.attr('fill', textColor);
        }
        if (color) {
            this.color = color;
            this.rect.attr('fill', color);
        } else {
            this.color = this.defaultColor;
            this.rect.attr('fill', this.color);
        }
    };

    function GraphView(graphContainer, graphBuilder, graphEvents) {
        var graph = Viva.Graph.graph();
        var graphics = Viva.Graph.View.svgGraphics(),
            nodeSize = theme.baseSize,
            that = this,
            nodeViews = {};

        eventify(this, ['ShowInfo']);

        var renderer = Viva.Graph.View.renderer(graph, {
                graphics : graphics,
                container: graphContainer
            });
        renderer.run();

        graphics.node(function (node) {
            var view = new NodeUI(node);
            nodeViews[node.id] = view;
            view.onClick(that.fireShowInfo);
            if (that.isCurrentNode(node)) {
                node.isPinned = true;
                view.defaultColor = theme.currentNode;
                view.setColor(theme.currentNode, theme.currentNode);
            }
            return view.ui;
        }).placeNode(function (nodeUI, pos) {
            nodeUI.attr('transform',
                        'translate(' +
                              (pos.x - nodeSize / 2) + ',' + (pos.y - nodeSize / 2) +
                        ')');
        });

        var createMarker = function (id) {
                return Viva.Graph.svg('marker')
                           .attr('id', id)
                           .attr('viewBox', '0 0 10 10')
                           .attr('refX', '8')
                           .attr('refY', '5')
                           .attr('markerUnits', 'strokeWidth')
                           .attr('markerWidth', '10')
                           .attr('markerHeight', '5')
                           .attr('orient', 'auto')
                           .attr('style', 'fill: gray');
            },

            marker = createMarker('Triangle');
        marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

        var root = graphics.getSvgRoot(),
            defs = root.append('defs');
        defs.append(marker);

        var geom = Viva.Graph.geom();

        graphics.link(function () {
            // Notice the Triangle marker-end attribe:
            return Viva.Graph.svg('path')
                       .attr('stroke', 'gray')
                       .attr('marker-end', 'url(#Triangle)');
        }).placeLink(function (linkUI, fromPos, toPos) {
            var toNodeSize = nodeSize + 2,
                fromNodeSize = nodeSize + 2;

            var from = geom.intersectRect(
                    // rectangle:
                            fromPos.x - fromNodeSize / 2, // left
                            fromPos.y - fromNodeSize / 2, // top
                            fromPos.x + fromNodeSize / 2, // right
                            fromPos.y + fromNodeSize / 2, // bottom
                    // segment:
                            fromPos.x, fromPos.y, toPos.x, toPos.y)  ||
                            fromPos; // if no intersection found - return center of the node

            var to = geom.intersectRect(
                    // rectangle:
                            toPos.x - toNodeSize / 2, // left
                            toPos.y - toNodeSize / 2, // top
                            toPos.x + toNodeSize / 2, // right
                            toPos.y + toNodeSize / 2, // bottom
                    // segment:
                            toPos.x, toPos.y, fromPos.x, fromPos.y) ||
                            toPos; // if no intersection found - return center of the node

            var data = 'M' + from.x + ',' + from.y +
                       'L' + to.x + ',' + to.y;

            linkUI.attr('d', data);
        });

        this.showDependencies = function (pkgName) {
            graph.clear();
            nodeViews = {};
            this.rootNode = pkgName;
            graphBuilder.buildGraph(pkgName, graph);
        };
        this.isCurrentNode = function (data)  {
            return data.id === this.rootNode;
        };
        graphEvents.onHighlight(function (color, predicate) {
            if (typeof predicate !== 'function') {
                return; 
            }

            graph.forEachNode(function (node) {
                var view = nodeViews[node.id];
                if (view && predicate(node.data)) {
                    view.setColor(color);
                }
            })
        });
    }

    return GraphView;
});
