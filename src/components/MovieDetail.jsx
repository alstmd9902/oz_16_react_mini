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
        <section className="relative w-full h-full">
          {/* HERO 영역 (background 전용, content와 완전 분리) */}
          <div className="relative w-full h-[66vh] overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover dark:md:blur-xs blur-0"
              style={{
                backgroundImage: `url(${baseUrl}${detail.backdrop_path})`
              }}
            />
            {/* 전체 배경 위에 어두운 오버레이 */}
            <div className="absolute inset-0 md:bg-black/20 bg-black/70" />
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
                relative rounded-2xl
                flex gap-5 lg:gap-10 py-8 px-5 md:p-10 max-w-5xl w-full md:bg-black/35
                md:backdrop-blur-sm
                md:border md:border-white/10"
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

                <div className="flex flex-col md:gap-2 gap-3">
                  <div className="mt-4">
                    별점 :
                    <span className="inline-block rounded-full bg-yellow-400/20 text-yellow-300 px-2 py-0.5  mr-2">
                      ⭐️ {detail.vote_average}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    장르 :
                    {detail.genres.map((g) => (
                      <span
                        key={g.id}
                        className="inline-block rounded-full bg-white/15 text-gray-200 px-2 py-0.5"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>

                  {/* <p className="mt-1">상영시간: {detail.runtime}m</p> */}
                  <div>
                    상영시간 :
                    <span className="inline-block rounded-full bg-white/15 text-gray-200 px-2 py-0.5  mr-2">
                      {Math.floor(detail.runtime / 60)}시간{" "}
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
