/* globals */

import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { toast } from 'bulma-toast';
import 'bulma-checkradio';
import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
import { webServer, headers, filterHttpResponse, debug } from './utils.js';

function getAnswers() {
  debug(`@QuizDetail.getAnswers()`);
  const { xApiKey } = this.root.querySelector('quiz-user');
  const url = `${webServer}/users/answers/`;
  return fetch(url, { method: 'GET', headers: headers(xApiKey) }).then(filterHttpResponse);
}

async function delAnswer(question) {
  debug(this);
  const { xApiKey } = this.root.querySelector('quiz-user');
  const url = `${webServer}/quizzes/${this.quiz}/questions/${question.question_id}/answers/`;
  debug(`@QuizDetail.delAsnwer`, url);

  try {
    const r = await fetch(url, { method: 'DELETE', headers: headers(xApiKey) }).then(filterHttpResponse);

    const msg = `
      ${r.user_id} suppressed his/her answer to question ${r.question_id}}
    `;
    toast({ message: msg, type: 'is-success', dismissible: true, position: 'bottom-right' });
  } catch (err) {
    toast({ message: `${err.name} : ${err.message}`, type: 'is-danger', dismissible: true, position: 'bottom-right' });
  } finally {
    this.requestUpdate();
  }
}

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
  } finally {
    this.requestUpdate();
  }
}

function getQuiz(id) {
  debug(`@QuizDetail.getQuiz(${id})`);
  const url = `${webServer}/quizzes/${id}/`;
  return fetch(url, { method: 'GET', headers: headers() }).then(filterHttpResponse);
}

function getQuestions(id, ids) {
  debug(`@QuizDetail.getQuestions(${id}, [${ids}])`);
  const url = `${webServer}/quizzes/${id}/questions`;
  const fetches = ids.map((i) => fetch(`${url}/${i}`, { method: 'GET', headers: headers() }).then(filterHttpResponse));
  return Promise.all(fetches);
}

function quizTmpl() {
  const date = new Date(this.details.created_at);
  const formatOpt = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('fr-FR', formatOpt).format(date);
  const theseAnswers = this.answers;
  debug(`@QuizDetail.quizTmpl`, theseAnswers);

  function answeredProposition(q, p) {
    return theseAnswers.filter((a) => a.question_id === q && a.proposition_id === p).length !== 0;
  }

  const propositionTmpl = (q) => (p) => {
    return html`
      <input
        type="radio"
        id="prop-${q}-${p.proposition_id}"
        name="${q}"
        class="is-checkradio filled-in proposition "
        value="${p.proposition_id}"
        ?checked="${answeredProposition(q, p.proposition_id)}"
      />
      <label for="prop-${q}-${p.proposition_id}">${p.content}</label>
    `;
  };

  const answeredQuestion = (q) => {
    const answered = theseAnswers.filter((a) => a.question_id === q.question_id).length !== 0;

    if (answered) {
      const theDate = new Date(theseAnswers.filter((a) => a.question_id === q.question_id)[0].answered_at);
      return html`
        (répondu le ${theDate.toLocaleString('fr-FR')})
        <span class="icon" @click=${() => delAnswer.bind(this)(q)}><i class="material-icons">delete</i></span>
      `;
    }
    return html``;
  };

  const questionTmpl = (q) => {
    const classes = {
      field: true,
      'has-background-warning': this.highlightedQuestions.some((x) => x.quiz_id === this.quiz && x.question_id === q.question_id),
    };
    return html`
      <div class="${classMap(classes)}" data-question="${q.question_id}">
        <label class="label">${q.sentence} ${answeredQuestion(q)}</label>
        <!-- <div class="control"> -->
        <div class="field">
          ${q.propositions.map(propositionTmpl(q.question_id))}
        </div>
      </div>
    `;
  };
  const questions = this.questions.map(questionTmpl);

  return html`
    <article class="box has-background-white-ter">
      <div clas="">
        <p class="title is-3">${this.details.title}</p>
        <p class="subtitle is-5">${formattedDate} par ${this.details.owner_id}</p>
        <p class="subtitle is-6">${this.details.description}</p>
        <form id="form-answer" @submit=${postAnswer} data-quiz="${this.details.quiz_id}">
          ${questions}

          <button class="button  is-primary" ?disabled=${!this.details.open} type="submit" name="action">
            <span>${this.details.open ? 'Envoyer' : 'QCM fermé'}</span>
            <span class="icon"><i class="material-icons">${this.details.open ? 'send' : 'block'}</i></span>
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
      answers: { type: Array, attribute: false },
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
    this.answers = [];
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
        const answers = await getAnswers.bind(this)();
        this.answers = answers.filter((a) => a.quiz_id === this.quiz);
        if (this.answers.length > 0) this.answers = this.answers[0].answers;
        else this.answers = [];
        debug(`@QuizDetail.performUpdate()`, this.answers);
      }
    } catch (err) {
      debug(`@QuizDetail.performUpdate() catch `, err);
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
