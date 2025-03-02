// saveToPdf.js

function saveToPDF() {
  // Show spinner overlay
  const overlay = document.getElementById('spinnerOverlay');
  overlay.style.display = 'flex';

  // Hide all buttons inside the pdf-area
  const buttons = document.querySelectorAll('#pdf-area button');
  buttons.forEach(btn => btn.style.display = 'none');
  
  // Hide the form so its inputs won't be printed
  const form = document.querySelector('form');
  form.style.display = 'none';

  // Create a temporary container for the design criteria section
  const tempContainer = document.createElement('div');

  // Insert a page break before the design criteria section
  /*
  const pageBreak = document.createElement('div');
  pageBreak.classList.add('page-break');
  tempContainer.appendChild(pageBreak);
*/
  // Insert an h3 header with the title "Design Criteria" using the same style as other tables
  const headerH3 = document.createElement('h3');
  headerH3.textContent = 'Design Criteria';
  tempContainer.appendChild(headerH3);

  // Create a temporary table for design criteria with UIkit styling
  const tempTable = document.createElement('table');
  tempTable.classList.add('uk-table', 'uk-table-striped');

  // Create table header
  const tempThead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const th1 = document.createElement('th');
  th1.textContent = 'Criteria';
  const th2 = document.createElement('th');
  th2.textContent = 'Value';
  headRow.appendChild(th1);
  headRow.appendChild(th2);
  tempThead.appendChild(headRow);
  tempTable.appendChild(tempThead);

  // Create table body and populate with form data
  const tempTbody = document.createElement('tbody');

  // Process each input and select field from the form
  const formElements = form.querySelectorAll('input, select');
  formElements.forEach(el => {
    const row = document.createElement('tr');

    // Get label text if available
    let labelText = '';
    if (el.id) {
      const label = form.querySelector(`label[for="${el.id}"]`);
      if (label) {
        labelText = label.textContent.trim();
      }
    }
    const cellLabel = document.createElement('td');
    cellLabel.textContent = labelText;

    const cellValue = document.createElement('td');
    if (el.id === 'finalTuning') {
      let tuningValue = el.value;
      try {
        const parsed = JSON.parse(tuningValue);
        if (Array.isArray(parsed)) {
          tuningValue = parsed.map(item => item.noteName).join(', ');
        }
      } catch(e) {
        // If parsing fails, leave the value as is.
      }
      cellValue.textContent = tuningValue;
    } else {
      cellValue.textContent = el.value;
    }

    row.appendChild(cellLabel);
    row.appendChild(cellValue);
    tempTbody.appendChild(row);
  });

  tempTable.appendChild(tempTbody);
  tempContainer.appendChild(tempTable);

  // Append the temporary container to the pdf-area
  const pdfArea = document.getElementById('pdf-area');
  pdfArea.appendChild(tempContainer);

  // Prepare html2pdf options
  const element = document.getElementById('pdf-area');
  element.classList.add('pdf-print');
  const opt = {
    margin: 0.5,
    filename: 'Tagelharpa_Design_Calculator.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate the PDF
  html2pdf().set(opt).from(element).save().then(() => {
    // Remove the temporary design criteria container
    tempContainer.remove();

    // Restore form display
    form.style.display = '';

    // Show the buttons again
    buttons.forEach(btn => btn.style.display = '');

    // Hide the spinner overlay
    overlay.style.display = 'none';
    element.classList.remove('pdf-print');
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const pdfButton = document.getElementById('savePdfButton');
  if (pdfButton) {
    pdfButton.addEventListener('click', saveToPDF);
  }
});
