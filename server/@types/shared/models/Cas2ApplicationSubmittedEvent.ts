/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas2ApplicationSubmittedEventDetails } from './Cas2ApplicationSubmittedEventDetails';
export type Cas2ApplicationSubmittedEvent = {
    eventDetails: Cas2ApplicationSubmittedEventDetails;
    /**
     * The UUID of an event
     */
    id: string;
    timestamp: string;
    eventType: 'applications.cas2.application.submitted' | 'applications.cas2.application.status-updated';
};

