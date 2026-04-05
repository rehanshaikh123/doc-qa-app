const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function parseDocument(filePath, mimetype) {
  let text = '';

  if (mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    text = data.text;
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }

  // Clean up text
  text = text.replace(/\s+/g, ' ').trim();

  // Split into chunks (~500 chars each with overlap)
  const chunkSize = 500;
  const overlap = 50;
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

module.exports = { parseDocument };
