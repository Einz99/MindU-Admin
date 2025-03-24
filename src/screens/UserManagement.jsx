import { useState, useEffect } from "react";
import axios from "axios";
import { Container, } from "@mui/material";
import Navbar from "../components/navigationsComponents/TopNavBarComponent";
import Sidebar from "../components/navigationsComponents/SidebarComponents";
import { API } from "../api";
import UserTabs from "../components/userManagementComponents/UserTabs";
import UserTable from "../components/userManagementComponents/UserTable";
import UserDialog from "../components/userManagementComponents/UserDialog";

export default function DashboardLayout() {
  // UI states
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Students, 1 = Guidance Staffs
  const [checked, setChecked] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Data states (fetched from API)
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);

  // Form states
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    section: "",
    adviser: "",
    email: "",
    password: "",
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    position: "",
    email: "",
    password: "",
  });

  // Fetch data when component mounts or when tab changes
  useEffect(() => {
    if (tab === 0 && students.length === 0) {
      axios.get(`${API}/students`).then((res) => setStudents(res.data));
    } else if (tab === 1 && staffs.length === 0) {
      axios.get(`${API}/staffs`).then((res) => setStaffs(res.data));
    }
  }, [staffs.length, students.length, tab]);
  

  // Drawer toggle
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Checkbox handlers
  const handleCheckAll = (event) => {
    const isChecked = event.target.checked;
    setAllChecked(isChecked);
    if (isChecked) {
      const allIds =
        tab === 0 ? students.map((_, index) => index) : staffs.map((_, index) => index);
      setChecked(allIds);
    } else {
      setChecked([]);
    }
  };

  const handleCheck = (event, id) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setChecked((prev) => [...prev, id]);
    } else {
      setChecked((prev) => prev.filter((item) => item !== id));
    }
  };

  // Open modal for adding a record
  const handleAddButtonClick = () => {
    setIsEditMode(false);
    if (tab === 0) {
      setNewStudent({
        firstName: "",
        lastName: "",
        section: "",
        adviser: "",
        email: "",
        password: "",
      });
    } else {
      setNewStaff({
        name: "",
        position: "",
        email: "",
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for editing a record (pre-fill the form)
  const handleEditButtonClick = (index) => {
    setIsEditMode(true);
    setEditIndex(index);
    if (tab === 0) {
      const selectedStudent = students[index];
      setNewStudent({
        id: selectedStudent.id, // Ensure ID is included
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        section: selectedStudent.section,
        adviser: selectedStudent.adviser,
        username: selectedStudent.username,
        password: "", // Keep password blank unless changing it
      });
    } else {
      const selectedStaff = staffs[index];
      setNewStaff({
        id: selectedStaff.id, // Ensure ID is included
        name: selectedStaff.name,
        position: selectedStaff.position,
        email: selectedStaff.email,
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  // Delete a record
  const handleDeleteButtonClick = (index) => {
    const id = tab === 0 ? students[index].id : staffs[index].id; // Ensure lowercase "id"
    axios.delete(`${API}/${tab === 0 ? "students" : "staffs"}/${id}`)
      .then(() => {
        tab === 0
          ? setStudents((prev) => prev.filter((_, i) => i !== index))
          : setStaffs((prev) => prev.filter((_, i) => i !== index));
      })
      .catch((err) => console.error(`Error deleting ${tab === 0 ? "student" : "staff"}`, err));
 };
 

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (tab === 0) {
      setNewStudent((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewStaff((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form for add or update
  const handleFormSubmit = () => {
    if (tab === 0) {
      if (isEditMode) {
        axios
          .put(`${API}/students/${newStudent.id}`, newStudent)
          .then(() => {
            setStudents((prev) =>
              prev.map((student) =>
                student.id === newStudent.id ? { ...student, ...newStudent } : student
              )
            );
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error updating student:", err));
      } else {
        axios
          .post(`${API}/students`, newStudent)
          .then((res) => {
            setStudents((prev) => [...prev, res.data.student]);
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error adding student:", err));
      }
    } else {
      if (isEditMode) {
        axios
          .put(`${API}/staffs/${newStaff.id}`, newStaff)
          .then(() => {
            setStaffs((prev) =>
              prev.map((staff, index) =>
                index === editIndex ? { ...staff, ...newStaff } : staff
              )
            );
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error updating staff:", err));
      } else {
        axios
          .post(`${API}/staffs`, newStaff)
          .then((res) => {
            setStaffs((prev) => [...prev, res.data.staff]);
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error adding staff:", err));
      }
    }
  };

  const handleBulkDelete = () => {
    if (checked.length === 0) return;
  
    const idsToDelete = checked.map((index) =>
      tab === 0 ? students[index].id : staffs[index].id
    );
  
    const deleteRequests = idsToDelete.map((id) =>
      axios.delete(`${API}/${tab === 0 ? "students" : "staffs"}/${id}`)
    );
  
    Promise.all(deleteRequests)
      .then(() => {
        if (tab === 0) {
          setStudents((prev) => prev.filter((student) => !idsToDelete.includes(student.id)));
        } else {
          setStaffs((prev) => prev.filter((staff) => !idsToDelete.includes(staff.id)));
        }
        setChecked([]);
      })
      .catch((err) => console.error("Error during bulk delete:", err));
  };  

  const handleBulkUpload = async (spreadsheetData) => {
    try {
      if (!Array.isArray(spreadsheetData) || spreadsheetData.length === 0) {
        alert("No data to upload.");
        return;
      }
  
      // Convert spreadsheet data into JSON format
      const formattedStudents = spreadsheetData.map(row => ({
        firstName: row[0]?.trim() || "", 
        lastName: row[1]?.trim() || "",  
        section: row[2]?.trim() || "",   
        adviser: row[3]?.trim() || "",   
        email: row[4]?.trim() || ""      
      })).filter(student => student.email); // Ensure email is present
  
      if (formattedStudents.length === 0) {
        alert("No valid students to upload.");
        return;
      }
  
      const response = await fetch(`${API}/students/bulk-insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: formattedStudents }),
      });
  
      const result = await response.json();
      
      if (response.ok) {
        alert(`${result.insertedCount} students uploaded successfully. ${result.skipped ? result.skipped : ""}`);
        
        // ✅ Fetch updated data after bulk upload
        const updatedStudents = await axios.get(`${API}/students`);
        setStudents(updatedStudents.data); // Refresh student list
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      alert("Server error occurred. Try again later.");
    }
  };
  
  return (
    <div className="flex h-screen">
      <Navbar onMenuClick={handleDrawerToggle}/>
      <Sidebar open={open} onToggle={handleDrawerToggle}/>

      {/* Main Content */}
      <div className={`flex-grow p-4 bg-gray-200 transition-all ${open ? 'ml-60' : 'ml-16'}  mt-16`}>
        <Container className="container mx-auto">
        <h1 className="text-lg font-bold py-5">USER MANAGEMENT</h1>
          <div className="bg-white shadow-md rounded-lg p-4">
              <UserTabs 
                tab={tab} 
                setTab={setTab} 
                handleAddButtonClick={handleAddButtonClick}
                handleBulkDelete={handleBulkDelete}
                handleBulkUpload={handleBulkUpload} // Pass bulk upload handler
                checked={checked} 
              />
              <UserTable
                tab={tab}
                students={students}
                staffs={staffs}
                allChecked={allChecked}
                checked={checked}
                handleCheckAll={handleCheckAll}
                handleCheck={handleCheck}
                handleEditButtonClick={handleEditButtonClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
              />
          </div>
        </Container>
      </div>
      <UserDialog
        isModalOpen={isModalOpen}
        handleModalClose={handleModalClose}
        isEditMode={isEditMode}
        tab={tab}
        newStudent={newStudent}
        newStaff={newStaff}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
}
