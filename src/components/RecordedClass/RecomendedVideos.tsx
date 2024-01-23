import Link from 'next/link';

export default function RecomendedVideos() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Recommended Videos</h3>
      <div className="relative flex items-start gap-4">
        <Link className="absolute inset-0" href="#">
          <span className="sr-only">View</span>
        </Link>
        <img
          alt="Thumbnail"
          className="aspect-video rounded-lg object-cover"
          height={94}
          src="/placeholder.svg"
          width={168}
        />
        <div className="text-sm">
          <div className="line-clamp-2 font-medium">
            Introducing v0: Generative UI
          </div>
          <div className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            Vercel
          </div>
          <div className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            300K views · 5 days ago
          </div>
        </div>
      </div>
      <div className="relative flex items-start gap-4">
        <Link className="absolute inset-0" href="#">
          <span className="sr-only">View</span>
        </Link>
        <img
          alt="Thumbnail"
          className="aspect-video rounded-lg object-cover"
          height={94}
          src="/placeholder.svg"
          width={168}
        />
        <div className="text-sm">
          <div className="line-clamp-2 font-medium">
            Introducing the frontend cloud
          </div>
          <div className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            Vercel
          </div>
          <div className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
            1.2M views · 2 months ago
          </div>
        </div>
      </div>
    </div>
  );
}
