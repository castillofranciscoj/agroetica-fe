'use client';
import React from 'react';
import { Plus } from 'lucide-react';

export default function AddCard(
  { label, onClick }:{ label:string; onClick:()=>void },
) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed border-gray-300 rounded flex flex-col
                 items-center justify-center text-gray-500 hover:bg-gray-50"
    >
      <Plus className="w-8 h-8 mb-2"/>{label}
    </button>
  );
}
