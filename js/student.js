/**
 * 수강생 대시보드 — Python / Git 2개 탭
 * 퀴즈는 수강 체크와 관계없이 항상 풀 수 있음
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Storage.init();
  const session = await App.requireAuth('student');
  if (!session) return;

  const { name: studentName, courseId, cohortId } = session;
  if (!courseId || !cohortId) {
    // 과거 세션 호환: 과정/기수 없으면 로그인 페이지로
    Storage.clearSession();
    window.location.href = 'index.html';
    return;
  }

  let studentData = Storage.getStudentData(studentName, courseId, cohortId);
  if (!studentData) studentData = Storage.initStudent(studentName, courseId, cohortId);
  if (!studentData) {
    // 세션의 courseId/cohortId가 손상되어 학생 데이터를 만들 수 없음 → 로그인 페이지로
    Storage.clearSession();
    window.location.href = 'index.html';
    return;
  }
  if (Storage.ensureChapters(studentData)) Storage.saveStudentData(studentName, studentData, courseId, cohortId);

  const missions = getMissionData();
  const course   = getCourseById(courseId);
  const cohort   = getCohortById(cohortId);
  let activeTab  = 'python';

  // Firebase 실시간 동기화 시 UI 갱신
  Storage.onDataChange(() => {
    const fresh = Storage.getStudentData(studentName, courseId, cohortId);
    if (fresh) { studentData = fresh; renderTabContent(); }
  });

  // 헤더
  document.getElementById('studentName').textContent = studentName;
  const userMeta = document.getElementById('userMeta');
  if (course && cohort) {
    userMeta.innerHTML = `${course.icon} <strong>${course.short}</strong> · ${cohort.label}`;
  }
  document.getElementById('logoutBtn').addEventListener('click', App.logout);

  // ── 탭 전환 ──
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-drop-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const activeItem = document.querySelector(`.tab-drop-item[data-tab="${tab}"]`);
    if (activeItem) document.getElementById('tabDropdownLabel').textContent = activeItem.textContent;
    document.getElementById('tabDropdownMenu').classList.remove('open');
    renderTabContent();
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('tabDropdownBtn').addEventListener('click', () => {
    document.getElementById('tabDropdownMenu').classList.toggle('open');
  });
  document.querySelectorAll('.tab-drop-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tab-dropdown')) {
      document.getElementById('tabDropdownMenu').classList.remove('open');
    }
  });

  // ── 통계 ──
  function updateStats() {
    studentData = Storage.getStudentData(studentName, courseId, cohortId);
    const prog = App.calcProgress(studentData);
    document.getElementById('overallPercent').textContent = prog.overall + '%';
    document.getElementById('overallBar').style.width = prog.overall + '%';
    document.getElementById('statWatched').textContent = `${prog.watchedChapters}/${prog.totalChapters}`;
    document.getElementById('statQuiz').textContent    = `${prog.attemptedQuizChapters}/${prog.totalQuizChapters}`;
  }

  // ── 탭 콘텐츠 ──
  function renderTabContent() {
    updateStats();
    const container = document.getElementById('tabContent');
    container.innerHTML = '';
    renderChapterTab(container, activeTab);
  }

  function renderChapterTab(container, missionKey) {
    const mission = missions[missionKey];
    const mProg = studentData.progress[missionKey];

    // 헤더
    const header = document.createElement('div');
    header.className = 'tab-header';
    const playlistHtml = mission.playlistUrl
      ? `<a href="${mission.playlistUrl}" target="_blank" class="playlist-btn">📺 전체 재생목록</a>`
      : '';
    header.innerHTML = `
      <div class="tab-header-info">
        <h2>${mission.icon} ${mission.title}</h2>
        <p>${mission.description}</p>
      </div>
      ${playlistHtml}
    `;
    container.appendChild(header);

    // 챕터 카드
    const list = document.createElement('div');
    list.className = 'chapter-card-list';

    mission.chapters.forEach((ch, idx) => {
      const cp = mProg.chapters[ch.id] || {};
      const watched = !!cp.watched;
      const hasQuiz = ch.quiz && ch.quiz.length > 0;
      const quizDone = !!cp.quizCompleted;

      const card = document.createElement('div');
      card.className = `chapter-card ${watched ? 'watched' : ''} ${quizDone ? 'quiz-done' : ''}`;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'chapter-card-header';
      cardHeader.innerHTML = `
        <label class="watch-check">
          <input type="checkbox" ${watched ? 'checked' : ''}>
          <span class="watch-checkmark"></span>
        </label>
        <div class="chapter-card-title">
          <span class="ch-number num">Ch.${idx + 1}</span>
          <span class="ch-title">${App.escapeHtml(ch.title)}</span>
        </div>
        <div class="chapter-card-meta">
          <span class="ch-duration num">⏱ ${App.escapeHtml(ch.duration)}</span>
          ${hasQuiz && quizDone ? `<span class="ch-quiz-badge done">퀴즈 응시 완료</span>` : ''}
        </div>
      `;
      card.appendChild(cardHeader);

      // 강의 링크 (lessons 배열) 또는 안내 메시지
      const lessons = Array.isArray(ch.lessons) ? ch.lessons : [];
      if (lessons.length > 0) {
        const ytRow = document.createElement('div');
        ytRow.className = 'chapter-card-yt';
        ytRow.innerHTML = lessons.map(ls =>
          `<a href="${ls.url}" target="_blank" class="yt-btn">📺 ${App.escapeHtml(ls.title)}</a>`
        ).join('');
        card.appendChild(ytRow);
      } else if (ch.externalNote) {
        const noteRow = document.createElement('div');
        noteRow.className = 'chapter-card-yt';
        noteRow.innerHTML = `<span class="ch-note">ℹ️ ${App.escapeHtml(ch.externalNote)}</span>`;
        card.appendChild(noteRow);
      } else if (ch.youtubeUrl) {
        const ytRow = document.createElement('div');
        ytRow.className = 'chapter-card-yt';
        ytRow.innerHTML = `<a href="${ch.youtubeUrl}" target="_blank" class="yt-btn">📺 강의 보기</a>`;
        card.appendChild(ytRow);
      }

      // 퀴즈 토글 (강의 수강 여부와 관계없이 항상 풀이 가능)
      if (hasQuiz) {
        const quizToggle = document.createElement('div');
        quizToggle.className = 'quiz-toggle';
        quizToggle.innerHTML = `
          <button class="quiz-toggle-btn">${quizDone ? '▼ 퀴즈 결과 보기' : '▼ 이 정도는 알고 있어요. 퀴즈만 풀기!'}</button>
        `;
        card.appendChild(quizToggle);

        const quizPanel = document.createElement('div');
        quizPanel.className = 'quiz-panel';
        quizPanel.style.display = 'none';
        buildQuizPanel(quizPanel, ch, missionKey, quizDone, cp);

        const toggleBtn = quizToggle.querySelector('.quiz-toggle-btn');
        toggleBtn.addEventListener('click', () => {
          const isOpen = quizPanel.style.display !== 'none';
          quizPanel.style.display = isOpen ? 'none' : 'block';
          toggleBtn.textContent = isOpen
            ? (quizDone ? '▼ 퀴즈 결과 보기' : '▼ 이 정도는 알고 있어요. 퀴즈만 풀기!')
            : (quizDone ? '▲ 퀴즈 결과 닫기' : '▲ 퀴즈 닫기');
        });

        card.appendChild(quizPanel);
      }

      // 수강 완료 체크박스
      const checkbox = cardHeader.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        studentData.progress[missionKey].chapters[ch.id].watched   = checkbox.checked;
        studentData.progress[missionKey].chapters[ch.id].watchedAt = checkbox.checked ? new Date().toISOString() : null;
        Storage.saveStudentData(studentName, studentData, courseId, cohortId);
        renderTabContent();
        App.showToast(checkbox.checked ? '수강 완료!' : '체크 해제됨', checkbox.checked ? 'success' : 'info');
      });

      list.appendChild(card);
    });

    container.appendChild(list);
  }

  // 퀴즈 패널 빌드
  // 정답/오답 채점 없이 응시 후 모범답안과 해설만 노출
  function buildQuizPanel(panel, chapter, missionKey, quizDone, chProgress) {
    const questions = chapter.quiz;
    const savedAnswers = chProgress.quizAnswers || {};

    let html = '<div class="quiz-inline">';

    questions.forEach((q, idx) => {
      const disabled = quizDone ? 'disabled' : '';
      const savedVal = savedAnswers[q.id];

      html += `<div class="qi-question">`;
      html += `<p class="qi-number num">Q${idx + 1}.</p>`;
      html += `<p class="qi-text">${formatQuestionText(q.question)}</p>`;

      if (q.type === 'multiple') {
        html += `<div class="qi-options">`;
        q.options.forEach((opt, oi) => {
          const checked = (quizDone && savedVal === oi) ? 'checked' : '';
          const isModel = quizDone && oi === q.answer;
          html += `
            <label class="qi-option ${isModel ? 'model-opt' : ''}">
              <input type="radio" name="qi-${chapter.id}-${q.id}" value="${oi}" ${checked} ${disabled}>
              <span>${App.escapeHtml(opt)}${isModel ? ' <em class="qi-model-tag">모범답안</em>' : ''}</span>
            </label>`;
        });
        html += `</div>`;
      } else if (q.type === 'short') {
        const val = quizDone ? (savedVal || '') : '';
        html += `
          <div class="qi-short">
            <input type="text" class="qi-short-input" name="qi-${chapter.id}-${q.id}"
              placeholder="답을 입력하세요" value="${App.escapeHtml(val)}" ${disabled} autocomplete="off">
            ${quizDone ? `<div class="qi-model-answer"><span class="qi-model-label">모범답안</span><span class="qi-model-text">${App.escapeHtml(q.answer)}</span></div>` : ''}
          </div>`;
      }

      // 해설은 응시 후 항상 노출
      if (quizDone && q.explanation) {
        html += `<p class="qi-explanation">💡 ${App.escapeHtml(q.explanation)}</p>`;
      }

      html += `</div>`;
    });

    if (quizDone) {
      html += `
        <div class="qi-result done">
          <span>✅ 응시 완료 — 모범답안을 비교해 보세요</span>
        </div>`;
    } else {
      html += `<button class="btn btn-accent qi-submit-btn">제출하기</button>`;
    }

    html += '</div>';
    panel.innerHTML = html;

    const submitBtn = panel.querySelector('.qi-submit-btn');
    if (submitBtn) submitBtn.addEventListener('click', () => submitQuiz(panel, chapter, missionKey));
  }

  function submitQuiz(panel, chapter, missionKey) {
    const questions = chapter.quiz;
    let allAnswered = true;
    const answers = {};

    questions.forEach(q => {
      const name = `qi-${chapter.id}-${q.id}`;
      if (q.type === 'short') {
        const input = panel.querySelector(`input[name="${name}"]`);
        const val = input ? input.value.trim() : '';
        if (!val) { allAnswered = false; return; }
        answers[q.id] = val;
      } else if (q.type === 'multiple') {
        const sel = panel.querySelector(`input[name="${name}"]:checked`);
        if (!sel) { allAnswered = false; return; }
        answers[q.id] = parseInt(sel.value);
      }
    });

    if (!allAnswered) {
      App.showToast('모든 문항에 답해주세요.', 'warning');
      return;
    }

    const chData = studentData.progress[missionKey].chapters[chapter.id];
    chData.quizCompleted = true;
    chData.quizAnswers = answers;
    chData.quizCompletedAt = new Date().toISOString();
    Storage.saveStudentData(studentName, studentData, courseId, cohortId);

    renderTabContent();
    App.showToast('응시 완료! 모범답안을 확인해 보세요.', 'success');
  }

  function formatQuestionText(text) {
    return App.escapeHtml(text).replace(/\n/g, '<br>');
  }

  renderTabContent();
});
