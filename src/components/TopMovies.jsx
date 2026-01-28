import { useEffect, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
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
        const api = await fetch(
          "https://api.themoviedb.org/3/movie/top_rated?language=ko-KR",
          options
        );
        const res = await api.json();
        // adult 값이 false인 영화만 필터링
        const filteredMovies = res.results.filter(
          (movie) => movie.adult === false
        );
        setMovies(filteredMovies.slice(0, 10));
      } catch {
        console.log("error 다시 해보셈");
      }
    };
    movieApi();
  }, []);

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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/80 to-transparent" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 
                          h-32 bg-linear-to-b from-transparent to-[#ffffffd8]
                          dark:from-transparent dark:to-zinc-950"
          />
          {/* content */}
          <div className="absolute left-4 md:left-16 top-24 text-white">
            <div className="flex mb-6 items-end gap-2">
              <h1
                className="text-5xl md:text-7xl  text-zinc-100
              drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]"
                style={{
                  fontFamily: '"Anton", sans-serif'
                }}
              >
                {movies[activeIndex].title}
              </h1>
              <span className="text-lg px-2 text-yellow-200">
                ⭐️ {movies[activeIndex].vote_average.toFixed(1)}
              </span>
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
                    ? "scale-125 opacity-100"
                    : "opacity-30 scale-80 hover:opacity-60"
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
