# 커뮤니티 프론트엔드 완성 

## 과제 내용

1. **미니퀘스트 수행**

- JS 응용 교재에 수록된 미니퀘스트 모두 해보기 <br>
 -> 문제의 정답이나 직접적인 해결책을 인터넷 검색이나 GPT 활용 금지. 문법이나 사용법 등은 검색 가능

2. **프론트엔드 JS 코드 작성하여 바닐라로 커뮤니티 완료해오기**

- **2-1.  Event 처리** <br>
✅ 사용자 인터랙션(클릭, 입력 등)을 처리하기 위한 이벤트 리스너를 설정합니다.

- **2-2. Fetch 적용** <br>
✅ 2-1 단계에서 작업한 event에 이어서 Fetch API를 사용해 json 파일에서 데이터를 불러옵니다. <br>
▪ 3주차 5번과제 완료 후 진행해야합니다. <br>
✅ 반드시 이벤트 처리(2-1)부터 시작한 후, Fetch API 적용(2-2) 순서대로 작업하세요. <br>
✅ 임의의 서버에 요청을 보내고 API Response를 받았다고 가정하고 코드를 작성해보세요.

## 과제 시작

### <프로그램 개요>

3주차에서 완성했던 프론트엔드의 커뮤니티 레이아웃 디자인에 JS 코드를 작성하여 사용자 인터렉션을 처리하기 위한 이벤트 리스너를 설정하여 Event 처리를 하고, Fetch를 적용하여 Fetch API를 적용함으로써 바닐라로 커뮤니티를 완료하는 과제를 진행하였다.

### <패키지 구성>

```
2-rosy-chang-community/
│
├── index.html                          # 메인 페이지 (게시물 목록 조회)
├── login.html                          # 로그인 페이지
├── signup.html                         # 회원가입 페이지
├── post-detail.html                    # 게시글 상세 조회 페이지
├── post-edit.html                      # 게시글 수정 페이지
├── post-create.html                    # 게시글 작성 페이지
├── profile-edit.html                   # 회원정보 수정 페이지
├── password-edit.html                  # 비밀번호 수정 페이지
│
├── css/
│   ├── styles.css                      # 공통 스타일
│   ├── login.css                       # 로그인 페이지 스타일
│   ├── signup.css                      # 회원가입 페이지 스타일
│   ├── post-list.css                   # 게시글 목록 조회 페이지 스타일
│   ├── post-detail.css                 # 게시글 상세 조회 페이지 스타일
│   ├── post-create.css                 # 게시글 작성 페이지 스타일
│   ├── profile-edit.css                # 회원정보 수정 페이지 스타일
│   └── profile.css                     # 프로필 관련 페이지 스타일
│
├── js/
│   ├── common.js                       # 공통 유틸리티 함수
│   ├── auth.js                         # 인증 관련 기능
│   ├── login.js                        # 로그인 페이지 기능
│   ├── signup.js                       # 회원가입 페이지 기능
│   ├── post-list.js                    # 게시글 목록 기능
│   ├── post-detail.js                  # 게시글 상세 기능
│   ├── post-edit.js                    # 게시글 수정 기능
│   ├── post-create.js                  # 게시글 작성 기능
│   ├── comment.js                      # 댓글 관련 기능
│   ├── profile-edit.js                 # 회원정보 수정 기능
│   └── password-edit.js                # 비밀번호 수정 기능
│
└── assets/
    └── images/                         # 이미지 파일들
        ├── profile-placeholder.jpg     # 기본 이미지
```


