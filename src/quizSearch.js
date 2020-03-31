import { LitElement, html } from 'lit-element';
import { webServer, headers, filterHttpResponse, debug } from './utils.js';

function search(phrase) {
  debug(`@QuizSearch.search()`);
  const url = `${webServer}/search/?q=${phrase}`;
  return fetch(url, { method: 'GET', headers: headers() }).then(filterHttpResponse);
}

async function searchHandler(ev) {
  // debug(`@QuizSearch.searchHandler`, ev.target);
  const { value } = ev.target;
  const $list = this.root.querySelector('paginated-quizzes');
  const $detail = this.root.querySelector('quiz-detail');
  // debug(`@QuizSearch.searchHandler`, value);
  if (value.length > 2) {
    const results = await search(value);
    $list.highlightedQuizzes = results.map((x) => x.quiz_id);
    const highlightedQuestions = results
      .filter((x) => x.question_id !== undefined)
      // eslint-disable-next-line camelcase
      .map((x) => ({ quiz_id: x.quiz_id, question_id: x.question_id }));
    debug(`@QuizSearch.searchHandler`, highlightedQuestions);
    $detail.highlightedQuestions = highlightedQuestions;
  } else {
    $list.highlightedQuizzes = [];
    $detail.highlightedQuestions = [];
  }
}

function resetSearch() {
  const $input = this.root.querySelector('quiz-search input');
  $input.value = '';
  return $input.dispatchEvent(new Event('input'));
}

function searchTmpl() {
  return html`
    <div class="field has-addons">
      <div class="control">
        <input
          class="input"
          type="search"
          name="search-input"
          placeholder="Rechercher dans les quizzes"
          @input=${searchHandler}
          style="width: 16rem;"
        />
      </div>
      <div class="control">
        <a class="button is-info" @click=${resetSearch}>
          Reset
        </a>
      </div>
    </div>
  `;
}

class QuizSearch extends LitElement {
  constructor() {
    debug(`@QuizSearch.constructor`);
    super();
  }

  connectedCallback() {
    debug(`@QuizSearch.connectedCallback()`);
    super.connectedCallback();
  }

  render() {
    debug(`@QuizSearch.render()`);
    return searchTmpl.bind(this)();
  }

  performUpdate() {
    debug(`@QuizSearch.performUpdate()`);
    super.performUpdate();
  }

  createRenderRoot() {
    this.root = document;
    return this;
  }
}

customElements.define('quiz-search', QuizSearch);
