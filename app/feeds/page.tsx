import FeedsPage from "../_components/FeedsPage";
import { useSearchParams } from "next/navigation";

export default function Feeds({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    const feedType = searchParams.feedType as string | undefined;

  return <FeedsPage initialFeedType={feedType} />;
}