// post-edit.js - 게시글 수정 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const backButton = document.getElementById('backButton');
    const postEditForm = document.getElementById('postEditForm');
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const postImages = document.getElementById('postImages');
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const imageFileName = document.getElementById('imageFileName');
    const imageHelperText = document.getElementById('imageHelperText');
    const submitButton = document.getElementById('submitButton');
    
    // 변수
    let postId = getPostIdFromUrl();
    let originalPost = {};
    let currentImage = null;
    
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 게시글 데이터 로드
    loadPostData();
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 뒤로가기 버튼 클릭 이벤트
        backButton.addEventListener('click', function() {
            window.location.href = `post-detail.html?id=${postId}`;
        });
        
        // 이미지 업로드 버튼 클릭 이벤트
        imageUploadBtn.addEventListener('click', function() {
            postImages.click();
        });
        
        // 이미지 파일 선택 이벤트
        postImages.addEventListener('change', handleImageSelection);
        
        // 게시글 수정 폼 제출 이벤트
        postEditForm.addEventListener('submit', handlePostUpdate);
    }
    
    /**
     * URL에서 게시글 ID 추출
     */
    function getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    /**
     * 게시글 데이터 로드 함수
     */
    async function loadPostData() {
        if (!postId) {
            alert('잘못된 접근입니다.');
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // 게시글 조회 API 호출
            const response = await fetchAPI(`/posts/${postId}`);
            
            if (!response.ok) {
                throw new Error('게시글 조회 실패');
            }
            
            const data = await response.json();
            
            if (data.status === 200) {
                // 게시글 데이터 저장 및 폼에 표시
                originalPost = data.data;
                displayPostData(originalPost);
            } else {
                console.error('게시글 조회 실패:', data.message);
                alert('게시글을 불러올 수 없습니다.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            
            // 테스트 목적으로 샘플 데이터 사용
            originalPost = generateSamplePost();
            displayPostData(originalPost);
        }
    }
    
    /**
     * 게시글 데이터 표시 함수
     */
    function displayPostData(post) {
        postTitle.value = post.title || '';
        postContent.value = post.content || '';
        
        // 이미지 정보 표시
        if (post.images && post.images.length > 0) {
            const image = post.images[0];
            imageFileName.textContent = image.fileName || '기존 파일 명';
        } else {
            imageFileName.textContent = '이미지 없음';
        }
    }
    
    /**
     * 이미지 선택 처리 함수
     */
    function handleImageSelection() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            
            // 이미지 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                imageHelperText.textContent = '* 이미지 파일만 업로드 가능합니다.';
                imageHelperText.style.visibility = 'visible';
                return;
            }
            
            // 파일 이름 표시
            imageFileName.textContent = file.name;
            currentImage = file;
            
            imageHelperText.style.visibility = 'hidden';
        }
    }
    
    /**
     * 게시글 수정 폼 제출 처리
     */
    async function handlePostUpdate(e) {
        e.preventDefault();
        
        // 입력 검증
        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        
        if (!title || !content) {
            imageHelperText.textContent = '* 제목, 내용을 모두 작성해주세요.';
            imageHelperText.style.visibility = 'visible';
            return;
        }
        
        try {
            // FormData 객체 생성하여 데이터 추가
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            
            // 새 이미지 파일이 있을 경우 추가
            if (currentImage) {
                formData.append('images', currentImage);
            }
            
            // 게시글 수정 API 호출 (직접 fetch 사용)
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // 중요: Content-Type 헤더를 설정하지 않음!
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok || data.status === 200) {
                // 게시글 수정 성공 시 상세 페이지로 이동
                alert('게시글이 수정되었습니다.');
                window.location.href = `post-detail.html?id=${postId}`;
            } else {
                alert(data.message || '게시글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 수정 요청 오류:', error);
            alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    }
    
    /**
     * 게시글 수정 오류 처리
     */
    function handlePostUpdateError(data) {
        if (data.errors && data.errors.length > 0) {
            const errorMessages = data.errors.map(error => error.message).join('\n');
            alert(`게시글 수정에 실패했습니다.\n${errorMessages}`);
        } else {
            alert(`게시글 수정에 실패했습니다.\n${data.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    }
    
    /**
     * 샘플 게시글 생성 (테스트용)
     */
    function generateSamplePost() {
        return {
            postId: postId,
            title: '샘플 게시글 제목',
            content: '이 게시글은 테스트 목적으로 생성된 샘플입니다. 실제 API 응답이 없을 때 표시됩니다.',
            images: []
        };
    }
});