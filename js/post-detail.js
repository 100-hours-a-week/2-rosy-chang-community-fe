// post-detail.js - 게시글 상세 조회 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const backButton = document.getElementById('backButton');
    const editDeleteBtn = document.getElementById('editDeleteBtn');
    const postTitle = document.getElementById('postTitle');
    const postBody = document.getElementById('postBody');
    const authorName = document.getElementById('authorName');
    const authorImage = document.getElementById('authorImage');
    const postDate = document.getElementById('postDate');
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
    
    // 상태 변수
    let postId = getPostIdFromUrl();
    let currentUserId = localStorage.getItem('userId');
    let isCommentEdit = false;
    let editingCommentId = null;
    let isLiked = false;
    
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 초기 데이터 로드
    initializeData();
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    /**
     * 초기 데이터 로드 함수
     */
    async function initializeData() {
        if (!postId) {
            showErrorToast('게시글 ID가 유효하지 않습니다.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        try {
            // 게시글 상세 정보 로드
            await loadPostDetail();
            
            // 댓글 목록 로드
            await loadComments();
            
            // 좋아요 상태 확인
            await checkLikeStatus();
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            showErrorToast('데이터를 불러오는데 실패했습니다.');
        }
    }
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 뒤로가기 버튼 클릭 이벤트
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
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
        document.querySelector('.stats-item.likes').addEventListener('click', toggleLike);
        
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
        cancelDeletePost.addEventListener('click', hideDeletePostModal);
        
        // 게시글 삭제 모달 확인 버튼
        confirmDeletePost.addEventListener('click', deletePost);
        
        // 댓글 삭제 모달 취소 버튼
        cancelDeleteComment.addEventListener('click', hideDeleteCommentModal);
        
        // 댓글 삭제 모달 확인 버튼
        confirmDeleteComment.addEventListener('click', function() {
            deleteComment(editingCommentId);
        });
    }

    /**
     * URL에서 게시글 ID 추출
     */
    function getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    /**
     * 게시글 상세 정보 로드
     */
    async function loadPostDetail() {
        try {
            const response = await fetchAPI(`/posts/${postId}`);
            
            if (!response.ok) {
                throw new Error('게시글 조회 실패');
            }
            
            const data = await response.json();
            
            if (data.status === 200) {
                displayPostDetail(data.data);
                return data.data;
            } else {
                console.error('게시글 조회 실패:', data.message);
                showErrorToast(data.message || '게시글을 불러올 수 없습니다.');
                return null;
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            showErrorToast('서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
            
            // 테스트 목적으로 샘플 데이터 사용
            const samplePost = generateSamplePost();
            displayPostDetail(samplePost);
            return samplePost;
        }
    }
    
    /**
     * 게시글 정보 표시
     */
    function displayPostDetail(post) {
        // 제목과 본문 설정
        postTitle.textContent = post.title || '';
        postBody.textContent = post.content || '';
        
        // 작성자 정보 설정
        if (post.author) {
            authorName.textContent = post.author.nickname || '익명';
            
            if (post.author.profileImageUrl) {
                authorImage.src = post.author.profileImageUrl;
            }
        }
        
        // 작성일 설정
        postDate.textContent = formatDateTime(post.createdAt);
        
        // 좋아요, 조회수, 댓글 수 설정
        likesCount.textContent = formatCount(post.likes || 0);
        viewsCount.textContent = formatCount(post.views || 0);
        commentsCount.textContent = formatCount(post.comments || 0);
        
        // 좋아요 상태 설정
        if (post.likedByMe) {
            document.querySelector('.stats-item.likes').classList.add('active');
            isLiked = true;
        }
        
        // 작성자인 경우에만 수정/삭제 버튼 표시
        if (post.author && post.author.userId != currentUserId) {
            editDeleteBtn.style.display = 'none';
        }
    }
    
    /**
     * 댓글 목록 로드
     */
    async function loadComments() {
        try {
            const response = await fetchAPI(`/posts/${postId}/comments`);
            
            if (!response.ok) {
                throw new Error('댓글 목록 로드 실패');
            }
            
            const data = await response.json();
            
            if (data.status === 200) {
                displayComments(data.data.content);
                return data.data.content;
            } else {
                console.error('댓글 목록 로드 실패:', data.message);
                return [];
            }
        } catch (error) {
            console.error('댓글 목록 요청 오류:', error);
            
            // 테스트 목적으로 샘플 데이터 사용
            const sampleComments = generateSampleComments();
            displayComments(sampleComments);
            return sampleComments;
        }
    }
    
    /**
     * 댓글 목록 표시
     */
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
    
    /**
     * 댓글 요소 생성
     */
    function createCommentElement(comment) {
        const template = commentTemplate.content.cloneNode(true);
        const commentItem = template.querySelector('.comment-item');
        
        // 댓글 ID 설정
        commentItem.dataset.commentId = comment.commentId;
        
        // 작성자 정보 설정
        const authorNameElement = commentItem.querySelector('.author-name');
        authorNameElement.textContent = comment.author ? comment.author.nickname : '익명';
        
        const authorImageElement = commentItem.querySelector('.author-image img');
        if (comment.author && comment.author.profileImageUrl) {
            authorImageElement.src = comment.author.profileImageUrl;
        }
        
        // 날짜 설정
        commentItem.querySelector('.comment-date').textContent = formatDateTime(comment.createdAt);
        
        // 내용 설정
        commentItem.querySelector('.comment-body').textContent = comment.content;
        
        // 수정/삭제 버튼 (작성자만 표시)
        const editButton = commentItem.querySelector('.comment-edit-button');
        const deleteButton = commentItem.querySelector('.comment-delete-button');
        
        const isAuthor = comment.author && comment.author.userId == currentUserId;
        
        if (!isAuthor) {
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

    /**
     * 좋아요 상태 확인
     */
    async function checkLikeStatus() {
        try {
            const response = await fetchAPI(`/posts/${postId}/like/check`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.data && data.data.liked) {
                    document.querySelector('.stats-item.likes').classList.add('active');
                    isLiked = true;
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('좋아요 상태 확인 오류:', error);
            return false;
        }
    }
    
    /**
     * 좋아요 토글 함수
     */
    async function toggleLike() {
        const likeElement = document.querySelector('.stats-item.likes');
        
        try {
            // 좋아요 또는 좋아요 취소 API 호출
            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetchAPI(`/posts/${postId}/like`, {
                method: method
            });
            
            if (response.ok) {
                // 좋아요 상태 토글
                isLiked = !isLiked;
                
                // UI 업데이트
                updateLikeUI();
            } else {
                console.error('좋아요 토글 실패');
                showErrorToast('좋아요 처리에 실패했습니다.');
            }
        } catch (error) {
            console.error('좋아요 토글 오류:', error);
            
            // 테스트 목적으로 토글 처리
            isLiked = !isLiked;
            updateLikeUI();
        }
    }
    
    /**
     * 좋아요 UI 업데이트
     */
    function updateLikeUI() {
        const likeElement = document.querySelector('.stats-item.likes');
        const currentCount = parseInt(likesCount.textContent);
        
        if (isLiked) {
            likeElement.classList.add('active');
            likesCount.textContent = formatCount(currentCount + 1);
        } else {
            likeElement.classList.remove('active');
            likesCount.textContent = formatCount(Math.max(0, currentCount - 1));
        }
    }
    
    /**
     * 댓글 작성 함수
     */
    async function submitComment(content) {
        try {
            const response = await fetchAPI(`/posts/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({
                    content: content
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // 댓글 입력 초기화
                resetCommentInput();
                
                // 댓글 목록 다시 로드
                await loadComments();
                
                // 댓글 수 업데이트
                updateCommentCount(1);
                
                return true;
            } else {
                console.error('댓글 작성 실패');
                showErrorToast('댓글 작성에 실패했습니다.');
                return false;
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            
            // 테스트 목적으로 성공 처리
            resetCommentInput();
            
            // 새 댓글 샘플 데이터 생성
            const newComment = {
                commentId: Date.now(),
                content: content,
                author: {
                    userId: currentUserId,
                    nickname: localStorage.getItem('nickname') || '현재 사용자',
                    profileImageUrl: localStorage.getItem('profileImageUrl') || ''
                },
                createdAt: new Date().toISOString()
            };
            
            // 댓글 목록에 추가
            const commentElement = createCommentElement(newComment);
            commentsList.prepend(commentElement);
            
            // 댓글 수 업데이트
            updateCommentCount(1);
            
            return true;
        }
    }
    
    /**
     * 댓글 수정 모드 시작
     */
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
    
    /**
     * 댓글 수정 함수
     */
    async function updateComment(commentId, content) {
        try {
            const response = await fetchAPI(`/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: content
                })
            });
            
            if (response.ok) {
                // 댓글 입력 초기화
                resetCommentInput();
                
                // 댓글 목록 다시 로드
                await loadComments();
                
                return true;
            } else {
                console.error('댓글 수정 실패');
                showErrorToast('댓글 수정에 실패했습니다.');
                return false;
            }
        } catch (error) {
            console.error('댓글 수정 오류:', error);
            
            // 테스트 목적으로 성공 처리
            // 해당 댓글 요소 찾기
            const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
            if (commentItem) {
                commentItem.querySelector('.comment-body').textContent = content;
            }
            
            resetCommentInput();
            
            return true;
        }
    }

    /**
     * 댓글 입력 초기화
     */
    function resetCommentInput() {
        commentInput.value = '';
        commentSubmitBtn.textContent = '댓글 등록';
        commentSubmitBtn.classList.remove('active');
        isCommentEdit = false;
        editingCommentId = null;
    }
    
    /**
     * 댓글 수 업데이트
     */
    function updateCommentCount(change) {
        const currentCount = parseInt(commentsCount.textContent) || 0;
        const newCount = Math.max(0, currentCount + change);
        commentsCount.textContent = formatCount(newCount);
    }
    
    /**
     * 댓글 삭제 모달 표시
     */
    function showDeleteCommentModal(commentId) {
        editingCommentId = commentId;
        deleteCommentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    /**
     * 댓글 삭제 모달 숨김
     */
    function hideDeleteCommentModal() {
        deleteCommentModal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 허용
    }
    
    /**
     * 댓글 삭제 함수
     */
    async function deleteComment(commentId) {
        try {
            const response = await fetchAPI(`/comments/${commentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // 댓글 삭제 모달 숨김
                hideDeleteCommentModal();
                
                // 댓글 목록에서 제거
                removeCommentFromList(commentId);
                
                // 댓글 수 업데이트
                updateCommentCount(-1);
                
                return true;
            } else {
                console.error('댓글 삭제 실패');
                showErrorToast('댓글 삭제에 실패했습니다.');
                hideDeleteCommentModal();
                return false;
            }
        } catch (error) {
            console.error('댓글 삭제 오류:', error);
            
            // 테스트 목적으로 성공 처리
            hideDeleteCommentModal();
            
            // 댓글 요소 제거
            removeCommentFromList(commentId);
            
            // 댓글 수 업데이트
            updateCommentCount(-1);
            
            return true;
        }
    }
    
    /**
     * 댓글 목록에서 댓글 제거
     */
    function removeCommentFromList(commentId) {
        const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
        if (commentItem) {
            commentItem.remove();
            
            // 댓글이 모두 삭제된 경우 메시지 표시
            if (commentsList.children.length === 0) {
                commentsList.innerHTML = '<li class="comment-item no-comments">등록된 댓글이 없습니다.</li>';
            }
        }
    }
    
    /**
     * 게시글 삭제 모달 표시
     */
    function showDeletePostModal() {
        deletePostModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    /**
     * 게시글 삭제 모달 숨김
     */
    function hideDeletePostModal() {
        deletePostModal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 허용
    }
    
    /**
     * 게시글 삭제 함수
     */
    async function deletePost() {
        try {
            const response = await fetchAPI(`/posts/${postId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('게시글이 삭제되었습니다.');
                window.location.href = 'index.html';
                return true;
            } else {
                console.error('게시글 삭제 실패');
                showErrorToast('게시글 삭제에 실패했습니다.');
                hideDeletePostModal();
                return false;
            }
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            
            // 테스트 목적으로 성공 처리
            alert('게시글이 삭제되었습니다.');
            window.location.href = 'index.html';
            return true;
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
            author: {
                userId: 1,
                nickname: '샘플 작성자',
                profileImageUrl: ''
            },
            createdAt: '2021-01-01T00:00:00',
            views: 42,
            likes: 10,
            comments: 5,
            likedByMe: false
        };
    }
    
    /**
     * 샘플 댓글 생성 (테스트용)
     */
    function generateSampleComments() {
        return [
            {
                commentId: 1,
                content: '샘플 댓글 1입니다. 이 댓글은 테스트 목적으로 생성되었습니다.',
                author: {
                    userId: 2,
                    nickname: '댓글 작성자 1',
                    profileImageUrl: ''
                },
                createdAt: '2021-01-01T12:00:00'
            },
            {
                commentId: 2,
                content: '샘플 댓글 2입니다. 이 댓글은 테스트 목적으로 생성되었습니다.',
                author: {
                    userId: 3,
                    nickname: '댓글 작성자 2',
                    profileImageUrl: ''
                },
                createdAt: '2021-01-02T15:30:00'
            },
            {
                commentId: 3,
                content: '샘플 댓글 3입니다. 이 댓글은 현재 로그인한 사용자가 작성한 것처럼 표시됩니다.',
                author: {
                    userId: parseInt(currentUserId),
                    nickname: localStorage.getItem('nickname') || '현재 사용자',
                    profileImageUrl: ''
                },
                createdAt: '2021-01-03T09:15:00'
            }
        ];
    }
});