import { useState } from "react";
import movieDetailData from "../data/movieDetailData.json";

const baseUrl = "https://image.tmdb.org/t/p/w500";

export default function MovieDetail() {
  const [detail] = useState(movieDetailData);

  return (
    <section className="max-w-5xl mx-auto p-6">
      {/* 상단 이미지 */}
      <div className="flex gap-6">
        <img
          src={`${baseUrl}${detail.poster_path}`}
          alt={detail.title}
          className="w-64 rounded-lg"
        />

        {/* 제목 평점 장르 줄거리 묶음*/}
        <div className="flex flex-col gap-3">
          {/* 제목 평점 */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{detail.title}</h1>
            <p className="text-yellow-400">⭐ {detail.vote_average}</p>
          </div>

          {/* 장르 줄거리 */}
          <div className="flex flex-col">
            <ul className="flex gap-2 flex-wrap">
              {detail.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="px-2 py-1 bg-gray-700 rounded text-sm"
                >
                  {genre.name}
                </li>
              ))}
            </ul>

            {/* 줄거리 */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">줄거리</h2>
              <p className="text-gray-300">{detail.overview}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
