import type { Metadata } from "next";
import LegalPage, { LegalSection } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Acasia Safaris",
};

const sections: LegalSection[] = [
  {
    title: "Information We Collect",
    body: (
      <>
        <p>When you contact us, make a booking or subscribe to our newsletter, we may collect:</p>
        <ul>
          <li>Your name, email address and phone number</li>
          <li>Travel details such as dates, number of travelers and preferences</li>
          <li>Passport details needed for permits, lodges and flights</li>
          <li>Dietary, medical or accessibility needs you choose to share</li>
          <li>Basic technical data such as browser type and pages visited</li>
        </ul>
      </>
    ),
  },
  {
    title: "How We Use Your Information",
    body: (
      <ul>
        <li>To answer your questions and plan your trip</li>
        <li>To make reservations, buy permits and arrange transfers on your behalf</li>
        <li>To keep you informed before and during your travels</li>
        <li>To send newsletters and offers, only if you have subscribed</li>
        <li>To improve our website and services</li>
      </ul>
    ),
  },
  {
    title: "Sharing Your Information",
    body: (
      <p>
        We never sell your personal data. We only share the details needed with trusted partners
        who help deliver your trip, such as lodges, airlines, park authorities and guides, or when
        required by law.
      </p>
    ),
  },
  {
    title: "Data Security",
    body: (
      <p>
        We take reasonable technical and organisational measures to protect your information from
        loss, misuse or unauthorised access. However, no method of transmission over the internet
        is completely secure.
      </p>
    ),
  },
  {
    title: "How Long We Keep Data",
    body: (
      <p>
        We keep your information only as long as needed to provide our services, meet legal and
        accounting obligations, or resolve disputes.
      </p>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Our website may use cookies to remember your preferences and understand how visitors use
        the site. You can disable cookies in your browser settings, although some features may not
        work as expected.
      </p>
    ),
  },
  {
    title: "Your Rights",
    body: (
      <p>
        You can ask to see, correct or delete the personal information we hold about you, or
        unsubscribe from our emails at any time. Just contact us using the details below.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this policy from time to time. The latest version will always be available
        on this page, with the date it was last updated.
      </p>
    ),
  },
  {
    title: "Contact Us",
    body: (
      <p>
        For any privacy questions, email us at{" "}
        <a href="mailto:info@acasiasafaris.com" className="text-[#1F5A42] underline underline-offset-2">
          info@acasiasafaris.com
        </a>{" "}
        or write to Acasia Safaris Ltd, Kigali, Rwanda.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      label="Legal"
      title="Privacy Policy"
      updated="October 18, 2026"
      intro="At Acasia Safaris Ltd, your privacy matters to us. This policy explains what information we collect, how we use it and the choices you have."
      sections={sections}
    />
  );
}
