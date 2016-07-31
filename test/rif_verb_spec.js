/*
 Tense descriptors: PTS
 P = Person -   f:first person/singular, F:first person/plural,
                s:second person/singular, S:second person/plural,
                t:third person/singular, T:third person/plural
 T = Temporal Tense - P:present, p:past, f:future
 S = Secondary Tense - s:simple, c:continuous/progressive, S:perfect simple, C:perfect continuous/progressive
 */

define(['rif/verb'], function(rifVerb) {
    describe("RifVerb", function () {
        describe('standard conjugation', function() {
            var walk;
            beforeEach(function() {
                walk = rifVerb.get('walk');
            });
            it('should return the root as first person single present tense', function() {
                expect(walk.conjugate('fPs')).toBe('walk');
            });
            it('should return root+"ed" for first person single past tense', function() {
                expect(walk.conjugate('fps')).toBe('walked');
            });
            it('should return root+"d"  for first person single past tense if the verb ends in "e"', function() {
                var verb = rifVerb.get('shave');
                expect(verb.conjugate('fps')).toBe('shaved');
            });
            it('should return root+"s" for third person single present tense', function() {
                expect(walk.conjugate('tPs')).toBe('walks');
            });
            it('should return root+"es" for third person single present tense if the verb ends in "s"', function() {
                var verb = rifVerb.get('miss');
                expect(verb.conjugate('tPs')).toBe('misses');
            });
            it('should return root+"es" for third person single present tense if the verb ends in "o"', function() {
                var verb = rifVerb.get('echo');
                expect(verb.conjugate('tPs')).toBe('echoes');
            });
            it('should return root+"es" for third person single present tense if the verb ends in "ch"', function() {
                var verb = rifVerb.get('catch');
                expect(verb.conjugate('tPs')).toBe('catches');
            });
            it('should return root+"es" for third person single present tense if the verb ends in "sh"', function() {
                var verb = rifVerb.get('wish');
                expect(verb.conjugate('tPs')).toBe('wishes');
            });
        });
        describe('custom conjugation', function() {
            it ('should use a direct string if one is provided in the object', function() {
                rifVerb.define('come', { fps: 'came'});

                var verb = rifVerb.get('come');
                expect(verb.conjugate('fps')).toBe('came');
            });
        });
        describe('Verb_Be', function() {
            it('should return the expected conjugations for the verb "to be"', function() {
                var be = rifVerb.get('be');
                expect(be.conjugate('fPs')).toBe('am');       // I am
                expect(be.conjugate('FPs')).toBe('are');      // We are
                expect(be.conjugate('fps')).toBe('was');      // I was
                expect(be.conjugate('Fps')).toBe('were');     // We were
                expect(be.conjugate('sPs')).toBe('are');      // you (singular) are
                expect(be.conjugate('SPs')).toBe('are');      // you (plural) are
                expect(be.conjugate('sps')).toBe('were');     // you (singular) were
                expect(be.conjugate('Sps')).toBe('were');     // you (plural) were
                expect(be.conjugate('tPs')).toBe('is');       // she is
                expect(be.conjugate('TPs')).toBe('are');      // they are
                expect(be.conjugate('tps')).toBe('was');      // she was
                expect(be.conjugate('Tps')).toBe('were');     // they were
            });
        });
        describe('Verb_Have', function() {
            it('should return the expected conjugations for the verb "to have"', function() {
                var be = rifVerb.get('have');
                expect(be.conjugate('fPs')).toBe('have');     // I have
                expect(be.conjugate('FPs')).toBe('have');     // We have
                expect(be.conjugate('fps')).toBe('had');      // I had
                expect(be.conjugate('Fps')).toBe('had');      // We had
                expect(be.conjugate('sPs')).toBe('have');     // you (singular) have
                expect(be.conjugate('SPs')).toBe('have');     // you (plural) have
                expect(be.conjugate('sps')).toBe('had');      // you (singular) had
                expect(be.conjugate('Sps')).toBe('had');      // you (plural) had
                expect(be.conjugate('tPs')).toBe('has');      // she has
                expect(be.conjugate('TPs')).toBe('have');     // they have
                expect(be.conjugate('tps')).toBe('had');      // she had
                expect(be.conjugate('Tps')).toBe('had');      // they had
            });
        });
    });
});