
describe('JPlayerProvider', function () {

    beforeEach(module('MemoryPlayer'));

    var JPlayer;

    beforeEach(inject(function (_JPlayer_) {

        JPlayer = _JPlayer_;
    }));

    describe('JPlayerProvider executes programmed behaviors', function () {
        it('should get jplayer ids', function () {

            // Tests results
            expect(JPlayer.ids).toEqual(jplayerIds);
        });

        it('should create and get player', function () {

            // Creates player
            JPlayer.create([]);

            // Tests results
            expect(JPlayer.instance()).toBeTruthy();
        });

    });
});