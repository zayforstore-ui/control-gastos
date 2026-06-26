/**
 * Google Apps Script — Backend para Control de Gastos
 *
 * INSTRUCCIONES:
 * 1. Crea una hoja en Google Sheets
 * 2. Extensiones → Apps Script
 * 3. Pega este código y guarda (Ctrl+S)
 * 4. Deploy → Nuevo deployment → Web app
 *    - Ejecutar como: "tu mismo"
 *    - Acceso: "Cualquiera"
 * 5. Copia la URL generada
 * 6. Pégala en la app → Configuración
 */

// ─── Columnas de la hoja ────────────────────────────
// A:id | B:type | C:amount | D:description | E:category | F:date | G:createdAt

function doGet() {
  const sheet = getSheet()
  const rows = sheet.getDataRange().getValues()
  const headers = rows.shift() || []
  const data = rows.map(r => ({
    id: r[0] || '',
    type: r[1] || '',
    amount: Number(r[2]) || 0,
    description: r[3] || '',
    category: r[4] || '',
    date: r[5] || '',
    createdAt: r[6] || '',
  }))
  return json(data)
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const sheet = getSheet()

    if (body.action === 'replace') {
      clearSheet(sheet)
      if (body.data && body.data.length) {
        setHeaders(sheet)
        body.data.forEach(t => sheet.appendRow(toRow(t)))
      }
      return json({ ok: true })

    } else if (body.action === 'add') {
      setHeaders(sheet)
      sheet.appendRow(toRow(body.transaction))
      return json({ ok: true })

    } else if (body.action === 'delete') {
      const rows = sheet.getDataRange().getValues()
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i][0] === body.id) {
          sheet.deleteRow(i + 1)
          break
        }
      }
      return json({ ok: true })

    } else if (body.action === 'clear') {
      clearSheet(sheet)
      return json({ ok: true })
    }

    return json({ error: 'unknown action' }, 400)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
}

// ─── Helpers ────────────────────────────────────────

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getActiveSheet()
  if (sheet.getLastRow() === 0) setHeaders(sheet)
  return sheet
}

function setHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'type', 'amount', 'description', 'category', 'date', 'createdAt'])
  }
}

function clearSheet(sheet) {
  sheet.clearContents()
  sheet.clearNotes()
}

function toRow(t) {
  return [t.id, t.type, t.amount, t.description, t.category, t.date, t.createdAt]
}

function json(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
