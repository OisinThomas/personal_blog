import {
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { ReactNode } from 'react';

export type SerializedTableBlockNode = Spread<
  {
    headers: string[];
    rows: string[][];
    alignments: string[];
  },
  SerializedLexicalNode
>;

export class TableBlockNode extends DecoratorNode<ReactNode> {
  __headers: string[];
  __rows: string[][];
  __alignments: string[];

  static getType(): string {
    return 'tableblock';
  }

  static clone(node: TableBlockNode): TableBlockNode {
    return new TableBlockNode(
      [...node.__headers],
      node.__rows.map(r => [...r]),
      [...node.__alignments],
      node.__key
    );
  }

  constructor(
    headers: string[] = ['Header 1', 'Header 2'],
    rows: string[][] = [['', '']],
    alignments: string[] = ['left', 'left'],
    key?: NodeKey
  ) {
    super(key);
    this.__headers = headers;
    this.__rows = rows;
    this.__alignments = alignments;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  static importJSON(serializedNode: SerializedTableBlockNode): TableBlockNode {
    return new TableBlockNode(
      serializedNode.headers,
      serializedNode.rows,
      serializedNode.alignments
    );
  }

  exportJSON(): SerializedTableBlockNode {
    return {
      type: 'tableblock',
      version: 1,
      headers: this.__headers,
      rows: this.__rows,
      alignments: this.__alignments,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-table-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    this.__headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.__rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return { element: table };
  }

  getHeaders(): string[] { return this.__headers; }
  getRows(): string[][] { return this.__rows; }
  getAlignments(): string[] { return this.__alignments; }

  setHeaders(headers: string[]): void {
    const self = this.getWritable();
    self.__headers = headers;
  }
  setRows(rows: string[][]): void {
    const self = this.getWritable();
    self.__rows = rows;
  }
  setAlignments(alignments: string[]): void {
    const self = this.getWritable();
    self.__alignments = alignments;
  }

  decorate(): ReactNode {
    const TableBlockNodeComponent = require('@/components/admin/lexical/blocks/TableBlockNodeComponent').default;
    return <TableBlockNodeComponent nodeKey={this.__key} />;
  }

  isInline(): false {
    return false;
  }
}

export function $createTableBlockNode(payload: {
  headers?: string[];
  rows?: string[][];
  alignments?: string[];
} = {}): TableBlockNode {
  const headers = payload.headers ?? ['Header 1', 'Header 2'];
  const cols = headers.length;
  return new TableBlockNode(
    headers,
    payload.rows ?? [Array(cols).fill('')],
    payload.alignments ?? Array(cols).fill('left')
  );
}

export function $isTableBlockNode(node: LexicalNode | null | undefined): node is TableBlockNode {
  return node instanceof TableBlockNode;
}
