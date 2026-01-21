import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import { useSupabase } from "../../context/AuthContext";

const INPUT_BASE_STYLE = `
  w-full rounded-md
  bg-white/90 border border-zinc-300
  text-zinc-800 placeholder-zinc-700
  dark:bg-black/35 dark:border-white/15
  dark:text-white dark:placeholder-white/35
  px-4 py-3
  focus:outline-none focus:ring-2 focus:ring-violet-500
`;

export default function Signup() {
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  }); //input 관련 상태값 객체로 묶음

  const [error, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  }); // 에러 상태값

  // 사용자가 실제로 입력한 필드인지 추적하기 위한 상태
  // 에러 메시지는 사용자가 해당 필드와 상호작용(포커스 아웃)했을 때만 보여주기 위함
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  //input 상태변경 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  // console.log(values);

  //유효성 검사 함수
  const validate = () => {
    const newErrors = {};

    const nameRegex = /^[a-zA-Z0-9가-힣]{2,4}$/;
    if (!nameRegex.test(values.name)) {
      newErrors.name = "이름을 입력 해주세요";
    }
    const emailRegex =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!emailRegex.test(values.email)) {
      newErrors.email = "이메일 형식이 올바르지 않습니다";
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,10}$/;
    if (!passwordRegex.test(values.password)) {
      newErrors.password = "영문과 숫자를 조합해 8~10자로 입력해주세요";
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
    setErrors(newErrors);

    // 에러가 하나도 없으면 true
    return Object.keys(newErrors).length === 0;
  };

  // input 포커스 아웃 시 유효성 검사 실행 및 해당 필드를 touched 처리
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate();
  };

  // 회원가입 폼 제출 시 실행
  const handleSubmit = async (e) => {
    e.preventDefault(); // 새로고침 막기

    const isValid = validate();
    if (!isValid) return; // 유효성 검사 실패 시 제출 중단

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
      });

      if (error) {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      alert("회원가입이 완료되었습니다.");

      // 성공적으로 회원가입하면 로그인 페이지로 이동
      navigate("/login");
    } catch (err) {
      // 코드, 네트워크 에러처리
      console.error(err);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="
        w-full relative
        min-h-screen
        overflow-hidden
        bg-zinc-50 text-zinc-900
        dark:bg-zinc-950 dark:text-white
        flex items-center justify-center
        p-6 md:p-8
      "
    >
      {/* 배경화면 */}
      <div
        className="
          pointer-events-none absolute top-0 left-1/2 -translate-x-1/2
          w-[120%] h-[80%] md:h-[50%]
          bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),rgba(255,255,255,0)_70%)]
          dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),rgba(0,0,0,0)_70%)]
        "
      />

      {/* 회원가입 폼 */}
      <div
        className="
          relative z-10 w-full max-w-md
          rounded-2xl
          bg-white/70 border border-zinc-200
          dark:bg-black/10 dark:border-white/10
          backdrop-blur-xl
          shadow-[0_30px_80px_rgba(0,0,0,0.6)]
          px-10 py-16
        "
      >
        <h1 className="text-zinc-700 dark:text-white/60 text-2xl mb-3 text-center font-black">
          회원가입
        </h1>
        <p className="text-center text-xs text-zinc-500 dark:text-white/40 mb-6">
          Create your account to start exploring movies
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="name"
            hideLabel
            value={values.name}
            name="name"
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="이름을 입력해주세요"
            error={error.name}
            touched={touched.name}
          />

          <InputField
            label="email"
            hideLabel
            value={values.email}
            onBlur={handleBlur}
            onChange={handleChange}
            name="email"
            type="email"
            placeholder="이메일 형식으로 입력해주세요"
            className={INPUT_BASE_STYLE}
            error={error.email}
            touched={touched.email}
          />
          <InputField
            label="비밀번호"
            hideLabel
            value={values.password}
            onBlur={handleBlur}
            onChange={handleChange}
            name="password"
            type="password"
            placeholder="영문 대/소문자와 숫자를 조합해 입력"
            className={INPUT_BASE_STYLE}
            error={error.password}
            touched={touched.password}
          />

          <InputField
            label="비밀번호 재입력"
            hideLabel
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            name="confirmPassword"
            type="password"
            placeholder="비밀번호와 동일하게 입력해주세요"
            className={INPUT_BASE_STYLE}
            error={error.confirmPassword}
            touched={touched.confirmPassword}
          />

          <button
            type="submit"
            className="
              w-full rounded-md
              bg-violet-600 hover:bg-violet-700
              transition py-3
              text-white font-semibold
              shadow-sm dark:shadow-none
            "
          >
            Sign up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-600 dark:text-white/60">
          Already have an account?
          <button
            onClick={() => navigate("/login")}
            className="ml-1 text-violet-500 dark:text-violet-400 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
