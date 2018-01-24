import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import axios from 'axios';

import request from './request';

const requestStub = sinon.stub(axios, 'request').resolves({ data: 'data' });
chai.use(sinonChai);

describe('request', () => {
  beforeEach(() => {
    requestStub.resetHistory();
  });

  it('has correct config', done => {
    request('post', '/route').then(data => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub).to.have.been.calledWith({
        url: '/route',
        method: 'post',
        headers: { 'Content-Type': 'application/json' }
      });
      expect(data).to.equal('data');
      done();
    });
  });

  it('has sets the Authorization header when called with auth option', done => {
    request('post', '/route', { auth: 'pass' }).then(data => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub).to.have.been.calledWith({
        url: '/route',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'pass'
        }
      });
      expect(data).to.equal('data');
      done();
    });
  });

  it('has sets the Authorization header when called with auth option', done => {
    request('post', '/route', { body: 'body' }).then(data => {
      expect(requestStub).to.have.been.calledOnce;
      expect(requestStub).to.have.been.calledWith({
        url: '/route',
        method: 'post',
        body: 'body',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(data).to.equal('data');
      done();
    });
  });
});
