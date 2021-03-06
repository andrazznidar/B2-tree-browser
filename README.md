# B2-tree-browser

Browse Backblaze B2 with a generated JSON file tree using a static website. An example website can be found on [my Github Pages](https://andrazznidar.github.io/B2-tree-browser/index.html).

## Usage

Generate JSON tree file with `tree -J . > tree.json` command on your local machine in the directory where files and folders are uploaded to the Backblaze B2 with `b2 sync . b2://myBucket/`

> MacOS users might want to use: `b2 sync --excludeRegex '.*\/\..*' --excludeRegex '\.DS_Store' . b2://myBucket/` as `tree` command, by default, does not include files starting with `.`

Upload this file `tree.json` to the B2 or serve it with this static website.

Set up `urlPrefix` and `treeUrl` const variables in the begining of the `./js/tree.js` file.
For `urlPrefix` use full B2 URL, including protocol, bucket and a trailing `/`.

> Example: `https://f002.backblazeb2.com/file/myBucket/`

For `treeUrl` use the URL to the JSON file `tree.json` that we created previously.

> Example: `https://f002.backblazeb2.com/file/myBucket/tree.json` or `../data/outputOftree.json`

Serve your website with your favourite static website host like [Github Pages](https://pages.github.com/).
