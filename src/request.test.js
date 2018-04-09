// import chai, { expect } from 'chai';
// import sinonChai from 'sinon-chai';
// import sinon from 'sinon';
// import axios from 'axios';

// import request from './request';

// const requestStub = sinon.stub(axios, 'request').resolves({ data: 'data' });
// chai.use(sinonChai);

// describe('request', () => {
//   beforeEach(() => {
//     requestStub.resetHistory();
//   });

//   it('has correct config', () =>
//     request('post', '/route').then(data => {
//       expect(requestStub).to.have.been.calledOnce;
//       expect(requestStub).to.have.been.calledWith({
//         url: '/route',
//         method: 'post',
//         headers: { 'Content-Type': 'application/json' }
//       });
//       expect(data).to.equal('data');
//     }));

//   it('sets data when called with data option', () =>
//     request('post', '/route', { data: 'body' }).then(data => {
//       expect(requestStub).to.have.been.calledOnce;
//       expect(requestStub).to.have.been.calledWith({
//         url: '/route',
//         method: 'post',
//         data: 'body',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//       expect(data).to.equal('data');
//     }));

//   it('sets data when called with data option', () =>
//     request('get', '/route', { baseURL: 'foo/bar' }).then(() => {
//       expect(requestStub).to.have.been.calledOnce;
//       expect(requestStub).to.have.been.calledWith({
//         baseURL: 'foo/bar',
//         url: '/route',
//         method: 'get',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//     }));
// });
