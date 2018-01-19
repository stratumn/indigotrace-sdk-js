import Trace from '../src/';
import * as validate from './validate';

const mockVerify = jest.fn();
const mockKeyFromPublic = jest.fn().mockReturnValue({ verify: mockVerify });
jest.mock('elliptic', () => ({
  ec: class {
    keyFromPublic(x) {
      return mockKeyFromPublic(x);
    }
    keyFromPrivate() {}
  }
}));

const mockValidate = jest.fn();
validate.default = mockValidate;

describe('Sign', () => {
  let client;
  let key;

  beforeEach(() => {
    mockVerify.mockClear().mockReturnValue(true);
    mockValidate.mockClear().mockReturnValue({ valid: true });

    key = {
      type: 'ECDSA',
      priv: 'test'
    };

    client = Trace('test', key);
  });

  it('should throw when data has invalid format', () => {
    mockValidate.mockReturnValue({ valid: false, error: 'foo' });
    expect(client.verify).not.toThrow('Data is not valid: foo ');
    expect(mockValidate.mock.calls.length).toBe(1);
  });

  it('should return false when no signatures', () => {
    const verified = client.verify({ payload: {}, signatures: [] });
    expect(verified).toBe(false);
  });

  it('should throw when signature type is not supported', () => {
    const verify = () =>
      client.verify({ payload: {}, signatures: [{ type: 'foo' }] });
    expect(verify).toThrow('foo : Unhandled key type');
  });

  it('should return true when all signatures are verified', () => {
    const verified = client.verify({
      payload: {},
      signatures: [
        { type: 'ECDSA', pubKey: 'fooPubKey', sig: 'fooSig' },
        { type: 'ECDSA', pubKey: 'barPubKey', sig: 'barSig' }
      ]
    });
    expect(verified).toBe(true);
    expect(mockKeyFromPublic.mock.calls.length).toBe(2);
    expect(mockKeyFromPublic.mock.calls[0][0]).toBe('fooPubKey');
    expect(mockKeyFromPublic.mock.calls[1][0]).toBe('barPubKey');
    expect(mockVerify.mock.calls.length).toBe(2);
    expect(mockVerify.mock.calls[0][1]).toBe('fooSig');
    expect(mockVerify.mock.calls[1][1]).toBe('barSig');
  });

  it('should return false when one signature is not verified', () => {
    mockVerify.mockReturnValueOnce(false);
    const verified = client.verify({
      payload: {},
      signatures: [
        { type: 'ECDSA', pubKey: 'fooPubKey', sig: 'fooSig' },
        { type: 'ECDSA', pubKey: 'barPubKey', sig: 'barSig' }
      ]
    });
    expect(verified).toBe(false);
  });
});
