// Makes one quotation PDF per published package, from the live API data.
// Run from the project root, with the backend running:  node quotations/generate.js
// Then upload each PDF in Admin > Packages > Edit > Quotation.
//
// Change the prices, dates or texts in SETTINGS and FAIR_PRICE, then run it again.
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const API_URL = "http://localhost:4000/api/packages";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const SETTINGS = {
  issued: "October 2026",
  validUntil: "31 January 2027",
  priceBasis: "Per person, in US dollars, based on two people sharing a room.",
  // share = part of the adult price. 0 = free.
  rates: [
    { label: "Adult", ages: "16 years and over", share: 1 },
    { label: "Teenager", ages: "12 to 15 years", share: 0.75 },
    { label: "Child", ages: "4 to 11 years", share: 0.5 },
    { label: "Infant", ages: "0 to 3 years", share: 0 },
  ],
  phone: "+250 798 635 578",
  email: "info@acaciasafaris.com",
  place: "Kigali, Rwanda",
};

const DAYS_PER_PAGE = 5;

// "Why this price is fair" for each package. Only say what the package really includes.
const FAIR_PRICE = {
  "7-Day Gorilla Trekking Adventure": [
    ["Less time on the road", "Private helicopter transfers turn long drives into short flights, so more of your week is spent in the parks."],
    ["Comfort from start to finish", "You stay in 3 to 5 star lodges and camps, with all your meals included."],
    ["Expert guides throughout", "Experienced safari guides lead your trip, so you see more and understand what you are seeing."],
  ],
  "5-Day Classic Wildlife Safari": [
    ["A private vehicle", "Your Land Cruiser with a pop-up roof is yours alone, so you are never sharing a window or a schedule."],
    ["Park fees already paid", "All national park and crater entry fees are in your price, with no surprises at the gate."],
    ["A certified naturalist guide", "A qualified guide and full-board lodge stays are included, so your days need no extra planning."],
  ],
  "10-Day Luxury Safari Escape": [
    ["Charter flights included", "All charter flights between regions are covered, saving days of driving across Kenya."],
    ["Every meal and drink", "Gourmet meals and premium drinks are included, so your bill does not grow during your stay."],
    ["Experiences you would pay extra for", "A hot air balloon safari, a private bush dinner, a spa treatment and VIP airport service are all part of the trip."],
  ],
  "7-Day Zanzibar Beach & Safari": [
    ["Two holidays in one", "One price covers both a Tanzanian safari and a stay at a Zanzibar beach resort."],
    ["The flight is included", "Your domestic flight to Zanzibar is covered, so there is no separate ticket to arrange."],
    ["Safari costs covered", "Your safari vehicle, guide and park entry fees are all in the price."],
  ],
  "8-Day Rwanda Adventure": [
    ["Your permits are included", "Gorilla and chimpanzee permits are among the biggest costs of a Rwanda trip, and they are in your price."],
    ["Boutique lodges with full board", "Your stays and meals are covered at characterful lodges across the country."],
    ["Private vehicle and guide", "You travel at your own pace, and all park entry fees are already paid."],
  ],
  "7-Day Ultra-Luxury Rwanda Villa Escape": [
    ["Private five-star stays", "Five-star villa suites give you privacy and personal service for the whole week."],
    ["Helicopter transfers", "Private helicopter transfers take you directly between your stays and the airport."],
    ["Nothing left to arrange", "VIP gorilla permits, gourmet meals, vintage wine and your own butler and sommelier are all included."],
  ],
};

const TERMS = [
  "A booking is confirmed once we receive your deposit and send written confirmation.",
  "The balance is due before your trip starts, on the date shown on your invoice.",
  "Gorilla and chimpanzee permits are paid in full at booking. They are bought in advance from the park authorities and are generally non-refundable.",
  "Prices may change if taxes, park fees or exchange rates change.",
  "Cancellation charges depend on how close to departure you cancel and on our partners' policies. Your booking confirmation lists the exact charges.",
  "Itineraries may be adjusted because of weather, safety or events beyond our control. We will always offer a suitable alternative.",
  "You need a valid passport, visas and any required vaccinations. We strongly recommend travel insurance covering cancellation, medical emergencies and evacuation.",
];

const STEPS = [
  ["Send your request", "Tell us your dates and how many people are traveling."],
  ["Talk to an expert", "A local specialist contacts you to fine-tune the details."],
  ["Get your itinerary", "Receive your final plan with lodges, activities and price."],
  ["Confirm and go", "Pay your deposit and get ready for your trip."],
];

const esc = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const usd = (n) => `$${n.toLocaleString("en-US")}`;
const roundTo10 = (n) => Math.round(n / 10) * 10;
const hasGorillas = (pkg) => /gorilla/i.test(`${pkg.title} ${pkg.tripType} ${pkg.category}`);

// Images are embedded so the PDF works offline; a missing image is left out
async function embed(url, width) {
  if (!url) return "";
  const sized = url.includes("images.unsplash.com") ? `${url.split("?")[0]}?auto=format&fit=crop&w=${width}&q=70` : url;
  try {
    const response = await fetch(sized);
    if (!response.ok) return "";
    const type = response.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  } catch {
    return "";
  }
}

const CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #0a120b; font-size: 10.5pt; line-height: 1.55; }
  .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; break-after: page; background: #fff; }
  .page:last-child { break-after: auto; }
  .content { position: absolute; inset: 0 0 18mm 0; padding: 18mm 18mm 0; overflow: hidden; }
  .serif { font-family: Georgia, "Times New Roman", serif; }
  .eyebrow { color: #a88a4c; font-size: 8pt; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; }
  h2 { font-family: Georgia, serif; font-weight: normal; font-size: 22pt; line-height: 1.2; margin: 2mm 0 7mm; }
  h3 { font-family: Georgia, serif; font-weight: normal; font-size: 14pt; margin-bottom: 3mm; }
  .rule { width: 16mm; height: 2px; background: #c5a86d; margin-bottom: 7mm; }
  .muted { color: rgba(10,18,11,.62); }
  .footer { position: absolute; left: 18mm; right: 18mm; bottom: 8mm; display: flex; justify-content: space-between; padding-top: 3mm;
    border-top: 1px solid rgba(10,18,11,.12); font-size: 7.5pt; color: rgba(10,18,11,.5); }

  .cover { background: #12231a; color: #fff; }
  .cover img.bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cover .veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18,35,26,.72) 0%, rgba(18,35,26,.2) 34%, rgba(18,35,26,.82) 66%, #12231a 100%); }
  .cover .top { position: absolute; top: 16mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; align-items: center; }
  .cover .logo { height: 21mm; }
  .cover .ref { text-align: right; font-size: 8pt; letter-spacing: 1px; color: rgba(255,255,255,.8); }
  .cover .main { position: absolute; left: 18mm; right: 18mm; bottom: 58mm; }
  .cover .eyebrow { color: #c5a86d; font-size: 9pt; letter-spacing: 5px; }
  .cover h1 { font-family: Georgia, serif; font-weight: normal; font-size: 38pt; line-height: 1.12; margin: 4mm 0 5mm; }
  .cover .rule { margin: 0 0 5mm; }
  .cover .lead { font-size: 11.5pt; color: rgba(255,255,255,.85); max-width: 150mm; }
  .facts { position: absolute; left: 18mm; right: 18mm; bottom: 18mm; display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm;
    padding-top: 6mm; border-top: 1px solid rgba(197,168,109,.5); }
  .facts span { display: block; font-size: 7pt; letter-spacing: 2px; text-transform: uppercase; color: #c5a86d; margin-bottom: 1mm; }
  .facts b { font-weight: 500; font-size: 10pt; }

  .rates { width: 100%; border-collapse: collapse; margin: 3mm 0 3mm; }
  .rates th { background: #12231a; color: #c5a86d; font-size: 7.5pt; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-align: left; padding: 3mm 4mm; }
  .rates th:last-child, .rates td:last-child { text-align: right; }
  .rates td { padding: 3.4mm 4mm; border-bottom: 1px solid rgba(10,18,11,.1); }
  .rates tr:first-child td { background: #f7f5f0; font-weight: 600; }
  .rates td:last-child { font-family: Georgia, serif; font-size: 13pt; }
  .note { background: #f7f5f0; border-left: 3px solid #c5a86d; padding: 3mm 4mm; font-size: 9.5pt; margin-top: 4mm; }
  .route { display: flex; flex-wrap: wrap; gap: 2mm 1.5mm; align-items: center; margin-top: 2mm; font-size: 9.5pt; }
  .route b { font-weight: 500; background: #f7f5f0; padding: 1.2mm 3mm; border-radius: 99px; }
  .route i { color: #c5a86d; font-style: normal; }
  section + section { margin-top: 9mm; }

  .day { display: flex; gap: 6mm; align-items: center; padding: 4.5mm 0; border-bottom: 1px solid rgba(10,18,11,.09); }
  .day:last-child { border-bottom: 0; }
  .day .num { width: 14mm; height: 14mm; flex: none; border-radius: 50%; background: #12231a; color: #c5a86d; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
  .day .num small { font-size: 5.5pt; letter-spacing: 1px; text-transform: uppercase; margin-bottom: .6mm; }
  .day .num b { font-family: Georgia, serif; font-weight: normal; font-size: 13pt; }
  .day .text { flex: 1; min-width: 0; }
  .day h4 { font-family: Georgia, serif; font-weight: normal; font-size: 12.5pt; margin-bottom: 1mm; }
  .day img { width: 46mm; height: 31mm; flex: none; object-fit: cover; border-radius: 2mm; }

  .lists { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  .list { border-radius: 3mm; padding: 5mm 6mm; }
  .list.in { background: #12231a; color: #fff; }
  .list.out { background: #f7f5f0; }
  .list h3 { font-size: 13pt; }
  .list.in h3 { color: #c5a86d; }
  .list ul { list-style: none; }
  .list li { display: flex; gap: 2.5mm; padding: 1.2mm 0; font-size: 10pt; }
  .list li::before { content: "✓"; color: #c5a86d; font-weight: 700; }
  .list.out li::before { content: "✕"; color: #a33; }
  .list.extra { background: #f7f5f0; border: 1px solid #c5a86d; }
  .list.extra li::before { color: #94752f; }
  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; margin-top: 3mm; }
  .steps b { display: block; font-family: Georgia, serif; font-weight: normal; font-size: 18pt; color: #c5a86d; }
  .steps h4 { font-weight: 600; font-size: 9.5pt; margin: 1mm 0; }
  .steps p { font-size: 8.5pt; line-height: 1.45; }
  .fair { display: flex; gap: 5mm; padding: 3.5mm 0; border-bottom: 1px solid rgba(10,18,11,.09); }
  .fair:last-child { border-bottom: 0; }
  .fair .n { font-family: Georgia, serif; font-size: 18pt; color: #c5a86d; line-height: 1.1; width: 9mm; flex: none; }
  .fair h4 { font-weight: 600; font-size: 10.5pt; }
  .terms { list-style: none; }
  .terms li { display: flex; gap: 3mm; padding: 1.6mm 0; font-size: 9.5pt; }
  .terms li::before { content: ""; width: 1.6mm; height: 1.6mm; margin-top: 2mm; border-radius: 50%; background: #c5a86d; flex: none; }
  .contact { position: absolute; left: 18mm; right: 18mm; bottom: 26mm; background: #12231a; color: #fff; border-radius: 3mm; padding: 8mm; display: flex; justify-content: space-between; align-items: center; gap: 8mm; }
  .contact h3 { color: #fff; font-size: 17pt; margin-bottom: 1mm; }
  .contact p { color: rgba(255,255,255,.75); font-size: 9.5pt; }
  .contact .lines { text-align: right; font-size: 10pt; white-space: nowrap; color: #c5a86d; }
`;

const footer = (pkg, number, total) => `
  <div class="footer"><span>Acacia Safaris · ${esc(pkg.title)}</span><span>Page ${number} of ${total}</span></div>`;

async function buildHtml(pkg, logo) {
  const cover = await embed(pkg.image, 1500);
  const days = await Promise.all(
    pkg.itinerary.map(async (d) => ({ ...d, photo: await embed(d.image, 500) })),
  );
  const pageCount = Math.ceil(days.length / DAYS_PER_PAGE);
  const total = 2 + pageCount + 2;
  const duration = `${days.length} ${days.length === 1 ? "Day" : "Days"}`;
  const fair = FAIR_PRICE[pkg.title] ?? [];

  const itinerary = Array.from({ length: pageCount }, (_, i) => {
    const part = days.slice(i * DAYS_PER_PAGE, (i + 1) * DAYS_PER_PAGE);
    return `
    <div class="page"><div class="content">
      <p class="eyebrow">Your journey${pageCount > 1 ? `, part ${i + 1} of ${pageCount}` : ""}</p>
      <h2>Day by day</h2><div class="rule"></div>
      ${part
        .map(
          (d) => `
        <div class="day">
          <div class="num"><small>Day</small><b>${d.day}</b></div>
          <div class="text"><h4>${esc(d.title)}</h4><p class="muted">${esc(d.description)}</p></div>
          ${d.photo ? `<img src="${d.photo}" alt="">` : ""}
        </div>`,
        )
        .join("")}
    </div>${footer(pkg, 3 + i, total)}</div>`;
  }).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(pkg.title)} - Quotation</title><style>${CSS}</style></head><body>
    <div class="page cover">
      ${cover ? `<img class="bg" src="${cover}" alt="">` : ""}
      <div class="veil"></div>
      <div class="top">
        <img class="logo" src="${logo}" alt="Acacia Safaris">
        <div class="ref">QUOTATION AS-${pkg.id.slice(0, 6).toUpperCase()}<br>Issued ${SETTINGS.issued}</div>
      </div>
      <div class="main">
        <p class="eyebrow">Tour quotation</p>
        <h1>${esc(pkg.title)}</h1>
        <div class="rule"></div>
        <p class="lead">${esc(pkg.description)}</p>
      </div>
      <div class="facts">
        <div><span>Duration</span><b>${duration}</b></div>
        <div><span>Destination</span><b>${esc(pkg.location)}</b></div>
        <div><span>Trip type</span><b>${esc(pkg.tripType)}</b></div>
        <div><span>Stay</span><b>${esc(pkg.lodging)}</b></div>
      </div>
    </div>

    <div class="page"><div class="content">
      <p class="eyebrow">Your investment</p>
      <h2>What this trip costs</h2><div class="rule"></div>
      <section>
        <table class="rates">
          <tr><th>Traveler</th><th>Age</th><th>Price per person</th></tr>
          ${SETTINGS.rates
            .map((r) => {
              const price = roundTo10(pkg.price * r.share);
              return `<tr><td>${r.label}</td><td>${r.ages}</td><td>${price ? usd(price) : "Free"}</td></tr>`;
            })
            .join("")}
        </table>
        <p class="muted" style="font-size:9pt">${SETTINGS.priceBasis} Valid until ${SETTINGS.validUntil}.</p>
        ${hasGorillas(pkg) ? `<p class="note"><b>Please note:</b> gorilla trekking is only open to guests aged 15 and over. This is a park rule. Tell us the ages of your group and we will plan the right activities for everyone.</p>` : ""}
      </section>
      <section>
        <h3>Your route</h3>
        <div class="route">${pkg.route.map((stop) => `<b>${esc(stop)}</b>`).join("<i>→</i>")}</div>
      </section>
      <section>
        <h3>Example group prices</h3>
        <table class="rates">
          <tr><th>Group</th><th></th><th>Total</th></tr>
          <tr><td>2 adults</td><td></td><td>${usd(pkg.price * 2)}</td></tr>
          <tr><td>2 adults and 2 children (4 to 11)</td><td></td><td>${usd(pkg.price * 2 + roundTo10(pkg.price * SETTINGS.rates[2].share) * 2)}</td></tr>
        </table>
      </section>
    </div>${footer(pkg, 2, total)}</div>

    ${itinerary}

    <div class="page"><div class="content">
      <p class="eyebrow">Clear from the start</p>
      <h2>What your price covers</h2><div class="rule"></div>
      <div class="lists">
        <div class="list in"><h3>Included</h3><ul>${pkg.inclusions.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
        <div class="list out"><h3>Not included</h3><ul>${pkg.exclusions.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
      </div>
      ${pkg.perks?.length ? `<section style="margin-top:6mm"><div class="list extra"><h3>Special extras included</h3><ul>${pkg.perks.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div></section>` : ""}
      <section style="margin-top:8mm">
        <h3>Why this price is fair</h3>
        ${fair.map(([title, text], i) => `<div class="fair"><div class="n">${i + 1}</div><div><h4>${esc(title)}</h4><p class="muted">${esc(text)}</p></div></div>`).join("")}
      </section>
    </div>${footer(pkg, 3 + pageCount, total)}</div>

    <div class="page"><div class="content">
      <p class="eyebrow">Good to know</p>
      <h2>Booking terms</h2><div class="rule"></div>
      <ul class="terms">${TERMS.filter((t) => hasGorillas(pkg) || !t.startsWith("Gorilla")).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <section style="margin-top:10mm">
        <h3>How to book</h3>
        <div class="steps">
          ${STEPS.map(([title, text], i) => `<div><b>${i + 1}</b><h4>${title}</h4><p class="muted">${text}</p></div>`).join("")}
        </div>
      </section>
    </div>
    <div class="contact">
      <div><h3>Ready to book?</h3><p>Our team will confirm your dates and tailor the details for you.</p></div>
      <div class="lines">${SETTINGS.phone}<br>${SETTINGS.email}<br>${SETTINGS.place}</div>
    </div>
    ${footer(pkg, 4 + pageCount, total)}</div>
  </body></html>`;
}

async function main() {
  const packages = await (await fetch(API_URL)).json();
  const logoFile = path.join(__dirname, "..", "public", "logo2.png");
  const logo = `data:image/png;base64,${fs.readFileSync(logoFile).toString("base64")}`;
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

  for (const pkg of packages) {
    if (!FAIR_PRICE[pkg.title]) console.warn(`No "why this price is fair" text for: ${pkg.title}`);
    const page = await browser.newPage();
    await page.setContent(await buildHtml(pkg, logo), { waitUntil: "load" });

    const overflowing = await page.$$eval(".content", (all) => all.filter((c) => c.scrollHeight > c.clientHeight + 1).length);
    if (overflowing) console.warn(`${pkg.title}: ${overflowing} page(s) have too much text`);

    const file = path.join(__dirname, `${pkg.title} - Quotation.pdf`);
    await page.pdf({ path: file, printBackground: true, preferCSSPageSize: true });
    await page.close();
    console.log(`${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB  ${path.basename(file)}`);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
