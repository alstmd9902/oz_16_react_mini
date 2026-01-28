import { Moon, Search, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
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

  // 로그아웃 처리 함수
  // 로그아웃 시 세션 종료 후 메인 페이지로 이동
  const handleLogout = async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    if (!debouncedQuery) {
      navigate("/");
      return;
    }

    navigate(`/search?q=${debouncedQuery}`);
  }, [debouncedQuery, navigate, location.pathname]);

  return (
    <nav className="fixed top-0 left-0 z-10 w-full h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10">
      <div className="h-full flex items-center justify-between px-12 gap-4">
        <Link to="/" className="shrink-0">
          <h1 className="text-5xl text-black dark:text-white font-['Bebas_Neue'] tracking-wider">
            OZ
            <b className="text-violet-600 text-3xl">무비.</b>
          </h1>
        </Link>

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
                <div className="relative flex items-center gap-3">
                  {/* 로그인한 유저 이메일 */}
                  <span className="text-sm sm:block hidden text-black dark:text-white/80">
                    {user.email}
                  </span>

                  {/* 유저 아이콘 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-full bg-violet-600/50 flex items-center justify-center 
                    text-black dark:text-white hover:bg-violet-500/50 transition"
                    aria-label="유저 메뉴"
                  >
                    <User size={18} />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-12 w-36 rounded-md bg-white dark:bg-black/90 backdrop-blur-md border border-violet-600 shadow-lg overflow-hidden z-20">
                      <span className="block sm:hidden text-center border-b border-violet-600 pb-2 text-sm text-black dark:text-white/80">
                        {user.email}
                      </span>
                      <Link
                        to="/mypage"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition text-center"
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={(e) => {
                          setIsUserMenuOpen(false);
                          handleLogout(e);
                        }}
                        className="w-full py-2 text-sm text-black dark:text-white hover:bg-violet-600 hover:text-white transition"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={handleLogin} className={` ${buttonStyle}`}>
                  로그인
                </button>
              </>
            )}
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
