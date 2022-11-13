# 6. Manually Convert Data For Import

Date: 2022-11-01

## Status

Accepted

## Context

HPTs that are already running CAS3 services have a set of existing data about their properties, people,
and so on, that they will need to add to the new CAS3 service. This existing data is stored in a set
of spreadsheets.

To avoid errors, and increase speed of transfer, we want to support conversion of the existing data,
and avoid rekeying of that data into our new system.

The existing spreadsheets are designed by each HPT to match their needs and design during the prototype
phase of the service rollout; they are not consistent across areas. We have used those spreadsheets to
inform our database design, but there is not necessarily a direct field mapping for every data item due
to this variation. For instance, what might be a boolean field for "wheelchair access" in our database might
be a YES/NO column in one area, or a freeform text note in another.

The challenge is therefore to transform the existing data into a common format based on our database schema.

## Decision

Due to the complexity and variety of the input data, we do not propose to create an automatic conversion process
that understands each of the input spreadsheets and requires no user input.

Instead, we will define an intermediate CSV data format which can represent all required data, then work with
HPTs to convert their data into that format using standard spreadsheet tools such as Excel. Such tools are very
well designed for this sort of data manipulation, and will be a much more time-efficient and less error-prone
conversion method than anything we could create.

In this way, the HPTs can make sure their data is correctly converted, and we do not write specific code for
different formats that will only be used once.

CSV is chosen as the interim file format because it is simple to parse in code, and forces plain text, removing
formatting.

Because of the different data structures involved, there are likely to be separate intermediate formats for
property details, and for people and their placements into those properties.

## Consequences

The project development team will define the common format, derived from our database schema at time of
import, and create a template spreadsheet for HPTs to convert data into.

HPTs may not have the experience or capacity to perform the data conversion into our common format. In that
case, the central MoJ CAS3 team (or even the project development team) could assist, though input from HPTs
will still be required to ensure correctness.

The common format will be loaded into our database automatically; see ADR #7 for details.

Our system will allow editing of the uploaded data after insertion, as part of the normal property management
behaviour. Any errors during conversion will thus be able to be corrected later without issue.

We do not anticipate loading past data in, only current state, but this should be checked with stakeholders
and the data schema designed with the finding in mind.
