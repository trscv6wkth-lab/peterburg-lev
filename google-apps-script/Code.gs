/** Google Apps Script backend for the Saint Petersburg school website. */
const SHEET_NAME = 'Отзывы';
const SPREADSHEET_TITLE = 'Петербург — отзывы';

function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) || '';
  const data = JSON.stringify({reviews: readReviews()});
  if (callback && /^[a-zA-Z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + data + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw) return response('Не удалось прочитать отзыв');
    const review = JSON.parse(raw);
    if (clean(review.website, 100)) return response('Спасибо за отзыв');
    const name = clean(review.name, 40);
    const text = clean(review.text, 600);
    const rating = Math.max(1, Math.min(5, Math.floor(Number(review.rating) || 5)));
    if (!name || !text) return response('Заполни имя и текст отзыва');
    const sheet = getSheet();
    sheet.appendRow([new Date(), name, rating, text]);
    return response('Спасибо за отзыв');
  } catch (error) {
    return response('Ошибка сохранения');
  }
}

function getSheet() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('REVIEWS_SPREADSHEET_ID');
  let spreadsheet;
  if (id) {
    spreadsheet = SpreadsheetApp.openById(id);
  } else {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_TITLE);
    props.setProperty('REVIEWS_SPREADSHEET_ID', spreadsheet.getId());
  }
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Дата', 'Имя', 'Оценка', 'Отзыв']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readReviews() {
  const id = PropertiesService.getScriptProperties().getProperty('REVIEWS_SPREADSHEET_ID');
  if (!id) return [];
  const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const endRow = sheet.getLastRow();
  const startRow = Math.max(2, endRow - 99);
  return sheet.getRange(startRow, 1, endRow - startRow + 1, 4).getValues().reverse().map(function(row) {
    return {
      date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'dd.MM.yyyy'),
      name: String(row[1]),
      rating: Number(row[2]),
      text: String(row[3])
    };
  });
}

function clean(value, maxLength) {
  return String(value || '').replace(/[<>\u0000-\u001F]/g, ' ').trim().slice(0, maxLength);
}

function response(message) {
  return ContentService.createTextOutput(JSON.stringify({message: message}))
    .setMimeType(ContentService.MimeType.JSON);
}
