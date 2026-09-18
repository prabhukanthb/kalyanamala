import React from 'react';
import { BRAND, EMAIL, ORG, REGISTRATION_FEE, RENEWAL_FEE } from '../siteConfig';

const LegalPage = ({ title, children }) => (
  <div className="section" style={{ minHeight: '60vh' }}>
    <h2>{title}</h2>
    <div className="sub" style={{ maxWidth: 720 }}>{children}</div>
  </div>
);

export const Privacy = () => (
  <LegalPage title="Privacy Policy">
    <p>{BRAND}, operated by {ORG}, collects name, contact and biodata only to introduce Mala families. Phone and email are not printed on public cards or downloads. We do not sell member lists. Write to {EMAIL} to correct or remove your data.</p>
  </LegalPage>
);

export const Terms = () => (
  <LegalPage title="Terms of Use">
    <p>This service is for genuine matrimonial search within the Mala community. You must provide true information. {ORG} may withhold or remove a profile that fails verification. Matching does not guarantee a marriage. Meet safely and involve your family.</p>
  </LegalPage>
);

export const Refund = () => (
  <LegalPage title="Refund Policy">
    <p>Registration is {REGISTRATION_FEE}. Annual renewal is {RENEWAL_FEE}. Fees are explained by the Vijayawada office before payment. Refunds are considered by the Vijayawada office on a case-by-case basis. Email {EMAIL}.</p>
  </LegalPage>
);
