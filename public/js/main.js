/* main.js */

/**
 * 1) We store main notes (C..B, no sharps) and their frequencies.
 * 2) We'll create a function to parse an interval pattern (e.g. "1515") into semitone offsets.
 * 3) We then generate feasible root notes that keep all intervals within the scale's feasible freq range.
 * 4) The user picks a final tuning from the dropdown, and we show the recommended strings + single-octave table.
 */

const noteFrequencies = {
    'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
    'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50
  };
  
  // For labeling semitones in the scale table
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  /**
   * Validate the scale length is within 26..70.
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
   * Return a [fMin, fMax] for feasible open-string frequencies, approximate.
   * You can refine this piecewise logic as you gather more real data.
   */
  function getFeasibleRange(scaleLength) {
    if (scaleLength < 33) {
      return [220, 330]; // e.g. A3..E4
    } else if (scaleLength < 37.5) {
      return [196, 330]; // G3..E4
    } else if (scaleLength < 40) {
      return [146.83, 330]; // D3..E4
    } else if (scaleLength < 54.6) {
      return [98, 330]; // G2..E4
    } else {
      return [65.41, 220]; // C2..A3 or so
    }
  }
  
  /**
   * Parse an interval pattern like "1515" into an array of semitone offsets.
   * We'll assume:
   *   - "1" => root or +12 if repeated
   *   - "5" => +7 or +19 if repeated
   *   - "4" => +5 or +17 if repeated
   * For example, "151" => [0, 7, 12].
   */
  function parseIntervalPattern(pattern, numStrings) {
    // Truncate the pattern to the number of strings
    const truncated = pattern.slice(0, numStrings); // e.g. "1515" -> "151" if numStrings=3
  
    let offsets = [];
    let seenOne = 0, seenFour = 0, seenFive = 0;
  
    for (let i = 0; i < truncated.length; i++) {
      const char = truncated[i];
      if (char === '1') {
        if (seenOne === 0) {
          offsets.push(0);  // first "1" => root
          seenOne++;
        } else if (seenOne === 1) {
          offsets.push(12); // second "1" => +12
          seenOne++;
        } else {
          offsets.push(12 * (seenOne + 1)); // if there's a third "1," add 24, etc.
          seenOne++;
        }
      } else if (char === '5') {
        if (seenFive === 0) {
          offsets.push(7); // first "5" => +7
          seenFive++;
        } else {
          offsets.push(7 + 12 * seenFive); // second "5" => +19, third => +31, etc.
          seenFive++;
        }
      } else if (char === '4') {
        if (seenFour === 0) {
          offsets.push(5); // first "4" => +5
          seenFour++;
        } else {
          offsets.push(5 + 12 * seenFour); // second "4" => +17, etc.
          seenFour++;
        }
      }
    }
    return offsets; // e.g. "151" => [0,7,12]
  }
  
  /**
   * For each feasible root note in [fMin,fMax], build the other intervals and check if they're in [fMin,fMax].
   * If all intervals are feasible, we add that multi-string tuning to our list.
   */
  function generateFeasibleTunings(scaleLength, intervals) {
    const [fMin, fMax] = getFeasibleRange(scaleLength);
  
    // Gather all main notes from noteFrequencies
    const mainNotes = Object.keys(noteFrequencies).filter(n => n.indexOf('#') === -1);
  
    let tunings = []; // each entry is an array of {noteName, freq}
  
    for (const rootNote of mainNotes) {
      const rootFreq = noteFrequencies[rootNote];
      if (rootFreq < fMin || rootFreq > fMax) continue;
  
      // Build an array of frequencies for each interval
      let stringFreqs = [];
      let stringNotes = [];
      let allValid = true;
  
      for (let off of intervals) {
        const freq = rootFreq * Math.pow(2, off/12);
        if (freq < fMin || freq > fMax) {
          allValid = false;
          break;
        }
        stringFreqs.push(freq);
      }
  
      if (!allValid) continue;
  
      // Now we need to convert each freq back to the nearest main note name
      // We'll do a naive approach: find the note in noteFrequencies that's closest
      // Or we could skip that, and just store frequencies. But let's approximate.
      for (let f of stringFreqs) {
        let bestNote = null;
        let bestDiff = 999999;
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
    return tunings; // array of arrays
  }
  
  /**
   * For a single frequency, return the recommended strings.
   */
  function getStringRecommendations(f) {
    // same logic as before
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
   * Populate #finalTuning with feasible tunings once the user clicks "Generate Tunings."
   */
  function generateTuningOptions() {
    const scaleLength = parseFloat(document.getElementById('scaleLength').value);
    if (!validateScaleLength(scaleLength)) return;
  
    const numStrings = parseInt(document.getElementById('numStrings').value, 10);
    const pattern = document.getElementById('pattern').value;
  
    // parse intervals
    const intervals = parseIntervalPattern(pattern, numStrings);
    
    // build feasible tunings
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
  
    // Each tuning is an array of {noteName, freq} for each string
    // We'll label them like "C4 G3 C3" etc.
    tunings.forEach(tuningArr => {
      const label = tuningArr.map(x => x.noteName).join(' ');
      const opt = document.createElement('option');
      opt.value = JSON.stringify(tuningArr); // store the array as JSON
      opt.text = label;
      finalTuningSelect.appendChild(opt);
    });
  }
  
  /**
   * Once the user selects a final tuning and clicks "Calculate," we:
   * 1) Show a row per string in #stringTable
   * 2) Show a single-octave scale table with columns for each string + distance from nut + distance from prev note
   */
  function calculateStrings() {
    const scaleLength = parseFloat(document.getElementById('scaleLength').value);
    if (!validateScaleLength(scaleLength)) return;
  
    const finalTuningVal = document.getElementById('finalTuning').value;
    if (!finalTuningVal) {
      UIkit.notification({
        message: 'Please select a tuning from the "Recommended Tunings" dropdown.',
        status: 'warning'
      });
      return;
    }
  
    let stringData;
    try {
      stringData = JSON.parse(finalTuningVal); // array of {noteName, freq}
    } catch(e) {
      UIkit.notification({
        message: 'Invalid tuning data.',
        status: 'danger'
      });
      return;
    }
  
    // Build the string recommendation table
    const stringTableBody = document.querySelector('#stringTable tbody');
    stringTableBody.innerHTML = '';
  
    stringData.forEach((sd, idx) => {
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
  
    // Build the single-octave scale table (0..12 semitones).
    // We'll show columns: [Semitone, String1, String2, ..., Distance from Nut, Dist from Prev]
    const noteDistanceDiv = document.getElementById('noteDistanceTable');
    noteDistanceDiv.innerHTML = '';
  
    let tableHtml = `<h3>Single-Octave Scale (0–12 Semitones)</h3>`;
    tableHtml += `<table class="uk-table uk-table-striped">
      <thead>
        <tr>
          <th>Semitone</th>`;
  
    stringData.forEach((sd, i) => {
      tableHtml += `<th>String ${i+1} (${sd.noteName})</th>`;
    });
    tableHtml += `<th>Distance from Nut (cm)</th>
                  <th>Distance from Prev (cm)</th>
                </tr>
      </thead>
      <tbody>`;
  
    let prevDist = 0;
    for (let n = 0; n <= 12; n++) {
      // distance from nut is the same for all strings, so we just do it once
      const distFromNut = scaleLength * (1 - (1 / Math.pow(2, n/12)));
      const distFromPrev = (n === 0) ? 0 : (distFromNut - prevDist);
      prevDist = distFromNut;
  
      // For each string, compute the note label
      // We'll do string's open freq * 2^(n/12), then find nearest note or label semitone
      let rowHtml = `<tr><td>${n}</td>`;
  
      stringData.forEach(sd => {
        const semitoneFreq = sd.freq * Math.pow(2, n/12);
        // We skip frequency in the final table, we only show note name
        // We'll do a naive approach: find the nearest semitone name
        const noteLabel = getSemitoneLabel(semitoneFreq);
        rowHtml += `<td>${noteLabel}</td>`;
      });
  
      rowHtml += `<td>${distFromNut.toFixed(2)}</td>`;
      rowHtml += `<td>${distFromPrev.toFixed(2)}</td></tr>`;
      tableHtml += rowHtml;
    }
  
    tableHtml += `</tbody></table>`;
    noteDistanceDiv.innerHTML = tableHtml;
  }
  
  /**
   * Given a frequency, find the closest semitone label (e.g. "C#4").
   */
  function getSemitoneLabel(freq) {
    // We'll search all noteFrequencies (including sharps) for the closest
    let bestNote = null;
    let bestDiff = 999999;
    Object.keys(noteFrequencies).forEach(n => {
      const d = Math.abs(noteFrequencies[n] - freq);
      if (d < bestDiff) {
        bestDiff = d;
        bestNote = n;
      }
    });
    return bestNote; // e.g. "C#4"
  }
  
  // Event Listeners
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', generateTuningOptions);
    document.getElementById('calculateBtn').addEventListener('click', calculateStrings);
  });
  