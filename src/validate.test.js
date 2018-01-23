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
        data: {},
        trace_id: ''
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data.payload should have required property 'refs'"
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        refs: null
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data.payload should have required property 'trace_id'"
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: '',
        refs: null
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data should have required property 'signatures'"
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: '',
        refs: null
      },
      signatures: []
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data.signatures should NOT have less than 1 items'
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: '',
        refs: null
      },
      signatures: [{}]
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      "data.signatures[0] should have required property 'type'"
    );

    result = validateSignedPayload({
      payload: {
        data: 'a',
        trace_id: '',
        refs: null
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.data should be object');

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: '',
        refs: true
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.refs should be array,null');

    result = validateSignedPayload({
      payload: {
        data: {},
        refs: [],
        trace_id: 1
      }
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal('data.payload.trace_id should be string');

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: ''
      },
      signatures: [{ type: '', public_key: '', signature: '' }],
      test: {}
    });
    expect(result.valid).to.be.false;
    expect(result.error).to.be.equal(
      'data should NOT have additional properties'
    );

    result = validateSignedPayload({
      payload: {
        data: {},
        trace_id: '',
        refs: null
      },
      signatures: [{ type: '', public_key: '', signature: '', test: '' }]
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
      signatures: [{ type: '', public_key: '', signature: '' }]
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
        trace_id: 'abc'
      },
      signatures: [
        {
          type: 'foo',
          public_key: 'bar',
          signature: 'foo+bar'
        }
      ]
    });
    expect(result.valid).to.be.true;
  });
});
