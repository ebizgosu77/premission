/**
 * localStorage 유틸리티
 */
const Storage = (() => {
  const KEYS = {
    STUDENTS: 'aicamp_students',
    SESSION: 'aicamp_session',
    MANAGER_PW: 'aicamp_manager_pw'
  };

  const DEFAULT_MANAGER_PW = 'aicamp2025';

  // --- 내부 헬퍼 ---
  function _getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function _setJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        App.showToast('저장 공간이 부족합니다. 불필요한 데이터를 정리해주세요.', 'error');
      }
      console.error('localStorage 저장 실패:', e);
    }
  }

  // --- 이름 검증 ---
  function validateName(name) {
    if (!name || typeof name !== 'string') return { valid: false, msg: '이름을 입력해주세요.' };
    const trimmed = name.trim();
    if (trimmed.length === 0) return { valid: false, msg: '이름을 입력해주세요.' };
    if (trimmed.length > 20) return { valid: false, msg: '이름은 20자 이내로 입력해주세요.' };
    if (/[<>"'&\\\/]/.test(trimmed)) return { valid: false, msg: '이름에 특수문자(<, >, ", \' 등)는 사용할 수 없습니다.' };
    return { valid: true, name: trimmed };
  }

  // --- 학생 데이터 ---
  function getAllStudents() {
    return _getJSON(KEYS.STUDENTS, {});
  }

  function getStudentData(name) {
    const students = getAllStudents();
    return students[name] || null;
  }

  function saveStudentData(name, data) {
    const students = getAllStudents();
    students[name] = data;
    _setJSON(KEYS.STUDENTS, students);
  }

  function initStudent(name) {
    const existing = getStudentData(name);
    if (existing) return existing;

    const missions = getMissionData();
    const data = {
      name: name,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      progress: {}
    };

    MISSION_ORDER.forEach(missionKey => {
      const mission = missions[missionKey];
      data.progress[missionKey] = { chapters: {} };

      mission.chapters.forEach(ch => {
        data.progress[missionKey].chapters[ch.id] = {
          watched: false,
          watchedAt: null,
          quizCompleted: false,
          quizScore: 0,
          quizAnswers: {},
          quizCompletedAt: null
        };
      });
    });

    saveStudentData(name, data);
    return data;
  }

  function ensureChapters(studentData) {
    const missions = getMissionData();
    let updated = false;
    MISSION_ORDER.forEach(missionKey => {
      const mission = missions[missionKey];
      if (!studentData.progress[missionKey]) {
        studentData.progress[missionKey] = { chapters: {} };
        updated = true;
      }
      if (!studentData.progress[missionKey].chapters) {
        studentData.progress[missionKey].chapters = {};
        updated = true;
      }
      mission.chapters.forEach(ch => {
        if (!studentData.progress[missionKey].chapters[ch.id]) {
          studentData.progress[missionKey].chapters[ch.id] = {
            watched: false, watchedAt: null,
            quizCompleted: false, quizScore: 0,
            quizAnswers: {}, quizCompletedAt: null
          };
          updated = true;
        }
      });
    });
    return updated;
  }

  function deleteStudent(name) {
    const students = getAllStudents();
    delete students[name];
    _setJSON(KEYS.STUDENTS, students);
  }

  // --- 세션 ---
  function setSession(role, name) {
    _setJSON(KEYS.SESSION, { role, name, loginAt: new Date().toISOString() });
  }

  function getSession() {
    return _getJSON(KEYS.SESSION, null);
  }

  function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
  }

  // --- 매니저 ---
  function getManagerPassword() {
    return localStorage.getItem(KEYS.MANAGER_PW) || DEFAULT_MANAGER_PW;
  }

  function validateManager(pw) {
    return pw === getManagerPassword();
  }

  function setManagerPassword(newPw) {
    localStorage.setItem(KEYS.MANAGER_PW, newPw);
  }

  // --- 전체 초기화 ---
  function clearAllData() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('aicamp_custom_missions');
    localStorage.removeItem('aicamp_math_problems');
    localStorage.removeItem('aicamp_cohort');
  }

  // --- 기수명 ---
  function getCohortName() {
    return localStorage.getItem('aicamp_cohort') || '1기';
  }

  function setCohortName(name) {
    localStorage.setItem('aicamp_cohort', name);
  }

  // --- 문제 텍스트 (매니저 편집) ---
  // 개별 문제 배열: [{id, text}]
  function getMathProblems(key) {
    const data = _getJSON('aicamp_math_problems', {});
    const val = data[key];
    // 하위 호환: 문자열이면 배열로 변환
    if (typeof val === 'string' && val) {
      return [{ id: 1, text: val }];
    }
    if (Array.isArray(val) && val.length > 0) return val;
    return [];
  }

  function saveMathProblems(key, problems) {
    const data = _getJSON('aicamp_math_problems', {});
    data[key] = problems;
    _setJSON('aicamp_math_problems', data);
  }

  // 하위 호환용 (단일 문자열)
  function getMathProblem(key) {
    const problems = getMathProblems(key);
    return problems.map(p => p.text).join('\n');
  }

  function saveMathProblem(key, text) {
    saveMathProblems(key, [{ id: 1, text }]);
  }

  return {
    getAllStudents, getStudentData, saveStudentData, initStudent,
    ensureChapters, deleteStudent, validateName,
    setSession, getSession, clearSession,
    getManagerPassword, validateManager, setManagerPassword,
    getCohortName, setCohortName,
    getMathProblem, saveMathProblem,
    getMathProblems, saveMathProblems,
    clearAllData
  };
})();
