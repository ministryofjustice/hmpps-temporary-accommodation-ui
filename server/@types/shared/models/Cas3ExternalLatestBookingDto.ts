/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas3BookingStatus } from './Cas3BookingStatus';
import type { Cas3ExternalLatestBookingPremisesDto } from './Cas3ExternalLatestBookingPremisesDto';
import type { Cas3ExternalPreviousBookingCancellationDto } from './Cas3ExternalPreviousBookingCancellationDto';
export type Cas3ExternalLatestBookingDto = {
    cancellation?: Cas3ExternalPreviousBookingCancellationDto;
    premises: Cas3ExternalLatestBookingPremisesDto;
    provisionalOfferSentDate?: string;
    status?: Cas3BookingStatus;
};

