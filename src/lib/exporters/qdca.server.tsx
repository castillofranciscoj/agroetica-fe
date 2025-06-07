import * as React from 'react';
import { Workbook } from 'exceljs';
import { pdf }      from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/* ---------- Excel -------------------------------------------------- */
export async function qdcaToExcel(rows: any[] = []) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('QDCA');

  ws.columns = [
    { header: 'Campo',     key: 'field', width: 22 },
    { header: 'Data',      key: 'date',  width: 14 },
    { header: 'Tipo',      key: 'type',  width: 16 },
    { header: 'Prodotto',  key: 'product', width: 28 },
    { header: 'Dose',      key: 'dose',    width: 10 },
    { header: 'Operatore', key: 'operator',width: 20 },
    { header: 'Macchina',  key: 'equip',   width: 20 },
  ];

  rows.forEach(r =>
    ws.addRow({
      field   : r.field?.name,
      date    : new Date(r.activity_date).toLocaleDateString('it-IT'),
      type    : r.activity_type,
      product : r.inputs?.[0]?.product?.name ?? '',
      dose    : r.inputs?.[0] ? `${r.inputs[0].dose} ${r.inputs[0].unit}` : '',
      operator: r.operator?.name,
      equip   : r.equipment?.name,
    }),
  );

  return wb.xlsx.writeBuffer();
}

/* ---------- PDF ---------------------------------------------------- */
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10 },
  row : { flexDirection: 'row', borderBottom: '1 solid #ddd', padding: 4 },
  cell: { flexGrow: 1 },
  head: { fontWeight: 'bold', backgroundColor: '#eee' },
});

function PdfDoc({ rows = [] }: { rows?: any[] }): ReactElement {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.row, styles.head]}>
          {['Campo','Data','Tipo','Prodotto','Dose','Operatore','Macchina']
            .map(t => <Text key={t} style={styles.cell}>{t}</Text>)}
        </View>

        {rows.map(r => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.cell}>{r.field?.name}</Text>
            <Text style={styles.cell}>
              {new Date(r.activity_date).toLocaleDateString('it-IT')}
            </Text>
            <Text style={styles.cell}>{r.activity_type}</Text>
            <Text style={styles.cell}>{r.inputs?.[0]?.product?.name ?? ''}</Text>
            <Text style={styles.cell}>
              {r.inputs?.[0] ? `${r.inputs[0].dose} ${r.inputs[0].unit}` : ''}
            </Text>
            <Text style={styles.cell}>{r.operator?.name}</Text>
            <Text style={styles.cell}>{r.equipment?.name}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function qdcaToPdf(rows: any[] = []) {
  return pdf(<PdfDoc rows={rows} />).toBuffer();
}
