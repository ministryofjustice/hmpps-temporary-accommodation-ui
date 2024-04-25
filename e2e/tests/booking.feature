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

    Scenario: Creating a booking, confirming, marking as arrived, change arrival, change arrival error
        Given I'm creating a booking
        When I create a booking with all necessary details
        Then I should see a confirmation for my new booking
        When I confirm the booking
        Then I should see the booking with the confirmed status
        When I mark the booking as arrived
        Then I should see the booking with the arrived status
        When I navigate to change the booking arrival
        And I enter the change arrival data incorrectly
        Then I should see a list of the problems encountered whilst changing the booking arrival
        When I enter change booking data correctly
        Then I should see the booking with confirmation of arrival change

    Scenario: Editing a booking's turnaround time
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I edit the booking's turnaround time
        Then I should see the booking with the edited turnaround time
