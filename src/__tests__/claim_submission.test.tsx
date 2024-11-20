import request from 'supertest';
// const request = require("supertest");
const baseURL = 'http://20.84.145.83:40480';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('Test Case for: PA-1680, Claim Submission', () => {
  const credentials = {
    email: 'testwhitebox@gmail.com',
    password: 'i70A5@#K',
  };

  it('Case 1: Validate the Claim Submission by adding valid data in all fields', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim = [
      {
        claimID: '194537',
        submitAs: 'true',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const { title } = responseBody.response[0];
    expect(response.status).toBe(200);
    expect(title).toBe('Successfully Submitted');
  });

  it('Case 2: Validate the Claim Submission without adding DOS', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim2 = [
      {
        claimID: '194538',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim2)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const title = responseBody.response[1].issues[0].issue;
    expect(response.status).toBe(200);
    expect(title).toBe('DOS cannot be empty.');
  });

  it('Case 3: Validate the Claim Submission by adding valid DOS', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim3 = [
      {
        claimID: '194539',
        submitAs: 'true',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim3)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    expect(response.status).toBe(200);
  });

  it('Case 4: Validate the Claim Submission by adding Future DOS', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim4 = [
      {
        claimID: '194540',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim4)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const title = responseBody.response[1].issues[0].issue;
    expect(response.status).toBe(200);
    expect(title).toBe('DOS cannot be in future.');
  });

  it('Case 5-11: Validate the Claim Submission by missing the Billing Provider Data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim5 = [
      {
        claimID: '194541',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim5)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const npi = responseBody.response[1].issues[0].issue;
    const addressline = responseBody.response[1].issues[1].issue;
    const city = responseBody.response[1].issues[2].issue;
    const state = responseBody.response[1].issues[3].issue;
    const zipcode = responseBody.response[1].issues[4].issue;
    const zipcodeextension = responseBody.response[1].issues[5].issue;
    const taxid = responseBody.response[1].issues[6].issue;
    expect(response.status).toBe(200);
    expect(npi).toBe('Billing Provider NPI is missing.');
    expect(addressline).toBe('Billing Provider Address Line 1 is missing.');
    expect(city).toBe('Billing Provider City is missing.');
    expect(state).toBe('Billing Provider State is missing.');
    expect(zipcode).toBe('Billing Provider Zip Code is missing.');
    expect(zipcodeextension).toBe(
      'Billing Provider Zip Code Extension is missing.'
    );
    expect(taxid).toBe('Billing Provider Tax ID is missing.');
  });

  it('Case 12-16: Validate the Claim Submission by missing the Billing Provider Pay to Data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim6 = [
      {
        claimID: '194543',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim6)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const payaddressline = responseBody.response[1].issues[0].issue;
    const paycity = responseBody.response[1].issues[1].issue;
    const paystate = responseBody.response[1].issues[2].issue;
    const payzipcodeextension = responseBody.response[1].issues[3].issue;
    expect(response.status).toBe(200);
    expect(payaddressline).toBe(
      'Billing Provider Pay To Address Line 1 is missing.'
    );
    expect(paycity).toBe('Billing Provider Pay To City is missing.');
    expect(paystate).toBe('Billing Provider Pay To State is missing.');
    expect(payzipcodeextension).toBe(
      'Billing Provider Pay To Zip Code Extension is missing.'
    );
  });

  it('Case 17-23: Validate the Claim Submission by missing the Subscriber data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const patientinsurancepayload = {
      patientID: 152100,
      insuranceID: 82,
      insuredRelationID: 2,
      payerResponsibilityID: 1,
      insuranceNumber: '9CE8K82KC23',
      wcClaimNumber: 'wc12345678',
      groupName: '1234',
      groupNumber: '1234',
      policyStartDate: '2022-05-16',
      policyEndDate: '2023-05-16',
      mspTypeID: null,
      copay: null,
      assignment: true,
      active: true,
      firstName: 'Jhon',
      middleName: 'J',
      lastName: 'Doe',
      genderID: null,
      address1: null,
      address2: null,
      city: null,
      state: null,
      zipCode: null,
      zipCodeExtension: null,
      homePhone: null,
      cell: null,
      officePhone: null,
      officePhoneExtension: '',
      email: null,
      dob: null,
      comment: '',
      accidentDate: null,
      accidentTypeID: null,
      accidentStateID: null,
    };
    const response = await request(baseURL)
      .post('/api/Patient/AddPatientInsurance')
      .send(patientinsurancepayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const { errors } = responseBody;
    const subscribercity = errors[0];
    const subscriberstate = errors[1];
    const subscriberzipcode = errors[2];
    const subscriberaddressline = errors[3];
    const subscriberzipcodeext = errors[4];
    const subscriberdob = errors[5];
    const subscriberdobinfuture = errors[6];

    expect(response.status).toBe(400);
    expect(subscriberaddressline).toBe('The address1 field is required.');
    expect(subscribercity).toBe('The city field is required.');
    expect(subscriberstate).toBe('The state field is required.');
    expect(subscriberzipcode).toBe('The zipCode field is required.');
    expect(subscriberzipcodeext).toBe('Subscriber Zip Code Ext is missing.');
    expect(subscriberdob).toBe('Subscriber DOB is missing.');
    expect(subscriberdobinfuture).toBe('Subscriber DOB cannot be in future.');
  });

  it("Case 24: Validate the Claim Submission by missing the Subscriber's Gender", async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim6 = [
      {
        claimID: '194546',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim6)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const subscribergender = responseBody.response[1].issues[5].issue;
    expect(response.status).toBe(200);
    expect(subscribergender).toBe('Subscriber Gender is missing.');
  });

  it('Case 25-29: Validate the Claim Submission by missing the Insurance Data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim6 = [
      {
        claimID: '194548',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim6)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const insuranceaddressine = responseBody.response[0].issues[2].issue;
    const insurancecity = responseBody.response[0].issues[3].issue;
    const insurancestate = responseBody.response[0].issues[4].issue;
    const insurancezipcode = responseBody.response[0].issues[5].issue;
    const insurancezipcodeextension = responseBody.response[0].issues[6].issue;
    expect(response.status).toBe(200);
    expect(insuranceaddressine).toBe('Insurance Address Line 1 is missing.');
    expect(insurancecity).toBe('Insurance City is missing.');
    expect(insurancestate).toBe('Insurance State is missing.');
    expect(insurancezipcode).toBe('Insurance Zip Code is missing.');
    expect(insurancezipcodeextension).toBe(
      'Insurance Zip Code Extension is missing.'
    );
  });

  it('Case 30-34: Validate the Claim Submission by missing the Patient Data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const patientPayload = {
      groupID: 53,
      practiceID: 102,
      facilityID: 934,
      posID: 14,
      providerID: 155,
      firstName: 'Whitebox Patient',
      middleName: '',
      lastName: 'john',
      dob: '1995-01-01',
      genderID: 1,
      maritalStatusID: 1,
      accountNo: 'abcdef12345678',
      active: true,
      eStatement: true,
      address1: null,
      address2: null,
      city: null,
      state: null,
      zipCode: null,
      zipCodeExtension: null,
      homePhone: null,
      workPhone: null,
      cellPhone: null,
      fax: null,
      email: null,
      raceID: null,
      ethnicityID: null,
      languageID: null,
      primaryCarePhysician: 'pramary care physcian',
      category: null,
      chartNo: null,
      licenseNo: null,
      employerName: null,
      smokingStatusID: null,
      deceaseDate: null,
      deceaseReason: null,
      emergencyRelation: null,
      emergencyFirstName: null,
      emergencyLastName: null,
      emergencyAddress1: null,
      emergencyAddress2: null,
      emergencyZipCodeExtension: null,
      emergencyCity: null,
      emergencyState: null,
      emergencyZipCode: null,
      emergencyTelephone: null,
      emergencyEmail: null,
    };
    const response = await request(baseURL)
      .post('/api/Patient/savePatient')
      .send(patientPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);
    const { errors } = responseBody;
    const patientcity = errors[0];
    const patientstate = errors[1];
    const patientzipcode = errors[2];
    const patientaddressline = errors[3];
    const patientzipcodeext = errors[4];

    expect(response.status).toBe(400);
    expect(patientaddressline).toBe('The address1 field is required.');
    expect(patientcity).toBe('The city field is required.');
    expect(patientstate).toBe('The state field is required.');
    expect(patientzipcode).toBe('The zipCode field is required.');
    expect(patientzipcodeext).toBe('The zipCode ext field is required.');
  });

  it('Case 35: Validate the Claim Submission by missing the primary ICD code', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const claimPayload = {
      appointmentID: null,
      claimStatusID: 1,
      scrubStatusID: 7,
      submitStatusID: 1,
      patientID: 152102,
      patientInsuranceID: 262437,
      insuranceID: 5343,
      subscriberID: '457127297A',
      dosFrom: '2023-02-12',
      dosTo: '2023-02-15',
      groupID: 53,
      practiceID: 103,
      facilityID: 944,
      posID: 14,
      providerID: 157,
      referringProviderNPI: null,
      referringProviderFirstName: null,
      referringProviderLastName: null,
      referralNumber: 123,
      supervisingProviderID: 2,
      panNumber: 123,
      icd1: '',
      icd2: '',
      icd3: '',
      icd4: null,
      icd5: null,
      icd6: null,
      icd7: null,
      icd8: null,
      icd9: null,
      icd10: null,
      icd11: null,
      icd12: null,
      dischargeDate: null,
      currentIllnessDate: null,
      disabilityBeginDate: null,
      disabilityEndDate: null,
      firstSymptomDate: null,
      initialTreatmentDate: null,
      lmpDate: null,
      lastSeenDate: null,
      lastXrayDate: null,
      simillarIllnesDate: null,
      responsibilityDate: null,
      accidentDate: null,
      accidentTypeID: null,
      accidentStateID: null,
      labCharges: null,
      delayReason: null,
      epsdtConditionID: null,
      serviceAuthExcepID: null,
      specialProgramIndicatorID: null,
      orderingProviderID: null,
      box19: null,
      emg: null,
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
      assignClaimTo: '37928b14-faf6-4461-a96d-3a581858e287',
      assignUserNote: 'test 123',
      admissionDate: null,
    };
    const response = await request(baseURL)
      .post('/api/AddEditClaim/saveClaim')
      .send(claimPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const subscribergender = responseBody.errors[0];
    expect(response.status).toBe(400);
    expect(subscribergender).toBe('The icd1 field is required.');
  });

  it('Case 37-38: Validate the Claim Submission by adding smaller Discharge Date than the Admission Date and by missing the Accident type and add the Accident Date', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const claimPayload = [
      {
        claimID: '194550',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(claimPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);

    const responseBody = JSON.parse(response.text);

    const dischargeDate = responseBody.response[0].issues[7].issue;
    const accidentalType = responseBody.response[0].issues[8].issue;

    expect(response.status).toBe(200);
    expect(dischargeDate).toBe(
      'Discharge Date cannot be less than Admission Date.'
    );
    expect(accidentalType).toBe(
      'Accident Type is required when Accident Date is added.'
    );
  });

  it('Case 39-45: Validate the Claim Submission by adding the Accident type and missing the Accident Date and By missing Location data', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const claimPayload = [
      {
        claimID: '194551',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(claimPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const admissionDate = responseBody.response[0].issues[7].issue;
    const locationNpi = responseBody.response[0].issues[9].issue;
    const accidentalDate = responseBody.response[0].issues[10].issue;
    const locationAddress = responseBody.response[1].issues[7].issue;
    const locationCity = responseBody.response[1].issues[8].issue;
    const locationState = responseBody.response[1].issues[9].issue;
    const locationZipCode = responseBody.response[1].issues[10].issue;
    const locationZipCodeExt = responseBody.response[1].issues[11].issue;
    expect(response.status).toBe(200);
    expect(admissionDate).toBe('Admission Date should be less than DOS.');
    expect(locationAddress).toBe('Location Address Line1 is missing.');
    expect(locationCity).toBe('Location City is missing.');
    expect(locationState).toBe('Location State is missing.');
    expect(locationZipCode).toBe('Location Zip Code is missing.');
    expect(locationZipCodeExt).toBe('Location Zip Code Extension is missing.');
    expect(locationNpi).toBe('Location NPI is missing.');
    expect(accidentalDate).toBe(
      'Accident Date is required when Accident Type is added.'
    );
  });

  it('Case 46: Validate the Claim Submission by adding more than 80 character in BOX-19 field', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const claimPayload = [
      {
        claimID: '194552',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(claimPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const box19 = responseBody.response[1].issues[12].issue;
    expect(response.status).toBe(200);
    expect(box19).toBe(
      'Box19 Note must be between 1 and 80 characters in length'
    );
  });

  it('Case 47,49: Validate the Claim Submission by missing the Diagnosis Pointer, CPT and Service Description', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const claimPayload = [
      {
        claimID: '194555',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(claimPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const cpt = responseBody.response[1].issues[3].issue;
    expect(response.status).toBe(200);
    expect(cpt).toBe('Diagnosis Pointer is missing.');
    const serviceDescription = responseBody.response[0].issues[9].issue;
    expect(serviceDescription).toBe('Service Description is required for cpt');
  });

  it('Case 48: Validate the Claim Submission by missing the CPT', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const chargePayload = {
      claimID: 194553,
      groupID: 53,
      fromDOS: '2023-04-01',
      toDOS: '2023-04-11',
      cptCode: null,
      units: 200,
      mod1: '59',
      mod2: null,
      mod3: null,
      mod4: null,
      placeOfServiceID: 1,
      icd1: 'M54.5',
      icd2: null,
      icd3: null,
      icd4: null,
      ndcNumber: '0123456789',
      ndcUnit: '12345',
      ndcUnitQualifierID: 2,
      serviceDescription: null,
      fee: 200,
      insuranceAmount: 200,
      patientAmount: 200,
      chargeBatchID: null,
      chargePostingDate: '2023-04-11',
      systemDocumentID: null,
      pageNumber: null,
      pointers: null,
      sortOrder: null,
    };
    const response = await request(baseURL)
      .post('/api/AddEditClaim/saveCharge')
      .send(chargePayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const cpt = responseBody.errors[0];
    expect(response.status).toBe(400);
    expect(cpt).toBe('The cptCode field is required.');
  });

  it('Case 50-52: Validate the Claim Submission by adding multiple ICD codes and selecting more than one Diagnosis pointer with 1 CPT, and multiple CPT', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim = [
      {
        claimID: '194537',
        submitAs: 'true',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const { title } = responseBody.response[0];
    expect(response.status).toBe(200);
    expect(title).toBe('Successfully Submitted');
  });

  it('Case 53-57 & Case 61: Validate the Claim Submission by adding special characters in Billing Provider Address,Pay,Subscriber,Insurance to Address Line 1 and adding special character in BOX-19 field', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim = [
      {
        claimID: '194556',
        submitAs: 'true',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const { title } = responseBody.response[0];
    expect(response.status).toBe(200);
    expect(title).toBe('Successfully Submitted');
  });

  it("Case 58: Validate the Claim Submission by missing the Patient's Gender", async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const patientPayload = {
      patientID: 152100,
      groupID: 53,
      practiceID: 99,
      facilityID: 944,
      posID: 11,
      providerID: 156,
      firstName: 'John',
      middleName: null,
      lastName: 'Smith',
      dob: '2023-02-03',
      genderID: null,
      maritalStatusID: 1,
      accountNo: 'abcdef12345678',
      active: true,
      eStatement: true,
      address1: 'Test #6, NewYork, United States',
      address2: null,
      city: 'Peshawar',
      state: 'AR',
      zipCode: '12356',
      zipCodeExtension: '1235',
      homePhone: null,
      workPhone: null,
      cellPhone: null,
      fax: null,
      email: null,
      raceID: null,
      ethnicityID: null,
      languageID: null,
      primaryCarePhysician: 'pramary care physcian',
      category: null,
      chartNo: null,
      licenseNo: null,
      employerName: null,
      smokingStatusID: null,
      deceaseDate: null,
      deceaseReason: null,
      emergencyRelation: null,
      emergencyFirstName: null,
      emergencyLastName: null,
      emergencyAddress1: null,
      emergencyAddress2: null,
      emergencyzipCodeExtension: null,
      emergencyCity: null,
      emergencyState: null,
      emergencyZipCode: null,
      emergencyTelephone: null,
      emergencyEmail: null,
    };
    const response = await request(baseURL)
      .post('/api/Patient/updatePatient')
      .send(patientPayload)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    expect(response.status).toBe(400);
    const gender = responseBody.errors[0];
    expect(gender).toBe('The genderID field is required.');
  });

  it('Case 59 and Case 60: Validate the Claim Submission without adding the Billing Provider,Rendering Provider Taxonomy Code', async () => {
    const responseLogin = await request(baseURL)
      .post('/api/Users/signIn')
      .send(credentials);
    const submitClaim = [
      {
        claimID: '194557',
        submitAs: 'false',
      },
    ];
    const response = await request(baseURL)
      .post('/api/Claims/submitClaim')
      .send(submitClaim)
      .set('Authorization', `Bearer ${responseLogin.body.token}`);
    const responseBody = JSON.parse(response.text);
    const practiceTaxonomycode = responseBody.response[1].issues[13].issue;
    const providerTaxonomycode = responseBody.response[1].issues[14].issue;
    expect(response.status).toBe(200);
    expect(practiceTaxonomycode).toBe(
      'Billing Provider Taxonomy Code is missing.'
    );
    expect(providerTaxonomycode).toBe(
      'Rendering Provider Taxonomy Code is missing.'
    );
  });
});
