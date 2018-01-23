import isUUID from 'validator/lib/isUUID';
import { sign } from 'tweetnacl';
import { stringify } from 'canonicaljson';

import { getRequest, postRequest } from './request';
import { ROUTE_SDK_TRACES } from './constants';
import validate from './validate';
import { encodeB64, decodeB64 } from './utils';

const handledKeyFormats = ['ed25519'];

function authenticate() {}

function getTraces() {}

function isHandledAlg(alg) {
  return handledKeyFormats.includes(alg.toLowerCase());
}

class Trace {
  /**
   * Creates an instance of the SDK.
   * @param {string} url - url of the API (eg: https://indigotrace.com)
   * @param {string} key -  a key object to authenticate the user on the trace platform
   * @param {string} key.type - the type of the signature (eg: "ed25519", "ecdsa", "dsa") (case insensitive).
   * @param {string} key.secret - the private key. It must be an base64-encoded string of 64 bytes. It is used to derive the public key and to sign the payload.
   * @returns {Trace} - an trace SDK
   */
  constructor(url, key) {
    // the oracle needs to authenticate on the tracy API by solving a challenge.
    // The token should be sent in the "Authorization" header alongside sent requests.
    this.APiKey = authenticate(key);
    // list of traces belonging to the workflow linked to the oracle's public key
    this.traces = getTraces();

    if (!isHandledAlg(key.type)) {
      throw new Error(`${key.type} : Unhandled key type`);
    } else if (!key.secret) {
      throw new Error("key object must have a 'secret' field");
    }
    const keyPair = sign.keyPair.fromSecretKey(decodeB64(key.secret));
    this.key = {
      ...key,
      secret: keyPair.secretKey,
      secret64: key.secret,
      public: keyPair.publicKey,
      public64: encodeB64(keyPair.publicKey)
    };
  }

  /**
   * Get information about the oracle's workflow.
   * @returns {Promise} - a promise that resolves with a list of traces
   */
  getTraces() {
    return getRequest(ROUTE_SDK_TRACES);
  }

  /**
   * Get information about a trace.  To prove the oracle identity, a key object should be passed.
   * @param {string} traceID - uuid of a trace
   * @returns {Promise} - a promise that resolves with a list of the trace's events
   */
  getTrace(traceID) {
    const route = `${ROUTE_SDK_TRACES}/${traceID}`;
    return getRequest(route);
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

    // sign the message and get the 64 first bytes
    const signedMessage = Buffer.from(sign(bytes, this.key.secret)).slice(
      0,
      sign.signatureLength
    );

    // encode the signature to base64
    const signature = encodeB64(signedMessage);

    payload.signatures.push({
      type: this.key.type,
      public_key: this.key.public64,
      signature: signature
    });
    return payload;
  }

  /**
   * Creates a payload ans signs it
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
    return postRequest(route, data);
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
    const bytes = Buffer.from(stringify(payload));

    let verified = true;
    signatures.forEach(s => {
      const { type, pubKey, sig } = s;
      if (!isHandledAlg(type)) {
        throw new Error(`${type} : Unhandled key type`);
      }
      const message = Buffer.from(sign.open(sig, decodeB64(pubKey)) || '');
      verified = verified && bytes.equals(message);
    });

    return verified;
  }
}

export default function(url, pubKey) {
  return new Trace(url, pubKey);
}
