/**
 * Creates an instance of the SDK.
 * @param {string} url - url of the API (eg: http://indigotrace.com)
 * @param {string} [pubKey] - optionally, you can specify the public key of your oracle
 * @returns {Trace} - an trace SDK
 */
export default function Trace(url, pubKey) {
  let workflow;

  if (pubKey) {
    workflow = getWorkflow(pubkey);
  }

  function getWorkflow(pubKey) {}

  return {
    /**
     * Get information about the oracle's workflow
     * @param {string} pubKey - the oracle's public key.
     * @returns {Workflow} - informations about the workflow : a list of traces, a list of participants
     */
    getWorkflow(pubKey) {},

    /**
     * Get information about a trace
     * @param {string} traceID - uuid of a trace
     * @returns {[]object} - list of the trace's steps
     */
    getTrace(traceID) {},

    /**
     * Creates an payload
     * @param {object} data - some arbitraty data, can be any JSONifyable object
     * @param {object} [opts] - options
     * @param {object} [opts.traceID] - uuid of the trace. This corresponds to link.meta.mapId. If not provided, a new trace will be created.
     * @param {[]string} [opts.refs] - list of linkHashes (other identifier ?) to which the payload references to
     * @returns {Payload} - an properly serialized payload ready to be signed
     */
    create(data, opts) {},

    /**
     * Signs a payload
     * @param {Payload} payload - a payload containing data
     * @param {Key} key - a key object used to sign the payload
     * @param {string} key.type - the type of the signature (eg: "ed25519", "ecdsa", "dsa") (case insensitive).
     * @param {string} key.priv - the private key. It is used to derive the public key and to sign the payload.
     * @param {string} [key.pub] - the public key (optional). If provided, the public key will not be derived from the private one.
     * @returns {SignedPayload} - a payload with a 'signatures' field
     */
    sign(payload, key) {},

    /**
     * Sends a signed payload to the API
     * @param {SignedPayload} payload - payload containing data, traceID and signature
     * @returns {Promise} - a promise that resolve with a trace-ified array of steps on which we can chain calls
     */
    send(payload) {}
  };
}
