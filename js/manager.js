/**
 * 매니저 대시보드 — 사이드바 + 전체현황/설정
 * 과정·기수 필터링 지원
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Storage.init();
  const session = App.requireAuth('manager');
  if (!session) return;

  const missions = getMissionData();
  let activePage = 'overview';

  // 필터 상태
  const filter = { courseId: 'all', cohortId: 'all' };

  // Firebase 실시간 동기화
  Storage.onDataChange(() => { renderPage(); });

  document.getElementById('logoutBtn').addEventListener('click', App.logout);
  document.getElementById('mobileLogoutBtn').addEventListener('click', App.logout);

  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open') && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
      sidebar.classList.remove('open');
    }
  });

  document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      activePage = btn.dataset.page;
      document.querySelectorAll('.sidebar-item').forEach(b => b.classList.toggle('active', b.dataset.page === activePage));
      document.getElementById('sidebar').classList.remove('open');
      renderPage();
    });
  });

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
      case 'settings': renderSettings(main); break;
    }
  }

  // ══════════════════════════════════════════
  //  전체 현황
  // ══════════════════════════════════════════
  function renderOverview(container) {
    const rows = Storage.getFlatStudents(filter);

    container.innerHTML = `
      <div class="mgr-page-header">
        <h1>📊 전체 현황</h1>
        <button class="btn btn-sm btn-outline" id="refreshBtn">🔄 새로고침</button>
      </div>

      <div class="mgr-filter-bar">
        <label>과정</label>
        <select id="filterCourse">
          <option value="all">전체 과정</option>
          ${COURSES.map(c => `<option value="${c.id}" ${filter.courseId === c.id ? 'selected' : ''}>${c.icon} ${c.title}</option>`).join('')}
        </select>
        <label>기수</label>
        <select id="filterCohort">
          <option value="all">전체 기수</option>
          ${COHORTS.map(c => `<option value="${c.id}" ${filter.cohortId === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
        <span class="mgr-filter-chip">${filterLabel()}</span>
      </div>

      <div class="mgr-stats-row" id="statsRow"></div>

      <div class="mgr-table-section">
        <div class="mgr-table-header">
          <h2>수강생 현황</h2>
          <span class="mgr-table-count num">${rows.length}명</span>
        </div>
        <div class="mgr-table-wrap">
          <table class="mgr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>이름</th>
                <th>과정</th>
                <th>기수</th>
                <th>Python</th>
                <th>Git</th>
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

    renderStatsRow(rows);
    renderOverviewTable(rows);

    document.getElementById('refreshBtn').addEventListener('click', () => {
      renderPage();
      App.showToast('새로고침 완료', 'info');
    });
    document.getElementById('filterCourse').addEventListener('change', (e) => {
      filter.courseId = e.target.value;
      renderPage();
    });
    document.getElementById('filterCohort').addEventListener('change', (e) => {
      filter.cohortId = e.target.value;
      renderPage();
    });
  }

  function filterLabel() {
    const c = filter.courseId === 'all' ? '전체 과정' : (getCourseById(filter.courseId)?.short || filter.courseId);
    const k = filter.cohortId === 'all' ? '전체 기수' : (getCohortById(filter.cohortId)?.label || filter.cohortId);
    return `${c} · ${k}`;
  }

  function renderStatsRow(rows) {
    const statsRow = document.getElementById('statsRow');
    const total = rows.length;
    let pyQuizDone = 0, pyQuizTotal = 0;
    let gitQuizDone = 0, gitQuizTotal = 0;
    let overallSum = 0;

    rows.forEach(({ data }) => {
      missions.python.chapters.forEach(ch => {
        if (ch.quiz?.length) {
          pyQuizTotal++;
          const cp = data.progress?.python?.chapters?.[ch.id];
          if (cp?.quizCompleted) pyQuizDone++;
        }
      });
      missions.git.chapters.forEach(ch => {
        if (ch.quiz?.length) {
          gitQuizTotal++;
          const cp = data.progress?.git?.chapters?.[ch.id];
          if (cp?.quizCompleted) gitQuizDone++;
        }
      });
      overallSum += App.calcProgress(data).overall;
    });

    const pyRate = pyQuizTotal ? Math.round((pyQuizDone / pyQuizTotal) * 100) : 0;
    const gitRate = gitQuizTotal ? Math.round((gitQuizDone / gitQuizTotal) * 100) : 0;
    const avg = total ? Math.round(overallSum / total) : 0;

    statsRow.innerHTML = `
      <div class="mgr-stat-card">
        <div class="mgr-stat-icon">👥</div>
        <div>
          <div class="mgr-stat-value num">${total}</div>
          <div class="mgr-stat-label">수강생 수</div>
        </div>
      </div>
      <div class="mgr-stat-card">
        <div class="mgr-stat-icon">🐍</div>
        <div>
          <div class="mgr-stat-value num">${pyRate}%</div>
          <div class="mgr-stat-label">Python 퀴즈 응시률</div>
        </div>
      </div>
      <div class="mgr-stat-card">
        <div class="mgr-stat-icon">🔀</div>
        <div>
          <div class="mgr-stat-value num">${gitRate}%</div>
          <div class="mgr-stat-label">Git 퀴즈 응시률</div>
        </div>
      </div>
      <div class="mgr-stat-card">
        <div class="mgr-stat-icon">📈</div>
        <div>
          <div class="mgr-stat-value num">${avg}%</div>
          <div class="mgr-stat-label">평균 진행률</div>
        </div>
      </div>
    `;
  }

  function renderOverviewTable(rows) {
    const tbody = document.getElementById('overviewTableBody');
    if (!tbody) return;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-msg">조건에 해당하는 수강생이 없습니다.</td></tr>';
      return;
    }

    const enriched = rows.map(r => ({
      ...r,
      python: calcMissionPercent(r.data, 'python'),
      git:    calcMissionPercent(r.data, 'git'),
      overall: App.calcProgress(r.data).overall
    }));

    enriched.sort((a, b) => a.overall - b.overall);

    tbody.innerHTML = '';
    enriched.forEach((row, idx) => {
      const course = getCourseById(row.courseId);
      const cohort = getCohortById(row.cohortId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="num">${idx + 1}</td>
        <td><button class="name-link" data-name="${App.escapeHtml(row.name)}" data-course="${row.courseId}" data-cohort="${row.cohortId}">${App.escapeHtml(row.name)}</button></td>
        <td><span class="course-chip ${row.courseId}">${course ? course.icon + ' ' + course.short : row.courseId}</span></td>
        <td><span class="cohort-chip num">${cohort ? cohort.label : row.cohortId + '기'}</span></td>
        <td>${percentCell(row.python)}</td>
        <td>${percentCell(row.git)}</td>
        <td>${percentCell(row.overall)}</td>
        <td class="date-cell">${App.formatDate(row.data.lastLogin)}</td>
        <td><button class="btn btn-sm btn-danger mgr-delete-student" data-name="${App.escapeHtml(row.name)}" data-course="${row.courseId}" data-cohort="${row.cohortId}" title="수강생 삭제">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.name-link').forEach(btn => {
      btn.addEventListener('click', () => openDetailModal(btn.dataset.name, btn.dataset.course, btn.dataset.cohort));
    });
    tbody.querySelectorAll('.mgr-delete-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const { name, course, cohort } = btn.dataset;
        if (!window.confirm(`"${name}" 수강생을 삭제하시겠습니까?\n모든 학습 데이터가 삭제됩니다.`)) return;
        Storage.deleteStudent(name, course, cohort);
        App.showToast(`${name} 수강생이 삭제되었습니다.`, 'success');
        renderPage();
      });
    });
  }

  function calcMissionPercent(data, missionKey) {
    const mission = missions[missionKey];
    if (!mission || !data.progress?.[missionKey]) return 0;
    const mProg = data.progress[missionKey];
    let total = 0, done = 0;
    mission.chapters.forEach(ch => {
      const cp = mProg.chapters?.[ch.id];
      total++;
      if (cp?.watched) done++;
      if (ch.quiz?.length) {
        total++;
        if (cp?.quizCompleted) done++;
      }
    });
    return total ? Math.round((done / total) * 100) : 0;
  }

  function percentCell(pct) {
    let cls = 'pct-red';
    if (pct === 100) cls = 'pct-green';
    else if (pct >= 50) cls = 'pct-yellow';
    else if (pct >= 1)  cls = 'pct-orange';
    return `<span class="pct-cell ${cls} num">${pct}%</span>`;
  }

  // ══════════════════════════════════════════
  //  개인 상세 모달
  // ══════════════════════════════════════════
  function openDetailModal(name, courseId, cohortId) {
    const data = Storage.getStudentData(name, courseId, cohortId);
    if (!data) return;

    const prog = App.calcProgress(data);
    const course = getCourseById(courseId);
    const cohort = getCohortById(cohortId);
    const modal = document.getElementById('detailModal');
    document.getElementById('detailModalTitle').textContent = `${name} — ${course?.short || ''} ${cohort?.label || ''} 상세`;

    const body = document.getElementById('detailModalBody');
    let html = '';

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
      html += renderChapterDetail(data, 'python', ch, idx);
    });
    html += `</div>`;

    // Git
    html += `<div class="detail-section">`;
    html += `<h3>🔀 Git & GitHub</h3>`;
    missions.git.chapters.forEach((ch, idx) => {
      html += renderChapterDetail(data, 'git', ch, idx);
    });
    html += `</div>`;

    body.innerHTML = html;
    App.openModal(modal);
  }

  function renderChapterDetail(data, missionKey, ch, idx) {
    const cp = data.progress?.[missionKey]?.chapters?.[ch.id] || {};
    const hasQuiz = ch.quiz?.length > 0;
    let h = '';
    h += `<div class="detail-chapter-row">`;
    h += `<div class="detail-ch-main">`;
    h += `<span class="detail-ch-status">${cp.watched ? '✅' : '⬜'}</span>`;
    h += `<span>Ch.${idx + 1} ${App.escapeHtml(ch.title)}</span>`;
    h += `<span class="detail-date">${cp.watched ? App.formatDate(cp.watchedAt) : ''}</span>`;
    h += `</div>`;

    if (hasQuiz) {
      if (cp.quizCompleted) {
        h += `<div class="detail-quiz-row done">`;
        h += `<span>✅ 퀴즈 응시 완료</span>`;
        h += `<span class="detail-date">${App.formatDate(cp.quizCompletedAt)}</span>`;
        h += `</div>`;

        h += `<div class="detail-quiz-answers">`;
        ch.quiz.forEach((q, qi) => {
          const userAns = cp.quizAnswers?.[q.id];
          let userAnsText = '', modelAnsText = '';

          if (q.type === 'multiple') {
            userAnsText = q.options[userAns] ?? '-';
            modelAnsText = q.options[q.answer];
          } else if (q.type === 'short') {
            userAnsText = userAns || '-';
            modelAnsText = q.answer;
          }

          h += `
            <div class="detail-qa">
              <span class="detail-qa-q">Q${qi + 1}. ${App.escapeHtml(q.question)}</span>
              <span class="detail-qa-a">학생 답: ${App.escapeHtml(String(userAnsText))}</span>
              <span class="detail-qa-model">모범답안: ${App.escapeHtml(String(modelAnsText))}</span>
            </div>
          `;
        });
        h += `</div>`;
      } else {
        h += `<div class="detail-quiz-row pending"><span>퀴즈 미응시</span></div>`;
      }
    }

    h += `</div>`;
    return h;
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

      <div class="mgr-settings-card danger-card">
        <h2>⚠️ 전체 데이터 초기화</h2>
        <p>모든 수강생 데이터와 설정이 영구 삭제됩니다.</p>
        <button class="btn btn-danger" id="resetAllBtn">전체 데이터 초기화</button>
      </div>
    `;

    document.getElementById('changePwBtn').addEventListener('click', () => {
      const current = document.getElementById('currentPw').value;
      const newPw = document.getElementById('newPw').value;
      const confirmPw = document.getElementById('confirmPw').value;

      if (!Storage.validateManager(current)) { App.showToast('현재 비밀번호가 올바르지 않습니다.', 'error'); return; }
      if (!newPw || newPw.length < 4)        { App.showToast('새 비밀번호는 4자 이상이어야 합니다.', 'warning'); return; }
      if (newPw !== confirmPw)               { App.showToast('새 비밀번호가 일치하지 않습니다.', 'error'); return; }

      Storage.setManagerPassword(newPw);
      App.showToast('비밀번호가 변경되었습니다.', 'success');
      document.getElementById('currentPw').value = '';
      document.getElementById('newPw').value = '';
      document.getElementById('confirmPw').value = '';
    });

    document.getElementById('resetAllBtn').addEventListener('click', () => {
      if (!window.confirm('⚠️ 1단계 확인\n\n모든 수강생 데이터와 설정을 삭제하시겠습니까?')) return;
      if (!window.confirm('⚠️ 2단계 최종 확인\n\n이 작업은 되돌릴 수 없습니다.\n정말로 모든 데이터를 삭제하시겠습니까?')) return;

      Storage.clearAllData();
      Storage.setSession('manager', 'admin');
      App.showToast('모든 데이터가 초기화되었습니다.', 'success');
      renderPage();
    });
  }
});
