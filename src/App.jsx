import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import MovieCard from "./components/MovieCard";
import MovieDetail from "./components/MovieDetail";
import movieListData from "./data/movieListData.json";
import Layout from "./share/Layout";

function App() {
  // 더미데이터(movieListData) 상태관리
  const [movies, _] = useState(movieListData.results);
  console.log(movies);

  //Todo :  main 페이지 컴포넌트 따로 빼기
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          {/* 메인 페이지 */}
          <Route
            path="/"
            element={
              <main>
                <section className="max-w-7xl mx-auto p-4">
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                    {movies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        posterPath={movie.poster_path}
                        title={movie.title}
                        rating={movie.vote_average}
                      />
                    ))}
                  </ul>
                </section>
              </main>
            }
          />

          {/* 상세 페이지 */}
          <Route path="/detail" element={<MovieDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
