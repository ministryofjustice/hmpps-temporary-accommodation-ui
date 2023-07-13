Feature: Manage Temporary Accommodation - Booking
    Background:
        Given I am logged in as an assessor
        And I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details

    Scenario: Creating a booking, and cancelling while provisional
        Given I'm creating a booking
        And I create a booking with all necessary details
        Then I should see a confirmation for my new booking
        And I cancel the booking
        Then I should see the booking with the cancelled status
        And I edit the cancelled booking
        Then I should see the booking with the edited cancellation details
        And I should see previous booking states in the booking history

    Scenario: Creating a booking, and cancelling while confirmed
        Given I'm creating a booking
        And I create a booking with all necessary details
        Then I should see a confirmation for my new booking
        And I confirm the booking
        Then I should see the booking with the confirmed status
        And I cancel the booking
        Then I should see the booking with the cancelled status
        And I edit the cancelled booking
        Then I should see the booking with the edited cancellation details
        And I should see previous booking states in the booking history

    Scenario: Creating a booking, confirming, marking as arrived, extending, and marking as departed
        Given I'm creating a booking
        And I create a booking with all necessary details
        Then I should see a confirmation for my new booking
        And I confirm the booking
        Then I should see the booking with the confirmed status
        And I mark the booking as arrived
        Then I should see the booking with the arrived status
        And I extend the booking
        Then I should see the booking with the extended departure date
        And I mark the booking as departed
        Then I should see the booking with the departed status
        And I edit the departed booking
        Then I should see the booking with the edited departure details
        And I should see previous booking states in the booking history

    Scenario: Editing a booking's turnaround time
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I edit the booking's turnaround time
        Then I should see the booking with the edited turnaround time

    Scenario: Showing booking creation errors
        Given I'm creating a booking
        And I attempt to create a booking with required details missing
        Then I should see a list of the problems encountered creating the booking

    Scenario: Showing booking creation conflict errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I go up a breadcrumb level
        And I'm creating a booking
        And I attempt to create a conflicting booking
        Then I should see errors for the conflicting booking

    Scenario: Showing booking cancellation errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I attempt to cancel the booking with required details missing
        Then I should see a list of the problems encountered cancelling the booking
        And I cancel the booking
        And I attempt to edit the cancelled booking with required details missing
        Then I should see a list of the problems encountered editing the cancelling booking

    Scenario: Showing booking arrival errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I attempt to mark the booking as arrived with required details missing
        Then I should see a list of the problems encountered marking the booking as arrived

    Scenario: Showing booking extension errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I attempt to extend the booking with required details missing
        Then I should see a list of the problems encountered extending the booking

    Scenario: Showing booking departure errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I attempt to mark the booking as departed with required details missing
        Then I should see a list of the problems encountered marking the booking as departed
        And I mark the booking as departed
        And I attempt to edit the departed booking with required details missing
        Then I should see a list of the problems encountered editing the departed booking
