# Enigma

## Using Engima

The simplest way to use Engima is through the `createEnigma` and `encodeString` functions:

```javascript
import { createEnigma, encodeString } from './enigma';
import { Rotor, Reflector } from './rotors';

// Creates an Engima object using the M3 Kriegsmarine I, II, and III Rotors
// Along with the M3 Reflector B
// The default ring setting is A A A
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



