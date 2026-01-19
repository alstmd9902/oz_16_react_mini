import { Link } from "react-router-dom";
import { baseUrl } from "../constants";

export default function MovieCard({ posterPath, title, rating, id }) {
  return (
    <li className="rounded-lg shadow-md flex flex-col">
      <Link to={`/detail/${id}`}>
        <img
          src={`${baseUrl}${posterPath}`}
          alt={title}
          className="w-full object-cover h-[300px]"
        />

        <div className="p-2 text-white">
          <h3 className="text-lg font-semibold truncate">제목 : {title}</h3>
          <p className="text-xs text-gray-300 mt-1">평점 : {rating}</p>
        </div>
      </Link>
    </li>
  );
}
