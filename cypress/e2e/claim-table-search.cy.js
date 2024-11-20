beforeEach(() => {
    cy.login('testwhitebox@gmail.com', 'i70A5@#K')
    cy.visit('/')
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.location('pathname').should('match', /\/all-claims$/);   
    cy.wait(2000)
    cy.findByTestId('Org').click();
    cy.wait(2000)
    cy.get('span:contains("Whitebox Organization test"):first').click();
    cy.get('[data-testid="org_confirm"] > .rounded-md').click()
});
describe('Test Case for: WBT-32, All Claims Table Search Criteria',()=>{
  it('Case 1: Validate the Search Dropdown data',()=>{ 
    cy.findByTestId("clmsch").type('John')
  });
  it('Case 2: Validate the search by adding the Patients First Name in the Search field',()=>{
    cy.findByTestId("clmsch").type('John');
    cy.wait(3000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]:first').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Patient: Butt John') 
      .should('be.visible') 
      .click() 
  });
  it('Case 3: Validate the Search by adding the Patients Last Name',()=>{
    cy.findByTestId("clmsch").type('Butt')
    cy.wait(3000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Patient: Butt John') 
      .should('be.visible') 
      .click() 
  });
  it('Case 4: Validate the Search by adding Patient Name in which "punctuation mark" is included',()=>{
    cy.findByTestId("clmsch").type('Alex\'s')
    cy.wait(3000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Patient: Jutt Alex\'s') 
      .should('be.visible') 
      .click()   
  });
  it('Case 5: Validate the Search Property by adding some characters of a Patients Name',()=>{ 
    cy.findByTestId("clmsch").type('hn')
    cy.wait(3000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Patient: Butt John') 
      .should('be.visible') 
      .click() 
  });
  it('Case 6: Validate the search by adding the Claim ID in the Search field',()=>{ 
    cy.findByTestId("clmsch").type('198944')
    cy.wait(8000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#198944') 
      .should('be.visible')       
  });
  it('Case 7: Validate the Search by adding the Claim ID with the text Claim ID',()=>{ 
    cy.findByTestId("clmsch").type('19452632');
    cy.wait(5000);
    cy.get('[data-testid="no_record"]').should('have.text','No Record Found');
  });
  it('Case 8: Validate the search by adding the DOS in the Search field',()=>{ 
    cy.findByTestId("clmsch").type('08/08/2023')
    cy.wait(8000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'DoS: 08/08/2023') 
      .should('be.visible')    
  });
  it('Case 9: Validate the Search Property by adding DOS without Date format',()=>{ 
    cy.findByTestId("clmsch").type('02172023');
    cy.wait(5000);
    cy.get('[data-testid="no_record"]').should('have.text','No Record Found');
  });
  it('Case 10: Validate the search by adding the Insurance Name in the Search field',()=>{ 
    cy.findByTestId("clmsch").type('Medicare Part B/Novitas Solutions')
    cy.wait(5000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]:first').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Insurance: Medicare Part B/Novitas Solutions')
      .should('be.visible')     
  });
  it('Case 11: Validate the search field without entering any input',()=>{ 
    cy.findByTestId('ds')
      .should('be.disabled')
      .click()
      .should('be.disabled')
  });
});
