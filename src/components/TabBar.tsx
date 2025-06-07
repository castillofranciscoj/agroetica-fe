'use client';
import React from 'react';
import { Grid, List as ListIcon, Table as TableIcon } from 'lucide-react';

export type Mode = 'grid' | 'list' | 'table';

export default function TabBar(
  { value, onChange }:{ value:Mode; onChange:(m:Mode)=>void },
) {
  const Item = (
    { id, icon, label }:{ id:Mode; icon:JSX.Element; label:string },
  ) => (
    <button
      onClick={() => onChange(id)}
      className={`px-4 py-2 rounded-t-md border-b-2 flex items-center gap-1
        ${value===id
          ? 'border-green-600 text-green-700 font-semibold'
          : 'border-transparent hover:bg-gray-50'}`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="flex border-b mb-4 gap-1">
      <Item id="grid"  icon={<Grid     className="w-4 h-4"/>} label="Grid"   />
      <Item id="list"  icon={<ListIcon className="w-4 h-4"/>} label="List"   />
      <Item id="table" icon={<TableIcon className="w-4 h-4"/>} label="Detail"/>
    </div>
  );
}
