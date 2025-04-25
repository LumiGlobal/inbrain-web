const generateArticleBtn = document.getElementById("generate-articles");
const getArticleBtn = document.getElementById("get-articles");
const saveKeyBtn = document.getElementById("save-key");
const container = document.getElementById("articles");
const gatekeeped = [...document.getElementsByClassName("gatekeeped")];
const message = document.getElementById("api-key-message");
// const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
const baseUrl = "http://127.0.0.1:3000";

generateArticleBtn.addEventListener("click", generateArticles);
getArticleBtn.addEventListener("click", getArticle);
saveKeyBtn.addEventListener("click", saveKey);

async function saveKey(e) {
  e.preventDefault();
  const api_key = document.getElementById("api-key").value;

  const response = await fetch(`${baseUrl}/keys/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
  });

  if (response.status === 204) {
    sessionStorage.setItem("api_key", api_key);
    message.hidden = true;
    gatekeeped.forEach((e) => (e.hidden = false));
    document.getElementById("api-key-div").hidden = true;
  } else {
    message.textContent = "Wrong API Key! Try again.";
    message.style.color = "red";
    message.hidden = false;
  }
}

function api_key() {
  return sessionStorage.getItem("api_key");
}

function generateArticles(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const content = document.getElementById("content").value;
  const languageCode = document.getElementById("language-code").value;

  if (title == "" || content == "") {
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
  post(payload);
}

async function post(payload) {
  const response = await fetch(`${baseUrl}/v1/articles`, {
    method: "POST",
    body: payload,
    headers: {
      Authorization: `Bearer ${api_key()}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  const data = await response.json();
  renderGeneratedArticles(data);
}

function primaryArticle(data) {
  const primary = document.createElement("div");

  const header = document.createElement("h2");
  header.textContent = `Primary Article (ID: ${data.id})`;

  const title = document.createElement("h4");
  title.textContent = data.title;

  const description = document.createElement("p");
  description.textContent = data.description;

  const content = document.createElement("p");
  content.textContent = data.content;

  primary.append(header, title, description, content);

  return primary;
}

function generatedArticles(data) {
  const generated = document.createElement("div");

  const header = document.createElement("h2");
  header.textContent = "Generated Articles";

  const main_cat = document.createElement("p");
  main_cat.textContent = `Main Category: ${data.generated_articles.main_category}`;

  const subject_articles = renderArticlesFromList(
    data.generated_articles.subject_articles,
    "Subject Articles",
  );

  const taboola_articles = renderArticlesFromList(
    data.generated_articles.taboola_articles,
    "Taboola Articles",
  );

  generated.append(header, main_cat, subject_articles, taboola_articles);

  return generated;
}

function renderGeneratedArticles(data) {
  const primary = primaryArticle(data);

  if (data.generated_articles === null) {
    const message = document.createElement("h4");
    message.textContent =
      "No generated articles was created for this Article. Try again with the same primary article contents.";
    message.style.color = "red";
    container.replaceChildren(message, primary);
  } else {
    const generated = generatedArticles(data);

    container.replaceChildren(primary, generated);
  }
}

function renderArticlesFromList(articles_list, main_header_str) {
  const articles_container = document.createElement("div");
  const main_header = document.createElement("h3");
  main_header.textContent = main_header_str;
  articles_container.append(main_header);

  articles_list.forEach((e) => {
    const article = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = e.title;
    article.append(title);
    e.paragraphs.forEach((p) => {
      const paragraph = document.createElement("div");
      const subheader = document.createElement("p");
      const content = document.createElement("p");
      subheader.textContent = p.subheader;
      content.textContent = p.content;
      paragraph.append(subheader, content);
      article.append(paragraph);
    });

    articles_container.appendChild(article);
  });

  return articles_container;
}

async function getArticle(e) {
  e.preventDefault();
  const id = document.getElementById("article-id").value;
  const response = await fetch(`${baseUrl}/v1/articles/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key()}`,
    },
  });
  const data = await response.json();
  renderGeneratedArticles(data);
}

function apiKeyState() {
  if (api_key() === null) {
    gatekeeped.forEach((e) => (e.hidden = true));
    document.getElementById("api-key-div").hidden = false;
  } else {
    message.hidden = true;
    gatekeeped.forEach((e) => (e.hidden = false));
    document.getElementById("api-key-div").hidden = true;
  }
}

window.onload = apiKeyState;
