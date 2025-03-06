// 게시글 상세 조회 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const backButton = document.getElementById('backButton');
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const editDeleteBtn = document.getElementById('editDeleteBtn');
    const likesCount = document.getElementById('likesCount');
    const commentsCount = document.getElementById('commentsCount');
    const viewsCount = document.getElementById('viewsCount');
    const commentInput = document.getElementById('commentInput');
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');
    const commentsList = document.getElementById('commentsList');
    
    // 모달 관련 요소
    const deletePostModal = document.getElementById('deletePostModal');
    const cancelDeletePost = document.getElementById('cancelDeletePost');
    const confirmDeletePost = document.getElementById('confirmDeletePost');
    const deleteCommentModal = document.getElementById('deleteCommentModal');
    const cancelDeleteComment = document.getElementById('cancelDeleteComment');
    const confirmDeleteComment = document.getElementById('confirmDeleteComment');
    
    // 템플릿
    const commentTemplate = document.getElementById('commentTemplate');
    
    // 변수
    let postId = getPostIdFromUrl();
    let currentUserId = localStorage.getItem('userId');
    let isCommentEdit = false;
    let editingCommentId = null;
    let isLiked = false;
    
    // 로그인 상태 확인
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 게시글 로드
    loadPostDetail();
    
    // 댓글 로드
    loadComments();
    
    // 좋아요 상태 확인
    checkLikeStatus();
    
    // 뒤로가기 버튼 클릭 이벤트
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // 프로필 드롭다운 토글
    profileDropdownBtn.addEventListener('click', function() {
        profileDropdownMenu.classList.toggle('show');
    });
    
    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.profile-button') && !event.target.matches('#headerProfileImage')) {
            if (profileDropdownMenu.classList.contains('show')) {
                profileDropdownMenu.classList.remove('show');
            }
        }
    });
    
    // 로그아웃 버튼 이벤트
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
        window.location.href = 'login.html';
    });
    
    // 수정/삭제 버튼 클릭 이벤트 (클릭한 부분에 따라 다른 동작)
    editDeleteBtn.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-button')) {
            // 수정 버튼 클릭 시
            window.location.href = `post-edit.html?id=${postId}`;
        } else if (e.target.classList.contains('delete-button')) {
            // 삭제 버튼 클릭 시
            showDeletePostModal();
        }
    });
    
    // 좋아요 버튼 클릭 이벤트
    document.querySelector('.stats-item.likes').addEventListener('click', function() {
        toggleLike();
    });
    
    // 댓글 입력 이벤트 - 내용이 있을 때만 버튼 활성화
    commentInput.addEventListener('input', function() {
        if (this.value.trim()) {
            commentSubmitBtn.classList.add('active');
        } else {
            commentSubmitBtn.classList.remove('active');
        }
    });
    
    // 댓글 제출 버튼 클릭 이벤트
    commentSubmitBtn.addEventListener('click', function() {
        const commentText = commentInput.value.trim();
        if (!commentText) return;
        
        if (isCommentEdit) {
            // 댓글 수정 모드
            updateComment(editingCommentId, commentText);
        } else {
            // 새 댓글 작성 모드
            submitComment(commentText);
        }
    });
    
    // 게시글 삭제 모달 취소 버튼
    cancelDeletePost.addEventListener('click', function() {
        hideDeletePostModal();
    });
    
    // 게시글 삭제 모달 확인 버튼
    confirmDeletePost.addEventListener('click', function() {
        deletePost();
    });
    
    // 댓글 삭제 모달 취소 버튼
    cancelDeleteComment.addEventListener('click', function() {
        hideDeleteCommentModal();
    });
    
    // 댓글 삭제 모달 확인 버튼
    confirmDeleteComment.addEventListener('click', function() {
        deleteComment(editingCommentId);
    });
    
    // URL에서 게시글 ID 추출
    function getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    // 게시글 상세 정보 로드
    async function loadPostDetail() {
        if (!postId) {
            alert('잘못된 접근입니다.');
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // 게시글 조회 API 호출
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displayPostDetail(data.data);
            } else {
                console.error('게시글 조회 실패:', data.message);
                alert('게시글을 불러올 수 없습니다.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            
            // 테스트 목적으로 샘플 데이터 사용
            const samplePost = {
                postId: postId,
                title: '제목 1',
                content: document.getElementById('postBody').textContent,
                author: {
                    userId: 1,
                    nickname: '디미 작성자 1',
                    profileImageUrl: ''
                },
                createdAt: '2021-01-01 00:00:00',
                likes: 123,
                views: 123,
                comments: 123,
                likedByMe: false
            };
            
            displayPostDetail(samplePost);
        }
    }
    
    // 게시글 정보 표시
    function displayPostDetail(post) {
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postBody').textContent = post.content;
        document.getElementById('authorName').textContent = post.author.nickname;
        document.getElementById('postDate').textContent = formatDateTime(post.createdAt);
        
        // 작성자 프로필 이미지 설정
        if (post.author.profileImageUrl) {
            document.getElementById('authorImage').src = post.author.profileImageUrl;
        }
        
        // 좋아요, 조회수, 댓글 수 설정
        likesCount.textContent = formatCount(post.likes);
        commentsCount.textContent = formatCount(post.views);
        viewsCount.textContent = formatCount(post.comments);
        
        // 좋아요 상태 설정
        if (post.likedByMe) {
            document.querySelector('.stats-item.likes').classList.add('active');
            isLiked = true;
        }
        
        // 작성자인 경우에만 수정/삭제 버튼 표시
        if (post.author.userId != currentUserId) {
            editDeleteBtn.style.display = 'none';
        }
    }
    
    // 댓글 목록 로드
    async function loadComments() {
        if (!postId) return;
        
        try {
            // 댓글 목록 조회 API 호출
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displayComments(data.data.content);
            } else {
                console.error('댓글 목록 로드 실패:', data.message);
            }
        } catch (error) {
            console.error('댓글 목록 요청 오류:', error);
            
            // 테스트 목적으로 샘플 데이터 사용
            const sampleComments = [
                {
                    commentId: 1,
                    content: '댓글 내용 1',
                    author: {
                        userId: 1,
                        nickname: '디미 작성자 1',
                        profileImageUrl: ''
                    },
                    createdAt: '2021-01-01 00:00:00'
                },
                {
                    commentId: 2,
                    content: '댓글 내용 2',
                    author: {
                        userId: 2,
                        nickname: '디미 작성자 2',
                        profileImageUrl: ''
                    },
                    createdAt: '2021-01-01 00:00:00'
                },
                {
                    commentId: 3,
                    content: '댓글 내용 3',
                    author: {
                        userId: parseInt(currentUserId),
                        nickname: '내 댓글',
                        profileImageUrl: ''
                    },
                    createdAt: '2021-01-01 00:00:00'
                }
            ];
            
            displayComments(sampleComments);
        }
    }
    
    // 댓글 목록 표시
    function displayComments(comments) {
        commentsList.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<li class="comment-item no-comments">등록된 댓글이 없습니다.</li>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    }
    
    // 댓글 요소 생성
    function createCommentElement(comment) {
        const template = commentTemplate.content.cloneNode(true);
        const commentItem = template.querySelector('.comment-item');
        
        // 댓글 ID 설정
        commentItem.dataset.commentId = comment.commentId;
        
        // 작성자 정보 설정
        commentItem.querySelector('.author-name').textContent = comment.author.nickname;
        if (comment.author.profileImageUrl) {
            commentItem.querySelector('.author-image img').src = comment.author.profileImageUrl;
        }
        
        // 날짜 설정
        commentItem.querySelector('.comment-date').textContent = formatDateTime(comment.createdAt);
        
        // 내용 설정
        commentItem.querySelector('.comment-body').textContent = comment.content;
        
        // 수정/삭제 버튼 (작성자만 표시)
        const editButton = commentItem.querySelector('.comment-edit-button');
        const deleteButton = commentItem.querySelector('.comment-delete-button');
        
        if (comment.author.userId != currentUserId) {
            editButton.style.display = 'none';
            deleteButton.style.display = 'none';
        } else {
            // 수정 버튼 클릭 이벤트
            editButton.addEventListener('click', function() {
                startEditComment(comment.commentId, comment.content);
            });
            
            // 삭제 버튼 클릭 이벤트
            deleteButton.addEventListener('click', function() {
                showDeleteCommentModal(comment.commentId);
            });
        }
        
        return commentItem;
    }
    
    // 댓글 작성 함수
    async function submitComment(content) {
        try {
            // 댓글 작성 API 호출
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 댓글 입력 초기화
                commentInput.value = '';
                commentSubmitBtn.classList.remove('active');
                
                // 댓글 목록 다시 로드
                loadComments();
                
                // 댓글 수 업데이트
                const currentCount = parseInt(viewsCount.textContent);
                viewsCount.textContent = formatCount(currentCount + 1);
            } else {
                console.error('댓글 작성 실패:', data.message);
                alert('댓글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            
            // 테스트 목적으로 댓글 작성 성공 처리
            console.log('테스트용 댓글 작성 처리');
            commentInput.value = '';
            commentSubmitBtn.classList.remove('active');
            
            // 현재 시간으로 새 댓글 추가
            const newComment = {
                commentId: new Date().getTime(),
                content: content,
                author: {
                    userId: parseInt(currentUserId),
                    nickname: localStorage.getItem('nickname') || '테스트 사용자',
                    profileImageUrl: ''
                },
                createdAt: new Date().toISOString()
            };
            
            const commentElement = createCommentElement(newComment);
            commentsList.prepend(commentElement);
            
            // 댓글 수 업데이트
            const currentCount = parseInt(viewsCount.textContent);
            viewsCount.textContent = formatCount(currentCount + 1);
        }
    }
    
    // 댓글 수정 모드 시작
    function startEditComment(commentId, content) {
        isCommentEdit = true;
        editingCommentId = commentId;
        
        // 댓글 내용을 입력창에 설정
        commentInput.value = content;
        commentInput.focus();
        
        // 버튼 텍스트 변경 및 활성화
        commentSubmitBtn.textContent = '댓글 수정';
        commentSubmitBtn.classList.add('active');
        
        // 스크롤을 댓글 입력창으로 이동
        commentInput.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 댓글 수정 함수
    async function updateComment(commentId, content) {
        try {
            // 댓글 수정 API 호출
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // 댓글 입력 초기화
                commentInput.value = '';
                commentSubmitBtn.textContent = '댓글 등록';
                commentSubmitBtn.classList.remove('active');
                
                // 수정 모드 종료
                isCommentEdit = false;
                editingCommentId = null;
                
                // 댓글 목록 다시 로드
                loadComments();
            } else {
                console.error('댓글 수정 실패:', data.message);
                alert('댓글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 수정 오류:', error);
            
            // 테스트 목적으로 댓글 수정 성공 처리
            console.log('테스트용 댓글 수정 처리');
            
            // 해당 댓글 요소 찾기
            const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
            if (commentItem) {
                commentItem.querySelector('.comment-body').textContent = content;
            }
            
            // 댓글 입력 초기화
            commentInput.value = '';
            commentSubmitBtn.textContent = '댓글 등록';
            commentSubmitBtn.classList.remove('active');
            
            // 수정 모드 종료
            isCommentEdit = false;
            editingCommentId = null;
        }
    }
    
    // 댓글 삭제 모달 표시
    function showDeleteCommentModal(commentId) {
        editingCommentId = commentId;
        deleteCommentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    // 댓글 삭제 모달 숨김
    function hideDeleteCommentModal() {
        deleteCommentModal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 허용
    }
    
    // 댓글 삭제 함수
    async function deleteComment(commentId) {
        try {
            // 댓글 삭제 API 호출
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                // 댓글 삭제 모달 숨김
                hideDeleteCommentModal();
                
                // 댓글 목록 다시 로드
                loadComments();
                
                // 댓글 수 업데이트
                const currentCount = parseInt(viewsCount.textContent);
                viewsCount.textContent = formatCount(Math.max(0, currentCount - 1));
            } else {
                console.error('댓글 삭제 실패');
                alert('댓글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 삭제 오류:', error);
            
            // 테스트 목적으로 댓글 삭제 성공 처리
            console.log('테스트용 댓글 삭제 처리');
            
            // 해당 댓글 요소 제거
            const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
            if (commentItem) {
                commentItem.remove();
            }
            
            // 댓글 삭제 모달 숨김
            hideDeleteCommentModal();
            
            // 댓글 수 업데이트
            const currentCount = parseInt(viewsCount.textContent);
            viewsCount.textContent = formatCount(Math.max(0, currentCount - 1));
        }
    }
    
    // 좋아요 상태 확인
    async function checkLikeStatus() {
        if (!postId) return;
        
        try {
            // 좋아요 상태 확인 API 호출 (실제로는 게시글 조회 시 likedByMe 필드로 확인)
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/like/check`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.data.liked) {
                document.querySelector('.stats-item.likes').classList.add('active');
                isLiked = true;
            }
        } catch (error) {
            console.error('좋아요 상태 확인 오류:', error);
            
            // 테스트 목적으로 좋아요 상태는 기본값 사용 (false)
        }
    }
    
    // 좋아요 토글 함수
    async function toggleLike() {
        if (!postId) return;
        
        const likeElement = document.querySelector('.stats-item.likes');
        
        try {
            // 좋아요 또는 좋아요 취소 API 호출
            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                // 좋아요 상태 토글
                isLiked = !isLiked;
                
                // UI 업데이트
                if (isLiked) {
                    likeElement.classList.add('active');
                    likesCount.textContent = formatCount(parseInt(likesCount.textContent) + 1);
                } else {
                    likeElement.classList.remove('active');
                    likesCount.textContent = formatCount(Math.max(0, parseInt(likesCount.textContent) - 1));
                }
            } else {
                console.error('좋아요 토글 실패');
            }
        } catch (error) {
            console.error('좋아요 토글 오류:', error);
            
            // 테스트 목적으로 좋아요 토글 성공 처리
            console.log('테스트용 좋아요 토글 처리');
            
            // 좋아요 상태 토글
            isLiked = !isLiked;
            
            // UI 업데이트
            if (isLiked) {
                likeElement.classList.add('active');
                likesCount.textContent = formatCount(parseInt(likesCount.textContent) + 1);
            } else {
                likeElement.classList.remove('active');
                likesCount.textContent = formatCount(Math.max(0, parseInt(likesCount.textContent) - 1));
            }
        }
    }
    
    // 게시글 삭제 모달 표시
    function showDeletePostModal() {
        deletePostModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    // 게시글 삭제 모달 숨김
    function hideDeletePostModal() {
        deletePostModal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 허용
    }
    
    // 게시글 삭제 함수
    async function deletePost() {
        if (!postId) return;
        
        try {
            // 게시글 삭제 API 호출
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = 'index.html';
            } else {
                console.error('게시글 삭제 실패');
                alert('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            
            // 테스트 목적으로 게시글 삭제 성공 처리
            console.log('테스트용 게시글 삭제 처리');
            alert('게시글이 삭제되었습니다.');
            window.location.href = 'index.html';
        }
    }
    
    // 날짜 포맷 함수
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // 숫자 포맷 함수 (1k, 10k, 100k 등)
    function formatCount(count) {
        if (count >= 100000) {
            return Math.floor(count / 1000) + 'k';
        } else if (count >= 10000) {
            return Math.floor(count / 1000) + 'k';
        } else if (count >= 1000) {
            return Math.floor(count / 1000) + 'k';
        }
        return count.toString();
    }
    
    // 로그아웃 함수
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
    }
});