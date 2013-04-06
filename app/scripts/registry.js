/*global define */
define(function (require) {
    'use strict';
    var $ = require('jquery'),
        md5 = require('vendor/md5');
    var registryEndpoint = 'http://isaacs.iriscouch.com/registry/_design/scratch/_view/byField';

    var day = function (ms) {
            return (new Date(ms)).toISOString().substr(0, 10);
        },
        prettyNumber = function (x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        },
        isGitHubLink = function (url) {
            var match = url && url.match(/github.com\/(.+).git/i);
            return match && match[1];
        },
        getGithubRepoName = function (pkg) {
            if (!pkg) { return false; }

            return isGitHubLink(pkg.repository && pkg.repository.url) ||
                   isGitHubLink(pkg.repositories && pkg.repositories.length && pkg.repositories[0].url);
        },
        gravatar = function (email, options, https) {
            var baseURL = (https && 'https://secure.gravatar.com/avatar/') || 'http://www.gravatar.com/avatar/',
                queryData = $.param(options),
                query = (queryData && '?' + queryData) || '';

            return baseURL + md5.hex(email.toLowerCase().trim()) + query;
        },
        gravatarPerson = function (person) {
            if (!person || typeof person !== 'object') {
                return;
            }
            person.avatar = gravatar(person.email || '', {s:50, d:'retro'}, true);
            person.avatarMedium = gravatar(person.email || '', {s:100, d:'retro'}, true);
            person.avatarLarge = gravatar(person.email || '', {s:496, d:'retro'}, true);

        },
        gravatarPepole = function (pkg) {
            gravatarPerson(pkg.author);
            if (pkg.maintainers) {
                pkg.maintainers.forEach(function (m) { gravatarPerson(m); });
            }
            if (Array.isArray(pkg.contributors)) {
                pkg.contributors.forEach(function (m) { gravatarPerson(m); });
            }
        };

    return {
        findPackage: function (name, callback) {
            $.ajax({
                url: registryEndpoint,
                dataType: 'jsonp',
                data: {
                    limit: 10,
                    reduce: false,
                    startkey: JSON.stringify(name)
                },
                success: function (data) {
                    if (!data.rows) {
                        return;
                    }
                    callback(data.rows);
                }
            });
        },
        findAllPackages: function (pkgsNames, callback) {
            $.ajax(registryEndpoint, {
                data: {keys : JSON.stringify(pkgsNames)},
                dataType: 'jsonp',
                success: function (data) {
                    var pkgs = data && data.rows && data.rows.map(function (x) {
                        var pkg = x.value;
                        gravatarPepole(pkg);
                        return pkg;
                    });
                    callback(pkgs);
                },
                error: function (xhr, err) {
                    console.error(err);
                    callback(null, err);
                }
            });
        },
        getAnalytics: function (pkgName, callback) {
            var month = Date.now() - 1000 * 60 * 60 * 24 * 31;
            // Current day might not be done loading => back up an extra day:
            var end = Date.now() - 1000 * 60 * 60 * 24;

            $.ajax({
                url: 'http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg',
                dataType: 'jsonp',
                data: {
                    startkey: JSON.stringify([pkgName, day(month)]),
                    endkey: JSON.stringify([pkgName, day(end)]),
                    group_level: 1
                },
                success: function (data) {
                    var failed = !data || !data.rows || !data.rows.length;
                    if (failed) {
                        callback({
                            dlMonth: 0
                        });
                    }
                    callback({
                        dlMonth: prettyNumber(data.rows[0].value)
                    });
                }
            });
        },
        getGithubStats: function (pkg, callback) {
            var gitHubRepo = getGithubRepoName(pkg);

            if (gitHubRepo) {
                $.ajax('https://api.github.com/repos/' + gitHubRepo, {
                    dataType: 'jsonp',
                    success: function (data) {
                        data = data.data;
                        callback({
                            watchers: prettyNumber(data.watchers_count),
                            forks: prettyNumber(data.forks_count),
                            url: data.html_url
                        });
                    }
                });
            } else {
                setTimeout(function () { callback(null); }, 0);
            }
        }
    };
});