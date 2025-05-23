import ArticleAccordionComponent from "./accordion.js";
const api_key = sessionStorage.getItem("api_key")
const generateArticleBtn = document.getElementById("generate-articles");
const getArticleBtn = document.getElementById("get-articles");
const regenerateBtn = document.getElementById("regen-article")
const generateLoadingBtn = document.getElementById("loading-button")
const regenerateLoadingBtn = document.getElementById("regen-loading")
const articlesContainer = document.getElementById("articles-container")
const articlesHeader = document.getElementById("articles-header")
const errorHeader = document.getElementById("error")
const index = document.getElementById("index")
const publisherArticlesBtn = document.getElementById("publisher-query-submit")
const publisherPullBtn = document.getElementById("publisher-pull-submit")
// const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
const baseUrl = "http://127.0.0.1:3000";

generateArticleBtn.addEventListener("click", generateArticles);
getArticleBtn.addEventListener("click", getArticle);
regenerateBtn.addEventListener("click", regenerateArticles)
index.addEventListener("click", (e) => {
  e.preventDefault()
  const limit = document.getElementById("limit").value
  const langInput = document.getElementById("language")
  const languageCode = langInput.value
  const language = langInput.options[langInput.selectedIndex].textContent
  const headerTextContent = `${limit} Most Recent Articles in ${language} Language`
  const params = {languageCode: languageCode, limit: limit, headerTextContent: headerTextContent}
  allArticles(params)
})

publisherArticlesBtn.addEventListener("click", (e) => {
  e.preventDefault()
  const limit = document.getElementById("publisher-query-limit").value
  const newsPublisherInput = document.getElementById("publisher-list-2")
  const newsPublisherId = newsPublisherInput.value
  const newsPublisherName = newsPublisherInput.options[newsPublisherInput.selectedIndex].textContent
  const headerTextContent = `${limit} Most Recent Articles for ${newsPublisherName}`
  const params = {newsPublisherId: newsPublisherId, limit: limit, headerTextContent: headerTextContent}
  allArticles(params)
})

publisherPullBtn.addEventListener("click", (e) => {
  e.preventDefault()
  const limit = document.getElementById("publisher-pull-limit").value
  const newsPublisherInput = document.getElementById("publisher-list-1")
  const newsPublisherId = newsPublisherInput.value
  const newsPublisherName = newsPublisherInput.options[newsPublisherInput.selectedIndex].textContent
  const headerTextContent = `${limit} Most Recent Articles for ${newsPublisherName}`
  pullLatestArticlesForPublisher(newsPublisherId, limit, headerTextContent)
})

async function pullLatestArticlesForPublisher(newsPublisherId, limit, headerTextContent) {
  const payload = JSON.stringify({ news_publisher_id: newsPublisherId, limit: limit })
  const response = await fetch(`${baseUrl}/v1/news_publishers/pull`, {
    method: "POST",
    body: payload,
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include"
  });
  const data = await response.json()
  console.log(data)
  clearAccordions()
  setArticleHeader(headerTextContent)
  data.forEach((article, i) => {
    createAccordion(i, article)
  })
  window.initFlowbite()
}


async function getNewsPublishersList() {
  const response = await fetch(`${baseUrl}/v1/news_publishers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });

  const data = await response.json()
  const publisherLists = document.getElementsByClassName("publisher-list")
  data.forEach((publisher, i) => {
    [...publisherLists].forEach((select) => {
      const option = document.createElement("option")
      option.value = publisher.id
      option.textContent = publisher.name

      if (i === 0) {
        option.selected = true
      }

      select.appendChild(option)
    })
  })
}

async function allArticles ({languageCode = "", newsPublisherId = "", limit = "10", headerTextContent = "" }) {
  const params = new URLSearchParams({ limit: limit, language_code: languageCode, news_publisher_id: newsPublisherId }).toString()
  const response = await fetch(`${baseUrl}/v1/articles/?${params}` , {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
    credentials: "include"
  });
  const data = await response.json()
  console.log(data)
  clearAccordions()
  setArticleHeader(headerTextContent)
  data.forEach((article, i) => {
    createAccordion(i, article)
  })
  window.initFlowbite()
}
function clearAccordions() {
  errorHeader.replaceChildren();
  articlesHeader.replaceChildren();
  [...articlesContainer.children].forEach((container) => {
    container.remove()
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
  createAccordion(0, data)
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
  createAccordion(0, data)
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
  createAccordion(0, data)
  setArticleHeader(`Article ${data.id}`)
  window.initFlowbite()
}

function createAccordion(i, data) {
  const containerId = `article-${i}`
  createArticleContainer(containerId)
  new ArticleAccordionComponent(containerId, data)
}

function createArticleContainer(id) {
  const div = document.createElement("div")
  div.id = id
  articlesContainer.appendChild(div)
}

function renderError(string) {
  errorHeader.textContent = string
  articlesHeader.hidden = false;
}

function setArticleHeader(string) {
  articlesHeader.textContent = string
  articlesHeader.hidden = false;
}

window.onload = () => {
  if (api_key === null) {
    location.href = "index.html"
  } else {
    getNewsPublishersList()
    const headerTextContent = "10 Most Recent Articles in All Language"
    allArticles({ headerTextContent: headerTextContent })
  }
};

