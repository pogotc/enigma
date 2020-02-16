const R = require('ramda');

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

const createEnigma = (setup) => ({
  rotors: setup.rotors,
  reflector: setup.reflector,
  rotorPositions: [0, 0, 0],
});

const letterToRotorPos = (x) => x.charCodeAt(0) - 'A'.charCodeAt(0);

const turnoverForRotor = (rotor) => RotorConfig[rotor].turnover[0];

const combineRotorsWithTurnovers = (rotors, positions) => {
  const getRotorTurnovers = R.compose(
    letterToRotorPos,
    turnoverForRotor,
  );

  const turnoverPositions = R.map(getRotorTurnovers, rotors);

  return R.zipWith((position, turnover) => ({ position, turnover }), positions, turnoverPositions);
};

const step = (engima) => {
  const stepRotors = (rotors, previousStepTurnedOver) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length === 2;
    const rotor = R.head(rotors);
    let hitTurnover;
    let doStep = previousStepTurnedOver;

    if (isMiddleRotor && rotor.position === rotor.turnover) {
      doStep = true;
      hitTurnover = true;
    } else if (!isMiddleRotor) {
      hitTurnover = rotor.position === rotor.turnover;
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

const stepBackwards = (engima) => {
  const stepRotorsBackwards = (rotors, previousStepTurnedOver, previousRotorWillDoubleStep) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length === 2;
    const isLastRotor = rotors.length === 3;
    const rotor = R.head(rotors);
    let hitTurnover;
    let doStep = previousStepTurnedOver;

    if (isMiddleRotor) {
      if ((previousRotorWillDoubleStep || doStep) && rotor.position - 1 === rotor.turnover) {
        hitTurnover = true;
        doStep = true;
      } else if (rotor.position === rotor.turnover) {
        doStep = true;
      }
    } else if (rotor.position - 1 === rotor.turnover) {
      hitTurnover = true;
    }

    let willDoubleStep = previousRotorWillDoubleStep;

    if (isLastRotor && rotor.position - 2 === rotor.turnover) {
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

const setRotorPosition = (enigma, rotorPositions) => ({
  ...enigma,
  rotorPositions,
});


module.exports = {
  createEnigma,
  step,
  setRotorPosition,
  stepBackwards,
  Rotor,
  Reflector,
};
