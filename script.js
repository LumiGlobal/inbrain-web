const api_key = sessionStorage.getItem("api_key")
const generateArticleBtn = document.getElementById("generate-articles");
const getArticleBtn = document.getElementById("get-articles");
// const baseUrl = "https://inbrain-97862438951.asia-southeast1.run.app";
const baseUrl = "http://127.0.0.1:3000";

generateArticleBtn.addEventListener("click", generateArticles);
getArticleBtn.addEventListener("click", getArticle);

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
  const response = await fetch(`${baseUrl}/v1/articles`, {
    method: "POST",
    body: payload,
    headers: {
      Authorization: `Bearer ${api_key}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  const data = await response.json();
}

async function getArticle(e) {
  e.preventDefault();
  const id = document.getElementById("article-id").value;
  const response = await fetch(`${baseUrl}/v1/articles/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${api_key}`,
    },
  });
  const data = await response.json();
  new ArticleAccordionComponent("articles", data)
}

window.onload = () => {
  if (api_key === null) {
    location.href = "index.html"
  }
};

class ArticleAccordionComponent {
  constructor(containerId, articleData) {
    this.container = document.getElementById(containerId);
    this.articleData = articleData;
    this.idCounter = 0;
    this.render();
  }

  generateUniqueId(prefix) {
    this.idCounter++;
    return `${prefix}-${this.idCounter}`;
  }

  createAccordionButton(title, targetId, expanded = false, level = 0) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flex items-center justify-between w-full py-2 font-medium rtl:text-right text-gray-900 gap-3 hover:text-blue-800';
    button.setAttribute('data-accordion-target', `#${targetId}`);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.setAttribute('aria-controls', targetId);

    const indentation = level > 0 ? `ml-${level * 2}` : '';

    const span = document.createElement('span');
    span.className = indentation;
    span.textContent = title;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-accordion-icon', '');
    svg.setAttribute('class', expanded ? 'w-3 h-3 shrink-0' : 'w-3 h-3 rotate-180 shrink-0');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 10 6');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M9 5 5 1 1 5');

    svg.appendChild(path);
    button.appendChild(span);
    button.appendChild(svg);

    return button;
  }

  renderPrimaryArticle() {
    const headingId = this.generateUniqueId('primary-heading');
    const bodyId = this.generateUniqueId('primary-body');

    const accordionItem = document.createElement('div');
    accordionItem.setAttribute('data-accordion', 'collapse');
    accordionItem.setAttribute('data-active-classes', 'bg-white text-blue-800');
    accordionItem.setAttribute('data-inactive-classes', 'text-gray-900');

    const heading = document.createElement('h3');
    heading.id = headingId;

    const button = this.createAccordionButton('Primary Article', bodyId, false, 1);
    heading.appendChild(button);
    accordionItem.appendChild(heading);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'hidden';
    body.setAttribute('aria-labelledby', headingId);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-4 p-2';

    // Add title
    const titleElem = document.createElement('h4');
    titleElem.className = 'text-lg font-semibold mb-2';
    titleElem.textContent = this.articleData.title;
    contentDiv.appendChild(titleElem);

    // Add description
    const descElem = document.createElement('p');
    descElem.className = 'text-gray-600 mb-3';
    descElem.textContent = this.articleData.description;
    contentDiv.appendChild(descElem);

    // Add content
    const contentElem = document.createElement('p');
    contentElem.className = 'text-gray-700';
    contentElem.textContent = this.articleData.content;
    contentDiv.appendChild(contentElem);

    body.appendChild(contentDiv);
    accordionItem.appendChild(body);

    return accordionItem;
  }

  renderArticleSection(article, type) {
    const headingId = this.generateUniqueId(`${type}-heading`);
    const bodyId = this.generateUniqueId(`${type}-body`);

    const accordionItem = document.createElement('div');
    accordionItem.setAttribute('data-accordion', 'collapse');
    accordionItem.setAttribute('data-active-classes', 'bg-white text-blue-800');
    accordionItem.setAttribute('data-inactive-classes', 'text-gray-900');

    const heading = document.createElement('h5');
    heading.id = headingId;

    const button = this.createAccordionButton(article.title, bodyId, false, 3);
    heading.appendChild(button);
    accordionItem.appendChild(heading);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'hidden';
    body.setAttribute('aria-labelledby', headingId);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'ml-6 p-2';

    // Process paragraphs
    if (article.paragraphs && article.paragraphs.length) {
      article.paragraphs.forEach(para => {
        // Add subheader if exists
        if (para.subheader) {
          const subheader = document.createElement('h6');
          subheader.className = 'font-semibold mt-3 mb-1 text-gray-800';
          subheader.textContent = para.subheader;
          contentDiv.appendChild(subheader);
        }

        // Add content
        if (para.content) {
          const content = document.createElement('p');
          content.className = 'text-gray-700 mb-2';
          content.textContent = para.content;
          contentDiv.appendChild(content);
        }

        // Add source (small and light gray)
        if (para.source) {
          const source = document.createElement('p');
          source.className = 'text-xs text-gray-400 mb-3';
          source.textContent = `Source: `;

          const link = document.createElement("a")
          link.href = para.source
          link.textContent = para.source
          link.className = "hover:text-blue-500"
          link.target = "_blank"
          source.appendChild(link)

          contentDiv.appendChild(source);
        }
      });
    }

    body.appendChild(contentDiv);
    accordionItem.appendChild(body);

    return accordionItem;
  }

  renderSubjectArticles() {
    const headingId = this.generateUniqueId('subject-heading');
    const bodyId = this.generateUniqueId('subject-body');

    const accordionItem = document.createElement('div');
    accordionItem.setAttribute('data-accordion', 'collapse');
    accordionItem.setAttribute('data-active-classes', 'bg-white text-blue-800');
    accordionItem.setAttribute('data-inactive-classes', 'text-gray-900');

    const heading = document.createElement('h4');
    heading.id = headingId;

    const button = this.createAccordionButton('Subject Articles', bodyId, false, 2);
    heading.appendChild(button);
    accordionItem.appendChild(heading);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'hidden';
    body.setAttribute('aria-labelledby', headingId);

    // Add each subject article
    if (this.articleData.generated_articles.subject_articles &&
        this.articleData.generated_articles.subject_articles.length) {
      this.articleData.generated_articles.subject_articles.forEach(article => {
        body.appendChild(this.renderArticleSection(article, 'subject'));
      });
    }

    accordionItem.appendChild(body);
    return accordionItem;
  }

  renderTaboolaArticles() {
    const headingId = this.generateUniqueId('taboola-heading');
    const bodyId = this.generateUniqueId('taboola-body');

    const accordionItem = document.createElement('div');
    accordionItem.setAttribute('data-accordion', 'collapse');
    accordionItem.setAttribute('data-active-classes', 'bg-white text-blue-800');
    accordionItem.setAttribute('data-inactive-classes', 'text-gray-900');

    const heading = document.createElement('h4');
    heading.id = headingId;

    const button = this.createAccordionButton('Taboola Articles', bodyId, false, 2);
    heading.appendChild(button);
    accordionItem.appendChild(heading);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'hidden';
    body.setAttribute('aria-labelledby', headingId);

    // Add each taboola article
    if (this.articleData.generated_articles.taboola_articles &&
        this.articleData.generated_articles.taboola_articles.length) {
      this.articleData.generated_articles.taboola_articles.forEach(article => {
        body.appendChild(this.renderArticleSection(article, 'taboola'));
      });
    }

    accordionItem.appendChild(body);
    return accordionItem;
  }

  render() {
    // Clear the container
    this.container.innerHTML = '';

    // Create main accordion
    const mainAccordion = document.createElement('div');
    mainAccordion.id = 'main-accordion-collapse';
    mainAccordion.setAttribute('data-accordion', 'collapse');
    mainAccordion.setAttribute('data-active-classes', 'bg-white text-blue-800');
    mainAccordion.setAttribute('data-inactive-classes', 'text-gray-900');

    // Create main heading
    const mainHeadingId = 'main-accordion-heading-1';
    const mainBodyId = 'main-accordion-body-1';

    const mainHeading = document.createElement('h2');
    mainHeading.id = mainHeadingId;

    const mainButton = this.createAccordionButton(`Article #${this.articleData.id}`, mainBodyId, true);
    mainButton.querySelector('span').className = 'text-xl';

    mainHeading.appendChild(mainButton);
    mainAccordion.appendChild(mainHeading);

    // Create main body that contains all sections
    const mainBody = document.createElement('div');
    mainBody.id = mainBodyId;
    mainBody.className = 'block';
    mainBody.setAttribute('aria-labelledby', mainHeadingId);

    // Add category info if exists
    if (this.articleData.generated_articles.main_category) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'mb-3 text-sm font-medium text-gray-600';
      categoryDiv.textContent = `Category: ${this.articleData.generated_articles.main_category}`;
      mainBody.appendChild(categoryDiv);
    }

    // Add primary article
    mainBody.appendChild(this.renderPrimaryArticle());

    // Create generated articles section
    const generatedHeadingId = this.generateUniqueId('generated-heading');
    const generatedBodyId = this.generateUniqueId('generated-body');

    const generatedSection = document.createElement('div');
    generatedSection.setAttribute('data-accordion', 'collapse');
    generatedSection.setAttribute('data-active-classes', 'bg-white text-blue-800');
    generatedSection.setAttribute('data-inactive-classes', 'text-gray-900');

    const generatedHeading = document.createElement('h3');
    generatedHeading.id = generatedHeadingId;

    const generatedButton = this.createAccordionButton('Generated Articles', generatedBodyId, false, 1);
    generatedHeading.appendChild(generatedButton);
    generatedSection.appendChild(generatedHeading);

    const generatedBody = document.createElement('div');
    generatedBody.id = generatedBodyId;
    generatedBody.className = 'hidden';
    generatedBody.setAttribute('aria-labelledby', generatedHeadingId);


    // Add subject articles section
    generatedBody.appendChild(this.renderSubjectArticles());

    // Add taboola articles section
    generatedBody.appendChild(this.renderTaboolaArticles());

    generatedSection.appendChild(generatedBody);
    mainBody.appendChild(generatedSection);

    mainAccordion.appendChild(mainBody);
    this.container.appendChild(mainAccordion);

    // Initialize Flowbite accordion functionality
    if (typeof window.flowbite !== 'undefined') {
      window.flowbite.initAccordions();
    }
  }
}
