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
        <aside className=" mt-14">
          <SideBarContent />
        </aside>
        <main className="">
          <FeedsPage initialFeedType={feedType} />
        </main>
        <aside className=" mt-14">
          <SideBar/>
        </aside>
      </div>
      <div className="md:hidden">
        <FeedsPage initialFeedType={feedType} />
      </div>
    </>
  );
}