import * as R from 'ramda';

import { RotorConfig } from './rotors';

export interface PlugPair {
    [index: number]: number;
}

export interface Enigma {
    rotors: Array<string>;
    reflector: string;
    rotorPositions: Array<number>;
    ringSettings: Array<number>;
    plugs: Array<PlugPair>;
}

interface RotorWithTurnoverPos {
    position: string; // The rotor position, between 0-25
    turnover: Array<number>; // The turnover positions
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const createPlugboardMap = plugs => {
    if (plugs.length === 0) {
        return {};
    }

    return R.reduce(
        (plugboardMap, plugPair: PlugPair) => {
            const from = plugPair[0];
            const to = plugPair[1];
            return {
                ...plugboardMap,
                [from]: to,
                [to]: from,
            };
        },
        {},
        plugs,
    );
};

const createEnigma = (setup): Enigma => ({
    rotors: setup.rotors,
    reflector: setup.reflector,
    rotorPositions: setup.rotorPositions || [0, 0, 0],
    ringSettings: setup.ringSettings || [1, 1, 1],
    plugs: createPlugboardMap(setup.plugs || []),
});

const letterToRotorPos = (x: string): number => x.charCodeAt(0) - 'A'.charCodeAt(0);
const rotorPosToLetter = (x: number): string => String.fromCharCode(x + 'A'.charCodeAt(0));
const turnoversForRotor = (rotor: string): Array<number> => RotorConfig[rotor].turnover;
const canRotate = (rotor: string): boolean => RotorConfig[rotor].rotates;
const clampToRotorRange = (n: number): number => {
    if (n < 0) {
        return n + 26;
    }
    return n % 26;
};

const isEncodeable = (x: string): boolean => x.match(/[a-zA-Z]/) !== null;

/*
 *  Given a series of rotors (e.g. M3_I, M3_II, M3_III)
 *  and an array of rotor positions
 *  it will produces an array of elements like this:
 *  { position: 0, turnover: [16, 24] }
 *  which would indicate our rotor is at postiion 0
 *  and will turnover at positions 16 and 24
 */
const combineRotorsWithTurnovers = (rotors, positions): RotorWithTurnoverPos => {
    // Grab all the turnover letters from the config for the rotors being used
    const turnoverLettersForRotors = R.map(turnoversForRotor, rotors);

    // Convert the letters to numerical positions
    // so a -> 0, b -> 1, c -> 2 etc
    const turnoverPositions = R.map(x => R.map(letterToRotorPos, x), turnoverLettersForRotors);
    const positionsWithTurnovers = R.zipWith(
        (position, turnover) => ({ position, turnover: turnover }),
        positions,
        turnoverPositions,
    );

    // Combine everything so we get our final result
    return R.zipWith((rotor, data) => ({ ...data, rotor }), rotors, positionsWithTurnovers);
};

const step = (enigma: Enigma): Enigma => {
    const stepRotors = (rotors, previousStepTurnedOver, totalRotors): Array<number> => {
        if (rotors.length === 0) {
            return [];
        }

        const rotorPos = rotors.length;
        const isMiddleRotor = rotorPos > 1 && rotorPos < totalRotors;
        const rotor = R.head(rotors);
        let hitTurnover;
        let doStep = previousStepTurnedOver;

        const turnoverPositions = rotor.turnover;
        const hasHitTurnoverPosition = (position: number): boolean => turnoverPositions.indexOf(position) != -1;

        if (isMiddleRotor && hasHitTurnoverPosition(rotor.position)) {
            doStep = true;
            hitTurnover = true;
        } else if (!isMiddleRotor) {
            hitTurnover = hasHitTurnoverPosition(rotor.position);
        }

        if (!canRotate(rotor.rotor)) {
            doStep = false;
        }

        return R.concat(
            [
                {
                    ...rotor,
                    position: doStep ? (rotor.position + 1) % 26 : rotor.position,
                },
            ],
            stepRotors(R.tail(rotors), hitTurnover, totalRotors),
        );
    };

    const rotorsWithTurnovers = combineRotorsWithTurnovers(enigma.rotors, enigma.rotorPositions);
    const reversedRotors = R.reverse(rotorsWithTurnovers);

    const performStep = R.compose(
        R.reverse,
        R.map(x => x.position),
        R.partialRight(stepRotors, [true, enigma.rotors.length]),
    );

    return {
        ...enigma,
        rotorPositions: performStep(reversedRotors),
    };
};

const stepBackwards = (enigma: Enigma): Enigma => {
    const stepRotorsBackwards = (rotors, previousStepTurnedOver, previousRotorWillDoubleStep): Array<number> => {
        if (rotors.length === 0) {
            return [];
        }

        const isMiddleRotor = rotors.length === 2;
        const isLastRotor = rotors.length === 3;
        const rotor = R.head(rotors);
        let hitTurnover;
        let doStep = previousStepTurnedOver;
        const turnoverPositions = rotor.turnover;
        const hasHitTurnoverPosition = (position: number): boolean => turnoverPositions.indexOf(position) != -1;

        if (isMiddleRotor) {
            if ((previousRotorWillDoubleStep || doStep) && hasHitTurnoverPosition(rotor.position - 1)) {
                hitTurnover = true;
                doStep = true;
            } else if (hasHitTurnoverPosition(rotor.position)) {
                doStep = true;
            }
        } else if (hasHitTurnoverPosition(rotor.position - 1)) {
            hitTurnover = true;
        }

        if (!canRotate(rotor.rotor)) {
            doStep = false;
        }

        let willDoubleStep = previousRotorWillDoubleStep;

        if (isLastRotor && hasHitTurnoverPosition(rotor.position - 2)) {
            willDoubleStep = true;
        }

        let nextPosition = rotor.position;

        if (doStep) {
            nextPosition = rotor.position === 0 ? 25 : rotor.position - 1;
        }

        return R.concat(
            [
                {
                    ...rotor,
                    position: nextPosition,
                },
            ],
            stepRotorsBackwards(R.tail(rotors), hitTurnover, willDoubleStep),
        );
    };

    const rotorsWithTurnovers = combineRotorsWithTurnovers(enigma.rotors, enigma.rotorPositions);
    const reversedRotors = R.reverse(rotorsWithTurnovers);

    const performStep = R.compose(
        R.reverse,
        R.map(x => x.position),
        R.partialRight(stepRotorsBackwards, [true, false]),
    );

    return {
        ...enigma,
        rotorPositions: performStep(reversedRotors),
    };
};

const setRotorPosition = (enigma: Enigma, rotorPositions: Array<number>): Enigma => ({
    ...enigma,
    rotorPositions,
});

const getRightToLeftWireMapping = (rotor: string): object => {
    return R.zipObj(
        R.map(letterToRotorPos, letters.split('')),
        R.map(letterToRotorPos, RotorConfig[rotor].wires.split('')),
    );
};

const getReflectorMapping = (reflectorWires: string): object => {
    return R.zipObj(R.map(letterToRotorPos, letters.split('')), R.map(letterToRotorPos, reflectorWires.split('')));
};

const getLeftToRightWireMapping = (rotor: string): object => {
    return R.zipObj(
        R.map(letterToRotorPos, RotorConfig[rotor].wires.split('')),
        R.map(letterToRotorPos, letters.split('')),
    );
};

const zip3 = (a, b, c): Array<any> => {
    const aHead = R.head(a);
    const bHead = R.head(b);
    const cHead = R.head(c);
    if (aHead === undefined || bHead === undefined || cHead === undefined) {
        return [];
    }

    return R.prepend([aHead, bHead, cHead], zip3(R.tail(a), R.tail(b), R.tail(c)));
};

const encode = (enigma: Enigma, letter: string): string => {
    const rotorsWithPositions = zip3(enigma.rotors, enigma.rotorPositions, enigma.ringSettings);

    if (!isEncodeable(letter)) {
        return '';
    }

    const passThroughPlugboard = (plugMap: object, letter: string): string => {
        if (plugMap[letter]) {
            return plugMap[letter];
        }
        return letter;
    };

    const encode = (rotors, wireLookupFn, input): string => {
        if (rotors.length === 0) {
            return input;
        }
        const [rotorName, rotorPosition, ringSetting] = R.head(rotors);
        const wireMapping = wireLookupFn(rotorName);

        const inputWithRotorOffset = clampToRotorRange(input + rotorPosition - (ringSetting - 1));

        const out = wireMapping[inputWithRotorOffset];
        return encode(R.tail(rotors), wireLookupFn, clampToRotorRange(out - rotorPosition + (ringSetting - 1)));
    };

    const reflect = (reflector, input): string => {
        const wiring = getReflectorMapping(reflector);
        return wiring[input];
    };

    const rightToLeftEncode = R.partial(encode, [R.reverse(rotorsWithPositions), getRightToLeftWireMapping]);
    const reflectorEncode = R.partial(reflect, [enigma.reflector]);
    const leftToRightEncode = R.partial(encode, [rotorsWithPositions, getLeftToRightWireMapping]);

    const performEncoding = R.compose(
        R.partial(passThroughPlugboard, [enigma.plugs]),
        rotorPosToLetter,
        leftToRightEncode,
        reflectorEncode,
        rightToLeftEncode,
        letterToRotorPos,
        R.partial(passThroughPlugboard, [enigma.plugs]),
    );

    return performEncoding(letter.toUpperCase());
};

const performStringEncode = (enigma: Enigma, input: string): string => {
    if (input === '') {
        return '';
    }
    const steppedEncoder = step(enigma);
    return encode(steppedEncoder, R.head(input)) + performStringEncode(steppedEncoder, R.tail(input));
};

const encodeString = (enigma: Enigma, input: string): string => {
    const sanitisedInput = input
        .split('')
        .filter(isEncodeable)
        .join('');
    return performStringEncode(enigma, sanitisedInput);
};

export { createEnigma, encode, encodeString, step, setRotorPosition, stepBackwards };
