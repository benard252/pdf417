import bwipjs from 'bwip-js';
import { format } from 'date-fns';
import { STATES, HAIR_COLORS, EYE_COLORS } from './constants.js';
import { generateDocumentDiscriminator, generateInventoryControlNumber } from './utils.js';

// Initialize form elements
const form = document.getElementById('licenseForm');
const stateSelect = document.getElementById('state');
const hairColorSelect = document.getElementById('hairColor');
const eyeColorSelect = document.getElementById('eyeColor');
const generateDDButton = document.getElementById('generateDD');
const generateICNButton = document.getElementById('generateICN');
const downloadButton = document.getElementById('downloadBarcode');

// Populate select elements
function populateSelect(select, options) {
  options.forEach(({ value, label, color }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (color) {
      option.style.color = color;
    }
    select.appendChild(option);
  });
}

populateSelect(stateSelect, STATES);
populateSelect(hairColorSelect, HAIR_COLORS);
populateSelect(eyeColorSelect, EYE_COLORS);

// Generate random values for DD and ICN
generateDDButton.addEventListener('click', () => {
  document.getElementById('documentDiscriminator').value = generateDocumentDiscriminator();
});

generateICNButton.addEventListener('click', () => {
  document.getElementById('inventoryControl').value = generateInventoryControlNumber();
});

// Handle form submission and barcode generation
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Format dates for AAMVA standard
    const birthDate = format(new Date(data.birthDate), 'MMddyyyy');
    const issueDate = format(new Date(data.issueDate), 'MMddyyyy');
    const expiryDate = format(new Date(data.expiryDate), 'MMddyyyy');
    
    // Create AAMVA compliant string
    const aamvaString = [
      '@',
      '\n',
      'ANSI 636014040002DL00410288ZV03190008DLDAQD12345678',
      '\n',
      `DCT${data.documentDiscriminator}`,
      '\n',
      `DBA${birthDate}`,
      '\n',
      `DCS${data.lastName}`,
      '\n',
      `DCT${data.firstName}`,
      '\n',
      `DCU${data.middleName}`,
      '\n',
      `DAG${data.street}`,
      '\n',
      `DAI${data.city}`,
      '\n',
      `DAJ${data.state}`,
      '\n',
      `DAK${data.zip}`,
      '\n',
      `DAY${data.eyeColor}`,
      '\n',
      `DAZ${data.hairColor}`,
      '\n',
      `DBC${data.gender}`,
      '\n',
      `DBD${issueDate}`,
      '\n',
      `DBB${expiryDate}`,
      '\n',
      `DAU${Math.round(data.heightFt * 12 + parseInt(data.heightIn))}`,
      '\n',
      `DAW${data.weight}`,
      '\n',
      `DCK${data.inventoryControl}`,
      '\n',
      'ZVZVAJulie Sample',
      '\n'
    ].join('');

    // Generate PDF417 barcode
    const canvas = document.getElementById('barcodeCanvas');
    
    await bwipjs.toCanvas(canvas, {
      bcid: 'pdf417',
      text: aamvaString,
      scale: 3,
      height: 10,
      includetext: false,
      textxalign: 'center',
    });

    // Enable download button
    downloadButton.disabled = false;
  } catch (error) {
    console.error('Error generating barcode:', error);
    alert('Error generating barcode. Please check your input and try again.');
  }
});

// Handle barcode download
downloadButton.addEventListener('click', () => {
  const canvas = document.getElementById('barcodeCanvas');
  const link = document.createElement('a');
  link.download = 'barcode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});