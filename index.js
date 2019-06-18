const request = require("request");
var parse = require("url-parse");

const db = require("./db");
const { Link } = db.models;
function GetUrlFromJSWeeklyLinkId(linkId) {
  console.log(`Firing request for ${linkId}`);
  return new Promise(function(resolve, reject) {
    request(
      {
        method: "GET",
        uri: `https://javascriptweekly.com/link/${linkId}`,
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
        console.log(`Got result - ${linkId}`, res.headers.location);
        var origurl = res.headers.location;
        console.log("origin url", origurl);
        if (origurl.indexOf("utm_") != -1) {
          console.log("removing utm");
          origurl = origurl.replace(/(\&|\?)utm([_a-z0-9=]+)/g, "");
        }
        console.log("origin url updated", origurl);
        var data = {
          statusCode: res.statusCode,
          origurl
        };
        console.log(data);
        resolve(data);
      }
    );
  });
}

function formatURL(origurl) {
  const data = parse(origurl, true);
  //console.log(data);
  var type, author;
  if (data.hostname === "medium.com") {
    type = "blog";
    author = data.origin + "/" + data.pathname.split("/")[1];
  }
  if (data.hostname === "github.com") {
    type = "code";
    author = data.origin + "/" + data.pathname.split("/")[1];
  }
  var url = data.origin + data.pathname;
  if (data.hostname === "www.youtube.com") {
    url = data.href;
    type = "video";
  }
  console.log(data);
  var format = {
    domain: data.origin,
    url,
    type,
    author
  };
  return format;
}

async function loadData(from, to) {
  console.log(`Loading from ${from} to ${to}`);
  var allP = [];
  for (let index = from; index <= to; index++) {
    allP.push({
      req: GetUrlFromJSWeeklyLinkId(index),
      jsweeklyid: index
    });
  }
  var finalData = [];
  for (let j = 0; j < allP.length; j++) {
    const { req, jsweeklyid } = allP[j];
    const { statusCode, origurl } = await req;
    if (statusCode === 301) {
      const { domain, url, type, author } = formatURL(origurl);
      finalData.push({ jsweeklyid, domain, url, type, author, origurl });
      console.log("got right results", {
        jsweeklyid,
        domain,
        url,
        type,
        author,
        origurl
      });
    } else {
      console.log(`Status code unknown @ ${jsweeklyid}`, {
        statusCode,
        origurl
      });
    }
  }
  console.log("Final Data => ", finalData);
  await Link.bulkCreate(finalData, {});
  console.log("All Data Pushed");
}

async function runMain(params) {
  //Main function to run after DB.
  try {
    //await Link.sync({ force: false });
    console.log("DB...");
    const startIndex = 5401;
    const lastIndex = 56253;
    //const lastIndex = 2000;
    const batchSize = 50;

    for (
      let index = startIndex;
      index <= lastIndex;
      index = index + batchSize
    ) {
      var last = index + batchSize - 1;
      if (last > lastIndex) {
        last = lastIndex;
      }
      await loadData(index, last);
    }
  } catch (error) {
    console.error(error);
  }
}

db.authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    runMain();
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });
