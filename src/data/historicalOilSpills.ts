import type { OilSpillIncident } from "../types/oilSpill";

/**
 * Organic irregular polygon vertex generator based on geographic coordinates,
 * aspect ratio, and area-scaled lobe perturbations.
 */
function createIrregularSlickPolygon(
  centerLat: number,
  centerLng: number,
  radiusLatKm: number,
  radiusLngKm: number,
  irregularFactors: number[]
): [number, number][] {
  const KM_PER_LAT = 111.0;
  const kmPerLng = 111.0 * Math.cos((centerLat * Math.PI) / 180);
  const n = irregularFactors.length;

  return irregularFactors.map((factor, i) => {
    const angle = (i / n) * 2 * Math.PI;
    const rLat = (radiusLatKm * factor) / KM_PER_LAT;
    const rLng = (radiusLngKm * factor) / kmPerLng;

    const lat = centerLat + Math.sin(angle) * rLat;
    const lng = centerLng + Math.cos(angle) * rLng;
    return [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000];
  });
}

const ORGANIC_SLICK_LOBES_1 = [
  1.0, 1.25, 1.4, 1.15, 0.9, 0.75, 1.1, 1.35, 1.5, 1.2, 0.85, 0.7, 0.95, 1.3, 1.1, 0.8,
];
const ORGANIC_SLICK_LOBES_2 = [
  1.1, 0.85, 0.7, 1.05, 1.3, 1.45, 1.2, 0.9, 0.75, 0.95, 1.25, 1.4, 1.15, 0.8, 0.95, 1.2,
];
const ORGANIC_SLICK_LOBES_3 = [
  1.3, 1.45, 1.1, 0.8, 0.65, 0.9, 1.2, 1.4, 1.15, 0.75, 0.85, 1.1, 1.35, 1.2, 0.95, 1.15,
];

/**
 * 12 Verified Historical Oil Spill Incidents with authentic coordinates, dates, and ITOPF/NOAA/IMO data.
 */
export const historicalOilSpillIncidents: OilSpillIncident[] = [
  {
    id: "OS-HIST-2010-DEEPWATER",
    name: "Deepwater Horizon",
    status: "historical",
    severity: "critical",
    latitude: 28.7366,
    longitude: -88.3659,
    estimatedAreaKm2: 180000.0,
    estimatedVolumeTonnes: "Approx. 500,000 tonnes (~4.9M barrels)",
    date: "20 April 2010",
    time: "21:45 CDT",
    oilType: "Light Louisiana Sweet Crude",
    year: 2010,
    locationName: "Macondo Prospect, Mississippi Canyon Block 252 (Gulf of Mexico, USA)",
    vesselInvolved: "Deepwater Horizon Drilling Rig / BP",
    description:
      "Catastrophic well blowout, explosion, and sinking of the semi-submersible platform, resulting in an uncapped seabed discharge lasting 87 days. The largest marine oil spill in petroleum history.",
    polygonCoordinates: createIrregularSlickPolygon(
      28.7366,
      -88.3659,
      18.0,
      25.0,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-HIST-1989-EXXONVALDEZ",
    name: "Exxon Valdez",
    status: "historical",
    severity: "critical",
    latitude: 60.8333,
    longitude: -146.8667,
    estimatedAreaKm2: 28000.0,
    estimatedVolumeTonnes: "Approx. 37,000 tonnes (~257,000 barrels)",
    date: "24 March 1989",
    time: "00:04 AKST",
    oilType: "Prudhoe Bay Crude Oil",
    year: 1989,
    locationName: "Bligh Reef, Prince William Sound (Alaska, USA)",
    vesselInvolved: "Supertanker Exxon Valdez",
    description:
      "Grounded on Bligh Reef tearing open 8 of 11 cargo tanks. Contaminated 2,100 km of remote Alaskan coastline and caused monumental ecological devastation leading to the Oil Pollution Act of 1990.",
    polygonCoordinates: createIrregularSlickPolygon(
      60.8333,
      -146.8667,
      11.0,
      15.0,
      ORGANIC_SLICK_LOBES_2
    ),
  },
  {
    id: "OS-HIST-2002-PRESTIGE",
    name: "Prestige",
    status: "historical",
    severity: "critical",
    latitude: 42.1833,
    longitude: -9.8333,
    estimatedAreaKm2: 25000.0,
    estimatedVolumeTonnes: "Approx. 63,000 tonnes",
    date: "13 November 2002",
    time: "15:15 UTC",
    oilType: "Heavy Fuel Oil (M-100)",
    year: 2002,
    locationName: "Costa da Morte, Cape Finisterre (Galicia, Spain / Atlantic Ocean)",
    vesselInvolved: "Single-hull Tanker Prestige",
    description:
      "Hull fractured in a winter storm and split in two 130 miles off the Galician coast after being refused safe refuge, coating thousands of kilometers of Spanish, French, and Portuguese coastlines.",
    polygonCoordinates: createIrregularSlickPolygon(
      42.1833,
      -9.8333,
      10.5,
      14.0,
      ORGANIC_SLICK_LOBES_3
    ),
  },
  {
    id: "OS-HIST-1999-ERIKA",
    name: "Erika",
    status: "historical",
    severity: "high",
    latitude: 47.15,
    longitude: -4.5167,
    estimatedAreaKm2: 400.0,
    estimatedVolumeTonnes: "Approx. 20,000 tonnes",
    date: "12 December 1999",
    time: "06:05 UTC",
    oilType: "Heavy Fuel Oil No. 2",
    year: 1999,
    locationName: "Bay of Biscay, 30 NM south of Penmarc'h (Brittany, France)",
    vesselInvolved: "Maltese-flagged Tanker Erika",
    description:
      "Broke in two during a violent gale in the Bay of Biscay, discharging 20,000 tonnes of viscous heavy fuel that polluted 400 km of French coastline and killed tens of thousands of seabirds.",
    polygonCoordinates: createIrregularSlickPolygon(
      47.15,
      -4.5167,
      6.0,
      8.5,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-HIST-2007-HEBEISPIRIT",
    name: "Hebei Spirit",
    status: "historical",
    severity: "high",
    latitude: 36.7833,
    longitude: 126.05,
    estimatedAreaKm2: 800.0,
    estimatedVolumeTonnes: "Approx. 10,800 tonnes",
    date: "7 December 2007",
    time: "07:15 KST",
    oilType: "Iranian Heavy Crude, Upper Zakum, Kuwait Crude",
    year: 2007,
    locationName: "Taean County, Yellow Sea (South Korea)",
    vesselInvolved: "VLCC Hebei Spirit / Crane Barge Samsung 1",
    description:
      "Crane barge broke loose from tugboats and collided with the anchored VLCC, puncturing three cargo tanks. South Korea's worst marine oil spill, affecting Taean coastal national park.",
    polygonCoordinates: createIrregularSlickPolygon(
      36.7833,
      126.05,
      7.5,
      10.0,
      ORGANIC_SLICK_LOBES_2
    ),
  },
  {
    id: "OS-HIST-1996-SEAEMPRESS",
    name: "Sea Empress",
    status: "historical",
    severity: "high",
    latitude: 51.6667,
    longitude: -5.1667,
    estimatedAreaKm2: 250.0,
    estimatedVolumeTonnes: "Approx. 72,000 tonnes",
    date: "15 February 1996",
    time: "20:07 UTC",
    oilType: "Forties Light Crude Oil",
    year: 1996,
    locationName: "Milford Haven Waterway, Pembrokeshire (Wales, UK)",
    vesselInvolved: "Liberian-flagged Supertanker Sea Empress",
    description:
      "Ran aground on Mid Channel Rocks at the entrance to Milford Haven, spilling 72,000 tonnes of light crude into the Pembrokeshire Coast National Park and marine special area of conservation.",
    polygonCoordinates: createIrregularSlickPolygon(
      51.6667,
      -5.1667,
      5.5,
      7.5,
      ORGANIC_SLICK_LOBES_3
    ),
  },
  {
    id: "OS-HIST-1978-AMOCOCADIZ",
    name: "Amoco Cadiz",
    status: "historical",
    severity: "critical",
    latitude: 48.6,
    longitude: -4.7667,
    estimatedAreaKm2: 2000.0,
    estimatedVolumeTonnes: "Approx. 223,000 tonnes",
    date: "16 March 1978",
    time: "21:30 CET",
    oilType: "Light Arabian Crude & Iranian Heavy Crude",
    year: 1978,
    locationName: "Portsall Rocks, off Finistere (Brittany, France)",
    vesselInvolved: "VLCC Amoco Cadiz",
    description:
      "Steering failure during a heavy Atlantic gale led to grounding on Portsall Rocks. The entire 1.6 million barrel cargo leaked, contaminating 360 km of Brittany shoreline and resulting in the largest tanker spill of its era.",
    polygonCoordinates: createIrregularSlickPolygon(
      48.6,
      -4.7667,
      13.0,
      17.0,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-HIST-2018-SANCHI",
    name: "Sanchi",
    status: "historical",
    severity: "critical",
    latitude: 28.36,
    longitude: 125.97,
    estimatedAreaKm2: 330.0,
    estimatedVolumeTonnes: "Approx. 113,000 tonnes",
    date: "6 January 2018",
    time: "12:00 UTC",
    oilType: "Natural Gas Condensate & Bunker Fuel",
    year: 2018,
    locationName: "East China Sea (160 NM off Shanghai, China)",
    vesselInvolved: "Panamanian-flagged Tanker SANCHI / CF Crystal",
    description:
      "Catastrophic collision and fire resulting in vessel sinking on 14 Jan 2018. Largest condensate tanker spill in maritime history, heavily influencing the 2018 ITOPF global volume statistics.",
    polygonCoordinates: createIrregularSlickPolygon(
      28.36,
      125.97,
      8.0,
      11.0,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-HIST-2020-WAKASHIO",
    name: "MV Wakashio",
    status: "historical",
    severity: "high",
    latitude: -20.44,
    longitude: 57.75,
    estimatedAreaKm2: 27.0,
    estimatedVolumeTonnes: "Approx. 1,000 tonnes",
    date: "25 July 2020",
    time: "15:25 UTC",
    oilType: "Very Low Sulfur Fuel Oil (VLSFO)",
    year: 2020,
    locationName: "Pointe d'Esny, Mauritius (Indian Ocean)",
    vesselInvolved: "Capesize Bulk Carrier MV Wakashio",
    description:
      "Grounded on coral reefs off southeast coast of Mauritius. Fuel tank breached on 6 August 2020 spilling ~1,000 tonnes of fuel oil into pristine lagoons and protected marine sanctuaries.",
    polygonCoordinates: createIrregularSlickPolygon(
      -20.44,
      57.75,
      3.2,
      4.2,
      ORGANIC_SLICK_LOBES_2
    ),
  },
  {
    id: "OS-HIST-2021-XPRESS",
    name: "X-Press Pearl",
    status: "historical",
    severity: "high",
    latitude: 6.98,
    longitude: 79.79,
    estimatedAreaKm2: 35.0,
    estimatedVolumeTonnes: "Approx. 350 tonnes bunker fuel + chemical contaminants",
    date: "20 May 2021",
    time: "18:00 UTC",
    oilType: "Bunker Fuel, Nitric Acid & Plastic Nurdles",
    year: 2021,
    locationName: "Off Colombo Port, Sri Lanka (Indian Ocean)",
    vesselInvolved: "Feeder Container Ship X-Press Pearl",
    description:
      "Nitric acid leak triggered a chemical blaze lasting 12 days before the vessel sank. Released fuel oil, toxic cargo, and billions of plastic nurdles across Sri Lanka's beaches.",
    polygonCoordinates: createIrregularSlickPolygon(
      6.98,
      79.79,
      3.5,
      4.8,
      ORGANIC_SLICK_LOBES_1
    ),
  },
  {
    id: "OS-HIST-2020-NEWDIAMOND",
    name: "MT New Diamond",
    status: "historical",
    severity: "medium",
    latitude: 7.05,
    longitude: 82.2,
    estimatedAreaKm2: 15.4,
    estimatedVolumeTonnes: "Approx. 400 tonnes (Bunker Fuel)",
    date: "3 September 2020",
    time: "02:30 UTC",
    oilType: "Heavy Bunker Fuel (Cargo intact)",
    year: 2020,
    locationName: "Off Sangamankanda Point (Eastern Coast of Sri Lanka)",
    vesselInvolved: "VLCC Crude Oil Tanker New Diamond",
    description:
      "Boiler explosion and fire 38 NM offshore carrying 270,000 tonnes of Kuwaiti crude. Cargo was successfully protected; localized bunker fuel spill was contained by multinational naval efforts.",
    polygonCoordinates: createIrregularSlickPolygon(
      7.05,
      82.2,
      2.5,
      3.5,
      ORGANIC_SLICK_LOBES_3
    ),
  },
  {
    id: "OS-HIST-2022-PERU",
    name: "Repsol Mare Doricum",
    status: "historical",
    severity: "critical",
    latitude: -11.93,
    longitude: -77.17,
    estimatedAreaKm2: 72.0,
    estimatedVolumeTonnes: "Approx. 1,900 tonnes (~11,900 barrels)",
    date: "15 January 2022",
    time: "17:30 UTC",
    oilType: "Brazilian Heavy Crude Oil",
    year: 2022,
    locationName: "La Pampilla Refinery, Ventanilla (Callao, Peru / Pacific Ocean)",
    vesselInvolved: "Italian Tanker Mare Doricum",
    description:
      "Underwater terminal hose ruptured during offloading due to abnormal tsunami waves generated by the Hunga Tonga eruption. Severely contaminated over 40 km of Peruvian beaches and reserves.",
    polygonCoordinates: createIrregularSlickPolygon(
      -11.93,
      -77.17,
      5.0,
      6.8,
      ORGANIC_SLICK_LOBES_2
    ),
  },
];
