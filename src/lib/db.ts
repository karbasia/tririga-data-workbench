import * as duckdb from '@duckdb/duckdb-wasm';

export type TableColumns = {
  name: string;
  type: string;
}

export type TableInfo = {
  tableName: string;
  columns: TableColumns[];
}

export const initDB = async () => {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {type: 'text/javascript'})
  );

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  return db;
}

export const retrieveSchema = async (c: duckdb.AsyncDuckDBConnection, tableName: string): Promise<TableInfo> => {
  const stmt = await c.prepare('SELECT column_name AS name, data_type AS type FROM system.information_schema.columns WHERE table_name = ?');
  const qry = await stmt.query(tableName);
  const res: TableColumns[] = JSON.parse(JSON.stringify(qry.toArray()));
  stmt.close();

  return {
    tableName: tableName, 
    columns: res,
  };
}

export type AsyncDuckDB = duckdb.AsyncDuckDB;