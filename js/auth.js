// auth.js - 인증 관련 기능 모듈

/**
 * 로그인 관련 함수
 */

// 로그인 API 호출 함수
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
            
            // 프로필 이미지 URL이 있으면 저장
            if (data.data.profileImageUrl) {
                localStorage.setItem('profileImageUrl', data.data.profileImageUrl);
            }
            
            return { success: true, data: data.data };
        } else {
            // 로그인 실패 - 응답 상태에 따른 메시지 처리
            let errorMessage = data.message || '로그인에 실패했습니다.';
            
            if (response.status === 401) {
                errorMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
            } else if (response.status === 400) {
                // 유효성 검증 실패 시 첫 번째 에러 메시지 사용
                if (data.errors && data.errors.length > 0) {
                    errorMessage = data.errors[0].message;
                }
            }
            
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}

/**
 * 회원가입 관련 함수
 */

// 회원가입 API 호출 함수
async function signupUser(userData) {
    try {
        // FormData 객체인 경우와 JSON 객체인 경우 처리
        let options = {
            method: 'POST'
        };
        
        if (userData instanceof FormData) {
            options.body = userData;
        } else {
            options.headers = {
                'Content-Type': 'application/json'
            };
            options.body = JSON.stringify(userData);
        }
        
        const response = await fetch(`${API_BASE_URL}/users/signup`, options);
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, data: data.data };
        } else {
            // 응답 상태에 따른 메시지 처리
            let errorMessage = data.message || '회원가입에 실패했습니다.';
            let errors = [];
            
            if (response.status === 409) {
                // 이메일 또는 닉네임 중복
                if (data.error) {
                    errorMessage = data.error.message;
                    errors = [data.error];
                }
            } else if (response.status === 400) {
                // 유효성 검증 실패
                if (data.errors && data.errors.length > 0) {
                    errors = data.errors;
                }
            }
            
            return { success: false, message: errorMessage, errors: errors };
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}

/**
 * 사용자 정보 관리 관련 함수
 */

// 로그아웃 API 호출 함수
async function logoutUser() {
    try {
        const response = await fetchAPI('/users/logout', {
            method: 'POST'
        });
        
        const success = response.ok;
        
        // API 호출 결과와 상관없이 로컬 스토리지 정보는 삭제
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
        localStorage.removeItem('profileImageUrl');
        
        return success;
    } catch (error) {
        console.error('로그아웃 오류:', error);
        
        // 에러가 발생해도 로컬 스토리지 정보는 삭제
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('nickname');
        localStorage.removeItem('profileImageUrl');
        
        return false;
    }
}

// 사용자 프로필 정보 로드 함수
async function loadUserProfile() {
    try {
        const response = await fetchAPI('/users/profile', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // 사용자 정보 로컬 스토리지에 업데이트
            localStorage.setItem('nickname', data.data.nickname);
            
            // 프로필 이미지 URL이 있으면 저장
            if (data.data.profileImageUrl) {
                localStorage.setItem('profileImageUrl', data.data.profileImageUrl);
            }
            
            return { success: true, data: data.data };
        } else {
            const errorData = await response.json();
            return { 
                success: false, 
                message: errorData.message || '사용자 정보를 불러올 수 없습니다.' 
            };
        }
    } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}

// 회원 탈퇴 함수
async function withdrawUser() {
    try {
        const response = await fetchAPI('/user', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // 회원 탈퇴 성공 시 로그아웃 처리
            await logoutUser();
            return { success: true };
        } else {
            const errorData = await response.json();
            return { 
                success: false, 
                message: errorData.message || '회원 탈퇴에 실패했습니다.' 
            };
        }
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}

// 비밀번호 변경 함수
async function changePassword(currentPassword, newPassword, passwordCheck) {
    try {
        const response = await fetchAPI('/users/password', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword,
                passwordCheck
            })
        });
        
        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            
            // 응답 상태에 따른 에러 처리
            let errors = [];
            if (errorData.errors && errorData.errors.length > 0) {
                errors = errorData.errors;
            }
            
            return { 
                success: false, 
                message: errorData.message || '비밀번호 변경에 실패했습니다.',
                errors: errors
            };
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}

// 회원정보 수정 함수
async function updateUserProfile(nickname, profileImage) {
    try {
        // FormData 객체 생성
        const formData = new FormData();
        
        if (nickname) {
            formData.append('nickname', nickname);
        }
        
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        
        const response = await fetchAPI('/users/profile', {
            method: 'PUT',
            headers: {
                // FormData를 사용하므로 Content-Type 헤더를 명시하지 않음
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // 업데이트된 정보 로컬 스토리지에 저장
            if (data.data.nickname) {
                localStorage.setItem('nickname', data.data.nickname);
            }
            
            if (data.data.profileImageUrl) {
                localStorage.setItem('profileImageUrl', data.data.profileImageUrl);
            }
            
            return { success: true, data: data.data };
        } else {
            const errorData = await response.json();
            
            // 응답 상태에 따른 에러 처리
            let errors = [];
            if (errorData.errors && errorData.errors.length > 0) {
                errors = errorData.errors;
            }
            
            return { 
                success: false, 
                message: errorData.message || '회원정보 수정에 실패했습니다.',
                errors: errors
            };
        }
    } catch (error) {
        console.error('회원정보 수정 오류:', error);
        return { 
            success: false, 
            message: '서버 연결에 실패했습니다. 인터넷 연결을 확인해주세요.' 
        };
    }
}