// Add custom menu item to Google Sheet menu bar
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BRACU Printing')
    .addItem('Upload & Print File', 'showUploadDialog')
    .addToUi();
}

// Display the pop-up modal dialog in Google Sheets
function showUploadDialog() {
  var html = HtmlService.createHtmlOutputFromFile('UploadDialog')
    .setWidth(480)
    .setHeight(560);
  SpreadsheetApp.getUi().showModalDialog(html, 'BRAC U Printing Queue');
}

// Process uploaded files and send to campus printer queue
function processUpload(payload) {
  try {
    var blobs = [];
    var totalSizeBytes = 0;
    var fileNames = [];
    var driveLinks = [];
    var totalPrintJobs = 0;

    for (var i = 0; i < payload.files.length; i++) {
      var f = payload.files[i];
      var bytes = Utilities.base64Decode(f.base64);
      var mainBlob = Utilities.newBlob(bytes, f.mimeType, f.fileName);

      var numCopies = Math.max(1, Math.min(40, parseInt(f.copies, 10) || 1));
      fileNames.push(f.fileName + " (" + numCopies + " " + (numCopies === 1 ? "copy" : "copies") + ")");
      totalPrintJobs += numCopies;

      // Save primary copy to Google Drive for backup
      var driveFile = DriveApp.createFile(mainBlob);
      driveLinks.push(driveFile.getUrl());

      // Attach requested number of copies to email
      for (var c = 0; c < numCopies; c++) {
        var attachName = (c === 0) ? f.fileName : f.fileName.replace(/(\.[^.]+)$/, " (Copy " + (c + 1) + ")$1");
        var copyBlob = Utilities.newBlob(bytes, f.mimeType, attachName);
        
        totalSizeBytes += copyBlob.getBytes().length;
        if (totalSizeBytes > 25 * 1024 * 1024) {
          throw new Error("Total size of attached files exceeds the 25 MB email limit.");
        }

        blobs.push(copyBlob);
      }
    }

    var isDuplex = payload.printMode === "duplex";
    var subject = isDuplex ? "#duplex" : "";

    GmailApp.sendEmail("campus.printer@g.bracu.ac.bd", subject, "", {
      attachments: blobs
    });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timeStamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "hh:mm a, MMM dd, yyyy");
    sheet.appendRow([
      fileNames.join("\n"),
      isDuplex ? "Double-sided (#duplex)" : "Single-sided",
      driveLinks.join("\n"),
      "Sent (" + timeStamp + ")"
    ]);

    return "Success! " + totalPrintJobs + " print job(s) sent to the printer queue across " + payload.files.length + " file(s).";
  } catch (err) {
    throw new Error(err.message);
  }
}

// Serve WebApp for mobile and desktop access
function doGet() {
  return HtmlService.createHtmlOutputFromFile('UploadDialog')
    .setTitle('BRACU Mobile Printing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}