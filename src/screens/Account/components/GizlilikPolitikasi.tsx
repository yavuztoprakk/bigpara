import React from "react";
import LegalDocument from "./LegalDocument";
import { PRIVACY_POLICY } from "./data/privacyPolicy";

const GizlilikPolitikasi = () => (
  <LegalDocument title="Üye Aydınlatma Metni" blocks={PRIVACY_POLICY} />
);

export default GizlilikPolitikasi;
