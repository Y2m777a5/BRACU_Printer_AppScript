// Add custom menu item to Google Sheet menu bar
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BRACU Printing')
    .addItem('Upload & Print File', 'showUploadDialog')
    .addToUi();
}

// Display the pop-up modal dialog
function showUploadDialog() {
  var html = HtmlService.createHtmlOutputFromFile('UploadDialog')
    .setWidth(450)
    .setHeight(320);
  SpreadsheetApp.getUi().showModalDialog(html, 'BRAC U Printing Queue');
}

// Process the uploaded file data from the HTML dialog
function processUpload(payload) {
  try {
    var blobs = [];
    var totalSizeBytes = 0;
    var fileNames = [];
    var driveLinks = [];

    // Loop through all uploaded files
    for (var i = 0; i < payload.files.length; i++) {
      var f = payload.files[i];
      var bytes = Utilities.base64Decode(f.base64);
      var blob = Utilities.newBlob(bytes, f.mimeType, f.fileName);
      
      totalSizeBytes += blob.getBytes().length;
      
      // Enforce total 25 MB limit across all files combined
      if (totalSizeBytes > 25 * 1024 * 1024) {
        throw new Error("Total size of all files exceeds the 25 MB limit.");
      }

      blobs.push(blob);
      fileNames.push(f.fileName);

      // Save each file copy to Google Drive
      var driveFile = DriveApp.createFile(blob);
      driveLinks.push(driveFile.getUrl());
    }

    // Set subject line based on print option
    var isDuplex = payload.printMode === "duplex";
    var subject = isDuplex ? "#duplex" : "";

    // Send single email containing all attached files
    GmailApp.sendEmail("campus.printer@g.bracu.ac.bd", subject, "", {
      attachments: blobs
    });

    // Log transaction in Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timeStamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "hh:mm a, MMM dd, yyyy");
    sheet.appendRow([
      fileNames.join("\n"),
      isDuplex ? "Double-sided (#duplex)" : "Single-sided",
      driveLinks.join("\n"),
      "Sent (" + timeStamp + ")"
    ]);

    return "Success! " + blobs.length + " file(s) sent to the printer queue.";
  } catch (err) {
    throw new Error(err.message);
  }
}

//For WebApp
function doGet() {
  return HtmlService.createHtmlOutputFromFile('UploadDialog')
    .setTitle('BRACU Mobile Printing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}