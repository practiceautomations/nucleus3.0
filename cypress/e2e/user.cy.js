beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/users')
});
describe('Test Case for WBT-426, Create User', () => {
  it('Case 1: Add a new User', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('1234567890')
    cy.get('input[placeholder="example@example.com"]').type('Testuser@adnare.com')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/2000')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").first().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains("User Added Successfully")
  });
  it('Case 2: Edit the data of existing user', () => {
    cy.get('[data-testid="UserFilter"]').type("WBT Test User")
    cy.wait(1000)
    cy.get('[data-testid="users_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('input[placeholder="First Last"]').clear().type('Updated Name')
    cy.contains("Save Changes").click()
  });
  it('Case 3: Inactive an Active User', () => {
    cy.get('[data-testid="UserFilter"]').type("Updated Name")
    cy.wait(1000)
    cy.get('[data-testid="users_row"]').first().click()
    cy.contains("Inactivate").click()
    cy.contains("Yes, Inactivate User").click()
    cy.wait(2000)
  });
  it('Case 4: Activate an Inactive User', () => {
    cy.get('[data-testid="showInActiveUser"]').check()
    cy.get('[data-testid="UserFilter"]').type("Updated Name")
    cy.get('[data-testid="users_row"]').last().click();
    cy.contains("Activate").click()
    cy.contains("Yes, Activate User").click()
  });
  it('Case 5: Validate the warning by clicking on the Cancel button', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.contains("Cancel").click()
    cy.contains('Are you sure you want to cancel creating this User? Clicking "Confirm" will result in the loss of all changes.')
  });
  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.contains("Add User").click()
    cy.contains('This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.')
  });

  it('Case 8: Validate the Reset Password functionality with different password in NEW and CONFIRM', () => {
    cy.get('[data-testid="UserFilter"]').type("Updated Name")
    cy.wait(1000)
    cy.get('[data-testid="users_row"]').first().click()
    cy.contains("Reset Password").click()
    cy.get('input[placeholder="Enter New Password"]').type('123')
    cy.get('input[placeholder="Confirm New Password"]').type('12345')
    cy.get('[data-testid="resetPassword"]').click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'New password and Confirm password does not match.')
  });
 it('Case 9: Validate the Reset Password Functionality by entering a very weak password', () => {
    cy.get('[data-testid="UserFilter"]').type("Updated Name")
    cy.wait(1000)
    cy.get('[data-testid="users_row"]').first().click()
    cy.contains("Reset Password").click()
    cy.get('input[placeholder="Enter New Password"]').type('123')
    cy.get('input[placeholder="Confirm New Password"]').type('123')
    cy.get('[data-testid="resetPassword"]').click()
    cy.contains("Yes, Reset Password").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Password should contain at least one uppercase letter, lowercase letter, number, special character and should be greater than 8 characters in length.')
  });
  it('Case 10: Email Validation, enter invalid email', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('1234567890')
    cy.get('input[placeholder="example@example.com"]').type('@gmail.com')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/2000')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").last().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Enter valid email address.')
  });
  it('Case 11: Email Validation, Email without Dot in Domain', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('1234567890')
    cy.get('input[placeholder="example@example.com"]').type('@gmailcom')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/2000')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").last().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Enter valid email address.')
  });
  it('Case 13: Email Validation, multiple Dots in Domain', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('1234567890')
    cy.get('input[placeholder="example@example.com"]').type('Test@gmail.co.uk')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/1995')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").first().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'User Added Successfully')
  });
  it('Case 14: Phone Number validation', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('11233')
    cy.get('input[placeholder="example@example.com"]').type('Testuser@gmail.com')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/2001')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").first().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Phone number is invalid.')
  });
  it('Case 15: DOB Date is in future', () => {
    cy.findByText("Create New User").click()
    cy.get('input[placeholder="First Last"]').type('WBT Test User')
    cy.get('input[placeholder="(123) 456-7890"]').type('1234567890')
    cy.get('input[placeholder="example@example.com"]').type('Testuser@gmail.com')
    cy.get('[data-testid="dateFeildValue-createUserDob"]').type('01/01/2035')
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("WBT Menu Role").first().click()
    cy.get('[data-testid="userRoletestID"]').click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Derek Sanborn").click()
    cy.get('[data-testid="userReportingManagertestID"]').click()
    cy.get('[data-testid="UserTimeZoneTestId"]').click()
    cy.contains("(UTC-12:00) International Date Line West").click()
    cy.get('[data-testid="UserDateFormatTestId"]').click()
    cy.contains("mm/dd/yyyy").click()
    cy.get('[data-testid="UserDateTimeFormatTestId"]').click()
    cy.contains("mm/dd/yyyy hh:mi:ss").click()
    cy.wait(1000)
    cy.contains("Add User").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOB should not be greater than today date.')
  });
});