import type { Metadata } from "next";
import LegalPage, { LegalSection } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | acacia Safaris",
};

const sections: LegalSection[] = [
  {
    title: "About These Terms",
    body: (
      <p>
        These terms apply to all bookings and services provided by acacia
        Safaris Ltd (&quot;we&quot;, &quot;us&quot;). By making a booking or
        using our website, you agree to them.
      </p>
    ),
  },
  {
    title: "Bookings & Payments",
    body: (
      <ul>
        <li>
          A booking is confirmed once we receive your deposit and send written
          confirmation.
        </li>
        <li>
          The remaining balance is due before your trip starts, on the date
          shown in your invoice.
        </li>
        <li>
          Gorilla and chimpanzee permits must be paid in full at the time of
          booking, as they are bought in advance from park authorities.
        </li>
        <li>
          Prices are quoted in the currency stated on your invoice and may
          change if taxes, park fees or exchange rates change.
        </li>
      </ul>
    ),
  },
  {
    title: "Cancellations & Refunds",
    body: (
      <>
        <p>
          If you need to cancel, please tell us in writing. Cancellation charges
          depend on how close to departure you cancel and on the policies of our
          partner lodges and airlines. The exact charges are listed in your
          booking confirmation.
        </p>
        <p>
          Permits are generally non-refundable once purchased, as set by the
          issuing park authority.
        </p>
      </>
    ),
  },
  {
    title: "Changes to Your Trip",
    body: (
      <p>
        We will do our best to accommodate changes you request, subject to
        availability and any extra costs. In rare cases we may need to adjust an
        itinerary because of weather, safety or circumstances beyond our
        control. We will always offer a suitable alternative.
      </p>
    ),
  },
  {
    title: "Travel Documents & Health",
    body: (
      <p>
        You are responsible for having a valid passport, visas and any required
        vaccinations (such as yellow fever). Gorilla trekking requires a
        reasonable level of fitness, and you may be refused entry to a park if
        you are visibly unwell.
      </p>
    ),
  },
  {
    title: "Travel Insurance",
    body: (
      <p>
        Comprehensive travel insurance covering cancellation, medical
        emergencies and evacuation is strongly recommended for all travelers.
      </p>
    ),
  },
  {
    title: "Your Responsibilities",
    body: (
      <p>
        We ask all guests to follow the instructions of guides and rangers,
        respect wildlife, local communities and park rules, and behave in a way
        that keeps everyone safe.
      </p>
    ),
  },
  {
    title: "Limitation of Liability",
    body: (
      <p>
        We carefully select our partners, but we are not responsible for loss,
        injury or delay caused by events beyond our reasonable control,
        including natural events, strikes, political unrest or the actions of
        independent suppliers.
      </p>
    ),
  },
  {
    title: "Website Use",
    body: (
      <p>
        All photos, text and content on this website belong to acacia Safaris
        Ltd or its partners and may not be copied without permission.
      </p>
    ),
  },
  {
    title: "Governing Law",
    body: (
      <p>These terms are governed by the laws of the Republic of Rwanda.</p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      label="Legal"
      title="Terms of Service"
      updated="October 18, 2026"
      intro="Please read these terms carefully before booking with acacia Safaris Ltd. They explain your rights and responsibilities, and ours, so your journey runs smoothly."
      sections={sections}
    />
  );
}
