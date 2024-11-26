/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplication } from './ApprovedPremisesApplication';
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { BookingSummary } from './BookingSummary';
import type { Cancellation } from './Cancellation';
import type { Cas2Application } from './Cas2Application';
import type { FullPerson } from './FullPerson';
import type { OfflineApplication } from './OfflineApplication';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { TemporaryAccommodationApplication } from './TemporaryAccommodationApplication';
import type { UnknownPerson } from './UnknownPerson';
export type PlacementRequestDetail = {
    gender: 'male' | 'female';
    type: 'normal' | 'pipe' | 'esap' | 'rfap' | 'mhapStJosephs' | 'mhapElliottHouse';
    location: string;
    radius: number;
    essentialCriteria: Array<'isPIPE' | 'isESAP' | 'isMHAPStJosephs' | 'isMHAPElliottHouse' | 'isSemiSpecialistMentalHealth' | 'isRecoveryFocussed' | 'hasBrailleSignage' | 'hasTactileFlooring' | 'hasHearingLoop' | 'isStepFreeDesignated' | 'isArsonDesignated' | 'isWheelchairDesignated' | 'isSingle' | 'isCatered' | 'isSuitedForSexOffenders' | 'isSuitableForVulnerable' | 'acceptsSexOffenders' | 'acceptsHateCrimeOffenders' | 'acceptsChildSexOffenders' | 'acceptsNonSexualChildOffenders' | 'isArsonSuitable' | 'isGroundFloor' | 'hasEnSuite'>;
    desirableCriteria: Array<'isPIPE' | 'isESAP' | 'isMHAPStJosephs' | 'isMHAPElliottHouse' | 'isSemiSpecialistMentalHealth' | 'isRecoveryFocussed' | 'hasBrailleSignage' | 'hasTactileFlooring' | 'hasHearingLoop' | 'isStepFreeDesignated' | 'isArsonDesignated' | 'isWheelchairDesignated' | 'isSingle' | 'isCatered' | 'isSuitedForSexOffenders' | 'isSuitableForVulnerable' | 'acceptsSexOffenders' | 'acceptsHateCrimeOffenders' | 'acceptsChildSexOffenders' | 'acceptsNonSexualChildOffenders' | 'isArsonSuitable' | 'isGroundFloor' | 'hasEnSuite'>;
    expectedArrival: string;
    duration: number;
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks: PersonRisks;
    applicationId: string;
    assessmentId: string;
    releaseType: 'licence' | 'rotl' | 'hdc' | 'pss' | 'in_community' | 'not_applicable' | 'extendedDeterminateLicence' | 'paroleDirectedLicence' | 'reReleasedPostRecall';
    status: 'notMatched' | 'unableToMatch' | 'matched';
    assessmentDecision: 'accepted' | 'rejected';
    assessmentDate: string;
    applicationDate: string;
    assessor: ApprovedPremisesUser;
    isParole: boolean;
    isWithdrawn: boolean;
    /**
     * Not used by UI. Space Booking cancellations to be provided if cancellations are required in future.
     */
    cancellations: Array<Cancellation>;
    application: (ApprovedPremisesApplication | Cas2Application | OfflineApplication | TemporaryAccommodationApplication);
    notes?: string;
    booking?: BookingSummary;
    requestType?: 'parole' | 'standardRelease';
    withdrawalReason?: 'DuplicatePlacementRequest' | 'AlternativeProvisionIdentified' | 'ChangeInCircumstances' | 'ChangeInReleaseDecision' | 'NoCapacityDueToLostBed' | 'NoCapacityDueToPlacementPrioritisation' | 'NoCapacity' | 'ErrorInPlacementRequest' | 'WithdrawnByPP' | 'RelatedApplicationWithdrawn' | 'RelatedPlacementRequestWithdrawn' | 'RelatedPlacementApplicationWithdrawn';
};

