# 5. Persist Submitted Documents in Translated JSON

Date: 2022-10-17

## Status

Accepted

## Context

We need to ensure that submitted and assessed Applications are
reliably persisted as permanent read-only artefacts. We know that they will
have an enduring role as a snapshot of an individual's AP-related risks and
needs at a point in time. The application, along with the content added during
the assessment stage will be an important reference document at every stage
in the lifecycle of person's relationship with the probation service.

Throughout the lifecycle of the product, it is expected that the questions will
change, so it is important that we ensure that any changes made to the questions
still mean that older Applications are still readable with the questions as
they were when the application was completed.

## Decision

At the moment, an application has a `data` field that contains the application
in a machine-readable format (i.e with questions and things like radio and
checkbox answers as as single-character keys). In addition to this, we also
propose  that a "translated" JSON version of the "check your answers" review stage may be a good solution. Our questionnaire hierarchy of:

```text
Sections
  > Tasks
    > Pages
      > Questions
```

can be represented in JSON hierarchy, and be "re-hydrated" back into a summary
screen consisting of nested questions and answers similar to the long "check
your answers" pages planned for the Apply and Assess stages. These JSON
documents would be marshalled by the Node app when the Application and the
Assessment are complete and "submitted". The API would persist them in a
dedicated field e.g. Application#document - distinct from the working data at
Application#data.

## Consequences

This will ensure that we have a clear record of the answers that were given at
the time, without having to maintain a list of translations for older versions
of the questionnaire. This will also make playing back the answers at the
"Check your answers" and assessment stages easier, as we will already have the
translated questionnaire persisted.
