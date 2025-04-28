import ArticleAccordionComponent from "./accordion.js";
const api_key = sessionStorage.getItem("api_key")
const generateArticleBtn = document.getElementById("generate-articles");
const getArticleBtn = document.getElementById("get-articles");
const loadingBtn = document.getElementById("loading-button")
const getByLanguagesBtn = document.getElementById("get-by-language")
const articlesContainer = document.getElementById("articles-container")
const articlesHeader = document.getElementById("articles-header")
// const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
const baseUrl = "http://127.0.0.1:3000";

generateArticleBtn.addEventListener("click", generateArticles);
getArticleBtn.addEventListener("click", getArticle);
getByLanguagesBtn.addEventListener("click", (e) => {
  e.preventDefault()
  const code = document.getElementById("by-language").value
  getArticlesByLanguage(code)
})

function clearAccordions() {
  [...articlesContainer.children].forEach((container) => {
    container.replaceChildren()
  })
}

function setLoading(isLoading) {
  if (isLoading) {
    generateArticleBtn.classList.add('hidden');
    loadingBtn.classList.remove('hidden');
  } else {
    loadingBtn.classList.add('hidden');
    generateArticleBtn.classList.remove('hidden');
  }
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

  setLoading(true)
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
  clearAccordions()
  new ArticleAccordionComponent("article-0", data)
  window.initFlowbite()
  setLoading(false)
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
  const data = await response.json();
  new ArticleAccordionComponent("article-0", data)
  window.initFlowbite()
}

function setArticleHeader(code) {
  let language = "";
  switch (code) {
    case "en":
      language = "English";
      break;
    case "ms":
      language = "Malay";
      break;
    case "zh":
      language = "Chinese"
      break
  }
  articlesHeader.textContent = `5 Most Recent ${language} Articles`
  articlesHeader.hidden = false;
}

async function getArticlesByLanguage(code) {
  const response = await fetch(`${baseUrl}/v1/articles/languages/${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });
  const data = await response.json();
  clearAccordions()
  setArticleHeader(code)
  data.forEach((article, i) => {
    new ArticleAccordionComponent(`article-${i}`, article)
  })
  window.initFlowbite()
}

window.onload = () => {
  if (api_key === null) {
    location.href = "index.html"
  } else {
    getArticlesByLanguage("en")
  }
};

