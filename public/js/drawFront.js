/**
 * drawTalharpaSVG
 * Creates an SVG element representing the Talharpa technical drawing,
 * based on the provided config object. Returns the SVG element.
 *
 * Usage example:
 *   const myConfig = {
 *     headstockWidth: 158,
 *     bodyMinWidth: 166,
 *     overallLenMm: 547.8,
 *     cutOutTop: 35,
 *     windowWidth: 108,
 *     windowLength: 185,
 *     rTopFactor: 0.08,
 *     rBottomFactor: 0.2,
 *     rWindowFactor: 0.08,
 *     rawBridgeWidth: 60,
 *     bridgeLength: 5,
 *     pegStart: 35 / 2, // for example
 *     scaleMm: 330,
 *     pegSpacing: 36,
 *     numStrings: 3,
 *     pegHoleRadius: 3,
 *     gap: 18.6,
 *     // Additional settings (optional):
 *     margin: 10,
 *     svgWidthPx: 600,
 *     svgHeightPx: 600,
 *     stringColor: "#ccc"  // Light gray
 *   };
 *
 *   const svgElement = drawTalharpaSVG(myConfig);
 *   document.getElementById('talharpaContainer').appendChild(svgElement);
 */
function drawTalharpaSVG(config) {
  const {
    // Required geometry for the body
    headstockWidth,
    bodyMinWidth,
    overallLenMm,
    cutOutTop,
    windowWidth,
    windowLength,

    // Factors to calculate corner radii
    rTopFactor,
    rBottomFactor,
    rWindowFactor,

    // Bridge info
    rawBridgeWidth,
    bridgeLength,
    pegStart,
    scaleMm,

    // Peg holes and strings
    pegSpacing,
    numStrings,
    pegHoleRadius,
    gap,

    // Optional settings with defaults
    margin = 10,
    svgWidthPx = 400,
    svgHeightPx = 800,
    stringColor = "#ccc"  // default: light gray
  } = config;

  // --------------------------------------------------
  // 1) Calculate key values
  // --------------------------------------------------
  const rTop = rTopFactor * headstockWidth;
  const rBottom = rBottomFactor * bodyMinWidth;
  const rWindow = rWindowFactor * windowWidth;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  // Determine viewBox for center alignment
  const maxBodyWidth = Math.max(headstockWidth, bodyMinWidth);
  const viewBoxWidth = maxBodyWidth + margin * 2;
  const viewBoxHeight = overallLenMm + margin * 2;

  svg.setAttribute("width", svgWidthPx.toString());
  svg.setAttribute("height", svgHeightPx.toString());
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

  // --------------------------------------------------
  // 2) Body Outline (Centered Trapezoid)
  // --------------------------------------------------
  const topMidX = margin + maxBodyWidth / 2;
  const topY = margin;
  const bottomY = margin + overallLenMm;

  // top edge
  const topLeftX = topMidX - headstockWidth / 2;
  const topRightX = topMidX + headstockWidth / 2;

  // bottom edge
  const bottomLeftX = topMidX - bodyMinWidth / 2;
  const bottomRightX = topMidX + bodyMinWidth / 2;

  // Build path
  const startX = topLeftX + rTop;
  const startY = topY;
  let d = "";
  d += `M ${startX},${startY}`;
  d += ` L ${topRightX - rTop},${topY}`;
  d += ` A ${rTop} ${rTop} 0 0 1 ${topRightX},${topY + rTop}`;
  d += ` L ${bottomRightX},${bottomY - rBottom}`;
  d += ` A ${rBottom} ${rBottom} 0 0 1 ${bottomRightX - rBottom},${bottomY}`;
  d += ` L ${bottomLeftX + rBottom},${bottomY}`;
  d += ` A ${rBottom} ${rBottom} 0 0 1 ${bottomLeftX},${bottomY - rBottom}`;
  d += ` L ${topLeftX},${topY + rTop}`;
  d += ` A ${rTop} ${rTop} 0 0 1 ${startX},${startY}`;
  d += " Z";

  const outlinePath = document.createElementNS(svgNS, "path");
  outlinePath.setAttribute("d", d);
  outlinePath.setAttribute("fill", "none");
  outlinePath.setAttribute("stroke", "black");
  outlinePath.setAttribute("stroke-width", "1");
  svg.appendChild(outlinePath);

  // --------------------------------------------------
  // 3) Window Cutout (Rounded Corners)
  // --------------------------------------------------
  const windowX = topMidX - (headstockWidth / 2) + (headstockWidth - windowWidth) / 2;
  const windowY = margin + cutOutTop;

  const windowRect = document.createElementNS(svgNS, "rect");
  windowRect.setAttribute("x", windowX);
  windowRect.setAttribute("y", windowY);
  windowRect.setAttribute("width", windowWidth);
  windowRect.setAttribute("height", windowLength);
  windowRect.setAttribute("rx", rWindow);
  windowRect.setAttribute("ry", rWindow);
  windowRect.setAttribute("fill", "none");
  windowRect.setAttribute("stroke", "black");
  windowRect.setAttribute("stroke-width", "1");
  svg.appendChild(windowRect);

  // --------------------------------------------------
  // 4) Optional Reduction (Dashed Line)
  // --------------------------------------------------
  const dashedLineX = windowX + windowWidth - 36;
  const dashedLine = document.createElementNS(svgNS, "line");
  dashedLine.setAttribute("x1", dashedLineX);
  dashedLine.setAttribute("x2", dashedLineX);
  dashedLine.setAttribute("y1", windowY);
  dashedLine.setAttribute("y2", windowY + windowLength);
  dashedLine.setAttribute("stroke", "black");
  dashedLine.setAttribute("stroke-width", "1");
  dashedLine.setAttribute("stroke-dasharray", "4,4");
  svg.appendChild(dashedLine);

  // --------------------------------------------------
  // 5) Bridge
  // --------------------------------------------------
  const bridgeCenterY = margin + pegStart + scaleMm;
  const bridgeX = topMidX - (headstockWidth / 2) + (headstockWidth - rawBridgeWidth) / 2;
  const bridgeY = bridgeCenterY - (bridgeLength / 2);

  const bridgeRect = document.createElementNS(svgNS, "rect");
  bridgeRect.setAttribute("x", bridgeX);
  bridgeRect.setAttribute("y", bridgeY);
  bridgeRect.setAttribute("width", rawBridgeWidth);
  bridgeRect.setAttribute("height", bridgeLength);
  bridgeRect.setAttribute("fill", "none");
  bridgeRect.setAttribute("stroke", "black");
  bridgeRect.setAttribute("stroke-width", "1");
  svg.appendChild(bridgeRect);

  // --------------------------------------------------
  // 6) Peg Holes
  // --------------------------------------------------
  const pegLineY = margin + pegStart;
  const totalPegSpan = (numStrings - 1) * pegSpacing;
  const pegStartXPos = topMidX - (headstockWidth / 2) + (headstockWidth / 2) - (totalPegSpan / 2);

  const pegHolePositions = [];
  for (let i = 0; i < numStrings; i++) {
    const cx = pegStartXPos + i * pegSpacing;
    pegHolePositions.push(cx);

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", pegLineY);
    circle.setAttribute("r", pegHoleRadius);
    circle.setAttribute("fill", "black");
    svg.appendChild(circle);
  }

  // --------------------------------------------------
  // 7) Strings (Light Gray by default) – Compute and store bridge anchor positions
  // --------------------------------------------------
  const totalBridgeSpan = (numStrings - 1) * gap;
  const bridgeTopY = bridgeY; // top edge of the bridge
  const bridgeAnchorStartX = bridgeX + (rawBridgeWidth / 2) - (totalBridgeSpan / 2);
  const anchorXPositions = [];
  for (let i = 0; i < numStrings; i++) {
    const anchorX = bridgeAnchorStartX + i * gap;
    anchorXPositions.push(anchorX);
    // (Optional: draw upper string segments if needed)
    const stringLine = document.createElementNS(svgNS, "line");
    stringLine.setAttribute("x1", pegHolePositions[i]);
    stringLine.setAttribute("y1", pegLineY);
    stringLine.setAttribute("x2", anchorX);
    stringLine.setAttribute("y2", bridgeTopY);
    stringLine.setAttribute("stroke", stringColor);
    stringLine.setAttribute("stroke-width", "1");
    svg.appendChild(stringLine);
  }

  // --------------------------------------------------
  // 8) Tail Piece
  //   - top width = gap * numStrings
  //   - bottom width = topWidth * 0.7
  //   - length = 0.4 * (overallLenMm - scaleMm)
  //   - corner radius = 4
  //   - vertically centered between the bottom of the bridge and the instrument bottom
  // --------------------------------------------------
  const tailTopWidth = gap * numStrings;
  const tailBottomWidth = tailTopWidth * 0.7;
  const tailLength = 0.4 * (overallLenMm - scaleMm);
  const tailRadius = 4;

  // Region from bottom of the bridge to bottom of instrument:
  const regionStart = bridgeY + bridgeLength; // bottom of bridge
  const regionEnd = bottomY;                  // bottom of instrument
  const regionSpan = regionEnd - regionStart;
  // Center the tail piece in this region:
  const verticalOffset = (regionSpan - tailLength) / 2;
  const tailTopY = regionStart + verticalOffset;
  const tailBottomY = tailTopY + tailLength;
  const tailMidX = topMidX; // use the same horizontal center as the body

  // x–coordinates for the tail piece edges:
  const tailTopLeftX = tailMidX - (tailTopWidth / 2);
  const tailTopRightX = tailMidX + (tailTopWidth / 2);
  const tailBottomLeftX = tailMidX - (tailBottomWidth / 2);
  const tailBottomRightX = tailMidX + (tailBottomWidth / 2);

  // Build the tail piece trapezoid path:
  const tailPath = document.createElementNS(svgNS, "path");
  const startTailX = tailTopLeftX + tailRadius;
  const startTailY = tailTopY;

  let dtail = "";
  dtail += `M ${startTailX},${startTailY}`;                     // Move to start near top-left
  dtail += ` L ${tailTopRightX - tailRadius},${tailTopY}`;        // Top edge
  dtail += ` A ${tailRadius} ${tailRadius} 0 0 1 ${tailTopRightX},${tailTopY + tailRadius}`;  // Arc top-right
  dtail += ` L ${tailBottomRightX},${tailBottomY - tailRadius}`;   // Right edge
  dtail += ` A ${tailRadius} ${tailRadius} 0 0 1 ${tailBottomRightX - tailRadius},${tailBottomY}`; // Arc bottom-right
  dtail += ` L ${tailBottomLeftX + tailRadius},${tailBottomY}`;    // Bottom edge
  dtail += ` A ${tailRadius} ${tailRadius} 0 0 1 ${tailBottomLeftX},${tailBottomY - tailRadius}`; // Arc bottom-left
  dtail += ` L ${tailTopLeftX},${tailTopY + tailRadius}`;          // Left edge
  dtail += ` A ${tailRadius} ${tailRadius} 0 0 1 ${startTailX},${startTailY}`; // Arc top-left
  dtail += " Z";

  tailPath.setAttribute("d", dtail);
  tailPath.setAttribute("fill", "none");
  tailPath.setAttribute("stroke", "black");
  tailPath.setAttribute("stroke-width", "1");
  svg.appendChild(tailPath);

  // --------------------------------------------------
  // 9) Tail Piece Holes
  //    - 13 mm down from the top of the tail piece
  //    - 1 hole per string, equally spaced and CENTERED across tailTopWidth
  // --------------------------------------------------
  const tailHoleLineY = tailTopY + 13; // 13 mm below tail piece top
  const tailHoleRadius = 3;          // hole radius
  const tailHolePositions = [];

  if (numStrings === 1) {
    const cx = (tailTopLeftX + tailTopRightX) / 2;
    tailHolePositions.push(cx);
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", tailHoleLineY);
    circle.setAttribute("r", tailHoleRadius);
    circle.setAttribute("fill", "black");
    svg.appendChild(circle);
  } else {
    // Compute spacing so that the holes are centered:
    const spacing = tailTopWidth / (numStrings + 1);
    for (let i = 0; i < numStrings; i++) {
      const cx = tailTopLeftX + spacing * (i + 1);
      tailHolePositions.push(cx);
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", tailHoleLineY);
      circle.setAttribute("r", tailHoleRadius);
      circle.setAttribute("fill", "black");
      svg.appendChild(circle);
    }
  }

  // --------------------------------------------------
  // 10) Continue Strings from Bridge to Tail Holes
  //     - Each string line now starts at the TOP of the bridge shape (bridgeY)
  //       and ends at the center of the corresponding tail piece hole.
  // --------------------------------------------------
  for (let i = 0; i < numStrings; i++) {
    const xStart = anchorXPositions[i];  // previously computed bridge anchor X position
    const yStart = bridgeY;              // now the top of the bridge shape
    const xEnd = tailHolePositions[i]; // tail piece hole X position
    const yEnd = tailHoleLineY;        // tail piece hole Y position

    const tailString = document.createElementNS(svgNS, "line");
    tailString.setAttribute("x1", xStart);
    tailString.setAttribute("y1", yStart);
    tailString.setAttribute("x2", xEnd);
    tailString.setAttribute("y2", yEnd);
    tailString.setAttribute("stroke", "#ccc");  // light gray
    tailString.setAttribute("stroke-width", "1");
    svg.appendChild(tailString);
  }


  // --------------------------------------------------
  // 11) Central Circular Hole in Main Body
  //    - Diameter = 50 mm (radius = 25 mm)
  //    - Horizontally centered (centerX = topMidX)
  //    - Vertically centered between the bottom of the window and the top of the bridge
  // --------------------------------------------------

  // Assume these variables are available from earlier:
  //   windowY = margin + cutOutTop
  //   windowLength, so bottom of window = windowY + windowLength
  //   bridgeY is the top of the bridge rectangle (computed earlier)
  //   topMidX is the horizontal center of the body

  const centralHoleDiameter = 50;
  const centralHoleRadius = centralHoleDiameter / 2;
  const windowBottomY = windowY + windowLength; // bottom edge of the window
  const centralHoleCenterY = (windowBottomY + bridgeY) / 2;  // average between window bottom and bridge top
  const centralHoleCenterX = topMidX;  // center horizontally

  const centralHole = document.createElementNS(svgNS, "circle");
  centralHole.setAttribute("cx", centralHoleCenterX);
  centralHole.setAttribute("cy", centralHoleCenterY);
  centralHole.setAttribute("r", centralHoleRadius);
  centralHole.setAttribute("fill", "none");
  centralHole.setAttribute("stroke", "black");
  centralHole.setAttribute("stroke-width", "1");
  svg.appendChild(centralHole);





  // DIMENSIONS

  // --------------------------------------------------
// Dimension Styling Constants
// --------------------------------------------------
const DIMENSION_COLOR = "blue";   // faded green
const DIMENSION_OPACITY = "0.5";     // 50% opacity
const DIMENSION_FONT_SIZE = "6px";  // small font

// --------------------------------------------------
// Dimension "B": Overall Length (Faded Green)
// --------------------------------------------------

// Assume these variables are available from earlier in the drawing:
//   margin, overallLenMm, topY, bottomY, topLeftX
//   (topY is the instrument's top, bottomY is margin + overallLenMm)

const dimensionX = margin - 35;  // 35 mm left of the margin

// Draw the vertical dimension line
const dimLine = document.createElementNS(svgNS, "line");
dimLine.setAttribute("x1", dimensionX);
dimLine.setAttribute("y1", topY);
dimLine.setAttribute("x2", dimensionX);
dimLine.setAttribute("y2", bottomY);
dimLine.setAttribute("stroke", DIMENSION_COLOR);
dimLine.setAttribute("stroke-width", "1");
dimLine.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLine);

// Draw the extension line at the top
const extLineTop = document.createElementNS(svgNS, "line");
extLineTop.setAttribute("x1", topLeftX);
extLineTop.setAttribute("y1", topY);
extLineTop.setAttribute("x2", dimensionX);
extLineTop.setAttribute("y2", topY);
extLineTop.setAttribute("stroke", DIMENSION_COLOR);
extLineTop.setAttribute("stroke-width", "1");
extLineTop.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineTop);

// Draw the extension line at the bottom
const extLineBottom = document.createElementNS(svgNS, "line");
extLineBottom.setAttribute("x1", bottomLeftX);
extLineBottom.setAttribute("y1", bottomY);
extLineBottom.setAttribute("x2", dimensionX);
extLineBottom.setAttribute("y2", bottomY);
extLineBottom.setAttribute("stroke", DIMENSION_COLOR);
extLineBottom.setAttribute("stroke-width", "1");
extLineBottom.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineBottom);

// Place the dimension label "B" in the middle of the dimension line.
const dimText = document.createElementNS(svgNS, "text");
dimText.setAttribute("x", dimensionX - 5);  // 5 mm left of the dimension line
dimText.setAttribute("y", (topY + bottomY) / 2);
dimText.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimText.setAttribute("fill", DIMENSION_COLOR);
dimText.setAttribute("text-anchor", "end");
dimText.setAttribute("alignment-baseline", "middle");
dimText.textContent = "B";
svg.appendChild(dimText);

// -------------------------------
// Dimension A: Peg to Bridge
// -------------------------------
// (Vertical dimension from peg line to the top of the bridge)
// pegLineY is defined as: margin + pegStart
// bridgeY is the top edge of the bridge (computed earlier)
const dimensionAX = margin - 20;  // Position the A-dimension line 20 mm to the left of margin

// Draw vertical dimension line for A
const dimLineA = document.createElementNS(svgNS, "line");
dimLineA.setAttribute("x1", dimensionAX);
dimLineA.setAttribute("y1", pegLineY);
dimLineA.setAttribute("x2", dimensionAX);
dimLineA.setAttribute("y2", bridgeY);
dimLineA.setAttribute("stroke", DIMENSION_COLOR);
dimLineA.setAttribute("stroke-width", "1");
dimLineA.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineA);

// Draw extension lines from the instrument to the dimension line
// Extension at peg line (from left edge at peg line)
const extLineA1 = document.createElementNS(svgNS, "line");
extLineA1.setAttribute("x1", topLeftX);  // left edge of instrument at peg line level
extLineA1.setAttribute("y1", pegLineY);
extLineA1.setAttribute("x2", dimensionAX);
extLineA1.setAttribute("y2", pegLineY);
extLineA1.setAttribute("stroke", DIMENSION_COLOR);
extLineA1.setAttribute("stroke-width", "1");
extLineA1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineA1);

// Extension at the top of the bridge
const extLineA2 = document.createElementNS(svgNS, "line");
extLineA2.setAttribute("x1", topLeftX);  // assuming same left edge used
extLineA2.setAttribute("y1", bridgeY);
extLineA2.setAttribute("x2", dimensionAX);
extLineA2.setAttribute("y2", bridgeY);
extLineA2.setAttribute("stroke", DIMENSION_COLOR);
extLineA2.setAttribute("stroke-width", "1");
extLineA2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineA2);

// Place the dimension label "A" in the middle of the A-dimension line
const dimTextA = document.createElementNS(svgNS, "text");
dimTextA.setAttribute("x", dimensionAX - 5);  // offset 5 mm left of the dimension line
dimTextA.setAttribute("y", (pegLineY + bridgeY) / 2);
dimTextA.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextA.setAttribute("fill", DIMENSION_COLOR);
dimTextA.setAttribute("text-anchor", "end");
dimTextA.setAttribute("alignment-baseline", "middle");
dimTextA.textContent = "A";
svg.appendChild(dimTextA);

// -------------------------------
// Dimension C: Window Length
// -------------------------------
// (Vertical dimension along the window)
// windowY is the top of the window; windowY + windowLength is its bottom.
const dimensionCX = windowX + windowWidth + 10; // 10 mm to the right of the window

// Draw vertical dimension line for C
const dimLineC = document.createElementNS(svgNS, "line");
dimLineC.setAttribute("x1", dimensionCX);
dimLineC.setAttribute("y1", windowY);
dimLineC.setAttribute("x2", dimensionCX);
dimLineC.setAttribute("y2", windowY + windowLength);
dimLineC.setAttribute("stroke", DIMENSION_COLOR);
dimLineC.setAttribute("stroke-width", "1");
dimLineC.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineC);

// Extension line at the top of the window (now starting from the right edge)
const extLineC1 = document.createElementNS(svgNS, "line");
extLineC1.setAttribute("x1", windowX + windowWidth);
extLineC1.setAttribute("y1", windowY);
extLineC1.setAttribute("x2", dimensionCX);
extLineC1.setAttribute("y2", windowY);
extLineC1.setAttribute("stroke", DIMENSION_COLOR);
extLineC1.setAttribute("stroke-width", "1");
extLineC1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineC1);

// Extension line at the bottom of the window
const extLineC2 = document.createElementNS(svgNS, "line");
extLineC2.setAttribute("x1", windowX + windowWidth);
extLineC2.setAttribute("y1", windowY + windowLength);
extLineC2.setAttribute("x2", dimensionCX);
extLineC2.setAttribute("y2", windowY + windowLength);
extLineC2.setAttribute("stroke", DIMENSION_COLOR);
extLineC2.setAttribute("stroke-width", "1");
extLineC2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineC2);

// Label "C" for window length
const dimTextC = document.createElementNS(svgNS, "text");
dimTextC.setAttribute("x", dimensionCX + 5);  // 5 mm right of the dimension line
dimTextC.setAttribute("y", (windowY + (windowY + windowLength)) / 2);
dimTextC.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextC.setAttribute("fill", DIMENSION_COLOR);
dimTextC.setAttribute("text-anchor", "start");
dimTextC.setAttribute("alignment-baseline", "middle");
dimTextC.textContent = "C";
svg.appendChild(dimTextC);


// -------------------------------
// Dimension D: Window Width
// -------------------------------
// (Horizontal dimension along the window)
// windowX is the left edge; windowX + windowWidth is the right edge.
const dimensionDY = windowY + windowLength + 10; // 10 mm below the window

// Draw horizontal dimension line for D
const dimLineD = document.createElementNS(svgNS, "line");
dimLineD.setAttribute("x1", windowX);
dimLineD.setAttribute("y1", dimensionDY);
dimLineD.setAttribute("x2", windowX + windowWidth);
dimLineD.setAttribute("y2", dimensionDY);
dimLineD.setAttribute("stroke", DIMENSION_COLOR);
dimLineD.setAttribute("stroke-width", "1");
dimLineD.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineD);

// Extension line at the left edge of the window
const extLineD1 = document.createElementNS(svgNS, "line");
extLineD1.setAttribute("x1", windowX);
extLineD1.setAttribute("y1", windowY + windowLength);
extLineD1.setAttribute("x2", windowX);
extLineD1.setAttribute("y2", dimensionDY);
extLineD1.setAttribute("stroke", DIMENSION_COLOR);
extLineD1.setAttribute("stroke-width", "1");
extLineD1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineD1);

// Extension line at the right edge of the window
const extLineD2 = document.createElementNS(svgNS, "line");
extLineD2.setAttribute("x1", windowX + windowWidth);
extLineD2.setAttribute("y1", windowY + windowLength);
extLineD2.setAttribute("x2", windowX + windowWidth);
extLineD2.setAttribute("y2", dimensionDY);
extLineD2.setAttribute("stroke", DIMENSION_COLOR);
extLineD2.setAttribute("stroke-width", "1");
extLineD2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineD2);

// Label "D" for window width, centered horizontally along the dimension line.
const dimTextD = document.createElementNS(svgNS, "text");
dimTextD.setAttribute("x", (windowX + windowX + windowWidth) / 2);
dimTextD.setAttribute("y", dimensionDY + 10);  // offset 10 mm below the line
dimTextD.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextD.setAttribute("fill", DIMENSION_COLOR);
dimTextD.setAttribute("text-anchor", "middle");
dimTextD.setAttribute("alignment-baseline", "hanging");
dimTextD.textContent = "D";
svg.appendChild(dimTextD);



// --------------------------------------------------
//  X) Peg Spacing Dimension (Dimension "E")
//     - Displays the horizontal spacing between the first two peg holes
//     - Placed 30 mm above the peg holes
// --------------------------------------------------
if (numStrings > 1) {
  // Vertical position for the dimension line, 30 mm above the peg holes
  const dimensionPegY = pegLineY -3;

  // Use the first two peg holes as endpoints:
  const pegX1 = pegHolePositions[0];
  const pegX2 = pegHolePositions[1];

  // Draw the horizontal dimension line for peg spacing
  const dimLineE = document.createElementNS(svgNS, "line");
  dimLineE.setAttribute("x1", pegX1);
  dimLineE.setAttribute("y1", dimensionPegY);
  dimLineE.setAttribute("x2", pegX2);
  dimLineE.setAttribute("y2", dimensionPegY);
  dimLineE.setAttribute("stroke", DIMENSION_COLOR);
  dimLineE.setAttribute("stroke-width", "1");
  dimLineE.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineE);

  // Draw extension line from the first peg hole up to the dimension line
  const extLineE1 = document.createElementNS(svgNS, "line");
  extLineE1.setAttribute("x1", pegX1);
  extLineE1.setAttribute("y1", pegLineY);
  extLineE1.setAttribute("x2", pegX1);
  extLineE1.setAttribute("y2", dimensionPegY);
  extLineE1.setAttribute("stroke", DIMENSION_COLOR);
  extLineE1.setAttribute("stroke-width", "1");
  extLineE1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineE1);

  // Draw extension line from the second peg hole up to the dimension line
  const extLineE2 = document.createElementNS(svgNS, "line");
  extLineE2.setAttribute("x1", pegX2);
  extLineE2.setAttribute("y1", pegLineY);
  extLineE2.setAttribute("x2", pegX2);
  extLineE2.setAttribute("y2", dimensionPegY);
  extLineE2.setAttribute("stroke", DIMENSION_COLOR);
  extLineE2.setAttribute("stroke-width", "1");
  extLineE2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineE2);

  // Determine the label text: if more than 2 strings, show "E [numStrings-1] PL", else just "E"
  let labelText = "E";
  if (numStrings > 2) {
    labelText = "E " + (numStrings - 1) + " PL";
  }

  // Place the dimension label in the middle of the dimension line, slightly above the line.
  const midPegX = (pegX1 + pegX2) / 2;
  const dimTextE = document.createElementNS(svgNS, "text");
  dimTextE.setAttribute("x", midPegX);
  dimTextE.setAttribute("y", dimensionPegY - 3); // 3 mm above the dimension line
  dimTextE.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextE.setAttribute("fill", DIMENSION_COLOR);
  dimTextE.setAttribute("text-anchor", "middle");
  dimTextE.setAttribute("alignment-baseline", "baseline");
  dimTextE.textContent = labelText;
  svg.appendChild(dimTextE);
}


  // Return the completed SVG
  return svg;
}