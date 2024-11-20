beforeEach(() => {
    cy.login('testwhitebox@gmail.com', 'i70A5@#K')
    cy.visit('/')
    cy.wait(3000);
    cy.get('[alt="patient"]').click();
    cy.findByText('Patient Search').click({ force: true });
    cy.location('pathname').should('match', /\/patient-search$/);
    cy.wait(5000);
    cy.findByTestId('Org').click();
    cy.wait(5000);
    cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
    cy.get('[data-testid="org_confirm"] > .rounded-md').click()
    // cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
    // cy.findByText('Confirm').click();    
    cy.wait(1000);

})
describe('WBT: PA-1498 - Patient Search: Get List of Saved Search API',()=>{
  it('Case 1: Validate the Saved Search list by adding a new Saved Search Report',()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('pln').type('Doe');
    cy.get('[data-testid="prc"]').eq(0).click({force: true});
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
    cy.findByText('Saved Searches').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.wait(500);
  });
  it('Case 2: Validate the Saved Search List',()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('pln').type('Doe');
    cy.get('[data-testid="prc"]').eq(0).click({force: true});
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test2');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
    cy.findByText('Saved Searches').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test2').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.wait(500);
  });
  it('Case 3: Validate the Saved Search button, when there is no Saved Search List ',()=>{
    cy.findByText('Saved Searches').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','No Data Found');
  });
  it('Case 4: Validate the Saved Search List, if there are multiple saved search reports',()=>{
    cy.findByTestId('pfn').type('First');
    cy.findByTestId('pln').type('Patient');
    cy.get('[data-testid="prc"]').eq(0).click({force: true});
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('First List');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
    
    cy.findByTestId('pfn').clear().type('Second');
    cy.findByTestId('pln').clear().type('Patient');
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Second List');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();

    cy.findByTestId('pfn').clear().type('Third');
    cy.findByTestId('pln').clear().type('Patient');
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Third List');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();

    cy.findByTestId('pfn').clear().type('Fourth');
    cy.findByTestId('pln').clear().type('Patient');
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Fourth List');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
    cy.findByText('Saved Searches').click();
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','First List');
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Second List');
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Third List');
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Fourth List');
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','First List').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Second List').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Third List').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Fourth List').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.wait(500);
  });
  it('Case 5: Validate the fields data based on Organizational Selector',()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('pln').type('Doe');
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Test Report');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
    cy.findByText('Saved Searches').click();
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Test Report').click();
    cy.findByText("Apply Search").click();
    cy.get('[data-testid="pfn"]').should('have.value', 'John');
    cy.get('[data-testid="pln"]').should('have.value', 'Doe');
    cy.findByText('Saved Searches').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Test Report').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.wait(500);
  });
  it('Case 6: Validate the Saved Search List by adding two reports with same name',()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('pln').type('Doe');
    cy.get('[data-testid="prc"]').eq(0).click({force: true});
    cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.findByText("PAPM DEMO Practice 8").click();
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()
  
    cy.findByTestId('pfn').clear().type('John');
    cy.findByTestId('pln').clear().type('Doe');
    cy.get('[alt="plus1"]').click();
    cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test');
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'A Saved Search is already present with this name');
    cy.findByText('Saved Searches').click()
    cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
    cy.get('[alt="trash"]').click();
    cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
    cy.wait(500);
  });
});

describe('WBT: PA-971 - Edit and Delete Patient Saved Searches',()=>{
it('Scenario 1: Validate the Saved Search Add Functionality',()=>{
  cy.findByTestId('pfn').type('John');
  cy.findByTestId('pln').type('Doe');
  cy.contains ('span[class="block truncate"]', 'Search practice').click();
  cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
  cy.findByText('Saved Searches').click();
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click();
  cy.wait(500);
});
it('Scenario 2: Validate the Duplicate Saved Search Add Functionality',()=>{
  cy.findByTestId('pfn').type('John');
  cy.findByTestId('pln').type('Doe');
  cy.get('[data-testid="prc"]').eq(0).click({force: true});
  cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
  cy.contains ('span[class="block truncate"]', 'Search practice').click();
  cy.findByText("PAPM DEMO Practice 8").click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()

  cy.findByTestId('pfn').clear().type('John');
  cy.findByTestId('pln').clear().type('Doe');
  cy.get('[data-testid="prc"]').eq(0).click({force: true});
  cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
  cy.findByText("PAPM DEMO Practice 8").click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('Unit Test2');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
  cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Saved Search is already present with the Same Data');
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test2').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()

  cy.wait(500);
});
it('Scenario 3: Validate the Saved Search Edit Functionality',()=>{
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="pencil"]').click();
  cy.findByTestId('pfn').clear().type('Mark');
  cy.findByText('Save');
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search Updated Successfully');  
});
it('Scenario 4: Validate the Saved Search Edit Functionality with empty values',()=>{
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="pencil"]').click();
  cy.findByTestId('pfn').clear();
  cy.findByTestId('pfn').clear();
  cy.findByTestId('prc').clear();
  cy.contains ('span[class="block truncate"]', 'Search practice').clear();
  cy.findByText('Save');
  cy.contains ('p[class="text-sm font-medium text-red-800"]', 'At least one field should have value in it to save');  
});
it('Scenario 5: Validate the Saved Search Delete Functionality',()=>{
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
  cy.wait(500);
});
it('Scenario 6: Validate the Apply Search Functionality',()=>{
  cy.findByTestId('pfn').type('John');
  cy.findByTestId('pln').type('Doe');
  cy.contains ('span[class="block truncate"]', 'Search practice').click();
  cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('Test WBT-7');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
  cy.findByText('Saved Searches').click();
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Test WBT-7').click();
  cy.findByText("Apply Search").click();
  cy.get('[data-testid="pfn"]').should('have.value', 'John');
  cy.get('[data-testid="pln"]').should('have.value', 'Doe');
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Test WBT-7').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
  cy.wait(500);
});
it('Scenario 7: Validate the Delete functionality when user select “No” from verification pop-up',()=>{
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.get('[alt="trash"]').click();
  cy.findByText('Cancel').click();
});
it('Scenario 8: Validate the Saved Search Report by selecting an existing report then select another report then select the report that selected at first',()=>{
  cy.findByTestId('pfn').type('John');
  cy.findByTestId('pln').type('Doe');
  cy.get('[data-testid="prc"]').eq(0).click({force: true});
  cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
  cy.contains ('span[class="block truncate"]', 'Search practice').click();
  cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('WBT-72');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click();
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
  cy.findByText('Saved Searches').click();
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','WBT-72').click();
  cy.findByText("Apply Search").click();
  cy.get('[data-testid="pfn"]').should('have.value', 'John');
  cy.get('[data-testid="pln"]').should('have.value', 'Doe');
  cy.findByText('Saved Searches').click();
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Unit Test').click();
  cy.findByText("Apply Search").click();
  cy.findByText('Saved Searches').click();
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','WBT-72').click();
  cy.findByText("Apply Search").click();
  cy.get('[data-testid="pfn"]').should('have.value', 'John');
  cy.get('[data-testid="pln"]').should('have.value', 'Doe');
  cy.get('[data-testid="prc"]').eq(0).click({force: true});
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','WBT-72').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
  cy.wait(500);
});
});

describe('Test Case for: WBT-36, Patient Search - Saved Search',()=>{
it('Case1: Validate the Search Parameter box Show state',()=>{
  cy.contains('p[class="text-sm font-medium uppercase leading-tight tracking-wide text-gray-500"]', 'Hide Search Parameters').click();
  cy.contains('p[class="text-sm font-medium uppercase leading-tight tracking-wide text-gray-500"]', 'Show Search Parameters').click();
  cy.contains('p[class="text-sm font-medium uppercase leading-tight tracking-wide text-gray-500"]', 'Hide Search Parameters');
});
it('Case2: Validate the Add Saved Search Button when there is no data in the fields',()=>{
  cy.findByTestId('pfn').clear()
  cy.findByTestId('pln').clear();
  cy.get('button[data-testid="prc"]:first').should('have.value', '');
  cy.contains ('span[class="block truncate"]', 'Search practice').should('have.value', '');;
 // cy.get('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-300  h-[38px] w-[38px] flex items-center justify-center !px-2 !py-1 bg-gray-100  gap-2 leading-5 "]').invoke('attr', 'disabled')
});
it('Case3: Validate the Saved Search list by adding a new Saved Search Report',()=>{
  cy.findByTestId('pfn').type('Dale');
  cy.findByTestId('pln').type('Smith');

  cy.contains ('span[class="block truncate"]', 'Search practice').click();
  cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
  cy.get('[alt="plus1"]').click();
  cy.findAllByPlaceholderText('Type new saved search name here').type('Patient Search');
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent bg-cyan-500 focus:ring-cyan-500 hover:bg-cyan-700 text-white  focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium  "]', 'Create').click()
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Saved Search successfully added');
  cy.findByText('Saved Searches').click()
  cy.contains('div[class="h-[32px] text-left text-sm leading-loose  hover:bg-gray-100"]','Patient Search').click();
  cy.get('[alt="trash"]').click();
  cy.contains ('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700  flex items-center justify-center flex-1 "]', 'Delete').click()
  cy.wait(500);  
});
});

 describe('Test Case for: WBT-34, Patient Search',()=>{
  it('Case 1: Validate the Search Parameters fields by adding data in fields', ()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('pln').type('Doe');
    cy.get('button[class="flex items-center justify-between w-full px-3 py-2 bg-white border rounded-md border-gray-300"]').type('07/15/1933');
    cy.get('[data-testid="prc"]').eq(3).click();
    cy.findByPlaceholderText('Type to search...').type('Medicare Part B/Novitas Solutions').click();
    cy.findByTestId('patsearch').click();
    cy.get('[data-testid="patfn"]').should('have.text', 'John');
    cy.get('[data-testid="patln"]').should('have.text', 'Doe');
    cy.get('[data-testid="dob"]').should('have.text', '07/15/1933');
    cy.get('[data-testid="ins"]').should('have.text', 'Medicare Part B/Novitas Solutions');
  });
  it('Case 2: Validate the data by adding only First Name in the Search Parameters',()=>{
    cy.findByTestId('pfn').type('John');
    cy.findByTestId('patsearch').click();
    cy.contains('div[class="cursor-pointer text-cyan-500"]','John')
  });
  it('Case 3: Validate the data by adding only Last Name in the Search Parameters',()=>{
    cy.findByTestId('pln').type('Doe');
    cy.findByTestId('patsearch').click();
    cy.contains('div[class="cursor-pointer text-cyan-500"]','Doe')
  });

  it('Case 4: Validate the data by adding only DOB in the Search Parameters',()=>{
    cy.get('button[class="flex items-center justify-between w-full px-3 py-2 bg-white border rounded-md border-gray-300"]').type('07/15/1933');
    cy.findByTestId('patsearch').click();
    cy.get('[data-testid="dob"]').should('have.text', '07/15/1933');
  });
  it('Case 5: Validate the grid data by selecting Active status as No',()=>{
    cy.get('[data-testid="radiobuttons"]').eq(1).check();
    cy.findByTestId('patsearch').click();
    cy.findByText('No')
  });
    it('Case 6: Validate the grid data by selecting Active status as Yes',()=>{
    cy.get('[data-testid="radiobuttons"]').eq(0).check({force:true});
    cy.findByTestId('patsearch').click();
    cy.get('div[class="MuiDataGrid-cell MuiDataGrid-cell--textLeft"]').eq(2).should('have.text','Yes')
  });
  it('Case 7: Validate the data by Selecting an Insurance from the Dropdown',()=>{
    cy.get('[data-testid="prc"]').eq(3).click({force:true});
    cy.findByPlaceholderText('Type to search...').type('Medicare Part B/Novitas Solutions').click();
    cy.findByTestId('patsearch').click({force: true});
    cy.get('[data-testid="ins"]').eq(2).should('have.text', 'Medicare Part B/Novitas Solutions');
  });
  it('Case 8: Validate the Search button without adding any data in the Search Parameters fields',()=>{
    cy.findByTestId('patsearch').click();
    cy.get('span:contains("PAPM DEMO Organization 12"):first');
    cy.get('div:contains("PAPM DEMO Practice 8"):first');
  });
  it('Case 9: Validate the Data by selecting the Location Section fields',()=>{
    cy.get('[data-testid="prc"]').eq(0).click({force: true});
    cy.get('span:contains("PAPM DEMO Organization 12"):first').click();
    cy.contains ('span[class="block truncate"]', 'Search practice').click();
    cy.get('span:contains("PAPM DEMO Practice 8"):first').click();
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('PAPM DEMO Provider 16').click();
    cy.findByTestId('patsearch').click();   
    cy.get('span:contains("PAPM DEMO Organization 12"):first');
    cy.get('div:contains("PAPM DEMO Practice 8"):first');
  });
 });