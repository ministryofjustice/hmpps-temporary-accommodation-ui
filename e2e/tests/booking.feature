Feature: Manage Temporary Accommodation - Booking
    Background:
        Given I am logged in
        And I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details

    Scenario: Creating a booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        Then I should see a confirmation for my new booking

    Scenario: Showing booking creation errors
        Given I'm creating a booking
        And I attempt to create a booking with required details missing
        Then I should see a list of the problems encountered creating the booking

    Scenario: Cancelling a provisional booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I cancel the booking
        Then I should see the booking with the cancelled status

    Scenario: Showing booking cancellation errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I attempt to cancel the booking with required details missing
        Then I should see a list of the problems encountered cancelling the booking

    Scenario: Confirming a booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        Then I should see the booking with the confirmed status

    Scenario: Cancelling a confirmed booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I cancel the booking
        Then I should see the booking with the cancelled status

    Scenario: Marking a booking as arrived
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        Then I should see the booking with the arrived status

    Scenario: Showing booking arrival errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I attempt to mark the booking as arrived with required details missing
        Then I should see a list of the problems encountered marking the booking as arrived

    Scenario: Extending a booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I extend the booking
        Then I should see the booking with the extended departure date

    Scenario: Showing booking extension errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I attempt to extend the booking with required details missing
        Then I should see a list of the problems encountered extending the booking

    Scenario: Marking a booking as departed
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I mark the booking as departed
        Then I should see the booking with the departed status

    Scenario: Showing booking departure errors
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I attempt to mark the booking as departed with required details missing
        Then I should see a list of the problems encountered marking the booking as departed

    Scenario: Showing booking history
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I view the booking history
        Then I should see previous booking states

    Scenario: Showing booking history for an extended booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I mark the booking as arrived
        And I extend the booking
        And I extend the booking
        And I view the booking history
        Then I should see previous booking states
    
    Scenario: Showing booking history for a cancelled provisional booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I cancel the booking
        And I view the booking history
        Then I should see previous booking states

    Scenario: Showing booking history for a cancelled confirmed booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        And I cancel the booking
        And I view the booking history
        Then I should see previous booking states
