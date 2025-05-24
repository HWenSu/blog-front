'use strict'

const USERS_API = `${BASE_URL}/users`

// <<<---BODY--->>>
const body = document.body
// <<<---HEADER--->>>
// 主題模式
const mode = document.querySelector('.mode i')
// homr鍵
const logo = document.querySelector('.logo')
// 登入 / 註冊
const sign = document.querySelector('.sign')
// 會員頭像
const profile = document.querySelector('.profile')
// 彈跳窗背景
const modalBg = document.querySelector('.modal-bg')
const modalClose = modalBg.querySelector('.modal-close')
const modalForm = modalBg.querySelector('.modal-form')
// <<<---ARTICLE頁面--->>>
// 用戶留言區(登入中)
const logInComment = document.querySelector('.log-in-comment')
// 用戶留言區(未登入)
const logOutComment = document.querySelector('.log-out-comment')

// 初始變數/cookie/storage
// 主題模式
let theme = storage.get('theme') || 'light'
console.log('主題模式: ', theme)
// 登入狀態
let isLoggedIn = cookie.get('isLoggedIn') || false
console.log('登入狀態: ', isLoggedIn)
// 會員資料
let user = cookie.get('user') || ''
console.log('會員資料: ', user)
// 登入憑證
let token = cookie.get('token') || ''
console.log('登入憑證: ', token)
// 彈跳窗類別
let modalType
// 當前路徑
const pathname = window.location.pathname

const profileAvatars = document.querySelectorAll('.profile-avatar')

// 初始函式
;(function init() {
  // 設定主題模式
  setTheme()
  // 設定登入樣式
  setView()
  // 切換主題模式
  mode.addEventListener('click', onToggleTheme)
  // 開啟: 彈跳窗(登入 & 註冊)
  sign.addEventListener('click', onSigningModal)
  // 關閉: 彈跳窗(登入 & 註冊)
  modalClose.addEventListener('click', () => modalBg.classList.toggle('hidden'))
  // 登入/註冊 彈跳窗 提交表單
  modalForm.addEventListener('submit', onModalSubmit)
  // 監聽器: 會員選單
  profile.addEventListener('click', onLogout)
  // 監聽器: Home鍵
  logo.addEventListener('click', onRedirectHome)

  if (isLoggedIn && user && user.avatar) {
  profileAvatars.forEach((avatar) => avatar.src = user.avatar)
  }

})()

// 設定主題模式
function setTheme() {
  if (theme === 'light') {
    // light模式
    mode.classList.toggle('fa-sun')
  } else {
    // dark模式
    mode.classList.toggle('fa-moon')
    body.classList.toggle('dark')
  }
}

// 設定登入樣式
function setView() {
  // article頁面樣式
  if (pathname === '/article/index.html') {
    isLoggedIn ? logInComment.classList.toggle('hidden') : logOutComment.classList.toggle('hidden')
  }
  // header樣式
  isLoggedIn ? profile.classList.toggle('hidden') : sign.classList.toggle('hidden')
}

// 監聽器函式: 切換主題模式
function onToggleTheme() {
  // 儲存模式
  theme = theme === 'light' ? 'dark' : 'light'
  storage.set('theme', theme)
  console.log('主題模式: ', theme)
  // 切換模式
  mode.classList.toggle('fa-sun')
  mode.classList.toggle('fa-moon')
  body.classList.toggle('dark')
}

// 監聽器函式: 切換登入樣式
function onToggleView() {
  // 切換article頁面樣式
  if (pathname === '/article/index.html') {
    logInComment.classList.toggle('hidden')
    logOutComment.classList.toggle('hidden')
  }
  // 切換header樣式
  sign.classList.toggle('hidden')
  profile.classList.toggle('hidden')
}
// 監聽器函式: 開啟: 彈跳窗(登入 & 註冊)
function onSigningModal(event) {
  const target = event.target
  if (target.classList.contains('sign-in') || target.classList.contains('sign-up')) {
    modalType = target.classList.contains('sign-in') ? '登入' : '註冊'
    modalForm.action = modalType === '登入' ? '/users/login' : '/users/register'
    modalForm.innerHTML = createModal(modalType)
    modalBg.classList.toggle('hidden')
    console.log('視窗類別: ', modalType)
  }
}

// #監聽器函式: Home鍵
function onRedirectHome() {
  // 當下路徑
  const currentPath = window.location.href
  const fileName = currentPath.split('/').slice(-1)[0]

  // 從cookie移除keyword & filter
  cookie.remove('keyword')
  cookie.remove('filter')

  // 導向home頁面
  window.location.href = '../index.html'
}

// #監聽器函式: 登入/註冊 彈跳窗 提交表單
function onModalSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)

  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')
  const rePassword = formData.get('re-password')

  const registerBody = { username, email, password, rePassword }
  const loginBody = { username, password }

  modalType === '註冊' ? registerRequest(registerBody) : loginRequest(loginBody)
}

// 新增彈跳窗元素
function createModal(type) {
  return `<h1 class="modal-name">${type}</h1>
  ${createInput('username', '帳號', 'text')}
  ${type === '登入' ? '' : createInput('email', '信箱', 'text')}
  ${createInput('password', '密碼', 'password')}
  ${type === '登入' ? '' : createInput('re-password', '確認密碼', 'password')}
  <button class="modal-submit" type="submit">提交</button>`
}

// 新增輸入框元素
function createInput(attr, label, type) {
  return `<div>
    <label for="${attr}">${label}</label>
    <span class="colon">:</span>
    <input id="${attr}" name="${attr}" type="${type}">
  </div>`
}

// 註冊請求
function registerRequest(body) {
  const { password, rePassword } = body
  if (password !== rePassword) {
    alert('密碼不相同,請再試一次!')
    return
  }
  axios
    .post(`${USERS_API}/register`, body)
    .then((response) => {
      const data = response.data
      console.log('註冊成功')
      // 切換到登入modal
      modalType = '登入'
      console.log('視窗類別: ', modalType)
      modalForm.innerHTML = createModal(modalType)
    })
    .catch((error) => {
      const errorMessage = error.response.data.message
      console.error(errorMessage)
    })
}

// 登入請求
function loginRequest(body) {
  axios
    .post(`${USERS_API}/login`, body)
    .then((response) => {
      const data = response.data
      token = data.token
      user = data.user
      isLoggedIn = true
      cookie.set('token', token)
      cookie.set('user', user)
      cookie.set('isLoggedIn', true)
      console.log('登入憑證', token)
      console.log('會員資料', user)
      console.log('登入狀態', true)
      console.log('註冊成功')
      // 更新大頭貼
       profileAvatars.forEach((avatar) => avatar.src = user.avatar)

      // 切換到頁面
      modalBg.classList.toggle('hidden')
      // 切換登入樣式
      onToggleView()
    })
    .catch((error) => {
      const errorMessage = error.response.data.message
      console.error(errorMessage)
    })
}

// 登出
function onLogout(event) {
  const target = event.target
  if (target.classList.contains('logout')) {
    // 切換article頁面樣式
    if (pathname === '/article/index.html') {
      logInComment.classList.add('hidden')
      logOutComment.classList.remove('hidden')
    }
    if (pathname !== '/article/index.html' && pathname !== '/index.html') {
      window.location.href = '../index.html'
    }
    // 切換header樣式
    sign.classList.remove('hidden')
    profile.classList.add('hidden')
    isLoggedIn = false
    cookie.set('isLoggedIn', isLoggedIn)
    token = ''
    cookie.set('token', token)
    // 更新大頭貼
    profileAvatars.forEach((avatar) => avatar.src = "../public/images/guest/guest.png")
  }
}
