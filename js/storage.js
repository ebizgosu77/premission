/**
 * Storage 유틸리티 — Firebase Realtime Database + 로컬 캐시
 * 읽기: 동기(캐시) / 쓰기: 캐시 + Firebase 비동기 push
 */
const Storage = (() => {
  const KEYS = {
    STUDENTS: 'aicamp_students',
    SESSION: 'aicamp_session',
    MANAGER_PW: 'aicamp_manager_pw'
  };

  const DEFAULT_MANAGER_PW = 'aicamp2025';

  // ── 인메모리 캐시 ──
  const _cache = {
    students: {},
    managerPw: DEFAULT_MANAGER_PW,
    mathProblems: {},
    cohort: '1기',
    customMissions: null,
    _ready: false
  };

  let _onDataChangeCallback = null;
  let _debounceTimer = null;

  // ── localStorage 헬퍼 (백업용) ──
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
      console.error('localStorage 저장 실패:', e);
    }
  }

  // ── Firebase 쓰기 헬퍼 ──
  function _fbSet(path, value) {
    if (typeof db === 'undefined') return;
    db.ref(path).set(value).catch(err => {
      console.error('Firebase 쓰기 실패:', path, err);
    });
  }

  // ── 데이터 변경 알림 (디바운스) ──
  function _notifyChange() {
    if (!_onDataChangeCallback) return;
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      if (_onDataChangeCallback) _onDataChangeCallback();
    }, 300);
  }

  // ── 초기화: Firebase에서 데이터 로드 + 리스너 설정 ──
  async function init() {
    if (_cache._ready) return;

    // Firebase 사용 불가 시 localStorage 폴백
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
        const [studentsSnap, settingsSnap, mathSnap, customSnap] = await Promise.all([
          db.ref('students').once('value'),
          db.ref('settings').once('value'),
          db.ref('mathProblems').once('value'),
          db.ref('customMissions').once('value')
        ]);

        const fbStudents = studentsSnap.val();
        const fbSettings = settingsSnap.val();
        const fbMath = mathSnap.val();
        const fbCustom = customSnap.val();

        // localStorage 데이터 로드 (비교용)
        const localStudents = _getJSON(KEYS.STUDENTS, {});
        const localPw = localStorage.getItem(KEYS.MANAGER_PW) || DEFAULT_MANAGER_PW;
        const localCohort = localStorage.getItem('aicamp_cohort') || '1기';
        const localMath = _getJSON('aicamp_math_problems', {});
        let localCustom = null;
        try { const r = localStorage.getItem('aicamp_custom_missions'); localCustom = r ? JSON.parse(r) : null; } catch {}

        // 섹션별 병합: Firebase에 없고 localStorage에 있으면 업로드
        const mergePromises = [];

        // 학생 데이터
        if (fbStudents && Object.keys(fbStudents).length > 0) {
          _cache.students = fbStudents;
        } else if (Object.keys(localStudents).length > 0) {
          _cache.students = localStudents;
          for (const [name, data] of Object.entries(localStudents)) {
            mergePromises.push(db.ref('students/' + encodeKey(name)).set(data));
          }
        } else {
          _cache.students = {};
        }

        // 설정
        if (fbSettings) {
          _cache.managerPw = fbSettings.managerPassword || DEFAULT_MANAGER_PW;
          _cache.cohort = fbSettings.cohort || '1기';
        } else {
          _cache.managerPw = localPw;
          _cache.cohort = localCohort;
          mergePromises.push(db.ref('settings').set({ managerPassword: localPw, cohort: localCohort }));
        }

        // 수학 문제
        if (fbMath && Object.keys(fbMath).length > 0) {
          _cache.mathProblems = fbMath;
        } else if (Object.keys(localMath).length > 0) {
          _cache.mathProblems = localMath;
          mergePromises.push(db.ref('mathProblems').set(localMath));
        } else {
          _cache.mathProblems = {};
        }

        // 커스텀 미션
        if (fbCustom) {
          _cache.customMissions = fbCustom;
        } else if (localCustom) {
          _cache.customMissions = localCustom;
          mergePromises.push(db.ref('customMissions').set(localCustom));
        } else {
          _cache.customMissions = null;
        }

        if (mergePromises.length > 0) {
          await Promise.all(mergePromises);
          console.log('localStorage → Firebase 섹션별 마이그레이션 완료');
        }

        _backupToLocalStorage();
      };

      await Promise.race([load(), timeout]);

      // 실시간 리스너 설정
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
    _cache.cohort = localStorage.getItem('aicamp_cohort') || '1기';
    _cache.mathProblems = _getJSON('aicamp_math_problems', {});
    try {
      const raw = localStorage.getItem('aicamp_custom_missions');
      _cache.customMissions = raw ? JSON.parse(raw) : null;
    } catch { _cache.customMissions = null; }
  }

  async function _migrateToFirebase() {
    console.log('localStorage → Firebase 마이그레이션 시작');
    const promises = [];

    // 학생 데이터
    if (Object.keys(_cache.students).length > 0) {
      for (const [name, data] of Object.entries(_cache.students)) {
        promises.push(db.ref('students/' + encodeKey(name)).set(data));
      }
    }

    // 설정 (비밀번호, 기수명)
    promises.push(db.ref('settings').set({
      managerPassword: _cache.managerPw,
      cohort: _cache.cohort
    }));

    // 수학 문제
    if (Object.keys(_cache.mathProblems).length > 0) {
      promises.push(db.ref('mathProblems').set(_cache.mathProblems));
    }

    // 커스텀 미션
    if (_cache.customMissions) {
      promises.push(db.ref('customMissions').set(_cache.customMissions));
    }

    await Promise.all(promises);
    console.log('마이그레이션 완료');
  }

  function _backupToLocalStorage() {
    _setJSON(KEYS.STUDENTS, _cache.students);
    localStorage.setItem(KEYS.MANAGER_PW, _cache.managerPw);
    localStorage.setItem('aicamp_cohort', _cache.cohort);
    _setJSON('aicamp_math_problems', _cache.mathProblems);
    if (_cache.customMissions) {
      localStorage.setItem('aicamp_custom_missions', JSON.stringify(_cache.customMissions));
    }
  }

  function _setupListeners() {
    db.ref('students').on('value', snap => {
      _cache.students = snap.val() || {};
      _setJSON(KEYS.STUDENTS, _cache.students);
      _notifyChange();
    });

    db.ref('settings').on('value', snap => {
      const settings = snap.val() || {};
      _cache.managerPw = settings.managerPassword || DEFAULT_MANAGER_PW;
      _cache.cohort = settings.cohort || '1기';
      localStorage.setItem(KEYS.MANAGER_PW, _cache.managerPw);
      localStorage.setItem('aicamp_cohort', _cache.cohort);
      _notifyChange();
    });

    db.ref('mathProblems').on('value', snap => {
      _cache.mathProblems = snap.val() || {};
      _setJSON('aicamp_math_problems', _cache.mathProblems);
      _notifyChange();
    });

    db.ref('customMissions').on('value', snap => {
      _cache.customMissions = snap.val() || null;
      if (_cache.customMissions) {
        localStorage.setItem('aicamp_custom_missions', JSON.stringify(_cache.customMissions));
      } else {
        localStorage.removeItem('aicamp_custom_missions');
      }
      _notifyChange();
    });
  }

  // ── 데이터 변경 콜백 등록 ──
  function onDataChange(callback) {
    _onDataChangeCallback = callback;
  }

  // ── 이름 검증 ──
  function validateName(name) {
    if (!name || typeof name !== 'string') return { valid: false, msg: '이름을 입력해주세요.' };
    const trimmed = name.trim();
    if (trimmed.length === 0) return { valid: false, msg: '이름을 입력해주세요.' };
    if (trimmed.length > 20) return { valid: false, msg: '이름은 20자 이내로 입력해주세요.' };
    if (/[<>"'&\\\/]/.test(trimmed)) return { valid: false, msg: '이름에 특수문자(<, >, ", \' 등)는 사용할 수 없습니다.' };
    return { valid: true, name: trimmed };
  }

  // ── 학생 데이터 ──
  function getAllStudents() {
    return _cache.students;
  }

  function getStudentData(name) {
    return _cache.students[name] || null;
  }

  function saveStudentData(name, data) {
    _cache.students[name] = data;
    _setJSON(KEYS.STUDENTS, _cache.students);
    _fbSet('students/' + encodeKey(name), data);
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
          watched: false, watchedAt: null,
          quizCompleted: false, quizScore: 0,
          quizAnswers: {}, quizCompletedAt: null
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
    delete _cache.students[name];
    _setJSON(KEYS.STUDENTS, _cache.students);
    if (typeof db !== 'undefined') {
      db.ref('students/' + encodeKey(name)).remove().catch(err => {
        console.error('Firebase 학생 삭제 실패:', err);
      });
    }
  }

  // ── 세션 (localStorage만 — 브라우저별 독립) ──
  function setSession(role, name) {
    _setJSON(KEYS.SESSION, { role, name, loginAt: new Date().toISOString() });
  }

  function getSession() {
    return _getJSON(KEYS.SESSION, null);
  }

  function clearSession() {
    localStorage.removeItem(KEYS.SESSION);
  }

  // ── 매니저 비밀번호 ──
  function getManagerPassword() {
    return _cache.managerPw || DEFAULT_MANAGER_PW;
  }

  function validateManager(pw) {
    return pw === getManagerPassword();
  }

  function setManagerPassword(newPw) {
    _cache.managerPw = newPw;
    localStorage.setItem(KEYS.MANAGER_PW, newPw);
    _fbSet('settings/managerPassword', newPw);
  }

  // ── 기수명 ──
  function getCohortName() {
    return _cache.cohort || '1기';
  }

  function setCohortName(name) {
    _cache.cohort = name;
    localStorage.setItem('aicamp_cohort', name);
    _fbSet('settings/cohort', name);
  }

  // ── 문제 텍스트 ──
  function getMathProblems(key) {
    const val = _cache.mathProblems[key];
    if (typeof val === 'string' && val) {
      return [{ id: 1, text: val }];
    }
    if (Array.isArray(val) && val.length > 0) return val;
    return [];
  }

  function saveMathProblems(key, problems) {
    _cache.mathProblems[key] = problems;
    _setJSON('aicamp_math_problems', _cache.mathProblems);
    _fbSet('mathProblems/' + key, problems);
  }

  function getMathProblem(key) {
    const problems = getMathProblems(key);
    return problems.map(p => p.text).join('\n');
  }

  function saveMathProblem(key, text) {
    saveMathProblems(key, [{ id: 1, text }]);
  }

  // ── 커스텀 미션 ──
  function getCustomMissions() {
    return _cache.customMissions;
  }

  function saveCustomMissions(custom) {
    _cache.customMissions = custom;
    localStorage.setItem('aicamp_custom_missions', JSON.stringify(custom));
    _fbSet('customMissions', custom);
  }

  // ── 전체 초기화 ──
  function clearAllData() {
    _cache.students = {};
    _cache.managerPw = DEFAULT_MANAGER_PW;
    _cache.mathProblems = {};
    _cache.cohort = '1기';
    _cache.customMissions = null;

    // localStorage 초기화
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('aicamp_custom_missions');
    localStorage.removeItem('aicamp_math_problems');
    localStorage.removeItem('aicamp_cohort');

    // Firebase 초기화
    if (typeof db !== 'undefined') {
      db.ref('students').remove();
      db.ref('settings').remove();
      db.ref('mathProblems').remove();
      db.ref('customMissions').remove();
    }
  }

  // ── Firebase 키 인코딩 (이름에 . # $ [ ] / 포함 시 대비) ──
  function encodeKey(key) {
    return key.replace(/[.#$\[\]\/]/g, ch => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
  }

  return {
    init, onDataChange,
    getAllStudents, getStudentData, saveStudentData, initStudent,
    ensureChapters, deleteStudent, validateName,
    setSession, getSession, clearSession,
    getManagerPassword, validateManager, setManagerPassword,
    getCohortName, setCohortName,
    getMathProblem, saveMathProblem,
    getMathProblems, saveMathProblems,
    getCustomMissions, saveCustomMissions,
    clearAllData
  };
})();
