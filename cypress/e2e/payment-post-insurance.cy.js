beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();    
  cy.wait(1000);
  cy.visit('/app/create-claim')
  
});

describe('Test Cases for WBT-331, Manual Payment Posting: Insurance',()=>{
  it('Case 1: Validate the Adjustment amount',()=>{ 

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
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("10")
    cy.wait(1000)
    cy.get('input[class="select2-selection__input"]').eq(5).click()
    cy.contains("CO | Contractual Obligations").first()
    cy.get('input[class="select2-selection__input"]').eq(6).click()
    cy.contains("45 | Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.").first()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(2)
    .should(($input) => {
      expect($input.val()).to.eq('10'); // Assert that the input field has the value '10'
    });

  });

  it('Case 2: Validate the Patient Responsibility amount',()=>{     
    cy.addClaimPatient(
      "152102", // patientId
      "M12.242", // icdCode
      "00100",   // cptCode
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
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("10")
    cy.get('[data-testid="paymentInputFeild"]').type("15")
    cy.wait(1000)
    cy.get('input[class="select2-selection__input"]').eq(5).click()
    cy.contains("CO | Contractual Obligations").first()
    cy.get('input[class="select2-selection__input"]').eq(6).click()
    cy.contains("45 | Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.").first()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(4)
    .should(($input) => {
      expect($input.val()).to.eq('-5');
    });
  });

 it('Case 3: Validate the Payment Posting functionality',()=>{ 

    cy.get('[data-testid="addClaimPatient"]').click()
    cy.addClaimPatient(
      "152102", // patientId
      "M12.242", // icdCode
      "00100",   // cptCode
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

  });

  it('Case 4: Validate the Required Validation by leaving required fields blank',()=>{ 
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="paymentType"]').click()
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

  it('Case 5: Validate the Allowable - Payment, amount in the Next Insurance field',()=>{ 
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
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("10")
    cy.get('[data-testid="paymentInputFeild"]').type("5")
    cy.wait(1000)
    cy.get('input[class="select2-selection__input"]').eq(5).click()
    cy.contains("CO | Contractual Obligations").first()
    cy.get('input[class="select2-selection__input"]').eq(6).click()
    cy.contains("45 | Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.").first()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(3)
    .should(($input) => {
      expect($input.val()).to.eq('5'); 
    });
  });

  it('Case 6: Validate the Allowable - Payment, amount in the Patient Responsibility',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.addClaimPatient(
      "152102", // patientId
      "M12.242", // icdCode
      "00100",   // cptCode
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
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').first().click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("20")
    cy.get('[data-testid="paymentInputFeild"]').type("5")
    cy.wait(1000)
    cy.get('input[class="select2-selection__input"]').eq(5).click()
    cy.contains("CO | Contractual Obligations").first()
    cy.get('input[class="select2-selection__input"]').eq(6).click()
    cy.contains("45 | Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.").first()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(4)
    .should(($input) => {
      expect($input.val()).to.eq('15');
    });
  });

  it('Case 7: Validate the warning by clicking on the Cancel button',()=>{
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
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').first().click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("20") 
    cy.get('[data-testid="closeBtnPaymentPosting"]').eq(1).click()
    cy.findByText("Are you sure you want to cancel creating this batch? Clicking 'Confirm' will result in the loss of all changes")
  });
  it('Case 8: Validate the $0 Adjustment posting',()=>{
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
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("20")
    cy.wait(1000)
    cy.get('input[class="select2-selection__input"]').eq(5).click()
    cy.contains("CO | Contractual Obligations").first()
    cy.get('input[class="select2-selection__input"]').eq(6).click()
    cy.contains("45 | Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.").first()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm px-0 bg-white"]')
    .eq(2)
    .should(($input) => {
      expect($input.val()).to.eq('0'); // Assert that the input field has the value '10'
    });
  });
})