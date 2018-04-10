import { define } from 'asn1.js';
import { readFileSync } from 'fs';

function encodeB64(data) {
  return Buffer.from(data).toString('base64');
}

function decodeB64(data) {
  return Buffer.from(data, 'base64');
}

function decodePEM(data) {
  const lines = data.split(/\r?\n/);
  const beginRE = new RegExp(`-----\\s*BEGIN (.*)\\s*-----`);
  const endRE = new RegExp(`-----\\s*END (.*)\\s*-----`);
  const tagBegin = lines[0].match(beginRE);
  const tagEnd = lines[lines.length - 1].match(endRE);
  if (!tagBegin || !tagEnd || tagBegin[1] !== tagEnd[1]) {
    throw new Error(
      'Missing PEM label, or mismatch between BEGIN and END labels'
    );
  }
  return {
    body: Buffer.from(lines.slice(1, lines.length - 1).join(''), 'base64'),
    label: tagBegin[1]
  };
}

function Asn1AlgorithmIdentifier() {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters')
      .optional()
      .any()
  );
}
const AlgorithmIdentifierEncoder = define(
  'AlgorithmIdentifier',
  Asn1AlgorithmIdentifier
);

export {
  encodeB64,
  decodeB64,
  decodePEM,
  AlgorithmIdentifierEncoder,
  readFileSync
};
