beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/insurances')
});
describe('Test Case for WBT-430, Create Insurance', () => {
  it('Case 1: Add a new Insurance', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("30")
    cy.get('[data-testid="insurance_follow_up"]').type("30")
    cy.contains("Add Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Created')
  });
  it('Case 2: Edit the data of existing Insurance', () => {
    cy.get('#search').type("WBT Test Practice")
    cy.get('[data-testid="insurance_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('input[data-testid="insurance_follow_up"]').clear().type("29")
    cy.contains("Save Changes").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Saved')
  });
  it('Case 3: Inactive a Insurance', () => {
    cy.get('#search').type("WBT Test Practice")
    cy.get('[data-testid="insurance_row"]').first().click()
    cy.contains("Inactivate Insurance").click()
    cy.contains("Yes, Inactivate Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Inactivated')
  });
  it('Case 4: Active any Inactive Insurance', () => {
    cy.get('#search').type("WBT Test Practice")
    cy.get('[data-testid="showInactive_insurance"]').check()
    cy.get('[data-testid="insurance_row"]').first().click()
    cy.contains("Activate Insurance").click()
    cy.contains("Yes, Activate Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Activated')
  });
  it('Case 5: Validate the warning by clicking on the Cancel button', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.contains("Cancel").click()
    cy.contains('Are you sure you want to cancel creating this Insurance? Clicking "Confirm" will result in the loss of all changes')
  });
  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.contains("Add Insurance").click()
    cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });
  it('Case 7: Email Validation by entering invalid email', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("30")
    cy.get('[data-testid="insurance_follow_up"]').type("30")
    cy.get('input[placeholder="Email"]').type('@gmail.com')
    cy.contains("Add Insurance").click()
    cy.contains("Enter valid email address.")
  });
  it('Case 8: Email Validation, Email without Dot in Domain', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("30")
    cy.get('[data-testid="insurance_follow_up"]').type("30")
    cy.get('input[placeholder="Email"]').type('Test@gmailcom')
    cy.contains("Add Insurance").click()
    cy.contains("Enter valid email address.")
  });
  it('Case 9: Email Validation, 2 character extension email', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("30")
    cy.get('[data-testid="insurance_follow_up"]').type("30")
    cy.get('input[placeholder="Email"]').type('Test@curvox.de')
    cy.contains("Add Insurance").click()
    cy.contains("Enter valid email address.")
  });
  it('Case 10: Add Negative Number in Timely Filing Days', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("-30")
    cy.get('[data-testid="insurance_follow_up"]').type("30")
    cy.contains("Add Insurance").click()
    cy.contains("Please Enter Valid Timely Filing Days")
  });
  it('Case 11: Add Negative Number in Follow-Up Days', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').type("30")
    cy.get('[data-testid="insurance_follow_up"]').type("-30")
    cy.contains("Add Insurance").click()
    cy.contains("Please Enter Valid Follow-Up Day")
  });
  it('Case 12: Add Decimal Number in Timely Filing Days', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').click({force:true}).type("20.5")
    cy.get('[data-testid="insurance_follow_up"]').click({force:true}).type("30")
    cy.contains("Add Insurance").click()
    cy.contains("Please Enter Valid Timely Filing Days")
  });
  it('Case 13: Add Decimal Number in Follow-Up Days', () => {
    cy.contains("Add New Insurances").click()
    cy.get('input[placeholder="Insurance Name"]').type('WBT Test Insurance');
    cy.get('[data-testid="singleDropdownSelectedValue-insurance_type_testid"]').click()
    cy.get('[data-testid="singleDropdownOption-insurance_type_testid"]').contains("Government").click()
    cy.get('[data-testid="insurance_timely_filing"]').click({force:true}).type("30")
    cy.get('[data-testid="insurance_follow_up"]').click({force:true}).type("12.7")
    cy.contains("Add Insurance").click()
    cy.contains("Please Enter Valid Follow-Up Day")
  });
});