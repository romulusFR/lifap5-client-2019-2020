/* globals */

import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { toast } from 'bulma-toast';
import { webServer, headers, filterHttpResponse, debug } from './utils.js';

async function postAnswer(ev) {
  debug(`@QuizDetail.postAnswer`, this);
  const { xApiKey } = this.root.querySelector('quiz-user');
  ev.preventDefault();
  const $form = this.root.getElementById('form-answer');
  const data = new FormData($form);

  const fetches = Array.from(data.entries()).map((e) => {
    const [q, p] = e;
    const url = `${webServer}/quizzes/${this.quiz}/questions/${q}/answers/${p}`;
    debug(`@QuizDetail.postAnswer`, url);
    return fetch(url, { method: 'POST', headers: headers(xApiKey) }).then(filterHttpResponse);
  });

  try {
    const results = await Promise.all(fetches);

    results.map((r) => {
      const msg = `
      ${r.user_id} answered question ${r.question_id} at ${new Date(r.answered_at).toLocaleTimeString()}
    `;
      return toast({ message: msg, type: 'is-success', dismissible: true, position: 'bottom-right' });
    });
  } catch (err) {
    toast({ message: `${err.name} : ${err.message}`, type: 'is-danger', dismissible: true, position: 'bottom-right' });
  }
}

const getQuiz = (id) => {
  debug(`@QuizDetail.getQuiz(${id})`);
  const url = `${webServer}/quizzes/${id}/`;
  return fetch(url, { method: 'GET', headers: headers() }).then(filterHttpResponse);
};

const getQuestions = (id, ids) => {
  debug(`@QuizDetail.getQuestions(${id}, [${ids}])`);
  const url = `${webServer}/quizzes/${id}/questions`;
  const fetches = ids.map((i) => fetch(`${url}/${i}`, { method: 'GET', headers: headers() }).then(filterHttpResponse));
  return Promise.all(fetches);
};

function quizTmpl() {
  const date = new Date(this.details.created_at);
  const formatOpt = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('fr-FR', formatOpt).format(date);

  const propositionTmpl = (q) => (p) => html`
    <div class="control">
      <label class="radio">
        <input type="radio" name="${q}" class="filled-in proposition" value="${p.proposition_id}" />
        <span>${p.content}</span>
      </label>
    </div>
  `;

  const questionTmpl = (q) => {
    const classes = {
      field: true,
      'has-background-warning': this.highlightedQuestions.some((x) => x.quiz_id === this.quiz && x.question_id === q.question_id),
    };
    return html`
      <div class="${classMap(classes)}" data-question="${q.question_id}">
        <label class="label">${q.sentence}</label>
        <div class="control">
          ${q.propositions.map(propositionTmpl(q.question_id))}
        </div>
      </div>
    `;
  };
  const questions = this.questions.map(questionTmpl);

  return html`
    <article class="container box">
      <div>
        <p class="title is-3">${this.details.title}</p>
        <p class="subtitle is-5">${formattedDate} par ${this.details.owner_id}</p>
        <p class="subtitle is-6">${this.details.description}</p>
        <form id="form-answer" @submit=${postAnswer} data-quiz="${this.details.quiz_id}">
          ${questions}

          <button class="button  is-primary" ?disabled=${!this.details.open} type="submit" name="action">
            <span>Envoyer</span>
            <span class="icon"><i class="material-icons">send</i></span>
          </button>
        </form>
      </div>
    </article>
  `;
}

class QuizDetail extends LitElement {
  static get properties() {
    return {
      quiz: { type: Number, reflect: true },
      highlightedQuestions: { type: Array, attribute: false },
    };
  }

  // static get styles() {
  //   return css`
  //     @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
  //     @import './node_modules/materialize-css/dist/css/materialize.min.css';
  //   `;
  // }

  constructor() {
    debug(`@QuizDetail.constructor`);
    super();
    this.quiz = null;
    this.highlightedQuestions = [];
  }

  connectedCallback() {
    debug(`@QuizDetail.connectedCallback()`);
    super.connectedCallback();
  }

  render() {
    debug(`@QuizDetail.render()`);
    return this.quiz !== null ? quizTmpl.bind(this)() : '';
  }

  async performUpdate() {
    debug(`@QuizDetail.performUpdate()`, this.quiz);
    try {
      if (this.quiz !== null) {
        this.details = await getQuiz(this.quiz);
        this.questions = await getQuestions(this.quiz, this.details.questions_ids);
      }
    } catch (err) {
      this.quiz = null;
    } finally {
      super.performUpdate();
    }
  }

  createRenderRoot() {
    this.root = document;
    return this;
  }
}

customElements.define('quiz-detail', QuizDetail);
