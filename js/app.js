/**
 * 공통 로직 — 토스트, 진행률 계산, 인증, 모달
 */
const App = (() => {

  // 토스트 알림
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // 진행률 계산 (학생 1명)
  // 수강(N) + 퀴즈 응시(N) 기준 — 채점은 하지 않음
  function calcProgress(studentData) {
    if (!studentData) {
      return {
        watchedChapters: 0, totalChapters: 0, watchPercent: 0,
        attemptedQuizChapters: 0, totalQuizChapters: 0, quizPercent: 0,
        overall: 0
      };
    }
    const missions = getMissionData();
    let totalChapters = 0, watchedChapters = 0;
    let totalQuizChapters = 0, attemptedQuizChapters = 0;

    MISSION_ORDER.forEach(key => {
      const mission = missions[key];
      const prog = studentData.progress?.[key];
      if (!prog) return;

      mission.chapters.forEach(ch => {
        totalChapters++;
        const chProg = prog.chapters?.[ch.id];
        if (chProg?.watched) watchedChapters++;

        if (ch.quiz && ch.quiz.length > 0) {
          totalQuizChapters++;
          if (chProg?.quizCompleted) attemptedQuizChapters++;
        }
      });
    });

    const totalItems = totalChapters + totalQuizChapters;
    const doneItems  = watchedChapters + attemptedQuizChapters;
    const overall = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

    const watchPercent = totalChapters ? Math.round((watchedChapters / totalChapters) * 100) : 0;
    const quizPercent  = totalQuizChapters ? Math.round((attemptedQuizChapters / totalQuizChapters) * 100) : 0;

    return {
      watchedChapters, totalChapters, watchPercent,
      attemptedQuizChapters, totalQuizChapters, quizPercent,
      overall
    };
  }

  // 날짜 포맷
  function formatDate(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${min}`;
  }

  // 로그아웃
  function logout() {
    Storage.clearSession();
    window.location.href = 'index.html';
  }

  // 인증 체크
  function requireAuth(role) {
    const session = Storage.getSession();
    if (!session || session.role !== role) {
      window.location.href = 'index.html';
      return null;
    }
    return session;
  }

  // 모달
  function openModal(modalEl)  { modalEl.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeModal(modalEl) { modalEl.classList.remove('active'); document.body.style.overflow = ''; }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return {
    showToast, calcProgress, formatDate,
    logout, requireAuth,
    openModal, closeModal,
    escapeHtml
  };
})();
