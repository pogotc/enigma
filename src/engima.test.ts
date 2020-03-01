import { createEnigma, encode, encodeString, step, setRotorPosition, stepBackwards } from './engima';
import { Rotor, Reflector } from './rotors';
import { Enigma } from './engima';

test('can initialise the engima', () => {
    const engima = createEnigma({
        rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
        reflector: Reflector.M3.A,
    });

    expect(engima.rotors).toEqual([Rotor.M3.I, Rotor.M3.II, Rotor.M3.III]);
    expect(engima.reflector).toEqual(Reflector.M3.A);
    expect(engima.rotorPositions).toEqual([0, 0, 0]);
});

describe('Stepping', () => {
    let engima;
    beforeEach(() => {
        engima = createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.M3.A,
        });
    });

    describe('forward', () => {
        const doSteps = (engimaUnderTest, steps): Enigma => {
            if (steps === 0) {
                return engimaUnderTest;
            }
            return doSteps(step(engimaUnderTest), steps - 1);
        };

        test('simple steps', () => {
            expect(engima.rotorPositions).toEqual([0, 0, 0]);
            const steppedEngima = step(engima);
            expect(steppedEngima.rotorPositions).toEqual([0, 0, 1]);

            const twiceSteppedEngima = step(step(engima));
            expect(twiceSteppedEngima.rotorPositions).toEqual([0, 0, 2]);
        });

        test('wraps back to zero after going past position 25', () => {
            const enigmaToTest = step(setRotorPosition(engima, [0, 0, 25]));
            expect(enigmaToTest.rotorPositions).toEqual([0, 0, 0]);
        });

        test('turnover', () => {
            const enigmaToTest = setRotorPosition(engima, [0, 0, 20]); // 20 = U
            const afterStep1 = step(enigmaToTest);
            expect(afterStep1.rotorPositions).toEqual([0, 0, 21]);

            const afterStep2 = step(afterStep1);
            expect(afterStep2.rotorPositions).toEqual([0, 1, 22]);
        });

        test('double step', () => {
            const enigmaToTest = setRotorPosition(engima, [0, 3, 20]); // A D U

            const afterStep1 = step(enigmaToTest);
            expect(afterStep1.rotorPositions).toEqual([0, 3, 21]); // A D V

            const afterStep2 = step(afterStep1);
            expect(afterStep2.rotorPositions).toEqual([0, 4, 22]); // A E W

            const afterStep3 = step(afterStep2);
            expect(afterStep3.rotorPositions).toEqual([1, 5, 23]); // B F X

            const afterStep4 = step(afterStep3);
            expect(afterStep4.rotorPositions).toEqual([1, 5, 24]); // B F Y
        });

        test('repeated presses', () => {
            const enigmaToTest = setRotorPosition(engima, [0, 0, 0]);
            const afterEncoding = doSteps(enigmaToTest, 200);

            expect(afterEncoding.rotorPositions).toEqual([1, 8, 18]); // B I S
        });

        test("rotors that don't move", () => {
            // the Rotor.M4.GAMMA does not move
            engima = createEnigma({
                rotors: [Rotor.M4.GAMMA, Rotor.M3.II, Rotor.M3.III],
                reflector: Reflector.M3.A,
            });
            const enigmaToTest = setRotorPosition(engima, [0, 0, 0]);
            const afterEncoding = doSteps(enigmaToTest, 200);

            expect(afterEncoding.rotorPositions).toEqual([0, 8, 18]); // A I S
        });
    });

    describe('backward', () => {
        const doSteps = (engimaUnderTest, steps): Enigma => {
            if (steps === 0) {
                return engimaUnderTest;
            }
            return doSteps(stepBackwards(engimaUnderTest), steps - 1);
        };

        test('simple steps', () => {
            const enigmaToTest = setRotorPosition(engima, [0, 0, 2]);
            const steppedEngima = stepBackwards(enigmaToTest);
            expect(steppedEngima.rotorPositions).toEqual([0, 0, 1]);

            const twiceSteppedEngima = stepBackwards(stepBackwards(enigmaToTest));
            expect(twiceSteppedEngima.rotorPositions).toEqual([0, 0, 0]);
        });

        test('wraps back to 25 after going below position 0', () => {
            const enigmaToTest = stepBackwards(setRotorPosition(engima, [0, 0, 0]));
            expect(enigmaToTest.rotorPositions).toEqual([0, 0, 25]);
        });

        test('turnover', () => {
            const enigmaToTest = setRotorPosition(engima, [0, 1, 22]);
            const afterStep1 = stepBackwards(enigmaToTest);
            expect(afterStep1.rotorPositions).toEqual([0, 0, 21]);

            const afterStep2 = stepBackwards(afterStep1);
            expect(afterStep2.rotorPositions).toEqual([0, 0, 20]);
        });

        test('double step', () => {
            const enigmaToTest = setRotorPosition(engima, [1, 5, 24]); // B F Y

            const afterStep1 = stepBackwards(enigmaToTest);
            expect(afterStep1.rotorPositions).toEqual([1, 5, 23]); // B F X

            const afterStep2 = stepBackwards(afterStep1);
            expect(afterStep2.rotorPositions).toEqual([0, 4, 22]); // A E W

            const afterStep3 = stepBackwards(afterStep2);
            expect(afterStep3.rotorPositions).toEqual([0, 3, 21]); // A D V

            const afterStep4 = stepBackwards(afterStep3);
            expect(afterStep4.rotorPositions).toEqual([0, 3, 20]); // A D U
        });

        test('repeated presses', () => {
            const enigmaToTest = setRotorPosition(engima, [1, 8, 18]); // B I S
            const afterEncoding = doSteps(enigmaToTest, 200);

            expect(afterEncoding.rotorPositions).toEqual([0, 0, 0]); // A A A
        });

        test("rotors that don't move", () => {
            // the Rotor.M4.GAMMA does not move
            engima = createEnigma({
                rotors: [Rotor.M4.GAMMA, Rotor.M3.II, Rotor.M3.III],
                reflector: Reflector.M3.A,
            });
            const enigmaToTest = setRotorPosition(engima, [0, 8, 18]); // A I S
            const afterEncoding = doSteps(enigmaToTest, 200);

            expect(afterEncoding.rotorPositions).toEqual([0, 0, 0]); // A A A
        });
    });
});

describe('Encrypting / Decrypting', () => {
    const engima = createEnigma({
        rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
        reflector: Reflector.M3.B,
    });
    test('can do a simple encipherment', () => {
        const testOutput = encodeString(engima, 'AAAA');
        expect(testOutput).toEqual('BDZG');
    });

    test('can do a simple decipherment', () => {
        const testOutput = encodeString(engima, 'BDZG');
        expect(testOutput).toEqual('AAAA');
    });
});

describe('Plugboard', () => {
    test('can swap letters going in', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
            plugs: [['A', 'K']],
        });

        const testOutput = encodeString(engima, 'KKKK');
        expect(testOutput).toEqual('BDZG');
    });
    test('the order of the letters does not matter', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
            plugs: [['K', 'A']],
        });

        const testOutput = encodeString(engima, 'KKKK');
        expect(testOutput).toEqual('BDZG');
    });
    test('can swap letters going in both directions', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
            plugs: [
                ['A', 'K'],
                ['B', 'N'],
            ],
        });

        const testOutput = encodeString(engima, 'KKKK');
        expect(testOutput).toEqual('NDZG');
    });
});

describe('Modified ring settings', () => {
    const engima = createEnigma({
        rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
        reflector: Reflector.M3.B,
        ringSettings: [1, 1, 2],
    });

    test('can do a simple encipherment', () => {
        const testOutput = encodeString(engima, 'AAAAA');
        expect(testOutput).toEqual('UBDZG');
    });

    test('can do a simple decipherment', () => {
        const testOutput = encodeString(engima, 'UBDZG');
        expect(testOutput).toEqual('AAAAA');
    });
});

describe('Character sanitisation', () => {
    const engima = step(
        createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
        }),
    );

    test('lowercase characters are converted to uppercase', () => {
        expect(encode(engima, 'a')).toEqual('B');
    });
    test('numbers are ignored', () => {
        expect(encode(engima, '3')).toEqual('');
    });
    test('punctuation is ignored', () => {
        expect(encode(engima, '.')).toEqual('');
        expect(encode(engima, ',')).toEqual('');
        expect(encode(engima, '*')).toEqual('');
    });
});

describe('Text sanitisation', () => {
    const engima = createEnigma({
        rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
        reflector: Reflector.M3.B,
        ringSettings: [1, 1, 1],
    });

    test('lowercase characters are converted to uppercase', () => {
        const testOutput = encodeString(engima, 'aaaa');
        expect(testOutput).toEqual('BDZG');
    });
    test('non alpha characters are skipped', () => {
        const testOutput = encodeString(engima, 'AA.AA');
        expect(testOutput).toEqual('BDZG');
    });
});

describe('Misc tests', () => {
    test('M3 - simple', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.II, Rotor.M3.III, Rotor.M3.I],
            reflector: Reflector.M3.B,
            ringSettings: [7, 18, 10],
            rotorPositions: [19, 18, 19],
        });
        const testOutput = encodeString(engima, 'TESTING');
        expect(testOutput).toEqual('IKMIJGR');
    });
    test('M3 - longer text', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.II, Rotor.M3.I, Rotor.M3.III],
            reflector: Reflector.M3.B,
            ringSettings: [7, 10, 18],
            rotorPositions: [3, 4, 20],
        });
        const testOutput = encodeString(
            engima,
            'LOREMIPSUMDOLORSITAMETCONSECTETURADIPISCINGELITSEDDOEIUSMODTEMPORINCIDIDUNTUTLABOREETDOLOREMAGNAALIQUAUTENIMADMINIMVENIAMQUISNOSTRUDEXERCITATIONULLAMCOLABORISNISIUTALIQUIPEXEACOMMODOCONSEQUATDUISAUTEIRUREDOLORINREPREHENDERITINVOLUPTATEVELITESSECILLUMDOLOREEUFUGIATNULLAPARIATUREXCEPTEURSINTOCCAECATCUPIDATATNONPROIDENTSUNTINCULPAQUIOFFICIADESERUNTMOLLITANIMIDESTLABORUM',
        );
        expect(testOutput).toEqual(
            'THQCFRKJOJRRAEUVHOQUOUGLBWNPUXQXGNJVHRBXUAHOAPKGDQCXZQIANARSIOUFQOTYKSRPEDSXDITKCOTNUEKJQBBGGBLDYEGRGEMLGMLQURKMAYKKGMPXPHEMQFSDEUAXGQSBZLWZQCNLTTTEOBLCLLVPYKBDFHAKTCQVMMYZWYOWTENWPNYEAPFKBIYNWZAZKLFRETBLNTYQCCWFSCQVSPGBRYCVRZIATVGIVOLPIGWQPNVZMGEULBXPHPMXVVPRDXCRZYDRUZRNYEENWZFUIZQNXAETRCYSNJPRZWADTEWNJJXTZOXYQAXXOPMOHCDEKKMEITXPHXYVMOJMRAOJVWBIFDTNKHAAZPITHERNRIWQJ',
        );
    });
    test('M3 - rotors 4, 5, 6', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.IV, Rotor.M3.V, Rotor.M3.VI],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
            rotorPositions: [0, 0, 0],
        });
        const testOutput = encodeString(engima, 'TESTING');
        expect(testOutput).toEqual('UGRURWR');
    });
    test('M3 - rotors 7, 8', () => {
        const engima = createEnigma({
            rotors: [Rotor.M3.VI, Rotor.M3.VII, Rotor.M3.VIII],
            reflector: Reflector.M3.B,
            ringSettings: [1, 1, 1],
            rotorPositions: [0, 0, 0],
        });
        const testOutput = encodeString(engima, 'TESTING');
        expect(testOutput).toEqual('QWCMTQC');

        const testOutputLong = encodeString(
            engima,
            'LOREMIPSUMDOLORSITAMETCONSECTETURADIPISCINGELITSEDDOEIUSMODTEMPORINCIDIDUNTUTLABOREETDOLOREMAGNAALIQUAUTENIMADMINIMVENIAMQUISNOSTRUDEXERCITATIONULLAMCOLABORISNISIUTALIQUIPEXEACOMMODOCONSEQUATDUISAUTEIRUREDOLORINREPREHENDERITINVOLUPTATEVELITESSECILLUMDOLOREEUFUGIATNULLAPARIATUREXCEPTEURSINTOCCAECATCUPIDATATNONPROIDENTSUNTINCULPAQUIOFFICIADESERUNTMOLLITANIMIDESTLABORUM',
        );
        expect(testOutputLong).toEqual(
            'OLTWRPVNSZYVHUWGWNQOMRAMSKGOGVNXOOIJVTNIATQRSNHKIUCWHWOMFVNZMVQEHTJEFADMFOMZSUFXLWCOIQGMZMIJORTNRYMZZMINHZCZSJFEJWPTMBESYAHMBKMERFPRJFVNVPMFFVNWKYSFJMIICEEGALMWMOTYGKGMXQESMVIXVNVLJGOUFXVVVGQBSDDFCHJKGSBMYTISXRXJSHYAJNXAGHSBAQMBNTQACCJJZINFPHBJAFDJHZQADLHUFJXYCCWUZQVVLLXKABCDFACYFDYVSPIHXDKXIDVUQSKCBWXGQFDTLLHPXQKCPGGVKYMXTZCHXBNEMJQHWBCTBIJEHBJHJXBNHZVORWHFVFRKIQNEB',
        );
    });

    test('M4 - simple', () => {
        const engima = createEnigma({
            rotors: [Rotor.M4.GAMMA, Rotor.M3.III, Rotor.M3.II, Rotor.M3.I],
            reflector: Reflector.M4.B,
            ringSettings: [1, 1, 1, 1],
            rotorPositions: [0, 0, 0, 0],
        });
        const testOutput = encodeString(engima, 'TESTING');
        expect(testOutput).toEqual('MXORWRZ');
    });

    test('M4 - long', () => {
        const engima = createEnigma({
            rotors: [Rotor.M4.GAMMA, Rotor.M3.III, Rotor.M3.II, Rotor.M3.I],
            reflector: Reflector.M4.B,
            ringSettings: [1, 1, 1, 1],
            rotorPositions: [0, 0, 0, 0],
        });
        const testOutputLong = encodeString(
            engima,
            'LOREMIPSUMDOLORSITAMETCONSECTETURADIPISCINGELITSEDDOEIUSMODTEMPORINCIDIDUNTUTLABOREETDOLOREMAGNAALIQUAUTENIMADMINIMVENIAMQUISNOSTRUDEXERCITATIONULLAMCOLABORISNISIUTALIQUIPEXEACOMMODOCONSEQUATDUISAUTEIRUREDOLORINREPREHENDERITINVOLUPTATEVELITESSECILLUMDOLOREEUFUGIATNULLAPARIATUREXCEPTEURSINTOCCAECATCUPIDATATNONPROIDENTSUNTINCULPAQUIOFFICIADESERUNTMOLLITANIMIDESTLABORUM',
        );
        expect(testOutputLong).toEqual(
            'CUWVRTSIFJIHMBBZNDPRONJLRRLUPFJCHCENKVOWPWQBWBSOKFTTMTFGBVLBPSDILBZZRIOKJDORXYHRRJHUHCKNHARGWSCJTTLRYVWOTUZZJJQXQHSUHLHQCBOFCPROKYYAQFKNGMWFPPUFWCRIHRMJSGNBENHKYHMFNJUCVVSLFYHGEVEMXJSBWEZTRTRUBVXUYSKKKFHMJXSYQBQHSUBLRTPIYIVSTIRJNTZJOJHULBUPBMIDRCPINFZVDHEQLFBJZDOUBFXQSRVIDLZMQOZDGKAMBUGCDFALDYRPBQXQQWFLIBGINVBASYEFYCLQPMSFKFDMCPEJNCSWYLNWIGSIWUGIBADMRDZZZWGRRZRECNIOX',
        );
    });
});
