import { keys } from 'libp2p-crypto';

import { decodePEM } from './utils';

function verify(pkBytes, sigBytes, msgBytes) {
  const pk = keys.supportedKeys.rsa.unmarshalRsaPublicKey(pkBytes);

  return new Promise((resolve, reject) => {
    pk.verify(msgBytes, sigBytes, (err, result) => {
      if (err !== null) {
        reject(err);
      }

      resolve(result);
    });
  });
}

function loadKey(pem) {
  const { body, label } = decodePEM(pem);
  if (label !== 'RSA PRIVATE KEY') {
    throw new Error('unsupported private key format');
  }

  return new Promise((resolve, reject) => {
    keys.supportedKeys.rsa.unmarshalRsaPrivateKey(body, (err, key) => {
      if (err !== null) {
        reject(err);
      }

      resolve(key);
    });
  });
}

export { verify, loadKey };
