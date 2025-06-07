'use client';
import React from 'react';
import { Plus, Pencil, Trash } from 'lucide-react';

export default function FieldTableRows(
  { fields, onAdd, onAddCrop, onEdit, onDelete }:{
    fields:any[]; onAdd:()=>void; onAddCrop:(id:string)=>void;
    onEdit:(id:string)=>void; onDelete:(id:string)=>void;
  },
){
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Area (ha)</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* add row */}
          <tr onClick={onAdd}
              className="cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50">
            <td className="px-3 py-2">
              <Plus className="w-4 h-4 inline mr-1"/>Add field
            </td><td/><td/>
          </tr>

          {fields.map(f=>(
            <tr key={f.id} className="even:bg-gray-50">
              <td className="px-3 py-2">{f.name}</td>
              <td className="px-3 py-2">
                {f.areaHectares!=null ? f.areaHectares.toFixed(2) : '—'}
              </td>
              <td className="px-3 py-2 flex gap-3">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
