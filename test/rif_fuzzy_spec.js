define(['rif/fuzzy'], function(RifFuzzy) {
    describe('fuzzy logic', function() {
        describe('not', function() {
            it('should return 1 for 0', function() {
                expect(RifFuzzy.not(0.0)).toBe(1.0);
            });
            it('should return 0 for 1', function() {
                expect(RifFuzzy.not(1.0)).toBe(0.0);
            });
            it('should return 1 for a negative value', function() {
                expect(RifFuzzy.not(-1.0)).toBe(1.0);
            });
            it('should return 1 for undefined', function() {
                expect(RifFuzzy.not(undefined)).toBe(1.0);
            });
        });
        describe('un', function() {
            it ('should return 0 for 0', function() {
                expect(RifFuzzy.un(0.0)).toBe(0.0);
            });
            it ('should return -1 for 1', function() {
                expect(RifFuzzy.un(1.0)).toBe(-1.0);
            });
            it('should return 1 for undefined', function() {
                expect(RifFuzzy.un(undefined)).toBe(0.0);
            });
        });
        describe('equals', function() {
            it('should return 1.0 for two equal numbers', function() {
                expect(RifFuzzy.equals(1.0, 1.0)).toBe(1.0);
            });
            it('should return 0 for X and not X', function() {
                expect(RifFuzzy.equals(0.0, 1.0)).toBe(0.0);
            });
            it('should return -1 for X and un X', function() {
                expect(RifFuzzy.equals(1.0, -1.0)).toBe(-1.0);
            });
        });
        describe('or', function() {
            it('should return the max of the two values', function() {
                expect(RifFuzzy.or(1.0, 1.0)).toBe(1.0);
                expect(RifFuzzy.or(1.0, 0.0)).toBe(1.0);
                expect(RifFuzzy.or(0.0, 1.0)).toBe(1.0);
                expect(RifFuzzy.or(0.0, 0.0)).toBe(0.0);

                expect(RifFuzzy.or(0.0, -1.0)).toBe(0.0);
                expect(RifFuzzy.or(0.5, -0.5)).toBe(0.5);
            })
        });
        describe('and', function() {
            it('should return the min of the two values', function() {
                expect(RifFuzzy.and(1.0, 1.0)).toBe(1.0);
                expect(RifFuzzy.and(1.0, 0.0)).toBe(0.0);
                expect(RifFuzzy.and(0.0, 1.0)).toBe(0.0);
                expect(RifFuzzy.and(0.0, 0.0)).toBe(0.0);

                expect(RifFuzzy.and(0.0, -1.0)).toBe(-1.0);
                expect(RifFuzzy.and(0.5, -0.5)).toBe(-0.5);
            })
        });
        describe('xor', function() {
            it('should return the (A and not B) or (B and not A) for the values A and B', function() {
                expect(RifFuzzy.xor(1.0, 0.0)).toBe(1.0);
                expect(RifFuzzy.xor(0.0, 1.0)).toBe(1.0);

                expect(RifFuzzy.xor(1.0, 1.0)).toBe(0.0);
                expect(RifFuzzy.xor(0.75, 0.75)).toBe(0.25);
                expect(RifFuzzy.xor(0.5, 0.5)).toBe(0.5);
                expect(RifFuzzy.xor(0.25, 0.25)).toBe(0.25);
                expect(RifFuzzy.xor(0.5, 0.0)).toBe(0.5);
                expect(RifFuzzy.xor(0.0, 0.0)).toBe(0.0);

                expect(RifFuzzy.xor(1.0, -1.0)).toBe(1.0);

                expect(RifFuzzy.xor(-0.25, -0.1)).toBe(0.0);
                expect(RifFuzzy.xor(-0.25, -0.25)).toBe(0.0);
                expect(RifFuzzy.xor(-0.5, -0.55)).toBe(0.0);
                expect(RifFuzzy.xor(-0.75, -0.75)).toBe(0.0);
                expect(RifFuzzy.xor(-1, -0.1)).toBe(0.0);

                expect(RifFuzzy.xor(-1.0, -1.0)).toBe(0.0);
                expect(RifFuzzy.xor(-1.0, -0.5)).toBe(0.0);
                expect(RifFuzzy.xor(0.0, -1.0)).toBe(0.0);
                expect(RifFuzzy.xor(0.5, -0.5)).toBe(0.5);
                expect(RifFuzzy.xor(-0.5, -0.5)).toBe(0.0);

                expect(RifFuzzy.xor(0.0, -1.0)).toBe(0.0);
                expect(RifFuzzy.xor(0.0, -0.25)).toBe(0.0);
                expect(RifFuzzy.xor(0.0, -0.5)).toBe(0.0);
                expect(RifFuzzy.xor(0.0, -0.75)).toBe(0.0);
                expect(RifFuzzy.xor(0.0, -1.0)).toBe(0.0);
            })
        });
        describe('mod (fuzzy truncation)', function() {
            it('should properly truncate', function() {
                expect(RifFuzzy.mod(0.5, 0.4)).toBe(0.5);
                expect(RifFuzzy.mod(0.4, 0.4)).toBe(0.0);
                expect(RifFuzzy.mod(0.3, 0.4)).toBe(0.0);
            })
        });
        describe('rem (fuzzy round)', function() {
            it('should properly round', function() {
                expect(RifFuzzy.rem(0.5, 0.4)).toBe(1.0);
                expect(RifFuzzy.rem(0.4, 0.4)).toBe(1.0);
                expect(RifFuzzy.rem(0.3, 0.4)).toBe(0.3);
            })
        });
        describe('difference', function() {
            it('should return 0 for the same value', function() {
                expect(RifFuzzy.difference(0.4, 0.4)).toBe(0.0);
            });
            it('should return the difference for two decreasing values', function() {
                expect(RifFuzzy.difference(0.7, 0.4)).toBeCloseTo(0.3, 0.1);
            });
            it('should return the difference for two increasing values', function() {
                expect(RifFuzzy.difference(0.2, 0.8)).toBeCloseTo(0.6, 0.1);
            });
            it('should return a maximum difference of 1', function() {
                expect(RifFuzzy.difference(0.6, -0.8)).toBe(1.0);
            });
        });
        describe('adjust', function() {
            it('should return a value closer to the target value than the parameter', function() {
                expect(RifFuzzy.adjust(0.3, 1, 0.5)).toBeGreaterThan(0.3);
            });
            it('should not adjust beyond the target', function() {
                expect(RifFuzzy.adjust(1, 1, 0.5)).toBe(1);
            });
            it('should treat an undefined value as 0', function() {
                expect(RifFuzzy.adjust(undefined, 1, 0.5)).toBe(0.5);
            });
            it('should clamp to the target value when arbitrarily close', function() {
                expect(RifFuzzy.adjust(0.994, 1, 0.5)).toBe(1);
            });
        });
        describe('more', function() {
            it('should return a larger value than the parameter', function() {
                expect(RifFuzzy.more(0.3, 0.5)).toBeGreaterThan(0.3);
            });
            it('should not return a value larger than 1', function() {
                expect(RifFuzzy.more(1, 0.5)).toBe(1);
            });
            it('should default if no increment is passed', function() {
                expect(RifFuzzy.more(0)).toBe(0.5);
            });
            it('should treat undefined as 0', function() {
                expect(RifFuzzy.more(undefined, 0.5)).toBe(0.5);
            });
        });
        describe('less', function() {
            it('should return a smaller value than the parameter', function() {
                expect(RifFuzzy.less(0.3, 0.5)).toBeLessThan(0.3);
            });
            it('should not return a value smaller than -1', function() {
                expect(RifFuzzy.less(-1, 0.5)).toBe(-1);
            });
            it('should default if no increment is passed', function() {
                expect(RifFuzzy.less(0)).toBe(-0.5);
            });
            it('should treat undefined as 0', function() {
                expect(RifFuzzy.less(undefined, 0.5)).toBe(-0.5);
            });
        });
    });
});

