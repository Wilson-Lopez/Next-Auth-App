// Catálogo de películas (datos locales, sin API externa).
// Los pósters provienen del CDN público de TMDB. Si alguno no carga,
// el componente <Poster> muestra un gradiente con el título como respaldo.

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: number; // sobre 10
  duration: number; // minutos
  director: string;
  overview: string;
  poster: string; // ruta de TMDB (/t/p/w500/...) o "" para usar el respaldo
}

const TMDB = "https://image.tmdb.org/t/p/w500";

export const movies: Movie[] = [
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
      "Batman se enfrenta al Joker, un criminal anárquico que sumerge a Gotham en el caos y pone a prueba sus principios.",
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
    id: "the-matrix",
    title: "The Matrix",
    year: 1999,
    genre: "Ciencia ficción",
    rating: 8.7,
    duration: 136,
    director: "Lana y Lilly Wachowski",
    overview:
      "Un hacker descubre que la realidad es una simulación y se une a la rebelión contra las máquinas que esclavizan a la humanidad.",
    poster: `${TMDB}/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg`,
  },
  {
    id: "pulp-fiction",
    title: "Pulp Fiction",
    year: 1994,
    genre: "Crimen",
    rating: 8.9,
    duration: 154,
    director: "Quentin Tarantino",
    overview:
      "Las vidas de dos sicarios, un boxeador y la esposa de un gánster se entrelazan en historias de violencia y redención.",
    poster: `${TMDB}/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg`,
  },
  {
    id: "fight-club",
    title: "Fight Club",
    year: 1999,
    genre: "Drama",
    rating: 8.8,
    duration: 139,
    director: "David Fincher",
    overview:
      "Un oficinista insomne y un carismático vendedor de jabón fundan un club de pelea clandestino que se sale de control.",
    poster: `${TMDB}/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg`,
  },
  {
    id: "the-godfather",
    title: "The Godfather",
    year: 1972,
    genre: "Crimen",
    rating: 9.2,
    duration: 175,
    director: "Francis Ford Coppola",
    overview:
      "El patriarca de una dinastía del crimen organizado transfiere el control de su imperio a su reticente hijo menor.",
    poster: `${TMDB}/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`,
  },
  {
    id: "forrest-gump",
    title: "Forrest Gump",
    year: 1994,
    genre: "Drama",
    rating: 8.8,
    duration: 142,
    director: "Robert Zemeckis",
    overview:
      "La vida de un hombre de buen corazón y baja inteligencia que, sin proponérselo, presencia y protagoniza grandes hitos de la historia.",
    poster: `${TMDB}/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg`,
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
  {
    id: "avengers-endgame",
    title: "Avengers: Endgame",
    year: 2019,
    genre: "Acción",
    rating: 8.4,
    duration: 181,
    director: "Anthony y Joe Russo",
    overview:
      "Los Vengadores restantes intentan deshacer la devastación causada por Thanos y restaurar el equilibrio del universo.",
    poster: `${TMDB}/or06FN3Dka5tukK1e9sl16pB3iy.jpg`,
  },
  {
    id: "spirited-away",
    title: "El viaje de Chihiro",
    year: 2001,
    genre: "Animación",
    rating: 8.6,
    duration: 125,
    director: "Hayao Miyazaki",
    overview:
      "Una niña queda atrapada en un mundo de espíritus y debe trabajar en una casa de baños mágica para liberar a sus padres.",
    poster: `${TMDB}/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg`,
  },
  {
    id: "gladiator",
    title: "Gladiator",
    year: 2000,
    genre: "Acción",
    rating: 8.5,
    duration: 155,
    director: "Ridley Scott",
    overview:
      "Un general romano traicionado y reducido a la esclavitud busca venganza convirtiéndose en gladiador en la arena.",
    poster: `${TMDB}/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg`,
  },
];

export function getAllMovies(): Movie[] {
  return movies;
}

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getMoviesByIds(ids: string[]): Movie[] {
  return movies.filter((m) => ids.includes(m.id));
}

// Lista única de géneros para agrupar el catálogo.
export function getGenres(): string[] {
  return Array.from(new Set(movies.map((m) => m.genre)));
}
