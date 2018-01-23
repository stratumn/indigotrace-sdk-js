import nacl from 'tweetnacl';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import makeSdk from './';
import * as request from './request';
import { ROUTE_SDK_TRACES } from './constants';
import * as validate from './validate';

const fromSecretKeyStub = sinon
  .stub(nacl.sign.keyPair, 'fromSecretKey')
  .returns({ secretKey: 'test', publicKey: 'test' });
chai.use(sinonChai);

describe('Trace', () => {
  let sdk;
  const getStub = sinon.stub(request, 'getRequest');
  const postStub = sinon.stub(request, 'postRequest');
  const validateStub = sinon.stub(validate, 'default');

  beforeEach(() => {
    const url = 'foo/bar';
    const key = { type: 'ed25519', secret: 'test' };
    fromSecretKeyStub.resetHistory();

    sdk = makeSdk(url, key);
    expect(fromSecretKeyStub).to.have.been.calledOnce;
    getStub.reset();
    postStub.reset();
    validateStub.reset();
  });

  it('#getTraces() should send a GET request', () => {
    sdk.getTraces();
    expect(getStub).to.have.been.calledOnce;
    expect(getStub).to.have.been.calledWith(ROUTE_SDK_TRACES);
  });

  it('#getTrace() should send a GET request', () => {
    sdk.getTrace('foo');
    expect(getStub).to.have.been.calledOnce;
    expect(getStub).to.have.been.calledWith(`${ROUTE_SDK_TRACES}/foo`);
  });

  it('#send() should throw if data is invalid', () => {
    validateStub.returns({
      valid: false,
      error: 'Something terrible happened!'
    });
    expect(sdk.send).to.throw(
      'Data is not valid: Something terrible happened!'
    );
    expect(validateStub).to.have.been.calledOnce;
  });

  it('#send() should send a POST request when no traceID is provided', () => {
    validateStub.returns({ valid: true });
    const data = { payload: { something: 'important' } };
    sdk.send(data);
    expect(postStub).to.have.been.calledOnce;
    expect(postStub).to.have.been.calledWith(ROUTE_SDK_TRACES, data);
    expect(validateStub).to.have.been.calledOnce;
  });

  it('#send() should send a POST request when a traceID is provided', () => {
    validateStub.returns({ valid: true });
    const data = { payload: { something: 'important', traceID: 'foo-bar' } };
    sdk.send(data);
    expect(postStub).to.have.been.calledOnce;
    expect(postStub).to.have.been.calledWith(
      `${ROUTE_SDK_TRACES}/foo-bar`,
      data
    );
    expect(validateStub).to.have.been.calledOnce;
  });
});
