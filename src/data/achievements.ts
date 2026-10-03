/**
 * What members of the club have gone on to do. Keep entries factual: a title and an organisation, nothing invented.
 * Photos live in /public/team-images. `artifact` picks the little object each person's scene is built around.
 */
export type Artifact = "patch" | "stamp" | "classified" | "receipt" | "nametag" | "ticket" | "notebook";

/** A second role held by the same person, shown alongside the first. */
export type ExtraRole = { headline: string; org: string; detail: string; logo?: Logo };

/** Files in /public/logos. */
export type Logo = "kiwix" | "gsoc" | "fossunited" | "zomato" | "apple" | "nsut" | "owasp" | "drdo";

export type Achievement = {
  name: string;
  photo: string;
  /** CSS object-position, so the face stays in frame. */
  focus?: string;
  /** The role or award. */
  headline: string;
  org: string;
  /** One line spelling out any acronyms. */
  detail: string;
  artifact: Artifact;
  logo?: Logo;
  /** Further roles. Only the passport-stamp scene renders these. */
  also?: ExtraRole[];
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    name: "Vikram Aditya Verma",
    photo: "/team-images/vikram.webp",
    focus: "50% 45%",
    headline: "GSoC’26",
    org: "Kiwix / OpenZIM",
    detail: "Google Summer of Code 2026",
    artifact: "patch",
    logo: "kiwix",
  },
  {
    name: "Siddharth Bansal",
    photo: "/team-images/siddharth.jpg",
    focus: "50% 30%",
    headline: "Intern",
    org: "FOSS United",
    detail: "Interning at the foundation behind our club",
    artifact: "stamp",
    logo: "fossunited",
    also: [{ headline: "Intern", org: "OWASP", detail: "Open Worldwide Application Security Project", logo: "owasp" }],
  },
  {
    name: "Moksh",
    photo: "/team-images/moksh.jpg",
    focus: "50% 25%",
    headline: "Research Intern",
    org: "DRDO",
    detail: "Defence Research and Development Organisation",
    artifact: "classified",
    logo: "drdo",
  },
  {
    name: "Gursimar Singh",
    photo: "/team-images/gursimar.jpg",
    focus: "50% 35%",
    headline: "SDE",
    org: "Zomato",
    detail: "Software Development Engineer",
    artifact: "receipt",
    logo: "zomato",
  },
  {
    name: "Tanuj Pokhriyal",
    photo: "/team-images/tanuj.jpg",
    focus: "50% 25%",
    headline: "Intern",
    org: "Zomato",
    detail: "Internship",
    artifact: "nametag",
    logo: "zomato",
  },
  {
    name: "Pranshu Bansal",
    photo: "/team-images/pranshu.jpg",
    focus: "50% 25%",
    headline: "WWDC’26 Scholar",
    org: "Apple",
    detail: "Worldwide Developers Conference 2026",
    artifact: "ticket",
    logo: "apple",
  },
  {
    name: "Piyush Gupta",
    photo: "/team-images/piyush.jpg",
    focus: "62% 92%",
    headline: "Research Intern",
    org: "NSUT",
    detail: "Netaji Subhas University of Technology",
    artifact: "notebook",
    logo: "nsut",
  },
];
