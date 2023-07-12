Feature: Manage Temporary Accommodation - Booking search
    Background:
        Given I am logged in as an assessor
        And I view an existing active premises
        And I'm creating a bedspace
        And I create a bedspace with all necessary details

    Scenario: Showing bookings of all statuses
        Given I'm creating a booking
        And I create a booking with all necessary details
        And I'm searching bookings
        Then I should see a summary of the booking on the provisional bookings page
        And I confirm the booking
        And I'm searching bookings
        Then I should see a summary of the booking on the confirmed bookings page
        And I mark the booking as arrived
        And I'm searching bookings
        Then I should see a summary of the booking on the active bookings page
        And I mark the booking as departed
        And I'm searching bookings
        Then I should see a summary of the booking on the departed bookings page
