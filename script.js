const submit = document.getElementById("submit");

submit.addEventListener("click", sendData);

function sendData(e) {
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

  async function postData(payload) {
    const response = await fetch("http://127.0.0.1:3000/v1/articles", {
      method: "POST",
      body: payload,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
    const body = await response.json();
    console.log(body);
  }

  postData(payload);
}

async function renderJSON(path) {
  const response = await fetch(path);
  const data = await response.json();
  const generated_articles = data.generated_articles;
  console.log(generated_articles);

  const container = document.createElement("div");

  const header = document.createElement("h3");
  header.textContent = `Main Category: ${generated_articles.main_category}`;
  container.append(header);

  addArticles(
    generated_articles.subject_articles,
    container,
    "Subject Articles",
  );

  addArticles(
    generated_articles.taboola_articles,
    container,
    "Taboola Articles",
  );

  document.body.appendChild(container);
}

function addArticles(articles_list, container, main_header_str) {
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

  container.appendChild(articles_container);
}

renderJSON("./pretty.json");
