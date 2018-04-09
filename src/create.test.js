import fs from 'fs';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import Trace from '../src/';
import * as rsa from './rsa';

// console.log(fs);

const readFileSyncStub = sinon
  .stub(fs, 'readFileSync')
  .returns(Buffer.from('any'));

const loadKeyStub = sinon.stub(rsa, 'loadKey').resolves({
  public: {
    marshal() {
      return Buffer.from('publicKey');
    }
  }
});

chai.use(sinonChai);

describe('Create', () => {
  it.only('test', () => {
    const client = Trace({ keyPath: 'key.pem', crtPath: 'crt.pem' });
    // expect(readFileSyncStub).to.have.been.calledThrice;
    expect(loadKeyStub).to.have.been.calledTwice();
    expect(true);
  });

  // it('should throw when data is null', () => {
  //   const nullDataFn = () => client.create(null);
  //   expect(nullDataFn).to.throw('A payload cannot be null');
  // });

  // it('should serialize a payload', () => {
  //   const data = {
  //     test: 'test',
  //     other: 'other'
  //   };
  //   const expected = {
  //     payload: {
  //       data: data,
  //       trace_id: '',
  //       refs: null
  //     },
  //     signatures: []
  //   };
  //   const goodDataFn = () => client.create(data);
  //   expect(goodDataFn()).to.deep.equal(expected);
  // });

  // it('should serialize a payload with traceID and refs', () => {
  //   const data = {
  //     test: 'test',
  //     other: 'other'
  //   };
  //   const options = {
  //     traceID: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  //     refs: ['ref1', 'ref2']
  //   };
  //   const expected = {
  //     payload: {
  //       data: data,
  //       trace_id: '416ac246-e7ac-49ff-93b4-f7e94d997e6b',
  //       refs: ['ref1', 'ref2']
  //     },
  //     signatures: []
  //   };
  //   const goodDataFn = () => client.create(data, options);
  //   expect(goodDataFn()).to.deep.equal(expected);
  // });

  // it('should throw when options traceID is wrong', () => {
  //   const data = {
  //     test: 'test',
  //     other: 'other'
  //   };
  //   const options = {
  //     traceID: 'notID'
  //   };
  //   const badOptsFn = () => client.create(data, options);
  //   expect(badOptsFn).to.throw('opts.traceID must be an UUID');
  // });

  // it('should throw when options refs are wrong', () => {
  //   const data = {
  //     test: 'test',
  //     other: 'other'
  //   };
  //   const options = {
  //     refs: 'wrong'
  //   };
  //   const badOptsFn = () => client.create(data, options);
  //   expect(badOptsFn).to.throw('opts.refs must be an array');
  // });
});
