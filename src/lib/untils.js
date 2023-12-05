import bcrypt from 'bcrypt';

export async function genPasswordHash(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function validPassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match;
}
