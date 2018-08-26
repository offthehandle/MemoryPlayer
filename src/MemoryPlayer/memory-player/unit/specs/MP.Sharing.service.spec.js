
describe('MPSharing', function () {

    beforeEach(module('MemoryPlayer'));

    var MemoryPlayerSharing;

    beforeEach(inject(function (_MemoryPlayerSharing_) {

        MemoryPlayerSharing = _MemoryPlayerSharing_;
    }));

    describe('MPSharing initialization', function () {
        it('should initialize is time used', function () {

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(false);
        });

        it('should initialize is time used', function () {

            // Tests result
            expect(MemoryPlayerSharing.sharelinkTime).toBe('00:00');
        });
    });

    describe('MPSharing executes programmed behaviors', function () {
        it('should use time on selection', function () {

            // Uses time
            MemoryPlayerSharing.useTime();

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(true);
        });

        it('should use time on update time', function () {

            // Updates time
            MemoryPlayerSharing.updateTime('30');

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(true);
        });

        it('should not use time on selection', function () {

            // Uses time
            MemoryPlayerSharing.useTime();

            // Toggles uses time off
            MemoryPlayerSharing.useTime();

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(false);
        });
    });
});
