import FeedsPage from "../_components/FeedsPage";

export default function Feeds({ params }: { params: { slug?: string[] } }) {
    return <FeedsPage slug={params.slug} />;
}