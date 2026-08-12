import {
  MdFormatListBulleted,
  MdAdd,
  MdSearch,
  MdEdit,
  MdDelete,
} from "react-icons/md";

function RoomTabs({ activeTab, setActiveTab }) {
  return (
    <div className="rm-action-tabs">
      <button
        className={`rm-tab-btn ${activeTab === "all" || activeTab === "view" ? "active" : ""}`}
        onClick={() => setActiveTab("all")}
      >
        <MdFormatListBulleted /> View Rooms
      </button>

      <button
        className={`rm-tab-btn ${activeTab === "add" ? "active" : ""}`}
        onClick={() => setActiveTab("add")}
      >
        <MdAdd /> Add Room
      </button>

      <button
        className={`rm-tab-btn ${activeTab === "get" || activeTab === "search" ? "active" : ""}`}
        onClick={() => setActiveTab("get")}
      >
        <MdSearch /> Search Room
      </button>

      <button
        className={`rm-tab-btn ${activeTab === "update" ? "active" : ""}`}
        onClick={() => setActiveTab("update")}
      >
        <MdEdit /> Update Room
      </button>

      <button
        className={`rm-tab-btn ${activeTab === "delete" ? "active" : ""}`}
        onClick={() => setActiveTab("delete")}
      >
        <MdDelete /> Delete Room
      </button>
    </div>
  );
}

export default RoomTabs;
