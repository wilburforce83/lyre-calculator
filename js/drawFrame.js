/**
 * drawTalharpaFrameSVG
 * Creates an SVG element representing the Talharpa outline (same orientation as front view),
 * but omits soundhole, bridge, tail, and neck-start line. Adds:
 *
 * 1) A horizontal line at cutOutTop from the top, with linearly interpolated width, plus dimension lines.
 * 2) A custom path for the lower inset cut-out with 7 mm from each side but 18 mm from the bottom,
 *    so that the tail area is thicker. 
 * 3) Dimension lines for the cut-out’s top width, bottom width, and vertical height.
 * 4) A small arrow/note near the bottom stating “Thicker at tail to strengthen for tailpiece anchoring point.”
 */
function drawTalharpaFrameSVG(config) {
    const {
      headstockWidth,
      bodyMinWidth,
      overallLenMm,
      neckStart,
      cutOutTop, // horizontal line from top
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
      drawingMargin = 10,
      extraMargin = 50,
      svgWidthPx = 400,
      svgHeightPx = 800
    } = config;
  
    // Dimension styling
    const DIMENSION_COLOR = "red";
    const DIMENSION_OPACITY = "0.5";
    const DIMENSION_FONT_SIZE = "9px";
  
    // Overall margins
    const totalMargin = drawingMargin + extraMargin;
    const maxBodyWidth = Math.max(headstockWidth, bodyMinWidth);
  
    // The bounding box for this front-like orientation
    const viewBoxWidth  = maxBodyWidth + totalMargin * 2;
    const viewBoxHeight = overallLenMm + totalMargin * 2;
  
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width",  svgWidthPx.toString());
    svg.setAttribute("height", svgHeightPx.toString());
    svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  
    // Basic geometry
    const topY    = totalMargin;
    const bottomY = totalMargin + overallLenMm;
    const topMidX = totalMargin + maxBodyWidth / 2;
  
    const topLeftX     = topMidX - headstockWidth / 2;
    const topRightX    = topMidX + headstockWidth / 2;
    const bottomLeftX  = topMidX - bodyMinWidth / 2;
    const bottomRightX = topMidX + bodyMinWidth / 2;
  
    // Outer shape corner radii
    const rTop    = 0.08 * headstockWidth;
    const rBottom = 0.2  * bodyMinWidth;
  
    // === 1) Draw the main instrument outline ===
    let dOutline = "";
    const startX = topLeftX + rTop;
    dOutline += `M ${startX},${topY} `;
    dOutline += `L ${topRightX - rTop},${topY} `;
    dOutline += `A ${rTop} ${rTop} 0 0 1 ${topRightX},${topY + rTop} `;
    dOutline += `L ${bottomRightX},${bottomY - rBottom} `;
    dOutline += `A ${rBottom} ${rBottom} 0 0 1 ${bottomRightX - rBottom},${bottomY} `;
    dOutline += `L ${bottomLeftX + rBottom},${bottomY} `;
    dOutline += `A ${rBottom} ${rBottom} 0 0 1 ${bottomLeftX},${bottomY - rBottom} `;
    dOutline += `L ${topLeftX},${topY + rTop} `;
    dOutline += `A ${rTop} ${rTop} 0 0 1 ${startX},${topY} Z`;
  
    const outlinePath = document.createElementNS(svgNS, "path");
    outlinePath.setAttribute("d", dOutline);
    outlinePath.setAttribute("fill", "none");
    outlinePath.setAttribute("stroke", "black");
    outlinePath.setAttribute("stroke-width", "1");
    svg.appendChild(outlinePath);

    // Window Cutout (Rounded Corners)
  const windowX = topMidX - (headstockWidth / 2) + (headstockWidth - windowWidth) / 2;
  const windowY = totalMargin + cutOutTop;
  const rWindow = rWindowFactor * windowWidth;
  
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
  
    // === 2) Horizontal line at cutOutTop from top (plus dimension lines) ===
    const lineY = topY + cutOutTop;
    const wLine = headstockWidth + (bodyMinWidth - headstockWidth)*(cutOutTop / overallLenMm);
    const lineLeft  = topMidX - wLine/2;
    const lineRight = topMidX + wLine/2;
  
    // Draw that horizontal line
    const thicknessLine = document.createElementNS(svgNS, "line");
    thicknessLine.setAttribute("x1", lineLeft);
    thicknessLine.setAttribute("y1", lineY);
    thicknessLine.setAttribute("x2", lineRight);
    thicknessLine.setAttribute("y2", lineY);
    thicknessLine.setAttribute("stroke", "black");
    thicknessLine.setAttribute("stroke-width", "1");
    svg.appendChild(thicknessLine);
  
    // (2A) Vertical dimension for "N" = cutOutTop
    const dimensionNX = lineLeft + 10;
    const dimLineN = document.createElementNS(svgNS, "line");
    dimLineN.setAttribute("x1", dimensionNX);
    dimLineN.setAttribute("y1", topY);
    dimLineN.setAttribute("x2", dimensionNX);
    dimLineN.setAttribute("y2", lineY);
    dimLineN.setAttribute("stroke", DIMENSION_COLOR);
    dimLineN.setAttribute("stroke-width", "1");
    dimLineN.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(dimLineN);
  
    const extLineN1 = document.createElementNS(svgNS, "line");
    extLineN1.setAttribute("x1", lineLeft);
    extLineN1.setAttribute("y1", topY);
    extLineN1.setAttribute("x2", dimensionNX);
    extLineN1.setAttribute("y2", topY);
    extLineN1.setAttribute("stroke", DIMENSION_COLOR);
    extLineN1.setAttribute("stroke-width", "1");
    extLineN1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extLineN1);
  
    const extLineN2 = document.createElementNS(svgNS, "line");
    extLineN2.setAttribute("x1", lineLeft);
    extLineN2.setAttribute("y1", lineY);
    extLineN2.setAttribute("x2", dimensionNX);
    extLineN2.setAttribute("y2", lineY);
    extLineN2.setAttribute("stroke", DIMENSION_COLOR);
    extLineN2.setAttribute("stroke-width", "1");
    extLineN2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extLineN2);
  
    const dimTextN = document.createElementNS(svgNS, "text");
    dimTextN.setAttribute("x", dimensionNX + 5);
    dimTextN.setAttribute("y", (topY + lineY) / 2);
    dimTextN.setAttribute("font-size", DIMENSION_FONT_SIZE);
    dimTextN.setAttribute("fill", DIMENSION_COLOR);
    dimTextN.setAttribute("text-anchor", "start");
    dimTextN.setAttribute("alignment-baseline", "middle");
    dimTextN.textContent = `Notch = ${Math.round(cutOutTop)}mm x 3-4mm 2PL.`;
    svg.appendChild(dimTextN);
  
    
  
    // === 3) The custom path for the lower inset: 7 mm from sides, 18 mm from bottom ===
    // The top of this inset starts at neckStart + 7 from each side.
    // The bottom is 18 mm above bottom. We'll do partial corner arcs.
    const insideOffsetSide = 7;
    const insideOffsetBottom = 18;
  
    // The top Y of the inset: topY + neckStart + 7
    const insideTopY = topY + neckStart;
    // The bottom Y: bottomY - insideOffsetBottom
    const insideBottomY = bottomY - insideOffsetBottom;
  
    // Width at neckStart => W_neck
    const W_neck = headstockWidth + (bodyMinWidth - headstockWidth)*(neckStart / overallLenMm);
    // At bottom => W_bottom = bodyMinWidth
    const W_bottom = bodyMinWidth;
  
    // So top inside width = W_neck - 2*(insideOffsetSide)
    const insideTopWidth = Math.max(W_neck - 2*insideOffsetSide, 0);
    // bottom inside width = W_bottom - 2*(insideOffsetSide)
    const insideBottomWidth = Math.max(W_bottom - 2*insideOffsetSide, 0);
  
    // The radius at the bottom is rBottom, but we remove insideOffsetSide horizontally
    // and insideOffsetBottom vertically. For a simpler approach, we reduce the radius by min(insideOffsetSide, insideOffsetBottom).
    const rInsideBottom = Math.max(rBottom - Math.min(insideOffsetSide, insideOffsetBottom), 0);
  
    // X coords
    const insideTopMidX = topMidX;
    const insideTopLeftX = insideTopMidX - insideTopWidth/2;
    const insideTopRightX= insideTopMidX + insideTopWidth/2;
  
    const insideBottomLeftX = insideTopMidX - insideBottomWidth/2;
    const insideBottomRightX= insideTopMidX + insideBottomWidth/2;
  
    // Build path from top-left => top-right => right edge => bottom-right => arc => bottom-left => arc => top-left
    let dCut = "";
    // Move to top-left
    dCut += `M ${insideTopLeftX},${insideTopY} `;
    // line to top-right
    dCut += `L ${insideTopRightX},${insideTopY} `;
    // right edge down
    dCut += `L ${insideBottomRightX},${insideBottomY - rInsideBottom} `;
    // arc bottom-right
    dCut += `A ${rInsideBottom} ${rInsideBottom} 0 0 1 ${insideBottomRightX - rInsideBottom},${insideBottomY} `;
    // line left to bottom-left + radius
    dCut += `L ${insideBottomLeftX + rInsideBottom},${insideBottomY} `;
    // arc bottom-left
    dCut += `A ${rInsideBottom} ${rInsideBottom} 0 0 1 ${insideBottomLeftX},${insideBottomY - rInsideBottom} `;
    // up to top-left
    dCut += `L ${insideTopLeftX},${insideTopY} Z`;
  
    const cutoutPath = document.createElementNS(svgNS, "path");
    cutoutPath.setAttribute("d", dCut);
    cutoutPath.setAttribute("fill", "none");
    cutoutPath.setAttribute("stroke", "black");
    cutoutPath.setAttribute("stroke-width", "1");
    svg.appendChild(cutoutPath);
  
    // Dimensions for the cut-out
    const cutHeight = insideBottomY - insideTopY;
    // top width => insideTopWidth
    // bottom width => insideBottomWidth
  
    // (3A) Vertical dimension line on the right
    const dimCutV_X = insideBottomRightX + 20;
    const dimCutV = document.createElementNS(svgNS, "line");
    dimCutV.setAttribute("x1", dimCutV_X);
    dimCutV.setAttribute("y1", insideTopY);
    dimCutV.setAttribute("x2", dimCutV_X);
    dimCutV.setAttribute("y2", insideBottomY);
    dimCutV.setAttribute("stroke", DIMENSION_COLOR);
    dimCutV.setAttribute("stroke-width", "1");
    dimCutV.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(dimCutV);
  
    const extCutV1 = document.createElementNS(svgNS, "line");
    extCutV1.setAttribute("x1", insideBottomRightX);
    extCutV1.setAttribute("y1", insideTopY);
    extCutV1.setAttribute("x2", dimCutV_X);
    extCutV1.setAttribute("y2", insideTopY);
    extCutV1.setAttribute("stroke", DIMENSION_COLOR);
    extCutV1.setAttribute("stroke-width", "1");
    extCutV1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutV1);
  
    const extCutV2 = document.createElementNS(svgNS, "line");
    extCutV2.setAttribute("x1", insideBottomRightX);
    extCutV2.setAttribute("y1", insideBottomY);
    extCutV2.setAttribute("x2", dimCutV_X);
    extCutV2.setAttribute("y2", insideBottomY);
    extCutV2.setAttribute("stroke", DIMENSION_COLOR);
    extCutV2.setAttribute("stroke-width", "1");
    extCutV2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutV2);
  
    const dimTextCutV = document.createElementNS(svgNS, "text");
    dimTextCutV.setAttribute("x", dimCutV_X + 5);
    dimTextCutV.setAttribute("y", (insideTopY + insideBottomY) / 2);
    dimTextCutV.setAttribute("font-size", DIMENSION_FONT_SIZE);
    dimTextCutV.setAttribute("fill", DIMENSION_COLOR);
    dimTextCutV.setAttribute("text-anchor", "start");
    dimTextCutV.setAttribute("alignment-baseline", "middle");
    dimTextCutV.textContent = Math.round(cutHeight) + "mm";
    svg.appendChild(dimTextCutV);
  
    // (3B) Top width dimension
    const dimCutTopY = insideTopY - 10;
    const dimCutTopLine = document.createElementNS(svgNS, "line");
    dimCutTopLine.setAttribute("x1", insideTopLeftX);
    dimCutTopLine.setAttribute("y1", dimCutTopY);
    dimCutTopLine.setAttribute("x2", insideTopRightX);
    dimCutTopLine.setAttribute("y2", dimCutTopY);
    dimCutTopLine.setAttribute("stroke", DIMENSION_COLOR);
    dimCutTopLine.setAttribute("stroke-width", "1");
    dimCutTopLine.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(dimCutTopLine);
  
    const extCutTop1 = document.createElementNS(svgNS, "line");
    extCutTop1.setAttribute("x1", insideTopLeftX);
    extCutTop1.setAttribute("y1", insideTopY);
    extCutTop1.setAttribute("x2", insideTopLeftX);
    extCutTop1.setAttribute("y2", dimCutTopY);
    extCutTop1.setAttribute("stroke", DIMENSION_COLOR);
    extCutTop1.setAttribute("stroke-width", "1");
    extCutTop1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutTop1);
  
    const extCutTop2 = document.createElementNS(svgNS, "line");
    extCutTop2.setAttribute("x1", insideTopRightX);
    extCutTop2.setAttribute("y1", insideTopY);
    extCutTop2.setAttribute("x2", insideTopRightX);
    extCutTop2.setAttribute("y2", dimCutTopY);
    extCutTop2.setAttribute("stroke", DIMENSION_COLOR);
    extCutTop2.setAttribute("stroke-width", "1");
    extCutTop2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutTop2);
  
    const dimTextCutTop = document.createElementNS(svgNS, "text");
    dimTextCutTop.setAttribute("x", insideTopRightX - 5);
    dimTextCutTop.setAttribute("y", dimCutTopY - 3);
    dimTextCutTop.setAttribute("font-size", DIMENSION_FONT_SIZE);
    dimTextCutTop.setAttribute("fill", DIMENSION_COLOR);
    dimTextCutTop.setAttribute("text-anchor", "end");
    dimTextCutTop.setAttribute("alignment-baseline", "baseline");
    dimTextCutTop.textContent = Math.round(insideTopWidth) + "mm";
    svg.appendChild(dimTextCutTop);
  
    // (3C) Bottom width dimension
    const dimCutBotY = insideBottomY + 25;
    const dimCutBotLine = document.createElementNS(svgNS, "line");
    dimCutBotLine.setAttribute("x1", insideBottomLeftX);
    dimCutBotLine.setAttribute("y1", dimCutBotY);
    dimCutBotLine.setAttribute("x2", insideBottomRightX);
    dimCutBotLine.setAttribute("y2", dimCutBotY);
    dimCutBotLine.setAttribute("stroke", DIMENSION_COLOR);
    dimCutBotLine.setAttribute("stroke-width", "1");
    dimCutBotLine.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(dimCutBotLine);
  
    const extCutBot1 = document.createElementNS(svgNS, "line");
    extCutBot1.setAttribute("x1", insideBottomLeftX);
    extCutBot1.setAttribute("y1", insideBottomY);
    extCutBot1.setAttribute("x2", insideBottomLeftX);
    extCutBot1.setAttribute("y2", dimCutBotY);
    extCutBot1.setAttribute("stroke", DIMENSION_COLOR);
    extCutBot1.setAttribute("stroke-width", "1");
    extCutBot1.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutBot1);
  
    const extCutBot2 = document.createElementNS(svgNS, "line");
    extCutBot2.setAttribute("x1", insideBottomRightX);
    extCutBot2.setAttribute("y1", insideBottomY);
    extCutBot2.setAttribute("x2", insideBottomRightX);
    extCutBot2.setAttribute("y2", dimCutBotY);
    extCutBot2.setAttribute("stroke", DIMENSION_COLOR);
    extCutBot2.setAttribute("stroke-width", "1");
    extCutBot2.setAttribute("stroke-opacity", DIMENSION_OPACITY);
    svg.appendChild(extCutBot2);
  
    const dimTextCutBot = document.createElementNS(svgNS, "text");
    dimTextCutBot.setAttribute("x", insideBottomRightX - 5);
    dimTextCutBot.setAttribute("y", dimCutBotY + 12);
    dimTextCutBot.setAttribute("font-size", DIMENSION_FONT_SIZE);
    dimTextCutBot.setAttribute("fill", DIMENSION_COLOR);
    dimTextCutBot.setAttribute("text-anchor", "end");
    dimTextCutBot.setAttribute("alignment-baseline", "hanging");
    dimTextCutBot.textContent = Math.round(insideBottomWidth) + "mm";
    svg.appendChild(dimTextCutBot);


    // Dimension C: Window Length
  const dimensionCX = windowX + windowWidth - 20;
  const dimLineC = document.createElementNS(svgNS, "line");
  dimLineC.setAttribute("x1", dimensionCX);
  dimLineC.setAttribute("y1", windowY);
  dimLineC.setAttribute("x2", dimensionCX);
  dimLineC.setAttribute("y2", windowY + windowLength);
  dimLineC.setAttribute("stroke", DIMENSION_COLOR);
  dimLineC.setAttribute("stroke-width", "1");
  dimLineC.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineC);
  
  
  
  const dimTextC = document.createElementNS(svgNS, "text");
  dimTextC.setAttribute("x", dimensionCX - 10);
  dimTextC.setAttribute("y", (windowY + (windowY + windowLength)) / 2);
  dimTextC.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextC.setAttribute("fill", DIMENSION_COLOR);
  dimTextC.setAttribute("text-anchor", "start");
  dimTextC.setAttribute("alignment-baseline", "middle");
  dimTextC.textContent = "C";
  svg.appendChild(dimTextC);
  
  // Dimension D: Window Width
  const dimensionDY = windowY + windowLength - 20;
  const dimLineD = document.createElementNS(svgNS, "line");
  dimLineD.setAttribute("x1", windowX);
  dimLineD.setAttribute("y1", dimensionDY);
  dimLineD.setAttribute("x2", windowX + windowWidth);
  dimLineD.setAttribute("y2", dimensionDY);
  dimLineD.setAttribute("stroke", DIMENSION_COLOR);
  dimLineD.setAttribute("stroke-width", "1");
  dimLineD.setAttribute("stroke-opacity", DIMENSION_OPACITY);
  svg.appendChild(dimLineD);
  
  
  const dimTextD = document.createElementNS(svgNS, "text");
  dimTextD.setAttribute("x", (windowX + windowX + windowWidth) / 2);
  dimTextD.setAttribute("y", dimensionDY - 10);
  dimTextD.setAttribute("font-size", DIMENSION_FONT_SIZE);
  dimTextD.setAttribute("fill", DIMENSION_COLOR);
  dimTextD.setAttribute("text-anchor", "middle");
  dimTextD.setAttribute("alignment-baseline", "hanging");
  dimTextD.textContent = "D";
  svg.appendChild(dimTextD);
  
    return svg;
  }
  