import { useEffect, useRef } from 'react';
import '@finos/perspective-viewer/dist/css/pro.css';
import '@finos/perspective-viewer';
import '@finos/perspective-viewer-datagrid';
import '@finos/perspective-viewer-d3fc';
import perspective from '@finos/perspective';
import { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';

function Perspective(props: { results: Uint8Array | undefined }) {

  const viewerRef  = useRef<HTMLPerspectiveViewerElement>(null);
  const {
    results
  } = props;

  useEffect(() => {
    const loadData = async () => {
      if (results && viewerRef && viewerRef.current) {
        const worker = await perspective.worker();
        const table = await worker.table(results.buffer);
        viewerRef.current.load(table);
      }
    }

    loadData();
  }, [results, viewerRef]);

  return (
    <div className="flex h-full w-full">
      <perspective-viewer style={{height: "100%", width: "100%"}} ref={viewerRef}></perspective-viewer>
    </div>
  );

}

export default Perspective;