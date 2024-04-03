import { useState } from 'react';
import { TableInfo } from '@/lib/db';
import FieldList from '@/components/FieldList';

function TableList(props: { tableInfo: TableInfo; }) {
  const {
    tableInfo
  } = props;


  const [isOpen, setIsOpen] = useState(true);

  const handleOnClick = () => {
    setIsOpen(!isOpen);
  }

  return(
        <li>
          <span onClick={handleOnClick} className="text-xl cursor-pointer">{tableInfo.tableName}</span>
          {isOpen && <FieldList columns={tableInfo.columns} />}
        </li>
  )
}

export default TableList;