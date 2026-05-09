const WIKI_API = "https://en.wikipedia.org/w/api.php";
const ELEMENTS_API = "https://api.periodictableofelements.org";

// Cache for elements list to avoid redundant API calls
let elementsCache = null;

// ============================================================
// FETCH ALL ELEMENTS (for lookups)
// ============================================================
async function getAllElements() {
  if (elementsCache) {
    return elementsCache;
  }
  
  try {
    const response = await fetch(`${ELEMENTS_API}/elements/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch elements list: ${response.status}`);
    }

    elementsCache = await response.json();
    console.log('Loaded elements cache with', elementsCache.length, 'elements');
    return elementsCache;
  } catch (err) {
    console.error("Error fetching elements list:", err);
    throw err;
  }
}

// ============================================================
// FORMATTING HELPERS
// ============================================================
export function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Unknown";
  }
  return value;
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || value === "") {
    return "Unknown";
  }
  if (typeof value === "number") {
    return value.toFixed(decimals);
  }
  return String(value);
}

export function formatList(arr) {
  if (!arr || !Array.isArray(arr)) {
    return [];
  }
  return arr;
}

// ============================================================
// PERIODIC TABLE ELEMENTS API
// Endpoint: GET /elements/{atomic_number}/
// e.g. https://api.periodictableofelements.org/elements/1/
// ============================================================
export async function fetchElementData(elementName) {
  try {
    // Get all elements to find the one by name or symbol
    const allElements = await getAllElements();
    
    const searchName = elementName.toLowerCase().trim();
    const element = allElements.find(el => 
      el.name.toLowerCase() === searchName || 
      el.symbol.toLowerCase() === searchName
    );

    if (!element) {
      throw new Error(`Element "${elementName}" not found in database`);
    }

    // Now fetch the detailed data for this element using its atomic number
    const atomicNumber = element.atomic_number;
    const apiUrl = `${ELEMENTS_API}/elements/${atomicNumber}/`;
    
    console.log(`Fetching element data for "${elementName}" (Z=${atomicNumber}) from ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log(`API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response:`, errorText);
      throw new Error(`Elements API returned ${response.status} ${response.statusText} for "${elementName}"`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);

    // Validate that we got a valid element object
    if (!data || typeof data !== 'object') {
      throw new Error('API returned invalid data structure');
    }

    // Map API fields to our internal structure
    const elementData = {
      name:                  data.name          || elementName,
      symbol:                data.symbol        || '?',
      atomicNumber:          data.atomic_number ?? null,
      atomicMass:            data.atomic_mass   ?? null,
      meltingPoint:          data.melting_point ?? null,
      boilingPoint:          data.boiling_point ?? null,
      density:               data.density       ?? null,
      electronegativity:     data.electronegativity  ?? null,
      electronAffinity:      data.electron_affinity  ?? null,
      ionizationEnergy:      data.ionization_energy  ?? null,
      atomicRadius:          data.atomic_radius ?? null,
      // API does not provide Van der Waals radius — leave as null
      vanDerWaalsRadius:     null,
      groupBlock:            data.category      || data.block || 'Unknown',
      standardState:         data.state_at_room_temp || 'Unknown',
      yearDiscovered:        data.discovery_year ?? null,
      // API provides cpk_hex_color without the '#' prefix
      cpkHexColor:           data.cpk_hex_color
                               ? (data.cpk_hex_color.startsWith('#') ? data.cpk_hex_color : `#${data.cpk_hex_color}`)
                               : '#CCCCCC',
      // Extra fields available from the API (bonus)
      electronConfiguration: data.electron_configuration_semantic || null,
      electronsPerShell:     data.electrons_per_shell || null,
      categoryColor:         data.category_color || null,
    };

    console.log('Element data successfully mapped from periodictableofelements.org:', elementData);
    return elementData;

  } catch (err) {
    console.error("Error fetching element data:", err);
    throw new Error(`Failed to fetch data for ${elementName}: ${err.message}`);
  }
}

// ============================================================
// WIKIPEDIA — summary / history text only
// ============================================================
export async function fetchWikiContent(elementName) {
  try {
    const response = await fetch(
      `${WIKI_API}?action=query&titles=${encodeURIComponent(elementName)}&prop=extracts&explaintext=true&format=json&origin=*`
    );

    if (!response.ok) {
      return { extract: "No Wikipedia data available." };
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const pageKey = Object.keys(pages)[0];
    const pageData = pages[pageKey] || {};

    return {
      extract: pageData.extract || "No Wikipedia data available."
    };
  } catch (err) {
    console.warn("Warning fetching Wikipedia content:", err);
    return { extract: "No Wikipedia data available." };
  }
}

// Alias kept for backward compatibility
export const fetchWikiSummary = fetchWikiContent;

// ============================================================
// BUILD & ORGANIZE
// ============================================================
export async function buildElementData(elementName) {
  try {
    const [elementData, wikiData] = await Promise.all([
      fetchElementData(elementName),
      fetchWikiContent(elementName)
    ]);

    return { element: elementData, wiki: wikiData };
  } catch (err) {
    console.error("Error building element data:", err);
    throw err;
  }
}

export function organizeElementData(elementData) {
  if (!elementData) {
    throw new Error("No element data provided");
  }

  return {
    basicInfo: {
      name:          formatValue(elementData.name),
      symbol:        formatValue(elementData.symbol),
      atomicNumber:  formatValue(elementData.atomicNumber),
      groupBlock:    formatValue(elementData.groupBlock),
      yearDiscovered: formatValue(elementData.yearDiscovered)
    },
    physicalProperties: {
      atomicRadius:     elementData.atomicRadius
                          ? `${formatNumber(elementData.atomicRadius)} pm`
                          : "Unknown",
      boilingPoint:     elementData.boilingPoint !== null
                          ? `${formatNumber(elementData.boilingPoint)} K`
                          : "Unknown",
      density:          elementData.density !== null
                          ? `${formatNumber(elementData.density, 4)} g/cm³`
                          : "Unknown",
      meltingPoint:     elementData.meltingPoint !== null
                          ? `${formatNumber(elementData.meltingPoint)} K`
                          : "Unknown",
      vanDerWaalsRadius: "Unknown",
      standardState:    formatValue(elementData.standardState),
      cpkHexColor:      formatValue(elementData.cpkHexColor)
    },
    chemicalProperties: {
      electronAffinity:  elementData.electronAffinity !== null
                           ? `${formatNumber(elementData.electronAffinity)} kJ/mol`
                           : "Unknown",
      electronegativity: elementData.electronegativity !== null
                           ? formatNumber(elementData.electronegativity, 2)
                           : "Unknown",
      ionizationEnergy:  elementData.ionizationEnergy !== null
                           ? `${formatNumber(elementData.ionizationEnergy)} kJ/mol`
                           : "Unknown"
    },
    atomicProperties: {
      atomicMass: elementData.atomicMass !== null
                    ? `${formatNumber(elementData.atomicMass, 4)} u`
                    : "Unknown"
    },
    discoveryInfo: {
      yearDiscovered: formatValue(elementData.yearDiscovered)
    }
  };
}