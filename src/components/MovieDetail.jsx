import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../constants";
import { useSupabase } from "../context/AuthContext";
import MovieCard from "./MovieCard";

/**
 * MovieDetail.jsx
 * --------------------------------------------------
 * 영화 상세 페이지 컴포넌트
 *
 * 기능 요약:
 * - 영화 상세 정보(TMDB)
 * - 관람 등급 / 장르 / 러닝타임 / 국가 / 개봉연도 표시
 * - 예고편(YouTube) 모달 재생
 * - 출연진 / 감독 정보
 * - 관련 영화 & 시리즈 이동
 * - 유저별 북마크(My Wishlist) 저장 (localStorage)
 *
 * 반응형 전략:
 * - 1024px(lg) 미만: 포스터 숨김
 * - 1024px 이상: 포스터 고정 360px 표시
 */

// OTT 플랫폼별 외부 링크 (시청 가능한 곳)
const WATCH_PROVIDER_LINKS = {
  Netflix: "https://www.netflix.com",
  "Disney Plus": "https://www.disneyplus.com",
  Disney: "https://www.disneyplus.com",
  "Amazon Prime Video": "https://www.primevideo.com",
  wavve: "https://www.wavve.com",
  Watcha: "https://watcha.com",
  TVING: "https://www.tving.com",
  CoupangPlay: "https://www.coupangplay.com",
  AppleTV: "https://tv.apple.com"
};

// ISO 국가 코드 → 한국어 국가명 매핑
const COUNTRY_NAME_KO = {
  US: "미국",
  KR: "한국",
  JP: "일본",
  CN: "중국",
  TW: "대만",
  HK: "홍콩",
  FR: "프랑스",
  ES: "스페인",
  DE: "독일",
  IT: "이탈리아",
  GB: "영국",
  CA: "캐나다",
  AU: "호주",
  IN: "인도"
};

// ===== 공통 UI 스타일 상수 (Tailwind 재사용용) =====
const SECTION_TITLE = "text-lg font-semibold mb-4";
const SUBSECTION_TITLE = "text-sm font-semibold mb-2";

const H_SCROLL = "flex gap-4 overflow-x-auto pb-2";

const META_ROW = "flex flex-wrap items-center gap-x-3 gap-y-1";
const STAR_ROW = "flex items-center gap-0.5 text-yellow-300";

const CARD_BORDER =
  "rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:border-white/20";

const IMAGE_FALLBACK =
  "flex items-center justify-center bg-zinc-800 text-gray-300";

// const storageKey = "bookmarkMovieList"; // 로컬스토리지 저장할 key 상수 만들기

// 유저마다 북마크저장
export default function MovieDetail() {
  // 로그인 유저 정보
  const [user, setUser] = useState(null);
  const storageKey = user ? `bookmarkMovieList_${user.id}` : null; // 유저마다 로컬스토리지 저장

  // 영화 기본 데이터
  const [detail, setDetail] = useState(null);

  // 출연진 / 감독
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState(null);

  // 관련 영화 / 시리즈
  const [related, setRelated] = useState([]);
  const [collection, setCollection] = useState(null);

  // 예고편
  const [trailers, setTrailers] = useState([]);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // 시청 가능 OTT
  const [watchProviders, setWatchProviders] = useState([]);

  // 관람 등급 (ex. 15, 19, ALL)
  const [ageRating, setAgeRating] = useState(null);

  // 타이틀 로고 이미지
  const [titleLogo, setTitleLogo] = useState(null);

  // 북마크 상태 (UI용)
  const [isbookMark, setIsBookMark] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const supabase = useSupabase(); // 로그인 인지 아닌지 판단

  const castSectionRef = useRef(null);

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

  // 북마크 버튼 클릭 시
  // - 로그인 안 되어 있으면 차단
  // - 이미 저장된 영화면 제거
  // - 없으면 추가
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

  // 영화 상세 데이터 로드
  // - detail / credits / recommendations / videos / watch providers / age rating
  // - Promise.all로 병렬 요청
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const headers = {
          accept: "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
        };
        const [
          detailRes,
          creditRes,
          relatedRes,
          videoRes,
          providerRes,
          ratingRes
        ] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}?language=ko-KR`,
            { headers }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/credits?language=ko-KR`,
            { headers }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/recommendations?language=ko-KR`,
            { headers }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/videos?language=en-US`,
            { headers }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/watch/providers`,
            { headers }
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/release_dates`,
            { headers }
          )
        ]);

        const detailData = await detailRes.json();
        const creditData = await creditRes.json();
        const relatedData = await relatedRes.json();
        const videoData = await videoRes.json();
        const providerData = await providerRes.json();

        setDetail(detailData);

        // 등급 데이터 파싱
        const ratingData = await ratingRes.json();
        const krRelease = ratingData.results?.find(
          (r) => r.iso_3166_1 === "KR"
        );
        const certification = krRelease?.release_dates?.find(
          (d) => d.certification
        )?.certification;
        setAgeRating(certification || null);

        try {
          const logoRes = await fetch(
            `https://api.themoviedb.org/3/movie/${params.id}/images`,
            { headers }
          );
          const logoData = await logoRes.json();

          const koreanLogo = logoData.logos?.find((l) => l.iso_639_1 === "ko");
          const englishLogo = logoData.logos?.find((l) => l.iso_639_1 === "en");

          setTitleLogo(koreanLogo || englishLogo || null);
        } catch {
          setTitleLogo(null);
        }
        setCast(creditData.cast || []);
        const directorData =
          creditData.crew?.find((c) => c.job === "Director") || null;
        setDirector(directorData);
        setRelated(relatedData.results || []);
        const trailerList =
          videoData.results?.filter(
            (v) =>
              v.site === "YouTube" &&
              (v.type === "Trailer" || v.type === "Teaser")
          ) || [];
        setTrailers(trailerList);

        // watchProviders (KR 기준)
        const koreaProviders = providerData.results?.KR?.flatrate || [];
        setWatchProviders(koreaProviders);

        if (detailData.belongs_to_collection?.id) {
          const collectionRes = await fetch(
            `https://api.themoviedb.org/3/collection/${detailData.belongs_to_collection.id}?language=ko-KR`,
            { headers }
          );
          const collectionData = await collectionRes.json();
          setCollection(collectionData);
        } else {
          setCollection(null);
        }
      } catch (e) {
        console.log("movie data fetch error", e);
      }
    };

    fetchMovieData();
  }, [params.id]);

  // 개봉연도 (YYYY)
  const releaseYear = detail?.release_date
    ? detail.release_date.slice(0, 4)
    : null;
  // 제작 국가 (한국어 변환)
  const countryCode = detail?.production_countries?.[0]?.iso_3166_1 || null;
  const countryName = countryCode
    ? COUNTRY_NAME_KO[countryCode] || detail.production_countries?.[0]?.name
    : null;

  return (
    <>
      {detail && (
        <section key={params.id} className="relative w-full h-full mt-16">
          {/* HERO 영역
            - backdrop 이미지 전용
            - 콘텐츠와 분리
            - 어두운 오버레이로 가독성 확보
          */}
          <div className="relative w-full h-[calc(35vh+28vw-64px)] min-h-[280px] max-h-[70vh] overflow-hidden">
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
              absolute inset-0 bg-linear-to-r
              from-black/40 via-black/60 to-black/70
              md:from-black/90 md:via-black/80 md:to-black/80
            "
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 
                          h-32 bg-linear-to-b from-transparent to-[#ffffffd8]
                          dark:from-transparent dark:to-zinc-950"
            />
          </div>

          {/* 콘텐츠 영역
            - grid 레이아웃
            - 좌측: 정보 / 우측: 포스터 (lg 이상)
          */}
          <div className="dark:text-amber-50 top-20 md:top-12 absolute z-1 px-4 flex w-full justify-center md:items-center items-start">
            <div
              className="flex flex-col gap-5 lg:gap-10 py-8 px-5 md:p-10 max-w-7xl w-full rounded-2xl
                bg-transparent dark:text-amber-50"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,720px)_360px] gap-10 items-start">
                <div className="relative z-10 text-white flex flex-col gap-3">
                  {/* 제목 */}
                  <div className="mb-3">
                    {titleLogo ? (
                      <div className="max-w-[600px] w-full">
                        <img
                          src={`${baseUrl}${titleLogo.file_path}`}
                          alt={detail.title}
                          className="w-auto max-h-[120px] object-contain drop-shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <h1
                        className="text-3xl md:text-4xl font-bold tracking-tight
                          leading-tight line-clamp-2 max-w-[420px]"
                      >
                        {detail.title}
                      </h1>
                    )}
                  </div>
                  {!titleLogo &&
                    detail.original_language !== "ko" &&
                    detail.original_title &&
                    detail.original_title !== detail.title && (
                      <p className="mt-1 text-sm text-gray-400 max-w-[500px] line-clamp-1">
                        {detail.original_title}
                      </p>
                    )}

                  <div className="flex flex-col gap-3 mt-4 text-sm md:text-base text-gray-200">
                    {/* 북마크 저장 */}

                    <button
                      onClick={populateStorage}
                      className={`
                        inline-flex items-center gap-2
                        px-4 py-1.5 rounded-full
                        border text-sm font-medium
                        transition-all w-fit
                        ${
                          isbookMark
                            ? "bg-violet-600 border-violet-500 text-white shadow-md"
                            : "bg-black/40 border-white/20 text-white hover:bg-white/10"
                        }
                      `}
                      aria-label="add to wishlist"
                    >
                      <span className="text-base leading-none">
                        {isbookMark ? "♥︎" : "+"}
                      </span>
                      <span>
                        {isbookMark ? "Saved to My Wishlist" : "My Wishlist"}
                      </span>
                    </button>

                    {/* 영화 정보 */}
                    {/* 평점 · 장르 · 러닝타임 */}
                    <div className={META_ROW}>
                      {/* 평점 (5점 만점, 반올림) */}
                      {(() => {
                        const starRating = Math.round(detail.vote_average / 2);
                        return (
                          <div className={STAR_ROW}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={i < starRating ? "" : "opacity-30"}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-1 text-sm text-gray-300">
                              {detail.vote_average.toFixed(1)}
                            </span>
                          </div>
                        );
                      })()}

                      <span className="opacity-60">|</span>

                      <span>
                        {detail.genres.map((g) => g.name).join(" · ")}
                      </span>

                      <span className="opacity-60">|</span>

                      <span>
                        {Math.floor(detail.runtime / 60)}시간{" "}
                        {detail.runtime % 60}분
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ageRating && (
                        <span
                          className={`px-2 py-0.5 text-xs rounded font-medium
                            ${
                              ageRating === "19"
                                ? "bg-red-600/90 border border-red-500 text-white shadow-sm"
                                : "bg-black/30 border border-white/30 text-white/90"
                            }
                          `}
                        >
                          {ageRating === "ALL"
                            ? "전체 관람가"
                            : `${ageRating}세 이상`}
                        </span>
                      )}

                      {/* 개봉연도 | 국가명 */}
                      {(releaseYear || countryName) && (
                        <div className="text-sm text-gray-300 mt-1">
                          {releaseYear}
                          {releaseYear && countryName && " | "}
                          {countryName}
                        </div>
                      )}
                    </div>
                  </div>

                  {director && (
                    <div className="mt-3 text-sm text-gray-300 flex items-center gap-2">
                      <span className="opacity-70">🎬 감독</span>
                      <span className="font-medium text-white">
                        {director.original_name || director.name}
                      </span>
                    </div>
                  )}

                  {/* 출연진 정보 */}
                  {cast.length > 0 && (
                    <div className="text-sm text-gray-300">
                      <div className="flex flex-wrap items-center gap-x-1">
                        <span className="opacity-70">출연</span>
                        <span className="text-white">
                          {cast
                            .slice(0, 4)
                            .map((actor) => actor.name)
                            .join(",")}
                          ...
                        </span>
                        {cast.length > 4 && (
                          <button
                            onClick={() => {
                              castSectionRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                              });
                            }}
                            className="ml-2 text-violet-400 hover:text-violet-300 transition text-xs"
                          >
                            + 더보기
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 시청 가능한 곳 */}
                  {watchProviders.length > 0 && (
                    <div className="mt-3">
                      <h2 className={SUBSECTION_TITLE}>시청 가능한 곳</h2>
                      <ul className="flex gap-4">
                        {watchProviders.map((p) => {
                          const providerLink =
                            WATCH_PROVIDER_LINKS[p.provider_name];
                          if (!providerLink) return null;
                          return (
                            <li key={p.provider_id}>
                              <a
                                href={providerLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 border border-white/30 rounded-lg"
                              >
                                <img
                                  src={`${baseUrl}${p.logo_path}`}
                                  alt={p.provider_name}
                                  className="h-10 w-10 object-contain"
                                />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* 줄거리 */}
                  <div className="mt-6 max-w-xl">
                    <h2 className="text-lg font-semibold mb-2">줄거리</h2>
                    <p className="leading-relaxed">{detail.overview}</p>
                  </div>
                </div>

                {/* 1024px 이상에서만 포스터 표시 */}
                {detail.poster_path ? (
                  <img
                    src={`${baseUrl}${detail.poster_path}`}
                    alt={detail.title}
                    className="hidden lg:block w-[360px] rounded-xl shadow-xl object-cover"
                  />
                ) : (
                  <div
                    className={`hidden lg:flex w-[360px] h-[520px] rounded-xl shadow-xl ${IMAGE_FALLBACK} text-sm`}
                  >
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 예고편 */}
              <div>
                {/* 예고편 클릭 시 모달 (YouTube iframe) */}
                {trailers.length > 0 && (
                  <div>
                    <h2 className={SECTION_TITLE}>영상</h2>
                    <ul className={H_SCROLL.replace("gap-4", "gap-3")}>
                      {trailers.slice(0, 5).map((t) => (
                        <li key={t.id} className="shrink-0 w-[300px]">
                          <button
                            onClick={() => {
                              setActiveTrailer(t.key);
                              setIsTrailerOpen(true);
                            }}
                            className="group relative w-full aspect-video rounded-lg overflow-hidden border border-white/20"
                          >
                            <img
                              src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`}
                              alt={t.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 text-xs rounded bg-black/70 text-white">
                              {t.type === "Teaser" ? "Teaser" : "Trailer"}
                            </div>
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-black text-xl">
                                ▶
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 관련 시리즈가 있을경우 표시 */}
                {collection && collection.parts?.length > 0 && (
                  <div className="mt-10">
                    <h2 className={SUBSECTION_TITLE}>
                      시리즈 · {collection.name}
                    </h2>

                    <ul className={H_SCROLL}>
                      {collection.parts.map((movie) => (
                        <li
                          key={movie.id}
                          className={`shrink-0 md:w-[200px] w-fit ${CARD_BORDER}`}
                        >
                          <button
                            onClick={() => {
                              navigate(`/detail/${movie.id}`, {
                                replace: true
                              });
                              window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            className="group w-full text-left"
                          >
                            {movie.poster_path ? (
                              <img
                                src={`${baseUrl}${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-[260px] object-cover rounded-lg mb-2 group-hover:opacity-90 transition"
                              />
                            ) : (
                              <div
                                className={`w-full h-[260px] rounded-lg mb-2 ${IMAGE_FALLBACK} text-sm`}
                              >
                                이미지 없음
                              </div>
                            )}
                            <p className="text-sm font-medium truncate">
                              {movie.title}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 출연자 정보 */}
              <div ref={castSectionRef} className="mt-10">
                <h2 className={SECTION_TITLE}>출연진</h2>
                <ul className={H_SCROLL}>
                  {cast.slice(0, 10).map((actor) => (
                    <li
                      key={actor.id}
                      className="w-[110px] shrink-0 text-center"
                    >
                      {actor.profile_path ? (
                        <img
                          src={`${baseUrl}${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full aspect-auto rounded-lg mb-2"
                        />
                      ) : (
                        <div
                          className={`w-full h-[160px] rounded-lg mb-2 ${IMAGE_FALLBACK} text-xs`}
                        >
                          이미지 없음
                        </div>
                      )}
                      <p className="text-sm font-medium truncate">
                        {actor.name}
                      </p>
                      <p className="text-xs text-gray-300 truncate">
                        {actor.character}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 관련 영화 */}
              <div className="mt-14">
                <h2 className={SECTION_TITLE}>관련 영화</h2>

                <div
                  className={`
                    ${H_SCROLL}
                    md:grid md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:overflow-visible
                  `}
                >
                  {related.length === 0 ? (
                    <div className="text-sm text-gray-400 py-2">
                      관련 영화가 없습니다.
                    </div>
                  ) : (
                    related.slice(0, 10).map((data) => (
                      <div
                        key={data.id}
                        onClick={() => {
                          navigate(`/detail/${data.id}`, { replace: true });
                          window.scrollTo({ top: 0, behavior: "instant" });
                        }}
                        className="shrink-0 w-[140px] sm:w-[160px] md:w-auto"
                      >
                        <MovieCard
                          posterPath={data.poster_path}
                          title={data.title}
                          id={data.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 예고편 모달 */}
          {isTrailerOpen && activeTrailer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-5xl rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-white/10">
                  <span className="text-sm text-gray-300">예고편 재생</span>

                  <button
                    onClick={() => {
                      setIsTrailerOpen(false);
                      setActiveTrailer(null);
                    }}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition"
                    aria-label="Close trailer"
                  >
                    ✕
                  </button>
                </div>

                {/* Video */}
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`}
                    title="Movie Trailer"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
