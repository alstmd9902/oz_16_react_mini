import { Moon, Search, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hook/useDebounce";
import { supabaseClient } from "../lib/supabaseClient";

//렌더링 될시 한번만 스타일 적용
const buttonStyle =
  "bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-md text-white transition";

export default function NavBar({ setIsDark, isDark }) {
  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 검색 아이콘 하위에 드롭다운
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); //모바일 경우 로그인 회원가입 하위 드롭메뉴로
  //delay는 useDebounce 내부 default 값(300ms)을 사용 변경할때 (searchText,500) 이런식으로 쓰면됨
  const debouncedQuery = useDebounce(searchText);
  const navigate = useNavigate(); //페이지 이동
  const [user, setUser] = useState(null);

  //로그인 로그아웃 감지 하는 훅 생성
  useEffect(() => {
    // 1️⃣ 처음 렌더링 시 로그인 상태 확인
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // 2️⃣ 로그인 / 로그아웃 감지
    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  //login 페이지로 이동
  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  // 회원가입 폼 으로 이동
  const handleSignUp = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  // 로그아웃 처리 함수
  // 로그아웃 시 세션 종료 후 메인 페이지로 이동
  const handleLogout = async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    //검색어 지울때 메인페이지로 이동
    if (!debouncedQuery) {
      navigate("/");
      return;
    }
    navigate(`/search?q=${debouncedQuery}`); // /search?q=값 = 검색어를 주소로 전달
  }, [debouncedQuery]); //{debouncedQuery} = input에 입력한 값

  return (
    <nav className="fixed top-0 left-0 z-10 w-full h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 gap-4">
        <h1 className="text-5xl text-black dark:text-white shrink-0 font-['Bebas_Neue'] tracking-wider">
          OZ
          <b className="text-violet-600 dark:text-violet-400 text-3xl">무비.</b>
        </h1>

        <div className="flex gap-3 items-center w-full justify-end">
          {/* 다크모드 라이트모드 버튼 추가 */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="text-black dark:text-white p-2 rounded-full hover:bg-violet-600/20 transition"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 데스크탑 input */}
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="영화 검색..."
            className="hidden md:block w-[300px]
            bg-black/10 dark:bg-white/10
            text-black dark:text-white
            placeholder-black/40 dark:placeholder-white/60
            rounded-full px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* 모바일 검색 Icon 으로 변경 */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full text-black dark:text-white hover:bg-violet-600/20 transition"
          >
            <Search size={20} />
          </button>

          <div className="flex items-center gap-2">
            {/* 로그인 상태 판단 기준: user 상태 값 존재 여부 */}
            {/* 조건부 렌더링 이유: 로그인 상태에 따라 보여줄 버튼이 다름 */}
            {/* PC 버전 */}
            {user ? (
              <>
                <button
                  onClick={() => navigate("/favorites")}
                  className={`hidden md:block ${buttonStyle}`}
                >
                  관심목록
                </button>
                <button
                  onClick={handleLogout}
                  className={`hidden md:block ${buttonStyle}`}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className={`hidden md:block ${buttonStyle}`}
                >
                  로그인
                </button>
                <button
                  onClick={handleSignUp}
                  className={`hidden md:block ${buttonStyle}`}
                >
                  회원가입
                </button>
              </>
            )}

            {/* 모바일 유저 메뉴 아이콘 */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="p-2 rounded-full text-black dark:text-white hover:bg-violet-600/20 transition"
                aria-label="유저 메뉴"
              >
                <User size={22} />
              </button>

              {/* 유저 아이콘 클릭 시 드롭다운 메뉴 */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-11 w-32 rounded-md bg-white dark:bg-black/90 backdrop-blur-md border border-violet-600 shadow-lg overflow-hidden z-20">
                  {/* 로그인 상태 판단 기준: user 상태 값 존재 여부 */}
                  {/* 조건부 렌더링 이유: 로그인 상태에 따라 보여줄 버튼이 다름 */}
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/favorites");
                        }}
                        className="w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition"
                      >
                        관심목록
                      </button>
                      <button
                        onClick={(e) => {
                          setIsUserMenuOpen(false);
                          handleLogout(e);
                        }}
                        className="w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition"
                      >
                        로그아웃
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          setIsUserMenuOpen(false);
                          handleLogin(e);
                        }}
                        className="w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition"
                      >
                        로그인
                      </button>
                      <button
                        onClick={(e) => {
                          setIsUserMenuOpen(false);
                          handleSignUp(e);
                        }}
                        className="w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition"
                      >
                        회원가입
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 검색창 아이콘 클릭시 */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 py-3">
          <input
            autoFocus
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="영화 검색..."
            className="w-full bg-black/10 dark:bg-white/10 text-black dark:text-white placeholder-black/40 dark:placeholder-white/60 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      )}
    </nav>
  );
}
