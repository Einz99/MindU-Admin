import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../api";
import ReactPlayer from "react-player";
import { CloudUpload, FileUpload } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { FormatBold, FormatItalic, FormatUnderlined, FormatColorFill, SuperscriptOutlined, SubscriptOutlined, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify, InsertLink, Image as ImageIcon, FormatListBulleted, FormatListNumbered, FormatIndentIncrease, FormatIndentDecrease } from "@mui/icons-material";

export default function ContentDialog({
  tab,
  open,
  handleClose,
  newItem,
  setNewItem,
  file,
  setFile,
  setData,
  editMode,
  setEditMode,
  editId,
  isVideo,
  onImageSelect,
  videoDialog,
  setDialogOpen,
  isArticle,
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isRichText, setIsRichText] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [fontSize, setFontSize] = useState("16px");
  // Initialize the editor when the component mounts or isRichText changes
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Highlight,
      TextStyle,
      Color,
      ListItem,
      BulletList,
      OrderedList,
      Superscript,
      Subscript,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Restrict selection to images only
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const saveToFile = () => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

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
      setFile(selectedFile);
      setVideoPreview(videoURL);

      handleClose();  // Close the upload dialog
      setTimeout(() => {
        setDialogOpen(true); // Open the main dialog with video preview
      }, 100);
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    onDrop: (acceptedFiles) => {
      const videoFile = acceptedFiles[0];
      if (!videoFile) return;
      
      const videoURL = URL.createObjectURL(videoFile);
      setFile(videoFile);
      setVideoPreview(videoURL);
  
      handleClose();  // Close the upload dialog
      setTimeout(() => {
        setDialogOpen(true); // Open the main dialog with video preview
      }, 100); // Small delay to ensure state updates properly
    },
  });

  const categoryOptions = {
    0: ["Emotional/Mental", "Social", "Financial/Occupation", "Physical", "Spiritual", "Intellectual", "Environmental"],
    1: ["Breathing Exercises", "Meditation Guide"],
    2: ["Important", "General", "Update", "Advisory"],
  }[tab] || [];

  const handleSave = async () => {
    setLoading(true);
    try {
      let response;
      if (tab === 2) {
        // Announcement saving remains unchanged
        const requestBody = {
          title: newItem.title || "",
          category: newItem.category || "",
          announcementContent: newItem.content || "",
        };
        response = editMode
          ? await axios.put(`${API}/announcements/${editId}`, requestBody, { headers: { "Content-Type": "application/json" } })
          : await axios.post(`${API}/announcements`, requestBody, { headers: { "Content-Type": "application/json" } });
      } else {
        const formData = new FormData();
        formData.append("title", newItem.title || "");
        formData.append("category", newItem.category || "");
        formData.append("isResource", tab === 0 ? 1 : 0);
        
        // Append the description field.
        formData.append("description", newItem.description || "");
        
        // Append article content if available, so backend can merge it with description.
        if (newItem.article) {
          formData.append("article", newItem.article);
        }
        
        // Append file path if available.
        formData.append("filepath", newItem.filePath || "");
        
        // Send resourceType if provided; otherwise, backend will detect based on file mime type.
        if (tab === 0) {
          formData.append("resourceType", newItem.resourceType || "");
        }
        
        if (file) formData.append("file", file);
        if (bannerFile) formData.append("banner", bannerFile);
  
        const endpoint = `${API}/resources`;
        response = editMode
          ? await axios.put(`${endpoint}/${editId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
          : await axios.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
  
      setData((prev) =>
        editMode ? prev.map((item) => (item.ID === editId ? response.data : item)) : [...prev, response.data]
      );
      alert("Data saved successfully!");
      handleClose();
      setNewItem({});
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving data:", error.response ? error.response.data : error);
      alert("Failed to save data.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleBannerChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      setBannerFile(file); // Save banner file to state
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  // Clean up function to prevent memory leaks
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

  
  return (
    <>
      <Dialog open={isArticle} onClose={()=> handleClose()} maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#b7e3cc", 
            color: "#000",
            borderRadius: "24px",
            width: "70%",
            height: "50%",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
          },
        }}
        >
        <div className="w-[97.5%] h-full bg-white rounded-3xl mb-4">
          <DialogTitle className="border-b-2 border-[#737373]"><p className="text-4xl text-[#737373]">{editMode ? "Edit " : "Add "} {tab === 0 ? "Resource" : tab === 1 ? "Wellness" : "Announcement"}</p></DialogTitle>
          <DialogContent className="border-b-2 border-b-gray-500">
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
                  "&:hover fieldset": {
                    borderColor: "darkgray",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
            <div className="flex flex-row">
              {tab !== 2 ? (
                <div className="w-[50%] p-4 border-r-2">
                  <h1 className="text-3xl text-[#737373] font-normal">Banner</h1>
                  <h1 className="text-lg text-gray-400">Set a image that draws attention</h1>
                  <Box
                    sx={{
                      width: "200px",
                      height: "100px",
                      border: "2px dashed gray",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
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
                        style={{ width: "100%", height: "100%", objectFit: "cover"}}
                      ></img>
                    ) : (
                      <>
                        <CloudUpload
                          sx={{ fontSize: 40, color: "#a3cbb8"}}
                        ></CloudUpload>
                        <Typography sx={{ fontSize: 14, color: "#737373"}}>
                          Upload file here
                        </Typography>
                      </>
                    )}
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      style={{display: "none"}}
                      onChange={handleBannerChange}
                    ></input>
                  </Box>
                </div>
              ) : null}
              <div className={`p-4 ${tab !== 2 ? "w-[50%]" : "w-full"}`}>
                <FormControl fullWidth margin="dense">
                  <h1 className="text-3xl text-[#737373] font-normal">Category</h1>
                  <h1 className="text-lg text-gray-400 mb-4">Select a category that the post's fall under</h1>
                  <Select name="category" value={newItem.category || ""} onChange={handleCategoryChange}
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
                        "&:hover fieldset": {
                          borderColor: "darkgray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {setIsRichText(true); handleClose(); newItem.resourceType = "Document"}} disabled={loading}><p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#5bb780]">Next</p></Button>
          </DialogActions>
        </div>
      </Dialog>
      <Dialog open={isRichText} onClose={() => setIsRichText(false)} maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#b7e3cc", 
            color: "#000",
            borderRadius: "24px",
            width: "70%",
            height: "70%",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
          },
        }}
      >
        <div className="w-[97.5%] h-max bg-white rounded-3xl mb-4">
          <DialogTitle className="border-b-2 border-[#737373]"><p className="text-4xl text-[#737373]">Create Document</p></DialogTitle>
          <DialogContent>
            {editor && (
              <Box sx={{ display: "flex", gap: 1, marginBottom: 1, borderBottom: "1px solid gray", paddingBottom: 1, marginTop: 3}}>
                <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                  <MenuItem value="12px">12px</MenuItem>
                  <MenuItem value="14px">14px</MenuItem>
                  <MenuItem value="16px">16px</MenuItem>
                  <MenuItem value="18px">18px</MenuItem>
                  <MenuItem value="20px">20px</MenuItem>
                </Select>
                <IconButton onClick={() => editor.chain().focus().toggleBold().run()}><FormatBold /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalic /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()}><FormatUnderlined /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleHighlight().run()}><FormatColorFill /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleSuperscript().run()}><SuperscriptOutlined /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleSubscript().run()}><SubscriptOutlined /></IconButton>
                <IconButton onClick={() => editor.chain().focus().setTextAlign('left').run()}><FormatAlignLeft /></IconButton>
                <IconButton onClick={() => editor.chain().focus().setTextAlign('center').run()}><FormatAlignCenter /></IconButton>
                <IconButton onClick={() => editor.chain().focus().setTextAlign('right').run()}><FormatAlignRight /></IconButton>
                <IconButton onClick={() => editor.chain().focus().setTextAlign('justify').run()}><FormatAlignJustify /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleLink({ href: prompt('Enter URL') }).run()}><InsertLink /></IconButton>
                <IconButton onClick={addImage}><ImageIcon /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted /></IconButton>
                <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered /></IconButton>
                <IconButton onClick={() => editor.chain().focus().indent().run()}><FormatIndentIncrease /></IconButton>
                <IconButton onClick={() => editor.chain().focus().outdent().run()}><FormatIndentDecrease /></IconButton>
              </Box>
            )}
            <EditorContent editor={editor} style={{ minHeight: "350px", padding: "10px", fontSize, width: "100%" }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {saveToFile(); setIsRichText(false); handleSave()}} disabled={loading}><p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#5bb780]">{loading ? "Posting..." : "Post"}</p></Button>
          </DialogActions>
        </div>
      </Dialog>
      <Dialog open={videoDialog} onClose={() => handleClose()} maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#b7e3cc", 
            color: "#000",
            borderRadius: "24px",
            width: "70%",
            height: "70%",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
          },
        }}
      >
        <div className="w-[97.5%] h-full bg-white rounded-3xl flex flex-col items-center justify-center mb-4">
          <DialogTitle className="border-b-2 border-gray-500 text-center w-full">Upload Files</DialogTitle>
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center text-center w-full h-full cursor-pointer"
          >
            <input {...getInputProps()} onChange={handleVideoUpload} onClick={() => newItem.resourceType = "Video"}/>
            <div className="flex flex-col items-center gap-7">
              <FileUpload 
                sx={{
                  bgcolor: "#b7e3cc",
                  fontSize: "10rem",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "1rem",
                  width: "12rem",
                  height: "12rem"
                }} 
              />
              <h1>Drag and drop video files to upload</h1>
              <Button>Select Files</Button>
            </div>
          </div>
        </div>
      </Dialog>
      {/*Announcement and Video Dialogs*/}
      <Dialog open={open} onClose={handleClose} maxWidth="md"
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#b7e3cc", // Light blue for Restore, Light red for Delete
          color: "#000", // Text color
          borderRadius: "24px", // Optional: rounded corners
          width: "70%",
          height: "73.5%",
          overflowX: "hidden",
          overflowY: "auto"
        },
      }}
      >
        <div className="w-[97.5%] h-max mb-5 bg-white rounded-3xl">
          <DialogTitle className="border-b-2 border-[#737373]"><p className="text-4xl text-[#737373]">{editMode ? "Edit " : "Add "} {tab === 0 ? "Resource" : tab === 1 ? "Wellness" : "Announcement"}</p></DialogTitle>
          <DialogContent className="border-b-2 border-b-gray-500">
            <div className={`p-4 ${isVideo === true ? "flex flex-row" : ""}`}>
              <div className={`${isVideo === true ? "w-[50%]" : "w-full"}`}>
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
                      "&:hover fieldset": {
                        borderColor: "darkgray",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "black",
                      },
                    },
                  }}
                />
                {tab === 2 ? (
                  <>
                    <h1 className="text-3xl text-[#737373] font-normal">Content</h1>
                    <TextField 
                    name="content"
                    placeholder="Type here..."
                    fullWidth
                    variant="outlined" 
                    multiline 
                    rows={5} 
                    value={newItem.content || ""} 
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
                        "&:hover fieldset": {
                          borderColor: "darkgray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                    }}
                     />
                  </>
                ) : 
                (tab === 0 || tab === 1) && (
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
                        "&:hover fieldset": {
                          borderColor: "darkgray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                    }}
                     />
                  </>
                )
              }
              </div>
              {isVideo === true ? 
              <div className="w-[50%] h-[18.4rem] px-5">
                <div className="w-full h-[75%]">
                  <ReactPlayer url={videoPreview} controls width="100%" height="100%" />
                </div>
                <div className="w-full h-[25%] bg-[#b7e3cc] rounded-b-3xl"></div>
              </div> : null}
            </div>
            <div className="flex flex-row">
              {tab !== 2 ? (
                <div className="w-[50%] p-4 border-r-2">
                  <h1 className="text-3xl text-[#737373] font-normal">{isVideo === true ? "Thumbnail" : "Banner"}</h1>
                  <h1 className="text-lg text-gray-400">Set a image that draws attention</h1>
                  <Box
                    sx={{
                      width: "200px",
                      height: "100px",
                      border: "2px dashed gray",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
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
                        style={{ width: "100%", height: "100%", objectFit: "cover"}}
                      ></img>
                    ) : (
                      <>
                        <CloudUpload
                          sx={{ fontSize: 40, color: "#a3cbb8"}}
                        ></CloudUpload>
                        <Typography sx={{ fontSize: 14, color: "#737373"}}>
                          Upload file here
                        </Typography>
                      </>
                    )}
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      style={{display: "none"}}
                      onChange={handleBannerChange}
                    ></input>
                  </Box>
                </div>
              ) : null}
              <div className={`p-4 ${tab !== 2 ? "w-[50%]" : "w-full"}`}>
                <FormControl fullWidth margin="dense">
                  <h1 className="text-3xl text-[#737373] font-normal">Category</h1>
                  <h1 className="text-lg text-gray-400 mb-4">Select a category that the post's fall under</h1>
                  <Select name="category" value={newItem.category || ""} onChange={handleCategoryChange}
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
                        "&:hover fieldset": {
                          borderColor: "darkgray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "black",
                        },
                      },
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {handleSave();}} disabled={loading}><p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#5bb780]">{loading ? "Posting..." : "Post"}</p></Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
    
  );
}