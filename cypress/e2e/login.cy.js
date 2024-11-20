beforeEach(() => {
    cy.login('testwhitebox@gmail.com', 'i70A5@#K')  
    cy.visit('/')
})
describe('Login E2E Tests',()=>{

  it('Scenario 8: Validate loggingout from the application and browsing back using the Browser back button',()=>{
    cy.get('[alt="dash-img"]').click();
    cy.findByText('Logout').click();
    cy.wait(3000);
    cy.go('back');
    cy.location('pathname').should('match', /\/login$/);
  })
});

describe('Test Case for WBT-271, Logging Out',()=>{

it('Case 1: Validate the logging out functionality',()=>{
  cy.get('[alt="dash-img"]').click();
  cy.findByText('Logout').click();
  cy.location('pathname').should('match', /\/login$/);
});

it('Case 2: Validate the session back out, after logout',()=>{
    cy.get('[alt="dash-img"]').click();
    cy.findByText('Logout').click();
    cy.wait(3000);
    cy.go('back');
    cy.wait(3000)
    cy.findByText('Your session has timed out.')
});

});