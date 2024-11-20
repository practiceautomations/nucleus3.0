beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(2000)
  cy.get('img[alt="patient"]').click()
  cy.findByText("Patient Search").click()
  cy.wait(3000)
  cy.findByTestId('Org').click();
  cy.wait(2000)
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.wait(1000)
  cy.get('[data-testid="org_confirm"] > .rounded-md').click()
});

describe('Test Case for WBT-150, Verify Guarantor',()=>{
  it('Case 1: Validate the Add Note functionality in Patient Create',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.findByText("#152149").click()
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(1).click();
    cy.findByText("Add New Guarantor").click();
    cy.wait(3000)
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.get('span[class="block "]').contains('Employee').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.get('span[class="block "]').contains('Female').click()
    cy.get('[data-testid="guarantorfn"]').clear().type("Arooj")
    cy.get('[data-testid="guarantorln"]').clear().type("Fatima")
    cy.get('[data-testid="guarantor_dob"]').clear().type("06/01/2023")
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.get('span[class="block "]').contains('TX').click()
    cy.get('[data-testid="guarantor_address"]').clear().type("124 street")
    cy.get('[data-testid="guarantor_city"]').clear().type("Dallas")
    cy.get('[data-testid="guarantor_zipcode"]').clear().type("12345")
    cy.wait(3000)
    cy.findByText("Save New Guarantor").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Guarantor saved successfully')
  });

   it('Case 2: Validate the Guarantor edit functionality',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.findByText("#152148").click()
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(1).click();
    cy.get('img[alt="pencil"]').scrollIntoView().click();
    cy.wait(3000)
    cy.get('[data-testid="guarantorfn"]').clear().type("Maida")
    cy.wait(3000)
    cy.findByText("Save New Guarantor").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Guarantor Updated Successfully')
  });

  it('Case 4: Validate the validations by leave all the fields blank, Guarantor tab',()=>{
    cy.get('[data-testid="patsearch"]').click()
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(15000)
    cy.get('[data-testid="RegisterPatientGuarantorTabTestId"]').first().click();
    cy.get('[data-testid="RegisterPatientGuarantorTabAddBtnTestId"]').first().click();
    cy.wait(3000)
    cy.get('[data-testid="RegisterPatientGuarantorTabUpdateBtnTestId"]').first().click();
    cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.").eq(0)
  });
});