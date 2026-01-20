// Layout.jsx
import { Outlet } from "react-router-dom";
import NavBar from "../components/Navbar";

function Layout({ isDark, setIsDark }) {
  return (
    <>
      <NavBar isDark={isDark} setIsDark={setIsDark} />
      <Outlet />
    </>
  );
}

export default Layout;
