beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000) 
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(2000)
  cy.visit('/app/all-claims')

});

describe('Test Case for: WBT-141, Update and Create Note to claim',()=>{
  it('Case 1: Validate the Create Note functionality in Edit claim',()=>{
    cy.findByTestId("clmsch").type('198368')
    cy.wait(10000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').should('be.visible').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198368').should('be.visible')
    cy.findByText("#198368").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.contains("Add Note").click()
    cy.findByText("Select note type from the dropdown list").click()
    cy.findByText("Added Charge").click()
    cy.get('[data-testid="sbjinput"]').type("Test Subject Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("One more charge is added in to the claim")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
  });

  it('Case 3: Validate the Claim Notes on the basis of the User',()=>{
    cy.findByTestId("clmsch").type('198368')
    cy.wait(10000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198368').should('be.visible')
    cy.findByText("#198368").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.findByText("Filters").click()
    cy.wait(1000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').contains("People").click({force:true})
    cy.get('span[class="ml-6 block"]').contains("Box Tester, White").click()
    cy.wait(2000)
    cy.findByText("Apply Filters").click()
  });

  it('Case 4: Validate the Claim Notes on the basis of the Note Subject',()=>{
    cy.findByTestId("clmsch").type('198368')
    cy.wait(6000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198368').should('be.visible')
    cy.findByText("#198368").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.findByText("Filters").click()
    cy.wait(4000)
    cy.get('span[class="ml-6 block"]').contains("Added Charge").click({force:true})
    cy.findByText("Apply Filters").click()
    cy.wait(3000)
  });

  it('Case 5: Validate the Create Note functionality without selecting the Subject of the Note',()=>{
    cy.findByTestId("clmsch").type('198368')
    cy.wait(6000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198368').should('be.visible')
    cy.findByText("#198368").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.findByText("Add Note").click()
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Note without a Subject")
    cy.get('[data-testid="addNote"]').click();
    cy.findByText('This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.')
  });

  it('Case 6: Validate the Note Edit functionality by editing a note in claim edit',()=>{
    cy.findByTestId("clmsch").type('198369')
    cy.wait(8000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198369').should('be.visible')
    cy.findByText("#198369").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.findByText("Add Note").click()
    cy.findByText("Select note type from the dropdown list").click()
    cy.get('[data-testid="singleDropdownOption-noteTypeOptionID"]').contains("Added Charge").click()
    cy.get('[data-testid="sbjinput"]').type("Test Subject Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("One more charge is added in to the claim")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
    cy.contains('p[class="cursor-pointer text-sm leading-tight text-cyan-500"]:first','View Note').click()
    cy.get('[data-testid="editNote"]').click()
    cy.get('[data-testid="sbjinput"]').clear().type("Test Subject Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').clear().type("Two charges are added in to the claim")
    cy.contains('p[class="text-sm font-medium leading-tight text-white"]','Save').click()
    cy.contains('p[class="text-sm font-medium text-green-800"]', 'Note Updated successfully')
  });

  it('Case 7: Validate the Create Note functionality from View Claim Notes panel',()=>{
    cy.findByTestId("clmsch").type('198370')
    cy.wait(6000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198370').should('be.visible')
    cy.findByText("#198370").click()   
    cy.wait(8000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.findByText("Add Note").click()
    cy.findByText("Select note type from the dropdown list").click()
    cy.get('[data-testid="singleDropdownOption-noteTypeOptionID"]').contains("Added Charge").click()
    cy.get('[data-testid="sbjinput"]').type("Test Subject Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("One more charge is added in to the claim")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
  });

});