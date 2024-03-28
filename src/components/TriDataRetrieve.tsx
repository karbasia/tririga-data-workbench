import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useDebounce } from 'use-debounce';
import Client, { ReportData, ReportDetails, ReportListFilters } from 'tririga-js-sdk';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import APIWorker from '@/workers/apiWorker?worker';
import { TableInfo, retrieveSchema } from '@/lib/db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function TriDataRetrieve(props: { 
    client: Client | undefined,
    db: AsyncDuckDB | undefined,
    onAddDataSource: (data: TableInfo) => void;
  }) {

  const {
    client,
    db,
    onAddDataSource,
  } = props;

  const [searchVal, setSearchVal] = useState('');
  const [debSearchVal] = useDebounce(searchVal, 500);
  const [reportResults, setReportResults] = useState<ReportDetails[] | undefined>([]);
  const [open, setOpen] = useState<boolean>(false);

  const { toast } = useToast();

  const worker = useMemo(() => new APIWorker(), []);

  useEffect(() => {
    if (debSearchVal && client) {

      const updateResults = async () => {
        const filters: ReportListFilters = {
          name: debSearchVal,
          // tag: 'data-dashboard' // Add whatever report tag to filter the list
        }
        const resp = await client.report.getQueryList(0, 20, filters);
        setReportResults(resp.data);
      }

      updateResults();
    }
  }, [debSearchVal]);


  const onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  }

  const handleReportClick = async (e: ReportDetails) => {
    const reportData = await client?.report.getReportData(e.reportId,0,10000);
    const reportName = e.HtmlEscapedName.replace(/ /g, '').replace(/-/g,'');
    if (reportData && db && window.Worker) {

      worker.postMessage({
        type: 'CLEAN_DATA',
        data: reportData,
        name: reportName,
      });
    }

  }

  const createTable = async (reportData: ReportData, reportName: string) => {
    if (db) {
      const c = await db.connect();
      try {
        await db.registerFileText(`${reportName}.json`, JSON.stringify(reportData));
        await c.insertJSONFromPath(`${reportName}.json`, { name: reportName });
        const schema = await retrieveSchema(c, reportName);
        onAddDataSource(schema);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        toast({
          title: "TRIRIGA Data Import Error",
          description: ex.message,
          variant: "destructive",
        });
      } finally {
        await c.close();
        setReportResults([]);
        setSearchVal('');
        setOpen(false);
      }
    }
  }

  useEffect(() => {
    if (window.Worker && db) {
      worker.onmessage = (e) => {
        if (e.data.status === 'COMPLETE') {
          createTable(e.data.output.data, e.data.output.reportName);
        }
      }
    }
  }, [worker, db]);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button 
        className="my-1 w-full" 
        variant="outline"
        disabled={!client}
      >
        Import TRIRIGA Report
      </Button>
    </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import TRIRIGA Report</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col">
              <input
                className="w-full border-2 border-gray-300"
                onChange={onChangeValue}
                value={searchVal}
              />
              {reportResults && reportResults.length > 0 && (
                <ul id="searchResults">
                  {reportResults.map((report) => (
                    <li
                      className="cursor-pointer overflow-y-auto border-[1px] rounded-lg shadow-lg p-2"
                      key={report.reportId}
                      onClick={() => handleReportClick(report)}
                    >
                        {report.HtmlEscapedName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default TriDataRetrieve;