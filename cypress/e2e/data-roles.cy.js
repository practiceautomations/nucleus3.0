beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/setting/data-roles')
});
describe('Test Case for Data Role', () => {
  it('Case 1:Add a new Data Role', () => {
    cy.contains("Create New Data Role").click();
    cy.get('input[placeholder="Data Role Name"]').type('WBT Data Role');
    cy.get('input[placeholder="Data Role Description"]').type('This Data Role is created for testing purpose');
    cy.get('[data-testid="ToggleBtn-org"]').first().click()
    cy.get('[data-testid="ToggleBtn-prac"]').first().click()
    cy.contains("Create Data Role").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Data Role Successfully Created')
  });

  it('Case 2:Edit the data of existing Data role', () => {
    cy.get('#search').type("WBT Data Role")
    cy.get('[data-testid="showInActiveDataRole"]').check()
    cy.get('[data-testid="dataRole_row"]').first().click()
    cy.contains("Edit").click()
    cy.get('input[placeholder="Data Role Description"]').clear().type('Updated Description, This Data Role is created for testing purpose');
    cy.contains("Save Changes").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Data Role Successfully Saved')
  });

  it('Case 4:Activate any Inactivate Data Role', () => {
    cy.get('#search').type("WBT Data Role")
    cy.get('[data-testid="showInActiveDataRole"]').check()
    cy.get('[data-testid="dataRole_row"]').first().click()
    cy.contains("Activate Data Role").click()
    cy.contains("Yes, Activate Group").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]','Data Role Successfully Activated')
  });

  it('Case 3:Inactivate a Data Role', () => {
    cy.get('#search').type("WBT Data Role")
    cy.get('[data-testid="dataRole_row"]').first().click()
    cy.contains("Inactivate Data Role").click()
    cy.contains("Yes, Inactivate Data Role").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]','Data Role Successfully Inactivated')
  });

  it('Case 5:Validate the warning by clicking on the Cancel button', () => {
    cy.contains("Create New Data Role").click();
    cy.get('input[placeholder="Data Role Name"]').type('WBT Data Role');
    cy.contains("Cancel").click()
    cy.contains('Are you sure you want to cancel creating this Data Role? Clicking "Confirm" will result in the loss of all changes.')
  });

  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.contains("Create New Data Role").click();
    cy.get('input[placeholder="Data Role Name"]').type('WBT Data Role');
    cy.contains("Create Data Role").click() 
    cy.contains('This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.')
  });
});