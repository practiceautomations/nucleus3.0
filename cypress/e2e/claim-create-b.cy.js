
beforeEach(() => {
  cy.login('testwhitebox@gmail.com', 'i70A5@#K')
  cy.visit('/')
  cy.wait(1000)
  cy.visit('/app/create-claim')
});

// Get the current date
const currentDate = new Date();
// Format the date as per your input field's expected format
const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;


describe('Test Case for: WBT-148, Update and Add DX Pointers',()=>{
  it('Case 1: Validate the DX Pointer with a Charge',()=>{ 
    cy.addClaimPatient2(
      "152100", // patientId
      "M12.242", // icdCode
      "00100",   // cptCode
      "| Villonodular synovitis (pigmented), left hand", // diagnosis
      "50", // chargesFee
      "35", // chargesInsRespFee
      "15" // chargesPatResp
    );
    //cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });
  it('Case 2: Validate the multiple DX pointer with a single charge',()=>{ 
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

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('input[class="select2-selection__input"]').eq(2).type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("| LT-F-D NO FETL MLNUTRT 2000-2499 GM").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });

  it('Case 3: Validate maxium DX pointer with a single charge',()=>{ 
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
    // 3 
    // cy.get('button[class="items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-300  h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 "]').eq(11).click({force:true});
    // cy.wait(2000)
    // cy.get('input[class="select2-selection__input"]').eq(2).type("764.14").wait(5000).trigger('keydown', { keyCode: 13 })
    // cy.wait(2000)

    // // 4 
    // cy.get(':nth-child(5) > .bottom-0 > .items-center > [style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"] > [alt="plus1"]').click();
    // cy.wait(2000)
    // cy.get('input[class="select2-selection__input"]').eq(3).type("452 | PORTAL VEIN THROMBOSIS").wait(2000)
    // cy.findByText("| PORTAL VEIN THROMBOSIS").click()
    // cy.wait(2000)

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('input[class="select2-selection__input"]').eq(2).type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("| LT-F-D NO FETL MLNUTRT 2000-2499 GM").click()
    cy.wait(2000)
    // cy.findByText("| LT-F-D W/FETL MALNUT 1,000-1,249 G").click()
    // cy.wait(2000)
    // cy.findByText("| PORTAL VEIN THROMBOSIS").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });


  it('Case 4: Validate multiple DX pointer with different charges',()=>{ 
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
    // 3 
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(2).type("764.14").wait(5000).trigger('keydown', { keyCode: 13 })
    cy.wait(2000)

    // 4 
    cy.get('[data-testid="AddMoreIcd"]').click()
    cy.wait(2000)
    cy.get('input[class="select2-selection__input"]').eq(3).type("452 | PORTAL VEIN THROMBOSIS").wait(2000)
    cy.findByText("| PORTAL VEIN THROMBOSIS").click()
    cy.wait(2000)

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('input[class="select2-selection__input"]').eq(4).type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("| LT-F-D NO FETL MLNUTRT 2000-2499 GM").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');

    cy.wait(2000)
    cy.get(':nth-child(6) > .bottom-0 > .items-center > [style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"] > [alt="plus1"]').click();
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('input[class="select2-selection__input"]').eq(9).type("0001M")
    cy.wait(1000)
    cy.findByText("0001M").click()
    cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
    cy.wait(2000)
    cy.findByText("| LT-F-D W/FETL MALNUT 1,000-1,249 G").click()
    cy.wait(2000)
    cy.findByText("| PORTAL VEIN THROMBOSIS").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');

    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });

  it('Case 5: Update the DX code that is attached with a charge',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');

    cy.wait(2000)
    cy.get('[data-testid="icd_input"] > [data-testid="singleGridDropdownMainDiv-undefined"] > .css-4vsj0j-container > .select2-selection__control > .select2-selection__value-container').type("764.08")
    cy.wait(1000)
    cy.findByText("764.08").click()
  });

  it('Case 6: Delete the ICD code that is attached with a Charge',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()

    cy.wait(2000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');

    cy.get('[alt="trash"]').eq(0).click();
    cy.wait(1000)
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'This Diagnosis code is attached with charge.You need to remove it from charge first.');
  });


  it('Case 7: After saving the claim, update the DX code and validate the DX code validation',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()

    cy.wait(2000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.wait(2000)
    cy.get('[data-testid="icd_input"] > [data-testid="singleGridDropdownMainDiv-undefined"] > .css-4vsj0j-container > .select2-selection__control > .select2-selection__value-container').type("764.08")
    cy.wait(1000)
    cy.findByText("764.08").click()
    cy.wait(1000)
    cy.get(':nth-child(1) > [style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;"] > [alt="pencil"]').click();
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'Please Select the DX code');
  });
});

describe('Test Case for: WBT-137, Update and Add Date of Service',()=>{
  it('Case 1: Validate the Claim by adding the valid DOS in the claim and DOS mapping in the charge',()=>{ 
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('6').first().click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()

    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
    cy.findByText("23").click({force:true})
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.wait(2000)
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });

  it('Case 2: Validate the Claim by adding DOS on the charge level',()=>{ 
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)

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
  }); 
  
  it('Case 3: Validate the claim by updating the DOS on the charge level',()=>{ 
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
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
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.get('[alt="pencil"]').eq(4).click();
    cy.wait(1000)
    cy.get('[alt="calendar"]').eq(2).scrollIntoView().click();
    cy.findByText('6').click({force:true})
    cy.get('[alt="calendar"]').eq(3).scrollIntoView().click();
    cy.findByText('7').first().click({force:true})
    cy.findByText("Save").click()
  });

  it('Case 4: Validate the Claim DOS when there are multiple charges',()=>{ 
  cy.wait(1000);
  cy.get('[data-testid="addClaimPatient"]').click()
  cy.wait(1000)
  cy.get('[data-testid="claimPatientSearch"]').type("152100")
  cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
  cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
  cy.wait(1000)
  cy.findByText("M1A.3111").click()
  cy.wait(2000)
  cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');

  cy.get('[data-testid="chargesCptCode"]').click().type("00100")
  cy.wait(1000)
  cy.findByText("00100").click()
  cy.wait(2000)
  cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000)
  cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
  cy.findByText("Save").click()
  cy.wait(3000)
  cy.get('[alt="plus1"]').eq(5).click({force:true});
  cy.get('[alt="calendar"]').eq(5).click();
  cy.findByText('26').click({force:true})
  cy.get('input[class="select2-selection__input"]').eq(6).type("0001M")
  cy.wait(1000)
  cy.findByText("0001M").click()
  cy.get('div[class="select2-selection__value-container select2-selection__value-container--is-multi css-319lph-ValueContainer"]').click({force:true}).scrollIntoView()
  cy.wait(2000)
  cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
  cy.findByText("Save").click()
  cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  }); 

  it('Case 5: Validate the DOS fields by adding DOS From greater then DOS To, at claim level',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('8').click({force:true})
    cy.get('[data-testid="chargesCptCode"]').click().type("00100")
    cy.wait(1000)
    cy.findByText("00100").click()
    cy.wait(2000)
    cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click()
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOS from cannot be greater then DOS To');
    cy.wait(3000)
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    }); 

    it('Case 6: Validate the DOS fields by adding DOS From greater then DOS To, at charge level',()=>{
      cy.get('[data-testid="addClaimPatient"]').click()
      cy.wait(1000)
      cy.get('[data-testid="claimPatientSearch"]').type("152100")
      cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
      cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
      cy.wait(1000)
      cy.findByText("M1A.3111").click()
      cy.wait(2000)

      cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
      cy.get('[data-testid="chargesCptCode"]').click().type("00100")
      cy.wait(1000)
      cy.findByText("00100").click()
      cy.wait(2000)
      cy.get('#react-select-9-placeholder')
      .scrollIntoView()
      .click({ force: true })
      cy.wait(2000)
      cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
      cy.findByText("Save").click()
      cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOS from cannot be greater then DOS To');
      cy.wait(3000)
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');   
      cy.findByText("Save Claim").click()
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    });
    
    it('Case 7: DOS before Patient DOB - claim level only',()=>{
      cy.get('[data-testid="addClaimPatient"]').click()
      cy.wait(1000)
      cy.get('[data-testid="claimPatientSearch"]').type("152100")
      cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
      cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
      cy.wait(1000)
      cy.findByText("M1A.3111").click()
      cy.wait(2000)
      cy.get('input[class="flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent"]').eq(1).click().type("01/01/1994")
      cy.get('[data-testid="chargesCptCode"]').click().type("00100")
      cy.wait(1000)
      cy.findByText("00100").click()
      cy.wait(2000)
      cy.get('#react-select-9-placeholder')
      .scrollIntoView()
      .click({ force: true })
      cy.wait(2000)
      cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
      cy.findByText("Save").click()
      cy.contains ('p[class="text-sm font-medium text-red-800"]', 'DOS cannot be smaller than patient DOB');
      cy.wait(3000)
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');   
      cy.findByText("Save Claim").click()
      cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
    }); 
});

describe('Test Case for: WBT-139, Assign Claim to User / Group',()=>{
  it('Case 1: Create a claim and assign to a user, from claim creation',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    cy.get('button[data-testid="prc"]').eq(9).click()
    cy.contains("Box Tester, White").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
  }); 

  it('Case 2: Validate the "Assign Claim to" in claim edit mode',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    cy.get('button[data-testid="prc"]').eq(9).click()
    cy.findByText("Doe, Hassan").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
  }); 

  it('Case 3: Validate the "Note" for Assignee',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(2000)
    cy.get('button[data-testid="prc"]').eq(9).click()
    cy.contains("Box Tester, White").click()
    cy.get("#textarea").type("This is test Note")
    cy.findByText("Confirm").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim');
  }); 
});

describe('Test Case for: WBT-153, Fee schedule view for each CPT code',()=>{
  it('Case 1: Validate the Fee setup for a CPT, in which Fee is setup',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99242")
    cy.wait(1000)
    cy.findByText("99242").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });

  it('Case2: Validate the Fee setup for a CPT, with Modifiers',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99242")
    cy.wait(1000)
    cy.findByText("99242").click()
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });

  it('Case 3: Validate the Fee for a CPT, in which fee is not setup',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99245")
    cy.wait(1000)
    cy.findByText("99245").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });

  it('Case 4: Validate the Fee for a CPT, for multiple units',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99242")
    cy.wait(1000)
    cy.findByText("99242").click() 
    cy.wait(2000)
    //cy.get('input[class="w-full border-none placeholder:text-gray-400 focus:outline-none focus:ring-white sm:text-sm !pl-[9px] !pr-[9px] !pt-0 !pb-0"]').clear().type("2")
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });

  it('Case 5: Validate the Fee for a CPT, against which Fee is setup without Modifiers and no Fee setup with Modifiers',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99221")
    cy.wait(1000)
    cy.findByText("99221").click() 
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).scrollIntoView().type("22")
    cy.findByText("22").click()
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });

  it('Case 6: Validate the Fee for a CPT, against which Fee is setup with Modifiers and no Fee setup as default',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("M1A.3111")
    cy.wait(1000)
    cy.findByText("M1A.3111").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("36415")
    cy.wait(1000)
    cy.findByText("36415").click() 
    cy.wait(2000)
    cy.get('div[class="select2-selection__value-container css-1rptf7c-ValueContainer"]').eq(0).scrollIntoView().type("23")
    cy.findByText("23").click()
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Chronic gout due to renal impairment, right shoulder, w toph").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
  });
});

describe('Test Case for: WBT-140, Update and Add Facility / Place of Service',()=>{
  it('Case 1: Save a Claim by adding a POS in it -- at claim level',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('23 | Emergency Room - Hospital').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("V89.9")
    cy.wait(1000)
    cy.findByText("V89.9").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim')
  });
  it('Case 2: Validate the edit functionality, by editing a POS -- at claim level',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('23 | Emergency Room - Hospital').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("V89.9")
    cy.wait(1000)
    cy.findByText("V89.9").click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Claim')
    cy.get('[data-testid="pos"]').click();
    cy.findByText('24 | Ambulatory Surgical Center').click()
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });

  it('Case 3: Validate the delete/remove functionality, by removing the POS from the claim -- at claim level',()=>{
    cy.wait(1000);
    cy.get('[alt="documentText"]').click();
    cy.findByText('All Claims').click({ force: true });
    cy.location('pathname').should('match', /\/all-claims$/);  
    cy.findByTestId("clmsch").type('194954')
    cy.wait(5000);
    cy.get('span[class="px-2 py-1 text-center text-sm font-normal leading-5"]').click();
    cy.wait(2000);
    cy.findByTestId('ds').click()
    cy.contains('div', 'Claim ID#194954').should('be.visible')
    cy.findByText("#194954").click()   
    cy.wait(2000)
    cy.get('[data-testid="pos"]').click();
    cy.findByText('reset').click()
  });

  it('Case 4: Save a Claim by adding a POS for which Admission date is required -- at claim level',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('21 | Inpatient Hospital').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("V89.9")
    cy.wait(1000)
    cy.findByText("V89.9").click()
    cy.findByText("Save Claim").click()
    cy.contains('p[class="text-sm font-medium text-red-800"]', 'Addmission Date is required').should('be.visible')
  });

  it('Case 5: Save a Claim by adding a different POS in claim and different in charge',()=>{
    cy.wait(1000);
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152112")
    cy.findByText("152112 | john test | 01/01/1995 | Whitebox Practice test").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('23 | Emergency Room - Hospital').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("V89.9")
    cy.wait(1000)
    cy.findByText("V89.9").click()

    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99221")
    cy.wait(1000)
    cy.findByText("99221").click()
    cy.wait(2000)
    // cy.get('div[class="select2-selection__control css-1l4zf5x-control"]').eq(5).click()
    // cy.findByText('14 | Group Home').click()
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Person injured in unspecified vehicle accident").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.findByText("Save Claim").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim updated successfully');
  });

});

 describe('Test Cases for: WBT-158, Submit Charges and create new claim WF',()=>{
  it('Case 1: Validate the Claim Submission by submit a claim with valid data',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('32 | Nursing Facility').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("R52")
    cy.wait(1000)
    cy.findByText("R52").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99490")
    cy.wait(1000)
    cy.findByText("99490").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Pain, unspecified").click()
    cy.findByText("Save").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Successfully Saved Charge');
    cy.contains('span[class="hidden truncate sm:block"]','Save and Continue').click({force:true})
    cy.findByText("Submit + Create New Claim").click()
    cy.findByText("Submit As Is").click()
    cy.contains ('p[class="text-sm font-medium text-green-800"]', 'Claim Successfully Submitted');
  });

  it('Case 2: Validate the Claim Submission in which there are some issues',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.get('input[class="w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm').type("152102")
    cy.findByText("152102 | Butt John | 01/01/1995 | Whitebox Payto Practice").click({force:true})
    cy.get('[data-testid="pos"]').click();
    cy.findByText('32 | Nursing Facility').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("R52")
    cy.wait(1000)
    cy.findByText("R52").click()
    cy.wait(1000)
    cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
    cy.get('[data-testid="chargesCptCode"]').click().type("99490")
    cy.wait(1000)
    cy.findByText("99490").click()
    cy.wait(2000)
    cy.get('#react-select-9-placeholder')
    .scrollIntoView()
    .click({ force: true })
    cy.wait(2000)
    cy.findByText("| Pain, unspecified").click()
    cy.contains('span[class="hidden truncate sm:block"]','Save and Continue').click({force:true})
    cy.findByText("Submit + Create New Claim").click()
    cy.findByText("Patient Zip Code is missing").click()
  });

  it('Case 3: Validate the Claim Submission without any charge',()=>{
    cy.wait(1000);
    cy.get('[alt="calendar"]').eq(1).click();
    cy.findByText('25').click({force:true})
    cy.get('[data-testid="addClaimPatient"]').click()
    cy.wait(1000)
    cy.get('[data-testid="claimPatientSearch"]').type("152100")
    cy.findByText("152100 | Smith John | 01/01/1995 | White Box Practice").click()
    cy.get('[data-testid="pos"]').click();
    cy.findByText('32 | Nursing Facility').click()
    cy.get('[data-testid="addIcdDropdown"]').click().type("R52")
    cy.wait(1000)
    cy.findByText("R52").click()
    cy.contains('span[class="hidden truncate sm:block"]','Save and Continue').click({force:true})
    cy.findByText("Submit + Create New Claim").click()
    cy.findByText('No Charges Found Against This Visit.');
  });
});