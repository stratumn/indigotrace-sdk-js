// import { expect } from 'chai';

import Trace from '../src/';

const mockToDER = jest.fn().mockReturnValue('test');
const mockVerify = jest.fn().mockReturnValue(true);
const mockSign = jest.fn().mockReturnValue({
  toDER: mockToDER
});
const mockEncode = jest.fn().mockReturnValue('hex');
const mockGetPublic = jest.fn().mockReturnValue({
  encode: mockEncode
});

jest.mock('elliptic', () => ({
  ec: class {
    keyFromPrivate() {
      return {
        sign: mockSign,
        verify: mockVerify,
        getPublic: mockGetPublic
      };
    }
  }
}));

describe('Sign', () => {
  let client;
  let key;
  let payload;

  beforeEach(() => {
    mockToDER.mockClear();
    mockVerify.mockClear();
    mockGetPublic.mockClear();
    mockSign.mockClear();

    key = {
      type: 'ECDSA',
      priv: 'test'
    };

    client = Trace('test', key);
    payload = client.create({ data: 'test' });
  });

  it('should throw when no key is set', () => {
    client.key = null;
    const fn = () => client.sign(payload);
    expect(fn).toThrow('A key must be set to sign a payload');
    expect(mockSign.mock.calls.length).toBe(0);
  });

  it('should throw payload is ill-formatted', () => {
    const fn = () => client.sign({});
    expect(fn).toThrow("A payload must contains a non-null 'data' field");
    expect(mockSign.mock.calls.length).toBe(0);
  });

  it('should add a signature to a payload', () => {
    const signedPayload = client.sign(payload);
    expect(signedPayload.signatures.length).toEqual(1);
    expect(mockSign.mock.calls.length).toEqual(1);
  });

  it('should work when the payload has alredy been signed', () => {
    const fn = () => client.sign(payload);
    expect(fn().signatures.length).toEqual(1);
    expect(mockSign.mock.calls.length).toEqual(1);
    expect(fn().signatures.length).toEqual(2);
    expect(mockSign.mock.calls.length).toEqual(2);
  });
});
