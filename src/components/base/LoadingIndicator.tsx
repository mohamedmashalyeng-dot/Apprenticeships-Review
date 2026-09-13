export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-flex text-lg leading-none">
        <div className="flex gap-0.5 text-background-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className="ri-star-fill" />
          ))}
        </div>
        <div className="absolute inset-0 flex gap-0.5 text-primary-500 overflow-hidden animate-star-fill-sweep">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} className="ri-star-fill" />
          ))}
        </div>
      </div>
    </div>
  );
}
