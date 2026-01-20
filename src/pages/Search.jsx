import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";

export default function Search() {
  const [movies, setMovies] = useState([]);

  // URL에 들어있는 쿼리 파라미터를 읽기 위한 훅 예: /search?q=마블
  const [searchParams] = useSearchParams();

  // q라는 키에 해당하는 값 가져오기 /search?q=마블 → query === "마블"
  const query = searchParams.get("q");

  useEffect(() => {
    // 검색어가 없으면 API 요청 안 함
    // (예: /search 로만 접근했을 때)
    if (!query) return;

    // 영화 검색 API 요청 함수
    const fetchMovies = async () => {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${query}&language=ko-KR`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
          }
        }
      );

      const data = await response.json();
      setMovies(data.results);
    };
    fetchMovies();
    // query 값 (검색어) 이 바뀔 때마다 실행
  }, [query]);

  // 검색했지만 결과가 없는 경우
  if (query && movies.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-white/60 mt-14">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    // 검색 결과를 화면에 렌더링
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-6 mt-14">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          posterPath={movie.poster_path}
          title={movie.title}
          rating={movie.vote_average}
        />
      ))}
    </ul>
  );
}
