// Compatibilite ch5-cli avec Node 23+.
//
// Node 23 a retire les 14 helpers util.is* deprecies depuis Node 4. ssh2-streams
// (dependance de @crestron/ch5-utilities-cli) fait encore « var isDate = util.isDate »
// puis l'appelle au moment du setstat, juste apres l'envoi du fichier : sous Node 24
// le deploiement s'arrete sur « isDate is not a function. No success executing command. »
// alors que l'archive est deja montee sur l'appareil.
//
// A charger AVANT le CLI : node --require tools\ch5-compat.js <ch5-cli> ...
const util = require('util');
const t = util.types;

const repli = {
    isArray: Array.isArray,
    isBoolean: (v) => typeof v === 'boolean',
    isBuffer: Buffer.isBuffer,
    isDate: (v) => t.isDate(v),
    isError: (v) => t.isNativeError(v) || v instanceof Error,
    isFunction: (v) => typeof v === 'function',
    isNull: (v) => v === null,
    isNullOrUndefined: (v) => v === null || v === undefined,
    isNumber: (v) => typeof v === 'number',
    isObject: (v) => typeof v === 'object' && v !== null,
    isPrimitive: (v) => v === null || (typeof v !== 'object' && typeof v !== 'function'),
    isRegExp: (v) => t.isRegExp(v),
    isString: (v) => typeof v === 'string',
    isSymbol: (v) => typeof v === 'symbol',
    isUndefined: (v) => v === undefined,
};

for (const nom of Object.keys(repli)) {
    if (typeof util[nom] !== 'function') util[nom] = repli[nom];
}
