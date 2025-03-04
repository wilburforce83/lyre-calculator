/* main.js */

/**
 * Patterns for each number of strings:
 *  - 2-string: e.g. "15"
 *  - 3-string: e.g. "151"
 *  - 4-string: e.g. "1515"
 */
const patternOptions = {
  2: ["15", "51", "14", "41", "11", "55", "44"],
  3: ["151","515","141","414","115","155","144"],
  4: ["1515","5151","1414","4141","1155","1144"]
};

/** Main (natural) note frequencies from C1..C6. */
const noteFrequencies = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/**
 * Piecewise feasible range for open-string frequencies.
 */
function getFeasibleRange(scaleLength) {
  if (scaleLength < 33) {
    return [220, 330]; // ~A3..E4
  } else if (scaleLength < 37.5) {
    return [196, 330]; // ~G3..E4
  } else if (scaleLength < 40) {
    return [146.83, 330]; // ~D3..E4
  } else if (scaleLength < 54.6) {
    return [98, 330]; // ~G2..E4
  } else {
    return [65.41, 220]; // ~C2..A3
  }
}

/**
 * Validate scale length is between 26..70 cm.
 */
function validateScaleLength(scaleLength) {
  if (isNaN(scaleLength) || scaleLength < 26 || scaleLength > 70) {
    UIkit.notification({
      message: 'Please enter a scale length between 26 and 70 cm.',
      status: 'warning'
    });
    return false;
  }
  return true;
}

/**
 * Parse an interval pattern (e.g. "1515") into semitone offsets.
 * 
 * Includes optional overrides for "144" => [0, -5, +5], "155" => [0, -7, +7] if desired.
 */
function parseIntervalPattern(pattern) {
  // Each time we see '1', '4', or '5', we increase the offset by 12 
  // if it's the second, third, etc. time that digit appears.

  let offsets = [];
  let seenOne = 0;  // how many times we've encountered '1'
  let seenFour = 0; // how many times we've encountered '4'
  let seenFive = 0; // how many times we've encountered '5'

  for (let char of pattern) {
    if (char === '1') {
      // First '1' => 0 semitones, second '1' => +12, third => +24, etc.
      offsets.push(12 * seenOne);
      seenOne++;
    } 
    else if (char === '4') {
      // First '4' => +5 semitones, second => +17, third => +29, etc.
      offsets.push(5 + 12 * seenFour);
      seenFour++;
    } 
    else if (char === '5') {
      // First '5' => +7 semitones, second => +19, third => +31, etc.
      offsets.push(7 + 12 * seenFive);
      seenFive++;
    }
  }

  return offsets;
}

/**
 * Partial feasibility: if >=50% of the string frequencies are in range, 
 * we include that tuning in the results. 
 */
function generateFeasibleTunings(scaleLength, intervals) {
  const [fMin, fMax] = getFeasibleRange(scaleLength);
  const mainNotes = Object.keys(noteFrequencies).filter(n => n.indexOf('#') === -1);

  let tunings = [];

  for (const rootNote of mainNotes) {
    const rootFreq = noteFrequencies[rootNote];
    
    let stringFreqs = [];
    let inRangeCount = 0;

    for (let off of intervals) {
      const freq = rootFreq * Math.pow(2, off/12);
      stringFreqs.push(freq);
      if (freq >= fMin && freq <= fMax) {
        inRangeCount++;
      }
    }
    let rangeFactor = 1.75;

    if (scaleLength > 39){
      rangeFactor = 1.2;
    }

    // If at least half are in range, we keep it
    if (inRangeCount >= Math.ceil(intervals.length / rangeFactor)) {
      // Convert each freq to nearest main note
      let stringNotes = [];
      for (let f of stringFreqs) {
        let bestNote = null;
        let bestDiff = Infinity;
        for (const mn of mainNotes) {
          const d = Math.abs(noteFrequencies[mn] - f);
          if (d < bestDiff) {
            bestDiff = d;
            bestNote = mn;
          }
        }
        stringNotes.push({ noteName: bestNote, freq: noteFrequencies[bestNote] });
      }
      tunings.push(stringNotes);
    }
  }
  return tunings;
}

/** 
 * Basic multi-strand recommendations by pitch range.
 */
function getStringRecommendations(f) {
  if (f >= 330) {
    return { dacron: "4–5 strands", fishing: "3×0.15–0.20 mm" };
  } else if (f >= 260) {
    return { dacron: "5–6 strands", fishing: "2–3×0.20–0.25 mm" };
  } else if (f >= 220) {
    return { dacron: "6–8 strands", fishing: "2–3×0.25–0.30 mm" };
  } else if (f >= 130) {
    return { dacron: "8–12 strands", fishing: "3–4×0.30–0.35 mm" };
  } else {
    return { dacron: "12+ strands", fishing: "4+×0.35+ mm" };
  }
}
function getGutRecommendation(f) {
  if (f >= 330) return "Thin (~0.6 mm)";
  if (f >= 220) return "Medium (~0.8 mm)";
  return "Thick (1.0+ mm)";
}
function getHorseHairRecommendation(f) {
  if (f >= 330) return "~30 strands";
  if (f >= 220) return "~40 strands";
  return "~60+ strands";
}

/**
 * For labeling semitones in the final table.
 */
function getSemitoneLabel(freq) {
  let bestNote = null;
  let bestDiff = Infinity;
  Object.keys(noteFrequencies).forEach(n => {
    const d = Math.abs(noteFrequencies[n] - freq);
    if (d < bestDiff) {
      bestDiff = d;
      bestNote = n;
    }
  });
  return bestNote || '?';
}

/**
 * Populate the Tuning Style dropdown (#pattern) based on the number of strings (2,3,4).
 */
function populatePatternDropdown() {
  const numStrings = parseInt(document.getElementById('numStrings').value, 10);
  const patternSelect = document.getElementById('pattern');
  patternSelect.innerHTML = '';

  const patterns = patternOptions[numStrings] || [];
  patterns.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.text = p;
    patternSelect.appendChild(opt);
  });
}

/**
 * Generate feasible tunings for the current scale & pattern, then populate #finalTuning.
 */
function updateRecommendedTunings() {
  const scaleLength = parseFloat(document.getElementById('scaleLength').value);
  if (!validateScaleLength(scaleLength)) return;

  const pattern = document.getElementById('pattern').value;
  const intervals = parseIntervalPattern(pattern);

  const tunings = generateFeasibleTunings(scaleLength, intervals);
  const finalTuningSelect = document.getElementById('finalTuning');
  finalTuningSelect.innerHTML = '';

  if (tunings.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.text = 'No feasible tunings found';
    finalTuningSelect.appendChild(opt);
    return;
  }

  tunings.forEach(tArr => {
    const label = tArr.map(x => x.noteName).join(' ');
    const opt = document.createElement('option');
    opt.value = JSON.stringify(tArr);
    opt.text = label;
    finalTuningSelect.appendChild(opt);
  });
}

/**
 * Build the "Critical Dimensions" table (on the left of the 2-column layout).
 */
function buildCriticalDimensionsTable(scaleCm, numStrings) {
  const dims = generateCriticalDimensions(scaleCm, numStrings);
  const tbody = document.querySelector('#criticalDimensionsTable tbody');
  tbody.innerHTML = '';

  dims.forEach(d => {
    const row = `<tr>
      <td>${d.name}</td>
      <td>${d.key}</td>
      <td>${d.value}</td>
      <td>${d.comment}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

/**
 * Generate the array of dimension objects for the "Critical Dimensions" table,
 * AND build+draw the Talharpa SVG at the end using drawTalharpaSVG(config).
 *
 * - Bridge width: piecewise from real data
 *   60 mm @ 30 cm
 *   70 mm @ 56 cm
 *   Interpolate between those points if scale is in [30..56]
 *   If <30 => clamp to 60
 *   If >56 => clamp to 70
 * - Then subtract 12 mm margin on each side => usableSpan = bridgeWidth - 24
 * - gap = usableSpan/(n-1) if n>1
 */
function generateCriticalDimensions(scaleCm, numStrings) {
  // Convert cm to mm
  const scaleMm = scaleCm * 10;

  // (A) Peg to Bridge = scaleMm
  const pegToBridge = scaleMm;

  // (B) Overall length (piecewise logic)
  //   - Implementation detail: assume this is a function you already have
  //     that returns a numeric length in mm.
  const overallLenMm = calcOverallLength(scaleCm);

  // (C) Window length = half the scale + 20mm
  const windowLength = (scaleMm * 0.5) + 20;

  // (D) Window width = pegSpacing * numStrings
  //     half a string width either side of the span of the string
  const pegSpacing = 36; 
  const windowWidth = pegSpacing * numStrings;

  // (E) Peg spacing = pegSpacing

  // (F) Headstock width = windowWidth + 50
  const headstockWidth = windowWidth + 50;

  // (G,H) Bridge width & spacing from new real data (piecewise logic)
  //   - 60 mm @ 30 cm
  //   - 70 mm @ 56 cm
  //   - linear interpolation in [30..56], clamp outside that range
  const rawBridgeWidth = calcBridgeWidthFromScale(scaleCm);

  // Subtract 12 mm margin each side => usable span
  const marginPerSide = 12;
  let usableSpan = rawBridgeWidth - 2 * marginPerSide;
  if (usableSpan < 0) usableSpan = 0; // clamp

  let gap = 0;
  if (numStrings > 1) {
    gap = usableSpan / (numStrings - 1);
    if (gap < 0) gap = 0; // clamp
  }

  // (I) Body min. width (piecewise from known data)
  const bodyMinWidth = calcBodyMinWidth(scaleCm);

  // (J) Body min. depth => placeholder
  const calculatedDepth = scaleMm * 0.12;
const bodyMinDepth = Math.max(45, Math.min(calculatedDepth, 70));

// Example "cutOutTop": we keep using 35 as a standard default
const cutOutTop = 35;

// soundhole centre
const soundHoleCenter = ((scaleMm - windowLength - (cutOutTop/2)) / 1.85) + windowLength+cutOutTop;
const bottomOfWindow = windowLength+cutOutTop;

// Neck start position
const neckStart = (soundHoleCenter - bottomOfWindow)/3 +bottomOfWindow;

// Neck Thickness

let neckThickness = 0;
if (scaleMm > 450){
    neckThickness = 35;
} else {
    neckThickness = 25;
}

  // tailTopWidth = gap * numStrings
const tailTopWidth = gap * numStrings;
const tailBottomWidth = tailTopWidth * 0.7;
let diff = overallLenMm - scaleMm;
if (diff < 0) diff = 0;
const tailLength = 0.4 * diff;
const tailRadius = 4;

  // Build the dimension array
  const dims = [
    {
      name: "Peg to Bridge",
      key: "A",
      value: pegToBridge.toFixed(1),
      comment: "Critical to string scale"
    },
    {
      name: "Overall length",
      key: "B",
      value: overallLenMm.toFixed(1),
      comment: "Longer = richer tone, shorter = lighter tone"
    },
    {
      name: "Window length",
      key: "C",
      value: windowLength.toFixed(1),
      comment: "For a full octave. Reduce for traditional design"
    },
    {
      name: "Window width",
      key: "D",
      value: windowWidth.toFixed(1),
      comment: "Dotted line denotes reduced width over drone string(s)"
    },
    {
      name: "Peg spacing",
      key: "E",
      value: pegSpacing.toFixed(1),
      comment: "Fixed, based on image research"
    },
    {
      name: "Headstock width",
      key: "F",
      value: headstockWidth.toFixed(1),
      comment: "Design for strings & structural needs"
    },
    {
      name: "Bridge width",
      key: "G",
      value: rawBridgeWidth.toFixed(1),
      comment: "Using violin/viola standards"
    },
    {
      name: "Bridge spacing",
      key: "H",
      value: gap.toFixed(1),
      comment: "Gap between string centers - using violin/viola standards"
    },
    {
      name: "Body min. Width",
      key: "I",
      value: bodyMinWidth.toFixed(1),
      comment: "Modify to tone - wider will be a richer sound"
    },
    {
      name: "Body min. Depth",
      key: "J",
      value: bodyMinDepth.toFixed(1),
      comment: "Modify to tone - deeper will be a richer sound"
    },
    {
        name: "Tail top width",
        key: "K",
        value: tailTopWidth.toFixed(0),
        comment: "Width at top of tailpiece"
      },
      {
        name: "Tail bottom width",
        key: "L",
        value: tailBottomWidth.toFixed(0),
        comment: "Width at bottom of tailpiece"
      },
      {
        name: "Tail length",
        key: "M",
        value: tailLength.toFixed(0),
        comment: "Length of tailpiece - recommend thickness of 5-7mm"
      },
      {
        name: "Headstock Thickness",
        key: "N",
        value: cutOutTop,
        comment: "Length of headstock"
      },
      {
        name: "Soundhole Centre",
        key: "O",
        value: soundHoleCenter.toFixed(0),
        comment: "Centre of hole (circa 50mm)"
      },
      {
        name: "Neck Start",
        key: "P",
        value: neckStart.toFixed(0),
        comment: "Neck Start Position"
      },
      {
        name: "Neck Thickness",
        key: "Q",
        value: neckThickness.toFixed(0),
        comment: "Softer materials may require additional thickness"
      }
  ];

  // ----------------------------------------------------------------------
  // BUILD A CONFIG OBJECT AND DRAW THE TALHARPA SVG
  // (these values are either derived above or set to defaults)
  // ----------------------------------------------------------------------
  
  
  
  // Another example "bridgeLength" default
  const bridgeLength = 5;

  // We can also define top/bottom radius factors and so on:
  const config = {
    // from the dimension calculations
    headstockWidth: headstockWidth,
    bodyMinWidth: bodyMinWidth,
    bodyMinDepth: bodyMinDepth,
    overallLenMm: overallLenMm,
    cutOutTop: cutOutTop,
    windowWidth: windowWidth,
    windowLength: windowLength,
    neckStart: neckStart,
    neckThickness: neckThickness,

    // corner radii factors (defaults):
    rTopFactor: 0.08,
    rBottomFactor: 0.2,
    rWindowFactor: 0.08,

    rawBridgeWidth: rawBridgeWidth,
    bridgeLength: bridgeLength,
    
    // pegStart: half of cutOutTop, or you could define it differently
    pegStart: cutOutTop / 2,

    // scale in mm for the distance from pegStart to the bridge center:
    scaleMm: pegToBridge,
    
    // from dims:
    pegSpacing: pegSpacing,
    numStrings: numStrings,
    pegHoleRadius: 3,
    
    // gap between strings at the bridge end
    gap: gap,

    // optional display settings:
    margin: 10,
    svgWidthPx: 400,
    svgHeightPx: 800,
    stringColor: '#ccc'
  };

  // Generate the three SVGs:
const frontSvg = drawTalharpaSVG(config);
const sideSvg = drawTalharpaSideSVG(config);
const frameSvg = drawTalharpaFrameSVG(config);

// Insert (or replace) the SVG inside their containers:
const frontContainer = document.getElementById("talharpaContainer");
const sideContainer = document.getElementById("talharpaSideContainer");
const frameContainer = document.getElementById("talharpaFrameContainer");

if (frontContainer) {
  frontContainer.innerHTML = '';  // clear any existing
  frontContainer.appendChild(frontSvg);
} else {
  console.warn("No element with id='talharpaContainer' found.");
}

if (sideContainer) {
  sideContainer.innerHTML = '';  // clear any existing
  sideContainer.appendChild(sideSvg);
} else {
  console.warn("No element with id='talharpaSideContainer' found.");
}

if (frameContainer) {
  frameContainer.innerHTML = '';  // clear any existing
  frameContainer.appendChild(frameSvg);

  // Create a wrapper element in JavaScript
const wrapperDiv = document.createElement('div');
wrapperDiv.innerHTML = `
  <p><i>NOTE 1: Wall thickness 7mm, at base 18mm to support tailpiece anchoring point.</p>
  <p>NOTE 2: Notch is a notch 3-4mm on both sides of the headstock. It is recommended to glue hardwood plates, or ply across this section
to reduce the stress on the headstock. Stiffening both sides will put more of the stress in compression down the neck. 
Alternatively, use a softer wood with the grain running across the headstock - the core will grain running the length of the 
Instrument.</i></p>
<h3>1. Prepare Your Work Area and Materials</h3>
<p>
  For an initial Talharpa build, it's best to use inexpensive wood and simple hand or power tools:
</p>
<ul>
  <li><strong>Wood Choice:</strong> C24 construction‐grade spruce (200 × 75 mm) joists are affordable and durable enough for a first attempt.</li>
  <li><strong>Tools Needed:</strong> Tape measure, ruler, pencil, clamps, jigsaw (or hand saw), sanding block or sander (80–120 grit), and eye/dust protection.</li>
  <li><strong>Layout:</strong> Transfer the Talharpa’s front outline (from your drawing) onto the wide face of the spruce joist. Double‐check critical measurements (overall length, body width at top & bottom, etc.).</li>
</ul>

<h3>2. Rough‐Cut the Outer Shape</h3>
<p>
  Once the outline is traced on the board, clamp it securely before cutting:
</p>
<ul>
  <li><strong>Cut Outside the Lines:</strong> Use a jigsaw (or hand saw) to remove the bulk of the waste, leaving 1–2 mm outside your marked line.</li>
  <li><strong>Smooth the Perimeter:</strong> Use a rasp, file, or coarse sandpaper to work down to the exact outline. This ensures accurate curves around the headstock and bottom radius.</li>
</ul>

<h3>3. Mark and Cut the Internal Frame Section</h3>
<p>
  The interior cut‐out is offset 7 mm from the sides and 18 mm at the bottom for tailpiece reinforcement:
</p>
<ul>
  <li><strong>Mark the Inner Lines:</strong> Measure inward 7 mm along each side, and 18 mm from the bottom. Sketch these lines to match the taper shown in your Talharpa frame drawing.</li>
  <li><strong>Drill Starter Holes (Optional):</strong> If using a jigsaw for the inner window, drill a hole inside the waste area to insert the blade.</li>
  <li><strong>Cut the Interior:</strong> Carefully saw along (or just outside) your inner line. Remove sections in stages if needed.</li>
  <li><strong>Sand or Rasp the Interior:</strong> Smooth the inner edges, maintaining the 7 mm side thickness and 18 mm tail thickness.</li>
</ul>

<h3>4. Final Shaping and Checks</h3>
<p>
  After the main cuts are done, refine and inspect the piece:
</p>
<ul>
  <li><strong>Verify Wall Thickness:</strong> Check you have at least 7 mm along the sides and 18 mm at the tail end. A thicker tail area helps anchor the tailpiece securely.</li>
  <li><strong>Blend Corners:</strong> Use a sanding block, file, or spokeshave to ensure the bottom radius transitions smoothly into the 18 mm offset area.</li>
  <li><strong>Light Sanding:</strong> Progress from coarse to medium grit on both outer and inner edges. Remove any sharp corners.</li>
  <li><strong>Optional Sealing:</strong> A simple coat of sealer or oil can protect the wood. For a test build, you may skip the fancy finishes.</li>
</ul>

<h3>5. Soundboards</h3>
<p>
  The Talharpa typically features two soundboards (top and possibly bottom) that can be fashioned from the same spruce joist material:
</p>
<ul>
  <li>
    <strong>Cut Slivers from the Joist:</strong> 
    After you have removed the main frame, use a hand saw or band saw to slice off 10–15&nbsp;mm thick boards from the remaining material.
    Plane these down to your desired soundboard thickness (often 6–7)&nbsp;mm, depending on design and resonance needs).
  </li>
  <li>
    <strong>Add a Base Board (Reinforcement Strip):</strong>
    For the top soundboard, glue a narrow strip of wood (about 8–10&nbsp;mm square) lengthwise along the underside under the bass string’s bridge location.
    Taper both ends of this strip and make it around one‐third the total soundboard length, helping transfer vibrations and improve resonance.
  </li>
  <li>
    <strong>Gluing the Soundboard:</strong>
    Once planed and fitted, glue the soundboard onto the Talharpa frame using a strong wood adhesive (e.g., Gorilla Glue or a specialized instrument glue).
    Clamp it securely around the perimeter and allow adequate drying time per the glue manufacturer’s instructions.
  </li>
</ul>
<p>
  This process ensures the top board contributes to the instrument’s tone while maintaining enough strength to handle string tension and everyday use. The same technique can be used for the headstock.
  There is no real resonance requirement for the headstock so you can use plywood for this support (I would recommend avoiding plywood and hardwood for the soundboards though!)
</p>


<h3>6. Summary</h3>
<p>
  By following these steps with a jigsaw, basic hand tools, and C24 spruce, you can build a functional Talharpa frame. 
  The 7 mm walls and 18 mm tail thickness provide structural support, especially for anchoring the tailpiece. 
  Once you’re comfortable with this initial prototype, consider upgrading to hardwoods or refining the design for improved tone and aesthetics.
</p>

`;

// Append this wrapper after your SVG
frameContainer.appendChild(wrapperDiv);

} else {
  console.warn("No element with id='talharpaFrameContainer' found.");
}

var designPrintOut = document.getElementById("designPrintOut");
if (designPrintOut) {
  designPrintOut.style.display = "block";
}

var savePdfButton = document.getElementById("savePdfButton");
if (savePdfButton) {
  savePdfButton.style.display = "block";
}
  


  return dims;
}


/**
 * Helper function for the new bridge width logic:
 *  - 60 mm @ 30 cm
 *  - 70 mm @ 56 cm
 *  - linear interpolation in [30..56], clamp outside that range
 */
function calcBridgeWidthFromScale(scaleCm) {
  if (scaleCm <= 30) return 60;   // clamp
  if (scaleCm >= 56) return 70;   // clamp

  // If in [30..56], linear interpolation
  const frac = (scaleCm - 30) / (56 - 30);  // 0..1
  // 60 -> 70
  return 60 + (70 - 60)*frac;  // 60 + 10*frac
}




/**
 * Piecewise logic for overall length:
 *  - Up to 40 => x1.66
 *  - 40..56 => interpolate from 1.66..1.43
 *  - Over 56 => x1.43
 * Returns mm
 */
function calcOverallLength(scaleCm) {
  if (scaleCm <= 40) {
    return scaleCm * 1.66 * 10;
  } else if (scaleCm >= 56) {
    return scaleCm * 1.43 * 10;
  } else {
    // Interpolate
    const fraction = (scaleCm - 40)/(56-40);
    const startMult = 1.66, endMult = 1.43;
    const mult = startMult + (endMult - startMult)*fraction;
    return scaleCm * mult * 10;
  }
}

/**
 * Body min. width from known data:
 *  - 160mm @ 32cm
 *  - 190mm @ 37cm
 *  - 210mm @ 56cm
 * We'll do piecewise interpolation across [32..37] & [37..56]. 
 * If <32 => 160, if >56 => 210
 */
function calcBodyMinWidth(scaleCm) {
  if (scaleCm <= 32) return 160;
  if (scaleCm >= 56) return 210;

  // If 32..37 => interpolate 160..190
  if (scaleCm <= 37) {
    const frac = (scaleCm - 32)/(37-32);
    return 160 + (190 - 160)*frac;
  }
  // If 37..56 => interpolate 190..210
  const frac2 = (scaleCm - 37)/(56-37);
  return 190 + (210 - 190)*frac2;
}

/**
 * Once the user picks a final tuning and clicks "Calculate":
 *  - Reverse the string order
 *  - Build string table
 *  - Build critical dimensions table
 *  - Build single-octave table
 */
function calculateStrings() {
  const scaleLength = parseFloat(document.getElementById('scaleLength').value);
  if (!validateScaleLength(scaleLength)) return;

  const finalTuningVal = document.getElementById('finalTuning').value;
  if (!finalTuningVal) {
    UIkit.notification({
      message: 'Please select a valid tuning from the dropdown.',
      status: 'warning'
    });
    return;
  }

  let stringData;
  try {
    stringData = JSON.parse(finalTuningVal);
  } catch(e) {
    UIkit.notification({
      message: 'Invalid tuning data.',
      status: 'danger'
    });
    return;
  }

  // Reverse the strings
  const reversedStrings = [...stringData].reverse();

  // 1) Build the string material recommendations
  const stringTableBody = document.querySelector('#stringTable tbody');
  stringTableBody.innerHTML = '';
  reversedStrings.forEach((sd, idx) => {
    const rec = getStringRecommendations(sd.freq);
    const gutRec = getGutRecommendation(sd.freq);
    const hairRec = getHorseHairRecommendation(sd.freq);

    const row = `<tr>
      <td>${idx+1}</td>
      <td>${sd.noteName}</td>
      <td>${gutRec}</td>
      <td>${hairRec}</td>
      <td>${rec.dacron}</td>
      <td>${rec.fishing}</td>
    </tr>`;
    stringTableBody.innerHTML += row;
  });

  // 2) Build the critical dimensions table
  const numStrings = reversedStrings.length; 
  buildCriticalDimensionsTable(scaleLength, numStrings);

  // 3) Build the single-octave scale table (0..12)
  const noteDistanceDiv = document.getElementById('noteDistanceTable');
  noteDistanceDiv.innerHTML = '';

  let tableHtml = `<h3>Single-Octave Scale (0–12 Semitones) - Hand positions in CM from pegs</h3>`;
  tableHtml += `<table class="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>Semitone</th>`;

  reversedStrings.forEach((sd, i) => {
    tableHtml += `<th>String ${i+1} (${sd.noteName})</th>`;
  });
  tableHtml += `<th>Distance from Nut (cm)</th>
                <th>Distance from Prev (cm)</th>
              </tr>
    </thead>
    <tbody>`;

  let prevDist = 0;
  for (let n = 0; n <= 12; n++) {
    const distFromNut = scaleLength * (1 - 1/Math.pow(2, n/12));
    const distFromPrev = (n === 0) ? 0 : (distFromNut - prevDist);
    prevDist = distFromNut;

    let rowHtml = `<tr><td>${n}</td>`;
    reversedStrings.forEach(sd => {
      const freq = sd.freq * Math.pow(2, n/12);
      const label = getSemitoneLabel(freq);
      rowHtml += `<td>${label}</td>`;
    });

    rowHtml += `<td>${distFromNut.toFixed(2)}</td>`;
    rowHtml += `<td>${distFromPrev.toFixed(2)}</td></tr>`;
    tableHtml += rowHtml;
  }

  tableHtml += `</tbody></table>`;
  noteDistanceDiv.innerHTML = tableHtml;
}

/**
 * On page load, set up event listeners & default pattern list for 3 strings.
 */
window.addEventListener('DOMContentLoaded', () => {
  // 1) Populate pattern dropdown for 3 strings by default
  populatePatternDropdown();

  // 2) Listen for changes
  document.getElementById('scaleLength').addEventListener('change', updateRecommendedTunings);

  document.getElementById('numStrings').addEventListener('change', () => {
    populatePatternDropdown();
    updateRecommendedTunings();
  });

  document.getElementById('pattern').addEventListener('change', updateRecommendedTunings);

  // 3) "Calculate" builds final tables
  document.getElementById('calculateBtn').addEventListener('click', calculateStrings);

  // Attempt an initial recommended tunings generation (in case scale is pre-filled)
  updateRecommendedTunings();
});
