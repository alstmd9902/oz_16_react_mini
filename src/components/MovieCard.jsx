export default function MovieCard({ posterPath, title, rating }) {
  const baseUrl = "https://image.tmdb.org/t/p/w500"; // 기본이미지 경로

  return (
    <li className="rounded-lg shadow-md">
      <img
        src={`${baseUrl}${posterPath}`}
        alt={title}
        className="w-full h-[240px] object-cover"
      />

      <div className="p-2 text-white">
        <h3 className="text-sm font-semibold truncate">제목 : {title}</h3>
        <p className="text-xs text-gray-300 mt-1">평점 : {rating}</p>
      </div>
    </li>
  );
}
