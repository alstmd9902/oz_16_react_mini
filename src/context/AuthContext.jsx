/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { supabaseClient } from "../lib/supabaseClient";

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  return (
    <SupabaseContext.Provider value={supabaseClient}>
      {children}
    </SupabaseContext.Provider>
  );
};

// 나중에 따로 파일 분리하기
export const useSupabase = () => {
  const supabase = useContext(SupabaseContext);

  if (!supabase) {
    throw new Error("SupabaseProvider로 감싸지 않았습니다.");
  }

  return supabase;
};
