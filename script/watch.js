// Author: Max Yi-Hsun Chou <yihsunmaxchou@icloud.com>
// Github: https://github.com/maxchou415

let loading = false
const templateHtml = '<div><h1 style="padding: 30px; text-align: center;">草包已被隱藏！</h1></div>'

const contentFromPosts = document.querySelector('#contentArea')
const contentFromPages = document.querySelector('#pagelet_timeline_main_column')
const content = contentFromPosts || contentFromPages

function getBlocklist () {
  loading = true
  return new Promise(function (reslove) {
    chrome.storage.sync.get('blocklist', function (data) {
      const { blocklist } = data
      if (blocklist) {
        reslove(blocklist)
      } else {
        chrome.storage.sync.set({ blocklist: ['韓國瑜', '韓市長', '韓總', '國瑜', '韓流', '韓粉', '韓導'] }, function () {
          reslove(['韓國瑜', '韓市長', '韓總', '國瑜', '韓流', '韓粉', '韓導'])
        })
      }
    })
  })
}

async function removeElems () {
  if (loading) return;
  const blocklist = await getBlocklist()
  const articles = content.querySelectorAll(`div[id][role="article"]`)

  function hasSensitiveWordInBlocklist (article) {
    return blocklist.some((sensitiveWord) => article.innerHTML.includes(sensitiveWord))
  }

  articles.forEach(function (article) {
    if (hasSensitiveWordInBlocklist(article)) {
      article.innerHTML = templateHtml
    }
  })
  loading = false
}

content.addEventListener('DOMNodeInserted', function (event) {
  removeElems()
})

content.addEventListener('DOMSubtreeModified', function (event) {
  removeElems()
})

chrome.storage.onChanged.addListener(function (changes, namespace) {
  Object.keys(changes).forEach(function (key) {
    if (key === 'blocklist') {
      removeElems()
    }
  })
})