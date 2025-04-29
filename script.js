import ArticleAccordionComponent from "./accordion.js";
const api_key = sessionStorage.getItem("api_key")
const generateArticleBtn = document.getElementById("generate-articles");
const getArticleBtn = document.getElementById("get-articles");
const regenerateBtn = document.getElementById("regen-article")
const generateLoadingBtn = document.getElementById("loading-button")
const regenerateLoadingBtn = document.getElementById("regen-loading")
const getByLanguagesBtn = document.getElementById("get-by-language")
const articlesContainer = document.getElementById("articles-container")
const articlesHeader = document.getElementById("articles-header")
const errorHeader = document.getElementById("error")
const index = document.getElementById("index")
const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
// const baseUrl = "http://127.0.0.1:3000";

generateArticleBtn.addEventListener("click", generateArticles);
getArticleBtn.addEventListener("click", getArticle);
getByLanguagesBtn.addEventListener("click", (e) => {
  e.preventDefault()
  const select = document.getElementById("by-language")
  const code = select.value
  const language = select.options[select.selectedIndex].textContent
  getArticlesByLanguage(code, language)
})
regenerateBtn.addEventListener("click", regenerateArticles)
index.addEventListener("click", allArticles)


async function allArticles () {
  const response = await fetch(`${baseUrl}/v1/articles/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });
  const data = await response.json()
  clearAccordions()
  setArticleHeader(`10 Most Recent Articles`)
  data.forEach((article, i) => {
    new ArticleAccordionComponent(`article-${i}`, article)
  })
  window.initFlowbite()
}
function clearAccordions() {
  [...articlesContainer.children].forEach((container) => {
    container.replaceChildren()
  })
}

function setLoading(btn, loadingBtn, isLoading) {
  if (isLoading) {
    btn.classList.add('hidden');
    loadingBtn.classList.remove('hidden');
  } else {
    loadingBtn.classList.add('hidden');
    btn.classList.remove('hidden');
  }
}

async function regenerateArticles(e) {
  e.preventDefault()
  const id = document.getElementById("regen-article-id").value

  setLoading(regenerateBtn, regenerateLoadingBtn, true)
  const response = await fetch(`${baseUrl}/v1/articles/${id}/regenerate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  })
  const data = await response.json()
  clearAccordions()
  new ArticleAccordionComponent("article-0", data)
  setArticleHeader(`Article ${data.id} Regenerated`)
  window.initFlowbite()
  setLoading(regenerateBtn, regenerateLoadingBtn, false)
}

async function generateArticles(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const content = document.getElementById("content").value;
  const languageCode = document.getElementById("language-code").value;

  if (title === "" || content === "") {
    alert("Title or content must not be empty");
    return false;
  }

  const article = {
    article: {
      title: title,
      description: description,
      content: content,
      language_code: languageCode,
    },
  };

  const payload = JSON.stringify(article);

  setLoading(generateArticleBtn, generateLoadingBtn, true)
  const response = await fetch(`${baseUrl}/v1/articles`, {
    method: "POST",
    body: payload,
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include"
  });
  const data = await response.json();
  console.log(data)
  clearAccordions()
  new ArticleAccordionComponent("article-0", data)
  setArticleHeader(`Article ${data.id} Generated`)
  window.initFlowbite()
  setLoading(generateArticleBtn, generateLoadingBtn, false)
}

async function getArticle(e) {
  e.preventDefault();
  const id = document.getElementById("article-id").value;
  const response = await fetch(`${baseUrl}/v1/articles/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });
  clearAccordions()

  if (response.status === 404) {
    renderError(`404: Article ${id} not found`)
    return
  }

  const data = await response.json();
  console.log(data)
  new ArticleAccordionComponent("article-0", data)
  window.initFlowbite()
}

function renderError(string) {
  errorHeader.textContent = string
  articlesHeader.hidden = false;
}

function setArticleHeader(string) {
  articlesHeader.textContent = string
  articlesHeader.hidden = false;
}

async function getArticlesByLanguage(code, language) {
  const response = await fetch(`${baseUrl}/v1/articles/languages/${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });
  const data = await response.json();
  clearAccordions()
  setArticleHeader(`5 Most Recent ${language} Articles`)
  data.forEach((article, i) => {
    new ArticleAccordionComponent(`article-${i}`, article)
  })
  window.initFlowbite()
}

window.onload = () => {
  if (api_key === null) {
    location.href = "index.html"
  } else {
    allArticles()
  }
};

