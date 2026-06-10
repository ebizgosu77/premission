/**
 * Storage 유틸리티 — Firebase Realtime Database + 로컬 캐시
 * 학생 데이터 키 구조: students/{courseId}/{cohortId}/{name}
 */
const Storage = (() => {
  const KEYS = {
    STUDENTS: 'aicamp_students',
    SESSION: 'aicamp_session',
    MANAGER_PW: 'aicamp_manager_pw'
  };

  const DEFAULT_MANAGER_PW = 'aicamp2026';

  // ── 인메모리 캐시 ──
  // students: { [courseId]: { [cohortId]: { [name]: data } } }
  const _cache = {
    students: {},
    managerPw: DEFAULT_MANAGER_PW,
    _ready: false
  };

  let _onDataChangeCallback = null;
  let _debounceTimer = null;

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
        const [studentsSnap, settingsSnap] = await Promise.all([
          db.ref('students').once('value'),
          db.ref('settings').once('value')
        ]);

        const fbStudents = studentsSnap.val();
        const fbSettings = settingsSnap.val();

        const localStudents = _getJSON(KEYS.STUDENTS, {});
        const localPw = localStorage.getItem(KEYS.MANAGER_PW) || DEFAULT_MANAGER_PW;

        const mergePromises = [];

        if (fbStudents && Object.keys(fbStudents).length > 0) {
          _cache.students = fbStudents;
        } else if (Object.keys(localStudents).length > 0) {
          _cache.students = localStudents;
          mergePromises.push(db.ref('students').set(localStudents));
        } else {
          _cache.students = {};
        }

        if (fbSettings) {
          _cache.managerPw = fbSettings.managerPassword || DEFAULT_MANAGER_PW;
        } else {
          _cache.managerPw = localPw;
          mergePromises.push(db.ref('settings').set({ managerPassword: localPw }));
        }

        if (mergePromises.length > 0) {
          await Promise.all(mergePromises);
          console.log('localStorage → Firebase 마이그레이션 완료');
        }

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
    _cache.students = _getJSON(KEYS.STUDENTS, {});
    _cache.managerPw = localStorage.getItem(KEYS.MANAGER_PW) || DEFAULT_MANAGER_PW;
  }

  function _backupToLocalStorage() {
    _setJSON(KEYS.STUDENTS, _cache.students);
    localStorage.setItem(KEYS.MANAGER_PW, _cache.managerPw);
  }

  function _setupListeners() {
    db.ref('students').on('value', snap => {
      _cache.students = snap.val() || {};
      _setJSON(KEYS.STUDENTS, _cache.students);
      _notifyChange();
    });

    db.ref('settings').on('value', snap => {
      const s = snap.val() || {};
      _cache.managerPw = s.managerPassword || DEFAULT_MANAGER_PW;
      localStorage.setItem(KEYS.MANAGER_PW, _cache.managerPw);
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
  function getFlatStudents(filter = {}) {
    const out = [];
    const courses = _cache.students || {};
    Object.keys(courses).forEach(cId => {
      if (filter.courseId && filter.courseId !== 'all' && cId !== filter.courseId) return;
      const cohorts = courses[cId] || {};
      Object.keys(cohorts).forEach(coId => {
        if (filter.cohortId && filter.cohortId !== 'all' && coId !== filter.cohortId) return;
        const list = cohorts[coId] || {};
        Object.keys(list).forEach(name => {
          out.push({ courseId: cId, cohortId: coId, name, data: list[name] });
        });
      });
    });
    return out;
  }

  function getStudentData(name, courseId, cohortId) {
    return _cache.students?.[courseId]?.[cohortId]?.[name] || null;
  }

  function saveStudentData(name, data, courseId, cohortId) {
    if (!_cache.students[courseId]) _cache.students[courseId] = {};
    if (!_cache.students[courseId][cohortId]) _cache.students[courseId][cohortId] = {};
    _cache.students[courseId][cohortId][name] = data;
    _setJSON(KEYS.STUDENTS, _cache.students);
    _fbSet(_studentPath(courseId, cohortId, name), data);
  }

  function initStudent(name, courseId, cohortId) {
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
  //  매니저 비밀번호
  // ──────────────────────────────────────────────
  function getManagerPassword() { return _cache.managerPw || DEFAULT_MANAGER_PW; }
  function validateManager(pw)  { return pw === getManagerPassword(); }
  function setManagerPassword(newPw) {
    _cache.managerPw = newPw;
    localStorage.setItem(KEYS.MANAGER_PW, newPw);
    _fbSet('settings/managerPassword', newPw);
  }

  // ──────────────────────────────────────────────
  //  전체 초기화
  // ──────────────────────────────────────────────
  function clearAllData() {
    _cache.students = {};
    _cache.managerPw = DEFAULT_MANAGER_PW;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
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
    getManagerPassword, validateManager, setManagerPassword,
    clearAllData
  };
})();
