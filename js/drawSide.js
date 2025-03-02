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
    headstockWidth,
    bodyMinWidth,
    cutOutTop,
    windowWidth,
    windowLength,
    rTopFactor,
    rBottomFactor,
    rWindowFactor,
    rawBridgeWidth,
    bridgeLength,
    pegStart,
    scaleMm,
    pegSpacing,
    numStrings,
    pegHoleRadius,
    gap,
    overallLenMm,
    bodyMinDepth,
    neckStart,
    neckThickness,
    drawingMargin = 10,
    extraMargin = 50,
    svgWidthPx = 600,
    svgHeightPx = 800
  } = config;

  //DIMENSION CONSTS
  const DIMENSION_COLOR = "red";
  const DIMENSION_OPACITY = "0.5";
  const DIMENSION_FONT_SIZE = "9px";
  
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

// Assume these variables are already defined in your side view function:
//   totalMargin, overallLenMm, bodyMinDepth, neckStart
// and that totalMargin is stored in variable M:
const soundboardThickness = 6; // in mm

// ---------- Left Soundboard Panel ----------
// This panel covers vertically from E to F, where originally:
//   E = (M, M + neckStart) and F = (M, M + overallLenMm)
// Now, we shift the panel left by soundboardThickness.
const leftOuterTop = { x: M - soundboardThickness, y: M + neckStart };
const leftOuterBottom = { x: M - soundboardThickness, y: M + overallLenMm };

// The inner edge is now at x = M (instead of M + soundboardThickness).
const leftInnerTop = { x: M, y: M + neckStart };
const leftInnerBottom = { x: M, y: M + overallLenMm };

let dLeftPanel = "";
dLeftPanel += `M ${leftOuterTop.x},${leftOuterTop.y} `;
dLeftPanel += `L ${leftOuterBottom.x},${leftOuterBottom.y} `;
dLeftPanel += `L ${leftInnerBottom.x},${leftInnerBottom.y} `;
dLeftPanel += `L ${leftInnerTop.x},${leftInnerTop.y} Z`;

const leftPanel = document.createElementNS(svgNS, "path");
leftPanel.setAttribute("d", dLeftPanel);
leftPanel.setAttribute("fill", "none");
leftPanel.setAttribute("stroke", "black");
leftPanel.setAttribute("stroke-width", "1");
svg.appendChild(leftPanel);


const vChamfer = 0.15 * neckStart;  // 15% of neckStart

// Define outer edge points (right edge)
const R_top = { x: M + bodyMinDepth, y: M + neckStart };
const R_bottom = { x: M + bodyMinDepth, y: M + overallLenMm };

// Define blended outer edge endpoints
const R_top_blend = { x: M + bodyMinDepth, y: M + neckStart + vChamfer };
const R_bottom_blend = { x: M + bodyMinDepth, y: M + overallLenMm - vChamfer };

// Define inner edge points (offset by soundboardThickness)
const I_top = { x: M + bodyMinDepth + soundboardThickness, y: M + neckStart };
const I_bottom = { x: M + bodyMinDepth + soundboardThickness, y: M + overallLenMm };

// Define blended inner edge endpoints
const I_top_blend = { x: M + bodyMinDepth + soundboardThickness, y: M + neckStart + vChamfer };
const I_bottom_blend = { x: M + bodyMinDepth + soundboardThickness, y: M + overallLenMm - vChamfer };

// Build the polygon path for the right soundboard panel:
let dRightPanel = "";
// Start at the outer top (actual)
dRightPanel += `M ${R_top.x},${R_top.y} `;
// Diagonally down from outer top to its blended point:
dRightPanel += `L ${R_top_blend.x},${R_top_blend.y} `;
// Vertical line from R_top_blend to R_bottom_blend:
dRightPanel += `L ${R_bottom_blend.x},${R_bottom_blend.y} `;
// Diagonally from R_bottom_blend to the outer bottom (actual):
dRightPanel += `L ${R_bottom.x},${R_bottom.y} `;
// Horizontal line from R_bottom (outer bottom) to I_bottom (inner bottom):
dRightPanel += `L ${I_bottom.x},${I_bottom.y} `;
// Diagonally from I_bottom to I_bottom_blend:
dRightPanel += `L ${I_bottom_blend.x},${I_bottom_blend.y} `;
// Vertical line from I_bottom_blend to I_top_blend:
dRightPanel += `L ${I_top_blend.x},${I_top_blend.y} `;
// Diagonally from I_top_blend to I_top (actual):
dRightPanel += `L ${I_top.x},${I_top.y} `;
// Close the path back to the starting outer top:
dRightPanel += `L ${R_top.x},${R_top.y} Z`;

const rightSoundboardPanel = document.createElementNS(svgNS, "path");
rightSoundboardPanel.setAttribute("d", dRightPanel);
rightSoundboardPanel.setAttribute("fill", "none");
rightSoundboardPanel.setAttribute("stroke", "black");
rightSoundboardPanel.setAttribute("stroke-width", "1");
svg.appendChild(rightSoundboardPanel);


// --- New Bridge Element ---
// Assumptions:
//   totalMargin: combined drawingMargin + extraMargin
//   scaleMm: the distance from the peg to the bridge (often equal to scaleMm)
//   cutOutTop: vertical offset for the window
//   topRightX: right edge of the instrument (from main drawing)
// The new bridge element is 5 mm tall and 35 mm wide.
// Its vertical center is at: totalMargin + scaleMm + (cutOutTop/2)
// Define topRightX (right edge of the instrument in the side view)
const topRightX = totalMargin + bodyMinDepth;

// Now shift the bridge rectangle to the right by soundboardThickness.
const bridgeRectX = topRightX + soundboardThickness;

// Bridge element parameters:
const bridgeVerticalCenter = totalMargin + scaleMm + (cutOutTop / 2); // scaleMm should be defined in your config
const bridgeRectY = bridgeVerticalCenter - (5 / 2);  // center a 5mm tall rectangle vertically
const bridgeRectWidth = 30;
const bridgeRectHeight = 5;

const newBridgeRect = document.createElementNS(svgNS, "rect");
newBridgeRect.setAttribute("x", bridgeRectX);
newBridgeRect.setAttribute("y", bridgeRectY);
newBridgeRect.setAttribute("width", bridgeRectWidth);
newBridgeRect.setAttribute("height", bridgeRectHeight);
newBridgeRect.setAttribute("fill", "none");
newBridgeRect.setAttribute("stroke", "black");
newBridgeRect.setAttribute("stroke-width", "1");
svg.appendChild(newBridgeRect);






// DIMENSIONING



// ---------- Dimension P: Neck Start ----------
// Vertical dimension from instrument top (y = M) to neckStart (y = M + neckStart)
// Draw on the left side (offset 20 mm left of the instrument's left edge)
const dimP_X = totalMargin - 20;
const dimLineP = document.createElementNS(svgNS, "line");
dimLineP.setAttribute("x1", dimP_X);
dimLineP.setAttribute("y1", totalMargin);
dimLineP.setAttribute("x2", dimP_X);
dimLineP.setAttribute("y2", totalMargin + neckStart);
dimLineP.setAttribute("stroke", DIMENSION_COLOR);
dimLineP.setAttribute("stroke-width", "1");
dimLineP.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineP);

// Extension lines for P:
const extLineP1 = document.createElementNS(svgNS, "line");
extLineP1.setAttribute("x1", totalMargin);
extLineP1.setAttribute("y1", totalMargin);
extLineP1.setAttribute("x2", dimP_X);
extLineP1.setAttribute("y2", totalMargin);
extLineP1.setAttribute("stroke", DIMENSION_COLOR);
extLineP1.setAttribute("stroke-width", "1");
extLineP1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineP1);

const extLineP2 = document.createElementNS(svgNS, "line");
extLineP2.setAttribute("x1", totalMargin);
extLineP2.setAttribute("y1", totalMargin + neckStart);
extLineP2.setAttribute("x2", dimP_X);
extLineP2.setAttribute("y2", totalMargin + neckStart);
extLineP2.setAttribute("stroke", DIMENSION_COLOR);
extLineP2.setAttribute("stroke-width", "1");
extLineP2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineP2);

// Label for P:
const dimTextP = document.createElementNS(svgNS, "text");
dimTextP.setAttribute("x", dimP_X - 5);
dimTextP.setAttribute("y", (totalMargin + (totalMargin + neckStart)) / 2);
dimTextP.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextP.setAttribute("fill", DIMENSION_COLOR);
dimTextP.setAttribute("text-anchor", "end");
dimTextP.setAttribute("alignment-baseline", "middle");
dimTextP.textContent = "P";
svg.appendChild(dimTextP);

// ---------- Dimension Q: Neck Thickness ----------
// Horizontal dimension along the top of the instrument from the start of the main body
// to the right edge. In our side view with neck indentation on the left:
// The main body's left edge is at: x = totalMargin + bodyMinDepth - neckThickness
// and the instrument's right edge is at: x = totalMargin + bodyMinDepth.
// Draw this dimension above the instrument (e.g., at y = totalMargin - 10).
const dimQ_Y = totalMargin - 10;
const dimLineQ = document.createElementNS(svgNS, "line");
dimLineQ.setAttribute("x1", totalMargin + bodyMinDepth - neckThickness);
dimLineQ.setAttribute("y1", dimQ_Y);
dimLineQ.setAttribute("x2", totalMargin + bodyMinDepth);
dimLineQ.setAttribute("y2", dimQ_Y);
dimLineQ.setAttribute("stroke", DIMENSION_COLOR);
dimLineQ.setAttribute("stroke-width", "1");
dimLineQ.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineQ);

// Extension lines for Q:
const extLineQ1 = document.createElementNS(svgNS, "line");
extLineQ1.setAttribute("x1", totalMargin + bodyMinDepth - neckThickness);
extLineQ1.setAttribute("y1", totalMargin);
extLineQ1.setAttribute("x2", totalMargin + bodyMinDepth - neckThickness);
extLineQ1.setAttribute("y2", dimQ_Y);
extLineQ1.setAttribute("stroke", DIMENSION_COLOR);
extLineQ1.setAttribute("stroke-width", "1");
extLineQ1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineQ1);

const extLineQ2 = document.createElementNS(svgNS, "line");
extLineQ2.setAttribute("x1", totalMargin + bodyMinDepth);
extLineQ2.setAttribute("y1", totalMargin);
extLineQ2.setAttribute("x2", totalMargin + bodyMinDepth);
extLineQ2.setAttribute("y2", dimQ_Y);
extLineQ2.setAttribute("stroke", DIMENSION_COLOR);
extLineQ2.setAttribute("stroke-width", "1");
extLineQ2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineQ2);

// Label for Q:
const dimTextQ = document.createElementNS(svgNS, "text");
dimTextQ.setAttribute("x", (totalMargin + bodyMinDepth - neckThickness + totalMargin + bodyMinDepth) / 2);
dimTextQ.setAttribute("y", dimQ_Y - 3);
dimTextQ.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextQ.setAttribute("fill", DIMENSION_COLOR);
dimTextQ.setAttribute("text-anchor", "middle");
dimTextQ.setAttribute("alignment-baseline", "baseline");
dimTextQ.textContent = "Q";
svg.appendChild(dimTextQ);

// ---------- Dimension J: Body Depth ----------
// Horizontal dimension from the instrument's left edge to its right edge.
// Left edge: x = totalMargin, right edge: x = totalMargin + bodyMinDepth.
// Draw this below the instrument (e.g., at y = totalMargin + overallLenMm + 10).
const dimJ_Y = totalMargin + overallLenMm + 10;
const dimLineJ = document.createElementNS(svgNS, "line");
dimLineJ.setAttribute("x1", totalMargin);
dimLineJ.setAttribute("y1", dimJ_Y);
dimLineJ.setAttribute("x2", totalMargin + bodyMinDepth);
dimLineJ.setAttribute("y2", dimJ_Y);
dimLineJ.setAttribute("stroke", DIMENSION_COLOR);
dimLineJ.setAttribute("stroke-width", "1");
dimLineJ.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineJ);

// Extension lines for J:
const extLineJ1 = document.createElementNS(svgNS, "line");
extLineJ1.setAttribute("x1", totalMargin);
extLineJ1.setAttribute("y1", totalMargin + overallLenMm);
extLineJ1.setAttribute("x2", totalMargin);
extLineJ1.setAttribute("y2", dimJ_Y);
extLineJ1.setAttribute("stroke", DIMENSION_COLOR);
extLineJ1.setAttribute("stroke-width", "1");
extLineJ1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineJ1);

const extLineJ2 = document.createElementNS(svgNS, "line");
extLineJ2.setAttribute("x1", totalMargin + bodyMinDepth);
extLineJ2.setAttribute("y1", totalMargin + overallLenMm);
extLineJ2.setAttribute("x2", totalMargin + bodyMinDepth);
extLineJ2.setAttribute("y2", dimJ_Y);
extLineJ2.setAttribute("stroke", DIMENSION_COLOR);
extLineJ2.setAttribute("stroke-width", "1");
extLineJ2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineJ2);

// Label for J:
const dimTextJ = document.createElementNS(svgNS, "text");
dimTextJ.setAttribute("x", (totalMargin + (totalMargin + bodyMinDepth)) / 2);
dimTextJ.setAttribute("y", dimJ_Y + 12);
dimTextJ.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextJ.setAttribute("fill", DIMENSION_COLOR);
dimTextJ.setAttribute("text-anchor", "middle");
dimTextJ.setAttribute("alignment-baseline", "hanging");
dimTextJ.textContent = "J";
svg.appendChild(dimTextJ);

// ---------- Horizontal Dimension over the Bridge (30-35mm) ----------
// (Assumes bridgeRectX, bridgeRectY, bridgeRectWidth, bridgeRectHeight, and totalMargin are defined.)
const bridgeDimLineY = bridgeRectY - 10;  // 10 mm above the bridge rectangle
const dimLineBridgeHoriz = document.createElementNS(svgNS, "line");
dimLineBridgeHoriz.setAttribute("x1", bridgeRectX);
dimLineBridgeHoriz.setAttribute("y1", bridgeDimLineY);
dimLineBridgeHoriz.setAttribute("x2", bridgeRectX + bridgeRectWidth);
dimLineBridgeHoriz.setAttribute("y2", bridgeDimLineY);
dimLineBridgeHoriz.setAttribute("stroke", DIMENSION_COLOR);
dimLineBridgeHoriz.setAttribute("stroke-width", "1");
dimLineBridgeHoriz.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineBridgeHoriz);

// Extension lines for horizontal bridge dimension remain unchanged:
const extLineBridgeHorizTop = document.createElementNS(svgNS, "line");
extLineBridgeHorizTop.setAttribute("x1", bridgeRectX);
extLineBridgeHorizTop.setAttribute("y1", bridgeRectY);
extLineBridgeHorizTop.setAttribute("x2", bridgeRectX);
extLineBridgeHorizTop.setAttribute("y2", bridgeDimLineY);
extLineBridgeHorizTop.setAttribute("stroke", DIMENSION_COLOR);
extLineBridgeHorizTop.setAttribute("stroke-width", "1");
extLineBridgeHorizTop.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineBridgeHorizTop);

const extLineBridgeHorizBottom = document.createElementNS(svgNS, "line");
extLineBridgeHorizBottom.setAttribute("x1", bridgeRectX + bridgeRectWidth);
extLineBridgeHorizBottom.setAttribute("y1", bridgeRectY);
extLineBridgeHorizBottom.setAttribute("x2", bridgeRectX + bridgeRectWidth);
extLineBridgeHorizBottom.setAttribute("y2", bridgeDimLineY);
extLineBridgeHorizBottom.setAttribute("stroke", DIMENSION_COLOR);
extLineBridgeHorizBottom.setAttribute("stroke-width", "1");
extLineBridgeHorizBottom.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineBridgeHorizBottom);

// Label for horizontal bridge dimension: text is now aligned to the right-hand end.
const dimTextBridgeHoriz = document.createElementNS(svgNS, "text");
dimTextBridgeHoriz.setAttribute("x", bridgeRectX + bridgeRectWidth - 5);  // 5 mm left of the right end
dimTextBridgeHoriz.setAttribute("y", bridgeDimLineY - 3);
dimTextBridgeHoriz.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextBridgeHoriz.setAttribute("fill", DIMENSION_COLOR);
dimTextBridgeHoriz.setAttribute("text-anchor", "start");  // right-aligned
dimTextBridgeHoriz.setAttribute("alignment-baseline", "baseline");
dimTextBridgeHoriz.textContent = "30-35mm";
svg.appendChild(dimTextBridgeHoriz);

// ---------- Vertical Dimension over the Bridge (5mm) ----------
// (Vertical dimension line remains unchanged.)
const bridgeDimLineX = bridgeRectX + bridgeRectWidth + 10;
const dimLineBridgeVert = document.createElementNS(svgNS, "line");
dimLineBridgeVert.setAttribute("x1", bridgeDimLineX);
dimLineBridgeVert.setAttribute("y1", bridgeRectY);
dimLineBridgeVert.setAttribute("x2", bridgeDimLineX);
dimLineBridgeVert.setAttribute("y2", bridgeRectY + bridgeRectHeight);
dimLineBridgeVert.setAttribute("stroke", DIMENSION_COLOR);
dimLineBridgeVert.setAttribute("stroke-width", "1");
dimLineBridgeVert.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineBridgeVert);

const extLineBridgeVertLeft = document.createElementNS(svgNS, "line");
extLineBridgeVertLeft.setAttribute("x1", bridgeRectX + bridgeRectWidth);
extLineBridgeVertLeft.setAttribute("y1", bridgeRectY);
extLineBridgeVertLeft.setAttribute("x2", bridgeDimLineX);
extLineBridgeVertLeft.setAttribute("y2", bridgeRectY);
extLineBridgeVertLeft.setAttribute("stroke", DIMENSION_COLOR);
extLineBridgeVertLeft.setAttribute("stroke-width", "1");
extLineBridgeVertLeft.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineBridgeVertLeft);

const extLineBridgeVertRight = document.createElementNS(svgNS, "line");
extLineBridgeVertRight.setAttribute("x1", bridgeRectX + bridgeRectWidth);
extLineBridgeVertRight.setAttribute("y1", bridgeRectY + bridgeRectHeight);
extLineBridgeVertRight.setAttribute("x2", bridgeDimLineX);
extLineBridgeVertRight.setAttribute("y2", bridgeRectY + bridgeRectHeight);
extLineBridgeVertRight.setAttribute("stroke", DIMENSION_COLOR);
extLineBridgeVertRight.setAttribute("stroke-width", "1");
extLineBridgeVertRight.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineBridgeVertRight);

const dimTextBridgeVert = document.createElementNS(svgNS, "text");
dimTextBridgeVert.setAttribute("x", bridgeDimLineX + 5);
dimTextBridgeVert.setAttribute("y", (bridgeRectY + (bridgeRectY + bridgeRectHeight)) / 2);
dimTextBridgeVert.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextBridgeVert.setAttribute("fill", DIMENSION_COLOR);
dimTextBridgeVert.setAttribute("text-anchor", "start");
dimTextBridgeVert.setAttribute("alignment-baseline", "middle");
dimTextBridgeVert.textContent = "5mm";
svg.appendChild(dimTextBridgeVert);

// ---------- Dimension for Soundboard Thickness ----------
// Now, move the soundboard thickness dimension to the bottom of the instrument.
// Draw a horizontal dimension line below the instrument.
// The left panel soundboard was drawn from x = totalMargin - soundboardThickness to x = totalMargin.
// We'll use those endpoints.
const dimSoundboardY = totalMargin + overallLenMm + 25;  // 10 mm below the instrument bottom
const dimLineSoundboard = document.createElementNS(svgNS, "line");
dimLineSoundboard.setAttribute("x1", totalMargin - soundboardThickness);
dimLineSoundboard.setAttribute("y1", dimSoundboardY);
dimLineSoundboard.setAttribute("x2", totalMargin);
dimLineSoundboard.setAttribute("y2", dimSoundboardY);
dimLineSoundboard.setAttribute("stroke", DIMENSION_COLOR);
dimLineSoundboard.setAttribute("stroke-width", "1");
dimLineSoundboard.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineSoundboard);

// Extension lines for soundboard thickness:
const extLineSoundboard1 = document.createElementNS(svgNS, "line");
extLineSoundboard1.setAttribute("x1", totalMargin - soundboardThickness);
extLineSoundboard1.setAttribute("y1", totalMargin + overallLenMm);
extLineSoundboard1.setAttribute("x2", totalMargin - soundboardThickness);
extLineSoundboard1.setAttribute("y2", dimSoundboardY);
extLineSoundboard1.setAttribute("stroke", DIMENSION_COLOR);
extLineSoundboard1.setAttribute("stroke-width", "1");
extLineSoundboard1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineSoundboard1);

const extLineSoundboard2 = document.createElementNS(svgNS, "line");
extLineSoundboard2.setAttribute("x1", totalMargin);
extLineSoundboard2.setAttribute("y1", totalMargin + overallLenMm);
extLineSoundboard2.setAttribute("x2", totalMargin);
extLineSoundboard2.setAttribute("y2", dimSoundboardY);
extLineSoundboard2.setAttribute("stroke", DIMENSION_COLOR);
extLineSoundboard2.setAttribute("stroke-width", "1");
extLineSoundboard2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineSoundboard2);

// Label for soundboard thickness:
const dimTextSoundboard = document.createElementNS(svgNS, "text");
dimTextSoundboard.setAttribute("x", totalMargin - soundboardThickness - 5);
dimTextSoundboard.setAttribute("y", dimSoundboardY + 3);
dimTextSoundboard.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextSoundboard.setAttribute("fill", DIMENSION_COLOR);
dimTextSoundboard.setAttribute("text-anchor", "end");
dimTextSoundboard.setAttribute("alignment-baseline", "middle");
dimTextSoundboard.textContent = "6-7mm 2 PL";
svg.appendChild(dimTextSoundboard);



  
  return svg;
}
