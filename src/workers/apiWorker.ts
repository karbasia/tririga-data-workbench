/* eslint-disable @typescript-eslint/ban-types */
import { ReportData } from 'tririga-js-sdk';

const convertDataType = (val: string, type: string): string | Number | Date => {
  try {
    switch (type) {
      case 'Number':
        return new Number(val.replace(/[^0-9.]/g, ''));
      case 'Date':
        return new Date(Date.parse(val)).toISOString().split('T')[0];
      case 'Date and Time':
        return new Date(Date.parse(val)).toISOString();
      default:
        return val;
    }
  } catch (e) {
    // Return the value if it cannot be parsed
    return val;
  }

}


self.addEventListener('message', async (e) => {
  // Data comes in as strings. Perform some basic conversions prior to creating the table
  // This ensures an easier user experience when dealing with TRIRIGA number and date fields
  if (e.data.type === 'CLEAN_DATA') {
    const data: ReportData = e.data.data
    const reportName = e.data.name;
    const newResults = [];
  
    const columnsObj: { [key: string]: string } = {};
  
    for (const header of data.headers) {
      columnsObj[header.id] = header.type;
    }
  
    for (const row of data.data) {
      const convertedObj: { [key: string]: string | Number | Date } = {};
      for (const [key, val] of Object.entries(row)) {
        convertedObj[key] = convertDataType(val, columnsObj[key]);
      }
      newResults.push(convertedObj);
    }
  
    self.postMessage({
      status: 'COMPLETE',
      output: {
        data: newResults,
        reportName: reportName
      }
    });
  }
});