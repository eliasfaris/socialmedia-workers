const html = infos => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>infos</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet"></link>
  </head>
  <body class="bg-red-100">
  <h1 class="block text-grey-800 text-md font-bold mb-2">Welcome to the Social Media Blog!</h1>
    <div class="w-full h-full flex content-center justify-center mt-8">
      <div class="bg-white shadow-md rounded px-8 pt-6 py-8 mb-4">
        <h1 class="block text-grey-800 text-md font-bold mb-2" style = "text-align:center">Create Post</h1>
        <div class="flex">
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-800 leading-tight focus:outline-none focus:shadow-outline" type="text" name="title" placeholder="Title"></input><br/>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-800 leading-tight focus:outline-none focus:shadow-outline" type="text" name="username" placeholder="Username"></input><br/>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-800 leading-tight focus:outline-none focus:shadow-outline" type="text" name="content" placeholder="Content"></input><br/>
        <button class="bg-blue-500 hover:bg-blue-800 text-white font-bold ml-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline" id="create" type="submit">Post</button>
      </div>
        <div class="mt-4" id="infos"></div>
      </div>
    </div>
  </body>
  <script>
    window.infos = ${infos}
    var updateinfos = function() {
      fetch("/", { method: 'PUT', body: JSON.stringify({ infos: window.infos }) })
      populateinfos()
    }
    var completeinfo = function(evt) {
      var checkbox = evt.target
      var infoElement = checkbox.parentNode
      var newinfoset = [].concat(window.infos)
      var info = newinfoset.find(t => t.id == infoElement.dataset.info)
      info.completed = !info.completed
      window.infos = newinfoset
      updateinfos()
    }
    var populateinfos = function() {
      var infoContainer = document.querySelector("#infos")
      infoContainer.innerHTML = null
      window.infos.forEach(info => {
        var el = document.createElement("div")
        el.className = "border-t py-4"
        el.dataset.info = info.id

        var title = document.createElement("span")
        var username = document.createElement("span")
        var content = document.createElement("span")

        var spce1 = document.createElement("br");
        var spce2 = document.createElement("br");

        title.textContent = "Title: " + info.title
        username.textContent = "Username: " + info.username
        content.textContent = "Content: " + info.content

  
        el.appendChild(title)
        el.appendChild(spce1)
        el.appendChild(username)
        el.appendChild(spce2)
        el.appendChild(content)
        infoContainer.appendChild(el)
      })
    }
    populateinfos()
    var createinfo = function() {
      var title = document.querySelector("input[name=title]")
      var username = document.querySelector("input[name=username]")
      var content = document.querySelector("input[name=content]")
      if (title.value.length && username.value.length && content.value.length) {
        window.infos = [].concat(infos, {title: title.value, username: username.value, content: content.value})
        title.value = ""
        username.value = ""
        content.value = ""
        updateinfos()
      }
    }
    document.querySelector("#create").addEventListener('click', createinfo)
  </script>
</html>
`



const defaultData = { infos: [] }

const setCache = (key, data) => SM_DATA.put(key, data)
const getCache = key => SM_DATA.get(key)

async function getinfos(request) {
  // const ip = request.headers.get('CF-Connecting-IP')
  const cacheKey = `data`
  let data
  const cache = await getCache(cacheKey)
  if (!cache) {
    await setCache(cacheKey, JSON.stringify(defaultData))
    data = defaultData

  } else {
    data = JSON.parse(cache)
  }
  const body = html(JSON.stringify(data.infos || []).replace(/</g, "\\u003c"))
  return new Response(body, {
    headers: { 'Content-Type': 'text/html' },
  })
}

async function updateinfos(request) {
  const body = await request.text()
  // const ip = request.headers.get('CF-Connecting-IP')
  const cacheKey = `data`
  try {
    JSON.parse(body)
    
    await setCache(cacheKey, body)
    return new Response(body, { status: 200 })
  } catch (err) {
    return new Response(err, { status: 500 })
  }
}

async function handleRequest(request) {
  if (request.method === 'PUT') {
    return updateinfos(request)
  } else {
    return getinfos(request)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})