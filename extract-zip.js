const extractZip = require('extract-zip')

async function extractFile(source) {
  try {
    await extractZip(source, {dir:  process.cwd()});
    console.log('Extraction complete')
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

module.exports = {
  extractFile,
}