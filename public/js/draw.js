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
    svgWidthPx = 600,
    svgHeightPx = 600,
    stringColor = "#ccc"  // default: light gray
  } = config;

  // --------------------------------------------------
  // 1) Calculate key values
  // --------------------------------------------------
  const rTop    = rTopFactor    * headstockWidth;
  const rBottom = rBottomFactor * bodyMinWidth;
  const rWindow = rWindowFactor * windowWidth;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  // Determine viewBox for center alignment
  const maxBodyWidth  = Math.max(headstockWidth, bodyMinWidth);
  const viewBoxWidth  = maxBodyWidth + margin * 2;
  const viewBoxHeight = overallLenMm + margin * 2;

  svg.setAttribute("width",  svgWidthPx.toString());
  svg.setAttribute("height", svgHeightPx.toString());
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

  // --------------------------------------------------
  // 2) Body Outline (Centered Trapezoid)
  // --------------------------------------------------
  const topMidX = margin + maxBodyWidth / 2;
  const topY    = margin;
  const bottomY = margin + overallLenMm;

  // top edge
  const topLeftX  = topMidX - headstockWidth / 2;
  const topRightX = topMidX + headstockWidth / 2;

  // bottom edge
  const bottomLeftX  = topMidX - bodyMinWidth / 2;
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
const tailTopWidth    = gap * numStrings;
const tailBottomWidth = tailTopWidth * 0.7;
const tailLength      = 0.4 * (overallLenMm - scaleMm);
const tailRadius      = 4;

// Region from bottom of the bridge to bottom of instrument:
const regionStart = bridgeY + bridgeLength; // bottom of bridge
const regionEnd   = bottomY;                  // bottom of instrument
const regionSpan  = regionEnd - regionStart;
// Center the tail piece in this region:
const verticalOffset = (regionSpan - tailLength) / 2;
const tailTopY = regionStart + verticalOffset;
const tailBottomY = tailTopY + tailLength;
const tailMidX = topMidX; // use the same horizontal center as the body

// x–coordinates for the tail piece edges:
const tailTopLeftX  = tailMidX - (tailTopWidth / 2);
const tailTopRightX = tailMidX + (tailTopWidth / 2);
const tailBottomLeftX  = tailMidX - (tailBottomWidth / 2);
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
  const xEnd   = tailHolePositions[i]; // tail piece hole X position
  const yEnd   = tailHoleLineY;        // tail piece hole Y position
  
  const tailString = document.createElementNS(svgNS, "line");
  tailString.setAttribute("x1", xStart);
  tailString.setAttribute("y1", yStart);
  tailString.setAttribute("x2", xEnd);
  tailString.setAttribute("y2", yEnd);
  tailString.setAttribute("stroke", "#ccc");  // light gray
  tailString.setAttribute("stroke-width", "1");
  svg.appendChild(tailString);
}




  // Return the completed SVG
  return svg;
}
