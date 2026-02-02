import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import TopMovies from "./TopMovies";

const GENRE_MAP = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  53: "스릴러",
  10752: "전쟁"
};

export default function Main() {
  const [movies, setMovies] = useState([]); // 영화 목록
  const [page, setPage] = useState(1); // 페이지
  const [activeTab] = useState("popular"); // popular | week | top
  const loader = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState("all"); // 장르 필터
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isGenreSidebarOpen, setIsGenreSidebarOpen] = useState(true);
  const topRef = useRef(null);

  const [showTopButton, setShowTopButton] = useState(false);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    //observe 실행 함수
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return; // loader가 안보이면 중지
        if (isLoading) return; // 로딩중일때 실행 중지
        console.log("옵저버 실행");
        setIsLoading(true);
        setPage((prev) => prev + 1);
      },
      { threshold: 0.1 } //관찰 대상(loader)의 면적 중 25%가 화면에 보이면 실행
    );
    if (loader.current) {
      observer.observe(loader.current);
    }
    return () => observer.disconnect(); // 관찰중이던 모든 요소를 전부 끊는다 cleanup
  }, [isLoading]);

  //api 호출 함수
  useEffect(() => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
      }
    };

    const movieApi = async () => {
      try {
        let url = "";

        if (activeTab === "popular") {
          url = `https://api.themoviedb.org/3/movie/popular?language=ko-KR&page=${page}`;
        }

        if (activeTab === "week") {
          url = `https://api.themoviedb.org/3/trending/movie/week?language=ko-KR&page=${page}`;
        }

        if (activeTab === "top") {
          url = `https://api.themoviedb.org/3/movie/top_rated?language=ko-KR&page=${page}`;
        }

        const api = await fetch(url, options);
        const res = await api.json();

        const filteredMovies = res.results.filter(
          (movie) => movie.adult === false
        );

        setMovies((prev) => {
          if (page === 1) return filteredMovies;

          const existingIds = new Set(prev.map((m) => m.id));
          const newMovies = filteredMovies.filter(
            (movie) => !existingIds.has(movie.id)
          );
          return [...prev, ...newMovies];
        });
      } catch {
        console.log("movie api error");
      } finally {
        setIsLoading(false);
      }
    };
    movieApi();
  }, [page, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredMovies =
    activeGenre === "all"
      ? movies
      : movies.filter((movie) =>
          movie.genre_ids?.includes(Number(activeGenre))
        );

  return (
    <>
      <div ref={topRef}></div>
      <TopMovies />

      {/* 모바일 장르 선택 버튼 */}
      <div
        className="md:hidden sticky top-20 left-6 z-40 w-fit
                   flex items-center gap-2
                   rounded-full
                   bg-zinc-900/95 backdrop-blur
                   border border-violet-500/40
                   px-4 py-2 text-sm text-white
                   shadow-[0_8px_30px_rgba(139,92,246,0.35)]
                   active:scale-95 transition"
      >
        <button
          onClick={() => setIsGenreModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full"
        >
          🎬 장르 선택
          {activeGenre !== "all" && (
            <span className="text-violet-400 text-xs">
              ({GENRE_MAP[activeGenre]})
            </span>
          )}
        </button>
      </div>

      <section className="max-w-[1600px] mx-auto relative flex gap-6">
        {/* 왼쪽 장르 선택 사이드바 (해당 섹션 내에서만 sticky) */}
        <div className="hidden md:block sticky left-6 top-24 self-start">
          <div
            className="bg-zinc-900/85 backdrop-blur
                          rounded-2xl border border-violet-500/30
                          shadow-[0_10px_40px_rgba(139,92,246,0.25)] p-2 w-[160px]"
          >
            {/* 헤더 버튼 */}
            <button
              onClick={() => setIsGenreSidebarOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-sm text-zinc-100 px-2 py-2 rounded-lg hover:bg-violet-600/20 transition"
            >
              <span className="flex items-center gap-2">🎬 장르 선택하기</span>
              <span
                className={`transition-transform duration-300 ${
                  isGenreSidebarOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-300"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {/* 장르 리스트 */}
            {isGenreSidebarOpen && (
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveGenre("all");
                    scrollToTop();
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                    activeGenre === "all"
                      ? "bg-violet-600 text-white"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  전체
                </button>

                {Object.entries(GENRE_MAP).map(([id, name]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveGenre(id);
                      scrollToTop();
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      activeGenre === id
                        ? "bg-violet-600 text-white"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-zinc-900/60 rounded-2xl p-4">
            <ul className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  posterPath={movie.poster_path}
                  title={movie.title}
                  rating={movie.vote_average}
                  id={movie.id}
                />
              ))}
            </ul>
            <div ref={loader} style={{ height: "1px" }} />
          </div>
        </div>
      </section>
      {/* 모바일 장르 모달 */}
      {isGenreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full max-h-[70vh] rounded-t-2xl bg-zinc-900 p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-white font-semibold">장르 선택</h3>

              <button
                onClick={() => setIsGenreModalOpen(false)}
                className="text-zinc-400 text-xl hover:bg-violet-600/20 transition rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 overflow-y-auto">
              <button
                onClick={() => {
                  setActiveGenre("all");
                  scrollToTop();
                  setIsGenreModalOpen(false);
                }}
                className={`py-2 rounded-lg text-sm transition
                  ${
                    activeGenre === "all"
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
              >
                전체
              </button>

              {Object.entries(GENRE_MAP).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveGenre(id);
                    scrollToTop();
                    setIsGenreModalOpen(false);
                  }}
                  className={`py-2 rounded-lg text-sm transition
                    ${
                      activeGenre === id
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* TOP 버튼 */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-12 z-40
                     flex items-center justify-center
                     w-11 h-11 rounded-full
                     bg-violet-700/30 backdrop-blur
                     border border-violet-500/40
                     text-white text-sm
                     shadow-[0_8px_30px_rgba(139,92,246,0.35)]
                     hover:bg-violet-600/20 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </>
  );
}
