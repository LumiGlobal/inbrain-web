import ArticleAccordionComponent from "./accordion.js";

/**
 * Article Manager - Handles article generation, retrieval, and management
 */
class Articles {
  constructor() {
    this.apiKey = this.getApiKey();
    this.baseUrl = this.getBaseUrl();
    this.elements = this.initializeElements();

    if (!this.apiKey) {
      this.redirectToLogin();
      return;
    }

    this.bindEvents();
    this.initialize();
  }

  // Configuration
  getApiKey() {
    return sessionStorage.getItem("api_key");
  }

  getBaseUrl() {
    return "http://127.0.0.1:3000";
    // return "https://inbrain-97862438951.asia-southeast1.run.app";
  }

  // DOM Elements
  initializeElements() {
    return {
      generateArticleBtn: document.getElementById("generate-articles-btn"),
      fetchArticlesByIdBtn: document.getElementById("fetch-articles-by-id-btn"),
      articlesContainer: document.getElementById("articles-container"),
      articlesHeader: document.getElementById("articles-header"),
      errorHeader: document.getElementById("error-header"),
      fetchArticlesByLanguageBtn: document.getElementById("fetch-articles-by-language-btn"),
      fetchArticlesByPublisherBtn: document.getElementById("fetch-articles-by-publisher-btn"),
      pullArticlesForPublisherBtn: document.getElementById("pull-articles-for-publisher-btn"),
      generateLoadingBtn: document.getElementById("generate-loading-button"),

      // Form inputs
      titleInput: document.getElementById("title"),
      descriptionInput: document.getElementById("description"),
      contentInput: document.getElementById("content"),

      languageCodeInput: document.getElementById("language-code"),

      articleIdInput: document.getElementById("article-id"),

      limitInput: document.getElementById("limit"),
      languageInput: document.getElementById("language"),

      publisherQueryLimitInput: document.getElementById("publisher-query-limit"),
      publisherPullLimitInput: document.getElementById("publisher-pull-limit"),
      publisherPullList: document.getElementById("publisher-pull-list"),
      publisherQueryList: document.getElementById("publisher-query-list"),
      regenArticleId: document.getElementById("regen-article-id")
    };
  }

  // Event Binding
  bindEvents() {
    this.elements.generateArticleBtn?.addEventListener("click", (e) => this.handleGenerateArticle(e));
    this.elements.fetchArticlesByIdBtn?.addEventListener("click", (e) => this.fetchArticlesById(e));
    this.elements.fetchArticlesByLanguageBtn?.addEventListener("click", (e) => this.fetchArticlesByLanguage(e));
    this.elements.fetchArticlesByPublisherBtn?.addEventListener("click", (e) => this.fetchArticlesByPublisher(e));
    this.elements.pullArticlesForPublisherBtn?.addEventListener("click", (e) => this.pullArticlesForPublisher(e));
  }

  bindRegenerateButtons() {
    const regenerateButtons = document.getElementsByClassName("regenerate");
    [...regenerateButtons].forEach((btn) => {
      btn.onclick = (e) => this.handleRegenerate(e, btn)
    });
  }

  // Event Handlers
  async handleGenerateArticle(e) {
    e.preventDefault();

    const articleData = this.getArticleFormData();
    if (!this.validateArticleData(articleData)) return;

    try {
      this.setLoading(this.elements.generateArticleBtn, this.elements.generateLoadingBtn, true);
      const data = await this.generateArticle(articleData);
      this.displaySingleArticle(data, `Article ${data.id} Generated`);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(this.elements.generateArticleBtn, this.elements.generateLoadingBtn, false);
    }
  }

  async fetchArticlesById(e) {
    e.preventDefault();

    const id = this.elements.articleIdInput?.value;
    if (!id) {
      this.showAlert("Article ID is required");
      return;
    }

    try {
      const data = await this.getArticle(id);
      this.displaySingleArticle(data, `Article ${data.id}`);
    } catch (error) {
      if (error.status === 404) {
        this.renderError(`404: Article ${id} not found`);
      } else {
        this.handleError(error);
      }
    }
  }

  async fetchArticlesByLanguage(e) {
    e.preventDefault();

    const params = this.fetchArticlesByLanguageParams();
    await this.fetchAndDisplayArticles(params);
  }

  async fetchArticlesByPublisher(e) {
    e.preventDefault();

    const params = this.fetchArticlesByPublisherParams();
    await this.fetchAndDisplayArticles(params);
  }

  async pullArticlesForPublisher(e) {
    e.preventDefault();

    const { newsPublisherId, limit, headerTextContent } = this.pullArticlesForPublisherParams();

    try {
      const data = await this.pullLatestArticlesForPublisher(newsPublisherId, limit);
      this.displayArticles(data, headerTextContent);
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleRegenerate(e, btn) {
    e.preventDefault();

    const regenerateLoadingBtn = document.querySelector(`[data-regenerate-loading-id="${btn.dataset.regenerateSubmitId}"]`);
    const id = this.getRegenerateId(btn);

    try {
      this.setLoading(btn, regenerateLoadingBtn, true);
      const data = await this.regenerateArticle(id);
      this.displaySingleArticle(data, `Article ${data.id} Regenerated`);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(btn, regenerateLoadingBtn, false);
    }
  }

  // Data Extraction Methods
  getArticleFormData() {
    return {
      title: this.elements.titleInput.value,
      description: this.elements.descriptionInput.value,
      content: this.elements.contentInput.value,
      language_code: this.elements.languageCodeInput.value
    };
  }

  fetchArticlesByLanguageParams() {
    const list = this.elements.languageInput;
    const limit = this.elements.limitInput.value || "10";
    const languageCode = list.value;
    const languageName = list.options[list.selectedIndex].textContent;

    return {
      languageCode,
      limit,
      headerTextContent: `${limit} Most Recent Articles in ${languageName} Language`,
      languageName
    };
  }

  fetchArticlesByPublisherParams() {
    const list = this.elements.publisherQueryList
    const limit = this.elements.publisherQueryLimitInput.value || "10";
    const newsPublisherId = list.value;
    const newsPublisherName = list.options[list.selectedIndex].textContent;

    return {
      newsPublisherId,
      limit,
      headerTextContent: `${limit} Most Recent Articles for ${newsPublisherName}`,
      newsPublisherName
    };
  }

  pullArticlesForPublisherParams() {
    const list = this.elements.publisherPullList;
    const limit = this.elements.publisherPullLimitInput.value || "10";
    const newsPublisherId = list.value;
    const newsPublisherName = list.options[list.selectedIndex].textContent;

    return {
      newsPublisherId,
      limit,
      headerTextContent: `${limit} Most Recent Articles for ${newsPublisherName}`,
      newsPublisherName
    };
  }

  getRegenerateId(btn) {
    if (btn.dataset.regenerateSubmitId === "0") {
      return this.elements.regenArticleId?.value;
    }
    return btn.dataset.regenerateSubmitId;
  }

  // Validation
  validateArticleData(data) {
    if (!data.title || !data.content) {
      this.showAlert("Title and content are required");
      return false;
    }
    return true;
  }

  // API Methods
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      credentials: "include"
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw { status: response.status, message: response.statusText };
    }

    return response.json();
  }

  async generateArticle(articleData) {
    const payload = JSON.stringify({ article: articleData });
    return this.makeRequest(`${this.baseUrl}/v1/articles`, {
      method: "POST",
      body: payload
    });
  }

  async getArticle(id) {
    return this.makeRequest(`${this.baseUrl}/v1/articles/${id}`);
  }

  async regenerateArticle(id) {
    return this.makeRequest(`${this.baseUrl}/v1/articles/${id}/regenerate`, {
      method: "POST"
    });
  }

  async fetchArticles(params) {
    const { languageCode = "", newsPublisherId = "", limit = "10" } = params;
    const queryParams = new URLSearchParams({
      limit,
      language_code: languageCode,
      news_publisher_id: newsPublisherId
    }).toString();

    return this.makeRequest(`${this.baseUrl}/v1/articles/?${queryParams}`);
  }

  async pullLatestArticlesForPublisher(newsPublisherId, limit) {
    const payload = JSON.stringify({ news_publisher_id: newsPublisherId, limit });
    return this.makeRequest(`${this.baseUrl}/v1/news_publishers/pull`, {
      method: "POST",
      body: payload
    });
  }

  async getNewsPublishersList() {
    return this.makeRequest(`${this.baseUrl}/v1/news_publishers`);
  }

  // Display Methods
  displaySingleArticle(data, headerText) {
    this.clearAccordions();
    this.createAccordion(0, data);
    this.setArticleHeader(headerText);
    this.bindRegenerateButtons();
    this.initializeFlowbite();
  }

  displayArticles(articles, headerText) {
    this.clearAccordions();
    this.setArticleHeader(headerText);

    articles.forEach((article, index) => {
      this.createAccordion(index, article);
    });

    this.bindRegenerateButtons();
    this.initializeFlowbite();
  }

  displayEmpty(params) {
    let message
    if (params.languageName) {
      message = `There are no articles in ${params.languageName}. Create some or pull articles from ${params.languageName} publishers!`
    } else if (params.newsPublisherName) {
      message = `There are no articles for ${params.newsPublisherName}. Please pull articles for ${params.newsPublisherName} first!`
    } else {
      message = `There are no articles in the Database.`
    }

    this.renderError(message)
  }

  async fetchAndDisplayArticles(params) {
    try {
      const data = await this.fetchArticles(params);

      if (data.length === 0) {
        this.displayEmpty(params)
      } else {
        this.displayArticles(data, params.headerTextContent);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  createAccordion(index, data) {
    const containerId = `article-${index}`;
    this.createArticleContainer(containerId);
    new ArticleAccordionComponent(containerId, data);
  }

  createArticleContainer(id) {
    const div = document.createElement("div");
    div.id = id;
    this.elements.articlesContainer?.appendChild(div);
  }

  clearAccordions() {
    this.elements.errorHeader?.replaceChildren();
    this.elements.articlesHeader?.replaceChildren();

    if (this.elements.articlesContainer) {
      [...this.elements.articlesContainer.children].forEach((container) => {
        container.remove();
      });
    }
  }

  setArticleHeader(text) {
    if (this.elements.articlesHeader) {
      this.elements.articlesHeader.textContent = text;
      this.elements.articlesHeader.hidden = false;
    }
  }

  renderError(message) {
    this.clearAccordions()
    if (this.elements.errorHeader) {
      this.elements.errorHeader.textContent = message;
    }
    if (this.elements.articlesHeader) {
      this.elements.articlesHeader.hidden = false;
    }
  }

  // Utility Methods
  setLoading(button, loadingButton, isLoading) {
    if (!button || !loadingButton) return;

    if (isLoading) {
      button.classList.add('hidden');
      loadingButton.classList.remove('hidden');
    } else {
      loadingButton.classList.add('hidden');
      button.classList.remove('hidden');
    }
  }

  showAlert(message) {
    alert(message);
  }

  handleError(error) {
    console.error("Error:", error);
    this.renderError(`Error: ${error.message || "Something went wrong"}`);
  }

  initializeFlowbite() {
    if (window.initFlowbite) {
      window.initFlowbite();
    }
  }

  redirectToLogin() {
    location.href = "index.html";
  }

  // Initialization
  async initialize() {
    try {
      await this.populateNewsPublishers();
      const headerTextContent = "10 Most Recent Articles in All Languages";
      await this.fetchAndDisplayArticles({ headerTextContent });
    } catch (error) {
      this.handleError(error);
    }
  }

  async populateNewsPublishers() {
    try {
      const publishers = await this.getNewsPublishersList();
      const publisherLists = document.getElementsByClassName("publisher-list");

      publishers.forEach((publisher, index) => {
        [...publisherLists].forEach((select) => {
          const option = document.createElement("option");
          option.value = publisher.id;
          option.textContent = publisher.name;

          if (index === 0) {
            option.selected = true;
          }

          select.appendChild(option);
        });
      });
    } catch (error) {
      console.warn("Failed to load news publishers:", error);
    }
  }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
  new Articles();
});
