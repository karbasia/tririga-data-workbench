import { useState, useEffect } from 'react';
import Client from 'tririga-js-sdk';
import { initDB, AsyncDuckDB, TableInfo } from '@/lib/db';
import Perspective from '@/components/Perspective';
import FileUpload from '@/components/FileUpload';
import QueryEditor from '@/components/QueryEditor';
import TriDataRetrieve from '@/components/TriDataRetrieve';
import TableList from '@/components/TableList';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';


function App() {
  const [db, setDB] = useState<AsyncDuckDB>();
  const [results, setResults] = useState<Uint8Array | undefined>();
  const [client, setClient] = useState<Client>();
  const [dbSchema, setDbSchema] = useState<TableInfo[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const db = await initDB();
      setDB(db);
      try {
        const client = await Client.CreateClient(true);
        setClient(client);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        toast({
          title: "Session Error",
          description: "Invalid TRIRIGA Session. Only local files will be available",
          variant: "destructive",
        });
      }

    }
    if (!db) {
      init();
    }
  }, [db, client]);

  const handleRunQuery = async (query: string) => {
    query = query.replace('\n', '');
    if (db && query) {
      try {
        const conn = await db.connectInternal();
        const res = await db.runQuery(conn, query);
        setResults(res);
        db.disconnect(conn);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        toast({
          title: "Query Error",
          description: ex.message,
          variant: "destructive",
        });
      }
      
    }
  }

  const handleAddDataSource = (data: TableInfo) => {
    setDbSchema([...dbSchema, data]);
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-svh min-w-full flex rounded-lg border"
    >
      <Toaster />
      <ResizablePanel defaultSize={10}>
        <div className="flex flex-col h-full">
          <div className="flex-none"><h1 className="text-2xl">TRIRIGA Data Workbench</h1></div>
          <div className="flex flex-1">
            <ul className="cursor-default">
              {dbSchema.length === 0 && <span>Please add a data source</span>}
              {dbSchema.map((table) => <TableList key={table.tableName} tableInfo={table} />)}
            </ul>
          </div>
          <div className="flex-none">
          <TriDataRetrieve client={client} db={db} onAddDataSource={handleAddDataSource} />
          <FileUpload db={db} onAddDataSource={handleAddDataSource} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={90}>
        <ResizablePanelGroup className="h-screen" direction="vertical">
          <ResizablePanel defaultSize={25}>
            <div className="w-full h-full">
              <QueryEditor onRunQuery={handleRunQuery} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="w-full h-full">
              <Perspective results={results} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default App
