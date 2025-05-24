'use strict'

// API
const ARTICLES_URL = `${BASE_URL}/articles`

// HTML 元素
const userArticles = document.querySelector('.user-articles')
const userAvatar = document.querySelector('.user-avatar img')
const profileAvatar = document.querySelector('.profile-avatar img')
const fileUploader = document.querySelector('#file-uploader')
const account = document.querySelector('.user-account')
const email = document.querySelector('.user-email')

const articles = []

let id = user.id
console.log(user)

// 初始函式
;(function init() {
  getUserdata(user)
  // 取得文章資料
  getUserArticles()

  fileUploader.addEventListener('change', onSubmit)

  userAvatar.addEventListener('click', () => fileUploader.click())
})()

// API: 取得用戶文章資料
function getUserArticles() {
  axios
    .get(`${USERS_API}/${user.id}/articles`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((responses) => {
      const data = responses.data
      articles.push(...data.articles)
      console.log(articles)
      renderUserArticles(articles)
    })
    .catch((error) => {
      console.log(error)
    })
}

function renderUserArticles(articles) {
  let rawHTML = ''
  articles.forEach((article) => {
    console.log(article)
    rawHTML += `<li><a href="../edit/index.html">${article.title}</a></li>`
  })
  userArticles.innerHTML = rawHTML
}

// 更新user資料
function getUserdata(user) {
  //頭像設置
  userAvatar.src = user.avatar
  profileAvatar.src = user.avatar
  //會員資料設置
  account.textContent = user.username
  email.textContent = user.email
}

//上傳頭像至後端
function onSubmit(event) {
  if (event) {
    event.preventDefault()
  }
  const file = fileUploader.files[0]
  if (file) {
    let formData = new FormData()
    formData.append('file', file)

    axios
      .patch(`${BASE_URL}/users/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      .then((data) => {
        user = data.data.user
        console.log('Success:', data)
        alert('圖片上傳成功!')
        cookie.set('user', data.data.user)
        console.log('已更新cookie')
        getUserdata(user)
      })
      .catch((error) => {
        console.error('Error:', error)
        alert('圖片上傳失敗')
      })
  } else {
    alert('請選擇圖片')
  }
}
