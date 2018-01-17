import { expect } from "chai";
import Trace from "../src/";
import secp256k1 from "secp256k1";
import { randomBytes } from "crypto";
import { stringify } from "canonicaljson";

describe("Sign", () => {
  let client;
  let key;
  let payload;

  beforeEach(() => {
    let privKey;
    do {
      privKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privKey));
    const pubKey = secp256k1.publicKeyCreate(privKey);
    key = {
      type: "ECDSA",
      pub: pubKey,
      priv: privKey
    };

    client = Trace("test", key);
    payload = client.create({ data: "test" });
  });

  it("should throw when no key is set", () => {
    client.key = null;
    const fn = () => client.sign(payload);
    expect(fn).to.throw("A key must be set to sign a payload");
  });

  it("should throw payload is ill-formatted", () => {
    const fn = () => client.sign({});
    expect(fn).to.throw("A payload must contains a non-null 'data' field");
  });

  it("should throw if key is not ECDSA-compatible", () => {
    client.key.type = "wrong";
    const fn = () => client.sign(payload);
    expect(fn).to.throw("wrong : Unhandled key type");
  });

  it("should add a signature to a payload", () => {
    const signedPayload = client.sign(payload);
    expect(signedPayload.signatures.length).to.equal(1);
  });

  it("should work when the payload has alredy been signed", () => {
    const fn = () => client.sign(payload);
    expect(fn().signatures.length).to.equal(1);
    expect(fn().signatures.length).to.equal(2);
  });

  it("the signature can be verified with the public key", () => {
    const signedPayload = client.sign(payload);
    expect(signedPayload.signatures.length).to.equal(1);
    const signature = signedPayload.signatures[0];
    const bytes = Buffer.from(stringify(payload.payload));
    const paddedBytes = Buffer.concat([
      bytes,
      Buffer.alloc(32 - bytes.length % 32)
    ]);
    expect(secp256k1.verify(paddedBytes, signature.sig, key.pub)).to.be.true;
  });
});
