# 8. concept-of-bedspaces

Date: 2023-02-28

## Status

Accepted

## Context

CAS1 and CAS3 share an API which includes the modelling for premises, rooms and
beds. This modelling was initially set out by CAS1 and CAS3 have been working to
extend in order to meet the needs of Temporary Accommodation (CAS3).

The relationships are straightforward. A premises can have many rooms and a room
can have many beds.

For CAS1 they will often have the scenario of multiple beds belonging to a
single room.

For CAS3 we only expect one bed per room for the foreseeable future, however we
cannot guarantee that this will always remain the case.

At the time of writing an individual bed record doesn't itself contain any data.
This too may change in future.

Rooms serve to group related beds and to encapsulate shared attributes such as
physical characteristics of the space. These are used in the matching journey
where the risks and needs of person leaving prison are matched up to a suitable
premises and room.

Both teams have the need to help users create bookings for physical beds and to
report on occupancy levels based on bed, rather than room. This points us
towards using the existing bed model as the smallest unit of data for both
services.

Given the CAS3 team have 1 bed per room, we wanted to tailor the user experience
to avoid unnecessary clicks. Instead of asking the user to navigate from
premises through to rooms and on to the bed we can instead present all beds in a
premises alongside their room characteristics. This removes the concept of
'rooms' from our user.

Finally, our users were more familiar with the language of 'bedspace' over
'bed'.

## Decision

Temporary Accommodation will introduce the concept of a "bedspace" to users.

## Consequences

- Should we need to support rooms with multiple beds in future this should be
  easier to introduce given the presence of the room model in the API
- Viewing a bedspace will require the API to load both the room and the bedspace
  which is less efficient
- Searching bedspaces will require the API to load both the rooms and the
  bedspaces which is less efficient
- Beds will not need to have their characteristics (currently stored on a room)
  duplicated which will be easier for users to update
- Both services will use the same `premises -> room -> bed -> booking` model
  which should offer strategic advantages for the same codebase, compared to
  splitting off and creating `premises -> bed/bedspace -> booking` which would
  be a difficult divergence to support
- The users and non-technical members of the team will refer to bedspaces in
  everyday discussion. The developers will need to translate that into the
  context of rooms and beds before responding back in the common language of
  bedspaces. This will introduce a small cognitive burden on the developers that
  happens often.
