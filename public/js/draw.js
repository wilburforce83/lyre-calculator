/****************************************************
 * Talharpa Technical Drawing with Peg Holes
 ****************************************************/

// Fixed constants for the Talharpa outline
const headstockWidth = 158;    // top width
const bodyMinWidth   = 166;    // bottom width
const overallLenMm   = 547.8;  // total length
const cutOutTop      = 35;     // cut-out near the top (vertical offset)
const windowWidth    = 108;    // width of central window
const windowLength   = 185;    // height of central window

// Corner radii
const rTop    = 0.08 * headstockWidth;
const rBottom = 0.2  * bodyMinWidth;
const rWindow = 0.08 * windowWidth;

// Bridge-related constants
const rawBridgeWidth = 60;         // total width of the bridge
const bridgeLength   = 5;          // front-to-back thickness of the bridge
const pegStart       = cutOutTop / 2;  // half of cutOutTop
const scaleMm        = 330;        // distance from pegStart to the bridge center

// Peg holes
const pegSpacing = 36;             // horizontal distance between holes
const numStrings = 3;              // how many peg holes (strings)
const pegHoleRadius = 4.5;           // radius of each peg hole (black circle)

// Draw immediately on page load
drawTalharpa();

function drawTalharpa() {
  const container = document.getElementById("talharpaContainer");
  container.innerHTML = ""; // Clear any existing drawing

  // Create an SVG element
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");

  const margin = 10;
  const viewBoxWidth  = Math.max(headstockWidth, bodyMinWidth) + margin * 2;
  const viewBoxHeight = overallLenMm + margin * 2;

  svg.setAttribute("width",  "600");
  svg.setAttribute("height", "600");
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

  // -- 1) Body Outline (Rounded Corners) ------------------------------------
  const TL = { x: margin,                  y: margin };
  const TR = { x: margin + headstockWidth, y: margin };
  const BR = { x: margin + bodyMinWidth,   y: margin + overallLenMm };
  const BL = { x: margin,                  y: margin + overallLenMm };

  const outlinePath = document.createElementNS(svgNS, "path");

  const startX = TL.x + rTop;
  const startY = TL.y;

  let d = "";
  d += `M ${startX},${startY}`;                        // Move to top-left arc start
  d += ` L ${TR.x - rTop},${TR.y}`;                    // Straight line near top-right corner
  d += ` A ${rTop} ${rTop} 0 0 1 ${TR.x},${TR.y + rTop}`; // Arc top-right
  d += ` L ${BR.x},${BR.y - rBottom}`;                 // Straight line near bottom-right
  d += ` A ${rBottom} ${rBottom} 0 0 1 ${BR.x - rBottom},${BR.y}`; // Arc bottom-right
  d += ` L ${BL.x + rBottom},${BL.y}`;                 // Straight line near bottom-left
  d += ` A ${rBottom} ${rBottom} 0 0 1 ${BL.x},${BL.y - rBottom}`; // Arc bottom-left
  d += ` L ${TL.x},${TL.y + rTop}`;                     // Straight line near top-left
  d += ` A ${rTop} ${rTop} 0 0 1 ${startX},${startY}`;  // Arc top-left
  d += " Z";

  outlinePath.setAttribute("d", d);
  outlinePath.setAttribute("fill", "none");
  outlinePath.setAttribute("stroke", "black");
  outlinePath.setAttribute("stroke-width", "1");
  svg.appendChild(outlinePath);

  // -- 2) Window Cutout (Rounded Corners) ----------------------------------
  const windowRect = document.createElementNS(svgNS, "rect");
  const windowX = margin + (headstockWidth - windowWidth) / 2;
  const windowY = margin + cutOutTop;

  windowRect.setAttribute("x",      windowX);
  windowRect.setAttribute("y",      windowY);
  windowRect.setAttribute("width",  windowWidth);
  windowRect.setAttribute("height", windowLength);
  windowRect.setAttribute("rx",     rWindow);
  windowRect.setAttribute("ry",     rWindow);

  windowRect.setAttribute("fill", "none");
  windowRect.setAttribute("stroke", "black");
  windowRect.setAttribute("stroke-width", "1");
  svg.appendChild(windowRect);

  // -- 3) Optional Reduction (Dashed Line Inside the Window) ----------------
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

  // -- 4) Bridge ------------------------------------------------------------
  const bridgeCenterY = margin + pegStart + scaleMm;
  const bridgeX = margin + (headstockWidth - rawBridgeWidth) / 2;
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

  // -- 5) Peg Holes (Black Circles) -----------------------------------------
  // Peg holes lie on a horizontal line at y = margin + pegStart
  // The holes are equally spaced (pegSpacing) and the entire group is centered
  // around the top width (headstockWidth).

  const pegLineY = margin + pegStart;

  // If we have numStrings holes, total span is (numStrings - 1) * pegSpacing
  // We subtract half this span from the center to ensure they're centered
  const totalSpan = (numStrings - 1) * pegSpacing;
  const pegStartX = margin + (headstockWidth / 2) - (totalSpan / 2);

  for (let i = 0; i < numStrings; i++) {
    const cx = pegStartX + i * pegSpacing; 
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", pegLineY);
    circle.setAttribute("r", pegHoleRadius);
    circle.setAttribute("fill", "black");
    svg.appendChild(circle);
  }

  // Insert the final SVG into the DOM
  container.appendChild(svg);
}

function downloadSVG() {
  const container = document.getElementById("talharpaContainer");
  const svgElem = container.querySelector("svg");
  if (!svgElem) {
    alert("No SVG to download!");
    return;
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElem);

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "talharpa_technical_drawing.svg";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
