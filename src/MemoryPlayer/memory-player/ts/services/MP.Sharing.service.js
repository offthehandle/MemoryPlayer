var MemoryPlayerSharing = (function () {
    function MemoryPlayerSharing($rootScope, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        this.isTimeUsed = false;
        this.sharelink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        this.sharelinkTime = '00:00';
        if (angular.isDefined(this.MemoryPlayerState.getPlaylist())) {
            this.setShareVal('playlist', this.MemoryPlayerState.getPlaylist()._id);
        }
        if (angular.isDefined(this.MemoryPlayerState.getTrack())) {
            this.setShareVal('track', this.MemoryPlayerState.getTrack()._id);
        }
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                _this.setShareVal('playlist', newPlaylist._id);
            }
        });
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                _this.setShareVal('track', newTrack._id);
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
            }
        });
        this.$rootScope.$on('MP:Ready', function ($event) {
            angular.element(_this.jPlayerId).bind($.jPlayer.event.loadeddata, function (event) {
                _this.$rootScope.$evalAsync(function () {
                    _this.trackDuration = event.jPlayer.status.duration;
                });
            });
        });
    }
    MemoryPlayerSharing.prototype.cancelTimer = function () {
        angular.element(this.jPlayerId).unbind($.jPlayer.event.timeupdate);
    };
    MemoryPlayerSharing.prototype.setShareVal = function (key, value) {
        var sharelink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: false };
        var settings = this.sharelink.split('?')[1] || null;
        if (angular.isString(settings)) {
            settings = decodeURIComponent((settings).replace(/\+/g, '%20'));
            var params = settings.split(/&(?!amp;)/g);
            params.map(function (param) {
                var setting = param.split('=');
                switch (setting[0]) {
                    case 'playlist':
                        playlist.value = setting[1];
                        break;
                    case 'track':
                        track.value = setting[1];
                        break;
                    case 'time':
                        time.value = setting[1];
                        break;
                }
            });
        }
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;
            case 'track':
                track.value = value;
                break;
            case 'time':
                var parsedTime = value;
                if (parsedTime.indexOf(':') > -1) {
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total, currentValue, index) {
                        return total + currentValue * Math.pow(60, index);
                    });
                }
                time.value = (parsedTime < this.trackDuration) ? parsedTime : 0;
                break;
        }
        sharelink.push(playlist);
        sharelink.push(track);
        sharelink.push(time);
        sharelink.push(volume);
        sharelink.push(isMuted);
        sharelink.push(isPaused);
        var updatedSettings = $.param(sharelink);
        this.sharelink = this.sharelink.split('?')[0] + "?" + updatedSettings;
    };
    MemoryPlayerSharing.prototype.share = function () {
        var sharelink = document.getElementById('mp-share-link');
        sharelink.select();
        document.execCommand('copy');
    };
    MemoryPlayerSharing.prototype.updateTime = function (updatedTime) {
        this.isTimeUsed = true;
        this.setShareVal('time', updatedTime);
    };
    MemoryPlayerSharing.prototype.useTime = function () {
        this.isTimeUsed = !this.isTimeUsed;
    };
    MemoryPlayerSharing.instance = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerSharing
    ];
    return MemoryPlayerSharing;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
