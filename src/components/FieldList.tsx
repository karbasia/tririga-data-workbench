import { TableColumns } from '@/lib/db';

function FieldList(props: { columns: TableColumns[]; }) {
  const {
    columns
  } = props;

  return(
    <ul className="pl-5">
      {columns.map((col) => (
        <li key={col.name}>
          <span className="text-sm">{col.name}</span> <span className="text-xs text-gray-600">{col.type}</span>
        </li>
      ))}
    </ul>
  )
}

export default FieldList;