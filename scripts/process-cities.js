const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/raw_comuni.json');
const outputPath = path.join(__dirname, '../src/data/italian-cities.json');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const cities = JSON.parse(rawData);

    // Map to "Name (Prov)" format
    // Example: "Abano Terme (PD)"
    const processedCities = cities.map(city => {
        return `${city.nome} (${city.sigla})`;
    });

    // Sort alphabetically
    processedCities.sort((a, b) => a.localeCompare(b));

    fs.writeFileSync(outputPath, JSON.stringify(processedCities, null, 2));
    console.log(`Successfully processed ${processedCities.length} cities.`);
} catch (error) {
    console.error('Error processing cities:', error);
    process.exit(1);
}
