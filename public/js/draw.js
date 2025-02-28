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
  
    // Calculate actual corner radii
    const rTop    = rTopFactor    * headstockWidth;
    const rBottom = rBottomFactor * bodyMinWidth;
    const rWindow = rWindowFactor * windowWidth;
  
    // Create the SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
  
    // --- 1) Determine viewBox based on the "maxBodyWidth" for center alignment ---
    const maxBodyWidth = Math.max(headstockWidth, bodyMinWidth);
    const viewBoxWidth  = maxBodyWidth + margin * 2;
    const viewBoxHeight = overallLenMm + margin * 2;
  
    svg.setAttribute("width",  svgWidthPx.toString());
    svg.setAttribute("height", svgHeightPx.toString());
    svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  
    // --- 2) Body Outline (Rounded Corners, Center-Aligned) ---
    // We'll center both top and bottom edges horizontally around the middle X = margin + maxBodyWidth/2.
    // That way, the left & right sides taper equally.
  
    // Top edge:
    const topY = margin;
    const topMidX = margin + maxBodyWidth / 2;
    const topLeftX = topMidX - headstockWidth / 2;
    const topRightX = topMidX + headstockWidth / 2;
  
    // Bottom edge:
    const bottomY = margin + overallLenMm;
    const bottomMidX = margin + maxBodyWidth / 2;
    const bottomLeftX = bottomMidX - bodyMinWidth / 2;
    const bottomRightX = bottomMidX + bodyMinWidth / 2;
  
    // Start near top-left corner, offset by rTop for the arc
    const startX = topLeftX + rTop;
    const startY = topY;
  
    let d = "";
    d += `M ${startX},${startY}`;                 // Move to top-left arc start
    d += ` L ${topRightX - rTop},${topY}`;        // top edge (straight)
    d += ` A ${rTop} ${rTop} 0 0 1 ${topRightX},${topY + rTop}`;   // arc top-right
    d += ` L ${bottomRightX},${bottomY - rBottom}`;                // right edge (straight)
    d += ` A ${rBottom} ${rBottom} 0 0 1 ${bottomRightX - rBottom},${bottomY}`; // arc bottom-right
    d += ` L ${bottomLeftX + rBottom},${bottomY}`;                 // bottom edge (straight)
    d += ` A ${rBottom} ${rBottom} 0 0 1 ${bottomLeftX},${bottomY - rBottom}`; // arc bottom-left
    d += ` L ${topLeftX},${topY + rTop}`;         // left edge (straight)
    d += ` A ${rTop} ${rTop} 0 0 1 ${startX},${startY}`;           // arc top-left
    d += " Z";
  
    const outlinePath = document.createElementNS(svgNS, "path");
    outlinePath.setAttribute("d", d);
    outlinePath.setAttribute("fill", "none");
    outlinePath.setAttribute("stroke", "black");
    outlinePath.setAttribute("stroke-width", "1");
    svg.appendChild(outlinePath);
  
    // --- 3) Window Cutout (Rounded Corners) ---
    // Currently, we keep the original logic: horizontally centering the window
    // relative to the top width. (If you prefer to center it in the entire bounding box,
    // you can adapt it similarly to the trapezoid approach.)
  
    const windowRect = document.createElementNS(svgNS, "rect");
    // Align window with top width:
    const windowX = topMidX - (headstockWidth / 2) + (headstockWidth - windowWidth) / 2;
    const windowY = margin + cutOutTop;
  
    windowRect.setAttribute("x",      windowX);
    windowRect.setAttribute("y",      windowY);
    windowRect.setAttribute("width",  windowWidth);
    windowRect.setAttribute("height", windowLength);
    windowRect.setAttribute("rx",     rWindow);
    windowRect.setAttribute("ry",     rWindow);
    windowRect.setAttribute("fill",   "none");
    windowRect.setAttribute("stroke", "black");
    windowRect.setAttribute("stroke-width", "1");
    svg.appendChild(windowRect);
  
    // --- 4) Optional Reduction (Dashed Line) ---
    // If you prefer to make this optional, you could check a boolean in config
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
  
    // --- 5) Bridge ---
    // Still centered relative to the top width for x-position:
    // If you want to center the bridge in the entire bounding box, adapt similarly.
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
  
    // --- 6) Peg Holes ---
    // Peg line Y:
    const pegLineY = margin + pegStart;
    // For horizontal centering along top width:
    const totalPegSpan = (numStrings - 1) * pegSpacing;
    const pegStartXPos = topMidX - (headstockWidth / 2) + (headstockWidth / 2) - (totalPegSpan / 2);
    // Simplifies to topMidX - totalPegSpan/2, but we keep logic for clarity.
  
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
  
    // --- 7) Strings (Light Gray by default) ---
    // Bridge anchor points, also aligned relative to headstockWidth:
    const totalBridgeSpan = (numStrings - 1) * gap;
    const bridgeTopY = bridgeY; // top edge of the bridge
    const bridgeAnchorStartX = bridgeX + (rawBridgeWidth / 2) - (totalBridgeSpan / 2);
  
    for (let i = 0; i < numStrings; i++) {
      const anchorX = bridgeAnchorStartX + i * gap;
      const anchorY = bridgeTopY;
  
      const stringLine = document.createElementNS(svgNS, "line");
      stringLine.setAttribute("x1", pegHolePositions[i]);
      stringLine.setAttribute("y1", pegLineY);
      stringLine.setAttribute("x2", anchorX);
      stringLine.setAttribute("y2", anchorY);
      stringLine.setAttribute("stroke", stringColor);
      stringLine.setAttribute("stroke-width", "1");
      svg.appendChild(stringLine);
    }
  
    return svg;
  }
  
  /**
   * Example usage:
   *
   * const myConfig = {
   *   headstockWidth: 158,
   *   bodyMinWidth: 166,
   *   overallLenMm: 547.8,
   *   cutOutTop: 35,
   *   windowWidth: 108,
   *   windowLength: 185,
   *   rTopFactor: 0.08,
   *   rBottomFactor: 0.2,
   *   rWindowFactor: 0.08,
   *   rawBridgeWidth: 60,
   *   bridgeLength: 5,
   *   pegStart: 17.5, // half of 35
   *   scaleMm: 330,
   *   pegSpacing: 36,
   *   numStrings: 3,
   *   pegHoleRadius: 3,
   *   gap: 18.6,
   *   // optional overrides
   *   margin: 10,
   *   svgWidthPx: 600,
   *   svgHeightPx: 600,
   *   stringColor: "#ccc"
   * };
   *
   * // Insert into a container:
   * const svgElement = drawTalharpaSVG(myConfig);
   * document.getElementById("talharpaContainer").appendChild(svgElement);
   *
   * // If you want a "Download SVG" button, handle it outside this function,
   * // passing the generated SVG to your download logic.
   */
  