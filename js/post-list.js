// 게시글 목록 조회 페이지 관련 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const profileDropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');
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
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 사용자 닉네임 표시
    const nickname = localStorage.getItem('nickname');
    if (nickname) {
        userNickname.textContent = nickname;
    }
    
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
    
    // 게시글 작성 버튼 이벤트
    createPostBtn.addEventListener('click', function() {
        window.location.href = 'post-create.html';
    });
    
    // 초기 게시글 로드
    loadPosts();
    
    // 스크롤 이벤트 - 인피니티 스크롤 구현
    window.addEventListener('scroll', function() {
        if (isLoading || !hasMorePosts) return;
        
        // 스크롤이 페이지 하단에 도달했는지 확인
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMorePosts();
        }
    });
    
    // 게시글 로드 함수
    async function loadPosts() {
        isLoading = true;
        showLoading();
        
        try {
            // 게시글 목록 조회 API 호출
            const response = await fetch(`${API_BASE_URL}/posts?page=${currentPage}&size=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                renderPosts(data.data.content);
                
                // 더 불러올 게시글이 있는지 확인
                if (data.data.pageable.page >= data.data.pageable.totalPages || data.data.content.length === 0) {
                    hasMorePosts = false;
                }
            } else {
                console.error('게시글 목록 로드 실패:', data.message);
            }
        } catch (error) {
            console.error('게시글 목록 요청 오류:', error);
            
            // 테스트 목적으로 로컬 개발 환경에서는 샘플 데이터 사용
            console.log('테스트용 샘플 게시글 데이터 로드');
            const samplePosts = generateSamplePosts(10);
            renderPosts(samplePosts);
        } finally {
            hideLoading();
            isLoading = false;
        }
    }
    
    // 더 많은 게시글 로드 함수
    function loadMorePosts() {
        currentPage++;
        loadPosts();
    }
    
    // 게시글 렌더링 함수
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
    
    // 게시글 카드 생성 함수
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
    
    // 텍스트 자르기 함수
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) : text;
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
    
    // 로딩 표시 함수
    function showLoading() {
        loadingIndicator.style.display = 'block';
    }
    
    // 로딩 숨김 함수
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }
    
    // 샘플 게시글 생성 함수 (테스트용)
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
                    nickname: '디미 작성자 ' + postId,
                    profileImageUrl: ''
                }
            });
        }
        
        return samplePosts;
    }
    
    // 로그아웃 함수
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
    }
});