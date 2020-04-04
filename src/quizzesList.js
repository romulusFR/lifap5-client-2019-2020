// import { html, render } from '../node_modules/lit-html/lit-html.js';
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { webServer, headers, filterHttpResponse, debug } from './utils.js';

function getResults(page = 1, opt) {
  debug(`@PaginatedList.getQuizzes(${page}, ${JSON.stringify(opt)})`);
  const url = `${webServer}/quizzes/?page=${page}&limit=${opt.limit}&order=${opt.order}&dir=${opt.dir}`;
  return fetch(url, { method: 'GET', headers: headers() }).then(filterHttpResponse);
}


function optionMenuTmpl() {
  function toggleDropdown(event) {
    event.stopPropagation();
    event.currentTarget.classList.toggle('is-active');
  }

  function optionHandler(event) {
    const target = event.currentTarget;
    const { attribute, value } = target.dataset;
    debug(`@PaginatedList.optionHandler(${attribute}, ${value})`);
    this.setAttribute(attribute, value);
  }

  const optionMenu = html`
    <nav class="level">
      <div class="level-item">
        <div class="dropdown" id="dropdown-nombre" @click=${toggleDropdown}>
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu-nombre">
              <span>Nombre</span>
              <i class="material-icons">expand_more</i>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu-nombre" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="2" @click=${optionHandler}>2</a>
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="5" @click=${optionHandler}>5</a>
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="10" @click=${optionHandler}>10</a>
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="20" @click=${optionHandler}>20</a>
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="50" @click=${optionHandler}>50</a>
              <a href="#" class="dropdown-item" data-attribute="limit" data-value="100" @click=${optionHandler}>100</a>
            </div>
          </div>
        </div>
      </div>

      <div class="level-item">
        <div class="dropdown" id="dropdown-order" @click=${toggleDropdown}>
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu-order">
              <span>Tri</span>
              <i class="material-icons">expand_more</i>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu-order" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-attribute="order" data-value="quiz_id" @click=${optionHandler}>ID</a>
              <a href="#" class="dropdown-item" data-attribute="order" data-value="created_at" @click=${optionHandler}>Date</a>
              <a href="#" class="dropdown-item" data-attribute="order" data-value="owner_id" @click=${optionHandler}>Owner</a>
            </div>
          </div>
        </div>
      </div>

      <div class="level-item">
        <div class="dropdown" id="dropdown-dir" @click=${toggleDropdown}>
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu-dir">
              <span>Ordre</span>
              <i class="material-icons">expand_more</i>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu-dir" role="menu">
            <div class="dropdown-content">
              <a href="#" class="dropdown-item" data-attribute="dir" data-value="asc" @click=${optionHandler}>Asc</a>
              <a href="#" class="dropdown-item" data-attribute="dir" data-value="desc" @click=${optionHandler}>Desc</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;

  this.root.addEventListener('click', function clearDropdowns(_ev) {
    const $dropdowns = this.querySelectorAll('.dropdown:not(.is-hoverable)');
    $dropdowns.forEach(function close($el) {
      $el.classList.remove('is-active');
    });
  });

  return optionMenu;
}

function paginationTmpl() {
  const { currentPage, nbPages } = this;
  const isFirst = currentPage === 1;
  const isLast = currentPage === nbPages;

  // a [i] link in the pagination dic
  const paginationPage = (i) => {
    if (i === currentPage) {
      return html`
        <li><a class="pagination-link is-current" aria-current="page" aria-label="Page ${i}">${i}</a></li>
      `;
    }
    return html`
      <li><a class="pagination-link" aria-label="Page ${i}" @click=${() => (this.currentPage = i)}>${i}</a></li>
    `;
  };

  // generates the list [1, 2, ..., nbPages]
  const pageIndex = Array.from({ length: this.nbPages }, (_, i) => i + 1);

  // the "[<] [1] [2] ... [n] [>]" links at the bottom of the collection
  // first generates [<], then map paginationPage on [i] and generates [>]
  const pagination = html`
    <nav class="pagination " role="navigation" aria-label="pagination">
      <a class="pagination-previous" ?disabled=${isFirst} @click=${() => (!isFirst ? (this.currentPage -= 1) : undefined)}
        ><i class="material-icons">chevron_left</i></a
      >
      <a class="pagination-next" ?disabled=${isLast} @click=${() => (!isLast ? (this.currentPage += 1) : undefined)}
        ><i class="material-icons">chevron_right</i></a
      >
      <ul class="pagination-list">
        ${pageIndex.map(paginationPage)}
      </ul>
    </nav>
  `;

  return pagination;
}


// Generates the collection/menu on the left hand side
// NB : { eventContext: this } in render() sets this to the quizzes-list custom element
function quizzesTmpl() {
  const { currentQuiz, highlightedQuizzes } = this;

  function quizHandler(id) {
    const $detail = document.querySelector('quiz-detail');
    return () => {
      debug(`@PaginatedList.quizHandler(${id})`);
      this.currentQuiz = id;
      $detail.setAttribute('quiz', id);
    };
  }

  // a single quiz item for the menu
  const quizTmpl = (quiz) => {
    const classes = {
      'list-item': true,
      'is-active': Number.isInteger(currentQuiz) && currentQuiz === quiz.quiz_id,
      'has-background-warning': highlightedQuizzes.includes(quiz.quiz_id),
    };

    return html`
      <a class="${classMap(classes)}" @click=${quizHandler.bind(this)(quiz.quiz_id)}>
        <p class="title is-3">${quiz.title}</p>
        <p class="subtitle is-5">${quiz.description} <span class="tag is-info">${quiz.owner_id}</span></p>
      </a>
    `;
  };

  // the complete menu : dropdowns, quizzes, pagination
  const completeTmpl = html`
    ${optionMenuTmpl.bind(this)()}
    <div class="list is-hoverable">
      ${this.results.map((quiz) => quizTmpl(quiz))}
    </div>
    ${paginationTmpl.bind(this)()}
  `;

  return completeTmpl;
}

class PaginatedList extends LitElement {
  static get properties() {
    return {
      currentPage: { type: Number, reflect: true },
      limit: { type: Number, reflect: true },
      order: { type: String, reflect: true },
      dir: { type: String, reflect: true },
      currentQuiz: { type: Number, attribute: false },
      highlightedQuizzes: { type: Array, attribute: false },
      // results: { type: Array, attribute: false },
    };
  }

  constructor() {
    debug(`@PaginatedList.constructor`);
    super();
    this.currentPage = 1;
    this.limit = 2;
    this.order = 'quiz_id';
    this.dir = 'asc';

    // not reflected
    this.currentQuiz = null;
    this.highlightedQuizzes = [];

    // not managed by lit-element
    this.results = [];
    this.root = document;
  }

  connectedCallback() {
    debug(`@PaginatedList.connectedCallback()`);
    super.connectedCallback();
  }

  async getAsyncData() {
    debug(`@PaginatedList.getAsyncData() : start`, this);

    const opt = { limit: this.limit, order: this.order, dir: this.dir };
    try {
      const { currentPage, nbResults, nbPages, results } = await getResults(this.currentPage, opt);
      console.assert(this.currentPage === currentPage, 'This should not happen');
      this.nbResults = nbResults;
      this.nbPages = nbPages;
      this.results = results;
    } catch (err) {
      this.currentPage = 0;
      this.nbResults = 0;
      this.nbPages = 0;
      this.results = [];
      console.error(err);
    }

    debug(`@PaginatedList.getAsyncData() : end`);
    return true;
  }

  async performUpdate() {
    debug(`@PaginatedList.performUpdate()`);
    await this.getAsyncData();
    super.performUpdate();
  }

  render() {
    debug(`@PaginatedList.render()`);
    return quizzesTmpl.bind(this)();
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('paginated-quizzes', PaginatedList);
