/**
 * SOTR waitlist — Google Apps Script Web App backend.
 * Appends each signup from satsontheroad.africa/join to a Google Sheet.
 *
 * SETUP (one time, ~3 min):
 *   1. Create a Google Sheet (e.g. "SOTR Waitlist"). Copy its ID from the URL:
 *        https://docs.google.com/spreadsheets/d/<THIS_IS_THE_ID>/edit
 *   2. In the Sheet: Extensions → Apps Script. Delete the sample code,
 *      paste THIS file, and set SHEET_ID below to that ID.
 *   3. Deploy → New deployment → type "Web app".
 *        - Description: SOTR waitlist
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Authorize when prompted (it's your own script writing to your own sheet).
 *   4. Copy the Web app URL (ends in /exec) and paste it into waitlist.js
 *      (WAITLIST_ENDPOINT). Rebuild + deploy the site.
 *
 * To update the script later, redeploy the SAME deployment (Manage deployments
 * → edit → new version) so the /exec URL stays the same.
 */

const SHEET_ID = 'REPLACE_WITH_YOUR_SHEET_ID';
const SHEET_NAME = 'Waitlist';
const HEADERS = ['Timestamp', 'Role', 'Name', 'Business', 'Category', 'Country', 'City', 'Phone', 'Email', 'Source', 'CityRef'];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot: bots fill the hidden "website" field. Accept silently, store nothing.
    if (data.website) {
      return _json({ ok: true });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    sh.appendRow([
      new Date(),
      data.role || '',
      data.name || '',
      data.business || '',
      data.category || '',
      data.country || '',
      data.city || '',
      data.phone || '',
      data.email || '',
      data.source || 'website',
      data.city_ref || '',
    ]);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json({ ok: true, service: 'SOTR waitlist' });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
