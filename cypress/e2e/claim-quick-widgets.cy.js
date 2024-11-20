beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(1000);
  cy.get('[alt="documentText"]').click();
  cy.findByText('All Claims').click({ force: true });
  cy.location('pathname').should('match', /\/all-claims$/); 
  // cy.findByTestId('Org').click();
  // cy.get('span:contains("Whitebox Organization test"):first').click();
  // cy.get('[data-testid="org_confirm"] > .rounded-md').click()  
});
describe('Test Case for: WBT-33, Quick Filters from Widgets & Cards',()=>{
  it('Case 1: Validate the All Claim filter tag in the grid',()=>{
  
    cy.get('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  h-[38px] place-self-end justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px] "]').click()
    cy.get('div[class="py-[2px] text-sm text-cyan-700"]').should('have.text',"All Claims")
  });
  it('Case 2: Validate the Claim Filters Present in the "Claims within the selected date range" section',()=>{ 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(0).click()
    cy.contains('div', 'Draft Claims - To submit') // Search for a <div> element containing the text 'Patient: Jutt Alex's'
      .should('be.visible') // Ensure that the element is visible
      .click() 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims') // Search for a <div> element containing the text 'Patient: Jutt Alex's'
      .should('be.visible') // Ensure that the element is visible
      .click() 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(2).click()
    cy.contains('div', 'Closed Claims') // Search for a <div> element containing the text 'Patient: Jutt Alex's'
      .should('be.visible') // Ensure that the element is visible
      .click()  
  });
  it('Case 3: Validate the Claim Filters Present in the "Blocked - Requires Immediate Action - To submit" section',()=>{ 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(3).click()
    cy.contains('div', 'Blocked - Requires Immediate Action - To submit') 
      .should('be.visible') 
      .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(0).click()
    cy.contains('div', 'Invalid - Rejected by PAPM') 
      .should('be.visible') 
      .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Rejected by Clearinghouse') 
    .should('be.visible') 
    .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(2).click()
    cy.contains('div', 'Rejected By Payer') 
    .should('be.visible') 
    .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(3).click()
    cy.contains('div', 'Denied') 
    .should('be.visible') 
    .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(4).click()
    cy.contains('div', 'Denied Appeal') 
    .should('be.visible') 
    .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(5).click()
    cy.contains('div', 'Denied partially') 
    .should('be.visible') 
    .click()
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(6).click()
    cy.contains('div', 'Partially Paid') 
    .should('be.visible') 
    .click()
  });
  it('Case 4: Validate the Claim Filters Present in the "Idle - Requires Action" section',()=>{ 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(4).click()
    cy.contains('div', 'Idle - Requires Action') 
      .should('be.visible') 
      .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(7).click({force: true})
    cy.get('div[class="py-[2px] text-sm text-cyan-700"]').should('have.text', 'Draft Claim')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(8).click({force: true})
    cy.contains('div', 'Review') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(9).click({force: true})
    cy.contains('div', 'Hold') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(10).click({force: true})
    cy.contains('div', 'Ready to Bill Primary Insurance') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(11).click({force: true})
    cy.contains('div', 'Ready to Bill Secondary Insurance') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(12).click({force: true})
    cy.contains('div', 'Ready to Bill Patient') 
    .scrollIntoView()
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(13).click({force: true})
    cy.contains('div', 'Hold by AR') 
    .should('be.visible')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(14).click({force: true})
    cy.contains('div', 'Ready to Appeal') 
    .should('be.visible')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(15).click({force: true})
    cy.contains('div', 'Ready to Rebill') 
    .should('be.visible')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(16).click({force: true})
    cy.contains('div', 'Crossover by primary Insurance') 
    .should('be.visible')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(17).click({force: true})
    cy.contains('div', 'Open - with an outstanding balance') 
    .scrollIntoView()
    .should('be.visible')    
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(18).click({force: true})
    cy.contains('div', 'Patient Responsibility') 
    .should('be.visible')   
  });

  it('Case 5: Validate the Claim Filters Present in the "In Process - No Action Required" section',()=>{ 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(5).click()
    cy.contains('div', 'In Process - No Action Required') 
      .should('be.visible') 
      .click() 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(19).click({force: true})
    cy.get('div[class="py-[2px] text-sm text-cyan-700"]').should('have.text', 'Billed to Primary or Secondary Insurance')
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(20).click({force: true})
    cy.contains('div', 'Billed to Patient') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(21).click({force: true})
    cy.contains('div', 'Acknowledge by Payer') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(22).click({force: true})
    cy.contains('div', 'Accepted by Clearinghouse') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(23).click({force: true})
    cy.contains('div', 'Appealed to Primary or Secondary Insurance') 
    .should('be.visible') 
    cy.get('button[class="items-center truncate bg-transparent text-sm font-medium text-cyan-500 "]').eq(24).click({force: true})
    cy.contains('div', 'Appeal Paid')
    .scrollIntoView() 
    .should('be.visible') 
  });
  it('Case 6: Validate the multiple filters, select multiple filters',()=>{ 
   cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(0).click()
    cy.contains('div', 'Draft Claims - To submit') 
      .should('be.visible') 
      .click() 
    cy.get('div[class="select2-selection__input-container css-6j8wv5-Input"]').type('John');
    cy.wait(3000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Patient: Butt John') 
      .should('be.visible') 
      .click() 
  });
  it('Case 7: Validate the All Claim tag in the grid, after closing the secondary search tag',()=>{ 
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(0).click()
    cy.contains('div', 'Draft Claims - To submit') 
      .should('be.visible') 
      .click() 
    cy.get('button[class="py-[2px] text-sm font-bold text-cyan-400"]').click()
    cy.contains('div', 'All Claims') 
  }); 
});