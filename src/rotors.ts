const Rotor = {
    M3: {
        I: 'M3_I',
        II: 'M3_II',
        III: 'M3_III',
        IV: 'M3_IV',
        V: 'M3_V',
        VI: 'M3_VI',
        VII: 'M3_VII',
        VIII: 'M3_VIII',
    },
    M4: {
        BETA: 'M4_BETA',
        GAMMA: 'M4_GAMMA',
    },
};

const RotorConfig = {
    // M3 - Kriegsmarine rotors
    M3_I: {
        wires: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
        turnover: ['Q'],
        rotates: true,
    },
    M3_II: {
        wires: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
        turnover: ['E'],
        rotates: true,
    },
    M3_III: {
        wires: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
        turnover: ['V'],
        rotates: true,
    },
    M3_IV: {
        wires: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
        turnover: ['J'],
        rotates: true,
    },
    M3_V: {
        wires: 'VZBRGITYUPSDNHLXAWMJQOFECK',
        turnover: ['Z'],
        rotates: true,
    },
    M3_VI: {
        wires: 'JPGVOUMFYQBENHZRDKASXLICTW',
        turnover: ['Z', 'M'],
        rotates: true,
    },
    M3_VII: {
        wires: 'NZJHGRCXMYSWBOUFAIVLPEKQDT',
        turnover: ['Z', 'M'],
        rotates: true,
    },
    M3_VIII: {
        wires: 'FKQHTLXOCBJSPDZRAMEWNIUYGV',
        turnover: ['Z', 'M'],
        rotates: true,
    },

    M4_BETA: {
        wires: 'LEYJVCNIXWPBQMDRTAKZGFUHOS',
        turnover: [],
        rotates: false,
    },
    M4_GAMMA: {
        wires: 'FSOKANUERHMBTIYCWLQPZXVGJD',
        turnover: [],
        rotates: false,
    },
};

const Reflector = {
    M3: {
        A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
        B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
        C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
    },
    M4: {
        B: 'ENKQAUYWJICOPBLMDXZVFTHRGS',
        C: 'RDOBJNTKVEHMLFCWZAXGYIPSUQ',
    },
};

export { Rotor, Reflector, RotorConfig };
