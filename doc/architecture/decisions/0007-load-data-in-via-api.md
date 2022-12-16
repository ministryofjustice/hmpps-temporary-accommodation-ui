# 7. Load Data Into System Via API

Date: 2022-11-01

## Status

Accepted

## Context

We need to import existing data into the CAS3 system in order for HPTs that are currently providing the service
to be able to carry on doing so with minimal interruption.

The service will cover approximately 2500 bedspaces across 12 regions. We expect to onboard one region at a time,
with each region having 100-200 bedspaces.

Data needs to be loaded into our production and pre-production environments quickly and automatically. This data is stored in
a common intermediate format (see ADR #6), but then needs to be loaded into the correct database structures
for the live service.

An import script will need to be written to parse the intermediate format, and perform this insertion.

We have considered two options for the import script:

1. Data files are copied to a node inside our production environment, and an import script is run within the privileged environment to load the data, either via Kotlin backend code or direct SQL statements.
2. Data files are copied to a secure machine outside the production environment, and an import script uses the domain API (which is also used by the UI for all its tasks) to insert data.

## Decision

We will insert data via the domain API, with an import script running on a secure but non-production machine.

This has a number of advantages:

* Obtaining access to the production API will be simpler and safer, security and access-wise, than getting an interactive shell login on a privileged machine.
* The domain API can enforce all its business logic on the inserted data, ensuring security and consistency.
* We can prove that the API works correctly by exercising it with the imported data.

The import process will be tested fully, and the data verified, in a pre-production environment before running the import on production.

## Consequences

During the import, we will want to disable any notifications that are sent by the domain API backend, so that users are not confused about being notified things they already know about.

The import script should be written so that it is idempotent; errors will inevitably creep in, and if the import process can simply be rerun without duplicating already-entered data, this process will be much simpler.

It may be simpler to build the import process into the UI itself, rather than as a separate script, seeing as
the UI already connects to the API and performs many of the same operations. That is left as an implementation
detail for the development team to decide.

The data involved is sensitive, so cannot be simply loaded via a developer's laptop. In its current form, this data is routinely held on HPT devices for processing; therefore a device of the same security level as the HPTs should suffice. This may be a matter of obtaining an MoJ laptop for the process, or of setting up a member of the CAS3 central team with the required software to run the import.

## Actions

The team should discuss with the HMPPS Security team exactly which sort of device will need to be used for the transfer of data to ensure compliance with data handling.

The team should discuss with the Cloud Platform team how to allow production API access from that device, for instance requirements around VPNs, IP whitelisting, etc.
