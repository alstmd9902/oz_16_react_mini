import { useNavigate } from "react-router-dom";

export default function MovieCard({ posterPath, title, rating }) {
  const baseUrl = "https://image.tmdb.org/t/p/w500"; // 기본이미지 경로
  const navigate = useNavigate(); // 페이지 이동

  const navigateDetail = () => {
    navigate("/detail");
  };

  return (
    <li onClick={navigateDetail} className="rounded-lg shadow-md flex flex-col">
      <img
        src={`${baseUrl}${posterPath}`}
        alt={title}
        className="w-full object-cover h-[300px]"
      />

      <div className="p-2 text-white">
        <h3 className="text-lg font-semibold truncate">제목 : {title}</h3>
        <p className="text-xs text-gray-300 mt-1">평점 : {rating}</p>
      </div>
    </li>
  );
}
