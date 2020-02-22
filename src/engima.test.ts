import { createEnigma, step, setRotorPosition, stepBackwards, Rotor, Reflector } from './engima';
import { Enigma } from './engima';

test('can initialise the engima', () => {
    const engima = createEnigma({
        rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
        reflector: Reflector.A,
    });

    expect(engima.rotors).toEqual([Rotor.M3.I, Rotor.M3.II, Rotor.M3.III]);
    expect(engima.reflector).toEqual(Reflector.A);
    expect(engima.rotorPositions).toEqual([0, 0, 0]);
});

describe('Stepping', () => {
    let engima;
    beforeEach(() => {
        engima = createEnigma({
            rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
            reflector: Reflector.A,
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
                reflector: Reflector.A,
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
                reflector: Reflector.A,
            });
            const enigmaToTest = setRotorPosition(engima, [0, 8, 18]); // A I S
            const afterEncoding = doSteps(enigmaToTest, 200);

            expect(afterEncoding.rotorPositions).toEqual([0, 0, 0]); // A A A
        });
    });
});
