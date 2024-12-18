import React, { useCallback } from 'react';
import type { FileWithPath } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

const styles = {
  dropzone: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '200px',
    border: '2px dashed #cccccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    padding: '20px',
    color: '#333333',
  },
};

interface DragAndDropProps {
  onFileDrop: (files: FileWithPath[]) => void;
  cls?: string;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onFileDrop, cls }) => {
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      onFileDrop(acceptedFiles);
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div {...getRootProps()} style={styles.dropzone} className={cls}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag and drop some files here, or click to select files</p>
      )}
    </div>
  );
};

export default DragAndDrop;
