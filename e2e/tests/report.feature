Feature: Manage Temporary Accommodation - Report
    Background:
        Given I am logged in as an assessor

    Scenario: Downloading a booking report for a probation region
        Given I'm downloading a report
        And I download a booking report for the preselected probation region
        Then I should download a report

    Scenario: Downloading a bedspace usage report for a probation region
        Given I'm downloading a report
        And I download a bedspace usage report for the preselected probation region
        Then I should download a report

    Scenario: Downloading a future bookings report for a probation region
        Given I'm downloading a report
        And I download a future bookings report for the preselected probation region
        Then I should download a report

    Scenario: Downloading an occupancy report for a probation region
        Given I'm downloading a report
        And I download an occupancy report for the preselected probation region
        Then I should download a report

    Scenario: Showing report download errors
        Given I'm downloading a report
        And I clear the form and attempt to download a booking report
        Then I should see a list of the problems encountered downloading the report
