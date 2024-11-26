/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedSearchParameters } from './BedSearchParameters';
export type ApprovedPremisesBedSearchParameters = (BedSearchParameters & {
    /**
     * The postcode district to search outwards from
     */
    postcodeDistrict?: string;
    /**
     * Maximum number of miles from the postcode district to search, only required if more than 50 miles which is the default
     */
    maxDistanceMiles?: number;
    requiredCharacteristics?: Array<'isPIPE' | 'isESAP' | 'isMHAPStJosephs' | 'isMHAPElliottHouse' | 'isSemiSpecialistMentalHealth' | 'isRecoveryFocussed' | 'hasBrailleSignage' | 'hasTactileFlooring' | 'hasHearingLoop' | 'isStepFreeDesignated' | 'isArsonDesignated' | 'isWheelchairDesignated' | 'isSingle' | 'isCatered' | 'isSuitedForSexOffenders' | 'isSuitableForVulnerable' | 'acceptsSexOffenders' | 'acceptsHateCrimeOffenders' | 'acceptsChildSexOffenders' | 'acceptsNonSexualChildOffenders' | 'isArsonSuitable' | 'isGroundFloor' | 'hasEnSuite'>;
} & {
    /**
     * The postcode district to search outwards from
     */
    postcodeDistrict: string;
    /**
     * Maximum number of miles from the postcode district to search, only required if more than 50 miles which is the default
     */
    maxDistanceMiles: number;
    requiredCharacteristics: Array<'isPIPE' | 'isESAP' | 'isMHAPStJosephs' | 'isMHAPElliottHouse' | 'isSemiSpecialistMentalHealth' | 'isRecoveryFocussed' | 'hasBrailleSignage' | 'hasTactileFlooring' | 'hasHearingLoop' | 'isStepFreeDesignated' | 'isArsonDesignated' | 'isWheelchairDesignated' | 'isSingle' | 'isCatered' | 'isSuitedForSexOffenders' | 'isSuitableForVulnerable' | 'acceptsSexOffenders' | 'acceptsHateCrimeOffenders' | 'acceptsChildSexOffenders' | 'acceptsNonSexualChildOffenders' | 'isArsonSuitable' | 'isGroundFloor' | 'hasEnSuite'>;
});

