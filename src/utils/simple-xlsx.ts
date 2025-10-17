// Simple XLSX creator without external dependencies
export function createSimpleXLSX(data: Record<string, unknown>[], columns: { key: string; label: string }[], sheetName = 'Sheet1'): Blob {
  console.log('Creating Simple Excel XML with:', { dataRows: data.length, columns: columns.length, sheetName });
  
  // Create minimal XLSX structure
  const xl = {
    worksheets: [{
      name: sheetName,
      data: [
        columns.map(col => col.label), // Header row
        ...data.map(row => columns.map(col => row[col.key] ?? ''))
      ]
    }]
  };

  // Generate Excel XML content (SpreadsheetML format)
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Briconomy Report</Title>
  <Author>Briconomy Property Management</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Briconomy</Company>
  <Version>1.0</Version>
 </DocumentProperties>
 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
  <WindowHeight>9000</WindowHeight>
  <WindowWidth>13860</WindowWidth>
  <WindowTopX>240</WindowTopX>
  <WindowTopY>75</WindowTopY>
  <ProtectStructure>False</ProtectStructure>
  <ProtectWindows>False</ProtectWindows>
 </ExcelWorkbook>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="s62">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="s63">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table ss:ExpandedColumnCount="${columns.length}" ss:ExpandedRowCount="${xl.worksheets[0].data.length}">
   ${xl.worksheets[0].data.map((row, rowIndex) => `
    <Row>
     ${row.map((cell, _colIndex) => `
      <Cell ss:StyleID="${rowIndex === 0 ? 's62' : 's63'}"><Data ss:Type="${isNumber(cell) && rowIndex > 0 ? 'Number' : 'String'}">${escapeXml(String(cell))}</Data></Cell>`).join('')}
    </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  console.log('Simple Excel XML generated, size:', xmlContent.length, 'characters');
  return new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function isNumber(value: unknown): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return match;
    }
  });
}