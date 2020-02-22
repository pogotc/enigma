import * as R from 'ramda'

interface Enigma {
  rotors: Array<any>,
  reflector: String,
  rotorPositions: Array<number>,
}

interface RotorWithTurnoverPos {
  position: String,         // The rotor position, between 0-25
  turnover: Array<number>   // The turnover positions
}

const Rotor = {
  M3: {
    I: 'M3_I',
    II: 'M3_II',
    III: 'M3_III',
  },
};

const RotorConfig = {
  M3_I: {
    wires: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    turnover: ['Q'],
  },
  M3_II: {
    wires: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    turnover: ['E'],
  },
  M3_III: {
    wires: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    turnover: ['V'],
  },
};

const Reflector = {
  A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
};

const createEnigma = (setup): Enigma => ({
  rotors: setup.rotors,
  reflector: setup.reflector,
  rotorPositions: [0, 0, 0],
});

const letterToRotorPos = (x: string): number => x.charCodeAt(0) - 'A'.charCodeAt(0);
const turnoversForRotor = (rotor: string): Array<number> => RotorConfig[rotor].turnover;

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
  const turnoverPositions = R.map(x => R.map(letterToRotorPos, x), turnoverLettersForRotors)

  // Combine everything so we get our final result
  return R.zipWith((position, turnover) => ({ position, turnover: turnover }), positions, turnoverPositions);
};

const step = (engima: Enigma): Enigma => {
  const stepRotors = (rotors, previousStepTurnedOver) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length === 2;
    const rotor = R.head(rotors);
    let hitTurnover;
    let doStep = previousStepTurnedOver;

    const turnoverPositions = rotor.turnover;
    const hasHitTurnoverPosition = position => turnoverPositions.indexOf(position) != -1;

    if (isMiddleRotor && hasHitTurnoverPosition(rotor.position)) {
      doStep = true;
      hitTurnover = true;
    } else if (!isMiddleRotor) {
      hitTurnover = hasHitTurnoverPosition(rotor.position);
    }

    return R.concat(
      [{
        ...rotor,
        position: doStep ? (rotor.position + 1) % 26 : rotor.position,
      }],
      stepRotors(R.tail(rotors), hitTurnover),
    );
  };

  const rotorsWithTurnovers = combineRotorsWithTurnovers(engima.rotors, engima.rotorPositions);
  const reversedRotors = R.reverse(rotorsWithTurnovers);

  const performStep = R.compose(
    R.reverse,
    R.map((x) => x.position),
    R.partialRight(stepRotors, [true]),
  );

  return {
    ...engima,
    rotorPositions: performStep(reversedRotors),
  };
};

const stepBackwards = (engima: Enigma): Enigma => {
  const stepRotorsBackwards = (rotors, previousStepTurnedOver, previousRotorWillDoubleStep) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length === 2;
    const isLastRotor = rotors.length === 3;
    const rotor = R.head(rotors);
    let hitTurnover;
    let doStep = previousStepTurnedOver;
    const turnoverPositions = rotor.turnover;
    const hasHitTurnoverPosition = position => turnoverPositions.indexOf(position) != -1;

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

    let willDoubleStep = previousRotorWillDoubleStep;

    if (isLastRotor && hasHitTurnoverPosition(rotor.position - 2)) {
      willDoubleStep = true;
    }

    let nextPosition = rotor.position;

    if (doStep) {
      nextPosition = rotor.position === 0 ? 25 : rotor.position - 1;
    }

    return R.concat([{
      ...rotor,
      position: nextPosition,
    }], stepRotorsBackwards(R.tail(rotors), hitTurnover, willDoubleStep));
  };

  const rotorsWithTurnovers = combineRotorsWithTurnovers(engima.rotors, engima.rotorPositions);
  const reversedRotors = R.reverse(rotorsWithTurnovers);

  const performStep = R.compose(
    R.reverse,
    R.map((x) => x.position),
    R.partialRight(stepRotorsBackwards, [true, false]),
  );

  return {
    ...engima,
    rotorPositions: performStep(reversedRotors),
  };
};

const setRotorPosition = (enigma: Enigma, rotorPositions: Array<number>): Enigma => ({
  ...enigma,
  rotorPositions,
});


export {
  createEnigma,
  step,
  setRotorPosition,
  stepBackwards,
  Rotor,
  Reflector,
};
