beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/providers')
});
describe('Test Case for WBT-427, Create Providerr', () => {
  it('Case 1: Add a new Provider', () => {
    cy.findByText("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('WBT Test');
    cy.get('input[placeholder="Last Name"]').type('Provider');
    cy.get('input[placeholder="Short Name"]').type('Provider');
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
  });
  it('Case 2: Edit the data of existing Provider', () => {
    cy.get('[data-testid="practicesFilterTestId"]').type("ss")
    cy.wait(1000)
    cy.get('[data-testid="providers_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('input[placeholder="First Name"]').clear().type('Update Provider');
    cy.contains("Save Changes").click()
  });
  it('Case 3: Inactive a Provider', () => {
    cy.get('[data-testid="practicesFilterTestId"]').type("Provider")
    cy.wait(1000)
    cy.get('[data-testid="providers_row"]').eq(2).click()
    cy.contains("Inactivate").click()
    cy.contains("Yes, Inactivate Provider").click()
    cy.wait(2000)
  });
  it('Case 4: Active any Inactive Provider', () => {
    cy.get('[data-testid="showInActiveProvider"]').check()
    cy.get('[data-testid="practicesFilterTestId"]').type("Provider")
    cy.get('[data-testid="providers_row"]').eq(2).click();
    cy.contains("Activate").click()
    cy.contains("Yes, Activate Provider").click()
  });
  it('Case 5: Validate the warning by clicking on the Cancel button', () => {
    cy.findByText("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('WBT Test');
    cy.wait(1000)
    cy.contains("Cancel").click()
    cy.contains('Are you sure you want to cancel creating this Provider? Clicking "Confirm" will result in the loss of all changes')
  });
  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.findByText("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('WBT Test');
    cy.contains("Add Provider").click()
    cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

  it('Case 7: Validate the NPI number length', () => {
    cy.contains("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('NPI');
    cy.get('input[placeholder="Last Name"]').type('Provider');
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="NPI Number"]').type('1236584978562');
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
    cy.contains("NPI is invalid.  Please enter a valid NPI.")
  });
  it('Case 8: Validate the Taxonomy length', () => {
    cy.contains("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('NPI');
    cy.get('input[placeholder="Last Name"]').type('Provider');
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="NPI Number"]').type('4521659875');
    cy.get('input[placeholder="Taxonomy"]').type('123454562698756');
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
    cy.contains("Taxonomy is invalid.  Please enter a valid Taxonomy Code.")
  });
  it('Case 9: Email Validation, enter invalid email', () => {
    cy.contains("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type('NPI');
    cy.get('input[placeholder="Last Name"]').type('Provider');
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="NPI Number"]').type('4521659875');
    cy.get('input[placeholder="Taxonomy"]').type('123454562698756');
    cy.get('input[placeholder="Email"]').type('@gmail.com');
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains('Add Provider').click()
    cy.contains("Enter valid email address.")
  });
  it('Case 10: Email Validation, Email without Dot in Domain', () => {
    cy.contains('Add New provider').click()
    cy.get('input[placeholder="First Name"]').type("Email")
    cy.get('input[placeholder="Last Name"]').type("Provider")
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="Taxonomy"]').type("1265984563")
    cy.get('input[placeholder="Email"]').type("Test@gmailcom")
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
    cy.contains("Enter valid email address.")
  });
  it('Case 11: Email Validation,2 character extension email', () => {
    cy.contains("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type("Email")
    cy.get('input[placeholder="Last Name"]').type("Provider")
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="Taxonomy"]').type("1265984563")
    cy.get('input[placeholder="Email"]').type("Test@curvox.de")
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
    cy.contains("Provider Successfully Created")

  });
  it('Case 12: Email Validation, multiple Dots in Domain', () => {
    cy.contains("Add New provider").click()
    cy.get('input[placeholder="First Name"]').type("Email")
    cy.get('input[placeholder="Last Name"]').type("Provider")
    cy.get('input[placeholder="Short Name"]').type('npi validation');
    cy.get('input[placeholder="Taxonomy"]').type("1265984563")
    cy.get('input[placeholder="Email"]').type("Test@gmail.co.uk")
    cy.get('[data-testid="workingDaysID"]').click()
    cy.get('span[class="ml-6 block"]').contains("Monday").click()
    cy.wait(1000)
    cy.contains("Add Provider").click()
    cy.contains("Provider Successfully Created")
  });
});
