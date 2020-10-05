const urlPrefix = ""; // Full B2 URL, including protocol, bucket and trailing '/'. Example: "https://f002.backblazeb2.com/file/myBucket/"
const treeUrl = ""; // URL to the JSON file containing output of the 'tree -J .' command run in the root directory of files in the B2 bucket. Example: "https://f002.backblazeb2.com/file/myBucket/tree.json" or "../data/outputOftree.json"

var body = "";
var filetype = "";
var foldername = "";
var path = "";

// This function 'traverse(obj)' is modified from a snippet published on the website stackoverflow (https://stackoverflow.com/a/10460119) and as such is licensed as CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). The original stackoverflow anwser was made by El Ronnoco (https://stackoverflow.com/users/395628/el-ronnoco) that was additionally modified by user1371896 (https://stackoverflow.com/users/1371896/user1371896) and OCDev (https://stackoverflow.com/users/508558/ocdev).
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

// This function 'interceptClicks()' is modified from a snippet published on the website stackoverflow (https://stackoverflow.com/a/21518470) and as such is licensed as CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). The original stackoverflow anwser was made by Matt Way (https://stackoverflow.com/users/277697/matt-way) that was additionally modified by user2742371.
const interceptClicks = async () => {
  const result = await getTree();
  if (screen.width > 992) {
    // This part of the function is s modified from a snippet published on the website codeproject (https://www.codeproject.com/Answers/525918/Displaypluscontentplusofpluslinkplusinplusparticul#answer1). The original codeproject anwser was made by ramukhsakarp (https://www.codeproject.com/script/Membership/View.aspx?mid=7652198).
    $(document).ready(function () {
      $("#tree a").click(function (e) {
        e.preventDefault();
        $("#preview").attr("data", $(this).attr("href"));
        $("#preview").attr(
          "class",
          "border border-primary rounded col-lg-7 m-1"
        );
      });
    });
  }
};

interceptClicks();
