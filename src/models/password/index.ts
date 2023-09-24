import bcryptjs from 'bcryptjs';

import webserver from 'infra/webserver';
import { CompareParams } from './types';

async function hash(password: string) {
  return await bcryptjs.hash(password, getNumberOfSaltRounds());
}

async function compare({ providedPassword, storedPassword }: CompareParams) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

function getNumberOfSaltRounds() {
  let saltRounds = 14;

  if (!webserver.isServerlessRuntime) {
    saltRounds = 1;
  }

  return saltRounds;
}

export default Object.freeze({
  hash,
  compare,
});
