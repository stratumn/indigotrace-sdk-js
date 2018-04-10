import { expect } from 'chai';
import sinon from 'sinon';

import makeSdk from './';
import { ROUTE_SDK_TRACES } from './constants';
import * as validate from './validate';
import * as request from './request';
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

describe('Trace', () => {
  let sdk;
  let requestWithOptsStub;
  const validateStub = sinon.stub(validate, 'default');
  const requestStub = sinon.stub(request, 'default');
  const key = { keyPath: 'key.pem', crtPath: 'crt.pem' };

  beforeEach(() => {
    readFileSyncStub.resetHistory();
    loadKeyStub.resetHistory();

    sdk = makeSdk(key);
    requestWithOptsStub = sinon.stub(sdk, 'requestWithOpts');

    expect(readFileSyncStub).to.have.been.calledThrice;
    expect(loadKeyStub).to.have.been.calledOnce;
    validateStub.resetHistory();
    requestStub.resetHistory();
  });

  it('#getTraces() should send a GET request', () => {
    sdk.getTraces();
    expect(requestWithOptsStub).to.have.been.calledOnce;
    expect(requestWithOptsStub).to.have.been.calledWith(
      'get',
      ROUTE_SDK_TRACES
    );
  });

  it('#getTrace() should send a GET request', () => {
    sdk.getTrace('foo');
    expect(requestWithOptsStub).to.have.been.calledOnce;
    expect(requestWithOptsStub).to.have.been.calledWith(
      'get',
      `${ROUTE_SDK_TRACES}/foo`
    );
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
    expect(requestWithOptsStub).to.have.been.calledOnce;
    expect(requestWithOptsStub).to.have.been.calledWith(
      'post',
      ROUTE_SDK_TRACES,
      data
    );
    expect(validateStub).to.have.been.calledOnce;
  });

  it('#send() should send a POST request when a traceID is provided', () => {
    validateStub.returns({ valid: true });
    const data = { payload: { something: 'important', traceID: 'foo-bar' } };
    sdk.send(data);
    expect(requestWithOptsStub).to.have.been.calledOnce;
    expect(requestWithOptsStub).to.have.been.calledWith(
      'post',
      `${ROUTE_SDK_TRACES}/foo-bar`,
      data
    );
    expect(validateStub).to.have.been.calledOnce;
  });

  it('should pass baseURL to requests', () => {
    const sdkWithUrl = makeSdk({ APIUrl: 'foo/bar' });
    expect(sdkWithUrl.APIUrl).to.be.equal('foo/bar');

    requestStub.resolves(Promise.resolve('hello'));

    sdkWithUrl.requestWithOpts('post', '/route').then(() => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub.getCall(0).args[2].baseURL).to.be.equal('foo/bar');
    });
  });
});
