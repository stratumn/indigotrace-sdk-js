import nacl from 'tweetnacl';
import { stringify } from 'canonicaljson';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import Trace from '../src/';
import * as validate from './validate';

chai.use(sinonChai);

const verifyStub = sinon.stub(nacl.sign, 'open');
const fromSecretKeyStub = sinon
  .stub(nacl.sign.keyPair, 'fromSecretKey')
  .returns({ secretKey: 'test', publicKey: 'test' });

const validateStub = sinon.stub(validate);

describe('Sign', () => {
  let client;
  let key;

  beforeEach(() => {
    fromSecretKeyStub.resetHistory();
    validateStub.default.reset();
    validateStub.default.returns({ valid: true });

    key = {
      type: 'ed25519',
      secret: 'test'
    };

    client = Trace(key);
    expect(fromSecretKeyStub).to.have.been.calledOnce;
  });

  it('should throw when data has invalid format', () => {
    validateStub.default.returns({ valid: false, error: 'foo' });
    expect(client.verify).not.to.throw('Data is not valid: foo ');
    expect(validateStub.default).to.have.been.calledOnce;
  });

  it('should throw when signature type is not supported', () => {
    const verify = () =>
      client.verify({
        payload: { data: {} },
        signatures: [{ type: 'foo', pubKey: '', sig: '' }]
      });
    expect(verify).to.throw('foo : Unhandled key type');
  });

  it('should return true when all signatures are verified', () => {
    const payload = { data: { test: 'test' } };
    verifyStub.returns(stringify(payload));
    const verified = client.verify({
      payload: payload,
      signatures: [
        { type: 'ed25519', pubKey: 'fooPubKey', sig: 'fooSig' },
        { type: 'ed25519', pubKey: 'barPubKey', sig: 'barSig' }
      ]
    });
    expect(verified).to.be.true;
    expect(verifyStub).to.have.been.calledTwice;
    expect(verifyStub).to.be.calledWith('fooSig');
    expect(verifyStub).to.be.calledWith('barSig');
  });

  it('should return false when one signature is not verified', () => {
    verifyStub.returns(null);
    const verified = client.verify({
      payload: {},
      signatures: [
        { type: 'ed25519', pubKey: 'fooPubKey', sig: 'fooSig' },
        { type: 'ed25519', pubKey: 'barPubKey', sig: 'barSig' }
      ]
    });
    expect(verified).to.be.false;
  });
});
