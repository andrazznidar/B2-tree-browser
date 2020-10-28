const urlPrefix = ""; // Full B2 URL, including protocol, bucket and trailing '/'. Example: "https://f002.backblazeb2.com/file/myBucket/"
const treeUrl = ""; // URL to the JSON file containing output of the 'tree -J .' command run in the root directory of files in the B2 bucket. Example: "https://f002.backblazeb2.com/file/myBucket/tree.json" or "../data/outputOftree.json"

var body = "";
var filetype = "";
var foldername = "";
var path = "";
var datalist = "";
var branch = null;
const isDesktop = () => (screen.width >= 992);

const imageFileExtension = [
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "svgz",
  "tif",
  "tiff",
  "wbmp",
  "webp",
  "ico",
  "jng",
  "bmp",
];

// This const and the folowing function 'encodeS3URI(filename)' is modified from a file published on the website GitHub (https://github.com/GeorgePhillips/node-s3-url-encode/blob/master/index.js) and is licensed under the MIT License (https://github.com/GeorgePhillips/node-s3-url-encode/blob/master/LICENSE.). The original code was commited and published by George Phillips (https://github.com/GeorgePhillips) that was additionally modified by Joey Ciechanowicz.
// node-s3-url-encode - Because s3 urls are annoying
const encodings = {
  "+": "%2B",
  "!": "%21",
  '"': "%22",
  "#": "%23",
  $: "%24",
  "&": "%26",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
  ",": "%2C",
  ":": "%3A",
  ";": "%3B",
  "=": "%3D",
  "?": "%3F",
  "@": "%40",
};

function encodeS3URI(filename) {
  return encodeURI(filename) // Do the standard url encoding
    .replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/gim, function (match) {
      return encodings[match];
    })
    .replace(/%20/g, "+");
}

// This function 'traverse(obj)' is modified from a snippet published on the website stackoverflow (https://stackoverflow.com/a/10460119) and is licensed as CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). The original stackoverflow anwser was made by El Ronnoco (https://stackoverflow.com/users/395628/el-ronnoco) that was additionally modified by user1371896 (https://stackoverflow.com/users/1371896/user1371896) and OCDev (https://stackoverflow.com/users/508558/ocdev).
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
          datalist += (`<option value="${path}" label="${foldername}">`);
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
      url += encodeS3URI(path + obj);
      datalist += (`<option value="${path + obj}" label="${obj}">`);

      body += '<a href="' + url + '" target="_blank">' + obj + "</a>" + "<br/>";
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
  document.getElementById("search").insertAdjacentHTML("afterend", `<datalist id="files"> ${datalist} </datalist>`);
}

// This function 'interceptClicks()' is modified from a snippet published on the website stackoverflow (https://stackoverflow.com/a/21518470) and is licensed as CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). The original stackoverflow anwser was made by Matt Way (https://stackoverflow.com/users/277697/matt-way) that was additionally modified by user2742371.
const interceptClicks = async () => {
  const result = await getTree();
  if (isDesktop()) {
    // This part of the function is modified from a snippet published on the website codeproject (https://www.codeproject.com/Answers/525918/Displaypluscontentplusofpluslinkplusinplusparticul#answer1). The original codeproject anwser was made by ramukhsakarp (https://www.codeproject.com/script/Membership/View.aspx?mid=7652198).
    $(document).ready(function () {
      $("#tree a").click(function (e) {
        e.preventDefault();

        document
          .getElementById("preview")
          .setAttribute(
            "class",
            "invisible border border-primary rounded col-lg-7 ml-lg-1 center w-100"
          );

        // This workaround is modified from a snippet published on the website stackoverflow (https://stackoverflow.com/questions/676705/changing-data-content-on-an-object-tag-in-html) and is licenced as CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/). The stackoverflow anwser to the question titled 'Changing data content on an Object Tag in HTML' was made by Israel Gav (https://stackoverflow.com/users/4182640/israel-gav) and was published untitled.
        let previewObject = document.getElementById("preview");
        previewObject.setAttribute("data", this.getAttribute("href"));

        let previewClone = previewObject.cloneNode(true);
        let previewParent = previewObject.parentNode;

        previewParent.removeChild(previewObject);
        previewParent.appendChild(previewClone);

        if (
          imageFileExtension.includes(
            this.getAttribute("href").split(".").pop()
          )
        ) {
          document
            .getElementById("preview")
            .setAttribute(
              "class",
              "border border-primary rounded col-lg-7 ml-lg-1 center h-100"
            );
        } else {
          document
            .getElementById("preview")
            .setAttribute(
              "class",
              "border border-primary rounded col-lg-7 ml-lg-1 min-vh-100 center"
            );
        }

        if (document.documentElement.scrollTop > 56) {
          document.documentElement.scrollTop = 55;
        }
      });
    });
  }
};

interceptClicks();

function expandSearch(path) {
  if(branch) {
    // Remove highlight of previous search
    branch.classList.remove("bg-warning");
  }

  branch = document.getElementById("tree");

  // Expand the tree to the desired file
  for(f of path.split("/").slice(0, -1)) {    
    for(b of branch.children) {      
      if(b?.firstElementChild?.innerText === f) {
        b.setAttribute("open", "");
        branch = b;
        break;
      }
    }
  }

  if(path.split("/").slice(-1)[0] !== "") {
    // Highlight the desired file
    for(b of branch.getElementsByTagName("a")) {
      if(b.innerText === path.split("/").slice(-1)[0]) {
        b.classList.add("bg-warning");
        if(isDesktop()) b.click(); // On desktop, auto load file into object.
        branch = b;
        break;
      }
    }
  } else {
    // User searched for folder, not file
    branch.classList.add("bg-warning");
  }

}