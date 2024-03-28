/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Button } from '@/components/ui/button';


function QueryEditor(props: { onRunQuery: (query: string) => void }) {

  const {
    onRunQuery
  } = props;
  
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (ed, _monaco) => {
    if(!editor && ed) {
      setEditor(ed);
    }
  }

  const runQuery = () => {
    if (editor) {
      const selection = editor.getSelection();
      const selectedValue = editor.getModel()?.getValueInRange(selection!);
      if(selection && selectedValue) {
        onRunQuery(selectedValue);
      } else {
        onRunQuery(editor.getValue());
      }
    }
  }

	return <div className="h-screen w-full">
          <Button 
            className="my-1 ml-1"
            onClick={runQuery}
            variant="outline">Run Query</Button>
          <Editor 
            onMount={handleEditorDidMount}
            defaultLanguage="sql" 
            defaultValue="// Enter SQL Here" 
            options={{
              minimap: {
                enabled: false,
              }
            }}
          />
        </div>;
}

export default QueryEditor;