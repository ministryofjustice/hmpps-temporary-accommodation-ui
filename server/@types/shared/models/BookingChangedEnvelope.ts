/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingChanged } from './BookingChanged';
export type BookingChangedEnvelope = {
    /**
     * The UUID of an event
     */
    id: string;
    timestamp: string;
    eventType: 'approved-premises.application.submitted' | 'approved-premises.application.assessed' | 'approved-premises.booking.made' | 'approved-premises.person.arrived' | 'approved-premises.person.not-arrived' | 'approved-premises.person.departed' | 'approved-premises.booking.not-made' | 'approved-premises.booking.cancelled' | 'approved-premises.booking.changed' | 'approved-premises.booking.keyworker.assigned' | 'approved-premises.application.withdrawn' | 'approved-premises.application.expired' | 'approved-premises.assessment.appealed' | 'approved-premises.assessment.allocated' | 'approved-premises.assessment.info-requested' | 'approved-premises.placement-application.withdrawn' | 'approved-premises.placement-application.allocated' | 'approved-premises.match-request.withdrawn' | 'approved-premises.request-for-placement.created' | 'approved-premises.request-for-placement.assessed';
    eventDetails: BookingChanged;
};

