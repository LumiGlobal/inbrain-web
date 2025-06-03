import ArticleAccordionComponent from "./accordion.js";

/**
 * Article Manager - Handles article generation, retrieval, and management with history
 */
class Articles {
  constructor() {
    this.apiKey = this.getApiKey();
    this.baseUrl = this.getBaseUrl();
    this.elements = this.initializeElements();

    // History management
    this.currentState = null;
    this.isNavigating = false;

    if (!this.apiKey) {
      this.redirectToLogin();
      return;
    }

    this.bindEvents();
    this.setupHistoryManagement();
    this.initialize();
  }

  // History Management Setup
  setupHistoryManagement() {
    // Listen for browser back/forward buttons
    window.addEventListener('popstate', (e) => this.handlePopState(e));

    // Set initial state if none exists
    if (!history.state) {
      this.updateHistory('initial', { type: 'initial' }, 'Articles');
    }
  }

  handlePopState(event) {
    if (event.state) {
      this.isNavigating = true;
      this.restoreState(event.state);
      this.isNavigating = false;
    }
  }

  // State Management
  updateHistory(action, stateData, title = '') {
    if (this.isNavigating) return; // Don't add history during navigation

    const state = {
      timestamp: Date.now(),
      action,
      ...stateData
    };

    this.currentState = state;
    const url = this.buildUrlFromState(state);
    history.pushState(state, title, url);
  }

  buildUrlFromState(state) {
    const params = new URLSearchParams();

    switch (state.type) {
      case 'article-by-id':
        params.set('view', 'article');
        params.set('id', state.articleId);
        break;
      case 'articles-by-language':
        params.set('view', 'language');
        params.set('lang', state.languageCode);
        params.set('limit', state.limit);
        break;
      case 'articles-by-publisher':
        params.set('view', 'publisher');
        params.set('publisher', state.newsPublisherId);
        params.set('limit', state.limit);
        break;
      case 'pull-articles':
        params.set('view', 'pull');
        params.set('publisher', state.newsPublisherId);
        params.set('limit', state.limit);
        break;
      case 'generate-article':
        params.set('view', 'generated');
        params.set('id', state.articleId);
        break;
      default:
        return 'main.html';
    }

    return `main.html?${params.toString()}`;
  }

  async restoreState(state) {
    try {
      switch (state.type) {
        case 'article-by-id':
        case 'generate-article':
          await this.restoreArticleById(state.articleId);
          break;
        case 'articles-by-language':
          await this.restoreArticlesByLanguage(state);
          break;
        case 'articles-by-publisher':
          await this.restoreArticlesByPublisher(state);
          break;
        case 'pull-articles':
          await this.restorePullArticles(state);
          break;
        default:
          await this.initialize();
          break;
      }
    } catch (error) {
      console.error('Error restoring state:', error);
      this.handleError(error);
    }
  }

  async restoreArticleById(articleId) {
    const data = await this.getArticle(articleId);
    this.displaySingleArticle(data, `${data.id}: ${data.title}`);
  }

  async restoreArticlesByLanguage(state) {
    const data = await this.fetchArticles({
      languageCode: state.languageCode,
      limit: state.limit
    });

    if (data.length === 0) {
      this.displayEmpty({ languageName: state.languageName });
    } else {
      this.displayArticles(data, state.headerText);
    }
  }

  async restoreArticlesByPublisher(state) {
    const data = await this.fetchArticles({
      newsPublisherId: state.newsPublisherId,
      limit: state.limit
    });

    if (data.length === 0) {
      this.displayEmpty({ newsPublisherName: state.newsPublisherName });
    } else {
      this.displayArticles(data, state.headerText);
    }
  }

  async restorePullArticles(state) {
    const data = await this.pullLatestArticlesForPublisher(state.newsPublisherId, state.limit);
    this.displayArticles(data, state.headerText);
  }

  // Check URL on load and restore state
  async initializeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (!view) {
      return false; // No specific view, use default initialization
    }

    try {
      switch (view) {
        case 'article':
          const articleId = params.get('id');
          if (articleId) {
            await this.restoreArticleById(parseInt(articleId));
            return true;
          }
          break;
        case 'language':
          const langCode = params.get('lang');
          const langLimit = params.get('limit') || '10';
          if (langCode) {
            await this.fetchArticlesByLanguageFromUrl(langCode, langLimit);
            return true;
          }
          break;
        case 'publisher':
          const publisherId = params.get('publisher');
          const publisherLimit = params.get('limit') || '10';
          if (publisherId) {
            await this.fetchArticlesByPublisherFromUrl(publisherId, publisherLimit);
            return true;
          }
          break;
        case 'pull':
          const pullPublisherId = params.get('publisher');
          const pullLimit = params.get('limit') || '30';
          if (pullPublisherId) {
            await this.pullArticlesFromUrl(pullPublisherId, pullLimit);
            return true;
          }
          break;
      }
    } catch (error) {
      console.error('Error initializing from URL:', error);
    }

    return false;
  }

  // Configuration
  getApiKey() {
    return sessionStorage.getItem("api_key");
  }

  getBaseUrl() {
    // return "http://127.0.0.1:3000";
    return "https://inbrain-97862438951.asia-southeast1.run.app";
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
      pullLoadingBtn: document.getElementById("pull-articles-loading-btn"),
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

  // Event Handlers with History Updates
  async handleGenerateArticle(e) {
    e.preventDefault();

    const articleData = this.getArticleFormData();
    if (!this.validateArticleData(articleData)) return;

    try {
      this.setLoading(this.elements.generateArticleBtn, this.elements.generateLoadingBtn, true);
      const data = await this.generateArticle(articleData);

      // Update history
      this.updateHistory('generate-article', {
        type: 'generate-article',
        articleId: data.id,
        articleTitle: data.title
      }, `Generated: ${data.title}`);

      this.displaySingleArticle(data, `${data.id}: ${data.title}`);
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

      // Update history
      this.updateHistory('fetch-article-by-id', {
        type: 'article-by-id',
        articleId: parseInt(id),
        articleTitle: data.title
      }, `Article: ${data.title}`);

      this.displaySingleArticle(data, `${data.id}: ${data.title}`);
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

    // Update history
    this.updateHistory('fetch-articles-by-language', {
      type: 'articles-by-language',
      languageCode: params.languageCode,
      languageName: params.languageName,
      limit: params.limit,
      headerText: params.headerTextContent
    }, `Articles in ${params.languageName}`);

    await this.fetchAndDisplayArticles(params);
  }

  async fetchArticlesByPublisher(e) {
    e.preventDefault();

    const params = this.fetchArticlesByPublisherParams();

    // Update history
    this.updateHistory('fetch-articles-by-publisher', {
      type: 'articles-by-publisher',
      newsPublisherId: params.newsPublisherId,
      newsPublisherName: params.newsPublisherName,
      limit: params.limit,
      headerText: params.headerTextContent
    }, `Articles by ${params.newsPublisherName}`);

    await this.fetchAndDisplayArticles(params);
  }

  async pullArticlesForPublisher(e) {
    e.preventDefault();

    const { newsPublisherId, limit, headerTextContent, newsPublisherName } = this.pullArticlesForPublisherParams();

    try {
      this.setLoading(this.elements.pullArticlesForPublisherBtn, this.elements.pullLoadingBtn, true);

      // Update history
      this.updateHistory('pull-articles-for-publisher', {
        type: 'pull-articles',
        newsPublisherId,
        newsPublisherName,
        limit,
        headerText: headerTextContent
      }, `Pulled: ${newsPublisherName}`);

      const data = await this.pullLatestArticlesForPublisher(newsPublisherId, limit);
      this.displayArticles(data, headerTextContent);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(this.elements.pullArticlesForPublisherBtn, this.elements.pullLoadingBtn, false);
    }
  }

  async handleRegenerate(e, btn) {
    e.preventDefault();

    const regenerateLoadingBtn = document.querySelector(`[data-regenerate-loading-id="${btn.dataset.regenerateSubmitId}"]`);
    const id = this.getRegenerateId(btn);

    try {
      this.setLoading(btn, regenerateLoadingBtn, true);
      const data = await this.regenerateArticle(id);

      // Update history
      this.updateHistory('regenerate-article', {
        type: 'generate-article',
        articleId: data.id,
        articleTitle: data.title
      }, `Regenerated: ${data.title}`);

      this.displaySingleArticle(data, `${data.id}: ${data.title}`);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(btn, regenerateLoadingBtn, false);
    }
  }

  // URL-based restore methods
  async fetchArticlesByLanguageFromUrl(languageCode, limit) {
    const data = await this.fetchArticles({ languageCode, limit });
    // You'll need to get the language name from your language list or API
    const headerText = `${limit} Most Recent Articles in Language ${languageCode}`;

    if (data.length === 0) {
      this.displayEmpty({ languageName: languageCode });
    } else {
      this.displayArticles(data, headerText);
    }
  }

  async fetchArticlesByPublisherFromUrl(newsPublisherId, limit) {
    const data = await this.fetchArticles({ newsPublisherId, limit });
    // You'll need to get the publisher name from your publisher list or API
    const headerText = `${limit} Most Recent Articles for Publisher ${newsPublisherId}`;

    if (data.length === 0) {
      this.displayEmpty({ newsPublisherName: newsPublisherId });
    } else {
      this.displayArticles(data, headerText);
    }
  }

  async pullArticlesFromUrl(newsPublisherId, limit) {
    const data = await this.pullLatestArticlesForPublisher(newsPublisherId, limit);
    const headerText = `${limit} Most Recent Articles for Publisher ${newsPublisherId}`;
    this.displayArticles(data, headerText);
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
    const limit = this.elements.publisherPullLimitInput.value || "30";
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

    articles.forEach((article) => {
      this.showArticleLink(article);
    });

    this.bindRegenerateButtons();
    this.initializeFlowbite();
  }

  showArticleLink(article) {
    const container = document.createElement('div')
    container.classList = "py-5 px-2 rounded-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:text-blue-700 hover:cursor-pointer"

    const link = document.createElement('a')
    link.attributes.articleId = `${article.id}`
    link.textContent = `${article.id}: ${article.title}`

    // Add click handler for article links to update history
    container.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const data = await this.getArticle(article.id);

        this.updateHistory('click-article-link', {
          type: 'article-by-id',
          articleId: article.id,
          articleTitle: data.title
        }, `Article: ${data.title}`);

        this.displaySingleArticle(data, `${data.id}: ${data.title}`);
      } catch (error) {
        this.handleError(error);
      }
    });

    container.appendChild(link)
    this.elements.articlesContainer?.appendChild(container);
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

      // Check if we should initialize from URL
      const initializedFromUrl = await this.initializeFromUrl();

      if (!initializedFromUrl) {
        // Default initialization
        const { newsPublisherId, limit, headerTextContent } = this.pullArticlesForPublisherParams();
        const data = await this.pullLatestArticlesForPublisher(newsPublisherId, limit);
        this.displayArticles(data, headerTextContent);

        // Set initial history state
        this.updateHistory('initial-load', {
          type: 'pull-articles',
          newsPublisherId,
          limit,
          headerText: headerTextContent
        }, 'Articles');
      }
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
