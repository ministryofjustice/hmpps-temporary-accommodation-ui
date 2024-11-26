/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingRequirements } from './Cas1SpaceBookingRequirements';
/**
 * details of the space booking to be created
 */
export type NewCas1SpaceBooking = {
    arrivalDate: string;
    departureDate: string;
    premisesId: string;
    requirements: Cas1SpaceBookingRequirements;
};

