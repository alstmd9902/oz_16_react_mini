import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../constants";
import { useSupabase } from "../context/AuthContext";
// const storageKey = "bookmarkMovieList"; // 로컬스토리지 저장할 key 상수 만들기

// 유저마다 북마크저장
export default function MovieDetail() {
  const [user, setUser] = useState(null); // 유저 상태 확인하기
  const storageKey = user ? `bookmarkMovieList_${user.id}` : null; //유저마다 로컬스토리지 저장
  const [detail, setDetail] = useState(null);
  const params = useParams();
  const [isbookMark, setIsBookMark] = useState(false); // 북마크추가 UI 업데이트 상태
  const supabase = useSupabase(); // 로그인 인지 아닌지 판단

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const { user } = data;
      setUser(user);

      const itemList = localStorage.getItem(`bookmarkMovieList_${user.id}`);
      const favorites = itemList ? JSON.parse(itemList) : [];

      const hasfavorite = favorites.some((f) => `${f.id}` === params.id);
      if (hasfavorite) return setIsBookMark(true);
      setIsBookMark(false);
    });
  }, [supabase, params.id]);

  //저장할 버튼 클릭시 로컬 스토리지 저장
  const populateStorage = () => {
    // 1. 원래 저장된 배열 가져오기
    const movieList = localStorage.getItem(storageKey);

    //로컬스토리지에 무비 리스트가 있으면 그걸 JSON → 배열로 변환하고,없으면 빈 배열을 쓰겠다
    const parsedList = movieList ? JSON.parse(movieList) : [];

    const isExist = parsedList.some((movie) => movie.id === detail.id);

    //만약 로그인이 안되어 있을경우 하트 버튼 클릭시 로그인 여부 확인하기
    if (!user) {
      alert("로그인 후 이용해주세요");
      return;
    }
    if (isExist) {
      // 이미 있으면 제거
      const filtered = parsedList.filter((movie) => movie.id !== detail.id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      setIsBookMark(false);
    } else {
      // 없으면 저장
      localStorage.setItem(storageKey, JSON.stringify([...parsedList, detail]));
      setIsBookMark(true);
    }
  };

  // // 꺼내오는 버튼
  // const handleCLick = () => {
  //   const data = localStorage.getItem(storageKey);
  //   setBookmarkMovieList(JSON.parse(data));
  //   console.log(data);
  // };

  useEffect(() => {
    const detailFetch = async () => {
      try {
        const detailApi = await fetch(
          `https://api.themoviedb.org/3/movie/${params.id}?language=ko-KR`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
            }
          }
        );
        const res = await detailApi.json();
        setDetail(res);
      } catch {
        console.log("error");
      }
    };

    detailFetch();
  }, [params.id]);

  return (
    <>
      {detail && (
        <section className="relative w-full h-full mt-16">
          {/* HERO 영역 (background 전용, content와 완전 분리) */}
          <div
            className="relative w-full h-[calc(35vh+28vw-64px)] 
                       min-h-[280px] max-h-[70vh] overflow-hidden"
          >
            <div
              className="absolute aspect-auto inset-0 bg-top bg-cover dark:md:blur-xs blur-0"
              style={{
                backgroundImage: `url(${baseUrl}${
                  detail.backdrop_path || detail.poster_path
                })`
              }}
            />
            {/* 전체 배경 위에 어두운 오버레이 */}
            <div
              className="
              absolute inset-0
              bg-linear-to-r
              from-black/40 via-black/60 to-black/70
              md:from-black/90 md:via-black/30 md:to-black/80
            "
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 
                          h-32 bg-linear-to-b from-transparent to-[#ffffffd8]
                          dark:from-transparent dark:to-zinc-950"
            />
          </div>
          {/* content 영역 */}
          <div
            className="top-30 absolute z-1 px-4 flex w-full justify-center
                       md:items-center items-start"
          >
            <div
              className="
                flex gap-5 lg:gap-10 py-8 px-5 md:p-10 max-w-5xl w-full rounded-2xl
                bg-transparent text-zinc-900
                md:backdrop-blur-md md:border md:border-white/40
                dark:text-white md:bg-white/10 
                md:dark:bg-black/35 md:dark:backdrop-blur-sm md:dark:border-white/10"
            >
              {/* 정보 */}
              <div className="flex-1 relative z-10 text-white flex flex-col justify-center bottom-24 md:bottom-0">
                {/* 제목 */}
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight">
                    {detail.title}
                  </h1>
                  <button
                    onClick={() => {
                      populateStorage();
                    }}
                    className="text-3xl"
                  >
                    {isbookMark ? "♥︎" : "♡"}
                  </button>

                  {/* <button onClick={handleCLick} className="bg-red-300">
                    꺼내오는 버튼
                  </button> */}
                </div>

                <div className="flex flex-col gap-3 mt-4 text-sm md:text-base text-gray-200">
                  {/* 별점 , 장르 , 런타임 */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-yellow-300 font-medium">
                      ⭐ {detail.vote_average.toFixed(1)}
                    </span>
                    <span className="opacity-60">|</span>
                    <span>{detail.genres.map((g) => g.name).join(" · ")}</span>
                    <span className="opacity-60">|</span>
                    <span>
                      {Math.floor(detail.runtime / 60)}시간
                      {detail.runtime % 60}분
                    </span>
                  </div>
                </div>

                <div className="mt-6 max-w-xl">
                  <h2 className="text-lg font-semibold mb-2">줄거리</h2>
                  <p className="leading-relaxed">{detail.overview}</p>
                </div>
              </div>

              {/* 카드 내부 오버레이 */}

              <img
                src={`${baseUrl}${detail.poster_path}`}
                alt={detail.title}
                className="shrink-0 hidden md:block md:w-64 rounded-xl shadow-xl object-cover"
              />
            </div>
          </div>
          {/* 로컬스토리지 저장 꺼내서 화면 렌더링
          <div>
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
          </div> */}
        </section>
      )}
    </>
  );
}
