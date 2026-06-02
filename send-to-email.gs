/**
 * Mone Agency - Form Submission Handler (Google Apps Script)
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Click "New project"
 * 3. Delete any default code, paste this entire file
 * 4. Save (Ctrl+S) — name it "Mone Agency Form Handler"
 * 5. Click "Deploy" → "New deployment"
 * 6. Click the gear icon → Select "Web app"
 * 7. Description: "Mone Agency form handler"
 * 8. Execute as: "Me"
 * 9. Who has access: "Anyone"
 * 10. Click "Deploy"
 * 11. Copy the Web app URL (looks like: https://script.google.com/macros/s/.../exec)
 * 12. Open script.js and replace GOOGLE_APPS_SCRIPT_URL with your URL
 * 13. Commit and push
 *
 * COMPLETELY FREE - No limits (Google's quotas: 100 recipients/day for free accounts)
 * Open source - modify as needed
 */

function doPost(e) {
  try {
    var formData = {};
    if (e.parameters) {
      for (var key in e.parameters) {
        formData[key] = e.parameters[key][0];
      }
    }

    var applicantName = formData.name || 'Not provided';
    var applicantEmail = formData.email || 'Not provided';

    var htmlBody = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">';
    htmlBody += '<h1 style="color:#FF00FF;border-bottom:2px solid #6600CC;padding-bottom:10px;">New Model Application</h1>';
    htmlBody += '<table style="width:100%;border-collapse:collapse;">';

    var fields = [
      ['Full Name', formData.name],
      ['Age', formData.age],
      ['Height (cm)', formData.height],
      ['Shoe Size', formData.shoe],
      ['Bust/Chest (cm)', formData.bust],
      ['Waist (cm)', formData.waist],
      ['Hips (cm)', formData.hips],
      ['Hair Color', formData.hair],
      ['Eye Color', formData.eyes],
      ['Preferred Location', formData.location],
      ['Email Address', formData.email],
      ['Instagram Handle', formData.instagram]
    ];

    for (var i = 0; i < fields.length; i++) {
      htmlBody += '<tr style="border-bottom:1px solid #eee;">';
      htmlBody += '<td style="padding:10px;color:#6600CC;font-weight:bold;width:40%;">' + fields[i][0] + '</td>';
      htmlBody += '<td style="padding:10px;">' + (fields[i][1] || 'Not provided') + '</td>';
      htmlBody += '</tr>';
    }

    htmlBody += '</table><br>';

    var plainBody = 'New Model Application\n\n';
    for (var j = 0; j < fields.length; j++) {
      plainBody += fields[j][0] + ': ' + (fields[j][1] || 'Not provided') + '\n';
    }

    var subject = 'New Model Application: ' + applicantName + ' - ' + (formData.location || 'No location');

    var advancedParams = {
      name: 'Mone Agency Website',
      htmlBody: htmlBody
    };

    var hasAttachments = false;
    var blobMap = {};
    if (e.postData && e.postData.contents) {
      try {
        var boundary = getBoundary(e);
        if (boundary) {
          var parts = parseMultipart(e.postData.contents, boundary);
          for (var k = 0; k < parts.length; k++) {
            if (parts[k].filename && parts[k].content) {
              var ext = parts[k].filename.split('.').pop().toLowerCase();
              var mimeType = 'image/jpeg';
              if (ext === 'png') mimeType = 'image/png';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'webp') mimeType = 'image/webp';
              try {
                var blob = Utilities.newBlob(parts[k].content, mimeType, parts[k].filename);
                blobMap[parts[k].filename] = blob;
                hasAttachments = true;
              } catch(blobErr) {}
            }
          }
        }
      } catch(parseErr) {}
    }

    if (hasAttachments) {
      var attachmentList = Object.keys(blobMap);
      if (attachmentList.length > 0) {
        htmlBody += '<p><strong>Photos uploaded:</strong> ' + attachmentList.length + ' file(s)</p>';
        htmlBody += '<ul>';
        for (var m = 0; m < attachmentList.length; m++) {
          htmlBody += '<li>' + attachmentList[m] + '</li>';
        }
        htmlBody += '</ul>';
        plainBody += '\nPhotos: ' + attachmentList.length + ' file(s) attached\n';
      }
      var allBlobs = [];
      for (var key in blobMap) {
        allBlobs.push(blobMap[key]);
      }
      MailApp.sendEmail(
        'mone.agency@mail.com',
        subject,
        plainBody,
        {
          name: 'Mone Agency Website',
          htmlBody: htmlBody,
          attachments: allBlobs
        }
      );
    } else {
      MailApp.sendEmail(
        'mone.agency@mail.com',
        subject,
        plainBody,
        {
          name: 'Mone Agency Website',
          htmlBody: htmlBody
        }
      );
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Mone Agency Form Handler is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBoundary(e) {
  var contentType = e.postData.type || '';
  var match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? (match[1] || match[2]) : null;
}

function parseMultipart(data, boundary) {
  var parts = [];
  var delimiter = '--' + boundary;
  var chunks = data.split(delimiter);

  for (var i = 0; i < chunks.length; i++) {
    var chunk = chunks[i];
    if (!chunk || chunk.trim() === '--' || chunk.trim() === '') continue;

    var headerEnd = chunk.indexOf('\r\n\r\n');
    if (headerEnd === -1) headerEnd = chunk.indexOf('\n\n');
    if (headerEnd === -1) continue;

    var headers = chunk.substring(0, headerEnd);
    var contentStart = headerEnd + 2;
    if (chunk.charAt(headerEnd) === '\r') contentStart += 2;
    else contentStart += 1;

    var content = chunk.substring(contentStart).replace(/\r?\n$/, '').replace(/\r?\n$/, '');

    var filenameMatch = headers.match(/filename="([^"]*)"/i);
    var nameMatch = headers.match(/name="([^"]*)"/i);

    if (filenameMatch && filenameMatch[1]) {
      parts.push({
        fieldName: nameMatch ? nameMatch[1] : 'file',
        filename: filenameMatch[1],
        content: Utilities.base64Decode(Utilities.base64Encode(content))
      });
    }
  }

  return parts;
}
