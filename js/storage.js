/**
 * Storage 유틸리티 — Firebase Realtime Database + 로컬 캐시
 * 학생 데이터 키 구조: students/{courseId}/{cohortId}/{name}
 */
const Storage = (() => {
  const KEYS = {
    STUDENTS: 'aicamp_students',
    SESSION: 'aicamp_session'
  };

  // ── 인메모리 캐시 ──
  // students: { [courseId]: { [cohortId]: { [name]: data } } }
  // 매니저 비밀번호는 Firebase Authentication이 직접 관리하므로 여기서 다루지 않음.
  const _cache = {
    students: {},
    _ready: false
  };

  // (호환용) 과거 버전의 매니저 비밀번호 localStorage 키 — 첫 init에서 정리
  const LEGACY_MANAGER_PW_KEY = 'aicamp_manager_pw';

  let _onDataChangeCallback = null;
  let _debounceTimer = null;

  // ── 유효성 검증 ──
  // courseId, cohortId, name이 정상 형태인지 확인.
  // (손상된 Firebase 데이터가 매니저 화면에 노출되거나 다시 저장되는 것을 방지)
  function _isValidCourseId(id) {
    if (typeof COURSES === 'undefined') return typeof id === 'string' && id.length > 0;
    return typeof id === 'string' && COURSES.some(c => c.id === id);
  }
  function _isValidCohortId(id) {
    if (typeof COHORTS === 'undefined') return typeof id === 'string' && id.length > 0;
    return typeof id === 'string' && COHORTS.some(c => c.id === id);
  }
  function _isValidName(name) {
    return typeof name === 'string' && name.length > 0 && name.length <= 40;
  }

  // students 트리에서 정상 구조 부분만 남기고 손상된 가지(잘못된 키, 비객체 노드 등)는 제거한다.
  // 반환값: { sanitized, changed }
  function _sanitizeStudentsTree(students) {
    let changed = false;
    const out = {};
    if (!students || typeof students !== 'object') return { sanitized: out, changed: students !== out };
    Object.keys(students).forEach(cId => {
      const cohorts = students[cId];
      if (!_isValidCourseId(cId) || !cohorts || typeof cohorts !== 'object') { changed = true; return; }
      const cleanedCohorts = {};
      Object.keys(cohorts).forEach(coId => {
        const list = cohorts[coId];
        if (!_isValidCohortId(coId) || !list || typeof list !== 'object') { changed = true; return; }
        const cleanedList = {};
        Object.keys(list).forEach(name => {
          const data = list[name];
          if (!_isValidName(name) || !data || typeof data !== 'object') { changed = true; return; }
          cleanedList[name] = data;
        });
        if (Object.keys(cleanedList).length > 0) cleanedCohorts[coId] = cleanedList;
      });
      if (Object.keys(cleanedCohorts).length > 0) out[cId] = cleanedCohorts;
    });
    return { sanitized: out, changed };
  }

  // ── localStorage 헬퍼 ──
  function _getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function _setJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.error('localStorage 저장 실패:', e); }
  }

  // ── Firebase 헬퍼 ──
  function _fbSet(path, value) {
    if (typeof db === 'undefined') return;
    db.ref(path).set(value).catch(err => console.error('Firebase 쓰기 실패:', path, err));
  }

  function _notifyChange() {
    if (!_onDataChangeCallback) return;
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => { if (_onDataChangeCallback) _onDataChangeCallback(); }, 300);
  }

  // ── 학생 데이터 경로 ──
  function _studentPath(courseId, cohortId, name) {
    return `students/${courseId}/${cohortId}/${encodeKey(name)}`;
  }

  // ── 초기화 ──
  async function init() {
    if (_cache._ready) return;

    if (typeof db === 'undefined') {
      _loadFromLocalStorage();
      _cache._ready = true;
      return;
    }

    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase 타임아웃')), 5000)
      );

      const load = async () => {
        const studentsSnap = await db.ref('students').once('value');
        const fbStudents = studentsSnap.val();
        const localStudents = _getJSON(KEYS.STUDENTS, {});

        const mergePromises = [];

        if (fbStudents && Object.keys(fbStudents).length > 0) {
          const { sanitized, changed } = _sanitizeStudentsTree(fbStudents);
          _cache.students = sanitized;
          if (changed) {
            console.warn('[Storage] Firebase students 트리에서 손상 데이터 발견 → 정상 구조만 사용 (Firebase 반영은 매니저의 명시 행동 필요)');
          }
        } else if (Object.keys(localStudents).length > 0) {
          // 과거 평탄 구조 잔재 등이 그대로 Firebase에 올라가는 것을 막기 위해 마이그레이션 전에 정화한다.
          const { sanitized } = _sanitizeStudentsTree(localStudents);
          _cache.students = sanitized;
          if (Object.keys(sanitized).length > 0) {
            mergePromises.push(db.ref('students').set(sanitized));
          }
        } else {
          _cache.students = {};
        }

        if (mergePromises.length > 0) {
          await Promise.all(mergePromises);
          console.log('localStorage → Firebase 마이그레이션 완료');
        }

        // 과거 버전이 남긴 매니저 비밀번호 로컬 키 정리 (Firebase Auth 이관 후 불필요)
        localStorage.removeItem(LEGACY_MANAGER_PW_KEY);

        _backupToLocalStorage();
      };

      await Promise.race([load(), timeout]);
      _setupListeners();
    } catch (err) {
      console.warn('Firebase 로드 실패, localStorage 폴백:', err);
      _loadFromLocalStorage();
    }

    _cache._ready = true;
  }

  function _loadFromLocalStorage() {
    const raw = _getJSON(KEYS.STUDENTS, {});
    _cache.students = _sanitizeStudentsTree(raw).sanitized;
  }

  function _backupToLocalStorage() {
    _setJSON(KEYS.STUDENTS, _cache.students);
  }

  function _setupListeners() {
    db.ref('students').on('value', snap => {
      const raw = snap.val() || {};
      const { sanitized } = _sanitizeStudentsTree(raw);
      _cache.students = sanitized;
      _setJSON(KEYS.STUDENTS, _cache.students);
      _notifyChange();
    });
  }

  function onDataChange(callback) { _onDataChangeCallback = callback; }

  // ── 이름 검증 ──
  function validateName(name) {
    if (!name || typeof name !== 'string') return { valid: false, msg: '이름을 입력해주세요.' };
    const trimmed = name.trim();
    if (trimmed.length === 0) return { valid: false, msg: '이름을 입력해주세요.' };
    if (trimmed.length > 20)  return { valid: false, msg: '이름은 20자 이내로 입력해주세요.' };
    if (/[<>"'&\\\/]/.test(trimmed)) return { valid: false, msg: '이름에 특수문자(<, >, ", \' 등)는 사용할 수 없습니다.' };
    return { valid: true, name: trimmed };
  }

  // ──────────────────────────────────────────────
  //  학생 데이터
  // ──────────────────────────────────────────────

  // 전체 학생 (트리 구조)
  function getAllStudents() { return _cache.students; }

  // 평탄화된 학생 배열 — { courseId, cohortId, name, data }
  // 필터 옵션: { courseId, cohortId }
  // 구조가 어긋난 손상 데이터(잘못된 courseId/cohortId, 객체가 아닌 값 등)는 건너뜀.
  function getFlatStudents(filter = {}) {
    const out = [];
    const courses = _cache.students || {};
    Object.keys(courses).forEach(cId => {
      if (!_isValidCourseId(cId)) return;
      if (filter.courseId && filter.courseId !== 'all' && cId !== filter.courseId) return;
      const cohorts = courses[cId];
      if (!cohorts || typeof cohorts !== 'object') return;
      Object.keys(cohorts).forEach(coId => {
        if (!_isValidCohortId(coId)) return;
        if (filter.cohortId && filter.cohortId !== 'all' && coId !== filter.cohortId) return;
        const list = cohorts[coId];
        if (!list || typeof list !== 'object') return;
        Object.keys(list).forEach(name => {
          if (!_isValidName(name)) return;
          const data = list[name];
          if (!data || typeof data !== 'object') return;
          out.push({ courseId: cId, cohortId: coId, name, data });
        });
      });
    });
    return out;
  }

  function getStudentData(name, courseId, cohortId) {
    return _cache.students?.[courseId]?.[cohortId]?.[name] || null;
  }

  function saveStudentData(name, data, courseId, cohortId) {
    if (!_isValidCourseId(courseId) || !_isValidCohortId(cohortId) || !_isValidName(name)) {
      console.error('[Storage] 잘못된 키로 저장 시도 차단:', { courseId, cohortId, name });
      return;
    }
    if (!_cache.students[courseId]) _cache.students[courseId] = {};
    if (!_cache.students[courseId][cohortId]) _cache.students[courseId][cohortId] = {};
    _cache.students[courseId][cohortId][name] = data;
    _setJSON(KEYS.STUDENTS, _cache.students);
    _fbSet(_studentPath(courseId, cohortId, name), data);
  }

  function initStudent(name, courseId, cohortId) {
    if (!_isValidCourseId(courseId) || !_isValidCohortId(cohortId) || !_isValidName(name)) {
      console.error('[Storage] 잘못된 키로 학생 초기화 시도 차단:', { courseId, cohortId, name });
      return null;
    }
    const existing = getStudentData(name, courseId, cohortId);
    if (existing) return existing;

    const missions = getMissionData();
    const data = {
      name,
      courseId,
      cohortId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      progress: {}
    };

    MISSION_ORDER.forEach(missionKey => {
      const mission = missions[missionKey];
      data.progress[missionKey] = { chapters: {} };
      mission.chapters.forEach(ch => {
        data.progress[missionKey].chapters[ch.id] = {
          watched: false, watchedAt: null,
          quizCompleted: false, quizScore: 0,
          quizAnswers: {}, quizCompletedAt: null
        };
      });
    });

    saveStudentData(name, data, courseId, cohortId);
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

  function deleteStudent(name, courseId, cohortId) {
    if (_cache.students?.[courseId]?.[cohortId]?.[name]) {
      delete _cache.students[courseId][cohortId][name];
    }
    _setJSON(KEYS.STUDENTS, _cache.students);
    if (typeof db !== 'undefined') {
      db.ref(_studentPath(courseId, cohortId, name)).remove()
        .catch(err => console.error('Firebase 학생 삭제 실패:', err));
    }
  }

  // ──────────────────────────────────────────────
  //  세션
  // ──────────────────────────────────────────────
  function setSession(role, name, courseId, cohortId) {
    const session = { role, name, loginAt: new Date().toISOString() };
    if (courseId) session.courseId = courseId;
    if (cohortId) session.cohortId = cohortId;
    _setJSON(KEYS.SESSION, session);
  }
  function getSession()   { return _getJSON(KEYS.SESSION, null); }
  function clearSession() { localStorage.removeItem(KEYS.SESSION); }

  // ──────────────────────────────────────────────
  //  전체 초기화
  // ──────────────────────────────────────────────
  // students 데이터만 비우고 매니저 계정(Firebase Auth)은 건드리지 않는다.
  function clearAllData() {
    _cache.students = {};
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem(LEGACY_MANAGER_PW_KEY);
    if (typeof db !== 'undefined') {
      db.ref('students').remove();
      db.ref('settings').remove();
    }
  }

  // ── Firebase 키 인코딩 ──
  function encodeKey(key) {
    return key.replace(/[.#$\[\]\/]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
  }

  return {
    init, onDataChange,
    getAllStudents, getFlatStudents,
    getStudentData, saveStudentData, initStudent,
    ensureChapters, deleteStudent, validateName,
    setSession, getSession, clearSession,
    clearAllData
  };
})();
