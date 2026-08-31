import { randomBytes, randomInt as cryptoRandomInt } from 'node:crypto';

/** Chaîne aléatoire sécurisée de `len` caractères issus d'un alphabet donné (défaut: A-Z + 0-9). */
export function secureCode(len = 8, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Entier aléatoire sécurisé dans [0, max) — remplace Math.random()*max. */
export function secureInt(max) {
  if (!Number.isFinite(max) || max <= 0) return 0;
  return cryptoRandomInt(0, max);
}
