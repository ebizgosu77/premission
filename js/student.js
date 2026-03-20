/**
 * 수강생 대시보드 — 탭 기반, 챕터별 인라인 퀴즈
 */
document.addEventListener('DOMContentLoaded', () => {
  const session = App.requireAuth('student');
  if (!session) return;

  const studentName = session.name;
  let studentData = Storage.getStudentData(studentName);
  if (!studentData) studentData = Storage.initStudent(studentName);
  if (Storage.ensureChapters(studentData)) Storage.saveStudentData(studentName, studentData);

  const missions = getMissionData();
  let activeTab = 'python';

  // 헤더
  document.getElementById('studentName').textContent = studentName;
  document.getElementById('logoutBtn').addEventListener('click', App.logout);

  // ── 탭 전환 ──
  function switchTab(tab) {
    activeTab = tab;
    // 데스크톱 탭
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    // 모바일 드롭다운
    document.querySelectorAll('.tab-drop-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const activeItem = document.querySelector(`.tab-drop-item[data-tab="${tab}"]`);
    if (activeItem) document.getElementById('tabDropdownLabel').textContent = activeItem.textContent;
    document.getElementById('tabDropdownMenu').classList.remove('open');
    renderTabContent();
  }

  // 데스크톱 탭 버튼
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 모바일 드롭다운
  document.getElementById('tabDropdownBtn').addEventListener('click', () => {
    document.getElementById('tabDropdownMenu').classList.toggle('open');
  });
  document.querySelectorAll('.tab-drop-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tab-dropdown')) {
      document.getElementById('tabDropdownMenu').classList.remove('open');
    }
  });

  // ── 통계 업데이트 ──
  function updateStats() {
    studentData = Storage.getStudentData(studentName);
    const prog = App.calcProgress(studentData);

    document.getElementById('overallPercent').textContent = prog.overall + '%';
    document.getElementById('overallBar').style.width = prog.overall + '%';
    document.getElementById('statWatched').textContent = `${prog.watchedChapters}/${prog.totalChapters}`;
    document.getElementById('statQuiz').textContent = `${prog.passedQuizChapters}/${prog.totalQuizChapters}`;
    document.getElementById('statMission').textContent = `${prog.mathSubmitted}/${prog.mathTotal}`;
  }

  // ── 탭 콘텐츠 렌더링 ──
  function renderTabContent() {
    updateStats();
    const container = document.getElementById('tabContent');
    container.innerHTML = '';

    if (activeTab === 'python' || activeTab === 'git') {
      renderChapterTab(container, activeTab);
    } else {
      renderMathTab(container, activeTab);
    }
  }

  // ═══════════════════════════════════════
  //  챕터 탭 (Python / Git)
  // ═══════════════════════════════════════
  function renderChapterTab(container, missionKey) {
    const mission = missions[missionKey];
    const mProg = studentData.progress[missionKey];

    // 미션 설명 + 재생목록 링크
    const header = document.createElement('div');
    header.className = 'tab-header';
    const playlistHtml = mission.playlistUrl
      ? `<a href="${mission.playlistUrl}" target="_blank" class="playlist-btn">📺 전체 재생목록 열기</a>`
      : '';
    header.innerHTML = `
      <div class="tab-header-info">
        <h2>${mission.icon} ${mission.title}</h2>
        <p>${mission.description}</p>
      </div>
      ${playlistHtml}
    `;
    container.appendChild(header);

    // 챕터 카드 리스트
    const list = document.createElement('div');
    list.className = 'chapter-card-list';

    mission.chapters.forEach((ch, idx) => {
      const cp = mProg.chapters[ch.id] || {};
      const watched = !!cp.watched;
      const hasQuiz = ch.quiz && ch.quiz.length > 0 && ch.quiz[0].type !== 'placeholder';
      const quizDone = !!cp.quizCompleted;
      const quizScore = cp.quizScore || 0;
      const quizPassed = quizDone && quizScore >= 70;

      const card = document.createElement('div');
      card.className = `chapter-card ${watched ? 'watched' : ''} ${quizDone ? (quizPassed ? 'quiz-passed' : 'quiz-failed') : ''}`;

      // ── 카드 상단 ──
      const cardHeader = document.createElement('div');
      cardHeader.className = 'chapter-card-header';
      cardHeader.innerHTML = `
        <label class="watch-check">
          <input type="checkbox" ${watched ? 'checked' : ''}>
          <span class="watch-checkmark"></span>
        </label>
        <div class="chapter-card-title">
          <span class="ch-number num">Ch.${idx + 1}</span>
          <span class="ch-title">${ch.title}</span>
        </div>
        <div class="chapter-card-meta">
          <span class="ch-duration num">⏱ ${ch.duration}</span>
          ${hasQuiz && quizDone
            ? `<span class="ch-quiz-badge ${quizPassed ? 'passed' : 'failed'}">퀴즈 ${quizScore}점</span>`
            : ''}
        </div>
      `;
      card.appendChild(cardHeader);

      // YouTube 링크
      if (ch.youtubeUrl) {
        const ytRow = document.createElement('div');
        ytRow.className = 'chapter-card-yt';
        ytRow.innerHTML = `<a href="${ch.youtubeUrl}" target="_blank" class="yt-btn">📺 강의 보기</a>`;
        card.appendChild(ytRow);
      }

      // ── 퀴즈 섹션 (Python만) ──
      if (hasQuiz) {
        const quizToggle = document.createElement('div');
        quizToggle.className = 'quiz-toggle';
        const isDisabled = !watched;

        if (isDisabled) {
          quizToggle.innerHTML = `<span class="quiz-toggle-label disabled">▼ 퀴즈 (수강완료 체크 후 활성화)</span>`;
        } else {
          quizToggle.innerHTML = `
            <button class="quiz-toggle-btn">${quizDone ? '▼ 퀴즈 결과 보기' : '▼ 퀴즈 풀기'}</button>
          `;
        }
        card.appendChild(quizToggle);

        // 퀴즈 패널 (접혀 있음)
        const quizPanel = document.createElement('div');
        quizPanel.className = 'quiz-panel';
        quizPanel.style.display = 'none';

        if (!isDisabled) {
          buildQuizPanel(quizPanel, ch, missionKey, quizDone, cp);

          const toggleBtn = quizToggle.querySelector('.quiz-toggle-btn');
          toggleBtn.addEventListener('click', () => {
            const isOpen = quizPanel.style.display !== 'none';
            quizPanel.style.display = isOpen ? 'none' : 'block';
            toggleBtn.textContent = isOpen
              ? (quizDone ? '▼ 퀴즈 결과 보기' : '▼ 퀴즈 풀기')
              : (quizDone ? '▲ 퀴즈 결과 닫기' : '▲ 퀴즈 닫기');
          });
        }

        card.appendChild(quizPanel);
      }

      // 수강 완료 체크박스 이벤트
      const checkbox = cardHeader.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        studentData.progress[missionKey].chapters[ch.id].watched = checkbox.checked;
        studentData.progress[missionKey].chapters[ch.id].watchedAt = checkbox.checked ? new Date().toISOString() : null;
        Storage.saveStudentData(studentName, studentData);
        renderTabContent();
        App.showToast(checkbox.checked ? '수강 완료!' : '체크 해제됨', checkbox.checked ? 'success' : 'info');
      });

      list.appendChild(card);
    });

    container.appendChild(list);
  }

  // ── 퀴즈 패널 빌드 ──
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
          let optClass = '';
          if (quizDone) {
            if (oi === q.answer) optClass = 'correct-opt';
            else if (savedVal === oi) optClass = 'wrong-opt';
          }
          html += `
            <label class="qi-option ${optClass}">
              <input type="radio" name="qi-${chapter.id}-${q.id}" value="${oi}" ${checked} ${disabled}>
              <span>${opt}</span>
            </label>`;
        });
        html += `</div>`;
      } else if (q.type === 'ox') {
        html += `<div class="qi-options qi-ox">`;
        [{ label: '⭕ O', val: 'true' }, { label: '❌ X', val: 'false' }].forEach(item => {
          const checked = (quizDone && String(savedVal) === item.val) ? 'checked' : '';
          let optClass = '';
          if (quizDone) {
            if (String(q.answer) === item.val) optClass = 'correct-opt';
            else if (String(savedVal) === item.val) optClass = 'wrong-opt';
          }
          html += `
            <label class="qi-option ${optClass}">
              <input type="radio" name="qi-${chapter.id}-${q.id}" value="${item.val}" ${checked} ${disabled}>
              <span>${item.label}</span>
            </label>`;
        });
        html += `</div>`;
      } else if (q.type === 'short') {
        const val = quizDone ? (savedVal || '') : '';
        let resultHtml = '';
        if (quizDone) {
          const isCorrect = String(savedVal).replace(/\s/g, '').toLowerCase() === String(q.answer).replace(/\s/g, '').toLowerCase();
          resultHtml = isCorrect
            ? '<span class="qi-short-result correct">✅ 정답</span>'
            : `<span class="qi-short-result wrong">❌ 오답 (정답: ${q.answer})</span>`;
        }
        html += `
          <div class="qi-short">
            <input type="text" class="qi-short-input" name="qi-${chapter.id}-${q.id}"
              placeholder="답을 입력하세요" value="${escapeHtml(val)}" ${disabled} autocomplete="off">
            ${resultHtml}
          </div>`;
      }

      // 제출 후 해설 표시 (오답만)
      if (quizDone) {
        let isCorrect;
        if (q.type === 'short') {
          isCorrect = String(savedVal).replace(/\s/g, '').toLowerCase() === String(q.answer).replace(/\s/g, '').toLowerCase();
        } else if (q.type === 'ox') {
          isCorrect = savedVal === q.answer;
        } else {
          isCorrect = savedVal === q.answer;
        }
        if (!isCorrect && q.explanation) {
          html += `<p class="qi-explanation">💡 ${q.explanation}</p>`;
        }
      }

      html += `</div>`;
    });

    // 제출 버튼 또는 결과 뱃지
    if (quizDone) {
      const passed = chProgress.quizScore >= 70;
      html += `
        <div class="qi-result ${passed ? 'passed' : 'failed'}">
          <span>퀴즈 제출완료</span>
          <span class="qi-result-score num">${chProgress.quizScore}점 ${passed ? '✅ 합격' : '❌ 불합격'}</span>
          <button class="btn btn-sm btn-outline qi-retry-btn">재응시</button>
        </div>`;
    } else {
      html += `<button class="btn btn-accent qi-submit-btn">제출하기</button>`;
    }

    html += '</div>';
    panel.innerHTML = html;

    // 이벤트 바인딩
    const submitBtn = panel.querySelector('.qi-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => submitQuiz(panel, chapter, missionKey));
    }

    const retryBtn = panel.querySelector('.qi-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        // 퀴즈 리셋
        studentData.progress[missionKey].chapters[chapter.id].quizCompleted = false;
        studentData.progress[missionKey].chapters[chapter.id].quizScore = 0;
        studentData.progress[missionKey].chapters[chapter.id].quizAnswers = {};
        studentData.progress[missionKey].chapters[chapter.id].quizCompletedAt = null;
        Storage.saveStudentData(studentName, studentData);
        renderTabContent();
        App.showToast('퀴즈를 다시 풀 수 있습니다.', 'info');
      });
    }
  }

  // ── 퀴즈 제출 ──
  function submitQuiz(panel, chapter, missionKey) {
    const questions = chapter.quiz;
    let correct = 0;
    let allAnswered = true;
    const answers = {};

    questions.forEach(q => {
      const name = `qi-${chapter.id}-${q.id}`;
      if (q.type === 'short') {
        const input = panel.querySelector(`input[name="${name}"]`);
        const val = input ? input.value.trim() : '';
        if (!val) { allAnswered = false; return; }
        answers[q.id] = val;
        if (val.replace(/\s/g, '').toLowerCase() === String(q.answer).replace(/\s/g, '').toLowerCase()) correct++;
      } else if (q.type === 'ox') {
        const sel = panel.querySelector(`input[name="${name}"]:checked`);
        if (!sel) { allAnswered = false; return; }
        const userAns = sel.value === 'true';
        answers[q.id] = userAns;
        if (userAns === q.answer) correct++;
      } else if (q.type === 'multiple') {
        const sel = panel.querySelector(`input[name="${name}"]:checked`);
        if (!sel) { allAnswered = false; return; }
        const userAns = parseInt(sel.value);
        answers[q.id] = userAns;
        if (userAns === q.answer) correct++;
      }
    });

    if (!allAnswered) {
      App.showToast('모든 문항에 답해주세요.', 'warning');
      return;
    }

    const score = Math.round((correct / questions.length) * 100);
    studentData.progress[missionKey].chapters[chapter.id].quizCompleted = true;
    studentData.progress[missionKey].chapters[chapter.id].quizScore = score;
    studentData.progress[missionKey].chapters[chapter.id].quizAnswers = answers;
    studentData.progress[missionKey].chapters[chapter.id].quizCompletedAt = new Date().toISOString();
    Storage.saveStudentData(studentName, studentData);

    renderTabContent();
    const passed = score >= 70;
    App.showToast(`${passed ? '합격!' : '불합격'} ${score}점 (${correct}/${questions.length})`, passed ? 'success' : 'error');
  }

  // ═══════════════════════════════════════
  //  수학 미션 탭 (기본/심화) — 문제별 개별 답안
  // ═══════════════════════════════════════
  function renderMathTab(container, missionKey) {
    const mission = missions[missionKey];
    const mProg = studentData.progress[missionKey] || {};
    const submitted = !!mProg.missionSubmitted;
    const submittedAt = mProg.missionSubmittedAt || null;

    const label = missionKey === 'mathBasic' ? '기본' : '심화';
    const problems = Storage.getMathProblems(missionKey);

    // 문제별 답안 (객체: {1: "답1", 2: "답2"})
    const drafts = mProg.missionDrafts || {};
    const answers = mProg.missionAnswers || {};
    // 하위 호환: 기존 단일 답안이 있으면 1번 문제 답안으로
    if (!Object.keys(drafts).length && mProg.missionDraft) {
      drafts['1'] = mProg.missionDraft;
    }
    if (!Object.keys(answers).length && mProg.missionAnswer) {
      answers['1'] = mProg.missionAnswer;
    }

    // 헤더
    const headerCard = document.createElement('div');
    headerCard.className = 'math-problem-card';
    headerCard.innerHTML = `
      <div class="math-header">
        <h2>${mission.icon} 사전미션 (${label})</h2>
        <p>${mission.description}</p>
      </div>
    `;
    container.appendChild(headerCard);

    if (problems.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'math-problem-card';
      emptyCard.innerHTML = `<div class="math-problem-text">📌 ${label}수학 문제는 매니저가 등록 예정입니다.</div>`;
      container.appendChild(emptyCard);
      return;
    }

    if (submitted) {
      // 제출 완료 상태: 문제 + 답안 보기
      const badgeCard = document.createElement('div');
      badgeCard.className = 'math-answer-card';
      badgeCard.innerHTML = `
        <div class="math-submitted">
          <div class="math-submitted-badge">✅ 제출 완료 — 매니저에게 전달되었습니다</div>
          <div class="math-submitted-date num">${App.formatDate(submittedAt)}</div>
        </div>
      `;
      container.appendChild(badgeCard);

      problems.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'math-problem-card math-per-problem';
        card.innerHTML = `
          <div class="math-problem-body">
            <h3>문제 ${idx + 1}</h3>
            <div class="math-problem-text math-render">${App.renderMathHtml(p.text)}</div>
          </div>
          <div class="math-answer-view">
            <h3>제출한 답안</h3>
            <div class="math-answer-text math-render">${App.renderMathHtml(answers[String(p.id)] || answers[String(idx + 1)] || '(미작성)')}</div>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      // 작성 중 상태: 문제별 textarea
      problems.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'math-problem-card math-per-problem';
        const draftVal = drafts[String(p.id)] || drafts[String(idx + 1)] || '';
        card.innerHTML = `
          <div class="math-problem-body">
            <h3>문제 ${idx + 1}</h3>
            <div class="math-problem-text math-render">${App.renderMathHtml(p.text)}</div>
          </div>
          <div class="math-answer-input">
            <h3>답안 ${idx + 1}</h3>
            <textarea class="math-textarea math-per-answer" data-problem-id="${p.id}" placeholder="답안을 작성하세요...">${escapeHtml(draftVal)}</textarea>
          </div>
        `;
        container.appendChild(card);
      });

      // 액션 버튼
      const actionsCard = document.createElement('div');
      actionsCard.className = 'math-answer-card';
      actionsCard.innerHTML = `
        <div class="math-actions">
          <div class="math-actions-left">
            <button class="btn btn-outline math-save-btn" id="mathSaveBtn">💾 임시저장</button>
            <span class="math-save-status" id="mathSaveStatus"></span>
          </div>
          <button class="btn btn-accent math-submit-btn" id="mathSubmitBtn">🚀 최종 제출</button>
        </div>
      `;
      container.appendChild(actionsCard);

      // 임시저장
      document.getElementById('mathSaveBtn').addEventListener('click', () => {
        saveMathDrafts(missionKey);
        document.getElementById('mathSaveStatus').textContent = `저장됨 (${new Date().toLocaleTimeString()})`;
        App.showToast('임시저장 완료', 'success');
      });

      // 최종 제출
      document.getElementById('mathSubmitBtn').addEventListener('click', () => {
        const textareas = document.querySelectorAll('.math-per-answer');
        let allFilled = true;
        textareas.forEach(ta => {
          if (!ta.value.trim()) allFilled = false;
        });
        if (!allFilled) {
          App.showToast('모든 문제에 답안을 작성해주세요.', 'warning');
          return;
        }
        if (!confirm('최종 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다.')) return;

        const answersObj = {};
        const draftsObj = {};
        textareas.forEach(ta => {
          const pid = ta.dataset.problemId;
          answersObj[pid] = ta.value.trim();
          draftsObj[pid] = ta.value.trim();
        });

        if (!studentData.progress[missionKey]) studentData.progress[missionKey] = { chapters: {} };
        studentData.progress[missionKey].missionSubmitted = true;
        studentData.progress[missionKey].missionAnswers = answersObj;
        studentData.progress[missionKey].missionDrafts = draftsObj;
        studentData.progress[missionKey].missionSubmittedAt = new Date().toISOString();
        // 하위 호환용 단일 필드도 저장
        studentData.progress[missionKey].missionAnswer = Object.values(answersObj).join('\n---\n');
        studentData.progress[missionKey].missionDraft = Object.values(draftsObj).join('\n---\n');
        Storage.saveStudentData(studentName, studentData);
        renderTabContent();
        App.showToast('최종 제출 완료!', 'success');
      });

      // 자동 임시저장 (3초)
      let autoSaveTimer = null;
      document.querySelectorAll('.math-per-answer').forEach(ta => {
        ta.addEventListener('input', () => {
          if (autoSaveTimer) clearTimeout(autoSaveTimer);
          autoSaveTimer = setTimeout(() => {
            saveMathDrafts(missionKey);
            const statusEl = document.getElementById('mathSaveStatus');
            if (statusEl) statusEl.textContent = `자동저장 (${new Date().toLocaleTimeString()})`;
          }, 3000);
        });
      });
    }

    // KaTeX 렌더링
    requestAnimationFrame(() => {
      if (window.renderMathInElement) {
        container.querySelectorAll('.math-render').forEach(el => {
          renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        });
      }
    });
  }

  function saveMathDrafts(missionKey) {
    const textareas = document.querySelectorAll('.math-per-answer');
    const draftsObj = {};
    textareas.forEach(ta => {
      draftsObj[ta.dataset.problemId] = ta.value;
    });
    if (!studentData.progress[missionKey]) studentData.progress[missionKey] = { chapters: {} };
    studentData.progress[missionKey].missionDrafts = draftsObj;
    studentData.progress[missionKey].missionDraft = Object.values(draftsObj).join('\n---\n');
    Storage.saveStudentData(studentName, studentData);
  }

  // ── 유틸리티 ──
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatQuestionText(text) {
    // 코드 블록(\n) 줄바꿈 처리
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  // 초기 렌더링
  renderTabContent();
});
