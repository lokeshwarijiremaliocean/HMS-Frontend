import {
  MdFormatListBulleted,
  MdAdd,
  MdSearch,
  MdEdit,
  MdDeleteOutline,
} from "react-icons/md";

function BedTabs({ activeTab = "all", setActiveTab }) {
  const tabs = [
    { id: "all", label: "All Beds", icon: <MdFormatListBulleted /> },
    { id: "add", label: "+ Add Bed", icon: <MdAdd /> },
    { id: "get", label: "Get Bed by ID", icon: <MdSearch /> },
    { id: "update", label: "Update Bed", icon: <MdEdit /> },
    { id: "delete", label: "Delete Bed", icon: <MdDeleteOutline /> },
  ];

  return (
    <nav className="bm-action-tabs" aria-label="Bed Management Tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bm-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BedTabs;
