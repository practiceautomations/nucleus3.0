beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click({force: true});
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.wait(3000)
  cy.findByText("Create").click()
  cy.findByText("Create a Claim").click()
  cy.location('pathname').should('match', /\/create-claim$/); 
});

describe('Test Case for WBT-432, Posting Date field when entering a financial transaction',()=>{
     // Get the current date
     const currentDate = new Date();
     const currentDateOfMonth = currentDate.getDate();
 
     // Determine the data to use based on the current date
     let postingDate;
     let twoDaysBeforeCurrentDate;
     let futureDate;

     if (currentDateOfMonth <= 8) {
       // Use Data 1
       const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
       postingDate = twoMonthsAgo.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
       twoDaysBeforeCurrentDate = new Date(twoMonthsAgo);
       twoDaysBeforeCurrentDate.setDate(currentDateOfMonth - 2);

     } else {
       // Use Data 2
       const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 23);
       postingDate = lastMonth.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
     }

     let twoMonthAgoDate;
     let twoMonthsAfterDate;

     const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
     twoMonthAgoDate = twoMonthsAgo.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

     const twoMonthsAfter = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);
     twoMonthsAfterDate = twoMonthsAfter.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

      const currentMonth = currentDate.getMonth();     
      const currentDay = currentDate.getDate();
      
      // Subtract two days from the current date.
      const twoDaysAgo = new Date(currentDate.getFullYear(), currentMonth, currentDay - 2);
      
      // Format the resulting date as a string.
      const twoDaysAgoString = twoDaysAgo.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });

      // Format the date as per your input field's expected format
      const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

  it('Case 1: Add Previous month date in the posting field - Post Payment -> Insurance',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(postingDate);
    cy.get('[data-testid="paymentInputFeild"]').scrollIntoView().type("5")
    cy.wait(2000)
    cy.get('[data-testid="postPayment"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 2: Add two month previous date in the posting field',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
      cy.wait(1000)

    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoMonthAgoDate); 
    cy.get('[data-testid="paymentInputFeild"]').scrollIntoView().type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.wait(1000)
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 3: Add same month date in the posting field',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(5000)
    cy.findByText("Quick Actions").click()
    cy.wait(2000)
    cy.contains("Post Payment").eq(0).click()
    cy.wait(1000)

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoDaysAgoString); 

    cy.get('[data-testid="paymentInputFeild"]').scrollIntoView().type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');

  });

  it('Case 4: Add wrong formated date in Posting Date field',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type("01/00/0000"); 

    cy.get('[data-testid="paymentInputFeild"]').scrollIntoView().type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()

    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 5: Add Previous month date in the posting field - Post Payment -> Patient',()=>{
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
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(2000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(postingDate);
    cy.wait(1000)  
    cy.get('[data-testid="paymentPatientInputFeild"]').type("5")
    cy.wait(2000)
    cy.get('[data-testid="postPayment"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023"); 
  });

  it('Case 6: Add two month previous date in the posting field',()=>{
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="radiobuttons"]').eq(1).click()

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
      cy.wait(1000)

    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoMonthAgoDate); 
    cy.get('[data-testid="paymentPatientInputFeild"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.wait(1000)
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

   it('Case 7: Add same month date in the posting field',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(5000)
    cy.findByText("Quick Actions").click()
    cy.wait(2000)
    cy.contains("Post Payment").eq(0).click()
    cy.wait(1000)
    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoDaysAgoString); 

    cy.get('[data-testid="paymentPatientInputFeild"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Patient Payment Posted Successfully');

   });

  it('Case 8: Add wrong formated date in Posting Date field',()=>{ 
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
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)
    cy.get('[data-testid="radiobuttons"]').eq(1).click()
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type("01/00/0000"); 

    cy.get('[data-testid="paymentPatientInputFeild"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()

  cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 9: Add Previous month date in the posting field - Post Payment -> Refund',()=>{ 
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
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(5000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="radiobuttons"]').eq(2).click()

    cy.get('[data-testid="refundType"]').click()
    cy.findByText("Patient Refund")

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(postingDate); 

    cy.get('[data-testid="refund_amount"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.wait(1000)
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });
  it('Case 10: Add two month previous date in the posting field',()=>{ 
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
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(5000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="radiobuttons"]').eq(2).click()

    cy.get('[data-testid="refundType"]').click()
    cy.findByText("Patient Refund")

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoMonthAgoDate); 

    cy.get('[data-testid="refund_amount"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.wait(1000)
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 11: Add same month date in the posting field',()=>{ 
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
  cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
  cy.contains('div', 'Open Claims').should('be.visible').click() 
  cy.wait(2000)
  cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
  cy.wait(5000)
  cy.findByText("Quick Actions").click()
  cy.wait(1000)
  cy.contains("Post Payment").first().click()
  cy.wait(1000)

  cy.get('[data-testid="radiobuttons"]').eq(2).click()

  cy.get('[data-testid="refundType"]').click()
  cy.findByText("Patient Refund")

  cy.get('[data-testid="paymentType"]').click()
  cy.findByText("Cash").click()
  cy.get('[data-testid="paymentBatch"]').click()
  cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
  cy.wait(1000)
  cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(twoDaysAgoString); 

  cy.get('[data-testid="refund_amount"]').type("5")
  cy.wait(1000)
  cy.get('[data-testid="postPayment"]').click()
  cy.wait(1000)
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');
});

it('Case 12: Add wrong formated date in Posting Date field',()=>{ 
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
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click({force:true})
    cy.wait(5000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.wait(1000)

    cy.get('[data-testid="radiobuttons"]').eq(2).click()

    cy.get('[data-testid="refundType"]').click()
    cy.findByText("Patient Refund")

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type("01/00/0000"); 

    cy.get('[data-testid="refund_amount"]').type("5")
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.wait(1000)
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
});

it('Case 13: Add Previous month date in the posting field - Post Payment -> Charge Batch', () => {
    cy.wait(1000) 
    cy.get('img[alt="documentDownload2"]').click()
    cy.contains("span","Charge Batch").click()
    cy.get('[data-testid="createChargeBatch"]').click()
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_status"]').click().findByText("New").click()
    cy.get('[data-testid="charge_batch_postingDate"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type(postingDate);
    cy.get('[data-testid="charge_batch_noofcharges"]').type("1")
    cy.get('[data-testid="totalAmountCharged"]').type("50")
    cy.get('[data-testid="add_charge_batchBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023")
});

it('Case 14: Add two month previous date in the posting field', () => {
  cy.wait(1000) 
    cy.get('img[alt="documentDownload2"]').click()
    cy.contains("span","Charge Batch").click()
    cy.get('[data-testid="createChargeBatch"]').click()
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
    cy.wait(1000)
    cy.get('[data-testid="charge_batch_status"]').click().findByText("New").click()
    cy.get('[data-testid="charge_batch_postingDate"]').then($input => {
      // Check if the input element is disabled
      if ($input.is(':disabled')) {
        // Remove the disabled attribute
        $input.removeAttr('disabled');
      }
    }).click().type(twoMonthAgoDate);
    cy.get('[data-testid="charge_batch_noofcharges"]').type("1")
    cy.get('[data-testid="totalAmountCharged"]').type("50")
    cy.get('[data-testid="add_charge_batchBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023")
});

it('Case 15: Add same month date in the posting field', () => {
  cy.wait(1000) 
  cy.get('img[alt="documentDownload2"]').click()
  cy.contains("span","Charge Batch").click()
  cy.get('[data-testid="createChargeBatch"]').click()
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_status"]').click().findByText("New").click()
  cy.get('[data-testid="charge_batch_postingDate"]').then($input => {
    // Check if the input element is disabled
    if ($input.is(':disabled')) {
      // Remove the disabled attribute
      $input.removeAttr('disabled');
    }
  }).click().type(twoDaysAgoString);
  cy.get('[data-testid="charge_batch_noofcharges"]').type("5")
  cy.get('[data-testid="totalAmountCharged"]').type("50")
  cy.get('[data-testid="add_charge_batchBtn"]').click()
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Created')
});

it('Case 16: Add future month date in the posting field', () => {
  cy.wait(1000) 
  cy.get('img[alt="documentDownload2"]').click()
  cy.contains("span","Charge Batch").click()
  cy.get('[data-testid="createChargeBatch"]').click()
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_status"]').click().findByText("New").click()
  cy.get('[data-testid="charge_batch_postingDate"]').then($input => {
    // Check if the input element is disabled
    if ($input.is(':disabled')) {
      // Remove the disabled attribute
      $input.removeAttr('disabled');
    }
  }).click().type(twoMonthsAfterDate);
  cy.get('[data-testid="charge_batch_noofcharges"]').type("5")
  cy.get('[data-testid="totalAmountCharged"]').type("50")
  cy.get('[data-testid="add_charge_batchBtn"]').click()
  cy.contains ('p[class="text-sm font-medium text-red-800"]', 'You cannot add Future Posting Date');
});

it('Case 17: Add wrong formated date in Posting Date field', () => {
  cy.wait(1000) 
  cy.get('img[alt="documentDownload2"]').click()
  cy.contains("span","Charge Batch").click()
  cy.get('[data-testid="createChargeBatch"]').click()
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_descripion"]').type("Basic Charge Batch")
  cy.wait(1000)
  cy.get('[data-testid="charge_batch_status"]').click().findByText("New").click()
  cy.get('[data-testid="charge_batch_postingDate"]').then($input => {
    // Check if the input element is disabled
    if ($input.is(':disabled')) {
      // Remove the disabled attribute
      $input.removeAttr('disabled');
    }
  }).click().type("01/00/0000");
  cy.get('[data-testid="charge_batch_noofcharges"]').type("5")
  cy.get('[data-testid="totalAmountCharged"]').type("50")
  cy.get('[data-testid="add_charge_batchBtn"]').click()
  cy.contains("You can not add previous month's Posting Date after 07/08/2023");

});

it('Case 18: Add Previous month date in the posting field - Post Payment -> Payment Batch', () => {
  cy.wait(1000) 
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
  cy.get('[data-testid="payment_number"]').type("12345AFCT");
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="payment_date"]');
  cy.wait(1000)
  cy.get('[data-testid="posting_date"]').click({force:true}).type(postingDate);
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="deposit_date"]');
  cy.wait(2000)
  cy.get('[data-testid="total_ins_pay_batch"]').type("150");
  // save btn
  cy.get('p[data-testid="new_payment_batch"]').click();
  cy.wait(1000)
  cy.contains("You can not add previous month's Posting Date after 07/08/2023");
});

it('Case 19: Add two month previous date in the posting field', () => {
  cy.wait(1000) 
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
  cy.get('[data-testid="payment_number"]').type("12345AFCT");
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="payment_date"]');
  cy.wait(1000)
  cy.get('[data-testid="posting_date"]').click({force:true}).type(twoMonthAgoDate);
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="deposit_date"]');
  cy.wait(2000)
  cy.get('[data-testid="total_ins_pay_batch"]').type("150");
  // save btn
  cy.get('p[data-testid="new_payment_batch"]').click();
  cy.wait(1000)
  cy.contains("You can not add previous month's Posting Date after 07/08/2023");
});

it('Case 20: Add same month date in the posting field', () => {
  cy.wait(1000) 
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
  cy.get('[data-testid="payment_number"]').type("12345AFCT");
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="payment_date"]');
  cy.wait(1000)
  cy.get('[data-testid="posting_date"]').click({force:true}).type(twoDaysAgoString);
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="deposit_date"]');
  cy.wait(2000)
  cy.get('[data-testid="total_ins_pay_batch"]').type("150");
  cy.get('p[data-testid="new_payment_batch"]').click();
  cy.wait(1000)
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Created')
});
 it('Case 21: Add wrong formated date in Posting Date field', () => {
  cy.wait(1000) 
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
  cy.get('[data-testid="payment_number"]').type("12345AFCT");
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="payment_date"]');
  cy.wait(1000)
  cy.get('[data-testid="posting_date"]').click().type("01/00/0000");
  cy.wait(1000)
  cy.enterCurrentDate('[data-testid="deposit_date"]');
  cy.wait(2000)
  cy.get('[data-testid="total_ins_pay_batch"]').type("150");
  cy.get('p[data-testid="new_payment_batch"]').click();
  cy.contains("You can not add previous month's Posting Date after 07/08/2023");

 });

it('Case 22: Add Previous month date in the posting field - Post Payment -> Charges in Claim', () => {

    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('[data-testid="claimPatientSearch"]').type("152102")
    cy.contains("152102 | Butt John | 01/01/1995 | Whitebox Payto Practice").click({force:true})
    cy.get('[data-testid="addIcdDropdown"]').click().type("D50")
    cy.wait(1000)
    cy.findByText("D50").click()

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.wait(1000);
    cy.get('[data-testid="chargesCptCode"]').click().type("0111T")
    cy.wait(1000)
    cy.findByText("0111T").click()
    cy.wait(2000)
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
    cy.contains("| Iron deficiency anemia").click();
    cy.wait(1000)
    cy.get('[data-testid="gridModelFeildValue-claim_chargebatch_testid"]').scrollIntoView().click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-claimChargePostingDate"]').as('dateField').click().clear().type(postingDate); 
    cy.wait(1000)
    cy.findByText('Save').click();
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");

});

it('Case 23: Add two month previous date in the posting field', () => {
  cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('[data-testid="claimPatientSearch"]').type("152102")
    cy.contains("152102 | Butt John | 01/01/1995 | Whitebox Payto Practice").click({force:true})
    cy.get('[data-testid="addIcdDropdown"]').click().type("D50")
    cy.wait(1000)
    cy.findByText("D50").click()

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.wait(1000);
    cy.get('[data-testid="chargesCptCode"]').click().type("0111T")
    cy.wait(1000)
    cy.findByText("0111T").click()
    cy.wait(2000)
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
    cy.contains("| Iron deficiency anemia").click();
    cy.wait(1000)
    cy.get('[data-testid="gridModelFeildValue-claim_chargebatch_testid"]').scrollIntoView().click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-claimChargePostingDate"]').as('dateField').click().clear().type(twoMonthAgoDate); 
    cy.wait(1000)
    cy.findByText('Save').click();
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
});
it('Case 24: Add same month date in the posting field', () => {
  cy.get('[data-testid="addClaimPatient"]').click()
  cy.get('[data-testid="claimPatientSearch"]').type("152102")
  cy.contains("152102 | Butt John | 01/01/1995 | Whitebox Payto Practice").click({force:true})
  cy.get('[data-testid="addIcdDropdown"]').click().type("D50")
  cy.wait(1000)
  cy.findByText("D50").click()

  cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
  cy.wait(1000);
  cy.get('[data-testid="chargesCptCode"]').click().type("0111T")
  cy.wait(1000)
  cy.findByText("0111T").click()
  cy.wait(2000)
  cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
  cy.contains("| Iron deficiency anemia").click();
  cy.wait(1000)
  cy.get('[data-testid="gridModelFeildValue-claim_chargebatch_testid"]').scrollIntoView().click()
  cy.wait(1000)
  cy.get('[data-testid="dateFeildValue-claimChargePostingDate"]').as('dateField').click().clear().type(twoDaysAgoString); 
  cy.wait(1000)
  cy.findByText('Save').click();
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
});

it('Case 25: Add wrong formated date in Posting Date field', () => {
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('[data-testid="claimPatientSearch"]').type("152102")
    cy.contains("152102 | Butt John | 01/01/1995 | Whitebox Payto Practice").click({force:true})
    cy.get('[data-testid="addIcdDropdown"]').click().type("D50")
    cy.wait(1000)
    cy.findByText("D50").click()

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.wait(1000);
    cy.get('[data-testid="chargesCptCode"]').click().type("0111T")
    cy.wait(1000)
    cy.findByText("0111T").click()
    cy.wait(2000)
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
    cy.contains("| Iron deficiency anemia").click();
    cy.wait(1000)
    cy.get('[data-testid="gridModelFeildValue-claim_chargebatch_testid"]').scrollIntoView().click()
    cy.wait(1000)
    cy.get('[data-testid="dateFeildValue-claimChargePostingDate"]').as('dateField').click().clear().type("01/00/0000"); 
    cy.wait(1000)
    cy.findByText('Save').click();
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
});

it('Case 26: Add Previous month date in the posting field - Post Payment -> Payment Reconciliation', () => {
  cy.wait(2000)
  cy.get('img[alt="currencyDolar"]').click()
  cy.contains("Payment Reconciliation").click()
  cy.wait(3000)
  cy.get('input[placeholder="Payment Number"]').type('payment12345')
  cy.wait(1000)
  cy.get('[data-testid="searchPayment"]').click()
  cy.get('[data-testid="paymentReconcileBtn"]').click()
  cy.wait(5000)
  cy.get('[data-testid="dateFeildValue-reconcilePaymentPostingDate"]').as('dateField').click().clear().type(postingDate);
  cy.wait(5000)
  cy.get('[data-testid="reconsileModelBtn"]').click()
  });

  it('Case 27: Add two month previous date in the posting field', () => {
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Payment Reconciliation").click()
    cy.wait(3000)
    cy.get('input[placeholder="Payment Number"]').type('payment12345')
    cy.wait(1000)
    cy.get('[data-testid="searchPayment"]').click()
    cy.get('[data-testid="paymentReconcileBtn"]').click()
    cy.wait(5000)
    cy.get('[data-testid="dateFeildValue-reconcilePaymentPostingDate"]').as('dateField').click().clear().type(twoMonthAgoDate);
    cy.wait(5000)
    cy.get('[data-testid="reconsileModelBtn"]').click()
  });

  it('Case 28: Add same month date in the posting field', () => {
    // create claim
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "00100",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
    );

    // payment posting
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
    cy.wait(2000)
    cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').click().clear().type(formattedDate);

    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="allowable"]').type("10")
    cy.get('[data-testid="paymentInputFeild"]').type("15")
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()

    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');

    //payment reconcilation
    cy.wait(3000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Payment Reconciliation").click()
    cy.wait(3000)
    cy.get('input[placeholder="Payment Number"]').type('payconc')
    cy.wait(1000)
    cy.get('[data-testid="searchPayment"]').click()
    cy.get('[data-testid="paymentReconcileBtn"]').click()
    cy.wait(5000)
    cy.get('[data-testid="dateFeildValue-reconcilePaymentPostingDate"]').as('dateField').click().clear().type(twoDaysAgoString);
    cy.wait(5000)
    cy.get('[data-testid="reconsileModelBtn"]').click()

  });

  it('Case 29: Add future month date in the posting field', () => {
  cy.wait(2000)
  cy.get('img[alt="currencyDolar"]').click()
  cy.contains("Payment Reconciliation").click()
  cy.wait(3000)
  cy.get('input[placeholder="Payment Number"]').type('payment12345')
  cy.wait(1000)
  cy.get('[data-testid="searchPayment"]').click()
  cy.get('[data-testid="paymentReconcileBtn"]').click()
  cy.wait(5000)
  cy.get('[data-testid="dateFeildValue-reconcilePaymentPostingDate"]').as('dateField').click().clear().type(twoMonthsAfterDate);
  cy.wait(5000)
  cy.get('[data-testid="reconsileModelBtn"]').click()
  cy.contains ('p[class="text-sm font-medium text-red-800"]', 'You cannot add Future Posting Date');

  });

  it('Case 30: Add wrong formated date in Posting Date field', () => {
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Payment Reconciliation").click()
    cy.wait(3000)
    cy.get('input[placeholder="Payment Number"]').type('payment12345')
    cy.wait(1000)
    cy.get('[data-testid="searchPayment"]').click()
    cy.get('[data-testid="paymentReconcileBtn"]').click()
    cy.wait(5000)
    cy.get('[data-testid="dateFeildValue-reconcilePaymentPostingDate"]').as('dateField').click().clear().type("01/00/0000");
    cy.wait(5000)
    cy.get('[data-testid="reconsileModelBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");

  });

  it('Case 31: Add Previous month date in the posting field - Post Payment -> Bulk Write OFF', () => {
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Bulk Write-Off").click()
    cy.wait(3000)
    cy.get('input[placeholder="Claim ID"]').type('198142')
    cy.get('input[type="radio"][value="insurance"]').check();
    cy.get('[data-testid="seachBulkWriteoffBtn"]').click()
    cy.get('[data-testid="bulkWriteoffRecordBtn"]').click()
    cy.get('[data-testid="dateFeildValue-bulkWriteoffPostingDate"]').as('dateField').click().clear().type(postingDate)
    cy.get('[data-testid="bulkWriteModelText"]').click()
    cy.get('[data-testid="bulkModelConfirmBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 32: Add two month previous date in the posting field', () => {
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Bulk Write-Off").click()
    cy.wait(3000)
    cy.get('input[placeholder="Claim ID"]').type('198142')
    cy.get('input[type="radio"][value="insurance"]').check();
    cy.get('[data-testid="seachBulkWriteoffBtn"]').click()
    cy.get('[data-testid="bulkWriteoffRecordBtn"]').click()
    cy.get('[data-testid="dateFeildValue-bulkWriteoffPostingDate"]').as('dateField').click().clear().type(twoMonthAgoDate)
    cy.get('[data-testid="bulkWriteModelText"]').click()
    cy.get('[data-testid="bulkModelConfirmBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });

  it('Case 33: Add same month date in the posting field', () => {
    // cy.addClaimPatient2(
    //   "152100", // patientId
    //   "M12.242", // icdCode
    //   "00100",   // cptCode
    //   "| Villonodular synovitis (pigmented), left hand", // diagnosis
    //   "50", // chargesFee
    //   "50", // chargesInsRespFee
    //   "0",
    // );
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Bulk Write-Off").click()
    cy.wait(3000)
    cy.get('input[type="radio"][value="insurance"]').check();
    cy.get('[data-testid="seachBulkWriteoffBtn"]').click()
    cy.get('[data-testid="bulkWriteoffRecordBtn"]').first().click()
    cy.get('[data-testid="dateFeildValue-bulkWriteoffPostingDate"]').as('dateField').click().clear().type(twoDaysAgoString)
    cy.get('[data-testid="bulkWriteModelText"]').type("test")
    cy.get('[data-testid="bulkModelConfirmBtn"]').click()
    cy.contains("Yes, Write-Off").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Balance Successfully Written-Off');
  });

  it('Case 34: Add wrong formated date in Posting Date field', () => {
    cy.wait(2000)
    cy.get('img[alt="currencyDolar"]').click()
    cy.contains("Bulk Write-Off").click()
    cy.wait(3000)
    cy.get('input[placeholder="Claim ID"]').type('198142')
    cy.get('input[type="radio"][value="insurance"]').check();
    cy.get('[data-testid="seachBulkWriteoffBtn"]').click()
    cy.get('[data-testid="bulkWriteoffRecordBtn"]').click()
    cy.get('[data-testid="dateFeildValue-bulkWriteoffPostingDate"]').as('dateField').click().clear().type("01/00/0000")
    cy.get('[data-testid="bulkWriteModelText"]').click()
    cy.get('[data-testid="bulkModelConfirmBtn"]').click()
    cy.contains("You can not add previous month's Posting Date after 07/08/2023");
  });
});
