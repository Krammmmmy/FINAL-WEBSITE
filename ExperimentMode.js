const elements = [
  "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
  "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
  "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
  "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
  "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
  "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
  "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
  "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
  "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
];

const list = document.getElementById("element-list");
const dropZone = document.getElementById("drop-zone");
const resultBox = document.getElementById("reaction-result");

let selected = [];

// Helper function to build a proper chemical formula from the array
function getFormulaString(elementsArray) {
  const counts = {};
  
  elementsArray.forEach(el => {
    counts[el] = (counts[el] || 0) + 1;
  });
  
  let keys = Object.keys(counts);
  if (keys.includes("C")) {
    keys = keys.filter(k => k !== "C" && k !== "H").sort();
    if (counts["H"]) keys.unshift("H");
    keys.unshift("C");
  } else {
    keys.sort(); 
  }

  let formula = "";
  keys.forEach(el => {
    formula += el + (counts[el] > 1 ? counts[el] : "");
  });
  
  return formula;
}

// Function to query the free PubChem API
async function checkPubChem(elementsArray) {
  const formula = getFormulaString(elementsArray);
  
  // Ask PubChem for the CID, IUPACName, and MolecularFormula
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${formula}/property/IUPACName,MolecularFormula/JSON`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No compound found");
    
    const data = await response.json();
    
    // Grab the first matched compound from the database
    const props = data.PropertyTable.Properties[0];
    
    return {
      success: true,         
      cid: props.CID,        
      name: props.IUPACName || "Unknown Compound",
      formula: props.MolecularFormula || formula
    };
  } catch (err) {
    return {
      success: false,        
      formula: formula
    };
  }
}

// Render selected elements in drop zone with number badges
function renderSelected(){
  dropZone.innerHTML = "";

  if(selected.length === 0) {
    dropZone.textContent = "DROP ELEMENTS HERE";
    return;
  }

  // Count occurrences of each selected element
  const elementCounts = {};
  selected.forEach(el => {
    elementCounts[el] = (elementCounts[el] || 0) + 1;
  });

  // Render each unique element once with a number badge
  for (const [el, count] of Object.entries(elementCounts)) {
    const div = document.createElement("div");
    div.className = "element selected-element"; // Ensure this matches your CSS class
    div.textContent = el;
    div.style.position = "relative"; 

    // Add a badge if there is more than 1 of this element
    if (count > 1) {
      const badge = document.createElement("span");
      badge.className = "element-badge";
      badge.textContent = count;
      div.appendChild(badge);
    }

    div.onclick = () => {
      const index = selected.indexOf(el);
      if (index > -1) {
        selected.splice(index, 1);
        renderSelected();
      }
    };

    dropZone.appendChild(div);
  }
}

// Create element cards
elements.forEach(symbol => {
  const card = document.createElement("div");
  card.className = "element-card";
  card.textContent = symbol;
  card.draggable = true;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", symbol);
  });

  card.addEventListener("click", () => {
    selected.push(symbol);
    renderSelected();
  });

  list.appendChild(card);
});

// Drag and drop handlers for drop zone
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  dropZone.style.borderColor = "#00ff00";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#ff00ff";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const symbol = e.dataTransfer.getData("text/plain");
  if(symbol) {
    selected.push(symbol);
    renderSelected();
  }
  dropZone.style.borderColor = "#ff00ff";
});

// Combine button handler
document.getElementById("combine-btn").addEventListener("click", async () => {
  if (selected.length < 2) {
    document.getElementById("reaction-success-ui").style.display = "none";
    const statusDiv = document.getElementById("reaction-status");
    statusDiv.style.display = "block";
    statusDiv.innerHTML = `
      <h2 style="color: var(--neon-magenta);">NOT ENOUGH ELEMENTS</h2>
      <p>> Please select at least 2 elements.</p>
    `;
    return;
  }

  // Show a loading state
  document.getElementById("reaction-success-ui").style.display = "none";
  const statusDiv = document.getElementById("reaction-status");
  statusDiv.style.display = "block";
  statusDiv.innerHTML = `
    <h2>ANALYZING...</h2>
    <p>> Querying the database...</p>
  `;

  const elementsToCheck = [...selected];
  selected = [];
  renderSelected();

  const reaction = await checkPubChem(elementsToCheck);

  if (reaction && reaction.success) { 
      const cid = reaction.cid; 
      const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d&image_size=large`;

      dropZone.classList.add("reacting");

      setTimeout(() => {
        dropZone.innerHTML = `<div class="molecule">${reaction.formula}</div>`;
        dropZone.classList.remove("reacting");

        // Toggle UI
        document.getElementById("reaction-status").style.display = "none";
        document.getElementById("reaction-success-ui").style.display = "block";

        // Inject Data
        document.getElementById("compound-name").textContent = reaction.name.toUpperCase();
        document.getElementById("compound-formula").textContent = reaction.formula;
        
        // Handle Image
        const imgElement = document.getElementById("compound-image");
        const errorElement = document.getElementById("image-error");
        
        imgElement.src = imageUrl;
        imgElement.alt = `2D Structure of ${reaction.name}`;
        imgElement.style.display = "block"; 
        errorElement.style.display = "none";

        imgElement.onerror = () => {
            imgElement.style.display = 'none';
            errorElement.style.display = 'block';
        };
      }, 1200);

  } else {
      setTimeout(() => {
        document.getElementById("reaction-success-ui").style.display = "none";
        const statusDiv = document.getElementById("reaction-status");
        statusDiv.style.display = "block";
        statusDiv.innerHTML = `
          <h2 style="color: var(--neon-magenta);">REACTION FAILED</h2>
          <p>> No known compound found for ${reaction.formula}.</p>
        `;
        dropZone.innerHTML = "DROP ELEMENTS HERE";
      }, 1200);
  }
}); 
