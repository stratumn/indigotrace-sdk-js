import { expect } from 'chai';
import sinon from 'sinon';
import Trace from '../src/';
import * as rsa from './rsa';
import * as utils from './utils';

const readFileSyncStub = sinon.stub(utils, 'readFileSync').returns('any');
const loadKeyStub = sinon.stub(rsa, 'loadKey').resolves({
  public: {
    marshal() {
      return Buffer.from('publicKey');
    }
  }
});
const signStub = sinon.stub(rsa, 'sign').resolves({
  algorithm: 't',
  public_key: 'p',
  signature: 's'
});

describe('Sign', () => {
  let client;
  let args;
  let payload;

  beforeEach(() => {
    signStub.resetHistory();
    readFileSyncStub.resetHistory();
    loadKeyStub.resetHistory();

    args = {
      keyPath: 'key.pem',
      crtPath: 'crt.pem'
    };

    client = Trace(args);

    expect(readFileSyncStub).to.have.been.calledThrice;
    expect(loadKeyStub).to.have.been.calledOnce;

    payload = client.create({ data: 'test' });
  });

  it('should throw when no key is set', () => {
    client.key = null;
    const fn = () => client.sign(payload);
    expect(fn).to.throw('A key must be set to sign a payload');
    expect(signStub).not.to.have.been.calledOnce;
  });

  it('should throw payload is ill-formatted', () => {
    const fn = () => client.sign({});
    expect(fn).to.throw("A payload must contains a non-null 'data' field");
    expect(signStub).not.to.have.been.calledOnce;
  });

  it('should add a signature to a payload', () => {
    const signedPayload = client.sign(payload);
    return signedPayload.then(p => {
      expect(p.signatures).to.have.lengthOf(1);
    });
  });

  it('should work when the payload has alredy been signed', () => {
    const signedPayload = client.sign(payload);
    return signedPayload.then(p => {
      client.sign(p).then(p2 => {
        expect(p2.signatures).to.have.lengthOf(2);
      });
    });
  });
});
