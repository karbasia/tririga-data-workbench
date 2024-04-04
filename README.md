# TRIRIGA Data Workbench

Often times, users ask me how they can pull in data from other sources into TRIRIGA for reporting. Sometimes, we may be lucky and there are data warehouses set up and other times, we spend months working with other teams to set something similar up. The TRIRIGA Data Workbench gives users the ability to combine TRIRIGA data with their own local data sources. The goal of this application is to give power users the ability to quickly analyze datasets and provide reports useful for their line of business.

This project is inspired by [SQL Workbench](https://tobilg.com/using-duckdb-wasm-for-in-browser-data-engineering) by Tobias Müller. 

Read more about this UX application in my [blog post](https://karbasi.dev/blog/running-an-in-browser-sql-database-for-tririga-data).

# Application Overview

This UX application incorporates DuckDB-WASM as an in-browser SQL database. On top of that, it uses the Monaco Editor for input and FINOS Perspective as the data table and chart renderer. For now, all data is stored in memory and refreshing the page will require the user to re-upload and re-select their data sources.

Currently, CSV files can be uploaded or selected through a URL (the source system hosting the data must support CORS) and if they have a valid TRIRIGA session, then they can also add TRIRIGA reports. The left hand pane will display all data sources and fields. Please review the blog post for a demo video.

**This tool requires TRIRIGA platform 4.2+**

## CSV Import

Simply select the CSV file and the application will create a table with the headers as columns and the file name as the table. DuckDB will attempt to infer the data types based on the file.

## TRIRIGA Queries

A selector will allow the user to select queries. The query name will be the table name and all columns will be added with the respective data. Since the TRIRIGA query API returns only strings, the system will attempt to convert them to certain types.

# Installation Instructions

1. Create a new UX Web View with type `WEB_APP`
1. Set the Root folder value to `dist` and index filename to `index.html`
1. Create a Model & View record with the newly created view and any model
1. Create a new application record withthe M&V from above and the exposed name `dataWorkbench` and an instance ID of `-1`
1. Clone this repository
1. Run `npm install` to install dependencies
1. Run `npm run build` to create the final distribution files under the `dist` folder
1. Deploy the code using the command `npx @tririga/tri-deploy -u <USER> -p <PASS> -v <VIEW_EXPOSED_NAME> -t <TRIRIGA> -v -m 3`
1. Navigate to `<TRIRIGA>/app/dataWorkbench` to view the application

# Usage Guidelines

To make life easier for end users, here are some tips on using the system:

## Type Casting

Date fields are formatted, but they must still be cast. It is recommended to use the function `TRY_CAST` as any failed conversions will return null. For example, to cast a field as a date, the following query can be used:

```SQL
SELECT TRY_CAST(startDate AS DATE) AS StartDate 
FROM ReserveListcsv
```

## Reading External Files

DuckDB allows you to read files that are available to you. For example, running this query will read the CSV file from this repository:

```SQL
SELECT * 
FROM read_csv_auto('https://raw.githubusercontent.com/karbasia/tririga-data-workbench/main/sample/BadgeSwipes.csv');
```

Please refer to the [official guide](https://duckdb.org/docs/data/overview) on importing CSV and other data files.

## Column Aliases

Like all SQL queries, it is recommended to alias columns to make reporting easier. The tool does not perform any major transformations to the API query properties, therefore fields follow a certain format (see blog post for more details)

## Memory Limitations

Everything is stored in memory. Very large datasets that cause table scans may fail. Try to select only columns that are required and ensure that joined tables are being used. Currently, this application is limited to ~2GB of memory usage per session.