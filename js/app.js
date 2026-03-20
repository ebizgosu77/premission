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

  // ── 수학 표기 자동 변환 ──
  // 2^3 → 2³, x_1 → x₁, sqrt → √ 등 자동 치환
  const SUPERSCRIPT_MAP = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾',
    'n':'ⁿ','i':'ⁱ','x':'ˣ','y':'ʸ','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ',
    'f':'ᶠ','g':'ᵍ','h':'ʰ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','o':'ᵒ','p':'ᵖ',
    'r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','z':'ᶻ',
    'A':'ᴬ','B':'ᴮ','D':'ᴰ','E':'ᴱ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ',
    'L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','R':'ᴿ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ'
  };
  const SUBSCRIPT_MAP = {
    '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
    '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎',
    'a':'ₐ','e':'ₑ','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ',
    'o':'ₒ','p':'ₚ','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','x':'ₓ'
  };

  function convertMathNotation(text) {
    if (!text) return '';

    // 기호 치환
    let result = text
      .replace(/\*\*/g, '^')       // ** → ^ (Python 거듭제곱)
      .replace(/sqrt\(([^)]+)\)/gi, '√($1)')
      .replace(/sqrt/gi, '√')
      .replace(/>=/g, '≥')
      .replace(/<=/g, '≤')
      .replace(/!=/g, '≠')
      .replace(/\+-/g, '±')
      .replace(/-\+/g, '∓')
      .replace(/\.\.\./g, '⋯')
      .replace(/infinity|inf/gi, '∞')
      .replace(/\bpi\b/gi, 'π')
      .replace(/\btheta\b/gi, 'θ')
      .replace(/\balpha\b/gi, 'α')
      .replace(/\bbeta\b/gi, 'β')
      .replace(/\bgamma\b/gi, 'γ')
      .replace(/\bdelta\b/gi, 'δ')
      .replace(/\bsigma\b/gi, 'σ')
      .replace(/\blambda\b/gi, 'λ')
      .replace(/\bmu\b/gi, 'μ')
      .replace(/\bepsilon\b/gi, 'ε')
      .replace(/\bomega\b/gi, 'ω')
      .replace(/\bSUM\b/g, '∑')
      .replace(/\bsum\b/g, '∑')
      .replace(/\bint\b/g, '∫')
      .replace(/\bprod\b/gi, '∏')
      .replace(/\bin\b/g, '∈')
      .replace(/\bforall\b/gi, '∀')
      .replace(/\bexists\b/gi, '∃')
      .replace(/->/g, '→')
      .replace(/=>/g, '⇒')
      .replace(/<=>/g, '⇔');

    // ^{...} 중괄호 그룹 위첨자
    result = result.replace(/\^\{([^}]+)\}/g, (_, group) => {
      return group.split('').map(ch => SUPERSCRIPT_MAP[ch] || ch).join('');
    });

    // ^단일문자 위첨자
    result = result.replace(/\^([0-9a-zA-Z+\-=()])/g, (_, ch) => {
      return SUPERSCRIPT_MAP[ch] || '^' + ch;
    });

    // _{...} 중괄호 그룹 아래첨자
    result = result.replace(/_\{([^}]+)\}/g, (_, group) => {
      return group.split('').map(ch => SUBSCRIPT_MAP[ch] || ch).join('');
    });

    // _단일문자 아래첨자
    result = result.replace(/_([0-9a-zA-Z+\-=()])/g, (_, ch) => {
      return SUBSCRIPT_MAP[ch] || '_' + ch;
    });

    return result;
  }

  // HTML 이스케이프 + 수학 변환 + 줄바꿈 처리
  function renderMathHtml(text) {
    if (!text) return '';
    let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    escaped = convertMathNotation(escaped);
    return escaped.replace(/\n/g, '<br>');
  }

  return {
    showToast, calcProgress, formatDate, logout, requireAuth, openModal, closeModal,
    convertMathNotation, renderMathHtml
  };
})();
