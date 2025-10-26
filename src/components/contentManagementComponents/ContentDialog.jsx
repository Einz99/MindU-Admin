import {
  TextField, 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API, RootAPI } from "../../api";
import ReactPlayer from "react-player";
import { CloudUpload, FileUpload, Close } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import RichTextEditor, { DialogWrapper } from "./contentDialogComponents";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function ContentDialog({
  tab,
  open,
  newItem,
  setNewItem,
  setData,
  editMode,
  setEditMode,
  editId,
  setEditID,
  isVideo,
  onImageSelect,
  videoDialog,
  setIsVideo,
  setDialogOpen,
  setVideoDialog,
  isArticle,
  setIsArticle,
  isAdd,
  setIsAdd,
  setViewMode,
  viewMode,
  updateContent,
  setAlertMessage,
  setIsSuccessful,
  setOpenError,
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isRichText, setIsRichText] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [articleFile, setArticleFile] = useState(null);
  const shouldHandleSave = useRef(false);
  const [videoPath, setVideoPath] = useState("");
  const [blob, setBlob] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false); // 🆕 Confirmation dialog state
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditMode(false);
    setEditID(null);
    setIsArticle(false);
    setVideoDialog(false);
    setIsVideo(false);
    setPreview(null);
    setVideoPreview(null);
    setIsRichText(null);
    setBannerFile(null);
    setArticleFile(null);
    setNewItem({});
    setIsRichText(false);
    setShowSaveDialog(false);
  };

  // 🆕 Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (editMode || viewMode || tab === 2) return false; // 👈 Added tab === 2 check
    
    // Check if any field has content
    return (
      newItem.title?.trim() ||
      newItem.description?.trim() ||
      newItem.category?.trim() ||
      newItem.announcementContent?.trim() ||
      newItem.end_date ||
      bannerFile ||
      articleFile ||
      preview ||
      videoPreview ||
      blob
    );
  };

  // 🆕 Handle close attempt
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      setShowSaveDialog(true);
    } else {
      handleDialogClose();
    }
  };

  // 🆕 Handle save as draft from confirmation
  const handleSaveAsDraft = async () => {
    setShowSaveDialog(false);
    await handleSave(true);
  };

  // 🆕 Handle discard changes
  const handleDiscardChanges = () => {
    setShowSaveDialog(false);
    handleDialogClose();
  };

  useEffect(() => {
    if (shouldHandleSave.current && articleFile) {
        handleSave(isDraft);
        shouldHandleSave.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleFile, isDraft]);

  useEffect(() => {
    if (tab === 2) return;
    if ((editMode && editId) || (editId && isAdd === false)) {
      setPreview(`${RootAPI}${newItem.banner}`);

      if (newItem.filepath && isVideo === true) {
        setVideoPreview(`${RootAPI}${newItem.filepath}`);
        setVideoPath(
          newItem.filepath.split("/").pop().replace(/^[^-]+-/, "").trim()
        );
      }

      axios
        .get(`${RootAPI}${newItem.banner}`, { responseType: 'blob' })
        .then(response => {
          const blob = response.data;
          const fileName = newItem.banner.replace(/\/resources\/[\d-]+/, '');
          const file = new File([blob], fileName, { type: blob.type });
          setBannerFile(file);
        })
        .catch(error =>
          console.error("Error loading banner file:", error)
        );

      if (newItem.filepath && isVideo === false) {
        const loadFileContent = async () => {
          try {
            const response = await axios.get(`${RootAPI}${newItem.filepath}`, {
              responseType: 'text',
            });
            setEditorData(response.data);
            console.log("File content loaded:", response.data);
          } catch (error) {
            console.error("Error loading file:", error);
          }
        };

        loadFileContent();
      }
    }
  }, [editId, editMode, newItem.banner, newItem.filepath, newItem.title, isVideo, isAdd, tab]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    setNewItem((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleVideoUpload = (event) => {
    const selectedFile = event.target.files[0];
  
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      const videoURL = URL.createObjectURL(selectedFile);
      setDialogOpen(false);
      setArticleFile(selectedFile);
      setVideoPreview(videoURL);
      setVideoPath(selectedFile.name);
      setTimeout(() => {
        setDialogOpen(true);
      }, 100);
    } else {
      setAlertMessage("Please upload a valid video file.")
      setIsSuccessful(false)
      setOpenError(true)
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'video/*': []
    },
    onDrop: (acceptedFiles) => {
      const videoFile = acceptedFiles[0];
      if (!videoFile) return;
  
      const videoURL = URL.createObjectURL(videoFile);
      setArticleFile(videoFile);
      setVideoPreview(videoURL);
      setVideoDialog(false);
  
      setTimeout(() => {
        setDialogOpen(true);
      }, 100);
    },
  });

  const categoryOptions = {
    0: ["Emotional/Mental", "Social", "Financial/Occupation", "Physical", "Spiritual", "Intellectual", "Environmental"],
    1: ["Breathing Exercises", "Meditation Guide"],
    2: ["Important", "General", "Update", "Advisory"],
  }[tab] || [];

  function formatDateForMySQL(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  const handleSave = async (isDraft) => { 
    setLoading(true);
    try {
      let response;
      let requestBody;
      const staff = JSON.parse(localStorage.getItem("staff"));
      const isUpdating = editMode;
      const statusText = isDraft ? "Draft" : "Posted";
    
      if (tab === 2) {
        requestBody = {
          title: newItem.title || "",
          category: newItem.category || "",
          announcementContent: newItem.announcementContent || "",
          end_date: newItem.end_date || "",
          staff_name: staff.name || "",
          staff_position: staff.position || "",
        };
        response = isUpdating
          ? await axios.put(`${API}/announcements/${editId}`, requestBody, { headers: { "Content-Type": "application/json" } })
          : await axios.post(`${API}/announcements`, requestBody, { headers: { "Content-Type": "application/json" } });
      } else {
        const formData = new FormData();
        formData.append("title", newItem.title || "");
        formData.append("category", newItem.category || "");
        formData.append("isResource", tab === 0 ? 1 : 0);
        formData.append("description", newItem.description || "");
        formData.append("status", statusText);
        formData.append("posted_at", isDraft ? null : formatDateForMySQL(new Date()));
        formData.append("staff_name", staff?.name ?? "");
        formData.append("staff_position", staff?.position ?? "");
      
        if (tab === 0) {
          formData.append("resourceType", newItem.resourceType || "");
        }
      
        if (articleFile) formData.append("file", articleFile);
        if (bannerFile) formData.append("banner", bannerFile);
      
        const endpoint = `${API}/resources`;
        response = isUpdating
          ? await axios.put(`${endpoint}/${editId}`, formData)
          : await axios.post(endpoint, formData);
      }
    
      setData((prev) =>
        isUpdating ? prev.map((item) => (item.ID === editId ? response.data : item)) : [...prev, response.data]
      );
    
      let alertMessage = "";
      if (!isUpdating && isDraft) alertMessage = "Draft created successfully.";
      else if (!isUpdating && !isDraft) alertMessage = "Post created successfully.";
      else if (isUpdating && isDraft) alertMessage = "Draft updated successfully.";
      else if (isUpdating && !isDraft) alertMessage = "Post updated successfully.";
      
      setAlertMessage(alertMessage)
      setIsSuccessful(true)
      setOpenError(true)
    
      setTimeout(() => {
        handleDialogClose();
        updateContent();
      }, 2000);
    
    } catch (error) {
      console.error("Error saving data:", error.response ? error.response.data : error);
      setAlertMessage("Failed to save data.")
      setIsSuccessful(false)
      setOpenError(true)
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setBannerFile(file);
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [preview, videoPreview]);

  const saveToFile = async () => {
    if (!blob) {
      setAlertMessage("Failed to save data.");
      setIsSuccessful(false);
      setOpenError(true);
      return;
    };
    const file = new File([blob], `${newItem.title}.html`, { type: "text/html" });
    setArticleFile(file);
    shouldHandleSave.current = true;
  };

  useEffect(() => {
    if(editMode === false) {
      setNewItem({})
      setBannerFile(null);
      setPreview(null);
      setArticleFile(null)
    }
  }, [editMode, setNewItem])

  const isFormValid = () => {
    if (tab === 2) {
      return (
        newItem.title?.trim() &&
        newItem.category?.trim() &&
        newItem.announcementContent?.trim() &&
        newItem.end_date
      );
    }
    else if (isVideo) {
      return (
        newItem.title?.trim() &&
        newItem.description?.trim() &&
        newItem.category?.trim() &&
        bannerFile &&
        (videoPreview || videoPath)
      );
    }
    else {
      return (
        newItem.title?.trim() &&
        newItem.category?.trim() &&
        bannerFile
      );
    }
  };

  const handleDateChange = (e) => {
    setNewItem({
      ...newItem,
      [e.target.name]: e.target.value,
    });
  };
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
          borderRadius: "24px"
          }
        }}
      >
        <DialogTitle className="bg-[#b7cde3] relative">
          Unsaved Changes
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setShowSaveDialog(false)} className="rounded-full">
              <Close sx={{ fontSize: 40, color: 'black' }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
          <DialogContent className="text-center">
            <div className="font-roboto" style={{ fontSize: "1.2rem", padding: "10px" }}>
              <p><strong>Do you want to save this as draft?</strong></p>
              <p className="text-gray-500 text-sm mt-2">Your changes will be lost if you don't save them.</p>
            </div>
          </DialogContent>
          <DialogActions className="flex justify-between px-4 pb-4">
            <Button onClick={() => setShowSaveDialog(false)}>
              <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleDiscardChanges}>
                <p className="text-white text-lg rounded-3xl px-8 py-1 bg-red-500">Don't Save</p>
              </Button>
              <Button onClick={handleSaveAsDraft} disabled={loading}>
                <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                  {loading ? "Saving..." : "Save as Draft"}
                </p>
              </Button>
            </div>
          </DialogActions>
        </div>
      </Dialog>

      <DialogWrapper
        maxwidth={`${tab === 2 ? "sm" : "md"}`}
        open={isArticle || open}
        onClose={tab === 2 ? handleDialogClose : handleCloseAttempt}
        title={`${editMode ? "Edit " : isAdd === false ? "View ": "Add "} ${
          tab === 0 ? "Resource" : tab === 1 ? "Wellness" : "Announcement"
        }`}
        actionButtons={
        <>
        <Button onClick={tab === 2 ? handleDialogClose : handleCloseAttempt}>
          <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
        </Button>
          {isArticle ? (
            <Button
              onClick={() => {
                if (!isFormValid()) {
                  setAlertMessage("Missing Field.\nPlease make sure all fields is filled");
                  setIsSuccessful(false);
                  setOpenError(true);
                  return;
                }
                setIsRichText(true);
                setIsArticle(false);
                newItem.resourceType = "Document";
              }}
              disabled={loading}
            >
              <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                {loading ? "Loading..." : "Next"}
              </p>
            </Button>
          ) : viewMode === false &&
            (
            <>
              <Button
                onClick={() => {
                  if (!isFormValid()) {
                    setAlertMessage("Missing Field.\nPlease make sure all fields is filled");
                    setIsSuccessful(false);
                    setOpenError(true);
                    return;
                  };
                  handleSave(true);
                  }}
                  disabled={loading}
              > 
                <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                  {loading ? "Saving as Draft..." : "Save as Draft"}
                </p>
              </Button>
              <Button 
                onClick={() => {
                  if (!isFormValid()) {
                    setAlertMessage("Missing Field.\nPlease make sure all fields is filled");
                    setIsSuccessful(false);
                    setOpenError(true);
                    return;
                  };
                  handleSave(false);
                }}
                disabled={loading}
              > 
                <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                  {loading ? "Posting..." : "Post"}
                </p>
              </Button>
            </>
          ) 
        }
      </>
      }
      >
        <div className="w-full">
          {/* Title Field */}
          <div className="flex flex-row">
            <div className={`${isVideo === true ? 'w-[50%]' : 'w-full'}`}>
              <h1 className="text-3xl text-[#737373] font-normal">Title</h1>
              <TextField
                name="title"
                placeholder="Type here..."
                fullWidth
                variant="outlined"
                value={newItem.title || ""}
                onChange={handleInputChange}
                margin="dense"
                sx={{
                  borderWidth: "2px",
                  borderColor: "gray",
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderWidth: "2px",
                      borderColor: "gray",
                      borderRadius: "12px",
                    },
                    "&:hover fieldset": { borderColor: "darkgray" },
                    "&.Mui-focused fieldset": { borderColor: "black" },
                  },
                }}
              />

              {/* Conditionally show content for Announcement vs. Resource/Wellness */}
              {tab === 2 ? (
                <>
                  {/* Category Field for Announcements - Moved above content */}
                  <FormControl fullWidth margin="dense">
                    <h1 className="text-3xl text-[#737373] font-normal">Category</h1>
                    <h1 className="text-lg text-gray-400 mb-4">
                      Select a category that the post falls under
                    </h1>
                    <Select
                      name="category"
                      value={newItem.category || ""}
                      onChange={handleCategoryChange}
                      displayEmpty
                      sx={{
                        borderWidth: "2px",
                        borderColor: "gray",
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderWidth: "2px",
                            borderColor: "gray",
                            borderRadius: "12px",
                          },
                          "&:hover fieldset": { borderColor: "darkgray" },
                          "&.Mui-focused fieldset": { borderColor: "black" },
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <p className="text-gray-400">Select Category</p>
                      </MenuItem>
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <h1 className="text-3xl text-[#737373] font-normal">
                      Duration of Announcement
                    </h1>
                    <h1 className="text-lg text-gray-400">
                      Select the date when the announcement will expire
                    </h1>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={newItem.end_date ? new Date(newItem.end_date) : new Date(minDate)}
                        onChange={(newValue) => {
                          handleDateChange({
                            target: {
                              name: 'end_date',
                              value: newValue ? newValue.toISOString().split('T')[0] : ''
                            }
                          });
                        }}
                        minDate={new Date(minDate)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: "normal",
                            sx: {
                              borderWidth: "2px",
                              borderColor: "gray",
                              borderRadius: "12px",
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderWidth: "2px",
                                  borderColor: "gray",
                                  borderRadius: "12px",
                                },
                                "&:hover fieldset": { borderColor: "darkgray" },
                                "&.Mui-focused fieldset": { borderColor: "black" },
                              },
                            },
                          },
                          popper: {
                            placement: "bottom-end", // 👈 Calendar appears aligned to the right
                            modifiers: [
                              {
                                name: 'flip',
                                enabled: false,
                              },
                            ],
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                  <h1 className="text-3xl text-[#737373] font-normal">Content</h1>
                  <TextField
                    name="announcementContent"
                    placeholder="Type here..."
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={5}
                    value={newItem.announcementContent || ""}
                    onChange={handleInputChange}
                    margin="dense"
                    sx={{
                      borderWidth: "2px",
                      borderColor: "gray",
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderWidth: "2px",
                          borderColor: "gray",
                          borderRadius: "12px",
                        },
                        "&:hover fieldset": { borderColor: "darkgray" },
                        "&.Mui-focused fieldset": { borderColor: "black" },
                      },
                    }}
                  />
                </>
              ) : ((tab === 0 || tab === 1) && isVideo === true) && (
                <>
                  <h1 className="text-3xl text-[#737373] font-normal">Description</h1>
                  <TextField
                    name="description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Type here..."
                    value={newItem.description || ""}
                    onChange={handleInputChange}
                    margin="dense"
                    sx={{
                      borderWidth: "2px",
                      borderColor: "gray",
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderWidth: "2px",
                          borderColor: "gray",
                          borderRadius: "12px",
                        },
                        "&:hover fieldset": { borderColor: "darkgray" },
                        "&.Mui-focused fieldset": { borderColor: "black" },
                      },
                    }}
                  />
                </>
              )}
            </div>
            

            {/* If it's a video resource, include the video upload preview */}
            {isVideo && (
              <div className="w-[50%] h-[18.4rem] px-5">
                <div className="w-full h-[75%]">
                  <ReactPlayer url={videoPreview} controls width="100%" height="100%" />
                </div>
                <div
                  className="w-full h-[25%] bg-[#b7cde3] rounded-b-3xl px-4"
                  {...getRootProps()}
                >
                  <input
                    {...getInputProps()}
                    onChange={handleVideoUpload}
                    disabled={viewMode}
                    onClick={() => (newItem.resourceType = "Video")}
                  />
                  <h1 className="text-sm text-gray-500">File Name:</h1>
                  <p className="font-bold text-gray-800">{videoPath}</p>
                </div>
              </div>
            )}
          </div>
          
      
          {/* Render a flex container for banner/thumbnail and category */}
          <div className="flex flex-row mt-4">
            {tab !== 2 && (
              <div className="w-[50%] p-4 border-r-2">
                {/* For video, label it as Thumbnail; otherwise Banner */}
                <h1 className="text-3xl text-[#737373] font-normal">
                  {isVideo ? "Thumbnail" : "Banner"}
                </h1>
                <h1 className="text-lg text-gray-400">
                  Set an image that draws attention
                </h1>
                <Box
                  sx={{
                    width: "200px",
                    height: "100px",
                    border: "2px dashed gray",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: "#f9f9f9",
                    overflow: "hidden",
                  }}
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <>
                      <CloudUpload sx={{ fontSize: 40, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: 14, color: "#737373" }}>
                        Upload file here
                      </Typography>
                    </>
                  )}
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleBannerChange}
                    disabled={viewMode}
                  />
                </Box>
              </div>
            )}

            {/* Only show category section for non-announcement tabs since announcement's category is moved up */}
            {tab !== 2 && (
              <div className="w-[50%] p-4">
                <FormControl fullWidth margin="dense">
                  <h1 className="text-3xl text-[#737373] font-normal">Category</h1>
                  <h1 className="text-lg text-gray-400 mb-4">
                    Select a category that the post falls under
                  </h1>
                  <Select
                    name="category"
                    value={newItem.category || ""}
                    onChange={handleCategoryChange}
                    displayEmpty
                    sx={{
                      borderWidth: "2px",
                      borderColor: "gray",
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderWidth: "2px",
                          borderColor: "gray",
                          borderRadius: "12px",
                        },
                        "&:hover fieldset": { borderColor: "darkgray" },
                        "&.Mui-focused fieldset": { borderColor: "black" },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <p className="text-gray-400">Select Category</p>
                    </MenuItem>
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>
        </div>
      </DialogWrapper>
      <DialogWrapper
        open={isRichText}
        onClose={handleCloseAttempt}
        title={`${editMode ? "Edit " : viewMode ? "View ": "Add "} Content`}
        actionButtons={
          <>
            <Button onClick={() => {
              setIsRichText(false);
              setDialogOpen(true);
              setIsArticle(true);
              setBlob(null);
              setEditorData(null);
            }}>
              <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
            </Button>
            {!viewMode && (
              <>
                <Button onClick={() => {
                  if(!isFormValid()) {
                    setAlertMessage("Missing Field.\nPlease make sure all fields is filled");
                    setIsSuccessful(false);
                    setOpenError(true);
                    return;
                  };
                  setIsDraft(true);
                  saveToFile();
                  }} 
                  disabled={loading}
                > 
                  <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                    {loading ? "Saving as Draft..." : "Save as Draft"}
                  </p>
                </Button>
                <Button onClick={() => {
                  setIsDraft(false);
                  saveToFile();
                  }} 
                  disabled={loading}
                >
                  <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">
                    {loading ? "Posting..." : "Post"}
                  </p>
                </Button>
              </>
            )}
          </>
        }
      >
        <div>
          <RichTextEditor setBlob={setBlob} editorData={editorData} />
        </div>
      </DialogWrapper>
      <DialogWrapper
        open={videoDialog}
        onClose={() => setVideoDialog(false)}
        title="Upload Files"
        actionButtons={null} // You can add action buttons if needed
      >
        <div className="w-[97.5%] h-full bg-white rounded-3xl flex flex-col items-center justify-center mb-4">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center text-center w-full h-full cursor-pointer"
          >
            <input {...getInputProps()} onChange={handleVideoUpload} onClick={() => (newItem.resourceType = "Video")} />
            <div className="flex flex-col items-center gap-7">
              <FileUpload
                sx={{
                  bgcolor: "#b7cde3",
                  fontSize: "8rem",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "1rem",
                  width: "12rem",
                  height: "12rem",
                  marginTop: "2rem",
                }}
              />
              <h1>Drag and drop video files to upload</h1>
              <Button>Select Files</Button>
            </div>
          </div>
        </div>
      </DialogWrapper>
    </>
  );
}