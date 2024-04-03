import { useState, useEffect } from 'react';
import { AsyncDuckDB, TableInfo, retrieveSchema } from '@/lib/db';
import { Input } from '@/components/ui/input';
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

function FileUpload(props: { 
    db: AsyncDuckDB | undefined,
    onAddDataSource: (data: TableInfo) => void;
  }) {

  const {
    db,
    onAddDataSource,
  } = props;

  const fileReader = new FileReader();

  const [fileName, setFileName] = useState<string | undefined>();
  const [fileContents, setFileContents] = useState<string | undefined>();
  const [open, setOpen] = useState<boolean>(false);

  const { toast } = useToast();

  fileReader.onload = function (e) {
    if(e && e.target) {
      setFileContents(e.target?.result?.toString());
    }
  }

  const handleFileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
      setFileName(e.target.files[0].name.replace('.csv', ''));
      fileReader.readAsText(e.target.files[0]);
    }
    
  }

  useEffect(() => {
    if (db && fileName && fileContents) {
      const loadData = async () => {
        const c = await db.connect();
        try {
          await db.registerFileText(fileName, fileContents);
          await c.insertCSVFromPath(fileName, {
            schema: 'main',
            name: fileName,
            detect: true,
            create: true,
          });
          const schema = await retrieveSchema(c, fileName);
          onAddDataSource(schema);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
          toast({
            title: "File Import Error",
            description: ex.message,
            variant: "destructive",
          });
        } finally {
          await c.close();
          setFileName(undefined);
          setFileContents(undefined);
          setOpen(false);
        }
      }

      loadData();
    }
  }, [db, fileName, fileContents]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button className="my-1 w-full" variant="outline">Import Local File</Button>
    </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Local File</DialogTitle>
          <DialogDescription>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="fileImport"
                type="file"
                accept={".csv"}
                onChange={handleFileOnChange}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

}

export default FileUpload;