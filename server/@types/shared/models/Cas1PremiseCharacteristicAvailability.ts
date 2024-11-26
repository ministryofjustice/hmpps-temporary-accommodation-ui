/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Cas1PremiseCharacteristicAvailability = {
    characteristic: 'acceptsChildSexOffenders' | 'acceptsHateCrimeOffenders' | 'acceptsNonSexualChildOffenders' | 'acceptsSexOffenders' | 'hasArsonInsuranceConditions' | 'hasBrailleSignage' | 'hasCallForAssistance' | 'hasCrib7Bedding' | 'hasEnSuite' | 'hasFixedMobilityAids' | 'hasHearingLoop' | 'hasLift' | 'hasNearbySprinkler' | 'hasSmokeDetector' | 'hasStepFreeAccess' | 'hasStepFreeAccessToCommunalAreas' | 'hasTactileFlooring' | 'hasTurningSpace' | 'hasWheelChairAccessibleBathrooms' | 'hasWideAccessToCommunalAreas' | 'hasWideDoor' | 'hasWideStepFreeAccess' | 'isArsonDesignated' | 'isArsonSuitable' | 'isCatered' | 'isFullyFm' | 'isGroundFloor' | 'isGroundFloorNrOffice' | 'isIAP' | 'isSingle' | 'isStepFreeDesignated' | 'isSuitableForVulnerable' | 'isSuitedForSexOffenders' | 'isTopFloorVulnerable' | 'isWheelchairAccessible' | 'isWheelchairDesignated';
    /**
     * the number of available beds with this characteristic
     */
    availableBedsCount: number;
    /**
     * the number of bookings requiring this characteristic
     */
    bookingsCount: number;
};

