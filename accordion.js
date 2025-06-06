class ArticleAccordionComponent {
    constructor(containerId, articleData) {
        this.container = document.getElementById(containerId);
        this.articleData = articleData;
        this.idCounter = 0;
        this.instanceId = Math.random().toString(36).substring(2, 8);
        this.render();
    }

    generateUniqueId(prefix) {
        this.idCounter++;
        return `${prefix}-${this.instanceId}-${this.idCounter}`;
    }

    createAccordionButton(title, targetId, expanded = false, level = 0) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'flex items-center justify-between w-full py-2 rtl:text-right text-gray-900 gap-3 hover:text-blue-800';
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
        const accordionItem = document.createElement('div');
        accordionItem.className = "my-4"

        const body = document.createElement('div');
        body.classList = "p-4 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]"

        const contentDiv = document.createElement('div');

        if (this.articleData.description && this.articleData.description.length !== 0) {
            const descTitle = document.createElement('p');
            descTitle.textContent = "Description"
            descTitle.className = 'font-bold mb-3';
            contentDiv.appendChild(descTitle);

            // Add description
            const descElem = document.createElement('p');
            descElem.className = 'mb-3';
            descElem.textContent = this.articleData.description;
            contentDiv.appendChild(descElem);
        }

        if (this.articleData.content && this.articleData.content.length !== 0) {
            const contentTitle = document.createElement('p');
            contentTitle.textContent = "Content"
            contentTitle.className = 'font-bold mb-3';
            contentDiv.appendChild(contentTitle);

            // Add content
            const contentElem = document.createElement('p');
            contentElem.innerHTML = this.articleData.content;
            contentDiv.appendChild(contentElem);
        }

        if (this.articleData.parent_id) {
            const inbrainedTag = document.createElement('div');
            inbrainedTag.setAttribute("data-parent-id", this.articleData.parent_id)
            inbrainedTag.classList = "mt-4 font-bold text-blue-800 hover:text-blue-700 hover:cursor-pointer parent-link"
            inbrainedTag.textContent = "To Parent Article"
            contentDiv.appendChild(inbrainedTag)
        }

        body.appendChild(contentDiv);
        accordionItem.appendChild(body);

        return accordionItem;
    }

    renderArticleSection(article, type, generatedArticleIndex) {
        const headingId = this.generateUniqueId(`${type}-heading`);
        const bodyId = this.generateUniqueId(`${type}-body`);

        const accordionItem = document.createElement('div');
        accordionItem.setAttribute('data-accordion', 'collapse');
        accordionItem.setAttribute('data-active-classes', 'bg-white text-blue-800 font-bold');
        accordionItem.setAttribute('data-inactive-classes', 'text-gray-900');

        const heading = document.createElement('h5');
        heading.id = headingId;

        const button = this.createAccordionButton(article.title, bodyId, false, 1);
        heading.appendChild(button);
        accordionItem.appendChild(heading);

        const body = document.createElement('div');
        body.id = bodyId;
        body.className = 'hidden m-2 border-1 border-solid border-gray-600 rounded';
        body.setAttribute('aria-labelledby', headingId);

        const contentDiv = document.createElement('div');
        contentDiv.className = "p-4 flex flex-col gap-3"

        // Process paragraphs
        if (article.paragraphs && article.paragraphs.length) {
            article.paragraphs.forEach((para, i) => {
                if (!para.subheader || !para.content) {
                    const error = document.createElement("p")
                    // error.textContent = `Subheader ${i + 1} or Content ${i + 1} is missing. Please regenerate articles.`
                    error.className = "text-red-500 font-bold"
                    contentDiv.appendChild(error)
                    return
                }

                const paragraphDiv = document.createElement('div')

                const subheader = document.createElement('h6');
                subheader.className = 'mb-2 font-bold text-gray-800';
                subheader.textContent = para.subheader;
                paragraphDiv.appendChild(subheader);

                const content = document.createElement('p');
                content.className = 'text-gray-700';
                content.textContent = para.content;
                paragraphDiv.appendChild(content);

                contentDiv.appendChild(paragraphDiv)

                // Add source (small and light gray)
                // if (para.source) {
                //     const source = document.createElement('p');
                //     source.className = 'text-xs text-gray-400 mb-3';
                //     source.textContent = `Source: `;
                //
                //     const link = document.createElement("a")
                //     link.href = para.source
                //     link.textContent = para.source
                //     link.className = "hover:text-blue-500"
                //     link.target = "_blank"
                //     source.appendChild(link)
                //
                //     contentDiv.appendChild(source);
                // }
            });
        }

        body.appendChild(contentDiv);

        const inbrainBtn = document.createElement('button')
        inbrainBtn.setAttribute("data-inbrain-submit-id", `${type}-${this.articleData.id}-${generatedArticleIndex}`)
        inbrainBtn.setAttribute("data-article-id", this.articleData.id)
        inbrainBtn.setAttribute("data-article-type", type)
        inbrainBtn.setAttribute("data-generated-article-index", generatedArticleIndex)

        inbrainBtn.classList = "inbrain text-white bg-blue-900 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-1 hover:cursor-pointer mx-4 mb-3"
        inbrainBtn.textContent = "Generate Articles"

        const animationBtn = document.createElement("button")
        animationBtn.setAttribute("data-inbrain-loading-id", `${type}-${this.articleData.id}-${generatedArticleIndex}`)
        animationBtn.classList = "hidden text-white bg-blue-900 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-1 hover:cursor-pointer mx-4 mb-3"
        animationBtn.innerHTML = `<svg class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>\n                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>\n                                        </svg>\n                                        Generating...`
        body.appendChild(inbrainBtn)
        body.appendChild(animationBtn)

        accordionItem.appendChild(body);

        return accordionItem;
    }

    renderSubjectArticles() {
        const accordionItem = document.createElement('div');
        const heading = document.createElement('h4');
        heading.textContent = 'Subject Articles'
        heading.className = "my-2 font-bold"

        accordionItem.appendChild(heading);

        const body = document.createElement('div');

        // Add each subject article
        if (this.articleData.generated_articles.subject_articles &&
            this.articleData.generated_articles.subject_articles.length) {
            this.articleData.generated_articles.subject_articles.forEach((article, paragraphIndex) => {
                body.appendChild(this.renderArticleSection(article, 'subject', paragraphIndex));
            });
        }

        accordionItem.appendChild(body);
        return accordionItem;
    }

    renderTaboolaArticles() {
        const accordionItem = document.createElement('div');

        const heading = document.createElement('h4');
        heading.textContent = 'Taboola Articles'
        heading.className = "my-2 font-bold"

        accordionItem.appendChild(heading);

        const body = document.createElement('div');

        // Add each taboola article
        if (this.articleData.generated_articles.taboola_articles &&
            this.articleData.generated_articles.taboola_articles.length) {
            this.articleData.generated_articles.taboola_articles.forEach((article, paragraphIndex) => {
                body.appendChild(this.renderArticleSection(article, 'taboola', paragraphIndex));
            });
        }

        accordionItem.appendChild(body);
        return accordionItem;
    }

    getButtons(isRegenerate, id = this.articleData.id) {
        const mainBtn = document.createElement('button')
        mainBtn.setAttribute("data-regenerate-submit-id", id)
        mainBtn.classList = "regenerate text-white bg-blue-900 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-1 hover:cursor-pointer"
        mainBtn.textContent = `${isRegenerate ? "Regenerate" : "Generate"} Articles`

        const animationBtn = document.createElement("button")
        animationBtn.setAttribute("data-regenerate-loading-id", id)
        animationBtn.classList = "hidden my-1 inset-0 text-white bg-blue-900 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center cursor-not-allowed opacity-75"
        animationBtn.innerHTML = `<svg class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>\n                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>\n                                        </svg>\n                                        ${ isRegenerate ? "Regenerating..." : "Generating..." }`

        return [mainBtn, animationBtn]
    }
    
    backLink() {
        const link = document.createElement('a')
        link.classList = "inline-flex items-center text-blue-900 bg-white ml-1 hover:text-blue-700 font-medium rounded-lg text-sm text-center my-10 hover:cursor-pointer"
        link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18">
            </path>
        </svg>
        <span class="ml-1">Back</span>
        `

        link.addEventListener('click', (e) => {
            history.back()
        })

        return link
    }

    render() {
        // Clear the container
        this.container.innerHTML = '';

        // Create main accordion
        const mainAccordion = document.createElement('div');

        // Create main body that contains all sections
        const mainBody = document.createElement('div');

        if (this.articleData.news_publisher_name) {
            const newsPublisherDiv = document.createElement('div');
            newsPublisherDiv.className = 'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-cyan-700 ring-1 ring-cyan-700/10 ring-inset';
            newsPublisherDiv.textContent = `${this.articleData.news_publisher_name}`;
            mainBody.appendChild(newsPublisherDiv);
        }

        // Add category info if exists
        if (this.articleData.generated_articles && this.articleData.generated_articles.main_category) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'ml-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset';
            categoryDiv.textContent = `${this.articleData.generated_articles.main_category}`;
            mainBody.appendChild(categoryDiv);
        }

        if (this.articleData.parent_id) {
            const inbrainedTag = document.createElement('div');
            inbrainedTag.className = 'ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset';
            inbrainedTag.textContent = "Inbrained"
            mainBody.appendChild(inbrainedTag)
        }

        // Add primary article
        mainBody.appendChild(this.renderPrimaryArticle());

        const generatedSection = document.createElement('div');
        generatedSection.classList = "p-4 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        const generatedBody = document.createElement('div');

        let isRegenerate = true

        if (this.articleData.generated_articles) {
            generatedBody.appendChild(this.renderSubjectArticles());
            generatedBody.appendChild(this.renderTaboolaArticles());
        } else {
            const error = document.createElement("p")
            error.innerHTML = "No Generated Articles"
            error.classList = "mb-2 font-bold"
            generatedBody.appendChild(error)
            isRegenerate = false
        }
        generatedSection.appendChild(generatedBody);

        const [mainBtn, regenerateBtn] = this.getButtons(isRegenerate)
        generatedSection.appendChild(mainBtn)
        generatedSection.appendChild(regenerateBtn)

        if (this.articleData.last_generated_at) {
            const lastGeneratedAt = document.createElement('p')
            lastGeneratedAt.textContent = `Last Generated at ${this.articleData.last_generated_at}`
            lastGeneratedAt.classList = "text-sm mt-2 ml-1 text-slate-500"
            generatedSection.appendChild(lastGeneratedAt)
        }

        mainBody.appendChild(generatedSection);

        mainAccordion.appendChild(mainBody);
        mainAccordion.appendChild(this.backLink())
        this.container.appendChild(mainAccordion);
        this.container.querySelectorAll('[data-accordion-target]').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();

                const parentAccordion = button.closest('[data-accordion]');
                if (!parentAccordion) return;

                const targetId = button.getAttribute('data-accordion-target').substring(1);
                const target = parentAccordion.querySelector(`#${targetId}`); // scoped inside!

                const expanded = button.getAttribute('aria-expanded') === 'true';

                // Collapse all siblings inside this accordion
                parentAccordion.querySelectorAll('[data-accordion-target]').forEach(otherButton => {
                    if (otherButton !== button) {
                        const otherTargetId = otherButton.getAttribute('data-accordion-target').substring(1);
                        const otherTarget = parentAccordion.querySelector(`#${otherTargetId}`);
                        if (otherTarget) {
                            otherButton.setAttribute('aria-expanded', 'false');
                            otherTarget.classList.add('hidden');

                            const otherSvg = otherButton.querySelector('svg');
                            if (otherSvg) {
                                otherSvg.classList.add('rotate-180');
                            }
                        }
                    }
                });

                // Toggle clicked one
                if (target) {
                    button.setAttribute('aria-expanded', (!expanded).toString());
                    target.classList.toggle('hidden', expanded);

                    const svg = button.querySelector('svg');
                    if (svg) {
                        svg.classList.toggle('rotate-180', expanded);
                    }
                }
            });
        });
    }
}
export default ArticleAccordionComponent
