import test from "node:test";
import assert from "node:assert/strict";
import { validateMembershipApplication } from "../src/domain/membership/application.ts";

const shared = {
  areas_of_interest: ["Research / Academic Institution"].map(() => "Medical Cannabis Research and Development"),
  sector_involvement: "Research / Academic Interest",
  heard_about: "Cooperative Website",
  join_reason: "I want to contribute research and professional experience to the cooperative.",
  declaration_accurate: true,
  declaration_bylaws: true,
  declaration_review: true,
  declaration_privacy: true,
};

const individual = {
  ...shared,
  applicant_type: "individual",
  full_name: "Test Applicant",
  date_of_birth: "1990-01-01",
  nationality: "Uganda",
  occupation: "Agronomist",
  phone_primary: "+256 700 000000",
  email: "applicant@example.com",
  country_residence: "Uganda",
  district_city: "Kampala",
  physical_address: "Kampala, Uganda",
};

const organization = {
  ...shared,
  applicant_type: "organization",
  organization_name: "Example Research Ltd",
  organization_type: "Research / Academic Institution",
  registration_number: "REG-001",
  country_registration: "Uganda",
  registration_year: "2020",
  business_activities: "Agricultural and life sciences research.",
  registered_office_address: "Kampala, Uganda",
  operations_location: "Kampala",
  representative_name: "Authorized Person",
  representative_position: "Director",
  representative_phone: "+256700000000",
  representative_email: "director@example.com",
  authorization_declaration: true,
};

test("accepts complete individual and organization applications", () => {
  assert.equal(validateMembershipApplication(individual).ok, true);
  assert.equal(validateMembershipApplication(organization).ok, true);
});

test("requires fields for the selected applicant category", () => {
  assert.equal(validateMembershipApplication({ ...individual, full_name: "" }).ok, false);
  assert.equal(validateMembershipApplication({ ...organization, authorization_declaration: false }).ok, false);
});

test("validates shared interests, declarations, email and telephone", () => {
  assert.equal(validateMembershipApplication({ ...individual, areas_of_interest: [] }).ok, false);
  assert.equal(validateMembershipApplication({ ...individual, declaration_privacy: false }).ok, false);
  assert.equal(validateMembershipApplication({ ...individual, email: "invalid" }).ok, false);
  assert.equal(validateMembershipApplication({ ...individual, phone_primary: "abc" }).ok, false);
});

test("requires details when an Other option is selected", () => {
  assert.equal(validateMembershipApplication({ ...individual, areas_of_interest: ["Other"] }).ok, false);
  assert.equal(validateMembershipApplication({ ...individual, heard_about: "Other" }).ok, false);
});
