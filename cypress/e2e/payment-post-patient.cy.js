beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(1000)
  cy.findByText("Create").click()
  cy.findByText("Create a Claim").click()
  cy.location('pathname').should('match', /\/create-claim$/); 
});

// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;


describe('Test Case for WBT-332, Manual Payment Posting: Patient',()=>{
  it('Case 1: Validate the New Payment Patient Payment Posting',()=>{ 
    cy.addClaimPatient2(
            "152100", // patientId
            "M12.242", // icdCode
            "22521",   // cptCode
            "| Villonodular synovitis (pigmented), left hand", // diagnosis
            "50", // chargesFee
            "35", // chargesInsRespFee
            "15" // chargesPatResp
    );
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="paymentInputFeild"]').type("20")
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Payment Posted Successfully');

  });

  it('Case 2: Validate the partially New Patient Payment Posting',()=>{ 
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="paymentPatientInputFeild"]').type("10")
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Payment Posted Successfully');
  });

  it('Case 3: Validate the Patient Payment Posting by adding more than the patient responsibility amount',()=>{
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="paymentPatientInputFeild"]').type("30")
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Payment Posted Successfully'); 

  });

  it('Case 4: Validate the Advance Payment Patient Payment Posting, with DOS',()=>{
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="post_patient_payment"]').click()
    cy.findByText("From Unapplied Advanced Payments").click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withDos')
    cy.get('[data-testid="paymentPatientInputFeild"]').type("20")
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Payment amount should be less than With DoS amount');     
  });

  it('Case 5: Validate the Partially Advance Payment Patient Payment Posting, with DOS',()=>{
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withDos')
    cy.get('[data-testid="paymentPatientInputFeild"]').type("10")
    cy.get('[data-testid="postPayment"]').click()

    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Payment Posted Successfully');     

  });

  it('Case 6: Validate the Advance Payment Patient Payment Posting, with DOS',()=>{
    cy.get('img[alt="patient"]').click()
    cy.findByText("Patient Search").click()
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

    cy.findByText("Create").click()
    cy.findByText("Create a Claim").click()

    cy.addClaimPatient2(
      "152214", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withDos')
    cy.get('[data-testid="paymentPatientInputFeild"]').type("10")
    cy.get('[data-testid="postPayment"]').click()

    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Payment Posted Successfully'); 

  });

  it('Case 7: Validate the Advance Payment Patient Payment Posting, without DOS',()=>{

    cy.get('img[alt="patient"]').click()
    cy.findByText("Patient Search").click()
    cy.get('[data-testid="patientFn"]').type("without")
    cy.get('[data-testid="patsearch"]').click()
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(15000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.get('[data-testid="dateFeildValue-checkDate"]').scrollIntoView();
    cy.get('[alt="calendar"]').eq(0).click();
    cy.findByText('6').click({force:true})
   
    cy.get('[data-testid="payment_amount"]').type("20");
    cy.get('[data-testid="account_type"]').click();
    cy.contains('span', 'Total Payment').click()
    cy.get('[data-testid="advancePayment_comment"]').type("test");
    cy.findByText("Save New Advanced Payment").click()

    cy.findByText("Create").click()
    cy.findByText("Create a Claim").click()

    cy.addClaimPatient(
      "152236", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withoutDos')
    cy.get('[data-testid="paymentPatientInputFeild"]').type("15")
    cy.get('[data-testid="postPayment"]').click()

    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Payment amount should be less than Without DoS amount.');
  });
  
  it('Case 8: Validate the Advance Payment Patient Payment Posting, without DOS',()=>{

    cy.get('img[alt="patient"]').click()
    cy.findByText("Patient Search").click()
    cy.get('[data-testid="patientFn"]').type("without")
    cy.get('[data-testid="patsearch"]').click()
    cy.wait(3000)
    cy.get('div[data-testid="PatientSearchPatientID"]').first().click();
    cy.wait(25000)
    cy.get('[data-testid="RegisterPatientAdvancedPaymentTabTestId"]').click({force:true})
    cy.findByText("Add Advanced Payment").click({force:true})
    cy.get('[data-testid="dateFeildValue-checkDate"]').scrollIntoView();
    cy.get('[alt="calendar"]').eq(0).click();
    cy.findByText('6').click({force:true})
   
    cy.get('[data-testid="payment_amount"]').type("20");
    cy.get('[data-testid="account_type"]').click();
    cy.contains('span', 'Total Payment').click()
    cy.get('[data-testid="advancePayment_comment"]').type("test");
    cy.findByText("Save New Advanced Payment").click()

    cy.wait(2000)
    cy.findByText("Create").click()
    cy.findByText("Create a Claim").click()

    cy.addClaimPatient(
      "152236", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withoutDos')
    cy.get('[data-testid="paymentPatientInputFeild"]').type("20")
    cy.get('[data-testid="postPayment"]').click()

    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Payment Posted Successfully');
  });

  it('Case 9: Validate the Transfer to Insurance Responsibility',()=>{

    cy.addClaimPatient(
      "152236", // patientId
      "M12.242", // icdCode
      "22521",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(3000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()

    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="radiobuttons"]').check('withoutDos')
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(2).type("50")
    cy.get('[data-testid="postPayment"]').click()
  
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Transfer Amount should be less than Patient Amount');

  });

  it('Case 10: Validate the Payment Type AutoSelect on the basis of Post Patient Payment',()=>{
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.get('[data-testid="quickActionBtn"]').click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.findByText("Advance Credit")
  });
  it('Case 11: Validate the warning by clicking on the Cancel button',()=>{
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.get('[data-testid="quickActionBtn"]').click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="closeBtnPaymentPosting"]').eq(1).click()
    cy.findByText("Are you sure you want to cancel creating this batch? Clicking 'Confirm' will result in the loss of all changes")
  });

  it('Case 12: Validate the Required Validation by leaving required fields blank',()=>{
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.get('[data-testid="quickActionBtn"]').click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="postPayment"]').click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")

  });

});