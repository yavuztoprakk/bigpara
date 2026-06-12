import React from "react";
import LegalDocument from "./LegalDocument";
import { MEMBERSHIP_AGREEMENT } from "./data/membershipAgreement";

const KullaniciSozlesmesi = () => (
  <LegalDocument title="Üyelik Sözleşmesi" blocks={MEMBERSHIP_AGREEMENT} />
);

export default KullaniciSozlesmesi;
