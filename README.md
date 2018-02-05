# IndigoTrace SDK

This javascript module exposes functions to communicate with the Indigo Trace API. You will first need to sign up for an account at indigotrace.com. Once you have created an *input*, you will need its private key to interact with the API.

## Usage

```javascript
import TraceSdk from "indigotrace-sdk";

// The private key should be retrieved from an environment variable or an other secure store.
// The public key will be derived from its private key.
// The 'secret' field must be an base64-encoded string of 64 bytes.
const myKey = {
  type: "ed25519",
  secret:
    "VD6zmq068l1EhaWfpRQxnlpTjGbwSN2q2XcgriBmo3Mco+7GK+BPLO49yxuQzbQ1dzd/6B+3YQb2c3BhqEaTsA=="
};

// Initialize the SDK with the API's URL.
const sdk = TraceSdk(myKey);

// This is an example of data we want to send to Indigo Trace.
const data = {
  type: "test",
  data: "data",
  name: "name"
};

// Create a payload containing our data.
const payload = sdk.create(data);
// Since we omit the traceID, it will instantiate a new trace in the corresponding
// workflow, and append a first event to it with the corresponding data. Note that
// the workflow to be used is derived from the key provided when instantiating
// the SDK. This is the key that was generated when adding the input to the workflow
// on indigotrace.com.

// Alternatively, we can specify a traceID and/or references via options:
const payload = sdk.create(data, {
  traceID: 'db255d6d-8e7f-45e6-99f8-cf9f1084ba9b',
  refs: ['event-id-1', 'event-id-2']
});


// Sign the payload before sending it.
const signedPayload = sdk.sign(payload);

// The signed payload will have the following format:
// {
//   payload: {
//     data: {
//       type: "test",
//       data: "data",
//       name: "name"
//     },
//     refs: ["event-id-1", "event-id-2"],
//     traceID: "db255d6d-8e7f-45e6-99f8-cf9f1084ba9b"
//   },
//   signatures: [{
//     type: "ed25519",
//     pubKey: "EXAMPLEPUBLICKEY123",
//     sig: "signedpayload"
//   }]
// };

// Finally, you can send the payload to the trace API.
// Before sending it, it will ensure that the fields (payload, signatures) are present.
sdk.send(payload).then(rsp => {
  // Extract the newly created traceID (if non was provided in the payload)
  // and other relevant information.
  const {data, event_id, trace_id, update_at, action } = rsp;
  console.log(trace_id);
  ...
});
```

Head over to indigotrace.com and have a look at your workflow to see the new event in the traces section. You can inspect the content of the payload from there.

## Retrieve traces
The SDK can also retrieve existing traces and events:
```javascript
// If you know the traceID, you can use it directly to retrive the trace content:
sdk.getTrace('db255d6d-8e7f-45e6-99f8-cf9f1084ba9b').then(rsp => {
  // Extract the information from the trace.
  const { trace_id, events} = rsp;
  events.forEach(e => {
    const { data, event_id, action, updated_at } = e;
    console.log(data);
  })
})

// If you don't know the trace id you can get all traces at once.
sdk.getTraces().then(rsp => {
  // Extract the information from the traces.
  const { workflow_id, traces } = rsp;
  traces.forEach(trace => {
    const { trace_id, events} = trace;
    events.forEach(e => {
      const { data, event_id, action, updated_at } = e;
      console.log(data);
    })
  })
});
```

## Verify payload signatures

Given a signed payload, it is possible to veify that the signatures are correct:
```javascript
if ( !sdk.verify(signedPayload) ) {
  throw new Error('Cannot verify this signature...');
}
```