import { Link } from "react-router-dom";
import { baseUrl } from "../constants";

export default function MovieCard({ posterPath, title, id }) {
  return (
    <li
      className="group rounded-xl overflow-hidden
      bg-white/60 dark:bg-zinc-900/40 backdrop-blur-lg
      border border-white/30 dark:border-white/10
      shadow-lg transition-all duration-300"
    >
      <Link to={`/detail/${id}`}>
        <img
          src={`${baseUrl}${posterPath}`}
          alt={title}
          className="w-full object-cover aspect-2/3
          transition-transform duration-300 group-hover:scale-105"
        />

        <div className="p-3 text-black dark:text-white">
          <h3 className="text-base font-semibold truncate">제목 : {title}</h3>
        </div>
      </Link>
    </li>
  );
}
