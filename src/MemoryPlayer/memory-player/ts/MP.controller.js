var MemoryPlayerController = /** @class */ (function () {
    function MemoryPlayerController($scope, MemoryPlayerState, MemoryPlayerControls, MemoryPlayerSharing) {
        var _this = this;
        this.$scope = $scope;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.isShareable = true;
        this.playlists = this.MemoryPlayerState.getPlaylists();
        this.currentPlaylist = this.MemoryPlayerState.getPlaylist();
        this.currentTrack = this.MemoryPlayerState.getTrack();
        this.isPaused = this.MemoryPlayerState.getIsPaused();
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylists();
        }, function (newPlaylists, oldPlaylists) {
            if (angular.isDefined(newPlaylists) && newPlaylists !== oldPlaylists) {
                _this.playlists = newPlaylists;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                _this.currentPlaylist = newPlaylist;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                _this.currentTrack = newTrack;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getIsPaused();
        }, function (newState, oldState) {
            if (angular.isDefined(newState) && newState !== oldState) {
                _this.isPaused = newState;
            }
        });
    }
    MemoryPlayerController.prototype.cancelTimer = function () {
        this.MemoryPlayerSharing.cancelTimer();
    };
    MemoryPlayerController.prototype.maxVolume = function () {
        this.MemoryPlayerControls.maxVolume();
    };
    MemoryPlayerController.prototype.mute = function () {
        this.MemoryPlayerControls.mute();
    };
    MemoryPlayerController.prototype.next = function () {
        this.MemoryPlayerControls.next();
    };
    MemoryPlayerController.prototype.play = function () {
        this.MemoryPlayerControls.play();
    };
    MemoryPlayerController.prototype.previous = function () {
        this.MemoryPlayerControls.previous();
    };
    MemoryPlayerController.prototype.selectPlaylist = function (playlistName) {
        this.MemoryPlayerControls.selectPlaylist(playlistName);
    };
    MemoryPlayerController.prototype.selectTrack = function (trackIndex) {
        this.MemoryPlayerControls.selectTrack(trackIndex);
    };
    MemoryPlayerController.prototype.share = function () {
        this.MemoryPlayerSharing.share();
    };
    MemoryPlayerController.prototype.toggleDropdown = function ($event) {
        this.MemoryPlayerControls.toggleDropdown($event);
    };
    MemoryPlayerController.prototype.updateTime = function (updatedTime) {
        this.MemoryPlayerSharing.updateTime(updatedTime);
    };
    MemoryPlayerController.prototype.useTime = function () {
        this.MemoryPlayerSharing.useTime();
    };
    MemoryPlayerController.instance = [
        '$scope',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        'MemoryPlayerSharing',
        MemoryPlayerController
    ];
    return MemoryPlayerController;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
