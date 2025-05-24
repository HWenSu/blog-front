'use strict'

// API
const ARTICLE_URL = `${BASE_URL}/articles`

// HTML元素
const commentBtn = document.querySelector('.comment-btn-container')
const textArea = document.querySelector('.user-comment')
const articleContainer = document.querySelector('article')
const commentHistory = document.querySelector('.comment-history-container')

// 儲存單篇文章
const article = []
// 儲存歷史留言
const comments = []
// 儲存最後一則留言
let lastComment
let offset = 0
const size = 2

// 留言區狀態
let isTextareaActive = false
console.log('留言區狀態: ', isTextareaActive)
// 索取cookie值
const articleId = cookie.get('articleId')
console.log('文章ID: ', articleId)
// 初始化 Intersection Observer
const observer = observerInit()

// 初始函式
;(function init() {
  // 取得文章資料
  getArticle()
  // 取得留言資料
  getComments()
  // 監聽器: 留言區
  body.addEventListener('click', onTextarea)
  // 監聽器: 篩選類別
  articleContainer.addEventListener('click', onFilter)
})()

// API: 取得文章資料
function getArticle() {
  axios
    .get(`${ARTICLE_URL}/${articleId}`)
    .then((response) => {
      const data = response.data
      // 儲存單篇文章
      article.push(data)
      console.log('回傳文章資料: ', data)
      console.log('儲存文章資料: ', article)
      // 渲染單篇文章
      renderArticle(article[0])
    })
    .catch((error) => {
      console.log(error)
    })
}

// API: 取得留言資料
function getComments() {
  axios
    .get(`${BASE_URL}/comments/${articleId}?offset=${offset}&size=${size}`)
    .then((response) => {
      const data = response.data
      const total = data.total
      const main = data.main
      // 儲存歷史留言
      comments.length = 0
      comments.push(...main)
      console.log('留言總數: ', total)
      console.log('回傳留言資料: ', data)
      console.log('主體留言資料: ', main)
      // 渲染留言
      renderComments(comments)
      //更新最後一則留言
      lastComment = commentHistory.lastElementChild
      console.log('最後一則留言: ', lastComment)
      //若最後一則留言存在，且起始資料不超過留言總數
      if (lastComment && offset + size < data.total) {
        // 使用觀察最後一則留言，到達臨界值則新增2筆留言
        observer.observe(lastComment)
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

// Intersection Observer 初始化函式
function observerInit() {
  // 設定 Intersection Observer 的選項
  const option = { root: null, rootMargin: '0px', threshold: 1 }
  // Intersection Observer 的回調函式，處理元素進入視口的事件
  const callback = (entires) => {
    entires.forEach((entry) => {
      console.log('觀察狀態: ', entry.isIntersecting)
      if (entry.isIntersecting) {
        offset += size
        //獲取留言資料並渲染
        getComments()
        // 移除觀測舊的元素，觀測新的元素
        observer.unobserve(entry.target)
      }
    })
  }
  // 回傳新的 Intersection Observer 實例，並使用設定的回調函式與選項
  return new IntersectionObserver(callback, option)
}

// 渲染單篇文章
function renderArticle(article) {
  const categories = article.categories
  let rawHTML = `<h2 class="title">${article.title}</h2>
  <div class="user">
    <img src="${article.user.avatar}">
    <a href="#" class="username">${article.user.username}</a>
    <ul class="categories">
      ${renderCategories(categories)}
    </ul>
  </div>
  <img class="article-img" src="${article.picture}" alt="article-image">
  <div class="article-content">
  ${article.content}
  </div>`
  articleContainer.innerHTML = rawHTML
}

// 渲染單篇文章全部分類
function renderCategories(categories) {
  let rawHTML = ''
  categories.forEach((e) => {
    rawHTML += `<li><a class="category" href="#">${e.category}</a></li>`
  })
  return rawHTML
}

// 渲染歷史留言
function renderComments(comments) {
  let rawHTML = ''
  comments.forEach((commentInfo) => {
    rawHTML += `
      <div class="comment-container" data-id="${commentInfo.id}">
          <div class="user-info ${commentInfo.user.id}">
            <img class="comment-avatar" src="${commentInfo.user.avatar}">
            <div class="comment-username">${commentInfo.user.username}</div>
          </div>
         <div class="comment-area">
          <span>${commentInfo.comment}</span>
        </div>
      </div>`
  })
  // 因設置無限下滑機制，拿到新的留言資料後會新增HTML
  commentHistory.innerHTML += rawHTML
}

//監聽器函式: 留言區狀態
function onTextarea(event) {
  const target = event.target

  if (target.tagName === 'TEXTAREA') {
    isTextareaActive = true
    textArea.classList.add('textarea-clicked')
    commentBtn.classList.remove('hidden')
  } else if (target.classList.contains('comment-cancel')) {
    isTextareaActive = false
    textArea.value = ''
    textArea.classList.remove('textarea-clicked')
    commentBtn.classList.add('hidden')
  } else if (!textArea.value) {
    isTextareaActive = false
    textArea.classList.remove('textarea-clicked')
    commentBtn.classList.add('hidden')
  }
}

// 監聽器函式: 篩選類別
function onFilter(event) {
  const target = event.target
  // 篩選分類
  if (target.matches('.category')) {
    cookie.set('filter', 'categories')
  }
  // 篩選用戶
  else if (target.matches('.username')) {
    cookie.set('filter', 'user')
  }
  cookie.set('keyword', target.textContent)
  // 導向HOME頁面
  window.location.href = '/index.html'
}
