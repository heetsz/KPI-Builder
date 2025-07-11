const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
/*
* Parses CSV file from a file path
* @param {string} filePath
* @returns {Promise<Array>}
*/
const parseCSVFile = (filePath) => {
 return new Promise((resolve, reject) => {
   const rows = [];

   fs.createReadStream(filePath)
     .pipe(csv())
     .on('data', (row) => {
       const parsedRow = transformRow(row);
       if (parsedRow) rows.push(parsedRow);
     })
     .on('end', () => resolve(rows))
     .on('error', reject);
 });
};

/**
* Parses inline CSV string (from req.body)
* @param {string} fileData
* @returns {Array}
*/
const parseInlineCSV = (fileData) => {
 const lines = fileData.trim().split('\n');
 const headers = lines[0].split(',');

 return lines.slice(1).map(line => {
   const values = line.split(',');
   const row = {};
   headers.forEach((header, i) => {
     row[header.trim()] = values[i]?.trim();
   });
   return transformRow(row);
 });
};

/**
* Transform a CSV row to desired format
* @param {Object} row
* @returns {Object|null}
*/
const transformRow = (row) => {
 if (!row.date) return null;

 const [dd, mm, yy] = row.date.split('-');
 const date = new Date(`20${yy}-${mm}-${dd}`);
 const metrics = {};

 for (const key in row) {
   if (key !== 'date') {
     const val = parseFloat(row[key]);
     metrics[key] = isNaN(val) ? null : val;
   }
 }

 return { date, metrics };
};

/**
* Save parsed KPI data
*/
const saveKPIData = async (Model, companyId, records, department) => {
 const allKPIKeys = new Set();
 records.forEach(r => Object.keys(r.metrics).forEach(k => allKPIKeys.add(k)));

 const formattedData = records.map(r => ({
   date: r.date,
   department,
   metrics: r.metrics
 }));

 const existingDoc = await Model.findOne({ companyId });

 if (existingDoc) {
   existingDoc.lastUpdated = new Date();
   existingDoc.selectedKPIs = [...allKPIKeys];
   existingDoc.data = formattedData;
   existingDoc.department = department;
   return await existingDoc.save();
 }

 const newDoc = new Model({
   companyId,
   department,
   lastUpdated: new Date(),
   selectedKPIs: [...allKPIKeys],
   data: formattedData
 });

 return await newDoc.save();
};

module.exports = {
 parseCSVFile,
 parseInlineCSV,
 transformRow,
 saveKPIData
};