/**
 * drawTalharpaSideSVG
 * Creates an SVG element representing the side view of the Talharpa.
 * The side view is drawn as a simple rectangle:
 *   - Height: overallLenMm
 *   - Width:  bodyMinDepth
 *
 * Usage example:
 *   const sideConfig = {
 *     overallLenMm: 547.8,
 *     bodyMinDepth: 45,  // from your critical dimensions config
 *     margin: 10,        // optional
 *     svgWidthPx: 400,   // optional
 *     svgHeightPx: 600   // optional
 *   };
 *
 *   const sideSvg = drawTalharpaSideSVG(sideConfig);
 *   document.getElementById('talharpaSideContainer').appendChild(sideSvg);
 */
function drawTalharpaSideSVG(config) {
  const {
    overallLenMm,
    bodyMinDepth,
    margin = 10,
    svgWidthPx = 400,
    svgHeightPx = 600
  } = config;
  
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  
  // Compute viewBox dimensions
  const viewBoxWidth  = bodyMinDepth + margin * 2;
  const viewBoxHeight = overallLenMm + margin * 2;
  
  svg.setAttribute("width", svgWidthPx.toString());
  svg.setAttribute("height", svgHeightPx.toString());
  svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
  
  // Draw a rectangle for the side view:
  // X and Y positions start at the margin,
  // width is bodyMinDepth and height is overallLenMm.
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", margin);
  rect.setAttribute("y", margin);
  rect.setAttribute("width", bodyMinDepth);
  rect.setAttribute("height", overallLenMm);
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", "black");
  rect.setAttribute("stroke-width", "1");
  
  svg.appendChild(rect);
  
  return svg;
}
