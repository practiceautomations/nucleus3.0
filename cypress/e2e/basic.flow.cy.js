
beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')  
  cy.visit('/')
  cy.wait(5000) 
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(3000)
})

// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

describe('Test Case for WBT-361, Basic Happy Flow of 2.0',()=>{
  it('2.0 Flow',()=>{
    cy.wait(2000)
    cy.get('img[alt="patient"]').click()
    cy.findByText("Patient Search").click()
    cy.wait(3000)
    cy.findByText("Register New Patient").click()
    cy.wait(2000)
    cy.location('pathname').should('match', /\/register-patient$/);
    cy.wait(2000)


    // register patient
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.wait(1000)
    cy.contains('span[class="block"]','Whitebox Organization test').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.findByText('Whitebox Payto Practice').click()
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.findByText('Whitebox Location test').click()
    cy.get('[data-testid="prc"]').eq(4).click();
    cy.findByText('White Box Rendering Provider').click()
    //cy.get('input[placeholder="First"]').click({force:true}).type('Mark')
    cy.get('input[placeholder="First"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('Mark');
    cy.get('input[placeholder="Last"]').type('Smith')
    cy.enterCurrentDate('[data-testid="dateFeildValue-patientDob_testid"]');
    cy.get('[data-testid="prc"]').eq(5).click();
    cy.findByText('Male').click()
    cy.get('input[placeholder="Ex.: 142 Palm Avenue"]').eq(0).type("142 Palm Avenue")
    cy.get('input[placeholder="Ex. Tampa"]').eq(0).type("Tampa")
    cy.get('[data-testid="prc"]').eq(7).click();
    cy.findByText('CA').click()
    cy.get('[data-testid="zip"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type('123456');
    cy.wait(1000)
    cy.findByText("Save profile").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully saved patient')

    // patient Notes
    cy.get('[data-testid="patsearch"]').click()
    cy.get('[data-testid="PatientSearchPatientID"]').first().click()
    cy.wait(30000)
    // Note btn Click
    cy.get('[data-testid="paymentNotes"]').click({force:true})
    cy.findByText("Add Note").click()
    cy.findByText("Select note type from the dropdown list").click()
    cy.findByText("Insurance/Authorization").click()
    cy.wait(1000)
    cy.get('[data-testid="sbjinput"]').type("Patient Insurance Note");
    cy.get('textarea').filter((index, element) => Cypress.$(element).attr('placeholder') === 'Click here to write note').type("Patient has Primary and Secondary Insurance")
    cy.get('[data-testid="addNote"]').click();
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
    cy.wait(1000)
    cy.get('img[alt="close"]').eq(1).click()

    // patient insurance
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(0).click();
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

    //guarantor
    cy.wait(10000)
    cy.get('button[class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm"]').eq(1).click();
    cy.findByText("Add New Guarantor").click();
    cy.wait(3000)
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.get('span[class="block"]').contains('Employee').click()
    cy.get('[data-testid="prc"]').eq(1).click();
    cy.get('span[class="block"]').contains('Female').click()
    cy.get('[data-testid="guarantorfn"]').clear().type("Arooj")
    cy.get('[data-testid="guarantorln"]').clear().type("Fatima")
    cy.get('[data-testid="guarantor_dob"]').clear().type("06/01/2023")
    cy.get('[data-testid="prc"]').eq(2).click();
    cy.get('span[class="block"]').contains('TX').click()
    cy.get('[data-testid="guarantor_address"]').clear().type("124 street")
    cy.get('[data-testid="guarantor_city"]').clear().type("Dallas")
    cy.get('[data-testid="guarantor_zipcode"]').clear().type("12345")
    cy.wait(3000)
    cy.findByText("Save New Guarantor").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Guarantor saved successfully')

    // charge batch
    cy.wait(1000) 
    cy.get('img[alt="documentDownload2"]').click()
    cy.findByText("Charge Batch").click()
    cy.get('[data-testid="createChargeBatch"]').click()
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_status"]').click().findByText("Open").click()
    cy.get('[data-testid="charge_batch_postingDate"]').click({force:true}).type(formattedDate)
    cy.get('[data-testid="charge_batch_noofcharges"]').type("1")
    cy.get('[data-testid="add_charge_batchBtn"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Created')

    // claim
    cy.findByText("Create").click()
    cy.findByText("Create a Claim").click()
    cy.addClaimPatient2(
      "152214", // patientId
      "M87.135", // icdCode
      "00100",   // cptCode
      "| Osteonecrosis due to drugs of left ulna", // diagnosis
      "60", // chargesFee
      "30", // chargesInsRespFee
      "30" // chargesPatResp
    );

    // payment batch
    cy.get('img[alt="documentDownload2"]').click()
    cy.findByText("Payment Batch").click()
    cy.wait(3000)
    cy.findByText("Create New Payment Batch").click()
    cy.get('[data-testid="payment_batch_description"]').type("WhiteBox Payment Batch");
    cy.get('[data-testid="payment_batch_status"]').click();
    cy.findByText("New").click()
    cy.get('[data-testid="payment_batch_type"]').click();
    cy.findByText("Cash").click()
    cy.wait(1000)
    cy.get('[data-testid="payment_number"]').type("Cash001");
    cy.wait(1000)
    // Find the input field using its data-testid attribute and set its value to the current date
    cy.get('[data-testid="payment_date"]').clear().type(formattedDate);
    cy.wait(1000)
    cy.get('[data-testid="posting_date"]').click({force:true}).type(formattedDate);
    cy.wait(1000)
    cy.get('[data-testid="deposit_date"]').click({force:true}).type(formattedDate);
    cy.wait(2000)
    cy.get('[data-testid="total_ins_pay_batch"]').type("1000");
    // save btn
    cy.get('p[data-testid="new_payment_batch"]').click();
    cy.wait(1000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Created')

    //payment posting
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("35")
    cy.get('[data-testid="paymentInputFeild"]').type("25")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');

    // logout
    cy.get('[alt="dash-img"]').click();
    cy.findByText('Logout').click();

  })

});

