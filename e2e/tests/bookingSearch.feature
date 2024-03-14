Feature: Manage Temporary Accommodation - Booking search

  Background:
    Given I am logged in as an assessor
    And I view an existing active premises
    And I'm creating a bedspace
    And I create a bedspace with all necessary details
    And I'm creating a booking
    And I create a booking with all necessary details

  Scenario: Showing bookings of all statuses
    When I'm searching bookings
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

  Scenario: Searching for a booking by CRN
    Given I'm searching bookings
    When I search for a CRN that does not exist in provisional bookings
    Then I should see a message that the provisional booking is not found
    When I click on the Departed bookings tab
    Then I should see a message that the departed booking is not found
    When I click on the Provisional bookings tab
    And I search for a valid CRN in provisional bookings
    Then I see the provisional booking I was searching for
