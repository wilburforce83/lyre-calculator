/**
 * drawTalharpaSideSVG
 * Creates an SVG element representing the side view of the Talharpa with the neck
 * indentation on the LEFT side, with all corners rounded.
 * All coordinates are offset by totalMargin (drawingMargin + extraMargin),
 * and the neck join radius (rBlend) is computed from (bodyMinDepth – neckThickness).
 * 
 * In this version, the arc sweep flags have been inverted:
 *   - All fixed corners (rFixed) now use sweep flag 0.
 *   - The neck join (rBlend) now uses sweep flag 1.
 *
 * Usage example:
 *   const sideConfig = {
 *     overallLenMm: 547.8,
 *     bodyMinDepth: 45,
 *     neckStart: 100,        // vertical distance from top to neck join
 *     neckThickness: 15,     // horizontal indentation of the neck
 *     drawingMargin: 10,
 *     extraMargin: 50,
 *     svgWidthPx: 600,
 *     svgHeightPx: 800
 *   };
 *   const sideSvg = drawTalharpaSideSVG(sideConfig);
 *   document.getElementById('talharpaSideContainer').appendChild(sideSvg);
 */
function drawTalharpaSideSVG(config) {
  const {
    overallLenMm,
    bodyMinDepth,
    neckStart,
    neckThickness,
    drawingMargin = 10,
    extraMargin = 50,
    svgWidthPx = 600,
    svgHeightPx = 800
  } = config;
  
  // Total margin = drawingMargin + extraMargin
  const totalMargin = drawingMargin + extraMargin;
  
  // Fixed and blend radii:
  const rFixed = 3; // small fixed radius for most corners
  const rBlend = (bodyMinDepth - neckThickness) / 2;  // for the neck join
  
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  
  const viewBoxWidth  = bodyMinDepth + totalMargin * 2;
  const viewBoxHeight = overallLenMm + totalMargin * 2;
  svg.setAttribute("width", svgWidthPx.toString());
  svg.setAttribute("height", svgHeightPx.toString());
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  
  // Define ideal (unrounded) points (all relative to top of instrument, offset by totalMargin = M):
  const M = totalMargin;
  // For a side view with neck indentation on the LEFT:
  // A′: bottom right = (M + bodyMinDepth, M + overallLenMm)
  const A = { x: M + bodyMinDepth, y: M + overallLenMm };
  // B′: top right = (M + bodyMinDepth, M)
  const B = { x: M + bodyMinDepth, y: M };
  // C′: from B, move left by neckThickness = (M + bodyMinDepth - neckThickness, M)
  const C = { x: M + bodyMinDepth - neckThickness, y: M };
  // D′: from C, move down to neckStart = (M + bodyMinDepth - neckThickness, M + neckStart)
  const D = { x: M + bodyMinDepth - neckThickness, y: M + neckStart };
  // E′: from D, move horizontally left to the left edge = (M, M + neckStart)
  const E = { x: M, y: M + neckStart };
  // F′: from E, move down to bottom left = (M, M + overallLenMm)
  const F = { x: M, y: M + overallLenMm };
  
  // Now, define adjusted points for rounded corners.
  // For corners, we adjust the points by fixed radius (rFixed) except at the neck join (between D and E) where we use rBlend.
  
  // Corner at B: between A→B and B→C
  const B1 = { x: B.x, y: B.y + rFixed };        // vertical segment end from A→B
  const B2 = { x: B.x - rFixed, y: B.y };          // horizontal segment start from B→C
  
  // Corner at C: between B→C and C→D
  const C1 = { x: C.x + rFixed, y: C.y };          // horizontal segment ends rFixed before C
  const C2 = { x: C.x, y: C.y + rFixed };           // vertical segment starts rFixed below C
  
  // Neck join between D and E: use rBlend
  const D1 = { x: D.x, y: D.y - rBlend };           // vertical segment ends rBlend above D
  const D2 = { x: D.x - rBlend, y: D.y };            // horizontal segment begins rBlend to left of D
  
  // Corner at E: between D→E and E→F
  const E1 = { x: E.x + rFixed, y: E.y };           // horizontal segment ends rFixed from left edge
  const E2 = { x: E.x, y: E.y + rFixed };           // vertical segment begins rFixed below E
  
  // Corner at F: between E→F and F→A
  const F1 = { x: F.x, y: F.y - rFixed };           // vertical segment ends rFixed above F
  const F2 = { x: F.x + rFixed, y: F.y };            // horizontal segment starts rFixed to right of F
  
  // Corner at A: between F→A and A→B
  const A1 = { x: A.x - rFixed, y: A.y };           // horizontal segment ends rFixed left of A
  const A2 = { x: A.x, y: A.y - rFixed };           // vertical segment begins rFixed above A
  
  // Build the path string.
  // Starting at A2, then up to B1, arc at B, line to C1, arc at C, line to D1,
  // arc (neck join) from D1 to D2 using rBlend (now with sweep flag 1),
  // line to E1, arc at E, line to F1, arc at F, line to A1, arc at A, then close.
  let dPath = "";
  dPath += `M ${A2.x},${A2.y} `;
  dPath += `L ${B1.x},${B1.y} `;
  // Invert arc: fixed corners now use sweep flag 0.
  dPath += `A ${rFixed} ${rFixed} 0 0 0 ${B2.x},${B2.y} `;
  dPath += `L ${C1.x},${C1.y} `;
  dPath += `A ${rFixed} ${rFixed} 0 0 0 ${C2.x},${C2.y} `;
  dPath += `L ${D1.x},${D1.y} `;
  // Neck join: invert sweep flag: now use 1.
  dPath += `A ${rBlend} ${rBlend} 0 0 1 ${D2.x},${D2.y} `;
  dPath += `L ${E1.x},${E1.y} `;
  dPath += `A ${rFixed} ${rFixed} 0 0 0 ${E2.x},${E2.y} `;
  dPath += `L ${F1.x},${F1.y} `;
  dPath += `A ${rFixed} ${rFixed} 0 0 0 ${F2.x},${F2.y} `;
  dPath += `L ${A1.x},${A1.y} `;
  dPath += `A ${rFixed} ${rFixed} 0 0 0 ${A2.x},${A2.y} `;
  dPath += "Z";
  
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", dPath);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "black");
  path.setAttribute("stroke-width", "1");
  svg.appendChild(path);
  
  return svg;
}
