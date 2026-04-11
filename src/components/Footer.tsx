import Link from 'next/link';
import siteConfig from '@/config/site.json';

interface FooterProps {
  variant?: 'grid' | 'article';
}

export default function Footer({ variant = 'grid' }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-green-400 mt-auto">
      <div className="container mx-auto px-0">
        <div className="border-l-2 border-r-2 border-green-400 mx-4">
          <div className="px-6 py-4 flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-mono">
              © {year} {siteConfig.name}
            </span>
            <div className="flex gap-4 items-center">
              <Link
                href="/posts/privacy-policy"
                className="text-xs font-mono hover:underline"
              >
                PRIVACY POLICY
              </Link>
              <span className="text-xs font-mono">|</span>
              <span className="text-xs font-mono">
                {variant === 'grid' ? 'ARTICLE LIST VIEW' : 'ARTICLE VIEW'}
              </span>
              <span className="text-xs font-mono">|</span>
              <span className="text-xs font-mono">V1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
