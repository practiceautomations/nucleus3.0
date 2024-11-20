beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/facilities')
});
describe('Test Case for WBT-429, Create Facility', () => {
  it('Case 1: Add a new Facility', () => {
    cy.findByText("Add New Facility").click()
    cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
    cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
    cy.contains("Whitebox Practice test").click()
    cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
    cy.contains("12 | Home").click()
    cy.contains("Add Facility").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Facility Successfully Created')
  });
  it('Case 2: Edit the data of existing Facility', () => {
    cy.get('[data-testid="singleDropdownSelectedValue-facility_select_filter"]').click();
    cy.contains("Whitebox Practice test").click();
    cy.get('[data-testid="facility_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
    cy.contains('[data-testid="singleDropdownOption-pos"]',"11 | Office").click()
    cy.get('[data-testid="facility_name_testid"]').clear().type('WBT Test Facility');
    cy.contains("Save Changes").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Facility Successfully Saved')
    });
    it('Case 3: Inactive a Facility', () => {
      cy.get('[data-testid="singleDropdownSelectedValue-facility_select_filter"]').click();
      cy.contains("Whitebox Practice test").click();
      cy.get('[data-testid="facility_row"]').first().click()
      cy.contains("Inactivate Facility").click()
      cy.contains("Yes, Inactivate Facility").click()
      cy.wait(2000)
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Facility Successfully Inactivated')
    });
    it('Case 4: Active any Inactive Facility', () => {
      cy.get('[data-testid="singleDropdownSelectedValue-facility_select_filter"]').click();
      cy.contains("Whitebox Practice test").click();
      cy.get('[data-testid="showInActiveFacility"]').check()
      cy.get('[data-testid="facility_row"]').first().click()
      cy.contains("Activate Facility").click()
      cy.contains("Yes, Activate Facility").click()
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Facility Successfully Activated')
    });

    it('Case 5: Validate the warning by clicking on the Cancel button', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.wait(1000)
      cy.contains("Cancel").click()
      cy.contains('Are you sure you want to cancel creating this Facility? Clicking "Confirm" will result in the loss of all changes.')
    });
    it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.wait(1000)
      cy.contains("Add Facility").click()
      cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
    });

    it('Case 7: Validate the NPI number length', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_npi"]').click({force:true}).type("123659845678")
      cy.contains("Add Facility").click()
      cy.contains("NPI is invalid.  Please enter a valid NPI.")
    });

    it('Case 8: Validate the CLIA length', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.get('[data-testid="facility_email"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_clianumber"]').then($input => {
        if ($input.is(':disabled')) {
          $input.removeAttr('disabled');
        }
      }).click().type('123ABHGI458762');
      cy.contains("Add Facility").click()
      cy.contains("CLIA is invalid.  Please enter a valid CLIA Code.")
    });
    it('Case 9: Email Validation by entering invalid email', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_email"]').then($input=>{
        if($input.is(':disabled'));
      }).click().type("@gmail.com");
      cy.contains("Add Facility").click()
      cy.contains("Enter valid email address.")
    });
    it('Case 10: Email Validation, Email without Dot in Domain', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_email"]').then($input=>{
        if($input.is(':disabled'));
      }).click().type("Test@gmailcom");
      cy.contains("Add Facility").click()
      cy.contains("Enter valid email address.")
    });
    it('Case 11: Email Validation, 2 character extension email', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_email"]').then($input=>{
        if($input.is(':disabled'));
      }).click().type("Test@curvox.de");
      cy.contains("Add Facility").click()
      cy.contains("Facility Successfully Created")
    });
    it('Case 12: Email Validation, multiple Dots in Domain', () => {
      cy.findByText("Add New Facility").click()
      cy.get('[data-testid="facility_name_testid"]').type('WBT Test Facility');
      cy.get('[data-testid="singleDropdownSelectedValue-associated_with_practice_testid"]').click();
      cy.contains("Whitebox Practice test").click()
      cy.get('[data-testid="singleDropdownSelectedValue-pos"]').click();
      cy.contains("12 | Home").click()
      cy.get('[data-testid="facility_email"]').then($input=>{
        if($input.is(':disabled'));
      }).click().type("Test@gmail.co.uk");
      cy.contains("Add Facility").click()
      cy.contains("Facility Successfully Created")
    });
});