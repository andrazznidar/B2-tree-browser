const urlPrefix = ""; // Full B2 URL, including protocol, bucket and trailing '/'. Example: "https://f002.backblazeb2.com/myBucket/"
const treeUrl = ""; // URL to the JSON file containing output of the 'tree -J .' command run in the root directory of files in the B2 bucket. Example: "https://f002.backblazeb2.com/myBucket/tree.json"

var body = "";
var filetype = "";
var foldername = "";
var path = "";

function traverse(obj) {
  var k;
  var folderlength;
  if (obj instanceof Object) {
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        if ((k == "contents") & (foldername != ".")) {
          path += foldername + "/";
          folderlength = foldername.length + 1;
          body += "<details><summary>" + foldername + "</summary>";
          traverse(obj[k]);
          path = path.slice(0, path.length - folderlength);
          body += "</details>";
        } else {
          traverse(obj[k]);
        }
      }
    }
  } else {
    filetype = foldername;
    foldername = obj;

    if (filetype == "file") {
      let url = urlPrefix;
      url += path + obj;

      body += '<a href="' + url + '">' + obj + "</a>" + "<br/>";
    }
  }
}

async function getTree() {
  let url = treeUrl;
  let jdata = null;

  try {
    jdata = await (await fetch(url)).json();
  } catch (e) {
    console.log("Error fetching json url");
  }

  traverse(jdata[0]);
  document.getElementById("tree").innerHTML = body;
}

getTree();
