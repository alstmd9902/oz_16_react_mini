import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import MovieDetail from "./components/MovieDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import MyPage from "./pages/MyPage";
import Search from "./pages/Search";
import Layout from "./share/Layout";

function App() {
  const [isDark, setIsDark] = useState(true); //다크모드

  useEffect(() => {
    const root = document.documentElement; // <html>
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <Routes>
        <Route element={<Layout isDark={isDark} setIsDark={setIsDark} />}>
          {/* 메인 페이지 */}
          <Route path="/" element={<Main />} />

          {/* 페이지 */}
          <Route path="/detail/:id" element={<MovieDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
