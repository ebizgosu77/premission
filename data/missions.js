/**
 * 사전미션 메타데이터
 * - Python: 8챕터 (혼자 공부하는 파이썬 개정판), 챕터별 퀴즈 3문항
 * - Git: 5챕터, 퀴즈 없음
 * - mathBasic / mathAdv: 매니저가 직접 등록 (placeholder)
 */
const MISSIONS = {
  python: {
    id: 'python',
    title: 'Python 기초',
    icon: '🐍',
    description: '혼자 공부하는 파이썬(개정판) 강의 8개 챕터를 학습합니다.',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
    chapters: [
      {
        id: 'py-ch1',
        title: '파이썬 소개 & 개발 환경',
        youtubeUrl: 'https://www.youtube.com/watch?v=6kzsVLNZQ0E&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 25분 (0~2강)',
        quiz: [
          {
            id: 'py-ch1-q1',
            question: '파이썬은 어떤 종류의 언어인가요?',
            type: 'multiple',
            options: ['컴파일 언어', '인터프리터 언어', '어셈블리 언어', '마크업 언어'],
            answer: 1,
            explanation: '파이썬은 코드를 한 줄씩 해석하여 실행하는 인터프리터 언어입니다.'
          },
          {
            id: 'py-ch1-q2',
            question: '파이썬 파일의 확장자는?',
            type: 'short',
            answer: '.py',
            explanation: '파이썬 스크립트 파일은 .py 확장자를 사용합니다.'
          },
          {
            id: 'py-ch1-q3',
            question: '파이썬을 설치하는 공식 사이트 주소는?',
            type: 'short',
            answer: 'python.org',
            explanation: '공식 다운로드 사이트는 python.org 입니다.'
          }
        ]
      },
      {
        id: 'py-ch2',
        title: '자료형 · 변수 · 연산자',
        youtubeUrl: 'https://www.youtube.com/watch?v=yfyo65co61s&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 2시간 40분 (3~17강)',
        quiz: [
          {
            id: 'py-ch2-q1',
            question: '다음 중 Python의 기본 자료형이 아닌 것은?',
            type: 'multiple',
            options: ['int', 'str', 'array', 'float'],
            answer: 2,
            explanation: 'Python에는 array가 기본 자료형으로 없습니다. 리스트(list)를 사용합니다.'
          },
          {
            id: 'py-ch2-q2',
            question: 'type(3.14)의 결과로 올바른 것은?',
            type: 'multiple',
            options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"],
            answer: 1,
            explanation: '3.14는 소수점이 있으므로 float 타입입니다.'
          },
          {
            id: 'py-ch2-q3',
            question: '변수 이름으로 사용할 수 없는 것은?',
            type: 'multiple',
            options: ['my_var', '_name', '2ndValue', 'value2'],
            answer: 2,
            explanation: '변수 이름은 숫자로 시작할 수 없습니다.'
          }
        ]
      },
      {
        id: 'py-ch3',
        title: '조건문 (if / elif / else)',
        youtubeUrl: 'https://www.youtube.com/watch?v=cgFJG4mKw_Q&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 1시간 7분 (19~25강)',
        quiz: [
          {
            id: 'py-ch3-q1',
            question: 'if문에서 조건이 거짓일 때 실행되는 블록은?',
            type: 'multiple',
            options: ['if', 'elif', 'else', 'then'],
            answer: 2,
            explanation: 'else 블록은 if, elif 조건이 모두 거짓일 때 실행됩니다.'
          },
          {
            id: 'py-ch3-q2',
            question: 'Python에서 "그리고" 를 의미하는 논리 연산자는?',
            type: 'short',
            answer: 'and',
            explanation: 'Python은 &&가 아닌 and 키워드를 사용합니다.'
          },
          {
            id: 'py-ch3-q3',
            question: '다음 코드의 출력은?\n\nx = 15\nif x > 20:\n    print("A")\nelif x > 10:\n    print("B")\nelse:\n    print("C")',
            type: 'multiple',
            options: ['A', 'B', 'C', '에러 발생'],
            answer: 1,
            explanation: 'x=15는 x>20(거짓)을 건너뛰고, x>10(참)이므로 "B"를 출력합니다.'
          }
        ]
      },
      {
        id: 'py-ch4',
        title: '반복문 · 리스트 · 딕셔너리',
        youtubeUrl: 'https://www.youtube.com/watch?v=L1S1O6dCtKI&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 3시간 20분 (26~48강)',
        quiz: [
          {
            id: 'py-ch4-q1',
            question: 'for i in range(5)는 몇 번 반복되는가?',
            type: 'multiple',
            options: ['4번', '5번', '6번', '무한 반복'],
            answer: 1,
            explanation: 'range(5)는 0, 1, 2, 3, 4로 총 5번 반복됩니다.'
          },
          {
            id: 'py-ch4-q2',
            question: '반복문을 즉시 종료하는 키워드는?',
            type: 'short',
            answer: 'break',
            explanation: 'break는 현재 반복문을 즉시 종료합니다.'
          },
          {
            id: 'py-ch4-q3',
            question: '딕셔너리에서 키(key)로 사용할 수 없는 자료형은?',
            type: 'multiple',
            options: ['문자열(str)', '정수(int)', '리스트(list)', '튜플(tuple)'],
            answer: 2,
            explanation: '리스트는 변경 가능(mutable)하므로 딕셔너리의 키로 사용할 수 없습니다.'
          }
        ]
      },
      {
        id: 'py-ch5',
        title: '함수',
        youtubeUrl: 'https://www.youtube.com/watch?v=aKOn6WVD8Cc&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 3시간 30분 (49~70강)',
        quiz: [
          {
            id: 'py-ch5-q1',
            question: 'Python에서 함수를 정의할 때 사용하는 키워드는?',
            type: 'short',
            answer: 'def',
            explanation: 'def 키워드로 함수를 정의합니다. 예: def my_func():'
          },
          {
            id: 'py-ch5-q2',
            question: '함수에서 값을 반환할 때 사용하는 키워드는?',
            type: 'short',
            answer: 'return',
            explanation: 'return 키워드를 사용하여 호출한 곳으로 값을 반환합니다.'
          },
          {
            id: 'py-ch5-q3',
            question: '다음 중 기본값 매개변수 사용이 올바른 것은?',
            type: 'multiple',
            options: [
              'def greet(name="홍길동"):',
              'def greet(name:="홍길동"):',
              'def greet(name=="홍길동"):',
              'def greet(name->"홍길동"):'
            ],
            answer: 0,
            explanation: 'Python에서 기본값은 매개변수=기본값 형태로 지정합니다.'
          }
        ]
      },
      {
        id: 'py-ch6',
        title: '예외 처리',
        youtubeUrl: 'https://www.youtube.com/watch?v=opPu2ZXC0lM&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 51분 (72~77강)',
        quiz: [
          {
            id: 'py-ch6-q1',
            question: '예외 처리를 위해 사용하는 기본 구문은?',
            type: 'multiple',
            options: ['if / else', 'try / except', 'for / in', 'def / return'],
            answer: 1,
            explanation: 'try 블록에서 예외가 발생하면 except 블록이 실행됩니다.'
          },
          {
            id: 'py-ch6-q2',
            question: 'try 구문에서 예외 발생 여부와 관계없이 항상 실행되는 블록은?',
            type: 'short',
            answer: 'finally',
            explanation: 'finally 블록은 예외 발생 여부와 상관없이 항상 실행됩니다.'
          },
          {
            id: 'py-ch6-q3',
            question: '강제로 예외를 발생시킬 때 사용하는 키워드는?',
            type: 'short',
            answer: 'raise',
            explanation: 'raise 키워드를 사용하여 의도적으로 예외를 발생시킬 수 있습니다.'
          }
        ]
      },
      {
        id: 'py-ch7',
        title: '클래스 · 객체지향',
        youtubeUrl: 'https://www.youtube.com/watch?v=hR4pwKvr3so&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 1시간 31분 (78~86강)',
        quiz: [
          {
            id: 'py-ch7-q1',
            question: '클래스에서 객체(인스턴스)를 초기화할 때 호출되는 특수 메서드는?',
            type: 'short',
            answer: '__init__',
            explanation: '__init__ 메서드는 객체가 생성될 때 자동으로 호출되는 생성자입니다.'
          },
          {
            id: 'py-ch7-q2',
            question: '클래스 메서드의 첫 번째 매개변수로 반드시 들어가는 것은?',
            type: 'short',
            answer: 'self',
            explanation: 'self는 인스턴스 자신을 가리키며, 메서드의 첫 번째 매개변수로 사용됩니다.'
          },
          {
            id: 'py-ch7-q3',
            question: '기존 클래스의 속성과 메서드를 물려받아 새 클래스를 만드는 것을?',
            type: 'multiple',
            options: ['캡슐화', '상속', '다형성', '추상화'],
            answer: 1,
            explanation: '상속(inheritance)은 부모 클래스의 속성과 메서드를 자식 클래스가 물려받는 것입니다.'
          }
        ]
      },
      {
        id: 'py-ch8',
        title: '모듈 · 패키지',
        youtubeUrl: 'https://www.youtube.com/watch?v=Pnf0nW5q9cQ&list=PLVsNizTWUw7FvE4FSPmYTtqtwUe0je4r_',
        duration: '약 1시간 7분 (87~93강)',
        quiz: [
          {
            id: 'py-ch8-q1',
            question: '외부 모듈을 설치할 때 사용하는 명령어는?',
            type: 'multiple',
            options: ['python install', 'pip install', 'module install', 'import install'],
            answer: 1,
            explanation: 'pip install 명령어로 외부 모듈(라이브러리)을 설치합니다.'
          },
          {
            id: 'py-ch8-q2',
            question: 'if __name__ == "__main__": 의 의미는?',
            type: 'multiple',
            options: [
              '항상 실행된다',
              '직접 실행할 때만 실행된다',
              '모듈로 가져올 때만 실행된다',
              '에러가 발생한다'
            ],
            answer: 1,
            explanation: '파일을 직접 실행할 때만 __name__이 "__main__"이 되어 해당 블록이 실행됩니다.'
          },
          {
            id: 'py-ch8-q3',
            question: '모듈을 읽어 들일 때 사용하는 키워드는?',
            type: 'short',
            answer: 'import',
            explanation: 'import 키워드를 사용하여 모듈을 읽어 들입니다. 예: import math'
          }
        ]
      }
    ]
  },

  git: {
    id: 'git',
    title: 'Git & GitHub',
    icon: '🔀',
    description: '얄팍한 코딩사전의 Git & GitHub 핵심 강의를 학습합니다.',
    playlistUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU',
    chapters: [
      {
        id: 'git-ch1',
        title: 'Git이란? 버전관리 개념',
        youtubeUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU&t=0',
        duration: '약 15분',
        quiz: []
      },
      {
        id: 'git-ch2',
        title: '설치 & 기본 명령어 (init, add, commit)',
        youtubeUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU&t=900',
        duration: '약 20분',
        quiz: []
      },
      {
        id: 'git-ch3',
        title: 'Branch & Merge',
        youtubeUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU&t=2100',
        duration: '약 18분',
        quiz: []
      },
      {
        id: 'git-ch4',
        title: 'GitHub 원격 저장소 (push, pull)',
        youtubeUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU&t=3200',
        duration: '약 15분',
        quiz: []
      },
      {
        id: 'git-ch5',
        title: '협업 워크플로우 (fork, PR)',
        youtubeUrl: 'https://www.youtube.com/watch?v=1I3hMwQU6GU&t=4100',
        duration: '약 15분',
        quiz: []
      }
    ]
  },

  mathBasic: {
    id: 'mathBasic',
    title: '기본수학',
    icon: '📐',
    description: 'AI에 필요한 기본 수학 개념을 학습합니다.',
    playlistUrl: '',
    editable: true,
    chapters: [
      {
        id: 'mb-ch1',
        title: '기본수학 학습자료',
        youtubeUrl: '',
        duration: '-',
        quiz: [
          {
            id: 'mb-placeholder',
            question: '📌 기본수학 문제는 매니저가 등록 예정입니다.',
            type: 'placeholder',
            options: [],
            answer: null,
            explanation: ''
          }
        ]
      }
    ]
  },

  mathAdv: {
    id: 'mathAdv',
    title: '심화수학',
    icon: '📊',
    description: 'AI에 필요한 심화 수학 개념을 학습합니다.',
    playlistUrl: '',
    editable: true,
    chapters: [
      {
        id: 'ma-ch1',
        title: '심화수학 학습자료',
        youtubeUrl: '',
        duration: '-',
        quiz: [
          {
            id: 'ma-placeholder',
            question: '📌 심화수학 문제는 매니저가 등록 예정입니다.',
            type: 'placeholder',
            options: [],
            answer: null,
            explanation: ''
          }
        ]
      }
    ]
  }
};

// 미션 순서
const MISSION_ORDER = ['python', 'git', 'mathBasic', 'mathAdv'];

// 전체 챕터 수
function getTotalChapters() {
  return MISSION_ORDER.reduce((sum, key) => sum + MISSIONS[key].chapters.length, 0);
}

// 전체 퀴즈가 있는 챕터 수
function getQuizChapterCount() {
  let count = 0;
  MISSION_ORDER.forEach(key => {
    MISSIONS[key].chapters.forEach(ch => {
      if (ch.quiz && ch.quiz.length > 0 && ch.quiz[0].type !== 'placeholder') count++;
    });
  });
  return count;
}

// 미션 데이터 가져오기 (매니저가 편집한 데이터 우선)
function getMissionData() {
  const custom = Storage.getCustomMissions();
  if (custom) {
    try {
      const merged = JSON.parse(JSON.stringify(MISSIONS));
      if (custom.mathBasic) merged.mathBasic = custom.mathBasic;
      if (custom.mathAdv) merged.mathAdv = custom.mathAdv;
      return merged;
    } catch { /* ignore */ }
  }
  return MISSIONS;
}

// 매니저가 수학 미션 저장
function saveCustomMission(key, missionData) {
  let custom = Storage.getCustomMissions() || {};
  custom[key] = missionData;
  Storage.saveCustomMissions(custom);
}
