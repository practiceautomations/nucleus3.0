const { findByText } = require("@testing-library/react");

beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(5000)
  cy.findByTestId('Org').click();
  cy.get('span:contains("Whitebox Organization test"):first').click();
  cy.get('button[class="rounded-md px-5 py-3 text-sm font-normal text-white bg-cyan-500"]').click({force: true})
  cy.findByText('Confirm').click();  
  cy.wait(3000)
  cy.visit('/app/create-claim')

});

// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

describe('Test Case for: WBT-160, Field assisted claim creation',()=>{
  it('Case 1: Validate the alert without selecting/Entering any data in any fields',()=>{ 
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Patient');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Group');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Practice');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Facility');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Rendering Provider');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select ICD');
  });
  it('Case 2: Validate the ICD Validation, without selecting any ICD in the Claim',()=>{ 
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select ICD');
  });
  it('Case 3: Validate the alert by adding Future DOS From',()=>{ 
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOS cannot be in Future');
  });

  it('Case 4: Validate the Claim Creation by adding the same ICD multiple times in a claim ',()=>{
    cy.get('[data-testid="addIcdDropdown"]').click().type("M12.242")
    cy.wait(1000)
    cy.findByText("M12.242").click()
    cy.wait(2000)
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('[data-testid="addIcdDropdown"]').click().type("M12.242").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Same ICD cannot be repeated');
  })

  it('Case 5: Validate the Claim Creation by adding more than 12 ICD codes in a claim',()=>{
    cy.get('[data-testid="addIcdDropdown"]').click().type("M12.242")
    cy.wait(1000)
    cy.findByText("M12.242").click()
    cy.wait(2000)

    // 2
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('[data-testid="addIcdDropdown"]').click().type("M25.72").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    //3 
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(2).type("M25.721").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 4
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(3).type("M25.722").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 5
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(4).type("M25.312").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 6
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(5).type("M25.862").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 7
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(6).type("M25.60").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 8
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(7).type("M25.632").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 9
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(8).type("K12").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 10
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(9).type("K12.30").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 11
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(10).type("K12.31").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 12
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(11).type("K12.1").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    // 13
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(12).type("K12.2").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)

    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Only 12 ICD-10 Codes are allowed');
  })
  it('Case 6: Validate the DX Pointer alert against a charge',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M12.242")
    cy.wait(1000)
    cy.findByText("M12.242").click()
    cy.wait(1000)

    cy.get('[data-testid="chargesCptCode"]').click().type("81002");
    cy.wait(1000);
    cy.findByText("81002").click();
    cy.wait(2000) 
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Charge requires a Diagnosis Pointer');
  })

  it('Case 7: Validate the DOS To alert against any charge',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M12.242")
    cy.wait(1000)
    cy.findByText("M12.242").click()
    cy.wait(1000)

    cy.get('[data-testid="chargesCptCode"]').click().type("81002");
    cy.wait(1000);
    cy.findByText("81002").click();
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOS is missing in Charge');
  })

  it('Case 9: Validate the alert by adding a NDC Code',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().click({force:true}).type("E011")
    cy.wait(1000)
    cy.findByText("E011").click()
    cy.get('[data-testid="chargesCptCode"]').click().type("81002");
    cy.wait(1000);
    cy.findByText("81002").click();
    cy.wait(2000)

    cy.get('button[class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium !h-[38px] w-full !justify-start rounded-md  !text-gray-800 shadow-none !bg-white css-sghohy-MuiButtonBase-root-MuiButton-root"]').eq(0).click({force:true})
    cy.wait(2000)
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm bg-white bg-white"]').eq(2).type("12345-4444-22")
    cy.get('div[class="select2-selection__indicators css-0"]').eq(1).click()
    cy.findByText("Gram").click()
    cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm bg-white bg-white"]').eq(3).type("Glucose Drip")
    cy.findByText("Create NDC Rule").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'CPT NDC data added successfully.');
  })

  it('Case 10: Validate the alert without selecting the existing NDC code and clicking on the Edit button',()=>{  
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("91111")
    cy.wait(1000)
    cy.findByText("91111").click()
    cy.wait(2000)
    cy.get('button[class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium !h-[38px] w-full !justify-start rounded-md  !text-gray-800 shadow-none !bg-white css-sghohy-MuiButtonBase-root-MuiButton-root"]').eq(0).click()
    cy.wait(2000)
    cy.get('div[class="flex items-center justify-center  w-10 p-2 bg-white shadow border rounded-md border-gray-300"]').click();
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Atleast one NDC rule should be selected.');
  })
});

describe('Test Case for: WBT-142, Manually save a Work in Progress claim',()=>{
  it('Case 1: Validate the Save Claim by adding data in the all required fields',()=>{ 
   
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
   cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
   // cy.get('input[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(1).type("91111")
    // cy.wait(1000)
    // cy.findByText("91111").click()
    // cy.wait(2000)
    cy.get('[data-testid="addIcdDropdown"]').click().click({force:true}).type("M12.242")
    cy.wait(1000)
    cy.findByText("M12.242").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
  });
  it('Case 2: Validate the Save Claim by Leaving all the required fields empty',()=>{ 
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Patient');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Group');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Practice');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Facility');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select Rendering Provider');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select ICD');
  });
});

describe('Test Case for: WBT-157, Update and Add a modifier to a charge',()=>{
  it('Case 1-3: Add Modifiers with the Charge & Update the Modifiers, attached with an charge & Delete the Modifier from a charge',()=>{ 
    cy.wait(1000)
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(1000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.wait(2000)
    cy.get('[alt="pencil"]').eq(4).click();
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).type("26")
    cy.findByText("26").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Charge updated successfully');
    cy.get('[alt="pencil"]').eq(4).click();
    cy.get('div.select2-selection__value-container.css-1rptf7c-ValueContainer input').eq(4).clear()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Charge updated successfully');
  });
});

describe('Test Case for: WBT-151, Update and Add Charges to a Claim',()=>{
  it('Case 1,2: Validate the Claim by adding a Charge in the Claim and deleting a Charge from a Claim',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.wait(2000)
    cy.get('[alt="trash"]').eq(1).click();
  });

  it('Case 3: Validate the Claim by adding multiple charges to the Claim',()=>{ 
    cy.wait(1000)
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()

   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.wait(1000)
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    
    cy.wait(2000)
    cy.get('[alt="plus1"]').eq(5).click();
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('input[class="select2-selection__input"]').eq(6).type("0001M")
    cy.wait(1000)
    cy.findByText("0001M").click()
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(2).type("22").trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');

    cy.wait(2000)
    cy.get('[alt="plus1"]').eq(5).click();
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('input[class="select2-selection__input"]').eq(11).type("01250")
    cy.wait(1000)
    cy.findByText("01250").click()
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(5).type("22").trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
   
  });

  it('Case 4 - Case 5: Validate the Claim by deleting the existing charge and adding a new charge without save the Claim and by deleting the existing charge and adding a new charge after saving the Claim',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.wait(2000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');

    cy.wait(2000)
    cy.get('[alt="trash"]').eq(1).click();

    cy.get(':nth-child(6) > .bottom-0 > .items-center > [style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"] > [alt="plus1"]').click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).type("22")
    cy.findByText("22").click()
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).scrollIntoView().type("23")
    cy.findByText("23").click()
    cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });


  it('Case 6: Validate Updating an existing Charge in Edit Mode',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('input[class="select2-selection__input"]').eq(1).type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.wait(2000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');

    cy.wait(2000)
    cy.get('[alt="pencil"]').eq(4).click();
    cy.get('input[class="select2-selection__input"]').eq(1).click().type("0001M")
    cy.wait(1000)
    cy.findByText("0001M").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Charge updated successfully');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });
});

describe('Test Case for: WBT-154, Update and Add Diagnosis Code(s)',()=>{
  it('Case 1: Add the ICD code in the Claim',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
  });
  it('Case 2: Update the ICD code in the Claim',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click({force:true})
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    cy.wait(2000)
    cy.get('[data-testid="icd_input"] > [data-testid="singleGridDropdownMainDiv-undefined"] > .css-4vsj0j-container > .select2-selection__control > .select2-selection__value-container').type("764.08")
    cy.wait(1000)
    cy.findByText("764.08").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });
  it('Case 3: Delete the ICD code from the Claim',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    // 2
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('[data-testid="addIcdDropdown"]').click().type("764.08").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    cy.wait(2000)
    cy.get('[alt="trash"]').eq(0).click();
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });
  it('Case 4: Delete the ICD code that is attached with a Charge',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.wait(2000)
    cy.get('[alt="trash"]').eq(0).click();
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'This Diagnosis code is attached with charge.You need to remove it from charge first.');
  });
  it('Case 5: Validate the Charge by attaching multiple ICD codes with a Charge',()=>{  
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    // 2
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(1).click().type("764.08").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)
    //3 
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(2).type("764.14").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)

   cy.wait(1000);
   cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('input[class="select2-selection__input"]').eq(3).type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("| LT-F-D NO FETL MLNUTRT 2000-2499 GM").click()
    cy.wait(2000)
    cy.findByText("| LT-F-D W/FETL MALNUT 1,000-1,249 G").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });
  it('Case 6: Delete the ICD code from the Claim, Delete all the ICDs from the claim',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)

    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    cy.wait(2000)
    cy.get('[alt="trash"]').eq(0).click();
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select ICD');
  });

});

