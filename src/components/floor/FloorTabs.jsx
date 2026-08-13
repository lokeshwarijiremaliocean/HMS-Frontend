import {
  MdFormatListBulleted,
  MdSearch,
  MdAdd,
} from "react-icons/md";

function FloorTabs({ activeTab, setActiveTab }) {
  return (
    <div className="fm-action-tabs">
      <button
        type="button"
        className={`fm-tab-btn ${activeTab === "view" || activeTab === "all" ? "active" : ""}`}
        onClick={() => setActiveTab("view")}
      >
        <MdFormatListBulleted />
        <span>View Floors</span>
      </button>

      <button
        type="button"
        className={`fm-tab-btn ${activeTab === "search" ? "active" : ""}`}
        onClick={() => setActiveTab("search")}
      >
        <MdSearch />
        <span>Search Floors</span>
      </button>

      <button
        type="button"
        className={`fm-tab-btn ${activeTab === "add" ? "active" : ""}`}
        onClick={() => setActiveTab("add")}
      >
        <MdAdd />
        <span>Add Floor</span>
      </button>
    </div>
  );
}

export default FloorTabs;
