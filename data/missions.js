/**
 * 사전미션 메타데이터
 * - Python: 8챕터, 챕터별 퀴즈 3문항 (총 24문항)
 * - Git: 11챕터, 챕터별 퀴즈 3문항 (총 33문항)
 * - 강의 URL: 엔코아 AI 캠퍼스 프리코스 게시글 링크
 *   (https://encorecampus.ai/precourse_python / precourse_git — 비밀번호 필요)
 * - 퀴즈는 강의 수강 여부와 관계없이 풀 수 있음
 */

const PY_BASE = 'https://encorecampus.ai/precourse_python/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&bmode=view&t=board&idx=';
const GIT_BASE = 'https://encorecampus.ai/precourse_git/?q=YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9&bmode=view&t=board&idx=';

const MISSIONS = {
  python: {
    id: 'python',
    title: 'Python 기초',
    icon: '🐍',
    description: '엔코아 AI 캠퍼스 프리코스 Python 강의를 학습합니다.',
    playlistUrl: 'https://encorecampus.ai/precourse_python',
    chapters: [
      {
        id: 'py-ch1',
        title: '파이썬 소개 & 개발 환경',
        lessons: [
          { title: '1강. 파이썬으로 할 수 있는 것', url: PY_BASE + '15195977' },
          { title: '2강. 개발 환경 설치',           url: PY_BASE + '15196112' },
          { title: '6강. 화면 출력, 키보드 입력',   url: PY_BASE + '15230591' }
        ],
        duration: '3강',
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
        lessons: [
          { title: '3-1강. 사칙연산, 거듭제곱, 나머지, 다양한 표기법', url: PY_BASE + '15213056' },
          { title: '3-2강. 논리 연산자 및 비교 연산자',                url: PY_BASE + '15213067' },
          { title: '4-1강. 변수',                                       url: PY_BASE + '15213071' },
          { title: '4-2강. 시퀀스 자료형, 문자열',                       url: PY_BASE + '15213085' }
        ],
        duration: '4강',
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
        lessons: [
          { title: '5-1강. if문', url: PY_BASE + '15230562' }
        ],
        duration: '1강',
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
        lessons: [
          { title: '4-3강. 시퀀스 자료형, 리스트',    url: PY_BASE + '15225538' },
          { title: '4-4강. 시퀀스 자료형, 튜플',      url: PY_BASE + '15225547' },
          { title: '4-5강. 시퀀스 자료형, 세트',      url: PY_BASE + '15225554' },
          { title: '4-6강. 시퀀스 자료형, 딕셔너리',  url: PY_BASE + '15225561' },
          { title: '5-2강. for문',                     url: PY_BASE + '15230571' },
          { title: '5-3강. while문, break, continue',  url: PY_BASE + '15230576' },
          { title: '5-4강. List comprehension',        url: PY_BASE + '15230583' }
        ],
        duration: '7강',
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
        lessons: [
          { title: '7-1강. 함수 정의와 호출',         url: PY_BASE + '15230598' },
          { title: '7-2강. 실습 (함수 정의와 호출)',  url: PY_BASE + '15236097' },
          { title: '7-3강. 람다(Lambda)',             url: PY_BASE + '15236108' },
          { title: '7-4강. 내장 함수',                url: PY_BASE + '15236116' }
        ],
        duration: '4강',
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
        id: 'py-ch7',
        title: '클래스 · 객체지향',
        lessons: [
          { title: '8-1강. 클래스 선언, 속성과 메소드', url: PY_BASE + '15236133' },
          { title: '8-2강. self와 비공개 속성',          url: PY_BASE + '15236136' },
          { title: '8-3강. 객체와 클래스',              url: PY_BASE + '15236138' },
          { title: '8-4강. 클래스 상속',                url: PY_BASE + '15236143' }
        ],
        duration: '4강',
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
        lessons: [
          { title: '9강. 모듈 (만들기, 불러오기)',          url: PY_BASE + '15236155' },
          { title: '10강. 내장모듈 (random, datetime)',     url: PY_BASE + '15236163' }
        ],
        duration: '2강',
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
    description: '엔코아 AI 캠퍼스 프리코스 Git & GitHub 강의 11개 챕터를 학습합니다.',
    playlistUrl: 'https://encorecampus.ai/precourse_git',
    chapters: [
      {
        id: 'git-ch1',
        title: 'Git 개요 및 설치',
        lessons: [{ title: '1강. Git 개요 및 설치', url: GIT_BASE + '15378447' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch1-q1',
            question: 'Git은 어떤 종류의 도구인가요?',
            type: 'multiple',
            options: ['빌드 도구', '분산형 버전 관리 시스템', '코드 에디터', '컨테이너 도구'],
            answer: 1,
            explanation: 'Git은 분산형 버전 관리 시스템(DVCS)입니다.'
          },
          {
            id: 'git-ch1-q2',
            question: 'Windows에서 Git을 설치하면 함께 제공되는 Bash 환경의 이름은?',
            type: 'short',
            answer: 'Git Bash',
            explanation: 'Git for Windows에는 Git Bash라는 Unix 스타일의 셸이 포함되어 있습니다.'
          },
          {
            id: 'git-ch1-q3',
            question: '설치된 Git의 버전을 확인하는 명령어는?',
            type: 'short',
            answer: 'git --version',
            explanation: 'git --version 명령어로 설치된 Git 버전을 확인할 수 있습니다.'
          }
        ]
      },
      {
        id: 'git-ch2',
        title: 'Git 기본 설정 (프로젝트 경로 생성 및 Git 초기화)',
        lessons: [{ title: '2강. Git 기본 설정 (프로젝트 경로 생성 및 Git 초기화)', url: GIT_BASE + '15378455' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch2-q1',
            question: '현재 폴더를 Git 저장소로 초기화하는 명령어는?',
            type: 'short',
            answer: 'git init',
            explanation: 'git init 명령어는 현재 디렉터리를 Git 저장소로 만들고 .git 폴더를 생성합니다.'
          },
          {
            id: 'git-ch2-q2',
            question: 'Git 초기화 시 생성되는 숨김 폴더의 이름은?',
            type: 'short',
            answer: '.git',
            explanation: '.git 폴더에는 Git이 버전 관리를 위해 필요한 모든 메타데이터가 저장됩니다.'
          },
          {
            id: 'git-ch2-q3',
            question: '커밋 시 사용할 사용자 이름을 전역으로 설정하는 명령어는?',
            type: 'multiple',
            options: [
              'git config user.name "이름"',
              'git config --global user.name "이름"',
              'git set username "이름"',
              'git init --user "이름"'
            ],
            answer: 1,
            explanation: '--global 옵션은 시스템 전역에 사용자 정보를 설정합니다.'
          }
        ]
      },
      {
        id: 'git-ch3',
        title: 'Git 기본 설정 (매뉴얼 보는 방법)',
        lessons: [{ title: '3강. Git 기본 설정 (매뉴얼 보는 방법)', url: GIT_BASE + '15378462' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch3-q1',
            question: 'Git 명령어의 상세한 도움말(매뉴얼)을 보는 명령어로 올바른 것은?',
            type: 'multiple',
            options: ['git help <명령어>', 'git man <명령어>', 'git info <명령어>', 'git docs <명령어>'],
            answer: 0,
            explanation: 'git help <명령어> 또는 git <명령어> --help 를 사용하면 상세한 매뉴얼을 볼 수 있습니다.'
          },
          {
            id: 'git-ch3-q2',
            question: 'commit 명령어의 짧은 도움말을 보는 명령어는?',
            type: 'short',
            answer: 'git commit -h',
            explanation: '-h 옵션은 간단한 옵션 목록을, --help는 매뉴얼 페이지를 보여줍니다.'
          },
          {
            id: 'git-ch3-q3',
            question: '현재 Git 설정값을 모두 확인하는 명령어는?',
            type: 'multiple',
            options: ['git config --list', 'git settings', 'git show config', 'git list-config'],
            answer: 0,
            explanation: 'git config --list 명령어로 현재 적용된 모든 Git 설정을 확인할 수 있습니다.'
          }
        ]
      },
      {
        id: 'git-ch4',
        title: 'Git 핵심 세 가지 상태',
        lessons: [{ title: '4강. Git 핵심 세 가지 상태', url: GIT_BASE + '15378467' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch4-q1',
            question: 'Git의 핵심 세 가지 상태(영역)가 아닌 것은?',
            type: 'multiple',
            options: ['Working Directory (작업 영역)', 'Staging Area (스테이징 영역)', 'Repository (저장소)', 'Production (배포 영역)'],
            answer: 3,
            explanation: 'Git의 세 가지 영역은 작업 디렉터리, 스테이징, 저장소입니다. 배포는 Git 자체의 영역이 아닙니다.'
          },
          {
            id: 'git-ch4-q2',
            question: '커밋 직전, 변경 사항을 모아 두는 중간 영역의 이름은?',
            type: 'short',
            answer: 'Staging Area',
            explanation: 'Staging Area(또는 Index)는 다음 커밋에 포함될 파일들을 준비하는 영역입니다.'
          },
          {
            id: 'git-ch4-q3',
            question: '아직 Git이 추적하지 않는 파일의 상태를 무엇이라 하나요?',
            type: 'multiple',
            options: ['modified', 'staged', 'untracked', 'committed'],
            answer: 2,
            explanation: 'untracked 상태는 Git이 아직 추적하고 있지 않은 새로운 파일을 의미합니다.'
          }
        ]
      },
      {
        id: 'git-ch5',
        title: 'Git의 주요 작업 흐름 및 Commit',
        lessons: [{ title: '5강. Git의 주요 작업 흐름 및 Commit', url: GIT_BASE + '15378479' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch5-q1',
            question: '현재 작업 디렉터리의 상태를 확인하는 명령어는?',
            type: 'short',
            answer: 'git status',
            explanation: 'git status는 변경되거나 추적되지 않은 파일을 보여줍니다.'
          },
          {
            id: 'git-ch5-q2',
            question: '특정 파일을 스테이징 영역에 추가하는 명령어는?',
            type: 'multiple',
            options: ['git stage <파일>', 'git add <파일>', 'git commit <파일>', 'git push <파일>'],
            answer: 1,
            explanation: 'git add <파일> 명령어로 변경된 파일을 스테이징 영역으로 옮깁니다.'
          },
          {
            id: 'git-ch5-q3',
            question: '메시지를 포함하여 커밋하는 명령어로 올바른 것은?',
            type: 'multiple',
            options: [
              'git commit "메시지"',
              'git commit -m "메시지"',
              'git commit --message="메시지" -all',
              'git save -m "메시지"'
            ],
            answer: 1,
            explanation: '-m 옵션을 사용하면 에디터를 열지 않고 한 줄 메시지로 커밋할 수 있습니다.'
          }
        ]
      },
      {
        id: 'git-ch6',
        title: 'Git의 주요 작업 흐름 및 Commit (실습)',
        lessons: [{ title: '6강. Git의 주요 작업 흐름 및 Commit (실습)', url: GIT_BASE + '15378487' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch6-q1',
            question: '현재 디렉터리의 모든 변경 사항을 한 번에 스테이징하는 명령어는?',
            type: 'short',
            answer: 'git add .',
            explanation: 'git add . 명령어는 현재 디렉터리 이하의 모든 변경 사항을 스테이징합니다.'
          },
          {
            id: 'git-ch6-q2',
            question: '커밋 히스토리를 한 줄씩 간략하게 보는 옵션은?',
            type: 'multiple',
            options: ['git log --oneline', 'git log --short', 'git log --brief', 'git log --simple'],
            answer: 0,
            explanation: 'git log --oneline 옵션은 각 커밋을 한 줄로 요약해 보여줍니다.'
          },
          {
            id: 'git-ch6-q3',
            question: '스테이징 영역에 추가했던 파일을 다시 작업 디렉터리로 되돌리는 명령어는?',
            type: 'multiple',
            options: ['git unstage <파일>', 'git restore --staged <파일>', 'git remove <파일>', 'git revert <파일>'],
            answer: 1,
            explanation: 'git restore --staged <파일> 명령어로 스테이징을 취소할 수 있습니다(최신 Git 기준).'
          }
        ]
      },
      {
        id: 'git-ch7',
        title: '로컬 작업을 Github에 연동하기',
        lessons: [{ title: '7강. 로컬 작업을 Github에 연동하기', url: GIT_BASE + '15378494' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch7-q1',
            question: '원격 저장소 주소를 origin이라는 이름으로 등록하는 명령어는?',
            type: 'multiple',
            options: [
              'git remote add origin <URL>',
              'git add remote origin <URL>',
              'git origin add <URL>',
              'git remote set <URL>'
            ],
            answer: 0,
            explanation: 'git remote add <이름> <URL> 형식으로 원격 저장소를 등록합니다.'
          },
          {
            id: 'git-ch7-q2',
            question: '로컬 main 브랜치를 origin 원격 저장소에 처음 푸시할 때 자주 사용하는 옵션은?',
            type: 'multiple',
            options: ['-u', '--force', '--all', '-r'],
            answer: 0,
            explanation: '-u(또는 --set-upstream) 옵션은 추적 관계를 설정하여 이후 git push 만으로 푸시할 수 있게 합니다.'
          },
          {
            id: 'git-ch7-q3',
            question: '등록된 원격 저장소 목록을 URL과 함께 확인하는 명령어는?',
            type: 'short',
            answer: 'git remote -v',
            explanation: 'git remote -v 명령어로 원격 저장소 이름과 URL을 함께 확인할 수 있습니다.'
          }
        ]
      },
      {
        id: 'git-ch8',
        title: '내용 확인과 변경사항 비교하기',
        lessons: [{ title: '8강. 내용 확인과 변경사항 비교하기', url: GIT_BASE + '15378498' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch8-q1',
            question: '아직 스테이징되지 않은 변경 사항을 확인하는 명령어는?',
            type: 'short',
            answer: 'git diff',
            explanation: 'git diff는 작업 디렉터리와 스테이징 영역의 차이를 보여줍니다.'
          },
          {
            id: 'git-ch8-q2',
            question: '스테이징 영역과 마지막 커밋의 차이를 보는 명령어는?',
            type: 'multiple',
            options: ['git diff', 'git diff --staged', 'git diff HEAD', 'git diff --all'],
            answer: 1,
            explanation: 'git diff --staged (또는 --cached) 옵션으로 스테이징된 변경 사항을 볼 수 있습니다.'
          },
          {
            id: 'git-ch8-q3',
            question: '특정 커밋의 상세 내용과 변경 내역을 보는 명령어는?',
            type: 'multiple',
            options: ['git log <commit>', 'git show <commit>', 'git view <commit>', 'git inspect <commit>'],
            answer: 1,
            explanation: 'git show <커밋해시> 명령어로 해당 커밋의 메시지와 변경 내역을 확인할 수 있습니다.'
          }
        ]
      },
      {
        id: 'git-ch9',
        title: '리모트의 레포 복제 및 설정하기',
        lessons: [{ title: '9강. 리모트의 레포 복제 및 설정하기', url: GIT_BASE + '15378503' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch9-q1',
            question: '원격 저장소를 통째로 내려받아 로컬에 복제하는 명령어는?',
            type: 'short',
            answer: 'git clone',
            explanation: 'git clone <URL> 명령어로 원격 저장소를 로컬에 복제할 수 있습니다.'
          },
          {
            id: 'git-ch9-q2',
            question: '원격 저장소의 최신 정보를 가져오지만 자동 병합은 하지 않는 명령어는?',
            type: 'multiple',
            options: ['git pull', 'git fetch', 'git sync', 'git update'],
            answer: 1,
            explanation: 'git fetch는 원격의 변경 내용만 가져오고 병합은 수행하지 않습니다. git pull = git fetch + git merge.'
          },
          {
            id: 'git-ch9-q3',
            question: '원격 저장소의 변경 사항을 가져오고 현재 브랜치에 병합까지 수행하는 명령어는?',
            type: 'short',
            answer: 'git pull',
            explanation: 'git pull은 fetch + merge를 한 번에 수행합니다.'
          }
        ]
      },
      {
        id: 'git-ch10',
        title: '협업과 충돌 해결하기',
        lessons: [{ title: '10강. 협업과 충돌 해결하기', url: GIT_BASE + '15378510' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch10-q1',
            question: '같은 줄을 동시에 수정한 두 변경 내역을 병합할 때 발생하는 상황은?',
            type: 'multiple',
            options: ['Fast-forward', '충돌(Conflict)', '자동 머지', 'Rebase'],
            answer: 1,
            explanation: '같은 파일의 같은 영역을 양쪽에서 수정한 경우 충돌(Conflict)이 발생합니다.'
          },
          {
            id: 'git-ch10-q2',
            question: '충돌 발생 시 파일 안에 표시되는 구분선 중 위쪽 영역을 나타내는 마커는?',
            type: 'multiple',
            options: ['<<<<<<< HEAD', '======', '>>>>>>> branch', '!!!!!!! merge'],
            answer: 0,
            explanation: '<<<<<<< HEAD 부터 ======= 까지가 현재 브랜치의 내용, ======= 부터 >>>>>>> 까지가 머지 대상 브랜치의 내용입니다.'
          },
          {
            id: 'git-ch10-q3',
            question: '충돌을 해결한 뒤 반드시 거쳐야 하는 작업 흐름으로 옳은 것은?',
            type: 'multiple',
            options: [
              '수정 → push 만 수행',
              '수정 → git add → git commit',
              '수정 → git reset',
              '수정 → git clone 다시'
            ],
            answer: 1,
            explanation: '충돌 해결 후에는 수정된 파일을 git add로 스테이징하고 git commit으로 머지 커밋을 완료해야 합니다.'
          }
        ]
      },
      {
        id: 'git-ch11',
        title: '브랜치 활용',
        lessons: [{ title: '11강. 브랜치 활용', url: GIT_BASE + '15378514' }],
        duration: '1강',
        quiz: [
          {
            id: 'git-ch11-q1',
            question: '새 브랜치를 만들면서 동시에 그 브랜치로 이동하는 명령어는?',
            type: 'multiple',
            options: [
              'git branch <이름>',
              'git checkout <이름>',
              'git checkout -b <이름>',
              'git switch <이름>'
            ],
            answer: 2,
            explanation: 'git checkout -b <이름> (또는 git switch -c <이름>)으로 브랜치 생성과 이동을 한 번에 수행합니다.'
          },
          {
            id: 'git-ch11-q2',
            question: '로컬에 존재하는 브랜치 목록을 확인하는 명령어는?',
            type: 'short',
            answer: 'git branch',
            explanation: 'git branch 명령어는 로컬 브랜치 목록을 보여주며, 현재 브랜치에는 * 표시가 됩니다.'
          },
          {
            id: 'git-ch11-q3',
            question: '다른 브랜치의 변경 내용을 현재 브랜치로 가져와 합치는 명령어는?',
            type: 'short',
            answer: 'git merge',
            explanation: 'git merge <브랜치명>은 지정한 브랜치의 변경 내용을 현재 브랜치로 병합합니다.'
          }
        ]
      }
    ]
  }
};

// 미션 순서
const MISSION_ORDER = ['python', 'git'];

// ──────────────────────────────────────────────
//  과정(Course) · 기수(Cohort) 정의
// ──────────────────────────────────────────────
const COURSES = [
  {
    id: 'mlops',
    title: 'MLOps 엔지니어 과정',
    short: 'MLOps',
    icon: '⚙️',
    description: '모델 학습·배포·운영 자동화 파이프라인을 다루는 MLOps 엔지니어를 양성합니다.'
  },
  {
    id: 'ml',
    title: '머신러닝 엔지니어 과정',
    short: 'ML',
    icon: '🧠',
    description: '데이터 분석부터 모델링·튜닝까지 핵심 ML 역량을 갖춘 엔지니어를 양성합니다.'
  },
  {
    id: 'ai-orch',
    title: 'AI 오케스트레이션 과정',
    short: 'AI Orch.',
    icon: '🤖',
    description: 'LLM·에이전트·툴 사용을 조율하는 AI 오케스트레이션 전문가를 양성합니다.'
  }
];

// 기수: 각 과정당 1~10기
const COHORTS = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  label: `${i + 1}기`
}));

function getCourseById(id) { return COURSES.find(c => c.id === id) || null; }
function getCohortById(id) { return COHORTS.find(c => c.id === String(id)) || null; }

function getTotalChapters() {
  return MISSION_ORDER.reduce((sum, key) => sum + MISSIONS[key].chapters.length, 0);
}

function getQuizChapterCount() {
  let count = 0;
  MISSION_ORDER.forEach(key => {
    MISSIONS[key].chapters.forEach(ch => {
      if (ch.quiz && ch.quiz.length > 0) count++;
    });
  });
  return count;
}

function getMissionData() { return MISSIONS; }
