import { useEffect, useMemo, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// import required modules

// Import Swiper styles
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

  const activeGenres = useMemo(() => {
    const movie = movies[activeIndex];
    if (!movie || !movie.genre_ids || !Object.keys(genreMap).length) return "";
    return movie.genre_ids
      .map((id) => genreMap[id])
      .filter(Boolean)
      .slice(0, 3)
      .join(" | ");
  }, [movies, activeIndex, genreMap]);

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
          "https://api.themoviedb.org/3/movie/top_rated?language=ko-KR",
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

  // 별점 (평점)
  const renderStars = (voteAverage) => {
    const fiveStar = voteAverage / 2; // 0–5
    const full = Math.floor(fiveStar);
    const half = fiveStar - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return (
      <div className="flex items-center gap-1 text-yellow-300">
        {Array.from({ length: full }).map((_, i) => (
          <span key={`f-${i}`}>★</span>
        ))}
        {half && <span>☆</span>}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={`e-${i}`} className="text-yellow-300/30">
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
          className="relative overflow-hidden h-[calc(35vh+28vw-64px)] 
          min-h-[280px] max-h-[70vh] "
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

          {/* overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/80 to-transparent" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 
                          h-32 bg-linear-to-b from-transparent to-[#ffffffd8]
                          dark:from-transparent dark:to-zinc-950"
          />
          {/* content */}
          <div className="absolute left-4 md:left-16 top-24 text-white">
            <div className="flex mb-10 gap-2 h-[72px] md:h-[120px] w-[600px] ">
              {logoMap[movies[activeIndex].id] ? (
                <img
                  src={logoMap[movies[activeIndex].id]}
                  alt={movies[activeIndex].title}
                  className="object-contain"
                />
              ) : (
                <h1
                  className="text-5xl md:text-7xl text-zinc-100
                    drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]"
                  style={{ fontFamily: '"Anton", sans-serif' }}
                >
                  {movies[activeIndex].title}
                </h1>
              )}
            </div>
            <div className="md:flex md:flex-row flex-col items-center mb-3">
              {activeGenres && (
                <p className="text-sm text-zinc-200 tracking-wide">
                  {activeGenres}
                </p>
              )}

              {/* 장르 . 평정 . 러닝타임 */}
              <div className="ml-3 flex items-center">
                {renderStars(movies[activeIndex].vote_average)}
                <span className="text-sm text-yellow-200">
                  {/* {movies[activeIndex].vote_average.toFixed(1)} */}
                </span>
              </div>
              {runtimeMap[movies[activeIndex].id] && (
                <div className="ml-4 flex items-center gap-1 text-sm text-zinc-300">
                  <span>🕒</span>
                  <span>{runtimeMap[movies[activeIndex].id]}분</span>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-300 line-clamp-4 mb-6 max-w-3xl">
              {movies[activeIndex].overview}
            </p>

            <div className="flex gap-4">
              <button className="bg-red-600 px-6 py-3 rounded-lg font-semibold">
                ▶ WATCH
              </button>
              <Link
                to={`/detail/${movies[activeIndex].id}`}
                className="border border-white/40 px-6 py-3 rounded-lg hover:bg-violet-500"
              >
                SEE MORE
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* THUMBNAIL SWIPER */}
      <section
        aria-label="Movie thumbnails"
        className="relative md:-top-30 -top-[94px] md:px-30 px-20"
      >
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={16}
          centeredSlides={true}
          centeredSlidesBounds={true}
          slideToClickedSlide={true}
          watchSlidesProgress={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full"
        >
          {movies.map((movie, index) => (
            <SwiperSlide
              key={movie.id}
              onClick={() => setActiveIndex(index)}
              className={`
                !w-[200px] cursor-pointer rounded-lg overflow-hidden transition
                ${
                  index === activeIndex
                    ? "scale-110 opacity-100"
                    : "opacity-40 scale-80 hover:opacity-70"
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
      </section>
    </article>
  );
}
