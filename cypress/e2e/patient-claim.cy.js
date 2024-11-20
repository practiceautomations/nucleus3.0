beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();  
  cy.wait(1000);
  cy.visit('/app/patient-search')
});

describe('Test Case for WBT-260, Add New Insurance',()=>{
  it('Case 1: Add a new insurance with a patient',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(20000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click({force:true});
    cy.findByText("Add New Insurance").click();
    cy.wait(3000)
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.get('span[class="block"]').contains('Whitebox test Insurance').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.get('span[class="block"]').contains('Primary').click()
    cy.get('[data-testid="insnumber"]').clear().type("QA152634")
    cy.get('[data-testid="prc"]').eq(3).click();
    cy.get('span[class="block"]').contains('Self').click()
    cy.wait(3000)
    cy.findByText("Save New Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Added')
  });

  it('Case 2: Validate the Insurance Edit functionality',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(20000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click();
    cy.get('img[alt="pencil"]').click()
    cy.wait(3000)
    cy.get('[data-testid="insnumber"]').clear().type("NB7843915")
    cy.findByText("Save New Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Insurance Update Successfully')
  });

  it('Case 3: Delete an Insurance, attached to a patient',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click();
    cy.findByText("Add New Insurance").click();
    cy.wait(3000)
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("Whitebox test Insurance").click();
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText("Primary").click();
    cy.get('[data-testid="insnumber"]').clear().type("QA152634")
    cy.get('[data-testid="prc"]').eq(3).click();
    cy.findByText("Self").click();
    cy.wait(3000)
    cy.findByText("Save New Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Successfully Added')
    cy.wait(3000)
    cy.get('img[alt="trash"]').click()
    cy.wait(3000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Deleted Successfully')
  });

  it('Case 4: Validate the validations by leave all the fields blank, insurance tab',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click();
    cy.findByText("Add New Insurance").click();
    cy.wait(3000)
    cy.findByText("Save New Insurance").click()
    cy.findByText('This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.')
  });

  it('Case 5: Validate the max length of the Subscriber ID',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click();
    cy.get('img[alt="pencil"]').click()
    cy.wait(3000)
    cy.get('[data-testid="insnumber"]').clear().type("2563189534HBI42939725KH153298563")
    cy.findByText("Save New Insurance").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Insurance number must be in 29 digits')
  });

});