import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import './../../App.css';

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzgxOTgzOTksImp0aSI6IjRiYTA2N2JhLTUxMzgtNDJhZC1hMzU0LTExNGJiM2Y4NTVhNSIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIl0sInZjIjoiMmVlMDNiNDkifQ.xGIO0FDbjTm_iLSDiDfZo4okzkCBTg5j0CRG_rG6mV4mu5skh3Xo60kRKhHsHA4T2vOXrSqdFWWeM_tVHovo_w';

export const DialogWrapper = ({ open, onClose, title, children, actionButtons, dialogSx = {} }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" sx={{ "& .MuiPaper-root": { backgroundColor: "#b7cde3", color: "#000", borderRadius: "24px", width: "70%", height: "auto", minHeight: "50%", maxHeight: "90%", overflowX: "hidden", overflowY: "auto", display: "flex", ...dialogSx, } }}>
    <div className="w-[97.5%] h-full bg-white rounded-3xl mb-4">
      <DialogTitle className="border-b-2 border-[#737373]">
        <p className="text-4xl text-[#737373]">{title}</p>
        <DialogActions className="absolute -top-1 right-5">
          <IconButton onClick={onClose} className="rounded-full ">
            <Close sx={{fontSize: 40, color: 'black'}}></Close>
          </IconButton>
        </DialogActions>
      </DialogTitle>
      <DialogContent className="border-b-2 border-b-gray-500">
        {children}
      </DialogContent>
      <DialogActions>
        {actionButtons}
      </DialogActions>
    </div>
  </Dialog>
);

export default function RichTextEditor({ setBlob, editorData }) {
  const editorContainerRef = useRef(null);
	const editorRef = useRef(null);
	const editorWordCountRef = useRef(null);
	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const cloud = useCKEditorCloud({ version: '44.3.0' });

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const { ClassicEditor, editorConfig } = useMemo(() => {
		if (cloud.status !== 'success' || !isLayoutReady) {
			return {};
		}

		const {
			ClassicEditor,
			Alignment,
			Autoformat,
			AutoImage,
			AutoLink,
			Autosave,
			BalloonToolbar,
			Base64UploadAdapter,
			BlockQuote,
			Bold,
			Essentials,
			FindAndReplace,
			FontBackgroundColor,
			FontColor,
			FontFamily,
			FontSize,
			GeneralHtmlSupport,
			Highlight,
			HorizontalLine,
			ImageBlock,
			ImageCaption,
			ImageEditing,
			ImageInline,
			ImageInsert,
			ImageInsertViaUrl,
			ImageResize,
			ImageStyle,
			ImageTextAlternative,
			ImageToolbar,
			ImageUpload,
			ImageUtils,
			Indent,
			IndentBlock,
			Italic,
			Link,
			List,
			ListProperties,
			MediaEmbed,
			PageBreak,
			Paragraph,
			PasteFromOffice,
			RemoveFormat,
			SpecialCharacters,
			SpecialCharactersArrows,
			SpecialCharactersCurrency,
			SpecialCharactersEssentials,
			SpecialCharactersLatin,
			SpecialCharactersMathematical,
			SpecialCharactersText,
			Strikethrough,
			Subscript,
			Superscript,
			Table,
			TableCaption,
			TableCellProperties,
			TableColumnResize,
			TableProperties,
			TableToolbar,
			TextTransformation,
			TodoList,
			Underline,
			WordCount
		} = cloud.CKEditor;

		return {
			ClassicEditor,
			editorConfig: {
				toolbar: {
					items: [
						'findAndReplace',
						'|',
						'fontSize',
						'fontFamily',
						'fontColor',
						'fontBackgroundColor',
						'|',
						'bold',
						'italic',
						'underline',
						'strikethrough',
						'subscript',
						'superscript',
						'removeFormat',
						'|',
						'specialCharacters',
						'horizontalLine',
						'pageBreak',
						'link',
						'insertImage',
						'mediaEmbed',
						'insertTable',
						'highlight',
						'blockQuote',
						'|',
						'alignment',
						'|',
						'bulletedList',
						'numberedList',
						'todoList',
						'outdent',
						'indent'
					],
					shouldNotGroupWhenFull: true
				},
				plugins: [
					Alignment,
					Autoformat,
					AutoImage,
					AutoLink,
					Autosave,
					BalloonToolbar,
					Base64UploadAdapter,
					BlockQuote,
					Bold,
					Essentials,
					FindAndReplace,
					FontBackgroundColor,
					FontColor,
					FontFamily,
					FontSize,
					GeneralHtmlSupport,
					Highlight,
					HorizontalLine,
					ImageBlock,
					ImageCaption,
					ImageEditing,
					ImageInline,
					ImageInsert,
					ImageInsertViaUrl,
					ImageResize,
					ImageStyle,
					ImageTextAlternative,
					ImageToolbar,
					ImageUpload,
					ImageUtils,
					Indent,
					IndentBlock,
					Italic,
					Link,
					List,
					ListProperties,
					MediaEmbed,
					PageBreak,
					Paragraph,
					PasteFromOffice,
					RemoveFormat,
					SpecialCharacters,
					SpecialCharactersArrows,
					SpecialCharactersCurrency,
					SpecialCharactersEssentials,
					SpecialCharactersLatin,
					SpecialCharactersMathematical,
					SpecialCharactersText,
					Strikethrough,
					Subscript,
					Superscript,
					Table,
					TableCaption,
					TableCellProperties,
					TableColumnResize,
					TableProperties,
					TableToolbar,
					TextTransformation,
					TodoList,
					Underline,
					WordCount
				],
				balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
				fontFamily: {
					supportAllValues: true
				},
				fontSize: {
					options: [10, 12, 14, 'default', 18, 20, 22],
					supportAllValues: true
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true,
							attributes: true,
							classes: true
						}
					]
				},
				image: {
					toolbar: [
						'toggleImageCaption',
						'imageTextAlternative',
						'|',
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText',
						'|',
						'resizeImage'
					]
				},
				initialData: editorData || '',
				licenseKey: LICENSE_KEY,
				link: {
					addTargetToExternalLinks: true,
					defaultProtocol: 'https://',
					decorators: {
						toggleDownloadable: {
							mode: 'manual',
							label: 'Downloadable',
							attributes: {
								download: 'file'
							}
						}
					}
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
				placeholder: 'Type or paste your content here!',
				table: {
					contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
				}
			}
		};
	}, [cloud.CKEditor, cloud.status, editorData, isLayoutReady]);

  const handleEditorChange = (event, editor) => {
	  const htmlContent = editor.getData().trim();
	
	  // Optionally skip if editor is empty
	  if (!htmlContent || htmlContent === "<p>&nbsp;</p>" || htmlContent === "<p></p>") {
	    setBlob(null); // or skip setting at all
	    return;
	  }
  
	  const blob = new Blob([htmlContent], { type: "text/html" });
	  setBlob(blob);
	};

	return (
		<div className="main-container">
			<div className="editor-container editor-container_classic-editor editor-container_include-word-count" ref={editorContainerRef}>
				<div className="editor-container__editor">
					<div ref={editorRef}>
						{ClassicEditor && editorConfig && (
							<CKEditor
								onReady={editor => {
									const wordCount = editor.plugins.get('WordCount');
									editorWordCountRef.current.appendChild(wordCount.wordCountContainer);
								}}
								editor={ClassicEditor}
								config={editorConfig}
                				onChange={handleEditorChange}
							/>
						)}
					</div>
				</div>
				<div className="editor_container__word-count" ref={editorWordCountRef}></div>
			</div>
		</div>
	);
}
