beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000) 
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(4000)
  cy.visit('/setting/menu-roles')
});
describe('Test Case for WBT-431, Create Menu Role', () => {
  it('Case 1: Add a new Menu Role', () => {
    cy.findByText("Create New Menu Role").click()
    cy.get('input[placeholder="Menu Role Name"]').type('WBT Menu Role')
    cy.get('input[placeholder="Menu Role Code"]').type('123WBT')
    cy.get('input[placeholder="Menu Role Description"]').type('This Menu Role is created for testing purpose')
    cy.findByText("Create Menu Role").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Menu Role Added Successfully')
  });
  it('Case 2: Edit the data of existing menu role', () => {
    cy.get('[data-testid="menu_role_row"]').last().click();
    cy.findByText("Edit").click()
    cy.get('input[placeholder="Menu Role Description"]').clear().type('Updated Description, This Menu Role is created for testing purpose')
    cy.findByText("Save Changes").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Menu Role Successfully Saved')
  });
  it('Case 3: Inactivate a Menu Role', () => {
    // cy.findByText("Create New Menu Role").click()
    // cy.get('input[placeholder="Menu Role Name"]').type('WBT Menu Role')
    // cy.get('input[placeholder="Menu Role Code"]').type('WBTCode')
    // cy.get('input[placeholder="Menu Role Description"]').type('This Menu Role is created for testing purpose')
    // cy.findByText("Create Menu Role").click()
    // cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Menu Role Successfully Created')
    cy.wait(1000)
    cy.get('[data-testid="menu_role_row"]').last().click();
    cy.contains("Inactivate").click()
    cy.contains("Yes, Inactivate Menu Role").click()
    cy.wait(2000)
  });
  it('Case 4: Activate any Inactive Menu Role', () => {
    cy.get('[data-testid="showInActiveMenu"]').check()
    cy.get('[data-testid="menu_role_row"]').last().click();
    cy.contains("Activate").click()
    cy.contains("Yes, Activate Menu Role").click()
  });
  it('Case 5: Validate the warning by clicking on the Cancel button', () => {
      cy.findByText("Create New Menu Role").click()
      cy.get('input[placeholder="Menu Role Name"]').type('WBT Menu Role')
      cy.get('input[placeholder="Menu Role Code"]').type('123WBT')
      cy.get('input[placeholder="Menu Role Description"]').type('This Menu Role is created for testing purpose')
      cy.findByText("Cancel").click()
      cy.contains('Are you sure you want to cancel creating this Menu Role? Clicking "Confirm" will result in the loss of all changes')
  });
  it('Case 6: Validate the Required Validation by leaving required fields blank', () => {
    cy.findByText("Create New Menu Role").click()
    cy.get('input[placeholder="Menu Role Name"]').type('WBT Menu Role')
    cy.findByText("Create Menu Role").click()
    cy.contains ('This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.')
  });
});