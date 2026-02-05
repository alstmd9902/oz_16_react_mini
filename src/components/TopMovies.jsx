import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// import required modules

// Import Swiper styles
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { baseUrl } from "../constants";

export default function TopMovies() {
  const [movies, setMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [logoMap, setLogoMap] = useState({});
  const [runtimeMap, setRuntimeMap] = useState({});

  useEffect(() => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
      }
    };

    const genreApi = async () => {
      const res = await fetch(
        "https://api.themoviedb.org/3/genre/movie/list?language=ko-KR",
        options
      );
      const data = await res.json();
      const map = {};
      data.genres.forEach((g) => {
        map[g.id] = g.name;
      });
      setGenreMap(map);
    };

    const movieApi = async () => {
      try {
        const api = await fetch(
          "https://api.themoviedb.org/3/trending/movie/week?language=ko-KR",
          options
        );
        const res = await api.json();
        // adult 값이 false인 영화만 필터링
        const filteredMovies = res.results.filter(
          (movie) => movie.adult === false
        );
        const top = filteredMovies.slice(0, 10);
        setMovies(top);
        logoApi(top.map((m) => m.id));
      } catch {
        console.log("error 다시 해보셈");
      }
    };

    const logoApi = async (movieIds) => {
      try {
        const entries = await Promise.all(
          movieIds.map(async (id) => {
            const [imageRes, detailRes] = await Promise.all([
              fetch(`https://api.themoviedb.org/3/movie/${id}/images`, options),
              fetch(
                `https://api.themoviedb.org/3/movie/${id}?language=ko-KR`,
                options
              )
            ]);

            const imageData = await imageRes.json();
            const detailData = await detailRes.json();

            // Prefer Korean logo, fallback to English
            const logo =
              imageData.logos?.find((l) => l.iso_639_1 === "ko") ||
              imageData.logos?.find((l) => l.iso_639_1 === "en");

            return [
              id,
              {
                logo: logo ? `${baseUrl}${logo.file_path}` : null,
                runtime: detailData.runtime
              }
            ];
          })
        );
        const map = Object.fromEntries(entries);
        setLogoMap(
          Object.fromEntries(Object.entries(map).map(([id, v]) => [id, v.logo]))
        );
        setRuntimeMap(
          Object.fromEntries(
            Object.entries(map).map(([id, v]) => [id, v.runtime])
          )
        );
      } catch (e) {
        console.error("logo fetch error", e);
      }
    };

    genreApi();
    movieApi();
  }, []);

  // 별점 (5점 만점, 반올림 / 꽉 찬 별 + 흐린 별)
  const renderStars = (voteAverage) => {
    const rating = Math.round(voteAverage / 2); // 0~5

    return (
      <div className="flex items-center gap-1 text-yellow-300">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < rating ? "text-yellow-300" : "text-yellow-300/30"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <article className="relative">
      {/* HERO AREA */}

      {movies[activeIndex] && (
        <section
          aria-label="Featured movie"
          className="relative overflow-hidden h-screen"
        >
          {/* background */}
          <div
            className="absolute inset-0 bg-cover bg-top transition-all duration-700 aspect-auto"
            style={{
              backgroundImage: `url(${baseUrl}${
                movies[activeIndex].backdrop_path ||
                movies[activeIndex].poster_path
              })`
            }}
          />
          {/* light mode bridge */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32
                        bg-linear-to-b from-black via-black/20 to-white/86 dark:to-zinc-950
                        z-10 pointer-events-none"
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-black/90" />

          {/* content */}
          <div className="absolute inset-0 z-10 flex items-center">
            <div className="mx-auto w-full max-w-[1300px]">
              <div className="grid w-full grid-cols-1 lg:gap-x-12 gap-12 px-8">
                <div className="text-white">
                  <div className="flex mb-10 gap-2 h-auto md:h-[120px] xl:w-[600px] w-full">
                    {logoMap[movies[activeIndex].id] ? (
                      <img
                        src={logoMap[movies[activeIndex].id]}
                        alt={movies[activeIndex].title}
                        className="object-contain"
                      />
                    ) : (
                      <h1 className="text-5xl md:text-7xl text-zinc-100 drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]">
                        {movies[activeIndex].title}
                      </h1>
                    )}
                  </div>
                  {/* 장르 뱃지 */}
                  {movies[activeIndex]?.genre_ids && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {movies[activeIndex].genre_ids
                        .map((id) => genreMap[id])
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((genre) => (
                          <span
                            key={genre}
                            className="px-3 py-1 text-xs rounded-lg mb-2
                                 bg-violet-300/10 text-zinc-100 backdrop-blur border border-violet-400/30"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-3">
                    {/* 별점 */}
                    {renderStars(movies[activeIndex].vote_average)}

                    {/* 러닝타임 */}
                    {runtimeMap[movies[activeIndex].id] && (
                      <div className="flex items-center gap-1 text-sm text-zinc-300">
                        <span>🕒</span>
                        <span>{runtimeMap[movies[activeIndex].id]}분</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-4 mb-6 max-w-4xl">
                    {movies[activeIndex].overview}
                  </p>

                  <div className="flex gap-4">
                    <button className="bg-red-600 px-6 py-3 rounded-lg font-semibold">
                      ▶ WATCH
                    </button>
                    <Link
                      to={`/detail/${movies[activeIndex].id}`}
                      className="border border-white/40 px-6 py-3 rounded-lg hover:bg-violet-700"
                    >
                      SEE MORE
                    </Link>
                  </div>
                </div>
                <div className="">
                  <div className="w-full p-3 relative">
                    {/* THUMBNAIL SWIPER */}
                    <section aria-label="Movie thumbnails" className="relative">
                      <Swiper
                        modules={[Navigation]}
                        slidesPerView="auto"
                        spaceBetween={16}
                        centeredSlides
                        centeredSlidesBounds
                        slideToClickedSlide
                        watchSlidesProgress
                        onSlideChange={(swiper) =>
                          setActiveIndex(swiper.realIndex)
                        }
                        className="w-full"
                        navigation={{
                          nextEl: ".thumb-next",
                          prevEl: ".thumb-prev"
                        }}
                      >
                        {movies.map((movie, index) => (
                          <SwiperSlide
                            key={movie.id}
                            onClick={() => setActiveIndex(index)}
                            className={`!w-[240px] cursor-pointer rounded-xl overflow-hidden transition
                            ${
                              index === activeIndex
                                ? "scale-105 opacity-100"
                                : "opacity-20 scale-90 hover:opacity-80"
                            }
                          `}
                          >
                            <img
                              src={`${baseUrl}${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <button
                        className="flex items-center justify-center thumb-prev absolute left-[-18px] top-1/2 -translate-y-1/2 z-20
                                 h-10 w-10 rounded-full bg-black/70 border border-zinc-600 text-white/80 backdrop-blur"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        className="flex items-center justify-center thumb-next absolute right-[-18px] top-1/2 -translate-y-1/2 z-20
                                 h-10 w-10 rounded-full bg-black/70 border border-zinc-600 text-white/80 backdrop-blur"
                      >
                        <ChevronRight />
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
