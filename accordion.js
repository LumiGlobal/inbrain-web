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
        body.className = 'hidden ml-2 px-4 py-2 border-1 border-solid border-gray-600 rounded';
        body.setAttribute('aria-labelledby', headingId);

        const contentDiv = document.createElement('div');

        // Add title
        const titleElem = document.createElement('h4');
        titleElem.className = 'text-2xl font-bold mb-2';
        titleElem.textContent = this.articleData.title;
        contentDiv.appendChild(titleElem);

        if (this.articleData.description && this.articleData.description.length !== 0) {
            const descTitle = document.createElement('p');
            descTitle.textContent = "Description"
            descTitle.className = 'font-bold mb-3';
            contentDiv.appendChild(descTitle);

            // Add description
            const descElem = document.createElement('p');
            descElem.className = 'text-gray-600 mb-3';
            descElem.textContent = this.articleData.description;
            contentDiv.appendChild(descElem);
        }

        const contentTitle = document.createElement('p');
        contentTitle.textContent = "Content"
        contentTitle.className = 'font-bold mb-3';
        contentDiv.appendChild(contentTitle);

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
        body.className = 'hidden ml-6 px-4 border-1 border-solid border-gray-600 rounded';
        body.setAttribute('aria-labelledby', headingId);

        const contentDiv = document.createElement('div');
        
        const title = document.createElement('h3')
        title.className = 'text-2xl font-bold pt-3 pb-2'
        title.textContent = article.title

        contentDiv.appendChild(title)

        // Process paragraphs
        if (article.paragraphs && article.paragraphs.length) {
            article.paragraphs.forEach((para, i) => {
                if (!para.subheader || !para.content) {
                    const error = document.createElement("p")
                    error.textContent = `Subheader ${i + 1} or Content ${i + 1} is missing. Regenerate articles with ID: ${this.articleData.id}`
                    error.className = "text-red-500 mb-2 font-bold"
                    contentDiv.appendChild(error)
                    return
                }

                const subheader = document.createElement('h6');
                subheader.className = 'mt-2 mb-1 font-bold text-gray-800';
                subheader.textContent = para.subheader;
                contentDiv.appendChild(subheader);

                const content = document.createElement('p');
                content.className = 'text-gray-700 mb-2';
                content.textContent = para.content;
                contentDiv.appendChild(content);

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

        const mainButton = this.createAccordionButton(`${this.articleData.id}: ${this.articleData.title}`, mainBodyId, false);
        mainButton.querySelector('span').className = 'text-base truncate';

        mainHeading.appendChild(mainButton);
        mainAccordion.appendChild(mainHeading);

        // Create main body that contains all sections
        const mainBody = document.createElement('div');
        mainBody.id = mainBodyId;
        mainBody.className = 'hidden';
        mainBody.setAttribute('aria-labelledby', mainHeadingId);

        // Add category info if exists
        if (this.articleData.generated_articles && this.articleData.generated_articles.main_category) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-3 text-sm font-medium text-gray-600';
            categoryDiv.textContent = `Category: ${this.articleData.generated_articles.main_category}`;
            mainBody.appendChild(categoryDiv);
        }

        // Add primary article
        mainBody.appendChild(this.renderPrimaryArticle());

        if (this.articleData.generated_articles) {
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
        } else {
            const error = document.createElement("p")
            error.innerHTML = `Article ${this.articleData.id} does not have generated articles. Regenerate article with ID: ${this.articleData.id}.`
            error.className = "ml-2 text-red-500"
            mainBody.appendChild(error)
        }

        mainAccordion.appendChild(mainBody);
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
