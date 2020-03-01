# Enigma

## Using Engima

The simplest way to use Engima is through the `createEnigma` and `encodeString` functions:

```javascript
import { createEnigma, encodeString } from './enigma';
import { Rotor, Reflector } from './rotors';

// Creates an Engima object using the M3 Kriegsmarine I, II, and III Rotors
// Along with the M3 Reflector B
// Both the ring setting and rotor positions will default to AAA
// And no letters will be switched via the plugboard
const enigma = createEnigma({
    rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
    reflector: Reflector.M3.A,
});

const ciphertext = encodeString(enigma, 'AAAA');
console.log(ciphertext); // Will output 'BDZG'

// Decryption uses the same function
const plaintext = encodeString(enigma, 'BDZG');
console.log(plaintext); // Will output 'AAAA'
```

A more complicated example making use of all the options available might look like this:

```javascript

// Create an M4 Naval Enigma
const enigma = createEnigma({
    rotors: [Rotor.M4.BETA, Rotor.M3.III, Rotor.M3.II, Rotor.M3.I],
    reflector: Reflector.M4.B,
    ringSettings: [20, 5, 19, 20],      // TEST
    rotorPositions: [18, 2, 17, 19],    // SCRT
    plugs: [['Q', 'A'], ['T', 'G'], ['E', 'N'], ['D', 'X']]
});
const ciphertext = encodeString(enigma, 'ATTACKATDAWN');
console.log(ciphertext);    // outputs LRVCNQOUIYYG
````

## Stepping and encoding

While `encodeString` is useful for doing quick encipherments, in order to accurately model the changes in state inside the Enigma machine it's better to use the `step` and `encode` functions which split up the process of stepping the rotors and doing the encoding.

### Stepping

```javascript
import { createEnigma, step, encode } from './enigma';
import { Rotor, Reflector } from './rotors';

const enigma = createEnigma({
    rotors: [Rotor.M3.I, Rotor.M3.II, Rotor.M3.III],
    reflector: Reflector.M3.A,
});

console.log(enigma.rotorPositions); // Will ouput [0, 0, 0] since this is the default starting position

const steppedEnigma = step(enigma);

console.log(steppedEnigma.rotorPositions) // Will output [0, 0, 1]
```

It's also possible to reverse the stepping with `stepBackwards`

```javascript

const previousState = stepBackwards(steppedEnigma);
console.log(previousState.rotorPositions) // Will output [0, 0, 0]
```

### Encoding

Encoding a letter is done using the `encode` function

```javascript
console.log(encode(steppedEnigma, 'A')); /// Will output B
```

### Combining the two

```javascript

const step1 = step(engima);
console.log(encode(step1, 'A')); // Outputs B

const step2 = step(step1);
console.log(encode(step2, 'A')); // Outputs D

const step3 = step(step2);
console.log(encode(step3, 'A')); // Outputs Z

const step4 = step(step3);
console.log(encode(step4, 'A')); // Outputs G
```

While this code will run it's not the intended way of encoding text, in general I would recommend `encodeString` for a one off encoding, or if the user can update settings and text being encoded on the fly using something like Redux to keep track of the state. All of the functions provided will return a new copy of the state making it perfect for that kind of use-case.

## Local development

The tests can be run with

    npm test

Everything is written using Typescript and a watch command is included:

    npm run build:watch




