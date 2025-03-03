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
 *     pegStart: 35 / 2,
 *     scaleMm: 330,
 *     pegSpacing: 36,
 *     numStrings: 3,
 *     pegHoleRadius: 3,
 *     gap: 18.6,
 *     // Additional settings (optional):
 *     drawingMargin: 10,  // margin for instrument drawing
 *     extraMargin: 40,    // additional space for dimensions
 *     svgWidthPx: 600,
 *     svgHeightPx: 800,
 *     stringColor: "#ccc"  // Light gray for strings
 *   };
 *
 *   const svgElement = drawTalharpaSVG(myConfig);
 *   document.getElementById('talharpaContainer').appendChild(svgElement);
 */
function drawTalharpaSVG(config) {
  const {
    headstockWidth,
    bodyMinWidth,
    overallLenMm,
    cutOutTop,
    windowWidth,
    windowLength,
    rTopFactor,
    neckStart,
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
    drawingMargin = 10,
    extraMargin = 50,
    svgWidthPx = 700,
    svgHeightPx = 800,
    stringColor = "#ccc"
  } = config;
  
  // Total margin used for positioning the instrument (drawingMargin) plus extra space for dimensions.
  const totalMargin = drawingMargin + extraMargin;

  //DIMENSION CONSTS
  const DIMENSION_COLOR = "red";
  const DIMENSION_OPACITY = "0.5";
  const DIMENSION_FONT_SIZE = "9px";
  
  // Calculate actual corner radii.
  const rTop    = rTopFactor * headstockWidth;
  const rBottom = rBottomFactor * bodyMinWidth;
  const rWindow = rWindowFactor * windowWidth;
  
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  
  // Determine viewBox based on the instrument's size plus totalMargin.
  const maxBodyWidth = Math.max(headstockWidth, bodyMinWidth);
  const viewBoxWidth  = maxBodyWidth + totalMargin * 2;
  const viewBoxHeight = overallLenMm + totalMargin * 2;
  
  svg.setAttribute("width", svgWidthPx.toString());
  svg.setAttribute("height", svgHeightPx.toString());
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  
  // --------------------------------------------------
  // Instrument Drawing (using totalMargin as offset)
  // --------------------------------------------------
  const topY    = totalMargin;
  const bottomY = totalMargin + overallLenMm;
  const topMidX = totalMargin + maxBodyWidth / 2;
  
  const topLeftX     = topMidX - headstockWidth / 2;
  const topRightX    = topMidX + headstockWidth / 2;
  const bottomLeftX  = topMidX - bodyMinWidth / 2;
  const bottomRightX = topMidX + bodyMinWidth / 2;
  
  // Body Outline (Centered Trapezoid)
  const startX = topLeftX + rTop;
  const startY = topY;
  let d = "";
  d += `M ${startX},${startY} `;
  d += `L ${topRightX - rTop},${topY} `;
  d += `A ${rTop} ${rTop} 0 0 1 ${topRightX},${topY + rTop} `;
  d += `L ${bottomRightX},${bottomY - rBottom} `;
  d += `A ${rBottom} ${rBottom} 0 0 1 ${bottomRightX - rBottom},${bottomY} `;
  d += `L ${bottomLeftX + rBottom},${bottomY} `;
  d += `A ${rBottom} ${rBottom} 0 0 1 ${bottomLeftX},${bottomY - rBottom} `;
  d += `L ${topLeftX},${topY + rTop} `;
  d += `A ${rTop} ${rTop} 0 0 1 ${startX},${topY} Z`;
  
  const outlinePath = document.createElementNS(svgNS, "path");
  outlinePath.setAttribute("d", d);
  outlinePath.setAttribute("fill", "none");
  outlinePath.setAttribute("stroke", "black");
  outlinePath.setAttribute("stroke-width", "1");
  svg.appendChild(outlinePath);
  
  // Window Cutout (Rounded Corners)
  const windowX = topMidX - (headstockWidth / 2) + (headstockWidth - windowWidth) / 2;
  const windowY = totalMargin + cutOutTop;
  
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
  
  // Optional Reduction (Dashed Line) inside the window
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
  
  // Bridge
  const bridgeCenterY = totalMargin + pegStart + scaleMm;
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
  
  // Peg Holes
  const pegLineY = totalMargin + pegStart;
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
  
  // Strings from Peg Holes to Bridge Anchors
  const totalBridgeSpanDim = (numStrings - 1) * gap;
  const bridgeTopY = bridgeY; // top edge of the bridge
  const bridgeAnchorStartX = bridgeX + (rawBridgeWidth / 2) - (totalBridgeSpanDim / 2);
  const anchorXPositions = [];
  for (let i = 0; i < numStrings; i++) {
    const anchorX = bridgeAnchorStartX + i * gap;
    anchorXPositions.push(anchorX);
    const stringLine = document.createElementNS(svgNS, "line");
    stringLine.setAttribute("x1", pegHolePositions[i]);
    stringLine.setAttribute("y1", pegLineY);
    stringLine.setAttribute("x2", anchorX);
    stringLine.setAttribute("y2", bridgeTopY);
    stringLine.setAttribute("stroke", stringColor);
    stringLine.setAttribute("stroke-width", "1");
    svg.appendChild(stringLine);
  }
  
  // Tail Piece
  const tailTopWidthVal = gap * numStrings;
  const tailBottomWidth = tailTopWidthVal * 0.7;
  const tailLengthVal = 0.4 * (overallLenMm - scaleMm);
  const tailRadiusVal = 4;
  
  const regionStart = bridgeY + bridgeLength;
  const regionEnd = bottomY;
  const regionSpan = regionEnd - regionStart;
  const verticalOffset = (regionSpan - tailLengthVal) / 2;
  const tailTopY = regionStart + verticalOffset;
  const tailBottomY = tailTopY + tailLengthVal;
  const tailMidX = topMidX;
  
  const tailTopLeftX = tailMidX - (tailTopWidthVal / 2);
  const tailTopRightX = tailMidX + (tailTopWidthVal / 2);
  const tailBottomLeftX = tailMidX - (tailBottomWidth / 2);
  const tailBottomRightX = tailMidX + (tailBottomWidth / 2);
  
  const tailPath = document.createElementNS(svgNS, "path");
  const startTailX = tailTopLeftX + tailRadiusVal;
  const startTailY = tailTopY;
  let dtail = "";
  dtail += `M ${startTailX},${startTailY} `;
  dtail += `L ${tailTopRightX - tailRadiusVal},${tailTopY} `;
  dtail += `A ${tailRadiusVal} ${tailRadiusVal} 0 0 1 ${tailTopRightX},${tailTopY + tailRadiusVal} `;
  dtail += `L ${tailBottomRightX},${tailBottomY - tailRadiusVal} `;
  dtail += `A ${tailRadiusVal} ${tailRadiusVal} 0 0 1 ${tailBottomRightX - tailRadiusVal},${tailBottomY} `;
  dtail += `L ${tailBottomLeftX + tailRadiusVal},${tailBottomY} `;
  dtail += `A ${tailRadiusVal} ${tailRadiusVal} 0 0 1 ${tailBottomLeftX},${tailBottomY - tailRadiusVal} `;
  dtail += `L ${tailTopLeftX},${tailTopY + tailRadiusVal} `;
  dtail += `A ${tailRadiusVal} ${tailRadiusVal} 0 0 1 ${startTailX},${startTailY} Z`;
  
  tailPath.setAttribute("d", dtail);
  tailPath.setAttribute("fill", "none");
  tailPath.setAttribute("stroke", "black");
  tailPath.setAttribute("stroke-width", "1");
  svg.appendChild(tailPath);
  
  // Tail Piece Holes
  const tailHoleLineY = tailTopY + 13;
  const tailHoleRadiusVal = 3;
  const tailHolePositions = [];
  if (numStrings === 1) {
    const cx = (tailTopLeftX + tailTopRightX) / 2;
    tailHolePositions.push(cx);
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", tailHoleLineY);
    circle.setAttribute("r", tailHoleRadiusVal);
    circle.setAttribute("fill", "black");
    svg.appendChild(circle);
  } else {
    const spacing = tailTopWidthVal / (numStrings + 1);
    for (let i = 0; i < numStrings; i++) {
      const cx = tailTopLeftX + spacing * (i + 1);
      tailHolePositions.push(cx);
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", tailHoleLineY);
      circle.setAttribute("r", tailHoleRadiusVal);
      circle.setAttribute("fill", "black");
      svg.appendChild(circle);
    }
  }
  
  // Strings from Bridge to Tail Holes
  for (let i = 0; i < numStrings; i++) {
    const xStart = anchorXPositions[i];
    const yStart = bridgeY; // top of the bridge shape
    const xEnd = tailHolePositions[i];
    const yEnd = tailHoleLineY;
    const tailString = document.createElementNS(svgNS, "line");
    tailString.setAttribute("x1", xStart);
    tailString.setAttribute("y1", yStart);
    tailString.setAttribute("x2", xEnd);
    tailString.setAttribute("y2", yEnd);
    tailString.setAttribute("stroke", "#ccc");
    tailString.setAttribute("stroke-width", "1");
    svg.appendChild(tailString);
  
  }
  
  // Central Circular Hole in Main Body
  let centralHoleDiameter = 50;
  if (scaleMm < 350){
    centralHoleDiameter = 30;
  }
  const centralHoleRadius = centralHoleDiameter / 2;
  const windowBottomY = windowY + windowLength;
  let centralHoleCenterY = (windowBottomY + bridgeY) / 1.85;
  if (scaleMm < 350){
    centralHoleDiameter = 30;
    centralHoleCenterY = (windowBottomY + bridgeY) / 1.9;
  }
  const centralHoleCenterX = topMidX;
  const centralHole = document.createElementNS(svgNS, "circle");
  centralHole.setAttribute("cx", centralHoleCenterX);
  centralHole.setAttribute("cy", centralHoleCenterY);
  centralHole.setAttribute("r", centralHoleRadius);
  centralHole.setAttribute("fill", "none");
  centralHole.setAttribute("stroke", "black");
  centralHole.setAttribute("stroke-width", "1");
  svg.appendChild(centralHole);

  // Calculate the width of the body at the neckStart level.
// (Assuming neckStart is given in mm.)
const widthAtNeck = headstockWidth + (bodyMinWidth - headstockWidth) * (neckStart / overallLenMm);

// Determine the vertical position for the neck line (relative to the overall drawing).
const neckY = totalMargin + neckStart;

// Center the line horizontally: 
// topMidX is defined as margin + (maxBodyWidth/2), where maxBodyWidth = Math.max(headstockWidth, bodyMinWidth)
const leftAtNeck = topMidX - (widthAtNeck / 2);
const rightAtNeck = topMidX + (widthAtNeck / 2);

// Create a horizontal line at the neckStart level.
const neckLine = document.createElementNS(svgNS, "line");
neckLine.setAttribute("x1", leftAtNeck);
neckLine.setAttribute("y1", neckY);
neckLine.setAttribute("x2", rightAtNeck);
neckLine.setAttribute("y2", neckY);
neckLine.setAttribute("stroke", "black");
neckLine.setAttribute("stroke-width", "1");

svg.appendChild(neckLine);

  
  // ==================================================
  // DIMENSIONS
  // ==================================================
  
  
  // Dimension B: Overall Length
  const dimensionBX = extraMargin - 35;
  const dimLineB = document.createElementNS(svgNS, "line");
  dimLineB.setAttribute("x1", dimensionBX);
  dimLineB.setAttribute("y1", topY);
  dimLineB.setAttribute("x2", dimensionBX);
  dimLineB.setAttribute("y2", bottomY);
  dimLineB.setAttribute("stroke", DIMENSION_COLOR);
  dimLineB.setAttribute("stroke-width", "1");
  dimLineB.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineB);
  
  const extLineB1 = document.createElementNS(svgNS, "line");
  extLineB1.setAttribute("x1", topLeftX);
  extLineB1.setAttribute("y1", topY);
  extLineB1.setAttribute("x2", dimensionBX);
  extLineB1.setAttribute("y2", topY);
  extLineB1.setAttribute("stroke", DIMENSION_COLOR);
  extLineB1.setAttribute("stroke-width", "1");
  extLineB1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineB1);
  
  const extLineB2 = document.createElementNS(svgNS, "line");
  extLineB2.setAttribute("x1", bottomLeftX);
  extLineB2.setAttribute("y1", bottomY);
  extLineB2.setAttribute("x2", dimensionBX);
  extLineB2.setAttribute("y2", bottomY);
  extLineB2.setAttribute("stroke", DIMENSION_COLOR);
  extLineB2.setAttribute("stroke-width", "1");
  extLineB2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineB2);
  
  const dimTextB = document.createElementNS(svgNS, "text");
  dimTextB.setAttribute("x", dimensionBX - 5);
  dimTextB.setAttribute("y", (topY + bottomY) / 2);
  dimTextB.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextB.setAttribute("fill", DIMENSION_COLOR);
  dimTextB.setAttribute("text-anchor", "end");
  dimTextB.setAttribute("alignment-baseline", "middle");
  dimTextB.textContent = "B";
  svg.appendChild(dimTextB);
  
  // Dimension A: Peg to Bridge
  const dimensionAX = extraMargin - 20;
  const dimLineA = document.createElementNS(svgNS, "line");
  dimLineA.setAttribute("x1", dimensionAX);
  dimLineA.setAttribute("y1", pegLineY);
  dimLineA.setAttribute("x2", dimensionAX);
  dimLineA.setAttribute("y2", bridgeY);
  dimLineA.setAttribute("stroke", DIMENSION_COLOR);
  dimLineA.setAttribute("stroke-width", "1");
  dimLineA.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineA);
  
  const extLineA1 = document.createElementNS(svgNS, "line");
  extLineA1.setAttribute("x1", topLeftX);
  extLineA1.setAttribute("y1", pegLineY);
  extLineA1.setAttribute("x2", dimensionAX);
  extLineA1.setAttribute("y2", pegLineY);
  extLineA1.setAttribute("stroke", DIMENSION_COLOR);
  extLineA1.setAttribute("stroke-width", "1");
  extLineA1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineA1);
  
  const extLineA2 = document.createElementNS(svgNS, "line");
  extLineA2.setAttribute("x1", topLeftX);
  extLineA2.setAttribute("y1", bridgeY);
  extLineA2.setAttribute("x2", dimensionAX);
  extLineA2.setAttribute("y2", bridgeY);
  extLineA2.setAttribute("stroke", DIMENSION_COLOR);
  extLineA2.setAttribute("stroke-width", "1");
  extLineA2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineA2);
  
  const dimTextA = document.createElementNS(svgNS, "text");
  dimTextA.setAttribute("x", dimensionAX - 5);
  dimTextA.setAttribute("y", (pegLineY + bridgeY) / 2);
  dimTextA.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextA.setAttribute("fill", DIMENSION_COLOR);
  dimTextA.setAttribute("text-anchor", "end");
  dimTextA.setAttribute("alignment-baseline", "middle");
  dimTextA.textContent = "A";
  svg.appendChild(dimTextA);
  
  // Dimension C: Window Length
  const dimensionCX = windowX + windowWidth + 10;
  const dimLineC = document.createElementNS(svgNS, "line");
  dimLineC.setAttribute("x1", dimensionCX);
  dimLineC.setAttribute("y1", windowY);
  dimLineC.setAttribute("x2", dimensionCX);
  dimLineC.setAttribute("y2", windowY + windowLength);
  dimLineC.setAttribute("stroke", DIMENSION_COLOR);
  dimLineC.setAttribute("stroke-width", "1");
  dimLineC.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineC);
  
  const extLineC1 = document.createElementNS(svgNS, "line");
  extLineC1.setAttribute("x1", windowX + windowWidth);
  extLineC1.setAttribute("y1", windowY);
  extLineC1.setAttribute("x2", dimensionCX);
  extLineC1.setAttribute("y2", windowY);
  extLineC1.setAttribute("stroke", DIMENSION_COLOR);
  extLineC1.setAttribute("stroke-width", "1");
  extLineC1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineC1);
  
  const extLineC2 = document.createElementNS(svgNS, "line");
  extLineC2.setAttribute("x1", windowX + windowWidth);
  extLineC2.setAttribute("y1", windowY + windowLength);
  extLineC2.setAttribute("x2", dimensionCX);
  extLineC2.setAttribute("y2", windowY + windowLength);
  extLineC2.setAttribute("stroke", DIMENSION_COLOR);
  extLineC2.setAttribute("stroke-width", "1");
  extLineC2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineC2);
  
  const dimTextC = document.createElementNS(svgNS, "text");
  dimTextC.setAttribute("x", dimensionCX + 5);
  dimTextC.setAttribute("y", (windowY + (windowY + windowLength)) / 2);
  dimTextC.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextC.setAttribute("fill", DIMENSION_COLOR);
  dimTextC.setAttribute("text-anchor", "start");
  dimTextC.setAttribute("alignment-baseline", "middle");
  dimTextC.textContent = "C";
  svg.appendChild(dimTextC);
  
  // Dimension D: Window Width
  const dimensionDY = windowY + windowLength + 10;
  const dimLineD = document.createElementNS(svgNS, "line");
  dimLineD.setAttribute("x1", windowX);
  dimLineD.setAttribute("y1", dimensionDY);
  dimLineD.setAttribute("x2", windowX + windowWidth);
  dimLineD.setAttribute("y2", dimensionDY);
  dimLineD.setAttribute("stroke", DIMENSION_COLOR);
  dimLineD.setAttribute("stroke-width", "1");
  dimLineD.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineD);
  
  const extLineD1 = document.createElementNS(svgNS, "line");
  extLineD1.setAttribute("x1", windowX);
  extLineD1.setAttribute("y1", windowY + windowLength);
  extLineD1.setAttribute("x2", windowX);
  extLineD1.setAttribute("y2", dimensionDY);
  extLineD1.setAttribute("stroke", DIMENSION_COLOR);
  extLineD1.setAttribute("stroke-width", "1");
  extLineD1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineD1);
  
  const extLineD2 = document.createElementNS(svgNS, "line");
  extLineD2.setAttribute("x1", windowX + windowWidth);
  extLineD2.setAttribute("y1", windowY + windowLength);
  extLineD2.setAttribute("x2", windowX + windowWidth);
  extLineD2.setAttribute("y2", dimensionDY);
  extLineD2.setAttribute("stroke", DIMENSION_COLOR);
  extLineD2.setAttribute("stroke-width", "1");
  extLineD2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineD2);
  
  const dimTextD = document.createElementNS(svgNS, "text");
  dimTextD.setAttribute("x", (windowX + windowX + windowWidth) / 2);
  dimTextD.setAttribute("y", dimensionDY + 10);
  dimTextD.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextD.setAttribute("fill", DIMENSION_COLOR);
  dimTextD.setAttribute("text-anchor", "middle");
  dimTextD.setAttribute("alignment-baseline", "hanging");
  dimTextD.textContent = "D";
  svg.appendChild(dimTextD);
  
  // Dimension E: Peg Spacing
  if (numStrings > 1) {
    const dimensionPegY = pegLineY - 30;
    const pegX1 = pegHolePositions[0];
    const pegX2 = pegHolePositions[1];
  
    const dimLineE = document.createElementNS(svgNS, "line");
    dimLineE.setAttribute("x1", pegX1);
    dimLineE.setAttribute("y1", dimensionPegY);
    dimLineE.setAttribute("x2", pegX2);
    dimLineE.setAttribute("y2", dimensionPegY);
    dimLineE.setAttribute("stroke", DIMENSION_COLOR);
    dimLineE.setAttribute("stroke-width", "1");
    dimLineE.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(dimLineE);
  
    const extLineE1 = document.createElementNS(svgNS, "line");
    extLineE1.setAttribute("x1", pegX1);
    extLineE1.setAttribute("y1", pegLineY);
    extLineE1.setAttribute("x2", pegX1);
    extLineE1.setAttribute("y2", dimensionPegY);
    extLineE1.setAttribute("stroke", DIMENSION_COLOR);
    extLineE1.setAttribute("stroke-width", "1");
    extLineE1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extLineE1);
  
    const extLineE2 = document.createElementNS(svgNS, "line");
    extLineE2.setAttribute("x1", pegX2);
    extLineE2.setAttribute("y1", pegLineY);
    extLineE2.setAttribute("x2", pegX2);
    extLineE2.setAttribute("y2", dimensionPegY);
    extLineE2.setAttribute("stroke", DIMENSION_COLOR);
    extLineE2.setAttribute("stroke-width", "1");
    extLineE2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extLineE2);
  
    let labelText = "E";
    if (numStrings > 2) {
      labelText = "E " + (numStrings - 1) + " PL";
    }
  
    const midPegX = (pegX1 + pegX2) / 2;
    const dimTextE = document.createElementNS(svgNS, "text");
    dimTextE.setAttribute("x", midPegX);
    dimTextE.setAttribute("y", dimensionPegY - 3);
    dimTextE.setAttribute("font-size", DIMENSION_FONT_SIZE);
    dimTextE.setAttribute("fill", DIMENSION_COLOR);
    dimTextE.setAttribute("text-anchor", "middle");
    dimTextE.setAttribute("alignment-baseline", "baseline");
    dimTextE.textContent = labelText;
    svg.appendChild(dimTextE);
  }
  
  // Dimension F: Headstock Width
  const dimensionFY_val = topY - 25;
  const dimLineF = document.createElementNS(svgNS, "line");
  dimLineF.setAttribute("x1", topLeftX);
  dimLineF.setAttribute("y1", dimensionFY_val);
  dimLineF.setAttribute("x2", topRightX);
  dimLineF.setAttribute("y2", dimensionFY_val);
  dimLineF.setAttribute("stroke", DIMENSION_COLOR);
  dimLineF.setAttribute("stroke-width", "1");
  dimLineF.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineF);
  
  const extLineF1 = document.createElementNS(svgNS, "line");
  extLineF1.setAttribute("x1", topLeftX);
  extLineF1.setAttribute("y1", topY);
  extLineF1.setAttribute("x2", topLeftX);
  extLineF1.setAttribute("y2", dimensionFY_val);
  extLineF1.setAttribute("stroke", DIMENSION_COLOR);
  extLineF1.setAttribute("stroke-width", "1");
  extLineF1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineF1);
  
  const extLineF2 = document.createElementNS(svgNS, "line");
  extLineF2.setAttribute("x1", topRightX);
  extLineF2.setAttribute("y1", topY);
  extLineF2.setAttribute("x2", topRightX);
  extLineF2.setAttribute("y2", dimensionFY_val);
  extLineF2.setAttribute("stroke", DIMENSION_COLOR);
  extLineF2.setAttribute("stroke-width", "1");
  extLineF2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineF2);
  
  const dimTextF = document.createElementNS(svgNS, "text");
  dimTextF.setAttribute("x", (topLeftX + topRightX) / 2);
  dimTextF.setAttribute("y", dimensionFY_val - 3);
  dimTextF.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextF.setAttribute("fill", DIMENSION_COLOR);
  dimTextF.setAttribute("text-anchor", "middle");
  dimTextF.setAttribute("alignment-baseline", "baseline");
  dimTextF.textContent = "F";
  svg.appendChild(dimTextF);
  
  // Dimension I: Bottom Width (Body Min. Width)
  const dimensionIY_val = bottomY + 15;
  const dimLineI = document.createElementNS(svgNS, "line");
  dimLineI.setAttribute("x1", bottomLeftX);
  dimLineI.setAttribute("y1", dimensionIY_val);
  dimLineI.setAttribute("x2", bottomRightX);
  dimLineI.setAttribute("y2", dimensionIY_val);
  dimLineI.setAttribute("stroke", DIMENSION_COLOR);
  dimLineI.setAttribute("stroke-width", "1");
  dimLineI.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineI);
  
  const extLineI1 = document.createElementNS(svgNS, "line");
  extLineI1.setAttribute("x1", bottomLeftX);
  extLineI1.setAttribute("y1", bottomY);
  extLineI1.setAttribute("x2", bottomLeftX);
  extLineI1.setAttribute("y2", dimensionIY_val);
  extLineI1.setAttribute("stroke", DIMENSION_COLOR);
  extLineI1.setAttribute("stroke-width", "1");
  extLineI1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineI1);
  
  const extLineI2 = document.createElementNS(svgNS, "line");
  extLineI2.setAttribute("x1", bottomRightX);
  extLineI2.setAttribute("y1", bottomY);
  extLineI2.setAttribute("x2", bottomRightX);
  extLineI2.setAttribute("y2", dimensionIY_val);
  extLineI2.setAttribute("stroke", DIMENSION_COLOR);
  extLineI2.setAttribute("stroke-width", "1");
  extLineI2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineI2);
  
  const dimTextI = document.createElementNS(svgNS, "text");
  dimTextI.setAttribute("x", (bottomLeftX + bottomRightX) / 2);
  dimTextI.setAttribute("y", dimensionIY_val + 12);
  dimTextI.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextI.setAttribute("fill", DIMENSION_COLOR);
  dimTextI.setAttribute("text-anchor", "middle");
  dimTextI.setAttribute("alignment-baseline", "hanging");
  dimTextI.textContent = "I";
  svg.appendChild(dimTextI);

 // --------------------------------------------------
// Dimension N: Cutout Top
//   - Measures the vertical distance from the instrument top (topY)
//     to the window top (windowY)
//   - Drawn on the right side, offset 30 mm from the instrument's right edge
// --------------------------------------------------
const dimensionNX = topRightX + 30;  // increased offset: 30 mm to the right of instrument's right edge

// Draw the vertical dimension line for N
const dimLineN = document.createElementNS(svgNS, "line");
dimLineN.setAttribute("x1", dimensionNX);
dimLineN.setAttribute("y1", topY);
dimLineN.setAttribute("x2", dimensionNX);
dimLineN.setAttribute("y2", windowY);
dimLineN.setAttribute("stroke", DIMENSION_COLOR);
dimLineN.setAttribute("stroke-width", "1");
dimLineN.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineN);

// Extension lines for N:
const extLineN1 = document.createElementNS(svgNS, "line");
extLineN1.setAttribute("x1", topRightX);
extLineN1.setAttribute("y1", topY);
extLineN1.setAttribute("x2", dimensionNX);
extLineN1.setAttribute("y2", topY);
extLineN1.setAttribute("stroke", DIMENSION_COLOR);
extLineN1.setAttribute("stroke-width", "1");
extLineN1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineN1);

const extLineN2 = document.createElementNS(svgNS, "line");
extLineN2.setAttribute("x1", topRightX);
extLineN2.setAttribute("y1", windowY);
extLineN2.setAttribute("x2", dimensionNX);
extLineN2.setAttribute("y2", windowY);
extLineN2.setAttribute("stroke", DIMENSION_COLOR);
extLineN2.setAttribute("stroke-width", "1");
extLineN2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineN2);

// Place label "N" in the middle of dimension N:
const dimTextN = document.createElementNS(svgNS, "text");
dimTextN.setAttribute("x", dimensionNX - 5);  // 5 mm left of the dimension line
dimTextN.setAttribute("y", (topY + windowY) / 2);
dimTextN.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextN.setAttribute("fill", DIMENSION_COLOR);
dimTextN.setAttribute("text-anchor", "end");
dimTextN.setAttribute("alignment-baseline", "middle");
dimTextN.textContent = "N";
svg.appendChild(dimTextN);

// --------------------------------------------------
// Dimension O: Top to Soundhole Center
//   - Measures the vertical distance from the instrument top (topY)
//     to the center of the soundhole (centralHoleCenterY)
//   - Drawn on the right side, offset 40 mm from the instrument's right edge
// --------------------------------------------------
const dimensionOX = topRightX + 40;  // increased offset: 40 mm to the right of instrument's right edge

// Draw vertical dimension line for O
const dimLineO = document.createElementNS(svgNS, "line");
dimLineO.setAttribute("x1", dimensionOX);
dimLineO.setAttribute("y1", topY);
dimLineO.setAttribute("x2", dimensionOX);
dimLineO.setAttribute("y2", centralHoleCenterY);
dimLineO.setAttribute("stroke", DIMENSION_COLOR);
dimLineO.setAttribute("stroke-width", "1");
dimLineO.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineO);

// Extension lines for O:
const extLineO1 = document.createElementNS(svgNS, "line");
extLineO1.setAttribute("x1", topRightX);
extLineO1.setAttribute("y1", topY);
extLineO1.setAttribute("x2", dimensionOX);
extLineO1.setAttribute("y2", topY);
extLineO1.setAttribute("stroke", DIMENSION_COLOR);
extLineO1.setAttribute("stroke-width", "1");
extLineO1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineO1);

const extLineO2 = document.createElementNS(svgNS, "line");
extLineO2.setAttribute("x1", topRightX);
extLineO2.setAttribute("y1", centralHoleCenterY);
extLineO2.setAttribute("x2", dimensionOX);
extLineO2.setAttribute("y2", centralHoleCenterY);
extLineO2.setAttribute("stroke", DIMENSION_COLOR);
extLineO2.setAttribute("stroke-width", "1");
extLineO2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineO2);

// Place label "O" in the middle of dimension O:
const dimTextO = document.createElementNS(svgNS, "text");
dimTextO.setAttribute("x", dimensionOX + 5);  // 5 mm right of the dimension line
dimTextO.setAttribute("y", (topY + centralHoleCenterY) / 2);
dimTextO.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextO.setAttribute("fill", DIMENSION_COLOR);
dimTextO.setAttribute("text-anchor", "start");
dimTextO.setAttribute("alignment-baseline", "middle");
dimTextO.textContent = "O";
svg.appendChild(dimTextO);


// ---------- Dimension G: Bridge Width ----------
// Place a horizontal dimension line 10 mm above the bridge
const dimensionGY = bridgeY +25;  
const dimLineG = document.createElementNS(svgNS, "line");
dimLineG.setAttribute("x1", bridgeX);
dimLineG.setAttribute("y1", dimensionGY);
dimLineG.setAttribute("x2", bridgeX + rawBridgeWidth);
dimLineG.setAttribute("y2", dimensionGY);
dimLineG.setAttribute("stroke", DIMENSION_COLOR);
dimLineG.setAttribute("stroke-width", "1");
dimLineG.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineG);

// Extension lines for G:
const extLineG1 = document.createElementNS(svgNS, "line");
extLineG1.setAttribute("x1", bridgeX);
extLineG1.setAttribute("y1", bridgeY);
extLineG1.setAttribute("x2", bridgeX);
extLineG1.setAttribute("y2", dimensionGY);
extLineG1.setAttribute("stroke", DIMENSION_COLOR);
extLineG1.setAttribute("stroke-width", "1");
extLineG1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineG1);

const extLineG2 = document.createElementNS(svgNS, "line");
extLineG2.setAttribute("x1", bridgeX + rawBridgeWidth);
extLineG2.setAttribute("y1", bridgeY);
extLineG2.setAttribute("x2", bridgeX + rawBridgeWidth);
extLineG2.setAttribute("y2", dimensionGY);
extLineG2.setAttribute("stroke", DIMENSION_COLOR);
extLineG2.setAttribute("stroke-width", "1");
extLineG2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineG2);

// Label "G" centered on the dimension line:
const dimTextG = document.createElementNS(svgNS, "text");
dimTextG.setAttribute("x", (bridgeX + (bridgeX + rawBridgeWidth)) / 2);
dimTextG.setAttribute("y", dimensionGY - 3);
dimTextG.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextG.setAttribute("fill", DIMENSION_COLOR);
dimTextG.setAttribute("text-anchor", "middle");
dimTextG.setAttribute("alignment-baseline", "baseline");
dimTextG.textContent = "G";
svg.appendChild(dimTextG);

// ---------- Dimension H: Bridge Spacing ----------
// Assuming at least 2 bridge anchors are in anchorXPositions:
if(numStrings > 1) {
  const dimensionHY = bridgeY - 15;  // 15 mm above the bridge top
  const anchorX1 = anchorXPositions[0];
  const anchorX2 = anchorXPositions[1];
  
  const dimLineH = document.createElementNS(svgNS, "line");
  dimLineH.setAttribute("x1", anchorX1);
  dimLineH.setAttribute("y1", dimensionHY);
  dimLineH.setAttribute("x2", anchorX2);
  dimLineH.setAttribute("y2", dimensionHY);
  dimLineH.setAttribute("stroke", DIMENSION_COLOR);
  dimLineH.setAttribute("stroke-width", "1");
  dimLineH.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineH);
  
  // Extension lines for H:
  const extLineH1 = document.createElementNS(svgNS, "line");
  extLineH1.setAttribute("x1", anchorX1);
  extLineH1.setAttribute("y1", bridgeY);
  extLineH1.setAttribute("x2", anchorX1);
  extLineH1.setAttribute("y2", dimensionHY);
  extLineH1.setAttribute("stroke", DIMENSION_COLOR);
  extLineH1.setAttribute("stroke-width", "1");
  extLineH1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineH1);
  
  const extLineH2 = document.createElementNS(svgNS, "line");
  extLineH2.setAttribute("x1", anchorX2);
  extLineH2.setAttribute("y1", bridgeY);
  extLineH2.setAttribute("x2", anchorX2);
  extLineH2.setAttribute("y2", dimensionHY);
  extLineH2.setAttribute("stroke", DIMENSION_COLOR);
  extLineH2.setAttribute("stroke-width", "1");
  extLineH2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(extLineH2);
  
  // Label "H" centered on this dimension line:
  const dimTextH = document.createElementNS(svgNS, "text");
  dimTextH.setAttribute("x", (anchorX1 + anchorX2) / 2);
  dimTextH.setAttribute("y", dimensionHY - 3);
  dimTextH.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextH.setAttribute("fill", DIMENSION_COLOR);
  dimTextH.setAttribute("text-anchor", "middle");
  dimTextH.setAttribute("alignment-baseline", "baseline");
  dimTextH.textContent = "H";
  svg.appendChild(dimTextH);
}

// ---------- Dimension M: Tail Length ----------
// Vertical dimension from tailTopY to tailBottomY.
// Place dimension line 10 mm to the right of the tail piece (using tailTopRightX + 10).
const dimensionMX = tailTopRightX + 10;
const dimLineM = document.createElementNS(svgNS, "line");
dimLineM.setAttribute("x1", dimensionMX);
dimLineM.setAttribute("y1", tailTopY);
dimLineM.setAttribute("x2", dimensionMX);
dimLineM.setAttribute("y2", tailBottomY);
dimLineM.setAttribute("stroke", DIMENSION_COLOR);
dimLineM.setAttribute("stroke-width", "1");
dimLineM.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineM);

// Extension lines for M:
const extLineM1 = document.createElementNS(svgNS, "line");
extLineM1.setAttribute("x1", tailTopRightX);
extLineM1.setAttribute("y1", tailTopY);
extLineM1.setAttribute("x2", dimensionMX);
extLineM1.setAttribute("y2", tailTopY);
extLineM1.setAttribute("stroke", DIMENSION_COLOR);
extLineM1.setAttribute("stroke-width", "1");
extLineM1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineM1);

const extLineM2 = document.createElementNS(svgNS, "line");
extLineM2.setAttribute("x1", tailBottomRightX);
extLineM2.setAttribute("y1", tailBottomY);
extLineM2.setAttribute("x2", dimensionMX);
extLineM2.setAttribute("y2", tailBottomY);
extLineM2.setAttribute("stroke", DIMENSION_COLOR);
extLineM2.setAttribute("stroke-width", "1");
extLineM2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineM2);

// Label "M":
const dimTextM = document.createElementNS(svgNS, "text");
dimTextM.setAttribute("x", dimensionMX + 5);
dimTextM.setAttribute("y", (tailTopY + tailBottomY) / 2);
dimTextM.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextM.setAttribute("fill", DIMENSION_COLOR);
dimTextM.setAttribute("text-anchor", "start");
dimTextM.setAttribute("alignment-baseline", "middle");
dimTextM.textContent = "M";
svg.appendChild(dimTextM);

// ---------- Dimension K: Tail Top Width ----------
// Horizontal dimension along tail piece top edge, drawn 5 mm above tailTopY.
const dimensionKY = tailTopY - 5;
const dimLineK = document.createElementNS(svgNS, "line");
dimLineK.setAttribute("x1", tailTopLeftX);
dimLineK.setAttribute("y1", dimensionKY);
dimLineK.setAttribute("x2", tailTopRightX);
dimLineK.setAttribute("y2", dimensionKY);
dimLineK.setAttribute("stroke", DIMENSION_COLOR);
dimLineK.setAttribute("stroke-width", "1");
dimLineK.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineK);

// Extension lines for K:
const extLineK1 = document.createElementNS(svgNS, "line");
extLineK1.setAttribute("x1", tailTopLeftX);
extLineK1.setAttribute("y1", tailTopY);
extLineK1.setAttribute("x2", tailTopLeftX);
extLineK1.setAttribute("y2", dimensionKY);
extLineK1.setAttribute("stroke", DIMENSION_COLOR);
extLineK1.setAttribute("stroke-width", "1");
extLineK1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineK1);

const extLineK2 = document.createElementNS(svgNS, "line");
extLineK2.setAttribute("x1", tailTopRightX);
extLineK2.setAttribute("y1", tailTopY);
extLineK2.setAttribute("x2", tailTopRightX);
extLineK2.setAttribute("y2", dimensionKY);
extLineK2.setAttribute("stroke", DIMENSION_COLOR);
extLineK2.setAttribute("stroke-width", "1");
extLineK2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineK2);

// Label "K":
const dimTextK = document.createElementNS(svgNS, "text");
dimTextK.setAttribute("x", (tailTopLeftX + tailTopRightX) / 2);
dimTextK.setAttribute("y", dimensionKY - 3);
dimTextK.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextK.setAttribute("fill", DIMENSION_COLOR);
dimTextK.setAttribute("text-anchor", "middle");
dimTextK.setAttribute("alignment-baseline", "baseline");
dimTextK.textContent = "K";
svg.appendChild(dimTextK);

// ---------- Dimension L: Tail Bottom Width ----------
// Horizontal dimension along tail piece bottom edge, drawn 5 mm below tailBottomY.
const dimensionLY = tailBottomY + 5;
const dimLineL = document.createElementNS(svgNS, "line");
dimLineL.setAttribute("x1", tailBottomLeftX);
dimLineL.setAttribute("y1", dimensionLY);
dimLineL.setAttribute("x2", tailBottomRightX);
dimLineL.setAttribute("y2", dimensionLY);
dimLineL.setAttribute("stroke", DIMENSION_COLOR);
dimLineL.setAttribute("stroke-width", "1");
dimLineL.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(dimLineL);

// Extension lines for L:
const extLineL1 = document.createElementNS(svgNS, "line");
extLineL1.setAttribute("x1", tailBottomLeftX);
extLineL1.setAttribute("y1", tailBottomY);
extLineL1.setAttribute("x2", tailBottomLeftX);
extLineL1.setAttribute("y2", dimensionLY);
extLineL1.setAttribute("stroke", DIMENSION_COLOR);
extLineL1.setAttribute("stroke-width", "1");
extLineL1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineL1);

const extLineL2 = document.createElementNS(svgNS, "line");
extLineL2.setAttribute("x1", tailBottomRightX);
extLineL2.setAttribute("y1", tailBottomY);
extLineL2.setAttribute("x2", tailBottomRightX);
extLineL2.setAttribute("y2", dimensionLY);
extLineL2.setAttribute("stroke", DIMENSION_COLOR);
extLineL2.setAttribute("stroke-width", "1");
extLineL2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
svg.appendChild(extLineL2);

// Label "L":
const dimTextL = document.createElementNS(svgNS, "text");
dimTextL.setAttribute("x", (tailBottomLeftX + tailBottomRightX) / 2);
dimTextL.setAttribute("y", dimensionLY + 12);
dimTextL.setAttribute("font-size", DIMENSION_FONT_SIZE);
dimTextL.setAttribute("fill", DIMENSION_COLOR);
dimTextL.setAttribute("text-anchor", "middle");
dimTextL.setAttribute("alignment-baseline", "hanging");
dimTextL.textContent = "L";
svg.appendChild(dimTextL);

return svg;

  
  return svg;
}
