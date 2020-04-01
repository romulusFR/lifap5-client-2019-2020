/* globals DEVELOPMENT VERSION NAME */
/* eslint-disable no-unused-vars */

// import css via webpack
import 'bulma/css/bulma.min.css';
import 'material-icons/iconfont/material-icons.css';

// import de tous les web components
import './quizSearch.js';
import './quizUser.js';
import './quizzesList.js';
import './quizDetail.js';

// import de l'infra websocket
import { webSocket } from './websocket.js';

// import de la config
import { debug } from './utils.js';

function refresh(msg) {
  debug(`@Index.refresh()`, msg);
  const $paginatedQuizzes = document.querySelector('paginated-quizzes');
  const $quizDetail = document.querySelector('quiz-detail');

  if (msg.type === 'quiz') {
    debug(`@Index.refresh() msg.type=`, msg.type);
    $paginatedQuizzes.performUpdate();
  }

  if (msg.quiz_id === $quizDetail.quiz) {
    debug(`@Index.refresh() msg.quiz_id=`, msg.quiz_id);
    $quizDetail.performUpdate();
  }
}

debug(`${NAME} ${VERSION}[${DEVELOPMENT?'dev':'prod'}]`);
// webSocket(refresh);
