import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
  type: 'object',
  properties: {
    payload: {
      type: 'object',
      properties: {
        data: {
          type: 'object'
        },
        refs: {
          type: ['array', 'null']
        },
        trace_id: { type: 'string' }
      },
      required: ['data', 'refs', 'trace_id'],
      additionalProperties: false
    },
    signatures: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          algorithm: {
            type: 'string'
          },
          public_key: {
            type: 'string'
          },
          signature: {
            type: 'string'
          }
        },
        required: ['algorithm', 'public_key', 'signature'],
        additionalProperties: false
      }
    }
  },
  required: ['payload', 'signatures'],
  additionalProperties: false
};

export default data => {
  const valid = ajv.validate(schema, data);
  if (!valid) {
    return {
      valid,
      error: ajv.errorsText()
    };
  }
  return { valid };
};
