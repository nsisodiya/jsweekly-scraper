const request = require("request");

function GetUrlFromJSWeeklyLinkId(linkId) {
  const linkurl = `https://javascriptweekly.com/link/${linkId}`;
  console.log("Rquesting linkurl", linkurl);
  return new Promise(function(resolve, reject) {
    request(
      {
        method: "GET",
        uri: linkurl,
        followRedirect: false,
        headers: {
          Host: "javascriptweekly.com",
          Connection: "keep-alive",
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          "Upgrade-Insecure-Requests": "1",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
        }
      },
      (err, res, body) => {
        if (err) {
          console.error(`Error - ${linkId}`, err);
          reject({ err });
        }
        console.log("res.headers", res.headers);
        console.log("statusCode:", res && res.statusCode);
        console.log("body", body);
        resolve({});
      }
    );
  });
}

async function runMain(params) {
  //Main function to run after DB.
  try {
    //await Link.sync({ force: false });
    console.log("Caling 1 xhr call...");
    var data = await GetUrlFromJSWeeklyLinkId(134);
    var data = await GetUrlFromJSWeeklyLinkId(13400);
  } catch (error) {
    console.error(error);
  }
}
runMain();
