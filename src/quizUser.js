import { LitElement, html } from 'lit-element';
import { webServer, headers, filterHttpResponse, debug } from './utils.js';

function getUser(api) {
  debug(`@QuizUser.getUser()`);
  const url = `${webServer}/users/whoami/`;
  return fetch(url, { method: 'GET', headers: headers(api) }).then(filterHttpResponse);
}

function userModalToggle() {
  debug(`@QuizUser.userModalToggle`, this);
  const $modal = this.root.getElementById('modal-user');
  $modal.classList.toggle('is-active');
}

function userLogin() {
  const xApiKey = this.root.getElementById('x-api-key').value;
  debug(`@QuizUser.userLogin`, this, xApiKey);
  this.xApiKey = xApiKey;
  userModalToggle.bind(this)();
}

function userLogout() {
  debug(`@QuizUser.userLogout`, this);
  this.xApiKey = null;
  this.user = null;
  userModalToggle.bind(this)();
}

function userTmpl() {
  // debug(this);
  const logged = this.user;
  const icon = logged ? 'face' : 'input';
  const msg = logged
    ? html`
        <h4>${this.user.firstname} ${this.user.lastname.toUpperCase()} (${this.user.user_id})</h4>
      `
    : html`
        <div class="field">
          <label class="label">Type your X-API-KEY</label>
          <div class="control">
            <input id="x-api-key" class="input is-warning" type="text" placeholder="7038e76c-7fc3-423f-bfaa-97a0872bdb68" />
          </div>
        </div>
      `;
  const buttons = logged
    ? html`
        <button class="button is-warning" @click=${userLogout.bind(this)}>Logout</button>
        <button class="button" @click=${userModalToggle.bind(this)}>OK</button>
      `
    : html`
        <button class="button is-warning" @click=${userLogin.bind(this)}>Login</button>
      `;

  return html`
    <i id="id-login" class="material-icons" @click=${userModalToggle.bind(this)}>${icon}</i>

    <div id="modal-user" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Bienvenue</p>
        </header>
        <section class="modal-card-body">
          ${msg}
        </section>
        <footer class="modal-card-foot">
          ${buttons}
        </footer>
      </div>
    </div>
  `;
}

class QuizUser extends LitElement {
  static get properties() {
    return {
      xApiKey: { type: Number, attribute: false },
    };
  }

  constructor() {
    debug(`@QuizUser.constructor`);
    super();
    this.xApiKey = '7038e76c-7fc3-423f-bfaa-97a0872bdb68';
  }

  connectedCallback() {
    debug(`@QuizUser.connectedCallback()`);
    super.connectedCallback();
  }

  render() {
    debug(`@QuizUser.render()`);
    return userTmpl.bind(this)();
  }

  async performUpdate() {
    debug(`@QuizUser.performUpdate()`);
    try {
      if (this.xApiKey) {
        const user = await getUser(this.xApiKey);
        this.user = user;
      }
    } catch (err) {
      console.error(err);
    } finally {
      super.performUpdate();
    }
  }

  createRenderRoot() {
    /**
     * Render template without shadow DOM. Note that shadow DOM features like
     * encapsulated CSS and slots are unavailable.
     */
    this.root = document;
    return this;
  }
}

customElements.define('quiz-user', QuizUser);
