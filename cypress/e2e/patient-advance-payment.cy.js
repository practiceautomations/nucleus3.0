beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.wait(2000)
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.wait(1000)
  cy.get('[data-testid="org_confirm"] > .rounded-md').click()  
  cy.wait(1000)
  cy.get('img[alt="patient"]').click()
  cy.findByText("Patient Search").click()
});

// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

describe('Test Case for WBT-162, Add an Advance Payment',()=>{
  it('Case 1: Add Advance Payment to a patient with DOS',()=>{ 
    cy.get('[data-testid="patientFn"]').type("hq")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(15000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.get('[data-testid="dateFeildValue-checkDate"]').scrollIntoView();
    cy.get('[alt="calendar"]').eq(0).click();
    cy.findByText('6').click({force:true})
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('6').click({force:true})
    cy.get('[data-testid="payment_amount"]').type("20");
    cy.get('[data-testid="account_type"]').click();
    cy.contains('span', 'Total Payment').click()
    cy.get('[data-testid="advancePayment_comment"]').type("test");
    cy.findByText("Save New Advanced Payment").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Advance Payment added successfully'); 
  });

  it('Case 2: Validate the warning by clicking on the Cancel button',()=>{
    cy.get('[data-testid="patientFn"]').type("hq")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(25000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.get('[data-testid="dateFeildValue-checkDate"]').scrollIntoView();
    cy.get('[alt="calendar"]').eq(0).click();
    cy.findByText('6').click({force:true})
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('6').click({force:true})
    cy.get('[data-testid="payment_amount"]').type("20");
    cy.get('[data-testid="account_type"]').click();
    cy.contains('span', 'Total Payment').click()
    cy.get('[data-testid="CloseBtnAdvancePayment"]').click()
    cy.findByText("Are you sure you want to cancel creating this batch? Clicking 'Confirm' will result in the loss of all changes")
  });
  it('Case 3: Validate the Required Validation by leaving required fields blank',()=>{
    cy.get('[data-testid="patientFn"]').type("hq")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(25000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.findByText("Save New Advanced Payment").click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

  it('Case 4: Add Advance Payment to a patient without DOS',()=>{
    cy.get('[data-testid="patientFn"]').type("hq")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(15000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.get('[data-testid="dateFeildValue-checkDate"]').scrollIntoView();
    cy.get('[alt="calendar"]').eq(0).click();
    cy.findByText('6').click({force:true})
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('6').click({force:true})
    cy.get('[data-testid="payment_amount"]').type("20");
    cy.get('[data-testid="account_type"]').click();
    cy.contains('span', 'Pre-Payment').click()
    cy.get('[data-testid="advancePayment_comment"]').type("test");
    cy.findByText("Save New Advanced Payment").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Advance Payment added successfully');
  });

  it('Case 5: Edit the DOS of an existing Advance Payment',()=>{
    cy.get('[data-testid="patientFn"]').type("newDos")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(25000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.get('[data-testid="updateAdvancePaymentDos"]').first().click({force:true}) 
    cy.wait(3000)
    cy.get('[data-testid="dateFeildValue-newDos"]').first().as('dateField').click({ force: true });
    cy.get('@dateField').type(formattedDate);
    cy.findByText("Apply New DoS").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Dos Update Successfully');
  });

  it('Case 6: Remove the DOS from an Existing Advance Payment in which DOS was added',()=>{
    cy.get('[data-testid="patientFn"]').type("newDos")
    cy.get('[data-testid="patsearch"]').click() 
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(25000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.get('[data-testid="updateAdvancePaymentDos"]').first().click({force:true}) 
    cy.wait(3000)
    cy.get('[data-testid="rem-id"]').click()
    cy.findByText("Apply New DoS").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Dos Update Successfully');
  });


});