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
      success: true,         // Added so the combine button knows it worked!
      cid: props.CID,        // We need this ID to get the 2D image
      name: props.IUPACName || "Unknown Compound",
      formula: props.MolecularFormula || formula
    };
  } catch (err) {
    return {
      success: false,        // Tells the combine button the reaction failed
      formula: formula
    };
  }
}

// Render selected elements in drop zone
function renderSelected(){
  dropZone.innerHTML = "";

  if(selected.length === 0) {
    dropZone.textContent = "DROP ELEMENTS HERE";
    return;
  }

  // We add 'index' here so we know exactly WHICH atom to remove
  selected.forEach((symbol, index) => {
    const atom = document.createElement("div");
    atom.className = "selected-atom";
    atom.textContent = symbol;
    
    // Add visual cues so the user knows it's clickable
    atom.style.cursor = "pointer";
    atom.title = "Click to remove"; 

    // The Remove Function!
    atom.addEventListener("click", () => {
      selected.splice(index, 1); // Removes this specific element from the array
      renderSelected();          // Redraws the drop zone instantly
    });

    dropZone.appendChild(atom);
  });
}

// Animate the reaction
function animateReaction(result){
  dropZone.classList.add("reacting");

  setTimeout(() => {
    dropZone.innerHTML = `
      <div class="molecule">
        ${result}
      </div>
    `;

    dropZone.classList.remove("reacting");
  }, 1200);
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
    resultBox.innerHTML = `
      <h2>NOT ENOUGH ELEMENTS</h2>
      <p>Please select at least 2 elements.</p>
    `;
    return;
  }

  // Show a loading state while we wait for the API
  resultBox.innerHTML = `
    <h2>ANALYZING...</h2>
    <p>Querying the database...</p>
  `;

  // Store the elements to check and clear the drop zone immediately
  const elementsToCheck = [...selected];
  selected = [];
  renderSelected();

  // Call the PubChem API
  const reaction = await checkPubChem(elementsToCheck);

  // Now 'reaction.success' will properly trigger!
  if (reaction && reaction.success) { 
      const cid = reaction.cid; 
      const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?record_type=2d&image_size=large`;

      // Animate the result in
      dropZone.classList.add("reacting");

      setTimeout(() => {
        dropZone.innerHTML = `<div class="molecule">${reaction.formula}</div>`;
        dropZone.classList.remove("reacting");

        // Display the 2D structure in the terminal
        resultBox.innerHTML = `
          <h2 style="color: var(--neon-green);">REACTION SUCCESSFUL</h2>
          <h3>${reaction.name.toUpperCase()}</h3>
          <p>Formula: ${reaction.formula}</p>
          <div class="structure-container">
            <img src="${imageUrl}" alt="2D Structure of ${reaction.name}" class="compound-structure-2d" onerror="this.style.display='none'; this.parentElement.innerHTML+='<p>Structure not available</p>';" />
          </div>
        `;
      }, 1200);

  } else {
      // If the API couldn't find a matching compound for the formula
      resultBox.innerHTML = `
        <h2 style="color: var(--neon-magenta);">REACTION FAILED</h2>
        <p>No known compound found for the formula ${reaction.formula}.</p>
      `;
      dropZone.innerHTML = "DROP ELEMENTS HERE";
  }
});