import { expect } from 'chai';
import { stringify } from 'canonicaljson';

import Trace from '../src/';

jest.mock('elliptic', () => ({
  ec: class {
    constructor() {
      this.sign = jest.fn();
      this.verify = jest.fn();
    }

    keyFromPrivate() {
      return {
        sign: () => ({
          toDER: jest.fn().mockReturnValue('test')
        }),
        verify: jest.fn().mockReturnValue(true),
        getPublic: jest.fn().mockReturnValue('test')
      };
    }
  }
}));

describe('Sign', () => {
  let client;
  let key;
  let payload;

  beforeEach(() => {
    key = {
      type: 'ECDSA',
      priv: 'test'
    };

    client = Trace('test', key);
    payload = client.create({ data: 'test' });
  });

  it('should throw when no key is set', () => {
    client.key = null;
    const fn = () => client.sign(payload);
    expect(fn).to.throw('A key must be set to sign a payload');
  });

  it('should throw payload is ill-formatted', () => {
    const fn = () => client.sign({});
    expect(fn).to.throw("A payload must contains a non-null 'data' field");
  });

  it('should add a signature to a payload', () => {
    const signedPayload = client.sign(payload);
    expect(signedPayload.signatures.length).to.equal(1);
  });

  it('should work when the payload has alredy been signed', () => {
    const fn = () => client.sign(payload);
    expect(fn().signatures.length).to.equal(1);
    expect(fn().signatures.length).to.equal(2);
  });

  it('the signature can be verified with the public key', () => {
    const signedPayload = client.sign(payload);
    expect(signedPayload.signatures.length).to.equal(1);
    const signature = signedPayload.signatures[0];
    const bytes = Buffer.from(stringify(payload.payload));
    expect(client.key.priv.verify(bytes, signature.sig)).to.be.true;
  });
});
