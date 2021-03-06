import nacl from 'tweetnacl';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import makeSdk from './';
import { ROUTE_SDK_TRACES, ROUTE_SDK_AUTH, API_URL } from './constants';
import * as validate from './validate';
import * as request from './request';

const fromSecretKeyStub = sinon
  .stub(nacl.sign.keyPair, 'fromSecretKey')
  .returns({ secretKey: 'test', publicKey: 'test' });
chai.use(sinonChai);

describe('Trace', () => {
  let sdk;
  let requestWithAuthStub;
  const validateStub = sinon.stub(validate, 'default');
  const requestStub = sinon.stub(request, 'default');
  const key = { type: 'ed25519', secret: 'test' };

  beforeEach(() => {
    fromSecretKeyStub.resetHistory();
    sdk = makeSdk(key);
    requestWithAuthStub = sinon.stub(sdk, 'requestWithAuth');
    expect(fromSecretKeyStub).to.have.been.calledOnce;
    validateStub.resetHistory();
    requestStub.resetHistory();
  });

  it('#authenticate() should send a POST request', () => {
    const expectedRequestArgs = [
      'post',
      ROUTE_SDK_AUTH,
      {
        baseURL: API_URL,
        data: {
          type: 'type',
          public_key: '12345',
          signature: 'signature'
        }
      }
    ];

    sdk.key.type = 'type';
    sdk.key.public64 = '12345';
    requestStub.returns('apiKey');
    sdk.authenticate();
    expect(requestStub).to.have.been.calledOnce;
    expect(requestStub).to.have.been.calledWith(...expectedRequestArgs);
    expect(sdk.APIKey).to.be.equal('apiKey');
  });

  it('#requestWithAuth() should authenticate when APIKey is falsey', done => {
    const expectedRequestArgs = [
      'post',
      '/route',
      {
        baseURL: API_URL,
        data: 'body',
        auth: 'apikey'
      }
    ];

    const authenticateStub = sinon.stub(sdk, 'authenticate').resolves('apikey');
    requestWithAuthStub.restore();
    sdk.requestWithAuth('post', '/route', 'body');
    expect(authenticateStub).to.have.been.calledOnce;
    requestStub.callsFake(() => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub).to.have.been.calledWith(...expectedRequestArgs);
      done();
    });
  });

  it('#requestWithAuth() should not authenticate when APIKey is set', done => {
    const expectedRequestArgs = [
      'post',
      '/route',
      {
        baseURL: API_URL,
        data: 'body',
        auth: 'apikey'
      }
    ];

    requestWithAuthStub.restore();
    sdk.APIKey = Promise.resolve('apikey');
    sdk.requestWithAuth('post', '/route', 'body');
    requestStub.callsFake(() => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub).to.have.been.calledWith(...expectedRequestArgs);
      done();
    });
  });

  it('#getTraces() should send a GET request', () => {
    sdk.getTraces();
    expect(requestWithAuthStub).to.have.been.calledOnce;
    expect(requestWithAuthStub).to.have.been.calledWith(
      'get',
      ROUTE_SDK_TRACES
    );
  });

  it('#getTrace() should send a GET request', () => {
    sdk.getTrace('foo');
    expect(requestWithAuthStub).to.have.been.calledOnce;
    expect(requestWithAuthStub).to.have.been.calledWith(
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
    expect(requestWithAuthStub).to.have.been.calledOnce;
    expect(requestWithAuthStub).to.have.been.calledWith(
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
    expect(requestWithAuthStub).to.have.been.calledOnce;
    expect(requestWithAuthStub).to.have.been.calledWith(
      'post',
      `${ROUTE_SDK_TRACES}/foo-bar`,
      data
    );
    expect(validateStub).to.have.been.calledOnce;
  });

  it('should pass baseURL to requests', () => {
    const sdkWithUrl = makeSdk(key, 'foo/bar');
    expect(sdkWithUrl.APIUrl).to.be.equal('foo/bar');
    const apiKeyPromise = Promise.resolve('apiKey');
    requestStub.resolves(apiKeyPromise);
    sdkWithUrl.requestWithAuth('post', '/route');
    return apiKeyPromise.then(() => {
      expect(requestStub).to.have.been.calledTwice;
      expect(requestStub.getCall(0).args[2].baseURL).to.be.equal('foo/bar');
      expect(requestStub.getCall(1).args).to.be.deep.equal([
        'post',
        '/route',
        { data: null, auth: 'apiKey', baseURL: 'foo/bar' }
      ]);
    });
  });
});
