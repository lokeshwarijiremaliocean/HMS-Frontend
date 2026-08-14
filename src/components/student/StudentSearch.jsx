import { useState, useEffect } from "react";
import {
  MdBadge,
  MdSchool,
  MdPerson,
  MdPhone,
  MdSearch,
  MdInfo,
} from "react-icons/md";
import {
  getStudentByRollNo,
  getStudentByDegree,
  getStudentByName,
  getStudentByPhone,
} from "../../api/studentApi";
import StudentProfileCard from "./StudentProfileCard";
import StudentTable from "./StudentTable";
import { extractSingleStudent, extractStudentList, extractErrorMessage } from "./studentUtils";

function StudentSearch({
  showToast,
  onViewDetails,
  onEditStudent,
  onDeleteStudent,
}) {
  const [searchType, setSearchType] = useState("roll"); // "roll" | "degree" | "name" | "phone"

  // Search input queries
  const [rollQuery, setRollQuery] = useState("");
  const [degreeQuery, setDegreeQuery] = useState("");
  const [firstNameQuery, setFirstNameQuery] = useState("");
  const [lastNameQuery, setLastNameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");

  // Search results
  const [singleResult, setSingleResult] = useState(null);
  const [listResult, setListResult] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Clear state on sub-type change
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setSearchPerformed(false);
    setSingleResult(null);
    setListResult([]);
  };

  // 1. Search by Roll Number
  const handleSearchRoll = async () => {
    const q = rollQuery.trim();
    if (!q) {
      showToast("error", "Please enter a Roll Number");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSingleResult(null);
    try {
      const res = await getStudentByRollNo(q);
      const student = extractSingleStudent(res.data);
      setSingleResult(student);
    } catch (err) {
      setSingleResult(null);
      if (err.response?.status !== 404) {
        showToast("error", extractErrorMessage(err, "Failed to search student by roll number"));
      }
    } finally {
      setSearching(false);
    }
  };

  // 2. Search by Degree
  const handleSearchDegree = async () => {
    const q = degreeQuery.trim();
    if (!q) {
      showToast("error", "Please enter or select a Degree");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setListResult([]);
    try {
      const res = await getStudentByDegree(q);
      const list = extractStudentList(res.data);
      setListResult(list);
    } catch (err) {
      setListResult([]);
      if (err.response?.status !== 404) {
        showToast("error", extractErrorMessage(err, "Failed to search students by degree"));
      }
    } finally {
      setSearching(false);
    }
  };

  // 3. Search by Name
  const handleSearchName = async () => {
    const fn = firstNameQuery.trim();
    const ln = lastNameQuery.trim();
    if (!fn || !ln) {
      showToast("error", "Please enter both First Name and Last Name");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setListResult([]);
    try {
      const res = await getStudentByName(fn, ln);
      const list = extractStudentList(res.data);
      setListResult(list);
    } catch (err) {
      setListResult([]);
      if (err.response?.status !== 404) {
        showToast("error", extractErrorMessage(err, "Failed to search student by name"));
      }
    } finally {
      setSearching(false);
    }
  };

  // 4. Search by Phone
  const handleSearchPhone = async () => {
    const q = phoneQuery.trim();
    if (!q) {
      showToast("error", "Please enter a Phone Number");
      return;
    }
    setSearching(true);
    setSearchPerformed(true);
    setSingleResult(null);
    try {
      const res = await getStudentByPhone(q);
      const student = extractSingleStudent(res.data);
      setSingleResult(student);
    } catch (err) {
      setSingleResult(null);
      if (err.response?.status !== 404) {
        showToast("error", extractErrorMessage(err, "Failed to search student by phone"));
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="sm-card">
      {/* Sub Navigation Tabs */}
      <div className="sm-subnav">
        <button
          className={`sm-subnav-btn ${searchType === "roll" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("roll")}
        >
          <MdBadge /> By Roll Number
        </button>
        <button
          className={`sm-subnav-btn ${searchType === "degree" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("degree")}
        >
          <MdSchool /> By Degree
        </button>
        <button
          className={`sm-subnav-btn ${searchType === "name" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("name")}
        >
          <MdPerson /> By Name
        </button>
        <button
          className={`sm-subnav-btn ${searchType === "phone" ? "active" : ""}`}
          onClick={() => handleSearchTypeChange("phone")}
        >
          <MdPhone /> By Phone
        </button>
      </div>

      {/* ─── SEARCH BY ROLL NUMBER ─── */}
      {searchType === "roll" && (
        <div>
          <div className="sm-card-header">
            <div>
              <h2>Find Student by Roll Number</h2>
              <p>Search for a student record using their Roll Number</p>
            </div>
          </div>

          <div className="sm-search-bar-inline">
            <div className="sm-field flex-1">
              <label>
                Roll Number <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter roll number (e.g. 1001)"
                value={rollQuery}
                onChange={(e) => setRollQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchRoll()}
              />
            </div>
            <button
              className="sm-btn-primary search-btn-align"
              onClick={handleSearchRoll}
              disabled={searching}
            >
              {searching ? <span className="sm-spinner" /> : <MdSearch />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {searching ? (
            <div className="sm-loading">
              <span className="sm-spinner-lg" />
              <p>Searching student record...</p>
            </div>
          ) : searchPerformed ? (
            singleResult ? (
              <StudentProfileCard student={singleResult} />
            ) : (
              <div className="sm-empty">
                <MdInfo />
                <p>No student found with Roll Number "{rollQuery}"</p>
              </div>
            )
          ) : (
            <div className="sm-empty-initial">
              <MdBadge className="empty-icon" />
              <h3>Search by Roll Number</h3>
              <p>Enter a roll number above and click search.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── SEARCH BY DEGREE ─── */}
      {searchType === "degree" && (
        <div>
          <div className="sm-card-header">
            <div>
              <h2>Find Students by Degree</h2>
              <p>View all students belonging to a specific degree</p>
            </div>
          </div>

          <div className="sm-search-bar-inline">
            <div className="sm-field flex-1">
              <label>
                Degree <span className="required">*</span>
              </label>
              <input
                type="text"
                list="degree-options"
                placeholder="Select or enter degree (e.g. B.Tech)"
                value={degreeQuery}
                onChange={(e) => setDegreeQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchDegree()}
              />
              <datalist id="degree-options">
                <option value="B.Tech" />
                <option value="B.E." />
                <option value="M.Tech" />
                <option value="MBA" />
                <option value="MCA" />
                <option value="BCA" />
                <option value="B.Sc" />
                <option value="M.Sc" />
              </datalist>
            </div>
            <button
              className="sm-btn-primary search-btn-align"
              onClick={handleSearchDegree}
              disabled={searching}
            >
              {searching ? <span className="sm-spinner" /> : <MdSearch />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {searching ? (
            <div className="sm-loading">
              <span className="sm-spinner-lg" />
              <p>Fetching students by degree...</p>
            </div>
          ) : searchPerformed ? (
            listResult.length > 0 ? (
              <StudentTable
                dataList={listResult}
                showSearchHeader={false}
                onViewDetails={onViewDetails}
                onEditStudent={onEditStudent}
                onDeleteStudent={onDeleteStudent}
              />
            ) : (
              <div className="sm-empty">
                <MdInfo />
                <p>No students found for degree "{degreeQuery}"</p>
              </div>
            )
          ) : null}
        </div>
      )}

      {/* ─── SEARCH BY NAME ─── */}
      {searchType === "name" && (
        <div>
          <div className="sm-card-header">
            <div>
              <h2>Find Student by Name</h2>
              <p>Search for students using First Name and Last Name</p>
            </div>
          </div>

          <div className="sm-search-bar-inline">
            <div className="sm-field flex-1">
              <label>
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstNameQuery}
                onChange={(e) => setFirstNameQuery(e.target.value)}
              />
            </div>
            <div className="sm-field flex-1">
              <label>
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastNameQuery}
                onChange={(e) => setLastNameQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchName()}
              />
            </div>
            <button
              className="sm-btn-primary search-btn-align"
              onClick={handleSearchName}
              disabled={searching}
            >
              {searching ? <span className="sm-spinner" /> : <MdSearch />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {searching ? (
            <div className="sm-loading">
              <span className="sm-spinner-lg" />
              <p>Searching student record by name...</p>
            </div>
          ) : searchPerformed ? (
            listResult.length > 0 ? (
              <StudentTable
                dataList={listResult}
                showSearchHeader={false}
                onViewDetails={onViewDetails}
                onEditStudent={onEditStudent}
                onDeleteStudent={onDeleteStudent}
              />
            ) : (
              <div className="sm-empty">
                <MdInfo />
                <p>
                  No student found with name "{firstNameQuery} {lastNameQuery}"
                </p>
              </div>
            )
          ) : null}
        </div>
      )}

      {/* ─── SEARCH BY PHONE ─── */}
      {searchType === "phone" && (
        <div>
          <div className="sm-card-header">
            <div>
              <h2>Find Student by Phone Number</h2>
              <p>Search for a student record using their Phone Number</p>
            </div>
          </div>

          <div className="sm-search-bar-inline">
            <div className="sm-field flex-1">
              <label>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchPhone()}
              />
            </div>
            <button
              className="sm-btn-primary search-btn-align"
              onClick={handleSearchPhone}
              disabled={searching}
            >
              {searching ? <span className="sm-spinner" /> : <MdSearch />}
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {searching ? (
            <div className="sm-loading">
              <span className="sm-spinner-lg" />
              <p>Searching student record by phone...</p>
            </div>
          ) : searchPerformed ? (
            singleResult ? (
              <StudentProfileCard student={singleResult} />
            ) : (
              <div className="sm-empty">
                <MdInfo />
                <p>No student found with Phone Number "{phoneQuery}"</p>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}

export default StudentSearch;
