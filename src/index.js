import fs from 'fs';
import isUUID from 'validator/lib/isUUID';
import { stringify } from 'canonicaljson';

import request from './request';
import {
  ROUTE_SDK_TRACES,
  API_URL,
  KEY_PATH,
  RSA_WITH_SHA256
} from './constants';
import validate from './validate';
import { verify as verifyRSA, loadKey } from './rsa';

class Trace {
  /**
   * Creates an instance of the SDK.
   * @param {string} [APIUrl] -  the API base url to use for the requests (defaults to constants.API_URL)
   * @returns {Trace} - a trace SDK
   */
  constructor(APIUrl = API_URL) {
    this.key = new Promise(resolve => {
      loadKey(fs.readFileSync(KEY_PATH, 'utf-8'))
        .then(key => {
          const privKey = key;
          const pubKey = key.public.marshal().toString('base64');

          resolve({ privKey, pubKey });
        })
        .catch(err => {
          throw new Error(err);
        });
    });

    this.APIUrl = APIUrl;
  }

  /**
   * Makes a request to the api with the APIKey. If the APIKey
   * is not yet set it will make an athentication call using the
   * key and set the response to the APIKey before making the
   * desired api call.
   * @param {string} method -  http method for the api call
   * @param {string} route - the route to make the call to
   * @param {object} [data] - the json body to include in the request
   * @returns {Promise} - a Promise that resolves to an api call
   */
  requestWithOpts(method, route, data = null) {
    return request(method, route, { data, baseURL: this.APIUrl });
  }

  /**
   * Get information about the oracle's workflow.
   * @returns {Promise} - a promise that resolves with a list of traces
   */
  getTraces() {
    return this.requestWithOpts('get', ROUTE_SDK_TRACES);
  }

  /**
   * Get information about a trace.  To prove the oracle identity, a key object should be passed.
   * @param {string} traceID - uuid of a trace
   * @returns {Promise} - a promise that resolves with a list of the trace's events
   */
  getTrace(traceID) {
    const route = `${ROUTE_SDK_TRACES}/${traceID}`;
    return this.requestWithOpts('get', route);
  }

  /**
   * Creates a payload
   * @param {object} data - some arbitrary data, can be any JSONifyable object
   * @param {object} [opts] - options
   * @param {object} [opts.traceID] - uuid of the trace. This corresponds to link.meta.mapId. If not provided, a new trace will be created.
   * @param {[]string} [opts.refs] - list of linkHashes to which the payload references to
   * @returns {Payload} - a serialized payload
   */
  create(data, opts = {}) {
    if (!data) {
      throw new Error('A payload cannot be null');
    }
    const obj = {
      payload: {
        data: data
      },
      signatures: []
    };

    if (opts) {
      if (opts.refs && !(opts.refs instanceof Array)) {
        throw new Error('opts.refs must be an array');
      } else if (opts.traceID && !isUUID(opts.traceID, 4)) {
        throw new Error(`opts.traceID must be an UUID, got ${opts.traceID}`);
      }

      obj.payload = {
        ...obj.payload,
        trace_id: opts.traceID || '',
        refs: opts.refs || null
      };
    }

    return obj;
  }

  /**
   * Signs a payload
   * @param {Payload} payload - a serialized payload
   * @returns {SignedPayload} - a signed payload (contains a 'signatures' field)
   */
  sign(payload) {
    if (!this.key) {
      throw new Error('A key must be set to sign a payload');
    } else if (!payload || !payload.payload || !payload.payload.data) {
      throw new Error("A payload must contains a non-null 'data' field");
    }

    // serialize payload using canonicaljson
    const bytes = Buffer.from(stringify(payload.payload));

    return new Promise((resolve, reject) => {
      this.key.then(k => {
        k.privKey.sign(bytes, (err, sig) => {
          if (err !== null) {
            reject(err);
          }

          payload.signatures.push({
            algorithm: RSA_WITH_SHA256,
            public_key: k.pubKey,
            signature: sig.toString('base64')
          });

          resolve(payload);
        });
      });
    });
  }

  /**
   * Creates a payload and signs it
   * @param {object} data - some arbitrary data, can be any JSONifyable object
   * @param {object} [opts] - options
   * @param {object} [opts.traceID] - uuid of the trace. This corresponds to link.meta.mapId. If not provided, a new trace will be created.
   * @param {[]string} [opts.refs] - list of linkHashes (other identifier ?) to which the payload references to
   * @returns {SignedPayload} - a serialized and signed payload
   */
  createAndSign(data, opts) {
    const payload = this.create(data, opts);
    return this.sign(payload);
  }

  /**
   * Sends a signed payload to the API
   * @param {SignedPayload} payload - payload containing data, traceID and signature
   * @returns {Promise} - a promise that resolves with a trace-ified array of events on which we can chain calls
   */
  send(data) {
    // check the data is valid before sending it
    const { valid, error } = validate(data);
    if (!valid) {
      throw new Error(`Data is not valid: ${error}`);
    }

    const { payload: { traceID } } = data;
    const route = traceID ? `${ROUTE_SDK_TRACES}/${traceID}` : ROUTE_SDK_TRACES;
    return this.requestWithOpts('post', route, data);
  }

  /**
   * Verifies the signature of a payload
   * @param {SignedPayload} payload - payload containing data, traceID and signature
   * @returns {bool} - true if the verification succeeded, false otherwise
   */
  verify(data) {
    // check the data is valid before verifying it
    const { valid, error } = validate(data);
    if (!valid) {
      throw new Error(`Data is not valid: ${error}`);
    }

    const { payload, signatures } = data;
    const msgBytes = Buffer.from(stringify(payload));

    let verified = true;
    signatures.forEach(s => {
      const { algorithm, public_key: publicKey, signature } = s;

      const pkBytes = Buffer.from(publicKey, 'base64');
      const sigBytes = Buffer.from(signature, 'base64');

      switch (algorithm) {
        case RSA_WITH_SHA256:
          verified = verifyRSA(pkBytes, sigBytes, msgBytes);
          break;
        default:
          throw new Error('unhandled signature algorithm');
      }
    });

    return verified;
  }
}

export default function(APIUrl = API_URL) {
  return new Trace(APIUrl);
}
