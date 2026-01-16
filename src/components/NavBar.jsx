export default function NavBar() {
  const buttonStyle = "bg-violet-600 px-3 py-1 rounded-md text-white";

  return (
    <nav className="h-14 bg-black w-full flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center gap-4 justify-between px-6">
        <h1 className="text-2xl text-white">OZ무비.</h1>

        <input type="text" className="bg-white flex-1 rounded-xl px-3 py-1" />

        <div className="flex items-center gap-2">
          <button className={buttonStyle}>로그인</button>
          <button className={buttonStyle}>회원가입</button>
        </div>
      </div>
    </nav>
  );
}
