import { stringify } from "canonicaljson";

function JSONToPaddedBuffer(data) {
  const bytes = Buffer.from(stringify(data));
  return Buffer.concat([bytes, Buffer.alloc(32 - bytes.length % 32)]);
}

export { JSONToPaddedBuffer };
