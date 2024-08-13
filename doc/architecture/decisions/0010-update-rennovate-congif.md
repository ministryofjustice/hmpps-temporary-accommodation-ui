# 10. update-rennovate-config

Date: 2024-08-12

## Status

Accepted

## Context

As a part of analysing renovate configs across the digital hmpps repositories led by the lead from the Managing Custody team, it was found
many repos were using out of date configs that span up unessecary circle ci usage.
The previous config in this repo relied on an [this archived configuration](https://github.com/ministryofjustice/arn-renovate-config) which was archived in Jan 24.
The configuration resulted in unessecary rebuilds that ate into our circleci usage.


## Decision

Update Renovate config to the [hmpps-template-typescript config](https://github.com/ministryofjustice/hmpps-template-typescript/blob/main/renovate.json)

## Consequences

- Less circle ci builds
- Uniformity across hmpps applications
