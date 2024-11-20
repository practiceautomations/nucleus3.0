beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/practices')
});
describe('Test Case for WBT-428, Create Practice', () => {
  it('Case 1: Add a new Practice ', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="Practice Name"]').type('WBT Test Practice');
    cy.get('input[placeholder="NPI Number"]').type('1245963879');
    cy.wait(1000)
    cy.contains("Save Changes").click()
    cy.contains("Practice Successfully Created")
  });
  it('Case 2: Edit the data of existing Practice', () => {
    cy.get('[data-testid="practiceFilter"]').type("WBT Test Practice")
    cy.get('[data-testid="showInActivePractice"]').check()
    cy.wait(1000)
    cy.get('[data-testid="practice_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('input[placeholder="Practice Name"]').clear().type('Update Practice');
    cy.contains("Save Changes").click()
    cy.contains("Practice Successfully Saved")
  });
  it('Case 4: Active any Inactive Practice', () => {
    cy.get('[data-testid="practiceFilter"]').type("Update Practice")
    cy.get('[data-testid="showInActivePractice"]').check()
    cy.get('[data-testid="practice_row"]').first().click();
    cy.contains("Activate").click()
    cy.contains("Yes, Activate Practice").click()
    cy.contains("User Successfully Activated")
  });
  it('Case 3: Inactive a Practice', () => {
    cy.get('[data-testid="practiceFilter"]').type("Update Practice")
    cy.get('[data-testid="showInActivePractice"]').check()
    cy.wait(1000)
    cy.get('[data-testid="practice_row"]').first().click()
    cy.contains("Inactivate").click()
    cy.contains("Yes, Inactivate Practice").click()
    cy.wait(2000)
    cy.contains("User Successfully Inactivated")
  });

  it('Case 5: Validate the warning by clicking on the Cancel button', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="Practice Name"]').type('WBT Test Practice')
    cy.wait(1000)
    cy.contains("Cancel").click()
    cy.contains('Are you sure you want to cancel creating this Practice? Clicking "Confirm" will result in the loss of all changes.')
  });
  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="NPI Number"]').type('1245963879');
    cy.wait(1000)
    cy.contains("Save Changes").click()
    cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });
  it('Case 7: Validate the NPI number length', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="Practice Name"]').type('WBT Test Practice');
    cy.get('input[placeholder="NPI Number"]').type('1236584978562');
    cy.wait(1000)
    cy.contains("Save Changes").click()
    cy.contains("NPI is invalid.  Please enter a valid NPI.")
  });
  it('Case 8: Validate the Taxonomy length', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="Practice Name"]').type('WBT Test Practice');
    cy.get('input[placeholder="NPI Number"]').type('4521659875');
    cy.get('input[placeholder="Taxonomy"]').type('1236548963123');
    cy.wait(1000)
    cy.contains("Save Changes").click()
    cy.contains("NPI is invalid.  Please enter a valid NPI.")
  });
  it('Case 9: Validate the Tax ID length', () => {
    cy.findByText("Create New Practice").click()
    cy.get('input[placeholder="Practice Name"]').type('WBT Test Practice');
    cy.get('input[placeholder="NPI Number"]').type('4521659875');
    cy.get('input[placeholder="Tax ID"]').type('1236548963123');
    cy.wait(1000)
    cy.contains("Save Changes").click()
    cy.contains("Tax ID number is invalid.  Please enter a valid Tax ID.") 
  });
});
