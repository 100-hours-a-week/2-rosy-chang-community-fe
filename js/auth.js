// 인증 관련 기능 모듈

// 로그인 API 호출 함수
async function loginUser(email, password) {
    try {
        const response = await fetchAPI('/users/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 로그인 성공 시 토큰 및 사용자 정보 저장
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('userId', data.data.userId);
            localStorage.setItem('nickname', data.data.nickname);
            return { success: true, data: data.data };
        } else {
            // 로그인 실패
            return { success: false, message: data.message || '로그인에 실패했습니다.' };
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
}

// 회원가입 API 호출 함수
async function signupUser(userData) {
    try {
        const response = await fetchAPI('/users/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            return { success: false, message: data.message || '회원가입에 실패했습니다.', errors: data.errors };
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        return { success: false, message: '서버 연결에 실패했습니다.' };
    }
}

// 로그아웃 API 호출 함수
async function logoutUser() {
    try {
        const response = await fetchAPI('/users/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            // 로컬 저장소에서 토큰 및 사용자 정보 삭제
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('nickname');
            return true;
        }
        return false;
    } catch (error) {
        console.error('로그아웃 오류:', error);
        return false;
    } finally {
        // API 호출 결과와 상관없이 로컬 스토리지 정보는 삭제
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
    }
}

// 현재 로그인 상태 확인 함수
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// 현재 사용자 정보 가져오기
function getCurrentUser() {
    return {
        userId: localStorage.getItem('userId'),
        nickname: localStorage.getItem('nickname')
    };
}