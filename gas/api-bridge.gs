// ============================================================
// MANSION REALTY — Google Apps Script API Bridge
// Disesuaikan dengan CRM crm-broker2026
// ============================================================

var SHEET_ID   = '1iHIGVPl7l7dDEVpqHGvZxFVIL8nqUx3G_skBPzFimzI'
var API_SECRET = 'mansion2026'

var SHEETS = {
  LISTINGS: 'LISTING',
  PROJECTS: 'PROJECTS',
  AGENTS:   'AGENTS',
  NEWS:     'NEWS',
  LEADS:    'LEADS',
  PIPELINE: 'PIPELINE_STAGES',
  TEAMS:    'TEAMS',
  CONFIG:   'CONFIG',
}

// ── ENTRY POINT GET ───────────────────────────────────────
function doGet(e) {
  if (e.parameter.secret !== API_SECRET) {
    return resp({ success: false, error: 'Unauthorized' })
  }

  var action = e.parameter.action || ''

  try {
    switch (action) {

      case 'getListings':
        var listings = getSheet(SHEETS.LISTINGS)
        var active = listings.filter(function(r) {
          var status = String(r['STATUS'] || r['Status'] || r['status'] || '').toLowerCase()
          return status === 'aktif' || status === 'active' || status === ''
        })
        return resp({ success: true, data: active, total: active.length })

      case 'getProjects':
        var projects = getSheet(SHEETS.PROJECTS)
        var activeProj = projects.filter(function(r) {
          var status = String(r['STATUS'] || r['Status'] || r['status'] || '').toLowerCase()
          return status !== 'inactive' && status !== 'deleted'
        })
        return resp({ success: true, data: activeProj, total: activeProj.length })

      case 'getAgents':
        var agents = getSheet(SHEETS.AGENTS)
        var activeAgents = agents.filter(function(r) {
          var status = String(r['STATUS'] || r['Status'] || r['status'] || '').toLowerCase()
          return status !== 'inactive' && status !== 'deleted' && status !== 'resigned'
        })
        // Strip kolom sensitif sebelum dikirim
        activeAgents = activeAgents.map(function(r) {
          var safe = {}
          Object.keys(r).forEach(function(k) {
            if (k !== 'Password_Hash' && k !== 'Password' && k !== 'Telegram_ID') safe[k] = r[k]
          })
          return safe
        })
        return resp({ success: true, data: activeAgents, total: activeAgents.length })

      case 'getNews':
        var news = getSheet(SHEETS.NEWS)
        var published = news.filter(function(r) {
          var status = String(r['STATUS'] || r['Status'] || r['status'] || '').toLowerCase()
          return status === 'published' || status === 'aktif' || status === ''
        })
        return resp({ success: true, data: published, total: published.length })

      case 'getLeads':
        var leads = getSheet(SHEETS.LEADS)
        var agentId = e.parameter.agentId || ''
        if (agentId) {
          leads = leads.filter(function(r) {
            return String(r['Agen_ID'] || r['AGENT_ID'] || r['Agent_ID'] || '') === agentId
          })
        }
        return resp({ success: true, data: leads, total: leads.length })

      case 'getConfig':
        var ss = SpreadsheetApp.openById(SHEET_ID)
        var cfgSheet = ss.getSheetByName(SHEETS.CONFIG)
        if (!cfgSheet) return resp({ success: true, value: null, data: {} })
        var cfgData = cfgSheet.getDataRange().getValues()
        var cfgObj  = {}
        for (var ci = 1; ci < cfgData.length; ci++) {
          var k = String(cfgData[ci][0] || '').trim()
          var v = String(cfgData[ci][1] || '').trim()
          if (k) cfgObj[k] = v
        }
        var singleKey = e.parameter.key || ''
        if (singleKey) return resp({ success: true, value: cfgObj[singleKey] || null })
        return resp({ success: true, data: cfgObj })

      case 'saveConfig':
        var cfgKey   = e.parameter.key   || ''
        var cfgValue = e.parameter.value || ''
        if (!cfgKey) return resp({ success: false, error: 'key required' })
        var ss2      = SpreadsheetApp.openById(SHEET_ID)
        var cfgSht   = ss2.getSheetByName(SHEETS.CONFIG)
        if (!cfgSht) {
          cfgSht = ss2.insertSheet(SHEETS.CONFIG)
          cfgSht.getRange(1,1,1,3).setValues([['Key','Value','Updated_At']])
        }
        var cfgRows = cfgSht.getDataRange().getValues()
        for (var ri = 1; ri < cfgRows.length; ri++) {
          if (String(cfgRows[ri][0]).trim() === cfgKey) {
            cfgSht.getRange(ri + 1, 2).setValue(cfgValue)
            cfgSht.getRange(ri + 1, 3).setValue(new Date().toISOString())
            return resp({ success: true, message: 'Updated: ' + cfgKey })
          }
        }
        cfgSht.appendRow([cfgKey, cfgValue, new Date().toISOString()])
        return resp({ success: true, message: 'Inserted: ' + cfgKey })

      case 'saveNews':
        var ss3      = SpreadsheetApp.openById(SHEET_ID)
        var newsSht  = ss3.getSheetByName(SHEETS.NEWS)
        if (!newsSht) return resp({ success: false, error: 'Sheet NEWS tidak ada' })
        var ts = new Date().toISOString()
        newsSht.appendRow([
          ts,
          e.parameter.Judul     || '',
          e.parameter.Kategori  || 'Berita Properti',
          e.parameter.Ringkasan || '',
          e.parameter.Konten    || '',
          e.parameter.foto_url  || '',
          ts
        ])
        return resp({ success: true, message: 'Berita tersimpan!' })

      case 'getLeads':
        var allLeads = getSheet(SHEETS.LEADS)
        var agentId  = e.parameter.agentId || ''
        var filtered = agentId
          ? allLeads.filter(function(r) { return String(r['Agen_ID'] || '') === agentId })
          : allLeads
        return resp({ success: true, data: filtered, total: filtered.length })

      case 'updateLeadStatus':
        var updLeadId = e.parameter.leadId || ''
        var updStatus = e.parameter.status || ''
        if (!updLeadId || !updStatus) return resp({ success: false, error: 'leadId & status wajib' })
        updateLeadStatus(updLeadId, updStatus)
        return resp({ success: true, message: 'Status lead diperbarui' })

      case 'saveLead':
        // Terima via GET params (hindari masalah POST redirect body hilang)
        saveLead(e.parameter)
        return resp({ success: true, message: 'Lead berhasil disimpan' })

      case 'getHeaders':
        var sheetName = e.parameter.sheet || SHEETS.LISTINGS
        var ss4   = SpreadsheetApp.openById(SHEET_ID)
        var sht   = ss4.getSheetByName(sheetName)
        if (!sht) return resp({ success: false, error: 'Sheet tidak ditemukan: ' + sheetName })
        var headers = sht.getRange(1, 1, 1, sht.getLastColumn()).getValues()[0]
        return resp({ success: true, sheet: sheetName, headers: headers })

      default:
        return resp({ success: false, error: 'Unknown action: ' + action })
    }
  } catch (err) {
    return resp({ success: false, error: err.message })
  }
}

// ── ENTRY POINT POST (fallback, tidak dipakai utama) ──────
function doPost(e) {
  try {
    var body = {}
    if (e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents) } catch(pe) {}
    }
    var secret = body.secret || e.parameter.secret || ''
    if (secret !== API_SECRET) return resp({ success: false, error: 'Unauthorized' })
    return resp({ success: false, error: 'Gunakan GET dengan action param' })
  } catch(err) {
    return resp({ success: false, error: err.message })
  }
}

// ── HELPER: Ambil data sheet sebagai array of objects ─────
function getSheet(sheetName) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(sheetName)
  if (!sheet) throw new Error('Sheet "' + sheetName + '" tidak ditemukan')

  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()
  if (lastRow < 2) return []

  var data    = sheet.getRange(1, 1, lastRow, lastCol).getValues()
  var headers = data[0]
  var rows    = data.slice(1)

  return rows
    .filter(function(row) {
      return row.some(function(cell) { return cell !== '' && cell !== null })
    })
    .map(function(row) {
      var obj = {}
      headers.forEach(function(header, i) {
        var val = row[i]
        if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
        }
        obj[String(header)] = (val !== undefined && val !== null) ? val : ''
      })
      return obj
    })
}

// ── HELPER: saveLead → LEADS sheet (header-based mapping) ─
function saveLead(p) {
  // p = e.parameter (semua string dari URL params)
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) throw new Error('Sheet LEADS tidak ditemukan')

  // Lookup Agen_Nama dari AGENTS
  var agenNama = ''
  if (p.agentId) {
    try {
      var agenSheet   = ss.getSheetByName(SHEETS.AGENTS)
      var agenData    = agenSheet.getDataRange().getValues()
      var agenHeaders = agenData[0]
      var idCol   = agenHeaders.indexOf('ID')
      var namaCol = agenHeaders.indexOf('Nama')
      if (idCol >= 0 && namaCol >= 0) {
        for (var i = 1; i < agenData.length; i++) {
          if (String(agenData[i][idCol]) === String(p.agentId)) {
            agenNama = String(agenData[i][namaCol]); break
          }
        }
      }
    } catch(e2) { /* skip */ }
  }

  var now      = new Date().toISOString()
  var isProyek = String(p.source || '') === 'Web-Proyek'
  var isTitip  = String(p.source || '') === 'TitipListing'
  var minat    = p.minatTipe  || (isTitip ? 'Titip/Jual' : isProyek ? 'Proyek Baru' : 'Beli')
  var jenis    = p.jenis      || (isTitip ? 'Titip'      : isProyek ? 'Primary'     : 'Secondary')

  // Baca header aktual sheet — isi nilai sesuai posisi kolom yang ada
  // Ini memastikan data masuk ke kolom yang benar tanpa peduli urutan
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  var values  = {
    'ID':                   'LEAD-' + Date.now(),
    'Tanggal':              now,
    'Nama':                 p.name          || '',
    'No_WA':                p.phone         || '',
    'Email':                p.email         || '',
    'Sumber':               p.source        || 'Web',
    'Keterangan':           p.message       || '',
    'Minat_Tipe':           minat,
    'Properti_Diminati':    p.listingTitle  || '',
    'Budget_Min':           p.budgetMin     || '',
    'Budget_Max':           p.budgetMax     || '',
    'Lokasi_Preferred':     p.lokasi        || '',
    'Status_Lead':          'Baru',
    'Agen_ID':              p.agentId       || '',
    'Agen_Nama':            agenNama,
    'Last_Contact':         '',
    'Next_Follow_Up':       '',
    'Notes':                '',
    'Score':                'Warm',
    'Created_At':           now,
    'Updated_At':           now,
    'Tipe_Properti':        p.tipeProperti  || '',
    'Jenis':                jenis,
    'Catatan':              '',
    'Last_Activity_Date':   now,
    'Catatan_Out':          '',
    'Is_Buyer_Request':     isTitip ? 'FALSE' : 'TRUE',
    'Team_ID':              '',
    'Closing_Tipe':         '',
    'Closing_Listing_ID':   isTitip ? '' : (p.listingId    || ''),
    'Closing_Listing_Nama': isTitip ? '' : (p.listingTitle || ''),
    'Closing_Cobroke':      '',
    'Closing_Proyek':       isProyek ? (p.listingTitle || '') : '',
    'Tanggal_Dihubungi':    '',
  }

  // Map ke posisi kolom aktual di sheet
  var newRow = headers.map(function(h) {
    var key = String(h).trim()
    return (values[key] !== undefined) ? values[key] : ''
  })

  sheet.appendRow(newRow)
}

// ── HELPER: updateLeadStatus → update kolom Status_Lead ──
function updateLeadStatus(leadId, status) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) throw new Error('Sheet LEADS tidak ditemukan')

  var data    = sheet.getDataRange().getValues()
  var headers = data[0]
  var idCol   = headers.indexOf('ID')
  var stCol   = headers.indexOf('Status_Lead')
  var updCol  = headers.indexOf('Updated_At')

  if (idCol < 0 || stCol < 0) throw new Error('Kolom ID atau Status_Lead tidak ditemukan')

  var now = new Date().toISOString()
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(leadId).trim()) {
      sheet.getRange(i + 1, stCol + 1).setValue(status)
      if (updCol >= 0) sheet.getRange(i + 1, updCol + 1).setValue(now)
      return
    }
  }
  throw new Error('Lead tidak ditemukan: ' + leadId)
}

// ── HELPER: Response JSON ─────────────────────────────────
function resp(data) {
  data.timestamp = new Date().toISOString()
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ── MIGRATION: Perbaiki row CRM lama (H dan I tertukar) ───
// Diagnosis: row lama CRM menulis Properti_Diminati ke H (Minat_Tipe)
// dan Minat_Tipe ke I (Properti_Diminati) — posisi terbalik.
// Script ini swap H↔I untuk row lama CRM saja.
// Jalankan SEKALI dari GAS editor: Run → migrateLegacyCRMLeads
function migrateLegacyCRMLeads() {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) { Logger.log('❌ Sheet LEADS tidak ditemukan'); return }

  var lastRow = sheet.getLastRow()
  if (lastRow < 2) { Logger.log('Tidak ada data'); return }

  var data = sheet.getRange(1, 1, lastRow, 14).getValues() // A–N cukup

  var migrated = 0
  var skipped  = 0

  for (var i = 1; i < data.length; i++) {
    var row   = data[i]
    var rowId = String(row[0] || '').trim()
    var colG  = String(row[6] || '').trim()   // G = Keterangan
    var colH  = String(row[7] || '').trim()   // H = Minat_Tipe (seharusnya)
    var colI  = String(row[8] || '').trim()   // I = Properti_Diminati

    // Skip baris kosong
    if (!rowId) { skipped++; continue }

    // Skip row dari WEB (ID = "LEAD-timestamp")
    if (rowId.indexOf('LEAD-') === 0) { skipped++; continue }

    // Skip jika G tidak kosong (bukan pola lama) atau H sudah kosong (tidak perlu swap)
    if (colG !== '' || colH === '') { skipped++; continue }

    // Skip jika H sudah berisi nilai Minat_Tipe yang valid (sudah benar)
    var minatValid = ['Beli', 'Sewa', 'Jual', 'Proyek Baru', 'Titip/Jual', 'Buyer Request', 'Sewa/Beli', '']
    if (minatValid.indexOf(colH) !== -1) { skipped++; continue }

    // === Row lama CRM: swap H (idx7) dan I (idx8) ===
    var rowNum = i + 1
    // colH = nama properti (Properti_Diminati), colI = Minat_Tipe (biasanya kosong)
    // Taruh: H = colI (Minat_Tipe), I = colH (Properti_Diminati)
    sheet.getRange(rowNum, 8, 1, 2).setValues([[colI, colH]])
    migrated++
    Logger.log('✅ Row ' + rowNum + ' [' + rowId + '] swap H↔I: H="' + colH.substring(0,40) + '" → I')
  }

  Logger.log('\n==============================')
  Logger.log('Migration selesai: ' + migrated + ' baris diperbaiki, ' + skipped + ' dilewati')
}

// ── DIAGNOSA: Cek isi kolom A–H semua row LEADS ───────────
// Jalankan: Run → diagnosLeads
function diagnosLeads() {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) { Logger.log('Sheet LEADS tidak ada'); return }

  var data = sheet.getRange(1, 1, sheet.getLastRow(), 15).getValues()
  var headers = data[0]
  Logger.log('HEADERS (A–O): ' + headers.slice(0,15).join(' | '))
  Logger.log('---')

  for (var i = 1; i < data.length; i++) {
    var r = data[i]
    Logger.log(
      'Row ' + (i+1) + ' | ID=' + r[0] +
      ' | G=' + r[6] + ' | H=' + r[7] +
      ' | M=' + r[12] + ' | N=' + r[13]
    )
  }
}

// ── TEST (jalankan manual di GAS editor) ─────────────────
function testConnection() {
  var ss = SpreadsheetApp.openById(SHEET_ID)
  Logger.log('Spreadsheet: ' + ss.getName())
  Object.keys(SHEETS).forEach(function(key) {
    var name  = SHEETS[key]
    var sheet = ss.getSheetByName(name)
    Logger.log((sheet ? '✅' : '❌') + ' ' + name + (sheet ? ': ' + (sheet.getLastRow()-1) + ' baris' : ': TIDAK ADA'))
  })
}
