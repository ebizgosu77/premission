/**
 * 사전미션 메타데이터
 * - Python: 8챕터, 챕터별 퀴즈 3문항
 * - Git: 5챕터, 퀴즈 없음
 * - mathBasic / mathAdv: 매니저가 직접 등록 (placeholder)
 */
const MISSIONS = {
  python: {
    id: 'python',
    title: 'Python 기초',
    icon: '🐍',
    description: '나도코딩 스타일 Python 입문 강의 8개 챕터를 학습합니다.',
    playlistUrl: 'https://www.youtube.com/playlist?list=PLMsa_0kAjjrdiwQykI8eb3H4IRxLTqCnP',
    chapters: [
      {
        id: 'py-ch1',
        title: '파이썬 소개 & 설치',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY',
        duration: '약 20분',
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
        title: '변수와 자료형',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=1200',
        duration: '약 30분',
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
        title: '연산자',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=3000',
        duration: '약 25분',
        quiz: [
          {
            id: 'py-ch3-q1',
            question: '10 // 3 의 결과는?',
            type: 'short',
            answer: '3',
            explanation: '// 는 몫(정수 나눗셈) 연산자입니다. 10 ÷ 3 = 3 나머지 1'
          },
          {
            id: 'py-ch3-q2',
            question: '10 % 3 의 결과는?',
            type: 'short',
            answer: '1',
            explanation: '% 는 나머지 연산자입니다. 10을 3으로 나눈 나머지는 1입니다.'
          },
          {
            id: 'py-ch3-q3',
            question: '2 ** 4 의 결과는?',
            type: 'short',
            answer: '16',
            explanation: '** 는 거듭제곱 연산자입니다. 2의 4제곱은 16입니다.'
          }
        ]
      },
      {
        id: 'py-ch4',
        title: '조건문 (if)',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=4800',
        duration: '약 30분',
        quiz: [
          {
            id: 'py-ch4-q1',
            question: 'if문에서 조건이 거짓일 때 실행되는 블록은?',
            type: 'multiple',
            options: ['if', 'elif', 'else', 'then'],
            answer: 2,
            explanation: 'else 블록은 if, elif 조건이 모두 거짓일 때 실행됩니다.'
          },
          {
            id: 'py-ch4-q2',
            question: 'Python에서 "그리고" 를 의미하는 논리 연산자는?',
            type: 'short',
            answer: 'and',
            explanation: 'Python은 &&가 아닌 and 키워드를 사용합니다.'
          },
          {
            id: 'py-ch4-q3',
            question: '다음 코드의 출력은?\n\nx = 15\nif x > 20:\n    print("A")\nelif x > 10:\n    print("B")\nelse:\n    print("C")',
            type: 'multiple',
            options: ['A', 'B', 'C', '에러 발생'],
            answer: 1,
            explanation: 'x=15는 x>20(거짓)을 건너뛰고, x>10(참)이므로 "B"를 출력합니다.'
          }
        ]
      },
      {
        id: 'py-ch5',
        title: '반복문 (for, while)',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=6600',
        duration: '약 35분',
        quiz: [
          {
            id: 'py-ch5-q1',
            question: 'for i in range(5)는 몇 번 반복되는가?',
            type: 'multiple',
            options: ['4번', '5번', '6번', '무한 반복'],
            answer: 1,
            explanation: 'range(5)는 0, 1, 2, 3, 4로 총 5번 반복됩니다.'
          },
          {
            id: 'py-ch5-q2',
            question: '반복문을 즉시 종료하는 키워드는?',
            type: 'short',
            answer: 'break',
            explanation: 'break는 현재 반복문을 즉시 종료합니다.'
          },
          {
            id: 'py-ch5-q3',
            question: '현재 반복을 건너뛰고 다음 반복으로 넘어가는 키워드는?',
            type: 'short',
            answer: 'continue',
            explanation: 'continue는 현재 반복의 나머지 코드를 건너뛰고 다음 반복으로 넘어갑니다.'
          }
        ]
      },
      {
        id: 'py-ch6',
        title: '함수',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=8400',
        duration: '약 30분',
        quiz: [
          {
            id: 'py-ch6-q1',
            question: 'Python에서 함수를 정의할 때 사용하는 키워드는?',
            type: 'short',
            answer: 'def',
            explanation: 'def 키워드로 함수를 정의합니다. 예: def my_func():'
          },
          {
            id: 'py-ch6-q2',
            question: '함수에서 값을 반환할 때 사용하는 키워드는?',
            type: 'short',
            answer: 'return',
            explanation: 'return 키워드를 사용하여 호출한 곳으로 값을 반환합니다.'
          },
          {
            id: 'py-ch6-q3',
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
        id: 'py-ch7',
        title: '리스트·튜플·딕셔너리',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=10200',
        duration: '약 40분',
        quiz: [
          {
            id: 'py-ch7-q1',
            question: '리스트(list)와 튜플(tuple)의 가장 큰 차이점은?',
            type: 'multiple',
            options: [
              '리스트는 숫자만, 튜플은 문자만 저장',
              '리스트는 변경 가능, 튜플은 변경 불가',
              '리스트는 느리고, 튜플은 빠르다',
              '차이가 없다'
            ],
            answer: 1,
            explanation: '리스트는 mutable(변경 가능), 튜플은 immutable(변경 불가)입니다.'
          },
          {
            id: 'py-ch7-q2',
            question: '딕셔너리에서 키(key)로 사용할 수 없는 자료형은?',
            type: 'multiple',
            options: ['문자열(str)', '정수(int)', '리스트(list)', '튜플(tuple)'],
            answer: 2,
            explanation: '리스트는 변경 가능(mutable)하므로 딕셔너리의 키로 사용할 수 없습니다.'
          },
          {
            id: 'py-ch7-q3',
            question: 'fruits = ["사과", "바나나", "포도"]일 때 fruits[1]의 값은?',
            type: 'short',
            answer: '바나나',
            explanation: '인덱스는 0부터 시작하므로 fruits[1]은 두 번째 요소인 "바나나"입니다.'
          }
        ]
      },
      {
        id: 'py-ch8',
        title: '파일 입출력',
        youtubeUrl: 'https://www.youtube.com/watch?v=kWiCuklohdY&t=12000',
        duration: '약 25분',
        quiz: [
          {
            id: 'py-ch8-q1',
            question: '파일을 쓰기 모드로 여는 코드는?',
            type: 'multiple',
            options: [
              'open("file.txt", "r")',
              'open("file.txt", "w")',
              'open("file.txt", "a")',
              'open("file.txt", "x")'
            ],
            answer: 1,
            explanation: '"w"는 write 모드로, 파일을 쓰기 전용으로 엽니다.'
          },
          {
            id: 'py-ch8-q2',
            question: 'with 문을 사용하면 파일을 자동으로 닫아준다.',
            type: 'ox',
            answer: true,
            explanation: 'with 문은 블록이 끝나면 자동으로 파일을 close() 해줍니다.'
          },
          {
            id: 'py-ch8-q3',
            question: '기존 파일 내용 뒤에 이어서 쓰려면 어떤 모드를 사용해야 하나요?',
            type: 'short',
            answer: 'a',
            explanation: '"a"(append) 모드는 기존 내용을 유지하고 뒤에 추가합니다.'
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
