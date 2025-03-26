// post-create.js - 게시글 작성 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const backButton = document.getElementById('backButton');
    const postCreateForm = document.getElementById('postCreateForm');
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const postImages = document.getElementById('postImages');
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const imageFileName = document.getElementById('imageFileName');
    const imageHelperText = document.getElementById('imageHelperText');
    const submitButton = document.getElementById('submitButton');
    
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 뒤로가기 버튼 클릭 이벤트
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        
        // 이미지 업로드 버튼 클릭 이벤트
        imageUploadBtn.addEventListener('click', function() {
            postImages.click();
        });
        
        // 이미지 파일 선택 이벤트
        postImages.addEventListener('change', handleImageSelection);
        
        // 제목 입력 이벤트 - 26자 제한
        postTitle.addEventListener('input', function() {
            // 최대 길이 검증은 maxlength 속성으로 처리됨
            updateSubmitButtonState();
        });
        
        // 본문 입력 이벤트
        postContent.addEventListener('input', function() {
            updateSubmitButtonState();
        });
        
        // 게시글 작성 폼 제출 이벤트
        postCreateForm.addEventListener('submit', handlePostSubmit);
    }
    
    /**
     * 이미지 선택 처리 함수
     */
    function handleImageSelection() {
        if (this.files && this.files.length > 0) {
            // 파일 이름 표시
            const fileNames = Array.from(this.files)
                .map(file => file.name)
                .join(', ');
            
            imageFileName.textContent = fileNames;
            
            // 이미지 파일 타입 검증
            const invalidFiles = Array.from(this.files).filter(file => !file.type.startsWith('image/'));
            if (invalidFiles.length > 0) {
                imageHelperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
                imageHelperText.style.visibility = 'visible';
            } else {
                imageHelperText.style.visibility = 'hidden';
            }
        } else {
            imageFileName.textContent = '파일을 선택해주세요.';
            imageHelperText.style.visibility = 'hidden';
        }
        
        updateSubmitButtonState();
    }
    
    /**
     * 게시글 작성 폼 제출 처리
     */
    async function handlePostSubmit(e) {
        e.preventDefault();
        
        // 입력 검증
        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        
        if (!title || !content) {
            // 필수 입력값 누락 시 에러 메시지
            imageHelperText.textContent = '* 제목, 내용을 모두 작성해주세요.';
            imageHelperText.style.visibility = 'visible';
            return;
        }
        
        try {
            // FormData 객체 생성하여 데이터 추가
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            
            // 이미지 파일 추가
            if (postImages.files && postImages.files.length > 0) {
                for (let i = 0; i < postImages.files.length; i++) {
                    formData.append('images', postImages.files[i]);
                }
            }
            
            // 게시글 작성 API 호출 (직접 fetch 사용)
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // 중요: Content-Type 헤더를 설정하지 않음!
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok || data.status === 201) {
                // 게시글 작성 성공 시 상세 페이지로 이동
                alert('게시글이 작성되었습니다.');
                window.location.href = `post-detail.html?id=${data.data.postId}`;
            } else {
                alert(data.message || '게시글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 작성 요청 오류:', error);
            alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    /**
     * 게시글 제출 오류 처리
     */
    function handlePostSubmitError(data) {
        if (data.errors && data.errors.length > 0) {
            const errorMessages = data.errors.map(error => error.message).join('\n');
            alert(`게시글 작성에 실패했습니다.\n${errorMessages}`);
        } else {
            alert(`게시글 작성에 실패했습니다.\n${data.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    }
    
    /**
     * 완료 버튼 상태 업데이트 함수
     */
    function updateSubmitButtonState() {
        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        
        if (title && content) {
            submitButton.classList.add('active');
        } else {
            submitButton.classList.remove('active');
        }
        
        // 오류 메시지가 표시된 경우 숨기기
        if (title && content) {
            imageHelperText.style.visibility = 'hidden';
        }
    }
});