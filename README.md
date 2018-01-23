# trace-sdk-js

This javascript module exposes function to communicate with the Trace API.

## Usage

```javascript
import Trace from "trace-sdk-js";

// Your key should be retrieved from an environment variable or an other secure store.
// The public key will be derived from its private key.
// The 'secret' field must be an base64-encoded string of 64 bytes.
myKey = {
  type: "ed25519",
  secret:
    "VD6zmq068l1EhaWfpRQxnlpTjGbwSN2q2XcgriBmo3Mco+7GK+BPLO49yxuQzbQ1dzd/6B+3YQb2c3BhqEaTsA=="
};

// Initialize the SDK with the API's URL
trace = Trace("https://indigotrace.com", myKey);

// This is an example of data we want to send to Trace
data = {
  type: "test",
  data: "data",
  name: "name"
};

// Create a payload containing our data
// Since we omit the traceID, it will instanciate a new trace.
payload = trace.create(data);

// Sign the payload before sending it
signedPayload = trace.sign(payload);

// Finally, you can send the payload to the trace API.
// Before sending it, it will ensure that the fields (payload, signature) are present.
trace.send(payload);

// PAYLOAD FORMAT
// {
//   payload: {
//     data: {
//       type: "test",
//       data: "data",
//       name: "name"
//     },
//     refs: ["ref2", "ref2"],
//     traceID: "db255d6d-8e7f-45e6-99f8-cf9f1084ba9b"
//   },
//   signatures: [{
//     type: "ed25519",
//     pubKey: "EXAMPLEPUBLICKEY123",
//     sig: "signedpayload"
//   }]
// };
```
