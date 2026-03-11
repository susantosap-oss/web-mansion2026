// ============================================================
// MANSION REALTY — Google Apps Script API Bridge
// Deploy: Extensions > Apps Script > Deploy > New Deployment
//         Type: Web App | Execute as: Me | Access: Anyone
// ============================================================
var SHEET_ID   = 'GANTI_DENGAN_ID_SPREADSHEET_CRM_MANSION'
var API_SECRET = 'GANTI_DENGAN_SECRET_YANG_SAMA_DI_ENV'
var SHEETS = { PROJECTS:'DataProyek', LISTINGS:'DataListing', AGENTS:'DataAgen', NEWS:'DataBerita', LEADS:'DataLead' }

function doGet(e) {
  if (e.parameter.secret !== API_SECRET) return resp({success:false,error:'Unauthorized'})
  try {
    var action = e.parameter.action
    if (action === 'getProjects') return resp({success:true,data:getSheet(SHEETS.PROJECTS)})
    if (action === 'getListings') return resp({success:true,data:getSheet(SHEETS.LISTINGS)})
    if (action === 'getAgents')   return resp({success:true,data:getSheet(SHEETS.AGENTS)})
    if (action === 'getNews')     return resp({success:true,data:getSheet(SHEETS.NEWS)})
    if (action === 'getLeads') {
      var rows = getSheet(SHEETS.LEADS)
      var agentId = e.parameter.agentId
      return resp({success:true,data:agentId?rows.filter(function(r){return r['Agent ID']===agentId}):rows})
    }
    return resp({success:false,error:'Unknown action: '+action})
  } catch(err) { return resp({success:false,error:err.message}) }
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents)
  if (body.secret !== API_SECRET && e.parameter.secret !== API_SECRET) return resp({success:false,error:'Unauthorized'})
  try {
    if (e.parameter.action === 'saveLead' || body.action === 'saveLead') { saveLead(body); return resp({success:true}) }
    return resp({success:false,error:'Unknown POST action'})
  } catch(err) { return resp({success:false,error:err.message}) }
}

function getSheet(name) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(name)
  if (!sheet) throw new Error('Sheet "'+name+'" tidak ditemukan')
  var data = sheet.getDataRange().getValues()
  var headers = data[0]; var rows = data.slice(1)
  return rows.filter(function(r){return r.some(function(c){return c!==''})}).map(function(row){
    var obj={}; headers.forEach(function(h,i){obj[h]=row[i]}); return obj
  })
}

function saveLead(lead) {
  var ss    = SpreadsheetApp.openById(SHEET_ID)
  var sheet = ss.getSheetByName(SHEETS.LEADS)
  if (!sheet) throw new Error('Sheet DataLead tidak ditemukan')
  sheet.appendRow(['LEAD-'+Date.now(),lead.listingId||'',lead.listingTitle||'',lead.agentId||'',lead.name||'',lead.phone||'',lead.email||'',lead.message||'',lead.source||'Form',new Date().toISOString(),'New'])
}

function resp(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON) }
