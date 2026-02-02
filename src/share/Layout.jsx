// Layout.jsx
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

function Layout({ isDark, setIsDark }) {
  return (
    <>
      <NavBar isDark={isDark} setIsDark={setIsDark} />
      <main className="mt-16">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
