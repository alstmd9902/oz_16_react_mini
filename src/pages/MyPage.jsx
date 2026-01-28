import { User } from "lucide-react";
import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { supabaseClient } from "../lib/supabaseClient";

const SECTION_STYLE =
  "w-full max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-xl p-6";

const SECTION_TITLE =
  "flex items-center gap-2 text-lg font-semibold text-white mb-4";

export default function MyPage() {
  const [user, setUser] = useState(null); // 유저인지 아닌지
  const [bookmarkMovieList, setBookmarkMovieList] = useState([]); // 관심영화 상태 값

  const email = user?.email;
  const username = email?.split("@")[0]; //유저 네임만 가져오기 이메일 @ 뒤에 자르기

  // 관심영화 유저 마다 로컬스토리지에 저장된 것 가져오기
  useEffect(() => {
    // 이 effect는 마이페이지가 처음 마운트될 때 단 한 번 실행된다.
    // 목적:
    // 1) 현재 로그인한 유저를 가져오고
    // 2) 해당 유저의 관심영화 목록을 localStorage에서 불러온다.

    const loadUserAndBookmarks = async () => {
      // Supabase Auth에서 현재 로그인한 유저 정보 가져오기
      const { data } = await supabaseClient.auth.getUser();
      const currentUser = data.user;

      // 전역/화면에서 사용할 유저 상태 업데이트
      setUser(currentUser);

      // 로그인한 유저가 없다면 (비로그인 상태)
      // → 관심영화는 보여줄 수 없으므로 빈 배열로 초기화하고 종료
      if (!currentUser) {
        setBookmarkMovieList([]);
        return;
      }

      // 유저마다 다른 관심영화 목록을 가지도록
      // localStorage key를 user.id 기준으로 생성
      const storageKey = `bookmarkMovieList_${currentUser.id}`;

      // 해당 유저의 관심영화 데이터 가져오기 (문자열 or null)
      const raw = localStorage.getItem(storageKey);

      // 문자열(JSON)을 실제 배열로 변환
      // 값이 없으면 빈 배열로 처리
      const parsed = raw ? JSON.parse(raw) : [];

      // 관심영화 상태 업데이트 → 화면에 렌더링됨
      setBookmarkMovieList(parsed);
    };

    // 비동기 함수 실행
    loadUserAndBookmarks();
  }, []);

  return (
    <div className="bg-black text-white py-16 px-4">
      {/* 프로필 영역 */}
      <section className={`${SECTION_STYLE} mb-10`}>
        <div className="flex items-center gap-4">
          <div
            className="relative group w-14 h-14 rounded-full bg-violet-600/50 flex items-center justify-center 
                text-black dark:text-white hover:bg-violet-500/50 transition cursor-pointer"
          >
            <User size={24} />

            {/* hover overlay */}
            <div
              className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
                         text-[10px] font-medium text-white opacity-0 group-hover:opacity-100
                         transition-opacity"
            >
              프로필 편집
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold">{username}</p>

                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-lg border border-white/20 text-white/80 
                  hover:bg-white/10 transition"
                >
                  비밀번호 변경
                </button>

                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-lg border border-red-500/30 text-red-400 
                  hover:bg-red-500/10 transition"
                >
                  탈퇴하기
                </button>
              </div>

              <p className="text-sm text-white/60 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 관심 영화 */}
      <section className={`${SECTION_STYLE} mb-10`}>
        <h2 className={SECTION_TITLE}>❤️ 관심 영화</h2>

        <div className="overflow-x-auto">
          <ul className="flex w-full gap-4 [&_li]:w-[280px] [&_li]:shrink-0">
            {bookmarkMovieList.map((data) => {
              return (
                <MovieCard
                  key={data.id}
                  posterPath={data.poster_path}
                  title={data.title}
                  id={data.id}
                />
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
