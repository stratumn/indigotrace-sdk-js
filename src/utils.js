function encodeB64(data) {
  return Buffer.from(data).toString('base64');
}

function decodeB64(data) {
  return Buffer.from(data, 'base64');
}

export { encodeB64, decodeB64 };
