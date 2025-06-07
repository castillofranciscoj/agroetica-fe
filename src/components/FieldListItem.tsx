'use client';
import React from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';

export default function FieldListItem(
  { fields, onAdd, onAddCrop, onEdit, onDelete }:{
    fields:any[]; onAdd:()=>void; onAddCrop:(id:string)=>void;
    onEdit:(id:string)=>void; onDelete:(id:string)=>void;
  },
){
  return (
    <ul className="space-y-3">
      {/* dotted “add” row */}
      <li onClick={onAdd}
          className="border-2 border-dashed border-gray-300 rounded p-4
                     flex items-center gap-2 cursor-pointer hover:bg-gray-50">
        <Plus className="w-4 h-4"/>Add field
      </li>

      {fields.map(f=>(
        <li key={f.id}
            className="border rounded p-4 grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 even:bg-gray-50">
          <span className="truncate font-medium">{f.name}</span>

          <button onClick={()=>onEdit(f.id)}
                  className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-green-700">
            <Pencil className="w-3 h-3"/>Edit
          </button>

          <button onClick={()=>onDelete(f.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
            <Trash className="w-3 h-3"/>Delete
          </button>

          <button onClick={()=>onAddCrop(f.id)}
                  className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
            <Plus className="w-3 h-3"/>Crop
          </button>
        </li>
      ))}
    </ul>
  );
}
