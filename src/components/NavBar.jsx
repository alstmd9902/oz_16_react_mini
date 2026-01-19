import { Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hook/useDebounce";

//렌더링 될시 한번만 스타일 적용
const buttonStyle = "bg-violet-600 px-3 py-1 rounded-md text-white";

export default function NavBar() {
  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 검색 아이콘 하위에 드롭다운
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); //모바일 경우 로그인 회원가입 하위 드롭메뉴로
  //delay는 useDebounce 내부 default 값(300ms)을 사용 변경할때 (searchText,500) 이런식으로 쓰면됨
  const debouncedQuery = useDebounce(searchText);
  const navigate = useNavigate(); //페이지 이동

  useEffect(() => {
    //검색어 지울때 메인페이지로 이동
    if (!debouncedQuery) {
      navigate("/");
      return;
    }
    navigate(`/search?q=${debouncedQuery}`); // /search?q=값 = 검색어를 주소로 전달
  }, [debouncedQuery]); //{debouncedQuery} = input에 입력한 값

  return (
    <nav className="fixed top-0 left-0 z-10 w-full h-16 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 gap-4">
        <h1 className="text-5xl text-white shrink-0 font-['Bebas_Neue'] tracking-wider">
          OZ<b className="text-violet-400 text-3xl">무비.</b>
        </h1>

        <div className="flex gap-3 items-center w-full justify-end">
          {/* Desktop Search (>=768px) */}
          <input
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="영화 검색..."
            className="hidden md:block w-[300px] bg-white/10 text-white placeholder-white/60 rounded-full px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* 모바일 검색 Icon 으로 변경 */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className="md:hidden text-white p-2 rounded-full hover:bg-white/10 transition"
          >
            <Search size={20} />
          </button>

          <div className="flex items-center gap-2">
            {/* pc 버전 */}
            <button className={`hidden md:block ${buttonStyle}`}>로그인</button>
            <button className={`hidden md:block ${buttonStyle}`}>
              회원가입
            </button>

            {/* 모바일 유저 메뉴 아이콘 */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="text-white p-2 rounded-full hover:bg-white/10 transition"
                aria-label="유저 메뉴"
              >
                <User size={22} />
              </button>

              {/* 유저 아이콘 클릭 시 드롭다운 메뉴 */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-11 w-32 rounded-md bg-black/90 backdrop-blur-md border border-violet-600 shadow-lg overflow-hidden z-20">
                  <button className="w-full py-2 text-sm text-white hover:bg-violet-600">
                    로그인
                  </button>
                  <button className="w-full py-2 text-sm text-white hover:bg-violet-600">
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 검색창 아이콘 클릭시 */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <input
            autoFocus
            onChange={(e) => setSearchText(e.target.value)}
            type="text"
            placeholder="영화 검색..."
            className="w-full bg-white/10 text-white placeholder-white/60 rounded-full px-4 py-2
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      )}
    </nav>
  );
}
