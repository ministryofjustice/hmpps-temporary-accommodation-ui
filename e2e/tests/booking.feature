Feature: Manage Temporary Accommodation - Booking
    Background:
        Given I am logged in
        And I'm viewing an existing premises
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

    Scenario: Confirming a booking
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I confirm the booking
        Then I should see the booking with the confirmed status

