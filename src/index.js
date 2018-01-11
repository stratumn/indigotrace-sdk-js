/**
 * Creates an instance of the SDK.
 * @param {string} url - url of the API (eg: https://indigotrace.com)
 * @param {Key} key -  a key object to authenticate the user on the trace platform
 * @param {string} key.type - the type of the signature (eg: "ed25519", "ecdsa", "dsa") (case insensitive).
 * @param {string} key.priv - the private key. It is used to derive the public key and to sign the payload.
 * @param {string} [key.pub] - the public key (optional). If provided, the public key will not be derived from the private one.
 * @returns {Trace} - an trace SDK
 */
export default function Trace(url, key) {
  // the oracle needs to authenticate on the tracy API by solving a challenge.
  // The token should be sent int the "Authorization" header alongside sent requests.
  let APIkey = authenticate(key);

  // list of traces belonging to the workflow linked to the oracle's public key
  let traces = getTraces();

  function authenticate() {}

  function getTraces() {}

  return {
    /**
     * Get information about the oracle's workflow.
     * @returns {Promise} - a promise that resolves with a list of traces
     */
    getTraces() {},

    /**
     * Get information about a trace.  To prove the oracle identity, a key object should be passed.
     * @param {string} traceID - uuid of a trace
     * @returns {Promise} - a promise that resolves with a list of the trace's events
     */
    getTrace(traceID) {},

    /**
     * Creates a payload and signs it
     * @param {object} data - some arbitrary data, can be any JSONifyable object
     * @param {object} [opts] - options
     * @param {object} [opts.traceID] - uuid of the trace. This corresponds to link.meta.mapId. If not provided, a new trace will be created.
     * @param {[]string} [opts.refs] - list of linkHashes (other identifier ?) to which the payload references to
     * @returns {Payload} - an properly serialized payload ready to be signed
     */
    create(data, opts) {},

    /**
     * Sends a signed payload to the API
     * @param {SignedPayload} payload - payload containing data, traceID and signature
     * @returns {Promise} - a promise that resolves with a trace-ified array of events on which we can chain calls
     */
    send(payload) {}
  };
}
