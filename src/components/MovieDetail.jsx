import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../constants";

export default function MovieDetail() {
  const [detail, setDetail] = useState(null);
  const params = useParams();

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
          <div className="relative w-full h-[70vh] overflow-hidden">
            <div
              className="absolute aspect-auto inset-0 bg-top bg-cover dark:md:blur-xs blur-0"
              style={{
                backgroundImage: `url(${baseUrl}${
                  detail.backdrop_path || detail.poster_path
                })`
              }}
            />
            {/* 전체 배경 위에 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-48
                        bg-linear-to-b from-transparent to-[#ffffffd8]
                        dark:from-transparent dark:to-zinc-950"
            />
          </div>

          {/* content 영역 */}
          <div className="top-30 absolute z-1 px-4 flex w-full justify-center md:items-center items-start">
            <div
              className="
                flex gap-5 lg:gap-10 py-8 px-5 md:p-10 max-w-5xl w-full rounded-2xl
                bg-transparent text-zinc-900
                md:bg-white/10 md:backdrop-blur-md md:border md:border-white/40
                dark:text-white
                md:dark:bg-black/35 md:dark:backdrop-blur-sm md:dark:border-white/10
              "
            >
              {/* 카드 배경 이미지 (tablet & mobile) 일때 */}
              {/* <div
                className="absolute inset-0 bg-cover bg-center md:hidden "
                style={{
                  backgroundImage: `url(${baseUrl}${
                    detail.backdrop_path || detail.poster_path
                  })`
                }}
              /> */}

              {/* 카드 내부 오버레이 */}
              {/* <div className="absolute inset-0 bg-black/65 md:hidden" /> */}
              <img
                src={`${baseUrl}${detail.poster_path}`}
                alt={detail.title}
                className="hidden md:block md:w-64 rounded-xl shadow-xl object-cover"
              />

              {/* 정보 */}
              <div className="relative z-10 text-white flex flex-col justify-center">
                {/* 제목 */}
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight">
                    {detail.title}
                  </h1>
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
            </div>
          </div>
        </section>
      )}
    </>
  );
}
