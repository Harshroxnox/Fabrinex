// src/TextEditor.jsx
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    console.log(value);
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: {value},
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        },
      });

      quillInstance.current.on('text-change', () => {
        const html = quillInstance.current.root.innerHTML;
        onChange(html); // Call parent's handler
      });
    }

    // Set initial content (optional)
    // if (quillInstance.current && value) {
    //   quillInstance.current.root.innerHTML = value;
    // }
  }, [value, onChange]);

  return (
    <div
      ref={editorRef}
      style={{ height: '300px', backgroundColor: '#fff', marginTop: '10px' }}
    />
  );
};

export default TextEditor;
