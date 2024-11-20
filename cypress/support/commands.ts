import '@testing-library/cypress/add-commands'

Cypress.Commands.add('login', (username, password) => {
  cy.session([username,password],()=>{
    cy.visit('/login')
    cy.findByLabelText('Email').type(username)
    cy.findByLabelText('Password').type(password)
    cy.findByRole('button',{name:/sign in/i}).click()
    cy.wait(5000)
    cy.location('pathname').should('match', /\/monthly-summary$/);
  })
})


Cypress.Commands.add('enterCurrentDate', (selector) => {
  const currentDate = new Date();
  const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;

  cy.get(selector).as('dateField').click({ force: true });
  cy.get('@dateField').type(formattedDate);
});


// Cypress.Commands.add('setPostingDate', () => {
//   const currentDate = new Date();
//   const currentDateOfMonth = currentDate.getDate();
//   let postingDate;

//   if (currentDateOfMonth <= 8) {
//     // Use Data 1
//     const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
//     postingDate = twoMonthsAgo.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
//   } else {
//     // Use Data 2
//     const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 23);
//     postingDate = lastMonth.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
//   }

//   return cy.get('[data-testid="dateFeildValue-posting_date_testid"]').as('dateField').clear().type(postingDate);
// });


// Cypress.Commands.add('enterTwoDaysEarlierDate', (selector) => {
//   cy.log(`Selector: ${selector}`);
//   const currentDate = new Date();
//   currentDate.setDate(currentDate.getDate() - 2);
//   const formattedDate = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear().toString()}`;
  
//   cy.get(selector).then($dateField => {
//     const currentValue = $dateField.val();
//     cy.log(`Current value: ${currentValue}`);
//   });

//   cy.get(selector).as('dateField').click({ force: true });
//   cy.get('@dateField').clear().type(formattedDate);
// });



Cypress.Commands.add('addClaimPatient', (patientId, icdCode, cptCode, diagnosis, chargesFee, chargesInsRespFee, chargesPatResp) => {
  cy.wait(1000);
  cy.get('[data-testid="addClaimPatient"]').click();
  cy.wait(1000);
  cy.get('[data-testid="claimPatientSearch"]').type(patientId);
  cy.contains(patientId).click();
  cy.get('[data-testid="addIcdDropdown"]').click().type(icdCode);
  cy.wait(1000);
  cy.findByText(icdCode).click();
  cy.wait(1000);
  cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
  cy.wait(1000);
  cy.get('[data-testid="chargesCptCode"]').click().type(cptCode);
  cy.wait(1000);
  cy.findByText(cptCode).click();
  cy.wait(2000);

  cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
  cy.findByText("22").click()
  cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
  cy.findByText("23").click({force:true})
  cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
  cy.contains(diagnosis).click();


  cy.get('[data-testid="chargesFee"]').type(chargesFee);
  cy.get('[data-testid="chargesInsRespFee"]').scrollIntoView().clear().type(chargesInsRespFee);
  cy.get('[data-testid="chargesPatResp"]').scrollIntoView().type(chargesPatResp);
  cy.findByText('Save').click();
  cy.wait(2000);
  cy.findByText("Save and Continue").scrollIntoView().click({force:true});
  cy.findByText('Submit Claim').click();
  cy.wait(3000);
  cy.findByText('OK').click();
  cy.wait(3000);
});


Cypress.Commands.add('addClaimPatient2', (patientId, icdCode, cptCode, diagnosis, chargesFee, chargesInsRespFee, chargesPatResp) => {
  cy.wait(1000);
  cy.get('[data-testid="addClaimPatient"]').click();
  cy.wait(1000);
  cy.get('[data-testid="claimPatientSearch"]').type(patientId);
  cy.contains(patientId).click();
  cy.get('[data-testid="addIcdDropdown"]').click().type(icdCode);
  cy.wait(1000);
  cy.findByText(icdCode).click();
  cy.wait(1000);
  cy.enterCurrentDate('[data-testid="dateFeildValue-chargesTo"]');
  cy.wait(1000);
  cy.get('[data-testid="chargesCptCode"]').click().type(cptCode);
  cy.wait(1000);
  cy.findByText(cptCode).click();
  cy.wait(2000);

  cy.get('[data-testid="modifier1"]').scrollIntoView().type("22")
  cy.findByText("22").click()
  cy.get('[data-testid="modifier2"]').scrollIntoView().type("23")
  cy.findByText("23").click({force:true})
  cy.get('[data-testid="charge_dx_testid"]').scrollIntoView().click().wait(2000);
  cy.contains(diagnosis).click();


  cy.get('[data-testid="chargesFee"]').clear().type(chargesFee);
  cy.get('[data-testid="chargesInsRespFee"]').scrollIntoView().clear().type(chargesInsRespFee);
  cy.get('[data-testid="chargesPatResp"]').scrollIntoView().clear().type(chargesPatResp);
  cy.findByText('Save').click()
  cy.wait(2000)
  cy.findByText("Save and Continue").scrollIntoView().click({force:true});
  cy.findByText('Submit Claim').click()
  cy.wait(3000)
  cy.findByText('Submit As Is').click()
  cy.wait(3000)
});