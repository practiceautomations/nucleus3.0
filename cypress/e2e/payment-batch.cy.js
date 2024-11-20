beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(2000)
  cy.findByTestId('Org').click();
  cy.wait(2000)
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.wait(1000)
  cy.get('[data-testid="org_confirm"] > .rounded-md').click()
  cy.wait(1000) 
  cy.get('img[alt="documentDownload2"]').click()
  cy.findByText("Payment Batch").click()
  cy.wait(3000)
  cy.findByText("Create New Payment Batch").click()

});
// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

describe('Test Case for WBT-327, Managing Payment Batches ',()=>{
  it('Case 1: Add a New Payment Batch',()=>{ 
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
    
  });
  it('Case 2: Validate the Auto Selection of the Organization in Group Field',()=>{ 
    cy.contains('span[class="block truncate"]','Whitebox Organization test')
  });
  it('Case 3: Add a New Payment Batch with Payment Type Check',()=>{ 
    cy.get('[data-testid="payment_batch_description"]').type("WhiteBox Payment Batch");
    cy.get('[data-testid="payment_batch_status"]').click();
    cy.findByText("New").click()
    cy.get('[data-testid="payment_batch_type"]').click();
    cy.findByText("Check").click()
    cy.wait(1000)
    cy.get('[data-testid="payment_number"]').type("UN85256QA");
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
  });
  it('Case 4: Edit any Existing Batch and update the Data',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="batch_id"]').type("9839")
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.findByText("#9839").click()
    cy.findByText("Edit").click()
    cy.get('[data-testid="payment_batch_description"]').clear().type("Updated Description");
    cy.get('p[data-testid="new_payment_batch"]').click();
    cy.wait(1000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Update')

  });
  it('Case 5: Validate the Validations by leaving required fields blank',()=>{
    cy.get('p[data-testid="new_payment_batch"]').click();
    cy.findByText("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")
  });
  it('Case 6: Validate the AutoRefresh functionality after adding a new Batch',()=>{
    cy.findByText("Cancel").click();
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("New").click();
    cy.wait(1000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.wait(1000)
    cy.findByText("Create New Payment Batch").click()
    cy.get('[data-testid="payment_batch_description"]').type("AutoRefresh Functionality");
    cy.get('[data-testid="payment_batch_status"]').click();
    cy.contains('span[class="block "]', 'New').click()
    cy.get('[data-testid="payment_batch_type"]').click();
    cy.contains('span[class="block "]', 'Cash').click()
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
    cy.get('[data-testid="total_ins_pay_batch"]').type("250");
    // save btn
    cy.get('p[data-testid="new_payment_batch"]').click();
    cy.wait(1000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Batch Successfully Created')
    cy.wait(2000)
    cy.findByText("AutoRefresh Functionality")
  });

  it('Case 7: Validate the Create Batch, by adding data in the fields and click on the Cancel button',()=>{
    cy.get('[data-testid="payment_batch_status"]').click();
    cy.findByText("Open").click()  
    cy.wait(1000)
    cy.get('img[alt="close"]').eq(1).click();
    cy.findByText(`Are you sure you want to cancel creating this batch? Clicking "Confirm" will result in the loss of all changes.`)
    cy.findByText("Confirm").click()
  });
  it('Case 8: Validate the Batch Assignee from the Batch Detail Screen',()=>{
    cy.findByText("Cancel").click();
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("New").click();
    cy.wait(1000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
    cy.wait(3000)
    cy.get('[data-testid="paymentBatchAddAssigne"]').click();
  });
  it('Case 9: Validate the Add Note functionality in Batch Detail Screen',()=>{
    cy.findByText("Cancel").click();
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("New").click();
    cy.wait(1000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
    cy.wait(3000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.get('[data-testid="addNewNote"]').click()
    cy.wait(2000)
    cy.get('[data-testid="noteType"]').click()
    cy.wait(2000)
    cy.get('[data-testid="singleDropdownOption-noteTypeOptionID"]').contains("Patient Collections").click()
    cy.wait(1000)
    cy.get('[data-testid="sbjinput"]').click({force:true}).type("Testing Note")
    cy.wait(1000)
    cy.get('[data-testid="noteDescription"]').type("Testing Noteasd")
    cy.get('[data-testid="addNote"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
  });
  it('Case 10: Validate the Note Edit Functionality in Batch Detail Screen',()=>{
    cy.findByText("Cancel").click();
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("New").click();
    cy.wait(1000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
    cy.wait(3000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.wait(1000)
    cy.get('[data-testid="viewNote"]').first().click();
    cy.get('[alt="pencil"]').eq(2).click();
    cy.get('[data-testid="noteDescription"]').clear().type("Note Message updated")
    cy.get('[data-testid="addNote"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note Updated successfully')
  });


  it('Case 12: Filter the Note on the basis of the Note type',()=>{
    cy.findByText("Cancel").click();
    cy.get('[data-testid="prc"]').eq(0).click();
    cy.findByText("New").click();
    cy.wait(1000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
    cy.wait(3000)
    cy.get('[data-testid="paymentNotes"]').click()
    cy.get('[data-testid="addNewNote"]').click()
    cy.wait(2000)
    cy.get('[data-testid="noteType"]').click()
    cy.wait(2000)
    cy.get('[data-testid="singleDropdownOption-noteTypeOptionID"]').contains("Billing").click()
    cy.wait(1000)
    cy.get('[data-testid="sbjinput"]').click({force:true}).type("Testing Note")
    cy.wait(1000)
    cy.get('[data-testid="noteDescription"]').type("Testing Noteasd")
    cy.get('[data-testid="addNote"]').click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Note saved successfully')
    cy.get('[data-testid="noteFilters"]').click()
    cy.get('[data-testid="filterOptions"]').contains("Billing").click()
    cy.get('[data-testid="applyNoteFiler"]').click()
  });

  it('Case 13: Filter the Note on the basis of the user',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="batch_id"]').type("9870")
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
    cy.get('[data-testid="paymentNotes"]').click()
    cy.get('[data-testid="noteFilters"]').click()
    cy.wait(2000)
    cy.get('[data-testid="noteTabs"]').contains("People").click({force:true})
    cy.wait(2000)
    cy.get('[data-testid="filterOptions"]').contains("Tester, White Box").click()
    cy.wait(2000)
    cy.get('[data-testid="applyNoteFiler"]').click()
  });

  it('Case 14: Validate the Add Note without adding the Note Type and Subject',()=>{
      cy.findByText("Cancel").click()
      cy.get('[data-testid="prc"]').eq(0).click();
      cy.findByText("New").click()
      cy.wait(1000)
      cy.get('[data-testid="payment_batch_search"]').click()
      cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
      cy.wait(3000)
      cy.get('[data-testid="paymentNotes"]').click()
      cy.get('[data-testid="addNewNote"]').click()
      cy.wait(2000)
      cy.get('[data-testid="addNote"]').click()
      cy.contains("This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.")  
  });
  it('Case 15: Validate the Search by Searching a Batch from the Search criteria by using Batch ID',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="batch_id"]').type("9870")
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.get('[data-testid="paymentBatchID"]:first').click({force:true});
  });
  it('Case 16: Validate the Search by Searching a Batch from the Search criteria by using Payment Number',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="paymentNumber"]').type("87654321")
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.findByText("87654321")
  });

  it('Case 17: Validate the Search by Searching a Batch from the Search criteria by using Batch Status',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="batchStatus"]').click().contains("Open").click()
    cy.wait(2000)
    cy.get('[data-testid="payment_batch_search"]').click()
  });
  it('Case 18: Validate the Search by Searching a Batch from the Search criteria by using Payment Type',()=>{
    cy.findByText("Cancel").click()
    cy.get('[data-testid="paymentType"]').click().contains("Cash").click()
    cy.wait(2000)
    cy.get('[data-testid="payment_batch_search"]').click()
    cy.findByText("Cash")
  });

});