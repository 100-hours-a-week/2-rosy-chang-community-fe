// post-list.js - 게시글 목록 조회 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const createPostBtn = document.getElementById('createPostBtn');
    const postList = document.getElementById('postList');
    const postCardTemplate = document.getElementById('postCardTemplate');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const userNickname = document.querySelector('.user-nickname');
    
    // 페이지네이션 변수
    let currentPage = 1;
    const pageSize = 10;
    let isLoading = false;
    let hasMorePosts = true;
    
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return; // checkLoginStatus 함수 내에서 리다이렉트 처리
    }
    
    // 사용자 닉네임 표시
    const nickname = localStorage.getItem('nickname');
    if (nickname) {
        userNickname.textContent = nickname;
    }
    
    // 이벤트 리스너 초기화
    initEventListeners();
    
    // 초기 게시글 로드
    loadPosts();
    
    /**
     * 이벤트 리스너 초기화 함수
     */
    function initEventListeners() {
        // 게시글 작성 버튼 이벤트
        createPostBtn.addEventListener('click', function() {
            window.location.href = 'post-create.html';
        });
        
        // 게시글 작성 버튼 호버 이벤트
        createPostBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#7F6AEE';
        });
        
        createPostBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#ACA0EB';
        });
        
        // 스크롤 이벤트 - 인피니티 스크롤 구현
        window.addEventListener('scroll', handleScroll);
    }
    
    /**
     * 스크롤 이벤트 핸들러 - 인피니티 스크롤 구현
     */
    function handleScroll() {
        if (isLoading || !hasMorePosts) return;
        
        // 스크롤이 페이지 하단에 도달했는지 확인
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMorePosts();
        }
    }
    
    /**
     * 게시글 로드 함수
     */
    async function loadPosts() {
        isLoading = true;
        showLoading();
        
        try {
            // 게시글 목록 API 호출
            const response = await fetchAPI(`/posts?page=${currentPage}&size=${pageSize}`);
            
            if (!response.ok) {
                throw new Error('게시글 로드 실패');
            }
            
            const data = await response.json();
            
            if (data.status === 200) {
                renderPosts(data.data.content);
                
                // 더 불러올 게시글이 있는지 확인
                if (data.data.pageable.page >= data.data.pageable.totalPages || data.data.content.length === 0) {
                    hasMorePosts = false;
                }
            } else {
                console.error('게시글 목록 로드 실패:', data.message);
                showErrorToast(data.message || '게시글을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('게시글 목록 요청 오류:', error);
            showErrorToast('서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
            
            // 테스트 목적으로 샘플 데이터 사용
            renderPosts(generateSamplePosts(pageSize));
        } finally {
            hideLoading();
            isLoading = false;
        }
    }
    
    /**
     * 더 많은 게시글 로드 함수
     */
    function loadMorePosts() {
        currentPage++;
        loadPosts();
    }
    
    /**
     * 게시글 렌더링 함수
     */
    function renderPosts(posts) {
        if (!posts || posts.length === 0) {
            if (currentPage === 1) {
                postList.innerHTML = '<p class="no-posts">등록된 게시글이 없습니다.</p>';
            }
            return;
        }
        
        // 각 게시글을 HTML로 변환하여 목록에 추가
        posts.forEach(post => {
            const postCard = createPostCard(post);
            postList.appendChild(postCard);
        });
    }

    /**
     * 게시글 카드 생성 함수
     */
    function createPostCard(post) {
        const template = postCardTemplate.content.cloneNode(true);
        const postCard = template.querySelector('.post-card');
        
        // 게시글 ID 설정 (데이터 속성으로 저장)
        postCard.dataset.postId = post.postId;
        
        // 제목 설정 (최대 26자 제한)
        const titleElement = postCard.querySelector('.post-title');
        titleElement.textContent = truncateText(post.title, 26);
        
        // 좋아요, 댓글, 조회수 설정
        postCard.querySelector('.likes-count .count').textContent = formatCount(post.likes || 0);
        postCard.querySelector('.comments-count .count').textContent = formatCount(post.comments || 0);
        postCard.querySelector('.views-count .count').textContent = formatCount(post.views || 0);
        
        // 날짜 설정
        postCard.querySelector('.post-date').textContent = formatDateTime(post.createdAt);
        
        // 작성자 정보 설정
        if (post.author) {
            const authorImage = postCard.querySelector('.author-image img');
            if (post.author.profileImageUrl) {
                authorImage.src = post.author.profileImageUrl;
            }
            
            postCard.querySelector('.author-name').textContent = post.author.nickname || '익명';
        }
        
        // 게시글 카드 클릭 이벤트 - 상세 페이지로 이동
        postCard.addEventListener('click', function() {
            window.location.href = `post-detail.html?id=${post.postId}`;
        });
        
        return postCard;
    }
    
    /**
     * 로딩 표시 함수
     */
    function showLoading() {
        loadingIndicator.style.display = 'block';
    }
    
    /**
     * 로딩 숨김 함수
     */
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }
    
    /**
     * 샘플 게시글 생성 함수 (테스트용)
     */
    function generateSamplePosts(count) {
        const samplePosts = [];
        
        for (let i = 1; i <= count; i++) {
            const postId = (currentPage - 1) * pageSize + i;
            
            samplePosts.push({
                postId: postId,
                title: `제목 ${postId}`,
                likes: Math.floor(Math.random() * 2000),
                comments: Math.floor(Math.random() * 1000),
                views: Math.floor(Math.random() * 5000),
                createdAt: '2021-01-01 00:00:00',
                author: {
                    userId: 1,
                    nickname: '더미 작성자 ' + postId,
                    profileImageUrl: ''
                }
            });
        }
        
        return samplePosts;
    }
});