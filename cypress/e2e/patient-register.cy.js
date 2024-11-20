const { findByText } = require("@testing-library/react");

beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000) 
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(4000)
  cy.visit('/app/patient-search')

});

describe('Test Cases for: WBT-255, Register New Patient. Patient Demographics',()=>{
  it('Case 1: Validate the autofill of the data in Register New Patient',()=>{
    cy.visit('/app/register-patient')
    cy.contains('span[class="block truncate"]','Whitebox Organization test')
  });

  it('Case 2: Validate the Validation, without fill the data in required fields',()=>{
    cy.visit('/app/register-patient')
    cy.findByText("Save profile").click();
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

  it('Case 3: Add a new patient',()=>{
    cy.visit('/app/register-patient')

    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Dale')
    cy.get('input[placeholder="Last"]').type('Smith')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Tampa")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('CA').click()
    cy.get('[data-testid="zip"]').then($input => {
      if ($input.is(':disabled')) {
        $input.removeAttr('disabled');
      }
    }).click().type('123456');
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully saved patient')
  });

  it('Case 4: Add a new patient with Future DOB',()=>{
    cy.visit('/app/register-patient')

    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Jane')
    cy.get('input[placeholder="Last"]').type('Doe')
    cy.get('[data-testid="dateFeildValue-patientDob_testid"]').type("08/08/2024");

    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Sanhok")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('NY').click()
    cy.get('[data-testid="zip"]').then($input => {
      if ($input.is(':disabled')) {
        $input.removeAttr('disabled');
      }
    }).click().type('123456');
   cy.wait(1000)
    //cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOB should not be in future')
  });

  it('Case 5: Add a Patient without entering Contact info of the patient',()=>{
    cy.visit('/app/register-patient')

    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Jane')
    cy.get('input[placeholder="Last"]').type('Doe')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
});

  it('Case 6: Add a Patient without entering Group & Provider info of the patient',()=>{
    cy.visit('/app/register-patient')

     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Jennifer')
    cy.get('input[placeholder="Last"]').type('Jack')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Female').click()
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 street york")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Sanhok")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('NY').click()
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

  it('Case 7: Validate the Edit functionality by edit a patient data',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(8000)
    cy.get('input[placeholder="Last"]').clear().type('Smith')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).clear().type("142 street york")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).clear().type("Sanhok")
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient updated successfully')
  });
});

describe('Test Case for WBT-259, Patient > Notes',()=>{
  it('Case 1: Validate the Add Note functionality in Patient Create',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    // Note btn Click
    cy.get('[data-testid="paymentNotes"]').click({force:true})
    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()
    cy.findByText("Add Note").click()
    cy.wait(1000)
    cy.findByText("Select note type from the dropdown list").click()
    cy.contains('[data-testid="singleDropdownOption-noteTypeOptionID"]',"Insurance/Authorization").click()
    cy.wait(1000)
    cy.get('[data-testid="sbjinput"]').type("Patient Insurance Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Patient has Primary and Secondary Insurance")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
  });

  it('Case 2: Validate the Add Note functionality in Patient Edit',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(8000)
    // Note btn Click
    cy.get('[data-testid="paymentNotes"]').click({force:true})

    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()
    cy.findByText("Add Note").click()
    cy.findByText("Select note type from the dropdown list").click()
    cy.contains('[data-testid="singleDropdownOption-noteTypeOptionID"]',"Insurance/Authorization").click()
    cy.wait(1000)

    cy.get('[data-testid="sbjinput"]').type("Patient Insurance Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Patient has Primary and Secondary Insurance")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
  });

  it('Case 4: Filter the Note on the basis of the Note type',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('[data-testid="paymentNotes"]').click({force:true})

    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()
    cy.findByText("Filters").click()
    cy.findByText("Patient Collections").click()
    cy.wait(3000)
    cy.findByText("Apply Filters").click()
  });

  it('Case 5: Filter the Note on the basis of the user',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('[data-testid="paymentNotes"]').click({force:true})

    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()
    cy.findByText("Filters").click()
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').contains("People").click({force:true})
    cy.get('span[class="ml-6 block"]').contains("Tester, White Box").click()
    cy.wait(2000)
    cy.findByText("Apply Filters").click()
  })

  it('Case 6: Validate the Add Note functionality without adding the Note Type and Subject',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('[data-testid="paymentNotes"]').click({force:true})

    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()
    cy.findByText("Add Note").click()
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Note without Note type and Subject")
    cy.get('[data-testid="addNote"]').click();
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  })

  it('Case 7: Validate the functionality to Edit a note, attach to a patient',()=>{
    cy.get('input[placeholder="Patient First Name"]').type('Eva')
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(10000)
    cy.get('[data-testid="paymentNotes"]').click({force:true})

    //cy.get('[class="flex w-40 items-center justify-center space-x-2 rounded-full bg-cyan-500 px-6  py-3 shadow hover:bg-cyan-700 focus:border-2 focus:border-cyan-400 focus:bg-cyan-500 active:border-cyan-200 active:bg-cyan-700"]').click()     
    
    cy.findByText("Add Note").click()
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Note without Note type and Subject")
    cy.get('[data-testid="addNote"]').click();
  });
});

describe('Test Case for WBT-256, SSN Masking',()=>{
  it('Case 1: Add 9 Digit SSN number in the patient',()=>{
    cy.findByText("Register New Patient").click()
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Sharon')
    cy.get('input[placeholder="Last"]').type('Jack')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('[data-testid="ssn"]').type("086294379")
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Tampa")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('CA').click()
    cy.get('[data-testid="zip"]').type('12345');
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully saved patient')
  });
  it('Case 2: Add SSN number in the patient to validate the masking',()=>{
    cy.findByText("Register New Patient").click()
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Sharon')
    cy.get('input[placeholder="Last"]').type('Jack')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('[data-testid="ssn"]').type("086294379")
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Tampa")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('CA').click()
    cy.get('[data-testid="zip"]').type('12345');
    cy.wait(1000)
  });

  it('Case 3: Edit the SSN number of the patient',()=>{
    cy.findByText("Register New Patient").click();
    cy.get('[data-testid="ssn"]').type("15268749");
  });

  it('Case 4: Add 8 digit SSN number in the patient',()=>{
    cy.findByText("Register New Patient").click()
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
     cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Pink')
    cy.get('input[placeholder="Last"]').type('Williams')
     cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('[data-testid="ssn"]').type("23659037")
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Tampa")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('CA').click()
    cy.get('[data-testid="zip"]').type('12345');
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully saved patient')
  });

});

describe('Test Case for WBT-152, Delete Patient',()=>{
  it('Case 2: Delete a patient, in which claim is attached',()=>{
    cy.get('img[alt="patient"]').click()
    cy.get('span[class="block  ml-3 text-sm truncate  delay-1000"]').contains('Patient Search').click()
    cy.get('[data-testid="patsearch"]').click()
    cy.findByText("#152147").click()
    cy.wait(8000)
    cy.findByText("Delete Profile").click()
    cy.findByText('Patient cannot be deleted. There are financial transactions associated to this record.')
  });
});