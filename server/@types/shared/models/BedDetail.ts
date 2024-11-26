/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacteristicPair } from './CharacteristicPair';
export type BedDetail = {
    id: string;
    name: string;
    roomName: string;
    status: 'occupied' | 'available' | 'out_of_service';
    characteristics: Array<CharacteristicPair>;
};

