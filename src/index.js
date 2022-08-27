 const axios = require("axios");
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;
  const fs = require("fs");
  const Path = require("path");

  global.document = new JSDOM().window.document;

  const SPEEDRUN_URL = 'https://www.speedrun.com'
  let platform = 'DS' // default value
  const html = document.createElement('div')
  let nb_items_to_collect = 100 // default value
  const nb_items_per_page = 50

 if (process.argv.length === 5) {
   platform = process.argv[3]
   nb_items_to_collect = 4
 }

  fs.mkdir(platform, () => {});

  for (let i = 0; i < nb_items_to_collect; i = i + nb_items_per_page) {
    fetchItems(platform, i)
  }

  function fetchItems(platform, start_at) {
    axios.get(`${SPEEDRUN_URL}/ajax_games.php`, {params: {platform: platform, start: start_at}}).then(({ data }) => {
      html.innerHTML = data

      Array.from(html.getElementsByClassName('gamelistcell')).map((game) => {
        const name = game.children[0].children[2].innerHTML.replaceAll('/', '-')
        const image_url = game.children[0].children[0].src
        const filename = Path.resolve('./', platform, `${name}.png`)
        const writer = fs.createWriteStream(filename)

        axios.get(`${SPEEDRUN_URL}${image_url}`, {
          responseType: 'stream'
        }).then(( response) => {

          response.data.pipe(writer)

          return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
          })
        })
      })

      return start_at + nb_items_per_page;
    })
  }
