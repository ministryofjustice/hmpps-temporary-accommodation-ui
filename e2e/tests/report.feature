Feature: Manage Temporary Accommodation - Report
    Background:
        Given I am logged in

    Scenario: Downloading a booking report for a probation region
        Given I'm downloading a booking report
        And I download a report for the preselected probation region
        Then I should download a booking report

    Scenario: Showing report download errors
        Given I'm downloading a booking report
        And I clear the preselected probation region and attempt to download a report
        Then I should see a list of the problems encountered downloading the report
