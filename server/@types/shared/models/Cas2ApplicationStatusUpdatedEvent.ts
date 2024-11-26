/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas2ApplicationStatusUpdatedEventDetails } from './Cas2ApplicationStatusUpdatedEventDetails';
export type Cas2ApplicationStatusUpdatedEvent = {
    eventDetails: Cas2ApplicationStatusUpdatedEventDetails;
    /**
     * The UUID of an event
     */
    id: string;
    timestamp: string;
    eventType: 'applications.cas2.application.submitted' | 'applications.cas2.application.status-updated';
};

