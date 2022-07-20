# 3. Handle validations errors on the server side

Date: 2022-07-20

## Status

Accepted

## Context

We need to figure out a way of how to handle validation errors in the application. As we have
a UI application and a backend API, it doesn't make sense to do the validation on both the frontend
and the backend, so we need to identify the best place to do this validation and how to play back
the errors to the user.

## Decision

As a general rule, we will validate any form requests at the API level. Any invalid requests will
return a `400` error with a response that contains an error message, as well as an `errors` array
with objects containing the `propertyName` and the `errorType`.

For example, when POSTing to an endpoint where the variables `arrivalDate` and `CRN` are blank,
and the `departureDate` is an invalid date, the API will return a response as below:

```json
{
 "message": "Validation error",
 "errors" : [
   {
      "propertyName": "arrivalDate",
      "errorType": "blank"
    },
   {
      "propertyName": "departureDate",
      "errorType": "invalid"
    },
   {
      "propertyName": "CRN",
      "errorType": "blank"
   }
 ]
}
```

The errors in the `errors` array can then be translated into human-readable errors by the frontend
application.

## Consequences

This allows us to keep the frontend slim, while also ensuring that any clients that use the backend
API in future get validation responses in a consistent format.

This does mean that the API may recieve more calls than is necessary, but given the user base is
relatively low, we don't believe that this will be unmanageable.
