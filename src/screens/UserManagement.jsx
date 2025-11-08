import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import Layout from "../components/Layout";
import { API } from "../api";
import UserTabs from "../components/userManagementComponents/UserTabs";
import UserTable from "../components/userManagementComponents/UserTable";
import UserDialog from "../components/userManagementComponents/UserDialog";
import { data } from "react-router-dom";
import { OpenContext } from '../contexts/OpenContext';
import { Close } from "@mui/icons-material";

export default function DashboardLayout() {
  // UI states
  const { open, setOpen } = useContext(OpenContext);
  const [tab, setTab] = useState(0); // 0 = Students, 1 = Guidance Staffs
  const [checked, setChecked] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state
  // Data states (fetched from API)
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [OpenBulkDelete, setOpenBulkDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
    position: "", // Default position
    email: "",
    password: "",
    section: "",
    status: "Active" // Add default status here
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch data when component mounts or when tab changes
  useEffect(() => {
    if (students.length === 0) {
      axios.get(`${API}/students`)
        .then((res) => setStudents(res.data))
        .catch((err) => console.error("Error fetching students:", err));
    }
  
    if (staffs.length === 0) {
      axios.get(`${API}/staffs`)
        .then((res) => setStaffs(res.data))
        .catch((err) => console.error("Error fetching staffs:", err));
    }
  }, [staffs.length, students.length, tab, reloadKey]);

  useEffect(() => {
    const fetchPeople = () => {
      if (students.length === 0) {
        axios.get(`${API}/students`).then((res) => setStudents(res.data));
      } else if (staffs.length === 0) {
        axios.get(`${API}/staffs`).then((res) => setStaffs(res.data));
      }
    };
  
    fetchPeople(); // initial fetch
  
    const interval = setInterval(() => {
      fetchPeople(); // refresh every 60s
    }, 60000); // 60,000 ms = 60 seconds
  
    return () => clearInterval(interval); // clean up on unmount
  }, [students.length, staffs.length, tab, reloadKey]);
  
  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.adviser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaffs = staffs.filter((staff) => (
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Drawer toggle
  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
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
    setIsViewMode(false);
    setEditIndex(-1);
    
    if (tab === 0) {
      setNewStudent({
        firstName: "",
        lastName: "",
        section: "",
        adviser: "",
        email: "",
        password: ""
      });
    } else if (tab === 1) {
      setNewStaff({
        name: "",
        position: "Adviser", // Default position
        status: "Active", // Set default status explicitly
        email: "",
        password: ""
      });
    } else {
      setNewStaff({
        name: "",
        position: "Guidance Staff", // Default position
        status: "Active", // Set default status explicitly
        email: "",
        password: ""
      });
    }
    
    setIsModalOpen(true);
  };

  // Open modal for editing a record (pre-fill the form)
  const handleEditButtonClick = (id, edit) => {
    setIsEditMode(edit);
    setIsViewMode(!edit);
    setIsModalOpen(true);
  
    if (tab === 0) {
      const selectedStudent = students.find((student) => student.id === id);
      if (!selectedStudent) return;
  
      setNewStudent({
        id: selectedStudent.id,
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        section: selectedStudent.section,
        adviser: selectedStudent.adviser,
        email: selectedStudent.email,
        password: "", // Blank unless editing password
      });
    } else {
      const selectedStaff = staffs.find((staff) => staff.id === id);
      if (!selectedStaff) return;
  
      setNewStaff({
        id: selectedStaff.id,
        name: selectedStaff.name,
        position: selectedStaff.position,
        section: selectedStaff.section,
        email: selectedStaff.email,
        password: "",
      });
    }
  };

  // Delete a record
  const handleDeleteButtonClick = (item) => {
    setLoading(true);
    const id = item.id;
    const staff = JSON.parse(localStorage.getItem("staff"));
    axios.delete(`${API}/${tab === 0 ? "students" : "staffs"}/${id}`, {
      params: {
        staffName: staff.name,
        staffPosition: staff.position,
      }
    })
    .then(() => {
      if (tab === 0) {
        setStudents((prev) => prev.filter((student) => student.id !== id));
      } else {
        setStaffs((prev) => prev.filter((staff) => staff.id !== id));
      }
      setLoading(false);
      setAlertMessage(`Successfully Deleted ${tab === 0 ? "Student" : tab === 1 ? "Adviser" : "Guidance Staff"}`);
      setIsSuccessful(false);
      setOpenError(true);
    })
    .catch((err) => console.error(`Error deleting ${tab === 0 ? "student" : "staff"}`, err));
    setChecked([])
    setOpenBulkDelete(false);
    setReloadKey(prev => prev + 1);
  };
 

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setIsViewMode(false);
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
    setLoading(true);
    if (tab === 0) {
      const staff = JSON.parse(localStorage.getItem("staff"));
      // For students
      const studentData = { 
        ...newStudent,
        adding_name : staff.name,
        adding_position : staff.position,
       };
      if (!studentData.password) {
        delete studentData.password;  // Don't send password if not changing it
      }
      const matchingAdviser = staffs.find(
        (staff) => staff.position === "Adviser" && staff.section === newStudent.section
      );
    
      if (matchingAdviser) {
        studentData.adviser = matchingAdviser.name;
      } else {
        console.warn("No matching adviser found for section:", newStudent.section);
        studentData.adviser = ""; // Or handle it differently if required
      }

      if (isEditMode) {
        axios
          .put(`${API}/students/${newStudent.id}`, studentData)
          .then(() => {
            setStudents((prev) =>
              prev.map((student) =>
                student.id === newStudent.id ? { ...student, ...newStudent, adviser: studentData.adviser } : student
              )
            );
            setIsModalOpen(false);
            setLoading(false);
            setAlertMessage("Successfully updated student data");
            setIsSuccessful(true);
            setOpenError(true);
          })
          .catch((err) => console.error("Error updating student:", err));
      } else {
        axios
          .post(`${API}/students`, studentData)
          .then((res) => {
            setStudents((prev) => [...prev, res.data.student]);
            setIsModalOpen(false);
            setLoading(false);
            setChecked([]);
            setAlertMessage("Successfully added student data");
            setIsSuccessful(true);
            setOpenError(true);
          })
          .catch((err) => console.error("Error adding student:", err));
      }
    } else {
      // For staff
      const staff = JSON.parse(localStorage.getItem("staff"));
      const staffData = { 
        ...newStaff,
        adding_name: staff?.name || "",
        adding_position: staff?.position || ""
      };
      if (!staffData.password) {
        delete staffData.password;  // Don't send password if not changing it
      }
  
      if (isEditMode) {
        console.log(newStaff.id)
        axios
          .put(`${API}/staffs/${newStaff.id}`, staffData)
          .then(() => {
            setStaffs((prev) =>
              prev.map((staff) =>
                staff.id === newStaff.id ? { ...staff, ...newStaff } : staff
              )
            );
            setIsModalOpen(false);
            setChecked([]);
            setLoading(false);
            setAlertMessage(`Successfully updated ${tab === 1 ? "adviser" : "guidance staff"}`);
            setIsSuccessful(true);
            setOpenError(true);
          })
          .catch((err) => console.error("Error updating staff:", err));
      } else {
        axios
          .post(`${API}/staffs`, staffData)
          .then((res) => {
            setStaffs((prev) => [...prev, res.data.staff]);
            setIsModalOpen(false);
            setLoading(false);
            setAlertMessage(`Successfully added ${tab === 1 ? "adviser" : "guidance staff"}`);
            setIsSuccessful(true);
            setOpenError(true);
          })
          .catch((err) => console.error("Error adding staff:", err));
      }
    }
    setReloadKey(prev => prev + 1);
  };

  const handleBulkDelete = () => {
    if (checked.length === 0) return;
    setLoading(true);
    const idsToDelete = checked.map((index) =>
      tab === 0 ? students[index].id : staffs[index].id
    );

    const staff = JSON.parse(localStorage.getItem("staff"));
  
    const deleteRequests = idsToDelete.map((id) =>
      axios.delete(`${API}/${tab === 0 ? "students" : "staffs"}/${id}`, {
        params: {
          staffName: staff.name,
          staffPosition: staff.position,
        }
      })
    );
  
    Promise.all(deleteRequests)
      .then(() => {
        if (tab === 0) {
          setStudents((prev) => prev.filter((student) => !idsToDelete.includes(student.id)));
        } else {
          setStaffs((prev) => prev.filter((staff) => !idsToDelete.includes(staff.id)));
        }
        setChecked([]);
        setOpenBulkDelete(false);
        setAlertMessage(`Successfully Deleted ${tab === 0 ? "Students" : tab === 1 ? "Advisers" : "Guidance Staffs"}`);
        setIsSuccessful(true);
        setOpenError(true);
      })
      .finally(() => (
        setIsModalOpen(false)
      ))
      .catch((err) => console.error("Error during bulk delete:", err));
    setReloadKey(prev => prev + 1);
    
  };  

  const handleBulkUpload = async (spreadsheetData, columnHeaders) => {
    try {
      if (!Array.isArray(spreadsheetData) || spreadsheetData.length === 0) {
        setAlertMessage('There is no data to be uploaded.');
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      setLoading(true);
      const dataToUpload = spreadsheetData.slice(1); // Skip guide row
    
      const keyMap = tab === 0 ? {
        "Email": "email",
        "First Name": "firstName",
        "Last Name": "lastName",
        "Section": "section",
      } : {
        "Email": "email",
        "Name": "name",
        "Section": "section",
      };
    
      const formattedData = dataToUpload.map(row => {
        const entry = {};
        columnHeaders.forEach((header, i) => {
          const key = keyMap[header];
          if (key) {
            entry[key] = row[i]?.trim() || "";
          }
        });
        return entry;
      }).filter(entry => entry.email);
    
      if (formattedData.length === 0) {
        setAlertMessage('There is no data to be uploaded.');
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
    
      const endpoint = tab === 0 ? "/students/bulk-insert" : "/staffs/bulk-insert";
    
      const response = await axios.post(`${API}${endpoint}`, {
        [tab === 0 ? "students" : "staffs"]: formattedData
      }, {
        headers: { "Content-Type": "application/json" }
      });
    
      const result = response.data;
    
      if (response.status === 200) {
        setAlertMessage(`${tab === 0 ? "Students" : "Advisers"} uploaded successfully. ${result.skipped || ""}`);
        setIsSuccessful(true);
        setOpenError(true);
        setAlertMessage(`Successfully Added ${tab === 0 ? "Students" : tab === 1 ? "Advisers" : "Guidance Staffs"}`);
        setIsSuccessful(true);
        setOpenError(true);
        setLoading(false);
        setReloadKey(prev => prev + 1);
        if (tab === 0) {
          const updatedStudents = await axios.get(`${API}/students`);
          setStudents(updatedStudents.data);
          setLoading(false);
          setReloadKey(prev => prev + 1);
        } else {
          const updatedStaff = await axios.get(`${API}/staffs`);
          setStaffs(updatedStaff.data);
          setLoading(false);
          setReloadKey(prev => prev + 1);
        }
      
        setLoading(false);
        setReloadKey(prev => prev + 1);
      } else {
        setAlertMessage(`Error: ${result.message}`);
        setIsSuccessful(false);
        setOpenError(true);
        setLoading(false);
        setReloadKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Bulk upload failed:", error.response?.data || error.message);
      setAlertMessage("Server error occurred. Try again later.");
      setIsSuccessful(false);
      setOpenError(true);
      setLoading(false);
      setReloadKey(prev => prev + 1);
    }
  };

  // Handler to update search term from the search field in UserTabs
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (openError) return;
    
    const timer = setTimeout(() => {
      setAlertMessage('');
      setIsSuccessful(false);
    }, 1000); // 1 second
  
    return () => clearTimeout(timer);
  }, [openError]);

  useEffect(() => {
    setSearchTerm('')
  }, [tab]);
  
  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#f8fafc] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-20`}
        style={{ height: "calc(100vh - 80px)"}}
      >
        <div 
          className="flex flex-col flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
        <h1
          className="text-[clamp(2rem,3vw,3.5rem)] font-roboto font-bold tracking-[1rem] text-[#1e3a8a] text-center"
          style={{
            textShadow: "4px 4px 0px rgba(0,0,0,0.5)"
          }}
        >
          USER MANAGEMENT
        </h1>
          <div
            className="bg-[#b7cde3] w-full p-4 flex flex-col"
            style={{height: '90%'}}
          >
            <div 
              className="bg-[#f8fbfd] p-4 overflow-y-auto"
            >
              <UserTabs 
                tab={tab} 
                setTab={setTab} 
                handleAddButtonClick={handleAddButtonClick}
                setOpenBulkDelete={setOpenBulkDelete}
                handleBulkUpload={handleBulkUpload} // Pass bulk upload handler
                checked={checked} 
                handleSearchChange={handleSearchChange}
                bulkUploadOpen={bulkUploadOpen}
                setBulkUploadOpen={setBulkUploadOpen}
                staff={JSON.parse(localStorage.getItem("staff"))}
                setOpenError={setOpenError}
                setAlertMessage={setAlertMessage}
                setIsSuccessful={setIsSuccessful}
                searchTerm={searchTerm}
              />
              <UserTable
                tab={tab}
                // Pass filtered data instead of full arrays
                students={filteredStudents}
                staffs={filteredStaffs}
                allChecked={allChecked}
                checked={checked}
                handleCheckAll={handleCheckAll}
                handleCheck={handleCheck}
                handleEditButtonClick={handleEditButtonClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
                setSelectedStudent={setSelectedStudent}
                setOpenDeleteModal={setOpenDeleteModal}
              />
            </div>
          </div>
        </div>
      </main>
      <UserDialog
        isModalOpen={isModalOpen}
        handleModalClose={handleModalClose}
        isEditMode={isEditMode}
        tab={tab}
        newStudent={newStudent}
        students={students}
        newStaff={newStaff}
        staffs={staffs}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        bulkUploadOpen={bulkUploadOpen}
        setBulkUploadOpen={setBulkUploadOpen}
        data={data}
        checked={checked}
        handleBulkUpload={handleBulkUpload}
        handleBulkDelete={handleBulkDelete}
        OpenBulkDelete={OpenBulkDelete}
        setOpenBulkDelete={setOpenBulkDelete}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        openDeleteModal={openDeleteModal}
        setOpenDeleteModal={setOpenDeleteModal}
        handleDeleteButtonClick={handleDeleteButtonClick}
        isViewMode={isViewMode}
        setIsViewMode={setIsViewMode}
        loading={loading}
      />


      <Dialog
        open={openError}
        onClose={() => {setOpenError(false);}}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
        maxWidth="xs"
      >
        <DialogTitle className={`${isSuccessful ? "bg-[#b7e3cc]" : "bg-[#e3b7b7]"} relative`}>
          <p className="font-bold">{isSuccessful ? "Successful" : "Error"}</p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenError(false);}} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        
        <DialogContent className="text-center text-base py-6 px-10 mt-2">
          <p className="font-roboto font-medium text-xl">{alertMessage}</p>
        </DialogContent>
        <DialogActions>
          <button onClick={() => {setOpenError(false);}}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">OK</p>
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
