function includeJs(jsFilePath){
  var js = document.createElement("script");

  js.type = "text/javascript";
  js.src = jsFilePath;

  document.body.appendChild(js);
}
includeJs("/googlescript/key.js");

//테스트용
function printJSON(){

   console.log(test);
  var myjson = JSON.parse(test);
  // var col_list = Object.keys(myjson);
  // var data_list = Object.keys(myjson["data"]);
  // console.log(col_list.length);
  // console.log(data_list.length);
  // var KRW_value = myjson["data"]["closing_price"];
  // var json_data = [myjson["data"]["closing_price"], 1234, 123,333,4444];
  
  var json_data = myjson["contacts"][0];
  // console.log(json_data);

  // let result_map = Object.keys(json_data).map(function (key){
  //   return [String(key), json_data[key]];
  // });
  
  var contacts_list = Object.keys(myjson["contacts"]);
  console.log(contacts_list.length);

  SpreadsheetApp.getActiveSheet().getRange('A2:R100').clear();
  for(var i=0; i<contacts_list.length;i++){
  var result_map = [ myjson["contacts"][i]["id"], myjson["contacts"][i]["name"], myjson["contacts"][i]["email"], myjson["contacts"][i]["address"], myjson["contacts"][i]["gender"], 
                      myjson["contacts"][i]["phone"]["home"]];
  console.log(result_map);
   SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow(result_map); 
  }

}

// function getBlockChain(coin){

//   if(coin == null)
//   {
//     coin = "BTC";
//   }

//   var url = "https://api.bithumb.com/public/ticker/"+coin;
//   var response = UrlFetchApp.fetch(url);
//   var test = response.getContentText();
//   console.log(test);
//   var myjson = JSON.parse(test);

//   console.log(myjson);
//   var KRW_value = myjson["data"]["closing_price"];

//   console.log(KRW_value);
//   return parseFloat(KRW_value);
// }


// function myFunction() {
// var sheet = SpreadsheetApp.getActiveSheet();
// var item, date, title, link, desc;
// var txt = UrlFetchApp.fetch("https://www.topsecretwriters.com/rss").getContentText();
// var doc = Xml.parse(txt, false);
// var title = doc.getElement().getElement("channel").getElement("title").getText();
// var items = doc.getElement().getElement("channel").getElements("item");    // Parsing single items in the RSS Feed 
// for (var i in items) 
// { item  = items[i];
//  title = item.getElement("title").getText();
//   link  = item.getElement("link").getText(); 
//   date  = item.getElement("pubDate").getText(); 
//   desc  = item.getElement("description").getText(); 
//   sheet.appendRow([title,link,date,desc]);
//    }

// }

