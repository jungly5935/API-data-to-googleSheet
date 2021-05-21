  function loadDataSetDisplayCategoryCoes2(coupangAPIPath, ACCESS_KEYS, SECRET_KEYS, VENDOR_ID){
      var now = new Date();
      var nowMinus31 = new Date();
      nowMinus31.setDate(nowMinus31.getDate() - 30);
      //console.log(nowMinus31);
      //var firstDate, lastDate
      //lastDate2 = new  Date();
      // lastDate = getFormatDate(lastDate2);
      // console.log(lastDate);
      var todayFormated = getFormatDate(now, false);
      var firstDate = getFormatDate(nowMinus31, false);
      //console.log('today', todayFormated, 'first', firstDate);
      var sales = [  '르엠마' , '엘이엠', '투앨', '아틀리에', '엘에이치엠'];
      var queryStatus = ['RU', 'UC', 'CC', 'PR'];
  
      var coupangAPIData = {};
      var dataSet = {};
  
        var checkInTimePieces =  false;
        var checkIn10PagePieces =  true;
        if(checkInTimePieces){
          // clearDataANDaddHeader();
            console.log(sales[VENDOR_ID]);
  
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
              
              dataSet = connectAndGetAPIData(coupangAPIPath[VENDOR_ID], coupangAPIQuery, ACCESS_KEYS[VENDOR_ID], SECRET_KEYS[VENDOR_ID]);
              // Logger.log('API status ' + dataSet.code);
  
              if(dataSet.code === 200){
                //////// coupangAPIData is the result matching to the data from the coupangAPIPath
                coupangAPIData = dataSet.data;
            
                //////// this array is a specific set of information, in this case "certifications" matching the the coupangAPIPath and the requeste
                array = coupangAPIData;
                
                //////// copy the array data content into the google sheet with the the sheet name 'newImportData'
                convertDataRowToSheet('newImportData', array, sales[VENDOR_ID])
                }
              }
              
            
          } //for:date
        }
        else if(checkIn10PagePieces){
          // clearDataANDaddHeader();
            console.log(sales[VENDOR_ID]);
          var totalRowsCounter = 0;
          firstDate = firstDate;
          lastDate = todayFormated;
          /// manually add date for debug
          //firstDate = '2021-05-02';
          //lastDate = '2021-05-20';
          // if doing all vendors than the google script over 5 minute length will exceed
          // need to initiate the request for each by one
          console.log('checking vendor', sales[VENDOR_ID], 'query from: ', firstDate, ' to : ', lastDate);
          for(var j=0; j<queryStatus.length; j++){
            var pageNum = 1;
            var pageNextToken = undefined;
            var pagesToLoad = true;
            while(pagesToLoad){
              //max Per Page
              //const coupangAPIQuery = 'searchType=timeFrame&createdAtFrom='+ firstDate +'&createdAtTo='+ lastDate  +'&status=' +  queryStatus[j] + '&maxPerPage=5';
              var coupangAPIQuery = 'createdAtFrom=' + firstDate + '&createdAtTo=' + lastDate + '&status=' +  queryStatus[j] + '&maxPerPage=10';
              if(pageNextToken !== undefined && pageNextToken !== null && pageNextToken !== ""){
                coupangAPIQuery = 'createdAtFrom=' + firstDate + '&createdAtTo=' + lastDate + '&status=' +  queryStatus[j] + '&maxPerPage=10&nextToken='+pageNextToken;
              }
              //console.log('Query Status', queryStatus[j]);
              console.log('API Query', coupangAPIPath[VENDOR_ID], "?",  coupangAPIQuery)
              dataSet = connectAndGetAPIData(coupangAPIPath[VENDOR_ID], coupangAPIQuery, ACCESS_KEYS[VENDOR_ID], SECRET_KEYS[VENDOR_ID], VENDOR_ID);
              //console.log('API status ' + dataSet.code);
  
              if(dataSet.code === 200){
                //////// coupangAPIData is the result matching to the data from the coupangAPIPath
                coupangAPIData = dataSet.data;
                if(dataSet.nextToken !== undefined && dataSet.nextToken !== null && dataSet.nextToken !== ""){
                  pageNextToken = dataSet.nextToken;
                }
                else{
                  pageNextToken === undefined;
                }
            
                //////// this array is a specific set of information, in this case "certifications" matching the the coupangAPIPath and the requeste
                array = coupangAPIData;
                
                //////// copy the array data content into the google sheet with the the sheet name 'newImportData'
                convertDataRowToSheet('newImportData', array, sales[VENDOR_ID])
                console.log('adding rows for:', queryStatus[j], ((pageNum-1)*10+1+totalRowsCounter), 'to', ((pageNum-1)*10+array.length+totalRowsCounter))
                totalRowsCounter += array.length;
                if(array.length >= 10 && pageNextToken !== undefined){
                  console.log('pageNextToken', pageNextToken)
                  pagesToLoad = true;
                  pageNum += 1;
                }
                else{
                  pagesToLoad = false;
                  break;
                }
              }
              else{
                pagesToLoad = false;
                break;
              }
            }
          }
        }
      
  }
  
  function getFormatDate(date, withTime=true){
      var year = date.getFullYear();
      var month = (1 + date.getMonth());
      month = month >= 10 ? month : '0' + month;
      var day = date.getDate();
      day = day >= 10 ? day : '0' + day;
      var hour =  date.getHours();
      hour = hour >= 10 ? hour : '0' + hour;
      var minute = date.getMinutes();
      minute = minute >= 10 ? minute  : '0' +  minute;
  
      var formatedDate = year + '-' + month + '-' + day;
      if(withTime){
        formatedDate = formatedDate + 'T' + hour + ':'  +  minute;
      }
      return formatedDate
  }
  function clearDataANDaddHeader(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var targetSheet = sheet.getSheetByName("newimportData");
    var range = targetSheet.getRange("A:AC")
    range.clearContent()
   
       row = [ "판매처", "접수일시", "처리일시", "주문번호", "딜명", "옵션명", "개수",  "수취인", "연락처", "취소카테고리", "처리자", "출고중지처리여부", "상태",  "쿠팡확인요청상태",  "귀책", "배송비부담", "선환불여부",      "요청번호", "PRODUCT ID", "옵션 ID", "회수송장번호"  ]
          targetSheet.appendRow(row);
  }
  
  function convertDataRowToSheet(targetSheetName, dataArray, sales){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var targetSheet = sheet.getSheetByName(targetSheetName);
  
    // var range = targetSheet.getRange("A:AC")
    // clear content (optional)
    // range.clearContent()
   
    // dataArray = [array[0]["createdAt"], array[0]["modifiedAt"],1234,"test" ];
  
      for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i] !== undefined) {
          
          /// map dict to array of values
          // row = Object.values(dataArray[i]);
            
          row = [
                  sales, 
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
                  array[i]["receiptId"],  //요청번호
                  array[i]["returnItems"][0]["sellerProductId"], //product ID
                  array[i]["returnItems"][0]["vendorItemId"] ]; //  옵션 ID
                  
  
            if (array[i]["returnDeliveryDtos"][0] != undefined ) {
            row.push(array[i]["returnDeliveryDtos"][0]["deliveryInvoiceNo"]);
      
            }
          
              
          targetSheet.appendRow(row);
          //console.log('added rows: ', ((pageNum-1)*10 + i))
        }
      }
    
    //  ExcelForm(targetSheetName, dataArray);
  
  }
   
  function ExcelForm(targetSheetName, dataArray){
     var sheet = SpreadsheetApp.getActiveSpreadsheet();
     var targetSheet = sheet.getSheetByName(targetSheetName);
    //엑셀 형식으로 변경
        for(let j=2; j<dataArray.length+2; j++){
      
        //M열 : 상태 
        if (targetSheet.getRange(j,13).getValue() == "RELEASE_STOP_UNCHECKED") targetSheet.getRange(j,13).setValue("출고중지요청");
        if (targetSheet.getRange(j,13).getValue() == "RETURNS_UNCHECKED") targetSheet.getRange(j,13).setValue("반품접수");
        if (targetSheet.getRange(j,13).getValue() == "VENDOR_WAREHOUSE_CONFIRM") targetSheet.getRange(j,13).setValue("입고완료");
        if (targetSheet.getRange(j,13).getValue() == "REQUEST_COUPANG_CHECK") targetSheet.getRange(j,13).setValue("쿠팡확인요청");
        if (targetSheet.getRange(j,13).getValue() == "RETURNS_COMPLETED") targetSheet.getRange(j,13).setValue("반품완료");
  
        //O열 : 배송비부담
        if (targetSheet.getRange(j,16).getValue() >= 0) targetSheet.getRange(j,16).setValue("판매자");
        if (targetSheet.getRange(j,16).getValue() < 0)  targetSheet.getRange(j,16).setValue("고객");
        
         //P열 : 선환불여부
        if (targetSheet.getRange(j,17).getValue() == false) targetSheet.getRange(j,17).setValue("N");
        if (targetSheet.getRange(j,17).getValue() == true)  targetSheet.getRange(j,17).setValue("Y");
       
        }
      
  }
  
  
  function connectAndGetAPIData(coupangAPIPath, coupangAPIQuery, accessKey, secretKey, vendorID) {
   
   
    const datetime = new Date().toISOString().substr(2,17).replace(/:/gi, '').replace(/-/gi, '') + "Z";
    //Logger.log(datetime);
    const method ='GET';
    const path = coupangAPIPath;
    const query = coupangAPIQuery;
   
    const message = datetime + method + path + query;
    const urlpath = path + '?' + query;
   
  
    //gateway hostname
    const hostAPIName = 'api-gateway.coupang.com';
    const hostAPIUrl = 'https://'+hostAPIName+'/'+urlpath
    
   
    /***
    const algorithm = 'sha256';
    const signature = crypto.createHmac(algorithm, SECRET_KEYS)
                        .update(message)
                        .digest('hex');
     */
    signature =  Utilities.computeHmacSha256Signature(message, secretKey)
    .map(function(chr){return (chr+256).toString(16).slice(-2)})
    .join('')
    //Logger.log(signature);
   
    const authorization = 'CEA algorithm=HmacSHA256, access-key=' + accessKey + ', signed-date=' + datetime + ', signature=' + signature;
    // console.log(authorization);
    //Logger.log(authorization);
   
    const options = {
      hostname: hostAPIName,
      port: 443,
      path: urlpath,
      method: method,
      muteHttpExceptions : true,
      headers: {
        //'X-Extended-Timeout': 90000,
        'X-EXTENDED-TIMEOUT': 90000,
        'X-Requested-By': vendorID,
        'Content-Type': 'application/json;charset=UTF-8',
        //'Content-Type': 'application/json',
        'Authorization': authorization
      }
    };
   
    var data = [];
    var response = UrlFetchApp.fetch(hostAPIUrl,options);
    //console.log("response" + response);
    // Logger.log("Remote File Size: " + response.getAllHeaders()["Content-Length"]);
    //Logger.log("Content-Type: " + response.getAllHeaders()["Content-Type"]);
    var responseCode = response.getResponseCode();
    //Logger.log("Response Code: " + responseCode);
   
  
    var responseBody = response.getContentText();
    if (responseCode === 200) {
      data = JSON.parse(responseBody);
      return data;
    } 
    else if(responseCode === 504) {
      Logger.log(Utilities.formatString('Request timeout 504, got %d: %s', responseCode, responseBody));
      return {code: "ERROR", message: 'API failure in Google Apps Script'}
    }
    else {
      Logger.log(Utilities.formatString('Request failed. Expected 200, got %d: %s', responseCode, responseBody));
      return {code: "ERROR", message: 'API failure in Google Apps Script'}
    };
   
  }
  
  