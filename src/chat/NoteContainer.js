import { useState, useRef } from "react";
import { useContext, useEffect } from "react";
import AuthContext from "../context/auth-context";
import { db } from "../firebase-config";
import { doc, setDoc, arrayUnion, Timestamp, getDoc } from "firebase/firestore";
import TaskContext from "../context/task-context";
import { useLocation } from "react-router-dom";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { convertToRaw, convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html";

const NoteContainer = (props) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(false);
  const location = useLocation();
  const authCtx = useContext(AuthContext);
  const taskCtx = useContext(TaskContext);
  const editorRef = useRef(null);

  // Monitor changes to editorState and determine whether to show the save button
  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const textLength = contentState.getPlainText("").trim().length;
    var localNoteInHTML = stateToHTML(contentState);
    var localSerialized = JSON.stringify(convertToRaw(contentState));
    taskCtx.setNote({
      noteInHTML: localNoteInHTML,
      serializedContent: localSerialized,
    });
    setIsSaveButtonVisible(textLength > 0);
  }, [editorState]);

  // Load saved noteText when the component mounts
  useEffect(() => {
    const getContent = async () => {
      if (authCtx?.user?.uid) {
        const taskCategory = location.pathname.split("/")[1];
        const customDocID = `${authCtx.user.uid}${taskCategory}`;
        const noteDocumentRef = doc(db, "notes", customDocID);
        try {
          const docSnap = await getDoc(noteDocumentRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.notesArray) {
              const lastNote = data.notesArray[data.notesArray.length - 1];
              const rawContent = JSON.parse(lastNote.serializedContent);
              const contentState = convertFromRaw(rawContent);
              setEditorState(EditorState.createWithContent(contentState));
            }
          }
          console.log("Note loaded successfully");
        } catch (error) {
          console.error("Error getting document:", error);
        }
      }
    };
    getContent();
  }, [authCtx]);

  const handleSave = async () => {
    if (authCtx.user.uid) {
      const taskCategory = location.pathname.split("/")[1];
      console.log("taskCategory", taskCategory);
      const customDocID = `${authCtx.user.uid}${taskCategory}`;
      console.log(customDocID);
      const noteDocumentRef = doc(db, "notes", customDocID);

      const noteObject = {
        noteInHTML: taskCtx.note.noteInHTML,
        serializedContent: taskCtx.note.serializedContent,
        ts: Timestamp.now(),
      };

      try {
        const userID = authCtx.user.uid;
        await setDoc(
          noteDocumentRef,
          {
            taskCategory,
            userID,
            notesArray: arrayUnion(noteObject),
          },
          { merge: true }
        );
        setIsSaveButtonVisible(false);
        taskCtx.setShowSaveButton(false);
        taskCtx.setShowEditNoteReminder(false);
        console.log("Note saved successfully");
      } catch (error) {
        console.error("Error saving note:", error);
      }
    } else {
      console.log("User ID is not available");
    }
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Block paste operation in Draft.js Editor
  const handlePastedText = (text, html, editorState) => {
    // Return 'handled' to prevent the paste
    console.log("Paste blocked in notes field");
    return "handled";
  };

  // Block copy and cut keyboard shortcuts
  const handleBeforeInput = (chars, editorState) => {
    return "not-handled";
  };

  // Custom key binding to block Ctrl+C, Ctrl+X, Ctrl+V
  const keyBindingFn = (e) => {
    // Block Ctrl+V / Cmd+V (paste)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
      console.log("Paste shortcut blocked");
      return "block-paste";
    }
    // Block Ctrl+C / Cmd+C (copy)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
      console.log("Copy shortcut blocked");
      return "block-copy";
    }
    // Block Ctrl+X / Cmd+X (cut)
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 88) {
      console.log("Cut shortcut blocked");
      return "block-cut";
    }
    return undefined;
  };

  // Handle the custom key commands
  const handleCustomKeyCommand = (command) => {
    if (
      command === "block-paste" ||
      command === "block-copy" ||
      command === "block-cut"
    ) {
      return "handled";
    }
    return handleKeyCommand(command);
  };

  // Block context menu (right click) copy/paste
  const handleContextMenu = (e) => {
    e.preventDefault();
    console.log("Context menu blocked in notes field");
    return false;
  };

  // Block copy event
  const handleCopy = (e) => {
    e.preventDefault();
    console.log("Copy event blocked");
    return false;
  };

  // Block cut event
  const handleCut = (e) => {
    e.preventDefault();
    console.log("Cut event blocked");
    return false;
  };

  // Block paste event (backup for handlePastedText)
  const handlePaste = (e) => {
    e.preventDefault();
    console.log("Paste event blocked");
    return false;
  };

  return (
    <div className="flex flex-col h-fit rounded-md w-full text-sm items-start px-4">
      <div
        className="bg-[#FFFFFF] p-3 w-full rounded-md min-h-8"
        onContextMenu={handleContextMenu}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleCustomKeyCommand}
          handlePastedText={handlePastedText}
          keyBindingFn={keyBindingFn}
          placeholder="Enter your notes here..."
        />
        {}
        {(isSaveButtonVisible || taskCtx.showSaveButton) && (
          <div className="flex flex-row justify-around mt-8">
            <button
              className="bg-[#e3e3e3] px-3 py-1 rounded-lg"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteContainer;
