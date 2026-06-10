// Catálogo de películas consumido desde una API pública (Studio Ghibli API,
// sin API key). Si la API falla, se usa un listado local de respaldo para que
// la web nunca se quede sin contenido.
//
// API: https://ghibliapi.vercel.app/films

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: number; // sobre 10
  duration: number; // minutos
  director: string;
  overview: string;
  poster: string; // URL del póster (o "" para usar el respaldo visual)
  banner?: string; // imagen apaisada para el hero
}

const API_URL = "https://ghibliapi.vercel.app/films";

interface GhibliFilm {
  id: string;
  title: string;
  description: string;
  director: string;
  release_date: string;
  running_time: string;
  rt_score: string;
  image: string;
  movie_banner: string;
}

function mapFilm(f: GhibliFilm): Movie {
  return {
    id: f.id,
    title: f.title,
    year: Number(f.release_date) || 0,
    genre: "Animación",
    rating: Math.round(Number(f.rt_score)) / 10, // 95 -> 9.5
    duration: Number(f.running_time) || 0,
    director: f.director,
    overview: f.description,
    poster: f.image,
    banner: f.movie_banner,
  };
}

/**
 * Obtiene el catálogo desde la API (cacheado 24 h). Si la petición falla,
 * devuelve el listado de respaldo.
 */
export async function fetchMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(API_URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`API respondió ${res.status}`);
    const films: GhibliFilm[] = await res.json();
    const movies = films.map(mapFilm);
    // Ordenamos por rating descendente para un catálogo más atractivo.
    return movies.sort((a, b) => b.rating - a.rating);
  } catch (err) {
    console.warn("No se pudo cargar la API de películas, usando respaldo:", err);
    return FALLBACK_MOVIES;
  }
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  const movies = await fetchMovies();
  return movies.find((m) => m.id === id);
}

export async function getMoviesByIds(ids: string[]): Promise<Movie[]> {
  const movies = await fetchMovies();
  return movies.filter((m) => ids.includes(m.id));
}

// Agrupa el catálogo por director (para mostrar secciones en la portada).
export function groupByDirector(movies: Movie[]): Record<string, Movie[]> {
  return movies.reduce<Record<string, Movie[]>>((acc, m) => {
    (acc[m.director] ??= []).push(m);
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Respaldo local (se usa solo si la API no responde).
// ---------------------------------------------------------------------------
const TMDB = "https://image.tmdb.org/t/p/w500";

const FALLBACK_MOVIES: Movie[] = [
  {
    id: "inception",
    title: "Inception",
    year: 2010,
    genre: "Ciencia ficción",
    rating: 8.8,
    duration: 148,
    director: "Christopher Nolan",
    overview:
      "Un ladrón que roba secretos a través de los sueños recibe la tarea inversa: implantar una idea en la mente de un objetivo.",
    poster: `${TMDB}/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg`,
  },
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    year: 2008,
    genre: "Acción",
    rating: 9.0,
    duration: 152,
    director: "Christopher Nolan",
    overview:
      "Batman se enfrenta al Joker, un criminal anárquico que sumerge a Gotham en el caos.",
    poster: `${TMDB}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
  },
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    genre: "Ciencia ficción",
    rating: 8.6,
    duration: 169,
    director: "Christopher Nolan",
    overview:
      "Un grupo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.",
    poster: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
  },
  {
    id: "parasite",
    title: "Parasite",
    year: 2019,
    genre: "Thriller",
    rating: 8.5,
    duration: 132,
    director: "Bong Joon-ho",
    overview:
      "Una familia pobre se infiltra poco a poco en el hogar de una familia adinerada, con consecuencias inesperadas.",
    poster: `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
  },
];
