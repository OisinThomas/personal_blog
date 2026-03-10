'use client';

import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { TableBlockNode } from '@/lib/lexical/nodes/TableBlockNode';
import { Plus, Minus } from 'lucide-react';

interface TableBlockNodeComponentProps {
  nodeKey: string;
}

export default function TableBlockNodeComponent({ nodeKey }: TableBlockNodeComponentProps) {
  const [editor] = useLexicalComposerContext();

  const [nodeData, setNodeData] = useState(() => {
    let data = { headers: ['Header 1', 'Header 2'], rows: [['', '']], alignments: ['left', 'left'] };
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof TableBlockNode) {
        data = {
          headers: node.getHeaders(),
          rows: node.getRows(),
          alignments: node.getAlignments(),
        };
      }
    });
    return data;
  });

  const updateNode = useCallback(
    (updates: Partial<typeof nodeData>) => {
      const newData = { ...nodeData, ...updates };
      setNodeData(newData);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node instanceof TableBlockNode) {
          if (updates.headers) node.setHeaders(updates.headers);
          if (updates.rows) node.setRows(updates.rows);
          if (updates.alignments) node.setAlignments(updates.alignments);
        }
      });
    },
    [editor, nodeKey, nodeData]
  );

  const updateHeader = (colIdx: number, value: string) => {
    const newHeaders = [...nodeData.headers];
    newHeaders[colIdx] = value;
    updateNode({ headers: newHeaders });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = nodeData.rows.map((r) => [...r]);
    newRows[rowIdx][colIdx] = value;
    updateNode({ rows: newRows });
  };

  const addColumn = () => {
    const newHeaders = [...nodeData.headers, `Header ${nodeData.headers.length + 1}`];
    const newRows = nodeData.rows.map((r) => [...r, '']);
    const newAlignments = [...nodeData.alignments, 'left'];
    updateNode({ headers: newHeaders, rows: newRows, alignments: newAlignments });
  };

  const removeColumn = (colIdx: number) => {
    if (nodeData.headers.length <= 1) return;
    const newHeaders = nodeData.headers.filter((_, i) => i !== colIdx);
    const newRows = nodeData.rows.map((r) => r.filter((_, i) => i !== colIdx));
    const newAlignments = nodeData.alignments.filter((_, i) => i !== colIdx);
    updateNode({ headers: newHeaders, rows: newRows, alignments: newAlignments });
  };

  const addRow = () => {
    const newRow = Array(nodeData.headers.length).fill('');
    updateNode({ rows: [...nodeData.rows, newRow] });
  };

  const removeRow = (rowIdx: number) => {
    if (nodeData.rows.length <= 1) return;
    updateNode({ rows: nodeData.rows.filter((_, i) => i !== rowIdx) });
  };

  return (
    <div className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" data-lexical-decorator="true">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {nodeData.headers.map((header, colIdx) => (
                <th key={colIdx} className="relative group">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(colIdx, e.target.value)}
                    className="w-full px-3 py-2 bg-transparent font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
                  />
                  {nodeData.headers.length > 1 && (
                    <button
                      onClick={() => removeColumn(colIdx)}
                      className="absolute top-0.5 right-0.5 p-0.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                </th>
              ))}
              <th className="w-8">
                <button
                  onClick={addColumn}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {nodeData.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-t border-gray-200 dark:border-gray-700 group">
                {row.map((cell, colIdx) => (
                  <td key={colIdx}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
                    />
                  </td>
                ))}
                <td className="w-8">
                  {nodeData.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(rowIdx)}
                      className="p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add row
        </button>
      </div>
    </div>
  );
}
