import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../constants";

export default function MovieDetail() {
  const [detail, setDetail] = useState(null);
  const params = useParams();

  useEffect(() => {
    const detailFetch = async () => {
      try {
        const detailApi = await fetch(
          `https://api.themoviedb.org/3/movie/${params.id}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN}`
            }
          }
        );
        const res = await detailApi.json();
        setDetail(res);
      } catch {
        console.log("error");
      }
    };

    detailFetch();
  }, [params.id]);

  return (
    <>
      {detail && (
        <section className="max-w-5xl mx-auto p-6">
          <div className="flex gap-6">
            <img
              src={`${baseUrl}${detail.poster_path}`}
              alt={detail.title}
              className="w-64 rounded-lg"
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{detail.title}</h1>
                <p className="text-yellow-400">⭐ {detail.vote_average}</p>
              </div>

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

                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">줄거리</h2>
                  <p className="text-gray-300">{detail.overview}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
