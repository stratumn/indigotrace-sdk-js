import nacl from 'tweetnacl';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import Trace from '../src/';

chai.use(sinonChai);

const signStub = sinon.stub(nacl, 'sign').returns(new Uint8Array());
const fromSecretKeyStub = sinon
  .stub(nacl.sign.keyPair, 'fromSecretKey')
  .returns({ secretKey: 'test', publicKey: 'test' });

describe('Sign', () => {
  let client;
  let key;
  let payload;

  beforeEach(() => {
    signStub.resetHistory();
    fromSecretKeyStub.resetHistory();

    key = {
      type: 'ed25519',
      secret: 'test'
    };

    client = Trace(key);
    expect(fromSecretKeyStub).to.have.been.calledOnce;
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
    expect(signedPayload.signatures.length).to.equal(1);
    expect(signStub).to.have.been.calledOnce;
  });

  it('should work when the payload has alredy been signed', () => {
    const fn = () => client.sign(payload);
    expect(fn().signatures.length).to.equal(1);
    expect(signStub).to.have.been.calledOnce;
    expect(fn().signatures.length).to.equal(2);
    expect(signStub).to.have.been.calledTwice;
  });
});
