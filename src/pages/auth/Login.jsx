import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import { useSupabase } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [value, setValue] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState({
    email: "",
    password: ""
  }); // 에러 상태값

  // 어떤 input이 사용자가 한 번이라도 건드렸는지 상태 저장
  // touched 상태를 사용하면 사용자가 입력을 시작하기 전에는 에러 메시지를 숨길 수 있음
  const [touched, setTouched] = useState({ email: false, password: false });

  // 로그인 유효성 검사
  const validate = () => {
    const newError = {};

    const emailRegex =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

    if (!emailRegex.test(value.email)) {
      newError.email = "올바른 이메일 형식으로 입력해주세요";
    }

    if (value.password.length < 8) {
      newError.password = "비밀번호는 8자 이상이어야 합니다";
    }

    setError(newError);

    return Object.keys(newError).length === 0;
  };

  //input 상태변경 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue((prev) => ({ ...prev, [name]: value }));
  };

  // input 포커스 아웃 시 touched 상태를 true로 변경하고 유효성 검사 실행
  // 포커스 아웃 시 바로 모든 에러를 보여주지 않는 이유는
  // 사용자가 입력을 시작하지 않은 필드의 에러를 미리 보여주면 UX가 나빠지기 때문
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate();
  };

  //로그인 성공시 메인 페이지로 이동
  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 새로고침 막기

    const isValid = validate(); // 1. 유효성 검사
    if (!isValid) return;

    // 2. Supabase 서버에 로그인 요청 (fetch 역할)
    const { error } = await supabase.auth.signInWithPassword({
      email: value.email,
      password: value.password
    });

    // 3. 서버에서 에러 주면 처리 / 이메일 이나 비번 틀리면
    if (error) {
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    // 4. 성공하면 메인 페이지 이동
    navigate("/");
    alert("로그인 성공 했습니다");
  };

  return (
    <div
      className="w-full relative
                min-h-screen p-6 md:p-8 overflow-hidden
                 bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white
                flex flex-col items-center justify-center gap-10"
    >
      {/* 배경 효과 */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[80%] md:h-[50%] bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),rgba(0,0,0,0)_70%)]" />

      {/* 오즈무비 로그인폼 묶음 */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto
                  flex flex-col items-center gap-10
                  md:grid md:grid-cols-2 md:gap-0"
      >
        {/* OZ MOVIE 영역 왼쪽 */}
        <div className="relative flex items-center justify-center shrink-0">
          <div
            className="leading-26 text-center relative z-10
             text-black/70 dark:text-violet-200/60
             md:text-8xl font-black text-7xl 
             md:tracking-[0.2em] tracking-widest font-['Bebas_Neue'] 
             [text-shadow:0_0_20px_rgba(206, 81, 252, 0.42)] dark:[text-shadow:0_0_50px_rgba(255,255,255,0.25)]"
          >
            OZ MOVIE
          </div>
        </div>

        {/* 로그인 영역 */}
        <div className="w-full flex justify-center md:justify-start md:h-[500px]">
          <div className="relative z-10 max-w-md rounded-2xl bg-white/70 border border-zinc-200 dark:bg-black/10 dark:border-white/10 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] w-full px-10 py-16">
            {/* Header */}
            <h1 className="text-zinc-700 dark:text-white/60 text-2xl mb-8 w-full text-center font-black">
              로그인
            </h1>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <InputField
                label="email"
                hideLabel
                value={value.email}
                onBlur={handleBlur}
                onChange={handleChange}
                name="email"
                type="email"
                placeholder="Email address"
                error={error.email}
                touched={touched.email}
              />

              <InputField
                label="password"
                hideLabel
                value={value.password}
                onBlur={handleBlur}
                name="password"
                onChange={handleChange}
                type="password"
                placeholder="Password"
                error={error.password}
                touched={touched.password}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-violet-500 dark:text-violet-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-violet-600 hover:bg-violet-700 transition py-3 text-white font-semibold shadow-sm dark:shadow-none"
              >
                Login
              </button>
            </form>

            {/* 회원가입으로 이동 */}
            <div className="mt-6 text-center text-sm text-zinc-600 dark:text-white/60">
              Don’t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 text-violet-400 hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
