## Google Sheets Apps Script Logger

Each public-facing form now sends data to a Google Apps Script webhook that writes into Google Sheets.  
Create **one spreadsheet** and add a dedicated sheet/tab for every form type:

| Form Key           | Suggested Sheet Name         |
|--------------------|-----------------------------|
| `contact`          | `Contact_Submissions`        |
| `volunteer`        | `Volunteer_Applications`     |
| `eventRegistration`| `Event_Registrations`        |
| `newsletter`       | `Newsletter_Subscribers`     |

### 1. Apps Script Code

1. Go to [script.new](https://script.new) and paste the snippet below.
2. Replace the spreadsheet ID with your Google Sheet ID.
3. Deploy **New Deployment → Web app**  
   - Execute as: **Me**  
   - Who has access: **Anyone**  
4. Copy the deployment URL and paste it into the matching `scriptUrl` entry inside `FORM_FALLBACK_CONFIG` (in `js/script.js`) for each form.

```js
const SPREADSHEET_ID = 'PUT_YOUR_SHEET_ID_HERE';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheetName = payload.sheetName || payload.data?.formKey || 'General';
    const sheet = getOrCreateSheet(sheetName);
    const row = buildRow(payload.data || {});

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(['Submitted At', 'Field', 'Value']); // optional header
  }
  return sheet;
}

function buildRow(data) {
  const timestamp = data.submittedAt || new Date().toISOString();
  const flattened = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`);

  return [timestamp, data.formKey || 'unknown', flattened.join(' | ')];
}
```

> ⚠️ Each deployment URL is unique. Use a separate deployment (or at least a unique `sheetName`) per form so that each submission lands in its own sheet.

### 2. CORS Support

Apps Script allows cross-origin requests automatically for published web apps. No extra headers are required, but ensure you deploy the latest version whenever you update the script.

### 3. Updating the Frontend

In `js/script.js`, update `FORM_FALLBACK_CONFIG`:

```js
window.FORM_FALLBACK_CONFIG = {
  contact: {
    sheetName: 'Contact_Submissions',
    scriptUrl: 'https://script.google.com/macros/s/CONTACT_DEPLOYMENT/exec',
    mailto: 'osarogie.idumwonyi@eng.uniben.edu'
  },
  volunteer: {
    sheetName: 'Volunteer_Applications',
    scriptUrl: 'https://script.google.com/macros/s/VOLUNTEER_DEPLOYMENT/exec',
    mailto: 'osarogie.idumwonyi@eng.uniben.edu'
  },
  // ...
};
```

Repeat for every environment (local, staging, production) so the correct sheet receives the data.

