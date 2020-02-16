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
  const stepRotors = (rotors, step) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length == 2;
    const rotor = R.head(rotors);
    let hitTurnover;

    if (isMiddleRotor && rotor.position === rotor.turnover) {
      step = true;
      hitTurnover = true;
    } else if (!isMiddleRotor) {
      hitTurnover = rotor.position === rotor.turnover;
    }

    return R.concat(
      [{
        ...rotor,
        position: step ? (rotor.position + 1) % 26 : rotor.position,
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
  const stepRotorsBackwards = (rotors, step, willDoubleStep) => {
    if (rotors.length === 0) {
      return [];
    }

    const isMiddleRotor = rotors.length === 2;
    const isLastRotor = rotors.length === 3;
    const rotor = R.head(rotors);
    let hitTurnover;

    if (isMiddleRotor) {
      if ((willDoubleStep || step) && rotor.position - 1 === rotor.turnover) {
        hitTurnover = true;
        step = true;
      } else if (rotor.position === rotor.turnover) {
        step = true;
      }
    } else if (rotor.position - 1 === rotor.turnover) {
      hitTurnover = true;
    }
    if (isLastRotor && rotor.position - 2 === rotor.turnover) {
      willDoubleStep = true;
    }

    return R.concat([{
      ...rotor,
      position: step ? (rotor.position === 0 ? 25 : rotor.position - 1) : rotor.position,
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
