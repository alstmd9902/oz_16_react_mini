import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import MovieCard from "./components/MovieCard";
import MovieDetail from "./components/MovieDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Search from "./pages/Search";
import Layout from "./share/Layout";

function App() {
  // 더미데이터(movieListData) 상태관리
  const [movies, setMovies] = useState([]);
  const [isDark, setIsDark] = useState(true); //다크모드

  useEffect(() => {
    const root = document.documentElement; // <html>
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

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
          "https://api.themoviedb.org/3/movie/popular?language=ko-KR",
          options
        );
        const res = await api.json();
        // adult 값이 false인 영화만 필터링
        const filteredMovies = res.results.filter(
          (movie) => movie.adult === false
        );
        setMovies(filteredMovies);
      } catch {
        console.log("error 다시 해보셈");
      }
    };
    movieApi();
  }, []);

  //Todo :  main 페이지 컴포넌트 따로 빼기
  return (
    <>
      <Routes>
        <Route element={<Layout isDark={isDark} setIsDark={setIsDark} />}>
          {/* 메인 페이지 */}
          <Route
            path="/"
            element={
              <section className="max-w-7xl mx-auto p-4">
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      posterPath={movie.poster_path}
                      title={movie.title}
                      rating={movie.vote_average}
                      id={movie.id}
                    />
                  ))}
                </ul>
              </section>
            }
          />

          {/* 상세 페이지 */}
          <Route path="/detail/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
