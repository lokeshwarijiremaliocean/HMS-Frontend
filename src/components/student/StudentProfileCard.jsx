import { MdPerson } from "react-icons/md";

function StudentProfileCard({ student }) {
  if (!student) return null;

  return (
    <div className="sm-profile-card">
      <div className="sm-profile-header">
        <div className="sm-profile-avatar">
          <MdPerson />
        </div>
        <div>
          <h3>
            {student.first_name} {student.last_name}
          </h3>
          <p className="sm-profile-sub">
            Roll No: {student.roll_no} | {student.degree} ({student.branch})
          </p>
        </div>
      </div>

      <div className="sm-profile-grid">
        <div className="sm-profile-item">
          <span className="label">Student ID:</span>
          <span className="value">#{student.id}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Roll Number:</span>
          <span className="value">{student.roll_no}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">First Name:</span>
          <span className="value">{student.first_name || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Last Name:</span>
          <span className="value">{student.last_name || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Gender:</span>
          <span className="value">{student.gender || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Phone:</span>
          <span className="value">{student.phone || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Email:</span>
          <span className="value">{student.email || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Parent Name:</span>
          <span className="value">{student.parent_name || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Parent Phone:</span>
          <span className="value">{student.parent_phone || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Degree:</span>
          <span className="value">{student.degree || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Branch:</span>
          <span className="value">{student.branch || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Academic Year:</span>
          <span className="value">Year {student.academic_year || "-"}</span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Floor / Room / Bed:</span>
          <span className="value">
            {Number(student.floor_no) > 0 ? `F${student.floor_no}` : "N/A"} /{" "}
            {Number(student.room_no) > 0 ? `R${student.room_no}` : "N/A"} /{" "}
            {Number(student.bed_no) > 0 ? `Bed ${student.bed_no}` : "N/A"}
          </span>
        </div>
        <div className="sm-profile-item">
          <span className="label">Blood Group:</span>
          <span className="value">{student.blood_group || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileCard;
