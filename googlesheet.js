function loadData1() {
  this.key(0);
}
function loadData2() {
  this.key(1);
}
function loadData3() {
  this.key(2);
}
function loadData4() {
  this.key(3);
}
function loadData5() {
  this.key(4);
}

function loadDataSetDisplayCategoryCoes2(
  coupangAPIPath,
  vendorIndex,
  ACCESS_KEYS,
  SECRET_KEYS,
  VENDOR_IDS,
  vendorNames
) {
  var now = new Date();
  var nowMinus31 = new Date();
  nowMinus31.setDate(nowMinus31.getDate() - 30);
  var todayFormated = getFormatDate(now, false);
  var firstDate = getFormatDate(nowMinus31, false);
  //console.log('today', todayFormated, 'first', firstDate);
  var queryStatus = ["RU", "UC", "CC", "PR"];

  var coupangAPIData = {};
  var dataSet = {};

  var checkIn10PagePieces = true;
  if (checkIn10PagePieces) {
    console.log(vendorNames[vendorIndex]);
    clearDataANDaddHeader(vendorNames[vendorIndex]);
    var totalRowsCounter = 0;
    firstDate = firstDate;
    lastDate = todayFormated;
    /// manually add date for debug
    //firstDate = '2021-05-02';
    //lastDate = '2021-05-20';
    console.log(
      "checking vendor",
      vendorNames[vendorIndex],
      "query from: ",
      firstDate,
      " to : ",
      lastDate
    );

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    /// add comments
    var targetSheet = sheet.getSheetByName("매크로");
    cell = targetSheet.getRange(4 * vendorIndex + 4, 6);
    cell.setValue(
      "Started loading: " +
        vendorNames[vendorIndex] +
        ". Query from: " +
        firstDate +
        " to : " +
        lastDate
    );

    targetSheet = sheet.getSheetByName(vendorNames[vendorIndex]);
    if (!targetSheet) {
      sheet.insertSheet(vendorNames[vendorIndex]);
      targetSheet = sheet.getSheetByName(vendorNames[vendorIndex]);
    }
    var retry = 0;
    var pageNextToken = undefined;
    /// check the 4 different types
    for (var j = 0; j < queryStatus.length; j++) {
      var pagesToLoad = true;
      while (pagesToLoad) {
        //max Per Page
        //const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom='+ firstDate +'&createdAtTo='+ lastDate  +'&status=' +  queryStatus[j] + '&maxPerPage=5';
        var coupangAPIQuery =
          "createdAtFrom=" +
          firstDate +
          "&createdAtTo=" +
          lastDate +
          "&status=" +
          queryStatus[j] +
          "&maxPerPage=10";
        if (
          pageNextToken !== undefined &&
          pageNextToken !== null &&
          pageNextToken !== ""
        ) {
          coupangAPIQuery =
            "createdAtFrom=" +
            firstDate +
            "&createdAtTo=" +
            lastDate +
            "&status=" +
            queryStatus[j] +
            "&maxPerPage=10&nextToken=" +
            pageNextToken;
        }
        //console.log('Query Status', queryStatus[j]);
        console.log(
          "API Query",
          coupangAPIPath[vendorIndex],
          "?",
          coupangAPIQuery
        );
        dataSet = connectAndGetAPIData(
          coupangAPIPath[vendorIndex],
          coupangAPIQuery,
          ACCESS_KEYS[vendorIndex],
          SECRET_KEYS[vendorIndex],
          vendorIndex
        );
        //console.log('API status ' + dataSet.code);

        if (dataSet.code === 200) {
          retry = 0;
          //////// coupangAPIData is the result matching to the data from the coupangAPIPath
          coupangAPIData = dataSet.data;
          if (
            dataSet.nextToken !== undefined &&
            dataSet.nextToken !== null &&
            dataSet.nextToken !== ""
          ) {
            pageNextToken = dataSet.nextToken;
          } else {
            pageNextToken === undefined;
          }

          //////// this array is a specific set of information, in this case "certifications" matching the the coupangAPIPath and the requeste
          array = coupangAPIData;

          //////// copy the array data content into the google sheet with the the sheet name 'newImportData'
          if (array.length > 0) {
            convertDataRowToSheet(targetSheet, array, vendorNames[vendorIndex]);
            console.log(
              "adding rows for:",
              queryStatus[j],
              1 + totalRowsCounter,
              "to",
              array.length + totalRowsCounter
            );
            totalRowsCounter += array.length;
          } else {
            console.log("Nothing to add from this query");
          }
          if (array.length >= 10 && pageNextToken !== undefined) {
            //console.log('pageNextToken', pageNextToken)
            pagesToLoad = true;
          } else {
            pagesToLoad = false;
            break;
          }
        } else if (retry < 4) {
          console.log("retry with error");
          retry += 1;
          pagesToLoad = true;
        } else {
          pageNextToken === undefined;
          pagesToLoad = false;
          break;
        }
      }
    }
    targetSheet = sheet.getSheetByName("매크로");
    cell = targetSheet.getRange(4 * vendorIndex + 4, 6);
    cell.setValue(
      "Finished loading: " +
        vendorNames[vendorIndex] +
        ". From: " +
        firstDate +
        " to : " +
        lastDate
    );
  }
}

function getFormatDate(date, withTime = true) {
  var year = date.getFullYear();
  var month = 1 + date.getMonth();
  month = month >= 10 ? month : "0" + month;
  var day = date.getDate();
  day = day >= 10 ? day : "0" + day;
  var hour = date.getHours();
  hour = hour >= 10 ? hour : "0" + hour;
  var minute = date.getMinutes();
  minute = minute >= 10 ? minute : "0" + minute;

  var formatedDate = year + "-" + month + "-" + day;
  if (withTime) {
    formatedDate = formatedDate + "T" + hour + ":" + minute;
  }
  return formatedDate;
}

function clearDataANDaddHeader(vendorName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = sheet.getSheetByName(vendorName);
  if (!targetSheet) {
    sheet.insertSheet(vendorName);
    targetSheet = sheet.getSheetByName(vendorName);
  }
  var range = targetSheet.getRange("A:AC");
  range.clearContent();

  row = [
    "판매처",
    "접수일시",
    "처리일시",
    "주문번호",
    "딜명",
    "옵션명",
    "개수",
    "수취인",
    "연락처",
    "취소카테고리",
    "처리자",
    "출고중지처리여부",
    "상태",
    "쿠팡확인요청상태",
    "귀책",
    "배송비부담",
    "선환불여부",
    "요청번호",
    "PRODUCT ID",
    "옵션 ID",
    "shipmentBoxId",
    "deliveryCompanyCode",
    "회수송장번호",
  ];
  targetSheet.appendRow(row);
}

function convertDataRowToSheet(targetSheet, dataArray, vendorName) {
  for (var i = 0; i < dataArray.length; i++) {
    if (dataArray[i] !== undefined) {
      /// map dict to array of values
      // row = Object.values(dataArray[i]);

      row = [
        vendorName,
        array[i]["createdAt"],
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
        array[i]["receiptId"], //요청번호
        array[i]["returnItems"][0]["sellerProductId"], //product ID
        array[i]["returnItems"][0]["vendorItemId"], //  옵션 ID
        array[i]["returnItems"][0]["shipmentBoxId"],
      ];

      if (array[i]["returnDeliveryDtos"][0] != undefined) {
        row.push(array[i]["returnDeliveryDtos"][0]["deliveryCompanyCode"]);
        row.push(array[i]["returnDeliveryDtos"][0]["deliveryInvoiceNo"]);
      }

      targetSheet.appendRow(row);
    }
  }

  //  ExcelForm(targetSheetName, dataArray);
}

function ExcelForm(targetSheetName, dataArray) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = sheet.getSheetByName(targetSheetName);
  //엑셀 형식으로 변경
  for (let j = 2; j < dataArray.length + 2; j++) {
    //M열 : 상태
    if (targetSheet.getRange(j, 13).getValue() == "RELEASE_STOP_UNCHECKED")
      targetSheet.getRange(j, 13).setValue("출고중지요청");
    if (targetSheet.getRange(j, 13).getValue() == "RETURNS_UNCHECKED")
      targetSheet.getRange(j, 13).setValue("반품접수");
    if (targetSheet.getRange(j, 13).getValue() == "VENDOR_WAREHOUSE_CONFIRM")
      targetSheet.getRange(j, 13).setValue("입고완료");
    if (targetSheet.getRange(j, 13).getValue() == "REQUEST_COUPANG_CHECK")
      targetSheet.getRange(j, 13).setValue("쿠팡확인요청");
    if (targetSheet.getRange(j, 13).getValue() == "RETURNS_COMPLETED")
      targetSheet.getRange(j, 13).setValue("반품완료");

    //O열 : 배송비부담
    if (targetSheet.getRange(j, 16).getValue() >= 0)
      targetSheet.getRange(j, 16).setValue("판매자");
    if (targetSheet.getRange(j, 16).getValue() < 0)
      targetSheet.getRange(j, 16).setValue("고객");

    //P열 : 선환불여부
    if (targetSheet.getRange(j, 17).getValue() == false)
      targetSheet.getRange(j, 17).setValue("N");
    if (targetSheet.getRange(j, 17).getValue() == true)
      targetSheet.getRange(j, 17).setValue("Y");
  }
}

function connectAndGetAPIData(
  coupangAPIPath,
  coupangAPIQuery,
  accessKey,
  secretKey,
  vendorID
) {
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";
  //Logger.log(datetime);
  const method = "GET";
  const path = coupangAPIPath;
  const query = coupangAPIQuery;

  const message = datetime + method + path + query;
  const urlpath = path + "?" + query;

  //gateway hostname
  const hostAPIName = "api-gateway.coupang.com";
  const hostAPIUrl = "https://" + hostAPIName + "/" + urlpath;

  /***
  const algorithm = 'sha256';
  const signature = crypto.createHmac(algorithm, SECRET_KEYS)
                      .update(message)
                      .digest('hex');
   */
  signature = Utilities.computeHmacSha256Signature(message, secretKey)
    .map(function (chr) {
      return (chr + 256).toString(16).slice(-2);
    })
    .join("");
  //Logger.log(signature);

  const authorization =
    "CEA algorithm=HmacSHA256, access-key=" +
    accessKey +
    ", signed-date=" +
    datetime +
    ", signature=" +
    signature;
  // console.log(authorization);
  //Logger.log(authorization);

  const options = {
    hostname: hostAPIName,
    port: 443,
    path: urlpath,
    method: method,
    muteHttpExceptions: true,
    headers: {
      //'X-Extended-Timeout': 90000,
      "X-EXTENDED-TIMEOUT": 90000,
      "X-Requested-By": vendorID,
      "Content-Type": "application/json;charset=UTF-8",
      //'Content-Type': 'application/json',
      Authorization: authorization,
    },
  };

  var data = [];
  var response = UrlFetchApp.fetch(hostAPIUrl, options);
  //console.log("response" + response);
  // Logger.log("Remote File Size: " + response.getAllHeaders()["Content-Length"]);
  //Logger.log("Content-Type: " + response.getAllHeaders()["Content-Type"]);
  var responseCode = response.getResponseCode();
  //Logger.log("Response Code: " + responseCode);

  var responseBody = response.getContentText();
  if (responseCode === 200) {
    data = JSON.parse(responseBody);
    return data;
  } else if (responseCode === 504) {
    Logger.log(
      Utilities.formatString(
        "Request timeout 504, got %d: %s",
        responseCode,
        responseBody
      )
    );
    return { code: "ERROR", message: "API failure in Google Apps Script" };
  } else {
    Logger.log(
      Utilities.formatString(
        "Request failed. Expected 200, got %d: %s",
        responseCode,
        responseBody
      )
    );
    return { code: "ERROR", message: "API failure in Google Apps Script" };
  }
}

/***
 * if(checkInTimePieces){
        // clearDataANDaddHeader();
          console.log(vendorNames[vendorIndex]);

        for(var t=1440; t>=0; t=t-5){
          firstDate =  new  Date(now.getFullYear(),  now.getMonth(),  now.getDate(), now.getHours(), now.getMinutes()-t);
          firstDate = getFormatDate(firstDate);
          //console.log(firstDate);
          lastDate = new  Date(now.getFullYear(),  now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()-t+5 );
          lastDate = getFormatDate(lastDate);
          console.log('query from: ', firstDate, ' to : ', lastDate);

            for(var j=0; j<queryStatus.length; j++){

            const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom='+ firstDate +'&createdAtTo='+ lastDate  +'&status=' +  queryStatus[j];
            // const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom=2021-05-20T13:10&createdAtTo=2021-05-20T13:20&status=CC';
            // const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom='+ lastDate +'&createdAtTo='+ lastDate + '&status=CC';
            // const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom=2021-05-15&createdAtTo=2021-05-15&status=CC';
            
            dataSet = connectAndGetAPIData(coupangAPIPath[vendorIndex], coupangAPIQuery, ACCESS_KEYS[vendorIndex], SECRET_KEYS[vendorIndex]);
            // Logger.log('API status ' + dataSet.code);

            if(dataSet.code === 200){
              //////// coupangAPIData is the result matching to the data from the coupangAPIPath
              coupangAPIData = dataSet.data;
          
              //////// this array is a specific set of information, in this case "certifications" matching the the coupangAPIPath and the requeste
              array = coupangAPIData;
              
              //////// copy the array data content into the google sheet with the the sheet name 'newImportData'
              convertDataRowToSheet(targetSheet, array, vendorNames[vendorIndex])
              }
            }
            
          
        } //for:date
      }
      else 
 */
