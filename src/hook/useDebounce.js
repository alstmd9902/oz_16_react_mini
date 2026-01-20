import { useEffect, useState } from "react";

/**
 * useDebounce
 * - 값(value)이 자주 바뀔 때
 * - 지정한 시간(delay) 동안 변화가 없으면
 * - 마지막 값만 반환해주는 커스텀 훅
 */
export default function useDebounce(searchText, delay = 200) {
  // 초기값은 전달받은 searchText (input 값)
  const [debouncedValue, setDebouncedValue] = useState(searchText);

  useEffect(() => {
    // delay 시간 후에 searchText (input 값) 업데이트하는 타이머 설정
    const timer = setTimeout(() => {
      setDebouncedValue(searchText);
    }, delay);

    // searchText (input 값) 이나 delay가 바뀌면 이전 타이머를 제거해서 불필요한 실행 방지
    return () => clearTimeout(timer);
  }, [searchText, delay]); // searchText (input 값) 또는 delay가 변경될 때마다 실행

  // 디바운스 처리된 값 반환
  return debouncedValue;
}
