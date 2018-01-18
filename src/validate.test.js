import { expect } from 'chai';
import validateSignedPayload from './validate';

describe('#validateSignedPayload()', () => {
  it('return errors on invalid data', () => {
    let result;

    result = validateSignedPayload();
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data should be object');

    result = validateSignedPayload({});
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data should have required property 'payload'"
    );

    result = validateSignedPayload({
      payload: {}
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data.payload should have required property 'data'"
    );

    result = validateSignedPayload({
      payload: {
        data: {}
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data should have required property 'signatures'"
    );

    result = validateSignedPayload({
      payload: {
        data: {}
      },
      signatures: []
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data.signatures should NOT have less than 1 items'
    );

    result = validateSignedPayload({
      payload: {
        data: {}
      },
      signatures: [{}]
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data.signatures[0] should have required property 'type'"
    );

    result = validateSignedPayload({
      payload: {
        data: 'a'
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.data should be object');

    result = validateSignedPayload({
      payload: {
        data: {},
        refs: true
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.refs should be array');

    result = validateSignedPayload({
      payload: {
        data: {},
        refs: [],
        traceID: 1
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.traceID should be string');

    result = validateSignedPayload({
      payload: {
        data: {}
      },
      signatures: [{ type: '', pubKey: '', sig: '' }],
      test: {}
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data should NOT have additional properties'
    );

    result = validateSignedPayload({
      payload: {
        data: {}
      },
      signatures: [{ type: '', pubKey: '', sig: '', test: '' }]
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data.signatures[0] should NOT have additional properties'
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        test: ''
      },
      signatures: [{ type: '', pubKey: '', sig: '' }]
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data.payload should NOT have additional properties'
    );
  });

  it('validates when data is correct', () => {
    const result = validateSignedPayload({
      payload: {
        data: {},
        refs: [],
        traceID: 'abc'
      },
      signatures: [
        {
          type: 'foo',
          pubKey: 'bar',
          sig: 'foo+bar'
        }
      ]
    });
    expect(result.valid).to.be.true;
  });
});
