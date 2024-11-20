
beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();
  cy.wait(2000)
  cy.visit('/app/all-claims')     
});

describe('Test Case for WBT-333, Manual Payment Posting: Refund',()=>{
  it('Case 1: Validate the Patient Refund',()=>{ 
    
    cy.findByTestId("clmsch").type('199200')
    cy.wait(5000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.findByText("#199200").click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    
    cy.get('[data-testid="radiobuttons"]').eq(2).click()
    cy.get('[data-testid="refundType"]').click()
    cy.findByText("Patient Refund")

    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="refund_amount"]').type("20")
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');
  });

  it('Case 2: Validate the Insurance Refund',()=>{ 
   
    cy.findByTestId("clmsch").type('199200')
    cy.wait(5000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.findByText("#199200").click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()   
    cy.get('[data-testid="radiobuttons"]').eq(2).click()
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="refund_amount"]').type("20")
    cy.get('[data-testid="ArrowForwardIosIcon"]').click()
    cy.get('[data-testid="postPayment"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Insurance Payment Posted Successfully');
  });

  it('Case 3: Validate the Insurance Refund, when no insurance is attached with that selected patient',()=>{ 
   
    cy.findByTestId("clmsch").type('199200')
    cy.wait(5000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.findByText("#199200").click()
    cy.wait(3000)
    cy.findByText("Quick Actions").click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="radiobuttons"]').eq(2).click()
    cy.get('[data-testid="refundType"]').click()
    cy.contains("Insurance Refund").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'No Insurance is attached with this Patient');
  });

  it('Case 4: Validate the warning by clicking on the Cancel button',()=>{
   
    cy.wait(2000)
    cy.get('button[class="items-center self-end bg-transparent text-cyan-500 "]').eq(1).click()
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.get('[data-testid="quickActionBtn"]').click()
    cy.wait(1000)
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="radiobuttons"]').eq(2).click()
    cy.get('[data-testid="paymentType"]').click()
    cy.findByText("Cash").click()
    cy.get('[data-testid="paymentBatch"]').click()
    cy.get('[data-testid="singleGridDropdownOption-paymentBatchDropdown"]').eq(1).click()
    cy.get('[data-testid="refund_amount"]').type("20")
    cy.get('[data-testid="closeBtnPaymentPosting"]').eq(1).click()
    cy.findByText("Are you sure you want to cancel creating this batch? Clicking 'Confirm' will result in the loss of all changes")
  });

  it('Case 5: Validate the Required Validation by leaving required fields blank',()=>{ 
   
    cy.wait(2000)
    cy.contains('div', 'Open Claims').should('be.visible').click() 
    cy.wait(2000)
    cy.get('[data-testid="ClaimSearchClaimID"]').first().click()
    cy.wait(3000)
    cy.get('[data-testid="quickActionBtn"]').click()
    cy.contains("Post Payment").first().click()
    cy.get('[data-testid="paymentType"]').click()
    cy.wait(1000)
    cy.get('[data-testid="postPayment"]').click()
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });

});