import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import makeSdk from './';
import * as request from './request';
import { ROUTE_SDK_TRACES } from './constants';

chai.use(sinonChai);

describe('Trace', () => {
  let sdk;
  const getStub = sinon.stub(request, 'getRequest');
  const postStub = sinon.stub(request, 'postRequest');

  beforeEach(() => {
    const url = 'foo/bar';
    const key = 'pubKey';
    sdk = makeSdk(url, key);
    getStub.reset();
    postStub.reset();
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

  it('#send() should send a POST request when no traceID is provided', () => {
    const payload = { something: 'important' };
    sdk.send(payload);
    expect(postStub).to.have.been.calledOnce;
    expect(postStub).to.have.been.calledWith(ROUTE_SDK_TRACES, payload);
  });

  it('#send() should send a POST request when a traceID is provided', () => {
    const payload = { something: 'important', traceID: 'foo-bar' };
    sdk.send(payload);
    expect(postStub).to.have.been.calledOnce;
    expect(postStub).to.have.been.calledWith(
      `${ROUTE_SDK_TRACES}/foo-bar`,
      payload
    );
  });
});
