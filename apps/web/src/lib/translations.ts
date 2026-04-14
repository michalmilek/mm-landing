export const translations = {
  pl: {
    nav: {
      about: "O mnie",
      experience: "Doświadczenie",
      projects: "Projekty",
      blog: "Blog",
      contact: "Kontakt",
    },
    hero: {
      tagline: "Fullstack Developer · Polska",
    },
    about: {
      p1: "Cześć! Jestem Michał — fullstack developer z Rzeszowa. Specjalizuję się w React, TypeScript i Next.js. Buduję szybkie, responsywne aplikacje webowe z naciskiem na UX i czysty kod.",
      p2: "Mam doświadczenie z szerokim stackiem — od React Native i Angular po Vue, Nuxt, NestJS i Laravel. Ten landing? Zbudowałem go z Three.js, bo dlaczego nie.",
    },
    projects: {
      descriptions: {
        "laravel-react":
          "Full-stack aplikacja z Laravelem jako backend i React jako frontend. TypeScript.",
        "music-player": "Player muzyczny — odtwarzanie, playlisty, zarządzanie biblioteką utworów.",
        "portfolio-neobrutalism":
          "Portfolio w stylu neobrutalizm — odważny design, mocne kolory, typografia.",
        "mm-landing":
          "Ten landing! Matrix Rain 3D, TanStack Start SSR, MDX blog. Three.js goes brrr.",
      },
    },
    contact: {
      email: "twoj@email.com",
      subject: "Temat",
      message: "Wiadomość...",
      send: "WYŚLIJ",
    },
    blog: {
      allPosts: "Wszystkie posty",
      noPosts: "Brak postów... jeszcze.",
      back: "Powrót",
      backToAll: "Wszystkie posty",
      loading: "Ładowanie...",
      notFound: "Post nie znaleziony.",
    },
  },
  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      blog: "Blog",
      contact: "Contact",
    },
    hero: {
      tagline: "Fullstack Developer · Poland",
    },
    about: {
      p1: "Hi! I'm Michał — a fullstack developer from Rzeszów, Poland. I specialize in React, TypeScript and Next.js. I build fast, responsive web apps with a focus on UX and clean code.",
      p2: "I have experience with a wide tech stack — from React Native and Angular to Vue, Nuxt, NestJS and Laravel. This landing? Built it with Three.js, because why not.",
    },
    projects: {
      descriptions: {
        "laravel-react": "Full-stack app with Laravel backend and React frontend. TypeScript.",
        "music-player": "Music player — playback, playlists, library management.",
        "portfolio-neobrutalism":
          "Portfolio in neobrutalism style — bold design, strong colors, typography.",
        "mm-landing":
          "This landing! Matrix Rain 3D, TanStack Start SSR, MDX blog. Three.js goes brrr.",
      },
    },
    contact: {
      email: "your@email.com",
      subject: "Subject",
      message: "Message...",
      send: "SEND",
    },
    blog: {
      allPosts: "All posts",
      noPosts: "No posts... yet.",
      back: "Back",
      backToAll: "All posts",
      loading: "Loading...",
      notFound: "Post not found.",
    },
  },
} as const;

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];
