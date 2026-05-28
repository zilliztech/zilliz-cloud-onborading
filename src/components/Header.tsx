import { NewZilliz } from "@/components/icon/Index";
import { Layout } from "@/components/Layout";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke-1 bg-white">
      <Layout>
        <div className="flex h-14 items-center">
          <a
            href="https://cloud.zilliz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <NewZilliz id="header-logo" theme="colorful" />
          </a>
        </div>
      </Layout>
    </header>
  );
}
