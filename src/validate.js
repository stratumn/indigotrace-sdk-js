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
          type: 'array'
        },
        traceID: { type: 'string' }
      },
      required: ['data'],
      additionalProperties: false
    },
    signatures: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string'
          },
          pubKey: {
            type: 'string'
          },
          sig: {
            type: 'string'
          }
        },
        required: ['type', 'pubKey', 'sig'],
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
