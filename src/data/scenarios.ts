import { Scenario, DetectiveQuestion, QuickDecisionItem } from '../types/game';

export const LEVEL_1_SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Scenario 01: GPS Location Ingestion",
    scenarioText: "You receive GPS locations as latitude and longitude.",
    unitClue: "Degrees (°)",
    correctAnswer: "GCS",
    reason: "GPS geographic locations are commonly represented using latitude and longitude on the curved surface of the Earth.",
    hint: "Think about the spherical coordinates delivered by global satellite receivers (latitude & longitude).",
    badge: "GPS Data"
  },
  {
    id: 2,
    title: "Scenario 02: Campus Walkway Planning",
    scenarioText: "You need to calculate the walking distance between two buildings on campus in metres.",
    unitClue: "Linear Metres (m)",
    correctAnswer: "PCS",
    reason: "A suitable projected coordinate system provides linear units (metres) for accurate local distance measurement.",
    hint: "Can degrees of latitude and longitude give direct distance measurements in metres without distortion?",
    badge: "Distance Measurement"
  },
  {
    id: 3,
    title: "Scenario 03: Parking Lot Capacity Study",
    scenarioText: "You want to calculate the area of a proposed parking site in square metres.",
    unitClue: "Area (m²)",
    correctAnswer: "PCS",
    reason: "Area calculations require an appropriate projected coordinate system that preserves area (equal-area or local conformal projection).",
    hint: "Calculating square metres directly from angular degrees produces meaningless distorted values.",
    badge: "Area Analysis"
  },
  {
    id: 4,
    title: "Scenario 04: Global Seismic Event Catalog",
    scenarioText: "A global earthquake dataset contains latitude and longitude.",
    unitClue: "Global Spherical Angles",
    correctAnswer: "GCS",
    reason: "Latitude and longitude represent geographic positions on the curved three-dimensional Earth model.",
    hint: "The dataset spans the whole planet and uses angular positions from the Equator and Prime Meridian.",
    badge: "Global Seismology"
  },
  {
    id: 5,
    title: "Scenario 05: Multi-Country Expedition Survey",
    scenarioText: "You are mapping GPS observations collected across several countries.",
    unitClue: "Continental Extent",
    correctAnswer: "GCS",
    reason: "A geographic coordinate system is appropriate for representing regional and global latitude/longitude locations without single-zone projection limits.",
    hint: "Local projected coordinate systems (like UTM zones) only cover narrow bands. What covers multi-country positions naturally?",
    badge: "Cross-Border Mapping"
  },
  {
    id: 6,
    title: "Scenario 06: Municipal Road Network Length",
    scenarioText: "You want to measure the length of roads in a city in kilometres.",
    unitClue: "Kilometres (km)",
    correctAnswer: "PCS",
    reason: "An appropriate projected coordinate system supports linear distance measurements on a flat cartographic plane.",
    hint: "You need linear distance units (metres/kilometres) across a local city boundary.",
    badge: "Infrastructure Length"
  },
  {
    id: 7,
    title: "Scenario 07: Cultural Heritage Coordinates",
    scenarioText: "A dataset contains coordinates such as: 2.30° N, 102.30° E (Historic Melaka).",
    unitClue: "Angular notation (° N, ° E)",
    correctAnswer: "GCS",
    reason: "Degrees and latitude/longitude are unmistakable clues that the data uses a geographic coordinate system.",
    hint: "Look at the unit symbols: degrees (°), North, and East indicate angles relative to Earth's center.",
    badge: "Coordinate Inspection"
  },
  {
    id: 8,
    title: "Scenario 08: Urban Surveying Cadastral Data",
    scenarioText: "A local dataset contains X and Y coordinates measured in metres (e.g., X: 251,450 m, Y: 254,120 m).",
    unitClue: "Easting & Northing (m)",
    correctAnswer: "PCS",
    reason: "X/Y coordinates with linear units (metres) are typical characteristics of a projected coordinate system (e.g. UTM or Cassini-Soldner).",
    hint: "Large coordinate values in metres (Eastings & Northings) indicate projected flat grid coordinates.",
    badge: "Grid Inspection"
  },
  {
    id: 9,
    title: "Scenario 09: Global Baseline Coordinate Storage",
    scenarioText: "You want to store locations collected as longitude and latitude using WGS 84 (EPSG:4326).",
    unitClue: "WGS 84 Datum / Lon-Lat",
    correctAnswer: "GCS",
    reason: "WGS 84 geographic coordinates commonly use longitude and latitude in angular units based on a reference ellipsoid.",
    hint: "WGS 84 (EPSG:4326) is the standard 3D ellipsoidal datum for latitude and longitude.",
    badge: "Datum & Standard"
  },
  {
    id: 10,
    title: "Scenario 10: Campus Master Planning Layout",
    scenarioText: "You need accurate local distance and area measurements for a campus planning project.",
    unitClue: "High-precision Local Scale",
    correctAnswer: "PCS",
    reason: "A suitable projected coordinate system is normally selected for local engineering, building buffers, and area calculations.",
    hint: "Local architectural and engineering calculations require a planar surface with minimal local scale distortion.",
    badge: "Local Engineering"
  }
];

export const LEVEL_2_DETECTIVE_QUESTIONS: DetectiveQuestion[] = [
  {
    id: 1,
    title: "Case 1: The Displaced Bus-Stop Layer",
    question: "What should you investigate FIRST?",
    problemDescription: "Your GIS project displays Road and Building layers perfectly, but the newly imported Bus-Stop layer appears far away in another ocean or missing from the map canvas!",
    mapAnomaly: "Road layer ✓  ·  Building layer ✓  ·  Bus-stop layer ✗ (Misaligned)",
    clues: {
      where: "Roads and Buildings render on campus, but Bus Stops appear far away in an ocean or off the canvas.",
      numbers: "X = 251,450 m, Y = 254,120 m (large metre-like numbers in hundreds of thousands).",
      crs: "CRS: Unknown / Missing (GIS defaults to EPSG:4326 degrees, plotting metre coordinates thousands of km away)."
    },
    diagnosisTitle: "CHECK LAYER CRS DEFINITION & METADATA",
    keyEvidence: "The coordinates look like projected values in metres, but the layer has no valid CRS information or was misinterpreted as degrees.",
    gisTip: "An 'Unknown CRS' does not mean coordinate numbers are corrupt. It simply means the GIS doesn't know which coordinate system to map them with.",
    options: [
      { id: "A", text: "Change the layer colour in symbology", isCorrect: false },
      { id: "B", text: "Check the layer CRS definition and metadata", isCorrect: true },
      { id: "C", text: "Delete the layer and reinstall your GIS software", isCorrect: false },
      { id: "D", text: "Change the basemap to dark mode", isCorrect: false }
    ],
    explanation: "Always check the layer CRS first! If the GIS misinterprets projected metres as geographic degrees (or vice versa), or assigns an incorrect datum, layers will be plotted thousands of kilometers away.",
    hint: "The coordinate values look like metres. Now check the CRS metadata and definition.",
    diagnosticSteps: [
      "1. WHERE? → Determine the expected geographic location on campus.",
      "2. COORDINATES? → Inspect raw coordinate values in the attribute table.",
      "3. UNITS? → Are the values small decimals (degrees) or large numbers (metres)?",
      "4. CRS? → Verify if the assigned layer CRS matches the actual coordinate system.",
      "5. PURPOSE? → Choose the correct CRS and reproject if needed."
    ]
  },
  {
    id: 2,
    title: "Case 2: The Coordinate Value Mystery",
    question: "What units might these coordinates represent?",
    problemDescription: "You inspect an incoming spatial dataset. The raw coordinates look like: (2.3015, 102.2982).",
    coordinatesClue: "X/Lon: 102.2982  |  Y/Lat: 2.3015",
    clues: {
      where: "Points to Melaka, Peninsular Malaysia (near the Equator at 2.30° N and 102.30° E).",
      numbers: "X/Lon = 102.2982, Y/Lat = 2.3015. Small decimal numbers well within -180° to +180°.",
      crs: "Geographic Coordinate System (GCS, e.g. WGS 84 / EPSG:4326) on the curved 3D Earth ellipsoid."
    },
    diagnosisTitle: "ANGULAR DEGREES (GCS · WGS 84)",
    keyEvidence: "Latitude ranges between -90° and +90°; Longitude ranges between -180° and +180°. These small decimals are spherical angular degrees.",
    gisTip: "Values below 180° indicate angular degrees (GCS). Projected coordinates (metres) are almost always in the thousands or hundreds of thousands.",
    options: [
      { id: "A", text: "Angular Degrees (° of latitude and longitude)", isCorrect: true },
      { id: "B", text: "Linear Metres in UTM Zone 48N", isCorrect: false },
      { id: "C", text: "Screen pixel offsets from the top-left corner", isCorrect: false },
      { id: "D", text: "Surveying chain lengths", isCorrect: false }
    ],
    explanation: "Small numbers (-90 to +90 for latitude, -180 to +180 for longitude) represent angular degrees. (2.30° N, 102.30° E) points to Melaka, Peninsular Malaysia!",
    hint: "Check the numerical range: latitudes only range from -90° to +90°, and longitudes from -180° to +180°.",
    diagnosticSteps: [
      "1. WHERE? → Melaka, Peninsular Malaysia region.",
      "2. COORDINATES? → Values are between 0 and 180.",
      "3. UNITS? → Angular Degrees (°).",
      "4. CRS? → Geographic Coordinate System (e.g. WGS 84 / EPSG:4326).",
      "5. PURPOSE? → Global positioning or base overlay."
    ]
  },
  {
    id: 3,
    title: "Case 3: Large Coordinate Values",
    question: "What should you investigate based on these values?",
    problemDescription: "You open a local cadastral surveying layer. The coordinates look like: X = 251,450.00 and Y = 254,120.00.",
    coordinatesClue: "X = 251,450.00  |  Y = 254,120.00",
    clues: {
      where: "Local regional cadastral survey grid origin in Peninsular Malaysia.",
      numbers: "X = 251,450.00 m, Y = 254,120.00 m. Large values in hundreds of thousands.",
      crs: "Projected Coordinate System (PCS — e.g. State Cassini Grid or UTM 48N) using linear metres."
    },
    diagnosisTitle: "PROJECTED COORDINATE SYSTEM (PCS · LINEAR METRES)",
    keyEvidence: "Angular degrees can never exceed 180°. Values in hundreds of thousands represent planar Easting and Northing offsets in metres.",
    gisTip: "Projected coordinate systems flatten the curved Earth onto a 2D plane so you can measure distances, perimeters, and areas in metric units.",
    options: [
      { id: "A", text: "A Projected Coordinate System (PCS) using linear units (metres)", isCorrect: true },
      { id: "B", text: "A Geographic Coordinate System using angular degrees", isCorrect: false },
      { id: "C", text: "The monitor display resolution DPI", isCorrect: false },
      { id: "D", text: "The basemap tile zoom level", isCorrect: false }
    ],
    explanation: "Values in the hundreds of thousands represent Easting and Northing offsets in linear units (usually metres) from a projection origin.",
    hint: "Degrees can NEVER exceed 180! Numbers in the hundreds of thousands signify linear distance on a projected grid.",
    diagnosticSteps: [
      "1. WHERE? → Local regional grid origin.",
      "2. COORDINATES? → Hundreds of thousands (251,450 / 254,120).",
      "3. UNITS? → Linear metres.",
      "4. CRS? → Projected Coordinate System (e.g. UTM or State Cassini Grid).",
      "5. PURPOSE? → Engineering, surveying, and precise buffer calculations."
    ]
  },
  {
    id: 4,
    title: "Case 4: The Overseas Mystery",
    question: "What should you investigate when a layer appears in another country?",
    problemDescription: "A university campus survey in Malaysia unexpectedly appears off the coast of Somalia in the Indian Ocean!",
    mapAnomaly: "Expected: Peninsular Malaysia  →  Plotted: Ocean off East Africa",
    clues: {
      where: "Expected: Peninsular Malaysia (~2.3° N, 102.3° E). Plotted: Somali Basin in the Indian Ocean (~102.3° N is impossible!).",
      numbers: "Entered as Lat = 102.30°, Lon = 2.30°. But latitude cannot exceed 90° North!",
      crs: "Coordinate Axis Order Mismatch: Software expected Longitude (X) first, but Latitude (Y) was supplied first."
    },
    diagnosisTitle: "REVERSED X/Y COORDINATES (LAT/LON SWAPPED)",
    keyEvidence: "Longitude is X (East-West) and Latitude is Y (North-South). Swapping them placed 102° into Latitude and 2° into Longitude, throwing data into another ocean.",
    gisTip: "Always check coordinate axis order on import. In GIS software, Easting/Longitude is usually the first column (X) and Northing/Latitude is the second (Y).",
    options: [
      { id: "A", text: "Incorrect CRS definition or X/Y coordinates reversed (Latitude/Longitude swapped)", isCorrect: true },
      { id: "B", text: "The computer monitor refresh rate is out of sync", isCorrect: false },
      { id: "C", text: "The GIS project font size is too small", isCorrect: false },
      { id: "D", text: "Vector symbology fill opacity is set too high", isCorrect: false }
    ],
    explanation: "Reversing Latitude and Longitude is one of the most common beginner mistakes in GIS! Longitude is X (East-West) and Latitude is Y (North-South). If swapped, points plot in the opposite hemisphere or ocean.",
    hint: "Check axis conventions: Latitude is Y (North/South), Longitude is X (East/West). Swapping them casts points across the world!",
    diagnosticSteps: [
      "1. WHERE? → Plotted in Indian Ocean instead of land.",
      "2. COORDINATES? → Check if X was assigned Latitude and Y Longitude.",
      "3. UNITS? → Degrees axis order convention reversed.",
      "4. CRS? → Coordinate axis order mismatch (Lat/Lon vs Lon/Lat).",
      "5. PURPOSE? → Re-import with X = Longitude, Y = Latitude."
    ]
  },
  {
    id: 5,
    title: "Case 5: Different CRSs Aligning Seamlessly",
    question: "Why do these two layers with different CRSs still align correctly?",
    problemDescription: "Layer A is stored in WGS 84 (GCS) and Layer B is stored in UTM Zone 48N (PCS). Yet they overlay on top of each other perfectly in QGIS!",
    mapAnomaly: "Layer A (EPSG:4326) + Layer B (EPSG:32648) overlay accurately",
    clues: {
      where: "Both layers overlay accurately on top of campus buildings without any spatial offset.",
      numbers: "Layer A coordinates are in degrees (~102.3°, ~2.3°); Layer B coordinates are in metres (~410,000 m, ~347,000 m).",
      crs: "Layer A: WGS 84 (EPSG:4326). Layer B: UTM 48N (EPSG:32648). Project CRS: Web Mercator (EPSG:3857)."
    },
    diagnosisTitle: "ON-THE-FLY (OTF) COORDINATE TRANSFORMATION",
    keyEvidence: "The GIS engine translates different datums and coordinate systems 'on-the-fly' in memory to match the Project CRS for visual display.",
    gisTip: "Layers do NOT have to be permanently converted or reprojected on disk just to view them together. The GIS handles dynamic transformation automatically.",
    options: [
      { id: "A", text: "The GIS software transforms them 'on-the-fly' for display", isCorrect: true },
      { id: "B", text: "Layers must always be stored in the exact same CRS to display together", isCorrect: false },
      { id: "C", text: "Both files were secretly converted by the operating system", isCorrect: false },
      { id: "D", text: "It is a lucky graphics glitch", isCorrect: false }
    ],
    explanation: "Important pedagogical rule: GIS software transforms layers 'on-the-fly' to match the Project CRS for display! Layers do NOT have to be converted on disk just to view them together.",
    hint: "Does GIS force you to permanently convert every file on disk before letting you see them on screen?",
    diagnosticSteps: [
      "1. WHERE? → Both layers appear at the same ground location.",
      "2. COORDINATES? → Layer A in degrees, Layer B in metres.",
      "3. UNITS? → Dynamic reprojection engine converts coordinates in memory.",
      "4. CRS? → Project CRS unifies the visual canvas dynamically.",
      "5. PURPOSE? → On-the-fly projection allows combined visualization without altering raw files."
    ]
  }
];

export const LEVEL_3_QUICK_ITEMS: QuickDecisionItem[] = [
  {
    id: 1,
    text: "GPS Receiver Coordinates",
    subtext: "Handheld GPS navigation log (Lat / Lon)",
    correctAnswer: "GCS",
    explanation: "GPS tracks satellites in Earth-centered 3D angular degrees on the WGS 84 ellipsoid.",
    gisTip: "GPS receivers naturally record in 3D ellipsoidal angular coordinates (WGS 84 GCS). Always project to a PCS if you need to calculate linear metres.",
  },
  {
    id: 2,
    text: "Campus Walking Distance in Metres",
    subtext: "Linear path length between faculty buildings",
    correctAnswer: "PCS",
    explanation: "Direct distance measurements in metres require a projected planar coordinate system.",
    gisTip: "Never calculate ground lengths using angular degrees. Because meridians converge toward the poles, 1° of longitude shrinks significantly away from the equator.",
  },
  {
    id: 3,
    text: "Historic Melaka Landmark Coordinates",
    subtext: "2.3015° N, 102.2982° E (A Famosa / Stadthuys)",
    correctAnswer: "GCS",
    explanation: "Angular degrees (° N, ° E) represent geographic coordinates on the globe.",
    gisTip: "Coordinates specified with degree symbols (°), North/South and East/West are spherical angular coordinates referencing a 3D Earth ellipsoid.",
  },
  {
    id: 4,
    text: "Parking Lot Area in Square Metres",
    subtext: "Student parking expansion zone (m²)",
    correctAnswer: "PCS",
    explanation: "Planar area calculations require metric projected coordinates (m²).",
    gisTip: "Area units like m² or hectares require planar Cartesian coordinates (X, Y) found only in Projected Coordinate Systems.",
  },
  {
    id: 5,
    text: "Melaka Cadastral Land Parcel Survey",
    subtext: "JUPEM Cassini-Soldner grid (metres)",
    correctAnswer: "PCS",
    explanation: "Local cadastral surveys use projected Cassini-Soldner metric grids for legal boundary lengths.",
    gisTip: "Malaysia's cadastral surveys (JUPEM) use State Cassini-Soldner projections so that title boundary lengths match actual surveyed ground tape measurements.",
  },
  {
    id: 6,
    text: "Global Earthquake Epicenter Dataset",
    subtext: "Worldwide seismic monitoring catalog",
    correctAnswer: "GCS",
    explanation: "Global datasets spanning continents use GCS (degrees) to avoid single-zone projection limits.",
    gisTip: "Projecting the entire world onto a single 2D projection causes severe distortion. Global datasets should be stored in GCS (WGS 84).",
  },
  {
    id: 7,
    text: "Campus Infrastructure in UTM Zone 48N",
    subtext: "Easting: 251,450 m, Northing: 254,120 m",
    correctAnswer: "PCS",
    explanation: "UTM Zone 48N (EPSG:32648) provides metric Cartesian coordinates across Peninsular Malaysia.",
    gisTip: "UTM (Universal Transverse Mercator) divides the world into 60 6-degree zones with minimal planar distortion for engineering and civil mapping.",
  },
  {
    id: 8,
    text: "City Road Network Total Length (km)",
    subtext: "Linear vector polyline measurement",
    correctAnswer: "PCS",
    explanation: "Accurate linear distance calculations (km) require a conformal projected system.",
    gisTip: "Calculating Euclidean polyline length directly on spherical coordinates yields mathematical distortion. Project to a conformal PCS first.",
  },
  {
    id: 9,
    text: "WGS 84 (EPSG:4326) Datum Standard",
    subtext: "Standard global reference ellipsoid",
    correctAnswer: "GCS",
    explanation: "WGS 84 is the worldwide geographic 3D datum for latitude and longitude.",
    gisTip: "EPSG:4326 (WGS 84) is a Geographic Coordinate System. Its coordinates are angular degrees, not linear metres.",
  },
  {
    id: 10,
    text: "Campus Safety Buffer (50m radius)",
    subtext: "Chemical lab safety exclusion zone",
    correctAnswer: "PCS",
    explanation: "Metric buffer zones require projected planar units so radius geometry remains circular.",
    gisTip: "Creating a Euclidean buffer in GCS yields a distorted ellipse rather than a true circle because degrees of latitude and longitude are unequal in ground metres.",
  }
];

export const CORE_PEDAGOGICAL_PRINCIPLE = {
  formula: "PURPOSE + STUDY AREA + UNITS + DATA → APPROPRIATE SPATIAL REFERENCE",
  insight: "Do not simply assume 'GCS is always for display and PCS is always for analysis.' Instead, inspect your purpose, geographic extent, units, and data properties to pick the right coordinate reference system."
};
