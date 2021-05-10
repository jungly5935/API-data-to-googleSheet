function includeJs(jsFilePath){
  var js = document.createElement("script");

  js.type = "text/javascript";
  js.src = jsFilePath;

  document.body.appendChild(js);
}
includeJs("/googlescript/key.js");

function getFormatDate(date){
  var year = date.getFullYear();
  var month = (1 + date.getMonth());
  month = month >= 10 ? month : '0' + month;
  var day = date.getDate();
  day = day >= 10 ? day : '0' + day;
  return year + '-' + month + '-' + day;
}

function loadDataSetDisplayCategoryCoes2(){
var now = new Date();
var firstDate, lastDate

firstDate2 = new Date();
firstDate = getFormatDate(firstDate2);
console.log(firstDate);

lastDate = new Date(now.getFullYear(), now.getMonth()-1, firstDate2.getDate());
lastDate = getFormatDate(lastDate);
console.log(lastDate);

const coupangAPIPath = '/v2/providers/openapi/apis/api/v4/vendors/' + sales + '/returnRequests';
// const coupangAPIQuery = '?searchType=timeFrame&createdAtFrom=2021-05-05&createdAtTo=2021-05-10&status=UC';
const coupangAPIQuery = '?searchType=timeFrame&createdAtFrom=' + lastDate + '&createdAtTo=' + firstDate + '&status=UC';

var dataSet = connectAndGetAPIData(coupangAPIPath, coupangAPIQuery)
Logger.log('API status ' + dataSet.code);
if(dataSet.code === 200){
  //////// coupangAPIData is the result matching to the data from the coupangAPIPath
  coupangAPIData = dataSet.data;

  //////// this array is a specific set of information, in this case "certifications" matching the the coupangAPIPath and the requeste
  array = coupangAPIData;
  
  //////// copy the array data content into the google sheet with the the sheet name 'newImportData'
  convertDataRowToSheet('newImportData', array)
}
}


function convertDataRowToSheet(targetSheetName, dataArray){
var sheet = SpreadsheetApp.getActiveSpreadsheet();
var targetSheet = sheet.getSheetByName(targetSheetName);
var range = targetSheet.getRange("A:AC")
// clear content (optional)
range.clearContent()

// dataArray = [array[0]["createdAt"], array[0]["modifiedAt"],1234,"test" ];

for (var i = 0; i < dataArray.length; i++) {
  if (dataArray[i] !== undefined) {
    if(i === 0){
      /// map dict to array of keys
      // row = Object.keys(dataArray[i]);
      row = [ "접수일시", "처리일시", "주문번호", "딜명", "옵션명", "개수",  "수취인", "연락처", "취소카테고리", "처리자", "출고중지처리여부", "상태",  "쿠팡확인요청상태",  "귀책", "배송비부담", "선환불여부",      "요청번호", "PRODUCT ID", "옵션 ID", "회수송장번호"  ]
      targetSheet.appendRow(row);
    }
    /// map dict to array of values
    // row = Object.values(dataArray[i]);
      if (array[i]["returnDeliveryDtos"][0] != undefined ) {
    
     row = [ array[i]["createdAt"],
            array[i]["modifiedAt"],
            array[i]["orderId"], 
            array[i]["returnItems"][0]["vendorItemPackageName"],
            array[i]["returnItems"][0]["vendorItemName"],
            array[i]["cancelCountSum"], //총수량? 옵션당 취소수량?
            array[i]["requesterName"],
            array[i]["requesterPhoneNumber"],
            array[i]["reasonCodeText"],
            array[i]["returnItems"][0]["cancelCompleteUser"],
            array[i]["releaseStopStatus"],
            array[i]["receiptStatus"], //상태
            " ",
            array[i]["faultByType"], //귀책타입
            array[i]["returnShippingCharge"], //배송비부담 (양수:셀러부담, 음수:고객부담)
            array[i]["preRefund"],
            array[i]["receiptId"],  //요청번호
            array[i]["returnItems"][0]["sellerProductId"], //product ID
            array[i]["returnItems"][0]["vendorItemId"], //  옵션 ID
            array[i]["returnDeliveryDtos"][0]["deliveryInvoiceNo"] ]
 
      }
      else{

         row = [ array[i]["createdAt"],
            array[i]["modifiedAt"],
            array[i]["orderId"], 
            array[i]["returnItems"][0]["vendorItemPackageName"],
            array[i]["returnItems"][0]["vendorItemName"],
            array[i]["cancelCountSum"], //총수량? 옵션당 취소수량?
            array[i]["requesterName"],
            array[i]["requesterPhoneNumber"],
            array[i]["reasonCodeText"],
            array[i]["returnItems"][0]["cancelCompleteUser"],
            array[i]["releaseStopStatus"],
            array[i]["receiptStatus"], //상태
            " ",
            array[i]["faultByType"], //귀책타입
            array[i]["returnShippingCharge"], //배송비부담 (양수:셀러부담, 음수:고객부담)
            array[i]["preRefund"],
            array[i]["receiptId"],  //요청번호
            array[i]["returnItems"][0]["sellerProductId"], //product ID
            array[i]["returnItems"][0]["vendorItemId"], //  옵션 ID
            " " ]
      }

         
    targetSheet.appendRow(row);
  }
}
 ExcelForm(targetSheetName, dataArray);

}

function ExcelForm(targetSheetName, dataArray){
 var sheet = SpreadsheetApp.getActiveSpreadsheet();
 var targetSheet = sheet.getSheetByName(targetSheetName);
//엑셀 형식으로 변경
    for(let j=2; j<dataArray.length+2; j++){
  
    //L열 : 상태 
    if (targetSheet.getRange(j,12).getValue() == "RELEASE_STOP_UNCHECKED") targetSheet.getRange(j,12).setValue("출고중지요청");
    if (targetSheet.getRange(j,12).getValue() == "RETURNS_UNCHECKED") targetSheet.getRange(j,12).setValue("반품접수");
    if (targetSheet.getRange(j,12).getValue() == "VENDOR_WAREHOUSE_CONFIRM") targetSheet.getRange(j,12).setValue("입고완료");
    if (targetSheet.getRange(j,12).getValue() == "REQUEST_COUPANG_CHECK") targetSheet.getRange(j,12).setValue("쿠팡확인요청");
    if (targetSheet.getRange(j,12).getValue() == "RETURNS_COMPLETED") targetSheet.getRange(j,12).setValue("반품완료");

    //O열 : 배송비부담
    if (targetSheet.getRange(j,15).getValue() >= 0) targetSheet.getRange(j,15).setValue("판매자");
    if (targetSheet.getRange(j,15).getValue() < 0)  targetSheet.getRange(j,15).setValue("고객");
    
     //P열 : 선환불여부
    if (targetSheet.getRange(j,16).getValue() == false) targetSheet.getRange(j,16).setValue("N");
    if (targetSheet.getRange(j,16).getValue() == true)  targetSheet.getRange(j,16).setValue("Y");
   
    }
  
}


function connectAndGetAPIData(coupangAPIPath, coupangAPIQuery) {
/**
 * 
 * using the code exampled for node.js (serverside JS) and converting it to JS within Google Apps Script Frontend
 * https://developers.coupangcorp.com/hc/en-us/articles/360042793752-Node-js-Examples
 *
 * replacing the two main example libraries with Google Script built in libraries 
  const https = require('https');
  const crypto = require('crypto');

https - alternative
  - UrlFetchApp.fetch
https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app


crypto - alternative
  - Utilities.computeHmacSha256Signature
https://developers.google.com/apps-script/reference/utilities/utilities#computeHmacSha256Signature%28String,String%29

*/

const datetime = new Date().toISOString().substr(2,17).replace(/:/gi, '').replace(/-/gi, '') + "Z";
//Logger.log(datetime);
const method ='GET';
const path = coupangAPIPath;
const query = coupangAPIQuery;

const message = datetime + method + path + query;
const urlpath = path + '?' + query;

//input your accessKey
const ACCESS_KEY = 'b8fcccc4-3868-4bdb-9e60-dd824deb9cc1';
//input your secretKey
const SECRET_KEY = '91f86655bf90e5ecd1fc547f3890249bd5bed5a9';
//gateway hostname
const hostAPIName = 'api-gateway.coupang.com';
const hostAPIUrl = 'https://'+hostAPIName+'/'+urlpath


/***
const algorithm = 'sha256';
const signature = crypto.createHmac(algorithm, SECRET_KEY)
                    .update(message)
                    .digest('hex');
 */
signature =  Utilities.computeHmacSha256Signature(message, SECRET_KEY)
.map(function(chr){return (chr+256).toString(16).slice(-2)})
.join('')
//Logger.log(signature);

const authorization = 'CEA algorithm=HmacSHA256, access-key=' + ACCESS_KEY + ', signed-date=' + datetime + ', signature=' + signature;
// console.log(authorization);
//Logger.log(authorization);

const options = {
  hostname: hostAPIName,
  port: 443,
  path: urlpath,
  method: method,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Authorization': authorization,
    'X-EXTENDED-TIMEOUT':90000
  }
};

var data = [];
var response = UrlFetchApp.fetch(hostAPIUrl,options);
//Logger.log("response" + response);
Logger.log("Remote File Size: " + response.getAllHeaders()["Content-Length"]);
//Logger.log("Content-Type: " + response.getAllHeaders()["Content-Type"]);
var responseCode = response.getResponseCode();
//Logger.log("Response Code: " + responseCode);


var responseBody = response.getContentText();
if (responseCode === 200) {
  data = JSON.parse(responseBody);
  return data;
} else {
  Logger.log(Utilities.formatString('Request failed. Expected 200, got %d: %s', responseCode, responseBody));
  return {code: "ERROR", message: 'API failure in Google Apps Script'}
};

}

