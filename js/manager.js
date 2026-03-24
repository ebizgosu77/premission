/**
 * 매니저 대시보드 — 사이드바 + 4개 페이지
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Storage.init();
  const session = App.requireAuth('manager');
  if (!session) return;

  const missions = getMissionData();
  let activePage = 'overview';

  // 기수명 표시
  document.getElementById('sidebarCohort').textContent = Storage.getCohortName();

  // Firebase 실시간 동기화 시 UI 갱신
  Storage.onDataChange(() => {
    document.getElementById('sidebarCohort').textContent = Storage.getCohortName();
    renderPage();
  });

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', App.logout);
  document.getElementById('mobileLogoutBtn').addEventListener('click', App.logout);

  // 모바일 햄버거
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // 사이드바 클릭 시 모바일에서 닫기
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open') && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
      sidebar.classList.remove('open');
    }
  });

  // 사이드바 내비게이션
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      activePage = btn.dataset.page;
      document.querySelectorAll('.sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.page === activePage));
      document.getElementById('sidebar').classList.remove('open');
      renderPage();
    });
  });

  // 모달 닫기
  document.getElementById('detailModalClose').addEventListener('click', () => {
    App.closeModal(document.getElementById('detailModal'));
  });

  renderPage();

  // ══════════════════════════════════════════
  //  페이지 라우터
  // ══════════════════════════════════════════
  function renderPage() {
    const main = document.getElementById('mainContent');
    main.innerHTML = '';
    main.scrollTop = 0;

    switch (activePage) {
      case 'overview': renderOverview(main); break;
      case 'problems': renderProblems(main); break;
      case 'settings': renderSettings(main); break;
    }
  }

  // ══════════════════════════════════════════
  //  전체 현황
  // ══════════════════════════════════════════
  function renderOverview(container) {
    const students = Storage.getAllStudents();
    const names = Object.keys(students);

    // 통계 계산
    const stats = calcOverviewStats(students, names);

    container.innerHTML = `
      <div class="mgr-page-header">
        <h1>📊 전체 현황</h1>
        <button class="btn btn-sm btn-outline" id="refreshBtn">🔄 새로고침</button>
      </div>

      <div class="mgr-stats-row">
        <div class="mgr-stat-card">
          <div class="mgr-stat-icon">👥</div>
          <div class="mgr-stat-info">
            <div class="mgr-stat-value num">${names.length}</div>
            <div class="mgr-stat-label">총 수강생</div>
          </div>
        </div>
        <div class="mgr-stat-card">
          <div class="mgr-stat-icon">🐍</div>
          <div class="mgr-stat-info">
            <div class="mgr-stat-value num">${stats.pythonQuizRate}%</div>
            <div class="mgr-stat-label">Python 퀴즈 완료율</div>
          </div>
        </div>
        <div class="mgr-stat-card">
          <div class="mgr-stat-icon">🔀</div>
          <div class="mgr-stat-info">
            <div class="mgr-stat-value num">${stats.gitWatchRate}%</div>
            <div class="mgr-stat-label">Git 강의 완료율</div>
          </div>
        </div>
        <div class="mgr-stat-card">
          <div class="mgr-stat-icon">📐</div>
          <div class="mgr-stat-info">
            <div class="mgr-stat-value num">${stats.mathSubmitRate}%</div>
            <div class="mgr-stat-label">수학 문제 제출률</div>
          </div>
        </div>
      </div>

      <div class="mgr-table-section">
        <div class="mgr-table-header">
          <h2>수강생 현황</h2>
          <span class="mgr-table-count num">${names.length}명</span>
        </div>
        <div class="mgr-table-wrap">
          <table class="mgr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>이름</th>
                <th>Python</th>
                <th>Git</th>
                <th>수학(기본)</th>
                <th>기본 점수</th>
                <th>수학(심화)</th>
                <th>심화 점수</th>
                <th>종합</th>
                <th>마지막 접속</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody id="overviewTableBody"></tbody>
          </table>
        </div>
      </div>
    `;

    // 테이블 렌더링
    renderOverviewTable(names, students);

    document.getElementById('refreshBtn').addEventListener('click', () => {
      renderPage();
      App.showToast('새로고침 완료', 'info');
    });
  }

  function calcOverviewStats(students, names) {
    if (names.length === 0) return { pythonQuizRate: 0, gitWatchRate: 0, mathSubmitRate: 0 };

    let pyQuizTotal = 0, pyQuizDone = 0;
    let gitChTotal = 0, gitChDone = 0;
    let mathPossible = 0, mathSubmitted = 0;

    const pyChapters = missions.python.chapters;
    const gitChapters = missions.git.chapters;

    names.forEach(name => {
      const data = students[name];

      // Python 퀴즈 완료율 (챕터별)
      pyChapters.forEach(ch => {
        const hasQuiz = ch.quiz?.length > 0 && ch.quiz[0].type !== 'placeholder';
        if (hasQuiz) {
          pyQuizTotal++;
          const cp = data.progress?.python?.chapters?.[ch.id];
          if (cp?.quizCompleted) pyQuizDone++;
        }
      });

      // Git 수강 완료율
      gitChapters.forEach(ch => {
        gitChTotal++;
        const cp = data.progress?.git?.chapters?.[ch.id];
        if (cp?.watched) gitChDone++;
      });

      // 수학 제출률 (기본 + 심화 = 2 per student)
      ['mathBasic', 'mathAdv'].forEach(key => {
        mathPossible++;
        if (data.progress?.[key]?.missionSubmitted) mathSubmitted++;
      });
    });

    return {
      pythonQuizRate: pyQuizTotal ? Math.round((pyQuizDone / pyQuizTotal) * 100) : 0,
      gitWatchRate: gitChTotal ? Math.round((gitChDone / gitChTotal) * 100) : 0,
      mathSubmitRate: mathPossible ? Math.round((mathSubmitted / mathPossible) * 100) : 0
    };
  }

  function renderOverviewTable(names, students) {
    const tbody = document.getElementById('overviewTableBody');
    if (!tbody) return;

    if (names.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="empty-msg">등록된 수강생이 없습니다.</td></tr>';
      return;
    }

    // 학생별 진행률 계산
    const rows = names.map(name => {
      const data = students[name];
      return {
        name,
        data,
        python: calcMissionPercent(data, 'python'),
        git: calcMissionPercent(data, 'git'),
        mathBasic: calcMathPercent(data, 'mathBasic'),
        mathAdv: calcMathPercent(data, 'mathAdv'),
        mathBasicScore: data.progress?.mathBasic?.totalScore,
        mathAdvScore: data.progress?.mathAdv?.totalScore,
        overall: App.calcProgress(data).overall
      };
    });

    // 종합 진행률 낮은 순 정렬
    rows.sort((a, b) => a.overall - b.overall);

    rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="num">${idx + 1}</td>
        <td><button class="name-link" data-name="${row.name}">${row.name}</button></td>
        <td>${percentCell(row.python)}</td>
        <td>${percentCell(row.git)}</td>
        <td>${percentCell(row.mathBasic)}</td>
        <td>${scoreCell(row.mathBasicScore)}</td>
        <td>${percentCell(row.mathAdv)}</td>
        <td>${scoreCell(row.mathAdvScore)}</td>
        <td>${percentCell(row.overall)}</td>
        <td class="date-cell">${App.formatDate(row.data.lastLogin)}</td>
        <td><button class="btn btn-sm btn-danger mgr-delete-student" data-name="${row.name}" title="수강생 삭제">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    // 이름 클릭 → 상세 모달
    tbody.querySelectorAll('.name-link').forEach(btn => {
      btn.addEventListener('click', () => openDetailModal(btn.dataset.name));
    });

    // 수강생 삭제
    tbody.querySelectorAll('.mgr-delete-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        if (!window.confirm(`"${name}" 수강생을 삭제하시겠습니까?\n모든 학습 데이터가 삭제됩니다.`)) return;
        Storage.deleteStudent(name);
        App.showToast(`${name} 수강생이 삭제되었습니다.`, 'success');
        renderPage();
      });
    });
  }

  // 미션별 % 계산 (Python/Git)
  function calcMissionPercent(data, missionKey) {
    const mission = missions[missionKey];
    if (!mission || !data.progress?.[missionKey]) return 0;
    const mProg = data.progress[missionKey];

    const chapters = mission.chapters;
    let total = 0, done = 0;

    chapters.forEach(ch => {
      const cp = mProg.chapters?.[ch.id];
      const hasQuiz = ch.quiz?.length > 0 && ch.quiz[0].type !== 'placeholder';

      // 수강 가중치 1
      total++;
      if (cp?.watched) done++;

      // 퀴즈 가중치 1 (있는 경우)
      if (hasQuiz) {
        total++;
        if (cp?.quizCompleted && cp.quizScore >= 70) done++;
      }
    });

    return total ? Math.round((done / total) * 100) : 0;
  }

  // 수학 미션 % (제출 여부)
  function calcMathPercent(data, key) {
    if (data.progress?.[key]?.missionSubmitted) return 100;
    if (data.progress?.[key]?.missionDraft) return 30; // 임시저장 상태
    return 0;
  }

  // 색상 코딩 셀
  function percentCell(pct) {
    let cls = 'pct-red';
    if (pct === 100) cls = 'pct-green';
    else if (pct >= 50) cls = 'pct-yellow';
    else if (pct >= 1) cls = 'pct-orange';
    return `<span class="pct-cell ${cls} num">${pct}%</span>`;
  }

  function scoreCell(score) {
    if (typeof score !== 'number') return `<span class="score-cell score-none">-</span>`;
    let cls = 'score-low';
    if (score >= 80) cls = 'score-high';
    else if (score >= 50) cls = 'score-mid';
    return `<span class="score-cell ${cls} num">${score}점</span>`;
  }

  // ══════════════════════════════════════════
  //  개인 상세 모달
  // ══════════════════════════════════════════
  function openDetailModal(name) {
    const data = Storage.getStudentData(name);
    if (!data) return;

    const prog = App.calcProgress(data);
    const modal = document.getElementById('detailModal');
    document.getElementById('detailModalTitle').textContent = `${name} — 상세 현황`;

    const body = document.getElementById('detailModalBody');
    let html = '';

    // 종합 진행률
    html += `
      <div class="detail-overall">
        <span>종합 진행률</span>
        <div class="detail-overall-bar">
          <div class="detail-overall-fill" style="width:${prog.overall}%"></div>
        </div>
        <span class="num detail-overall-pct">${prog.overall}%</span>
      </div>
    `;

    // Python
    html += `<div class="detail-section">`;
    html += `<h3>🐍 Python 기초</h3>`;
    missions.python.chapters.forEach((ch, idx) => {
      const cp = data.progress?.python?.chapters?.[ch.id] || {};
      const hasQuiz = ch.quiz?.length > 0 && ch.quiz[0].type !== 'placeholder';

      html += `<div class="detail-chapter-row">`;
      html += `<div class="detail-ch-main">`;
      html += `<span class="detail-ch-status">${cp.watched ? '✅' : '⬜'}</span>`;
      html += `<span>Ch.${idx + 1} ${ch.title}</span>`;
      html += `<span class="detail-date">${cp.watched ? App.formatDate(cp.watchedAt) : ''}</span>`;
      html += `</div>`;

      if (hasQuiz) {
        if (cp.quizCompleted) {
          const passed = cp.quizScore >= 70;
          html += `<div class="detail-quiz-row ${passed ? 'passed' : 'failed'}">`;
          html += `<span class="num">퀴즈 ${cp.quizScore}점 ${passed ? '✅' : '❌'}</span>`;
          html += `<span class="detail-date">${App.formatDate(cp.quizCompletedAt)}</span>`;
          html += `</div>`;

          // 퀴즈 답안 상세
          html += `<div class="detail-quiz-answers">`;
          ch.quiz.forEach((q, qi) => {
            const userAns = cp.quizAnswers?.[q.id];
            let isCorrect = false;
            let userAnsText = '', correctAnsText = '';

            if (q.type === 'multiple') {
              isCorrect = userAns === q.answer;
              userAnsText = q.options[userAns] ?? '-';
              correctAnsText = q.options[q.answer];
            } else if (q.type === 'ox') {
              isCorrect = userAns === q.answer;
              userAnsText = userAns === true ? 'O' : userAns === false ? 'X' : '-';
              correctAnsText = q.answer ? 'O' : 'X';
            } else if (q.type === 'short') {
              isCorrect = String(userAns || '').replace(/\s/g, '').toLowerCase() === String(q.answer).replace(/\s/g, '').toLowerCase();
              userAnsText = userAns || '-';
              correctAnsText = q.answer;
            }

            html += `
              <div class="detail-qa ${isCorrect ? 'correct' : 'wrong'}">
                <span class="detail-qa-q">Q${qi + 1}. ${escHtml(q.question)}</span>
                <span class="detail-qa-a">답: ${escHtml(String(userAnsText))} ${isCorrect ? '✅' : `❌ (정답: ${escHtml(String(correctAnsText))})`}</span>
              </div>
            `;
          });
          html += `</div>`;
        } else {
          html += `<div class="detail-quiz-row pending"><span>퀴즈 미응시</span></div>`;
        }
      }

      html += `</div>`;
    });
    html += `</div>`;

    // Git
    html += `<div class="detail-section">`;
    html += `<h3>🔀 Git & GitHub</h3>`;
    missions.git.chapters.forEach((ch, idx) => {
      const cp = data.progress?.git?.chapters?.[ch.id] || {};
      html += `
        <div class="detail-chapter-row">
          <div class="detail-ch-main">
            <span class="detail-ch-status">${cp.watched ? '✅' : '⬜'}</span>
            <span>Ch.${idx + 1} ${ch.title}</span>
            <span class="detail-date">${cp.watched ? App.formatDate(cp.watchedAt) : ''}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    // 수학(기본)
    html += renderMathDetail(data, 'mathBasic', '📐 기본수학');

    // 수학(심화)
    html += renderMathDetail(data, 'mathAdv', '📊 심화수학');

    body.innerHTML = html;
    App.openModal(modal);

    // 모범답안 textContent 설정 (HTML 이스케이프 충돌 방지)
    body.querySelectorAll('.detail-model-content').forEach(el => {
      const raw = el.dataset.raw;
      if (raw) el.textContent = App.fixChatGPTLatex(raw);
    });

    // KaTeX 수식 렌더링
    if (window.renderMathInElement) {
      body.querySelectorAll('.detail-math-q, .detail-model-answer, .detail-math-answer').forEach(el => {
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

    // 채점 저장 버튼 이벤트
    body.querySelectorAll('.detail-save-scores-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mKey = btn.dataset.key;
        const sName = btn.dataset.name;
        const section = btn.closest('.detail-section');
        const inputs = section.querySelectorAll('.detail-score-input');
        const studentData = Storage.getStudentData(sName);
        if (!studentData) return;

        if (!studentData.progress[mKey].scores) studentData.progress[mKey].scores = {};

        let total = 0, count = 0;
        inputs.forEach(input => {
          const pid = input.dataset.problemId;
          const val = input.value.trim();
          if (val !== '') {
            const score = Math.max(0, Math.min(100, parseInt(val) || 0));
            studentData.progress[mKey].scores[pid] = score;
            total += score;
            count++;
          } else {
            delete studentData.progress[mKey].scores[pid];
          }
        });

        studentData.progress[mKey].totalScore = count > 0 ? Math.round(total / count) : null;
        Storage.saveStudentData(sName, studentData);

        const status = section.querySelector('.detail-score-status');
        if (status) status.textContent = `저장 완료 (${new Date().toLocaleTimeString()})`;
        App.showToast('채점이 저장되었습니다.', 'success');
      });
    });
  }

  function renderMathDetail(data, key, title) {
    const mProg = data.progress?.[key] || {};
    const problems = Storage.getMathProblems(key);
    const answers = mProg.missionAnswers || {};
    const drafts = mProg.missionDrafts || {};
    const submittedAttachments = mProg.missionSubmittedAttachments || {};
    const scores = mProg.scores || {};
    const totalScore = mProg.totalScore;

    let html = `<div class="detail-section" data-math-key="${key}" data-student-name="${escHtml(data.name)}">`;
    html += `<h3>${title}`;
    if (typeof totalScore === 'number') {
      html += ` <span class="detail-total-score num">${totalScore}점</span>`;
    }
    html += `</h3>`;

    // 상태 배지
    if (mProg.missionSubmitted) {
      html += `<div class="detail-math-badge">✅ 제출 완료 <span class="detail-date">${App.formatDate(mProg.missionSubmittedAt)}</span></div>`;
    } else if (mProg.missionDraft || Object.keys(drafts).length > 0) {
      html += `<div class="detail-math-badge draft">📝 임시저장 (미제출)</div>`;
    } else {
      html += `<div class="detail-math-badge draft">⬜ 미작성</div>`;
    }

    // 문제별 표시 + 채점 (상태 무관)
    if (problems.length > 0) {
      const attachments = mProg.missionAttachments || {};

      problems.forEach((p, idx) => {
        const pid = String(p.id);
        const ans = answers[pid] || answers[String(idx + 1)] || '';
        const dft = drafts[pid] || drafts[String(idx + 1)] || '';
        const filesSubmitted = submittedAttachments[pid] || submittedAttachments[String(idx + 1)] || [];
        const filesDraft = attachments[pid] || attachments[String(idx + 1)] || [];
        const files = filesSubmitted.length > 0 ? filesSubmitted : filesDraft;
        const answerText = ans || dft || '';
        const score = scores[pid];

        html += `<div class="detail-math-per-problem">`;
        html += `<div class="detail-math-q">문제 ${idx + 1}: ${App.renderMathHtml(p.text)}</div>`;

        // 모범답안
        if (p.answer) {
          html += `<div class="detail-model-answer"><span class="detail-model-label">모범답안:</span> <span class="detail-model-content" data-raw="${escHtml(p.answer)}" style="white-space:pre-wrap"></span></div>`;
        }

        // 학생 답안
        html += `<div class="detail-student-answer-label">학생 답안:</div>`;
        if (answerText) {
          html += `<div class="detail-math-answer">${escHtml(answerText)}</div>`;
        } else {
          html += `<div class="detail-math-answer"><em>미작성</em></div>`;
        }

        // 첨부 이미지 표시
        if (files.length > 0) {
          html += `<div class="detail-attach-list">`;
          files.forEach(f => {
            html += `<div class="detail-attach-item"><img src="${f.data}" alt="${escHtml(f.name)}" class="detail-attach-img" onclick="this.classList.toggle('expanded')"></div>`;
          });
          html += `</div>`;
        }

        // 채점 입력
        html += `<div class="detail-score-row">`;
        html += `<label>점수:</label>`;
        html += `<input type="number" class="detail-score-input" data-problem-id="${pid}" value="${typeof score === 'number' ? score : ''}" min="0" max="100" placeholder="미채점">`;
        html += `<span class="detail-score-unit">점</span>`;
        html += `</div>`;

        html += `</div>`;
      });

      // 채점 저장 버튼
      html += `<div class="detail-score-actions">`;
      html += `<button class="btn btn-accent detail-save-scores-btn" data-key="${key}" data-name="${escHtml(data.name)}">💾 채점 저장</button>`;
      html += `<span class="detail-score-status"></span>`;
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  // ══════════════════════════════════════════
  //  문제 관리
  // ══════════════════════════════════════════
  function renderProblems(container) {
    container.innerHTML = `
      <div class="mgr-page-header">
        <h1>📝 문제 관리</h1>
        <span class="mgr-problem-global-hint">수학기호: $x^2$, \\\\frac{a}{b}, \\\\sqrt{x} 등 LaTeX 문법 또는 한글(HWP)에서 복사한 수식을 그대로 붙여넣을 수 있습니다.</span>
      </div>

      <div class="mgr-problem-card">
        <div class="mgr-problem-header">
          <h2>📐 기본수학 문제</h2>
          <span class="mgr-problem-hint">문제별로 개별 입력하세요. 미리보기에서 수학기호를 확인할 수 있습니다.</span>
        </div>
        <div id="mathBasicList" class="mgr-problem-list"></div>
        <button class="btn btn-outline mgr-add-problem-btn" id="addBasicBtn">+ 문제 추가</button>
        <div class="mgr-problem-actions">
          <button class="btn btn-accent" id="saveBasicBtn">💾 전체 저장</button>
          <span class="mgr-save-status" id="saveBasicStatus"></span>
        </div>
      </div>

      <div class="mgr-problem-card">
        <div class="mgr-problem-header">
          <h2>📊 심화수학 문제</h2>
          <span class="mgr-problem-hint">문제별로 개별 입력하세요. 미리보기에서 수학기호를 확인할 수 있습니다.</span>
        </div>
        <div id="mathAdvList" class="mgr-problem-list"></div>
        <button class="btn btn-outline mgr-add-problem-btn" id="addAdvBtn">+ 문제 추가</button>
        <div class="mgr-problem-actions">
          <button class="btn btn-accent" id="saveAdvBtn">💾 전체 저장</button>
          <span class="mgr-save-status" id="saveAdvStatus"></span>
        </div>
      </div>
    `;

    // 기존 데이터 로드
    renderProblemItems('mathBasic');
    renderProblemItems('mathAdv');

    // 문제 추가 버튼
    document.getElementById('addBasicBtn').addEventListener('click', () => addProblemItem('mathBasic'));
    document.getElementById('addAdvBtn').addEventListener('click', () => addProblemItem('mathAdv'));

    // 저장 버튼
    document.getElementById('saveBasicBtn').addEventListener('click', () => {
      saveProblemItems('mathBasic');
      document.getElementById('saveBasicStatus').textContent = `저장 완료 (${new Date().toLocaleTimeString()})`;
      App.showToast('기본수학 문제가 저장되었습니다.', 'success');
    });

    document.getElementById('saveAdvBtn').addEventListener('click', () => {
      saveProblemItems('mathAdv');
      document.getElementById('saveAdvStatus').textContent = `저장 완료 (${new Date().toLocaleTimeString()})`;
      App.showToast('심화수학 문제가 저장되었습니다.', 'success');
    });
  }

  function renderProblemItems(key) {
    const listEl = document.getElementById(key === 'mathBasic' ? 'mathBasicList' : 'mathAdvList');
    const problems = Storage.getMathProblems(key);
    listEl.innerHTML = '';

    if (problems.length === 0) {
      addProblemItem(key);
      return;
    }

    problems.forEach((p, idx) => {
      appendProblemRow(listEl, key, idx + 1, p.text, p.answer || '');
    });
  }

  function addProblemItem(key) {
    const listEl = document.getElementById(key === 'mathBasic' ? 'mathBasicList' : 'mathAdvList');
    const count = listEl.querySelectorAll('.mgr-problem-item').length;
    appendProblemRow(listEl, key, count + 1, '', '');
  }

  function appendProblemRow(listEl, key, num, text, answer) {
    const item = document.createElement('div');
    item.className = 'mgr-problem-item';
    item.innerHTML = `
      <div class="mgr-problem-item-header">
        <span class="mgr-problem-num">문제 ${num}</span>
        <button class="btn btn-sm btn-outline mgr-preview-btn" title="미리보기 토글">👁 미리보기</button>
        <button class="btn btn-sm btn-danger mgr-remove-problem-btn" title="삭제">✕</button>
      </div>
      <textarea class="mgr-problem-textarea mgr-problem-input" placeholder="문제를 입력하세요...&#10;&#10;수학기호 예시: $x^2 + y^2 = r^2$, $\\frac{dy}{dx}$, $\\sum_{i=1}^{n} x_i$&#10;한글(HWP) 수식도 그대로 붙여넣기 가능합니다.">${escHtml(text)}</textarea>
      <div class="mgr-answer-header">
        <span class="mgr-answer-label">모범답안</span>
        <button class="btn btn-sm btn-outline mgr-answer-preview-btn" title="모범답안 미리보기">👁 미리보기</button>
      </div>
      <textarea class="mgr-problem-textarea mgr-answer-input" placeholder="모범답안을 입력하세요...">${escHtml(answer)}</textarea>
      <div class="mgr-answer-preview" style="display:none;"></div>
      <div class="mgr-problem-preview" style="display:none;"></div>
    `;
    listEl.appendChild(item);

    // 미리보기 토글
    item.querySelector('.mgr-preview-btn').addEventListener('click', () => {
      const previewEl = item.querySelector('.mgr-problem-preview');
      const textarea = item.querySelector('.mgr-problem-input');
      const answerArea = item.querySelector('.mgr-answer-input');
      if (previewEl.style.display === 'none') {
        previewEl.style.display = 'block';
        previewEl.innerHTML = '';
        // 문제 미리보기
        const qDiv = document.createElement('div');
        qDiv.className = 'mgr-preview-section';
        qDiv.innerHTML = `<strong>문제:</strong><br>${renderMathText(textarea.value)}`;
        previewEl.appendChild(qDiv);
        // 모범답안 미리보기 (textContent로 HTML 충돌 방지)
        if (answerArea.value.trim()) {
          const aDiv = document.createElement('div');
          aDiv.className = 'mgr-preview-section mgr-preview-answer';
          aDiv.innerHTML = '<strong>모범답안:</strong><br>';
          const aContent = document.createElement('span');
          aContent.textContent = App.fixChatGPTLatex(answerArea.value);
          aContent.style.whiteSpace = 'pre-wrap';
          aDiv.appendChild(aContent);
          previewEl.appendChild(aDiv);
        }
        if (window.renderMathInElement) {
          renderMathInElement(previewEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        }
      } else {
        previewEl.style.display = 'none';
      }
    });

    // 모범답안 미리보기 (textContent + KaTeX 직접 렌더링)
    item.querySelector('.mgr-answer-preview-btn').addEventListener('click', () => {
      const previewEl = item.querySelector('.mgr-answer-preview');
      const answerArea = item.querySelector('.mgr-answer-input');
      if (previewEl.style.display === 'none') {
        previewEl.style.display = 'block';
        const val = answerArea.value.trim();
        if (!val) {
          previewEl.innerHTML = '<em>모범답안이 비어있습니다.</em>';
          return;
        }
        // ChatGPT 보정 후 textContent로 설정 (HTML 이스케이프 충돌 방지)
        previewEl.textContent = App.fixChatGPTLatex(val);
        previewEl.style.whiteSpace = 'pre-wrap';
        if (window.renderMathInElement) {
          renderMathInElement(previewEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        }
      } else {
        previewEl.style.display = 'none';
      }
    });

    // 삭제 버튼
    item.querySelector('.mgr-remove-problem-btn').addEventListener('click', () => {
      if (listEl.querySelectorAll('.mgr-problem-item').length <= 1) {
        App.showToast('최소 1개의 문제가 필요합니다.', 'warning');
        return;
      }
      item.remove();
      renumberProblems(listEl);
    });
  }

  function renumberProblems(listEl) {
    listEl.querySelectorAll('.mgr-problem-item').forEach((item, idx) => {
      item.querySelector('.mgr-problem-num').textContent = `문제 ${idx + 1}`;
    });
  }

  function saveProblemItems(key) {
    const listEl = document.getElementById(key === 'mathBasic' ? 'mathBasicList' : 'mathAdvList');
    const items = listEl.querySelectorAll('.mgr-problem-item');
    const problems = [];
    items.forEach((item, idx) => {
      const text = item.querySelector('.mgr-problem-input').value.trim();
      const answer = item.querySelector('.mgr-answer-input').value.trim();
      if (text) {
        problems.push({ id: idx + 1, text, answer });
      }
    });
    Storage.saveMathProblems(key, problems);
  }

  function renderMathText(text) {
    if (!text) return '';
    return App.renderMathHtml(text);
  }

  // ══════════════════════════════════════════
  //  설정
  // ══════════════════════════════════════════
  function renderSettings(container) {
    container.innerHTML = `
      <div class="mgr-page-header">
        <h1>⚙️ 설정</h1>
      </div>

      <div class="mgr-settings-card">
        <h2>🔑 비밀번호 변경</h2>
        <div class="settings-form">
          <div class="settings-field">
            <label>현재 비밀번호</label>
            <input type="password" id="currentPw" placeholder="현재 비밀번호">
          </div>
          <div class="settings-field">
            <label>새 비밀번호</label>
            <input type="password" id="newPw" placeholder="새 비밀번호">
          </div>
          <div class="settings-field">
            <label>새 비밀번호 확인</label>
            <input type="password" id="confirmPw" placeholder="새 비밀번호 확인">
          </div>
          <button class="btn btn-accent" id="changePwBtn">비밀번호 변경</button>
        </div>
      </div>

      <div class="mgr-settings-card">
        <h2>🏷️ 기수명 변경</h2>
        <div class="settings-form settings-inline">
          <div class="settings-field">
            <label>기수명</label>
            <input type="text" id="cohortInput" value="${escHtml(Storage.getCohortName())}" placeholder="예: 1기, 2기">
          </div>
          <button class="btn btn-accent" id="changeCohortBtn">저장</button>
        </div>
      </div>

      <div class="mgr-settings-card danger-card">
        <h2>⚠️ 전체 데이터 초기화</h2>
        <p>모든 수강생 데이터, 문제, 설정이 영구 삭제됩니다.</p>
        <button class="btn btn-danger" id="resetAllBtn">전체 데이터 초기화</button>
      </div>
    `;

    // 비밀번호 변경
    document.getElementById('changePwBtn').addEventListener('click', () => {
      const current = document.getElementById('currentPw').value;
      const newPw = document.getElementById('newPw').value;
      const confirmPw = document.getElementById('confirmPw').value;

      if (!Storage.validateManager(current)) {
        App.showToast('현재 비밀번호가 올바르지 않습니다.', 'error');
        return;
      }
      if (!newPw || newPw.length < 4) {
        App.showToast('새 비밀번호는 4자 이상이어야 합니다.', 'warning');
        return;
      }
      if (newPw !== confirmPw) {
        App.showToast('새 비밀번호가 일치하지 않습니다.', 'error');
        return;
      }

      Storage.setManagerPassword(newPw);
      App.showToast('비밀번호가 변경되었습니다.', 'success');
      document.getElementById('currentPw').value = '';
      document.getElementById('newPw').value = '';
      document.getElementById('confirmPw').value = '';
    });

    // 기수명 변경
    document.getElementById('changeCohortBtn').addEventListener('click', () => {
      const val = document.getElementById('cohortInput').value.trim();
      if (!val) {
        App.showToast('기수명을 입력하세요.', 'warning');
        return;
      }
      Storage.setCohortName(val);
      document.getElementById('sidebarCohort').textContent = val;
      App.showToast('기수명이 변경되었습니다.', 'success');
    });

    // 전체 초기화 — 2단계 확인
    document.getElementById('resetAllBtn').addEventListener('click', () => {
      if (!window.confirm('⚠️ 1단계 확인\n\n모든 수강생 데이터와 설정을 삭제하시겠습니까?')) return;
      if (!window.confirm('⚠️ 2단계 최종 확인\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 데이터를 삭제하시겠습니까?')) return;

      Storage.clearAllData();
      Storage.setSession('manager', 'admin');
      App.showToast('모든 데이터가 초기화되었습니다.', 'success');
      document.getElementById('sidebarCohort').textContent = Storage.getCohortName();
      renderPage();
    });
  }

  // ── 유틸 ──
  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
