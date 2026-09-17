import { useMemo } from "react";

interface FloatingReview {
  name: string;
  initials: string;
  role: string;
  rating: number;
  text: string;
  programme: string;
  date: string;
}

const reviews: FloatingReview[] = [
  {
    name: "Sarah Mitchell",
    initials: "SM",
    role: "Learner",
    rating: 5,
    text: "The coaching team went above and beyond. My confidence in marketing analytics has completely transformed.",
    programme: "Marketing Manager L6",
    date: "2 days ago",
  },
  {
    name: "James Carter",
    initials: "JC",
    role: "Employer",
    rating: 5,
    text: "Progress reports are clear and timely. Our apprentice hit the ground running from week one.",
    programme: "Employer Partner",
    date: "5 days ago",
  },
  {
    name: "Amelia Wright",
    initials: "AW",
    role: "Learner",
    rating: 4,
    text: "Really supportive tutors and well-structured modules. The project work was the highlight for me.",
    programme: "Marketing Executive L4",
    date: "1 week ago",
  },
  {
    name: "Daniel Hughes",
    initials: "DH",
    role: "Learner",
    rating: 5,
    text: "Best decision I made for my career. The project management frameworks finally clicked into place.",
    programme: "Associate PM L4",
    date: "1 week ago",
  },
  {
    name: "Sophie Bennett",
    initials: "SB",
    role: "Employer",
    rating: 4,
    text: "Communication with the provider is excellent. Our team always knows exactly where learners stand.",
    programme: "Employer Partner",
    date: "2 weeks ago",
  },
  {
    name: "Oliver Reed",
    initials: "OR",
    role: "Learner",
    rating: 4,
    text: "Great balance of theory and hands-on practice. The 1:1 feedback sessions are invaluable.",
    programme: "Marketing Manager L6",
    date: "2 weeks ago",
  },
  {
    name: "Emma Thompson",
    initials: "ET",
    role: "Learner",
    rating: 5,
    text: "The tutors genuinely care about your progress. I felt supported every single step of the way.",
    programme: "Marketing Executive L4",
    date: "3 weeks ago",
  },
  {
    name: "Liam Foster",
    initials: "LF",
    role: "Employer",
    rating: 5,
    text: "Outstanding learner outcomes. Three of our apprentices have already been promoted internally.",
    programme: "Employer Partner",
    date: "3 weeks ago",
  },
  {
    name: "Charlotte King",
    initials: "CK",
    role: "Learner",
    rating: 5,
    text: "The exam preparation sessions were a game changer. I passed with distinction thanks to them.",
    programme: "Marketing Manager L6",
    date: "4 weeks ago",
  },
  {
    name: "Harry Brooks",
    initials: "HB",
    role: "Learner",
    rating: 4,
    text: "Flexible learning that fits around my job. The online resources are top quality.",
    programme: "Marketing Executive L4",
    date: "4 weeks ago",
  },
  {
    name: "Isabella Clarke",
    initials: "IC",
    role: "Employer",
    rating: 5,
    text: "A reliable partner who genuinely understands our skills gaps and fills them well.",
    programme: "Employer Partner",
    date: "1 month ago",
  },
  {
    name: "George Walker",
    initials: "GW",
    role: "Learner",
    rating: 5,
    text: "From day one the support was incredible. I now run projects with real confidence.",
    programme: "Associate PM L4",
    date: "1 month ago",
  },
  {
    name: "Lucas Adams",
    initials: "LA",
    role: "Learner",
    rating: 4,
    text: "Really enjoyed the group sessions. Learning alongside peers kept me motivated throughout.",
    programme: "Marketing Executive L4",
    date: "1 month ago",
  },
  {
    name: "Zoe Harrison",
    initials: "ZH",
    role: "Employer",
    rating: 4,
    text: "Regular catch-ups and clear action plans. Our apprentices feel genuinely looked after.",
    programme: "Employer Partner",
    date: "6 weeks ago",
  },
  {
    name: "Nathan Evans",
    initials: "NE",
    role: "Learner",
    rating: 5,
    text: "My coach pushed me to think bigger. I landed my first marketing campaign within months.",
    programme: "Marketing Manager L6",
    date: "6 weeks ago",
  },
  {
    name: "Mia Cooper",
    initials: "MC",
    role: "Employer",
    rating: 5,
    text: "We've partnered with them for three years now. The consistency in quality is remarkable.",
    programme: "Employer Partner",
    date: "2 months ago",
  },
  {
    name: "William Hughes",
    initials: "WH",
    role: "Learner",
    rating: 4,
    text: "The virtual workshops are well run. Interactive, engaging, and genuinely useful tools.",
    programme: "Associate PM L4",
    date: "2 months ago",
  },
  {
    name: "Ella Scott",
    initials: "ES",
    role: "Learner",
    rating: 5,
    text: "I went from zero experience to leading a project team. The training is world class.",
    programme: "Associate PM L4",
    date: "2 months ago",
  },
  {
    name: "Henry Baker",
    initials: "HB",
    role: "Employer",
    rating: 4,
    text: "Good value and strong outcomes. Would recommend them to any SME looking for talent.",
    programme: "Employer Partner",
    date: "3 months ago",
  },
  {
    name: "Grace Edwards",
    initials: "GE",
    role: "Learner",
    rating: 5,
    text: "The portfolio feedback was detailed and honest. It genuinely helped me improve fast.",
    programme: "Marketing Manager L6",
    date: "3 months ago",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={`${
            i < rating ? "ri-star-fill text-accent-500/20" : "ri-star-line text-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: FloatingReview }) {
  return (
    <div className="floating-review w-[230px] shrink-0 rounded-xl bg-white/25 backdrop-blur-xl border border-white/30 p-3 transition-all duration-300 hover:scale-[1.02]">
      {/* Header: avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary-100/40 text-primary-700/20 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground-900/20 truncate">
            {review.name}
          </p>
          <p className="text-[11px] text-foreground-500/20 truncate">{review.role}</p>
        </div>
        <i className="ri-chat-smile-3-line text-foreground-300/20 text-sm ml-auto shrink-0" />
      </div>

      {/* Stars */}
      <div className="mt-2">
        <StarRow rating={review.rating} />
      </div>

      {/* Feedback text */}
      <p className="mt-1.5 text-xs leading-relaxed text-foreground-700/15 line-clamp-3">
        {review.text}
      </p>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-background-200/70 flex items-center justify-between">
        <span className="text-[10px] font-medium text-secondary-700/20 bg-secondary-100/30 px-1.5 py-0.5 rounded-full">
          {review.programme}
        </span>
        <span className="text-[10px] text-foreground-400/20 whitespace-nowrap">
          {review.date}
        </span>
      </div>
    </div>
  );
}

export default function FloatingReviewsBackground() {
  // Split into 10 columns and duplicate each column 5x so every column is
  // clearly taller than the viewport.
  const columns = useMemo(() => {
    const colCount = 10;
    const cols: FloatingReview[][] = Array.from({ length: colCount }, () => []);
    reviews.forEach((review, i) => {
      cols[i % colCount].push(review);
    });
    return cols.map((col) => {
      let result: FloatingReview[] = [];
      for (let i = 0; i < 5; i++) {
        result = result.concat(col);
      }
      return result;
    });
  }, []);

  const speeds = ["32s", "40s", "26s", "36s", "44s", "30s", "38s", "28s", "42s", "34s"];
  const directions = ["scroll-down", "scroll-up", "scroll-down", "scroll-up", "scroll-down", "scroll-up", "scroll-down", "scroll-up", "scroll-down", "scroll-up"];
  const hidden = [false, false, false, false, false, false, false, false, true, false];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-[5]">
      {/* Diagonal grid — tilted so reviews flow from one screen corner to the other */}
      <div className="absolute -inset-[25%] flex justify-center gap-[10px] px-0 pt-4 pb-4 -rotate-12">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`floating-col ${directions[idx]} ${
              hidden[idx] ? "hidden xl:flex" : "flex"
            } flex-col gap-[10px]`}
            style={{ animationDuration: speeds[idx] }}
          >
            {col.map((review, reviewIdx) => (
              <ReviewCard key={`${idx}-${reviewIdx}`} review={review} />
            ))}
          </div>
        ))}
      </div>

      {/* Fade top and bottom so reviews appear to emerge and fade out */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-16.666%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-16.666%); }
          100% { transform: translateY(0); }
        }
        .floating-col {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .scroll-up {
          animation-name: scroll-up;
        }
        .scroll-down {
          animation-name: scroll-down;
        }
        .floating-review {
          transition: opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
}