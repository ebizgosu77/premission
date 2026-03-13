/**
 * 공통 로직
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
  // Python: 수강(8) + 퀴즈합격(8) = 16 항목
  // Git: 수강(5) = 5 항목
  // 수학: 제출(2) = 2 항목
  // 총 23 항목 기준 overall
  function calcProgress(studentData) {
    const missions = getMissionData();
    let totalChapters = 0;
    let watchedChapters = 0;
    let totalQuizChapters = 0;
    let passedQuizChapters = 0;

    MISSION_ORDER.forEach(key => {
      const mission = missions[key];
      const prog = studentData.progress[key];
      if (!prog) return;

      mission.chapters.forEach(ch => {
        totalChapters++;
        const chProg = prog.chapters?.[ch.id];
        if (chProg?.watched) watchedChapters++;

        const hasQuiz = ch.quiz && ch.quiz.length > 0 && ch.quiz[0].type !== 'placeholder';
        if (hasQuiz) {
          totalQuizChapters++;
          if (chProg?.quizCompleted && chProg.quizScore >= 70) passedQuizChapters++;
        }
      });
    });

    // 수학 미션 제출 반영
    let mathSubmitted = 0;
    const mathTotal = 2;
    ['mathBasic', 'mathAdv'].forEach(key => {
      if (studentData.progress?.[key]?.missionSubmitted) mathSubmitted++;
    });

    // 종합: (수강률 + 퀴즈률 + 미션제출률) / 해당 항목 수
    const totalItems = totalChapters + totalQuizChapters + mathTotal;
    const doneItems = watchedChapters + passedQuizChapters + mathSubmitted;
    const overall = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

    const watchPercent = totalChapters ? Math.round((watchedChapters / totalChapters) * 100) : 0;
    const quizPercent = totalQuizChapters ? Math.round((passedQuizChapters / totalQuizChapters) * 100) : 0;

    return {
      watchedChapters, totalChapters, watchPercent,
      passedQuizChapters, totalQuizChapters, quizPercent,
      mathSubmitted, mathTotal,
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

  // 모달 열기/닫기
  function openModal(modalEl) {
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  return { showToast, calcProgress, formatDate, logout, requireAuth, openModal, closeModal };
})();
