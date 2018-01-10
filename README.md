# trace-sdk-js

This javascript module exposes function to communicate with the Trace API.

## Usage

```javascript
// Initialise the SDK with the API's URL
trace = Trace("http://indigotrace.com");


// This is an example of data we want to send to Trace
data = {
  type: "test",
  data: "data",
  name: "name"
};

// Create a payload containing our data
// Since we omit the traceID, it will instanciate a new trace.
payload = trace.create(data);

// Your key should be retrieved from en environment variable or an other secure store.
// If you do not provide the oracle's public key in the key object, it will be derived from its private key
myKey = {
  type: "ed25519",
  priv: "myprivatekey"
  pub: "mypublickey"
};

// Sign the payload using your key
payload = trace.sign(payload, myKey);

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
//     traceID: "example-trace-id"
//   },
//   signature: {
//     type: "ECDSA",
//     pubKey: "EXAMPLEPUBLICKEY123",
//     sig: "signedpayload"
//   }
// };
```
