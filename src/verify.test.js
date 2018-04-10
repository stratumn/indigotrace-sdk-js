import { expect } from 'chai';
import sinon from 'sinon';
import Trace from '../src/';
import * as validate from './validate';
import * as rsa from './rsa';
import * as utils from './utils';
import { RSA_WITH_SHA256 } from './constants';

const readFileSyncStub = sinon.stub(utils, 'readFileSync').returns('any');
const loadKeyStub = sinon.stub(rsa, 'loadKey').resolves({
  public: {
    marshal() {
      return Buffer.from('publicKey');
    }
  }
});
const verifyStub = sinon.stub(rsa, 'verify').returns(true);
const validateStub = sinon.stub(validate);

describe('Sign', () => {
  let client;
  let key;

  beforeEach(() => {
    readFileSyncStub.resetHistory();
    loadKeyStub.resetHistory();
    validateStub.default.reset();
    validateStub.default.returns({ valid: true });

    key = {
      keyPath: 'key.pem',
      crtPath: 'crt.pem'
    };

    client = Trace(key);
    expect(loadKeyStub).to.have.been.calledOnce;
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
        signatures: [{ algorithm: 'foo', public_key: 'bar', signature: 'baz' }]
      });
    expect(verify).to.throw('unhandled signature algorithm');
  });

  it('should return true when all signatures are verified', () => {
    verifyStub.returns(true);

    const payload = { data: { test: 'test' } };
    const verified = client.verify({
      payload: payload,
      signatures: [
        {
          algorithm: RSA_WITH_SHA256,
          public_key: 'fooPubKey',
          signature: 'fooSig'
        },
        {
          algorithm: RSA_WITH_SHA256,
          public_key: 'barPubKey',
          signature: 'barSig'
        }
      ]
    });
    expect(verified).to.be.true;
    expect(verifyStub).to.have.been.calledTwice;
    expect(verifyStub).to.be.calledWith(Buffer.from('fooPubKey', 'base64'));
    expect(verifyStub).to.be.calledWith(Buffer.from('barPubKey', 'base64'));
  });

  it('should return false when one signature is not verified', () => {
    verifyStub.returns(false);

    const verified = client.verify({
      payload: {},
      signatures: [
        {
          algorithm: RSA_WITH_SHA256,
          public_key: 'fooPubKey',
          signature: 'fooSig'
        },
        {
          algorithm: RSA_WITH_SHA256,
          public_key: 'barPubKey',
          signature: 'barSig'
        }
      ]
    });
    expect(verified).to.be.false;
  });
});
