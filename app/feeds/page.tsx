import FeedsPage from "../_components/FeedsPage";
import SideBarContent from "../_components/SidebarContents";
import SideBar from "../_components/Sidebar2";


export default function Feeds({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    const feedType = searchParams.feedType as string | undefined;

  return (
    <>
      <div className="grid-style hidden md:grid lg:grid-style2 2xl:grid-style3 xl:grid-style4">
        <aside className=" mt-14 hidden md:block">
          <SideBarContent />
        </aside>
        <main className="hidden md:block">
          <FeedsPage initialFeedType={feedType} />
        </main>
        <aside className=" mt-14 hidden lg:block">
          <SideBar/>
        </aside>
      </div>
      <div className="md:hidden">
        <FeedsPage initialFeedType={feedType} />
      </div>
    </>
  );
}