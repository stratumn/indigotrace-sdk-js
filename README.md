# trace-sdk-js

This javascript module exposes function to communicate with the Trace API.

## Usage

```javascript
import Trace from "trace-sdk-js"

// Your key should be retrieved from an environment variable or an other secure store.
// If you do not provide the oracle's public key in the key object, it will be derived from its private key
myKey = {
  type: "ed25519",
  priv: "myprivatekey"
  pub: "mypublickey"
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
signedPayload = trace.sign(payload)

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
//     type: "ECDSA",
//     pubKey: "EXAMPLEPUBLICKEY123",
//     sig: "signedpayload"
//   }]
// };
```
