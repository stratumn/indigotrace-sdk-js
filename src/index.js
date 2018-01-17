import isUUID from "validator/lib/isUUID";
import secp256k1 from "secp256k1";

import { JSONToPaddedBuffer } from "./utils";

const handledKeyFormats = ["ECDSA"];

function authenticate() {}

function getTraces() {}

function isHandledAlg(alg) {
  return handledKeyFormats.includes(alg);
}

class Trace {
  /**
   * Creates an instance of the SDK.
   * @param {string} url - url of the API (eg: https://indigotrace.com)
   * @param {Key} key -  a key object to authenticate the user on the trace platform
   * @param {string} key.type - the type of the signature (eg: "ed25519", "ecdsa", "dsa") (case insensitive).
   * @param {string} key.priv - the private key. It is used to derive the public key and to sign the payload.
   * @param {string} [key.pub] - the public key (optional). If provided, the public key will not be derived from the private one.
   * @returns {Trace} - an trace SDK
   */
  constructor(url, key) {
    // the oracle needs to authenticate on the tracy API by solving a challenge.
    // The token should be sent in the "Authorization" header alongside sent requests.
    this.APiKey = authenticate(key);
    this.key = key;
    // list of traces belonging to the workflow linked to the oracle's public key
    this.traces = getTraces();
  }

  /**
   * Get information about the oracle's workflow.
   * @returns {Promise} - a promise that resolves with a list of traces
   */
  getTraces() {}

  /**
   * Get information about a trace.  To prove the oracle identity, a key object should be passed.
   * @param {string} traceID - uuid of a trace
   * @returns {Promise} - a promise that resolves with a list of the trace's events
   */
  getTrace(traceID) {}

  /**
   * Creates a payload
   * @param {object} data - some arbitrary data, can be any JSONifyable object
   * @param {object} [opts] - options
   * @param {object} [opts.traceID] - uuid of the trace. This corresponds to link.meta.mapId. If not provided, a new trace will be created.
   * @param {[]string} [opts.refs] - list of linkHashes to which the payload references to
   * @returns {Payload} - a serialized payload
   */
  create(data, opts) {
    if (!data) {
      throw new Error("A payload cannot be null");
    }
    let obj = {
      payload: {
        data: data
      },
      signatures: []
    };

    if (opts) {
      if (opts.refs && !(opts.refs instanceof Array)) {
        throw new Error("opts.refs must be an array");
      } else if (opts.traceID && !isUUID(opts.traceID, 4)) {
        throw new Error(`opts.traceID must be an UUID, got ${opts.traceID}`);
      }

      obj.payload = Object.assign(obj.payload, {
        traceID: opts.traceID,
        refs: opts.refs
      });
    }

    return obj;
  }

  /**
   * Signs a payload
   * @param {Payload} payload - a serialized payload
   * @returns {SignedPayload} - a signed payload (contains a 'signatures' field)
   */
  sign(payload) {
    if (!this.key || !this.key.pub || !this.key.priv) {
      throw new Error("A key must be set to sign a payload");
    } else if (!isHandledAlg(this.key.type)) {
      throw new Error(`${this.key.type} : Unhandled key type`);
    } else if (!payload || !payload.payload || !payload.payload.data) {
      throw new Error("A payload must contains a non-null 'data' field");
    }

    const bytes = JSONToPaddedBuffer(payload.payload);
    const signObj = secp256k1.sign(bytes, this.key.priv);
    payload.signatures.push({
      type: this.key.type,
      pubKey: this.key.pub,
      sig: signObj.signature
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
  send(payload) {}

  /**
   * Verifies the signature of a payload
   * @param {SignedPayload} payload - payload containing data, traceID and signature
   * @returns {bool} - true if the verification succeeded, false otherwise
   */
  verify(payload) {}
}

export default function Trace(url, pubKey) {
  return new Trace(url, pubKey);
}
