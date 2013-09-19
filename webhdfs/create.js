var Curl = require('node-curl/lib/Curl');

var url = "http://hdcls04.hpc.cmc.osaka-u.ac.jp:50004/webhdfs/v1";

var response_code;
var redirect_url;

function G1(gnr) {
  var url2 = url + "/user/manabu/x6?op=CREATE";
  console.log('url2:', url2);

  var curl = new Curl();
  curl.setopt('URL', url2);
  curl.setopt('HTTPAUTH', (1<<2));
  curl.setopt('USERPWD', ":");
  curl.setopt('CUSTOMREQUEST', "PUT");

  curl.on('data', function(chunk) {
    console.log("receive: " + chunk.toString());
    return chunk.length;
  });

  curl.on('header', function(chunk) {
    var hdr = chunk.toString();
    console.log("receive: " + hdr);
    var matchedHeaders = /^([^\:]+)\: (.*)[\r\n]*$/.exec(hdr);
    if (matchedHeaders && matchedHeaders.length == 3) {
      if (matchedHeaders[1] == "Location") {
        redirect_url = matchedHeaders[2];
      }
    }
    return chunk.length;
  });

  curl.on('error', function(e) {
    console.log("error: " + e.message);
    curl.close();
  });

  curl.on('end', function() {
    response_code = curl.getinfo('RESPONSE_CODE');
    gnr.next();
  });

  curl.perform();
}

function G2(gnr) {
  var curl = new Curl();
  console.log('url3:', redirect_url);
  curl.setopt('URL', redirect_url); 
  curl.setopt('HTTPAUTH', (1<<2));
  curl.setopt('USERPWD', ":");
  curl.setopt('CUSTOMREQUEST', "PUT");
  curl.setopt_httppost([{name: 'file', file: 'yield.js'}]);

  curl.on('data', function(chunk) {
    console.log("receive: " + chunk.toString());
    return chunk.length;
  });

  curl.on('header', function(chunk) {
    var hdr = chunk.toString();
    console.log("receive: " + hdr);
    return chunk.length;
  });

  curl.on('error', function(e) {
    console.log("error: " + e.message);
    curl.close();
  });

  curl.on('end', function() {
    response_code = curl.getinfo('RESPONSE_CODE');
    gnr.next();
  });

  curl.perform();
}


var gnr = (function*(){
  yield G1(gnr);
  console.log("code:" + response_code);
  console.log("location:" + redirect_url);
  yield G2(gnr);
  console.log("code:" + response_code);
})();
gnr.next();


//curl.setopt('CUSTOMREQUEST', "POST");
//curl.setopt('POST', 1);
//curl.setopt('UPLOAD', 1);
//curl.setopt('INFILE', fd);
//curl.setopt('INFILESIZE', 100);

//curl.setopt('POSTFIELDS', '@/home/manabu/test/x.js');
//curl.setopt('POSTFIELDSIZE', 8);
