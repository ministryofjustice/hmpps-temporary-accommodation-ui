/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CAS3PersonArrivedEventDetails } from './CAS3PersonArrivedEventDetails';
export type CAS3PersonArrivedEvent = {
    eventDetails: CAS3PersonArrivedEventDetails;
    /**
     * The UUID of an event
     */
    id: string;
    timestamp: string;
    eventType: 'accommodation.cas3.booking.cancelled' | 'accommodation.cas3.booking.cancelled.updated' | 'accommodation.cas3.booking.confirmed' | 'accommodation.cas3.booking.provisionally-made' | 'accommodation.cas3.person.arrived' | 'accommodation.cas3.person.arrived.updated' | 'accommodation.cas3.person.departed' | 'accommodation.cas3.referral.submitted' | 'accommodation.cas3.person.departed.updated' | 'accommodation.cas3.assessment.updated';
};

