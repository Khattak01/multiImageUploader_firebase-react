import React, { useEffect, useState } from "react";
import "./MultiImagesUploader.css";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";
// import Button from '../UI/button/Button'
import imageCompression from "browser-image-compression";
// import { useStorage } from "../hooks/useStorage";
import { projectStorage } from "../../firebase";

function UploadImage(props) {
const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  // const [url, setUrl] = useState(null);
  const [lastImage, setLastImage] = useState(false);

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight:1920,
    useWebWorker: true
  };

  // let url = "";
  const types = ["image/png", "image/jpeg", "image/jpg"];

  const uploader = (file) => {
    if (file) {
      // storage refs
      const storageRef = projectStorage.ref(`propertyImages/${file.name}`);

      storageRef.put(file).on(
        "state_changed",
        (snap) => {
          // track the upload progress
          let percentage = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );

          setProgress(percentage);
        },
        (err) => {
          console.log("error uploader", err.message);
          setProgress(0);
          setError(err);
        },
        async () => {
          // get the public download img url
          const downloadUrl = await storageRef.getDownloadURL();
          const downloadName = await storageRef.toString();
          // save the url to local state
          // console.log("downloadUrl>>>", downloadUrl);
          // console.log("downloadName>>>", downloadName);
          props.pictureAddHandler(downloadUrl, downloadName);
        }
      );
    }
  };

  const uploadImage = (file) => {
    let selectedFile = file;

    if (selectedFile) {
      if (types.includes(selectedFile.type)) {
        setError(null);
        // setFile(selectedFile);
        uploader(selectedFile);
      } else {
        // setFile(null);
        setError("Please select an image file (png or jpg)");
        alert("Please select an image file (png or jpg)");
      }
    }
  };

  const fileInputHandleChange = (e) => {
    //Get files
    const images = [];
    for (var i = 0; i < e.target.files.length; i++) {
      images.push(e.target.files[i]);
      // uploadImage(e.target.files[i]);
      // uploader(e.target.files[i]);
      // props.pictureAddHandler(url, name);
      // if(progress)
      setLastImage(false);
    }
    setFiles([...images]);
    // console.log("images>>>", images);
    setLastImage(true);
  };

  const uploadBtnClickHandler = async() => {
    for (var i = 0; i < files.length; i++) {
      // console.log("file i >>>", files[i]);
      try {
        if (files[i].size > 1000000) {
          const compressedFile = await imageCompression(files[i], options);
          uploadImage(compressedFile);
        } else {
          uploadImage(files[i]);
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setProgress(0);
    // if (lastImage) setFiles([]);
  };

  const removeFile = (name) => {
    // find the index of the item
    // remove the item from array

    const fileIndex = files.findIndex((e) => e.name === name);
    files.splice(fileIndex, 1);
    // update validFiles array
    // setValidFiles([...validFiles]);
    // const selectedFileIndex = selectedFiles.findIndex((e) => e.name === name);
    // selectedFiles.splice(selectedFileIndex, 1);
    // update selectedFiles array
    setFiles([...files]);
  };
  useEffect(() => {
    if (!lastImage) {
      // console.log("in");
      setProgress(0);
    }
  }, [lastImage]);

  // console.log("files >>> ", files);

  return (
    <div className="register-upload__image">
      <form className="register-upload__image-form">
        <label className="register-upload__image-label">
          <input
            type="file"
            onChange={fileInputHandleChange}
            multiple
            accept="image/*"
          />
          <span>Select Photos</span>
        </label>
      </form>
      <button className="register-upload__btn" disabled={!files.length} onClick={uploadBtnClickHandler}>
        Upload files
      </button>

      {/* error message */}
      {error && <p>{error}</p>}

      {/* upload progress */}
      {files && (
        <p className="text register-upload__image-para">{progress}% uploaded</p>
      )}
      {files.length ? (
        <p className="text register-upload__image-para">
          {files.length} files selected
        </p>
      ) : null}
      {/* image url */}
      {files && files.length ? (
        <div className="register-upload__image-box">
          <b style={{color:'#7c7c7c',margin:'.8rem',display:'inline-block'}}>Selected files : </b>
          {files.map((file, i) => (
            <div className="register-uploadimage" key={i}>
              <span>{file.name}</span>
              <IconButton onClick={() => removeFile(file.name)}>
                <CloseIcon fontSize="large" color="secondary" />
              </IconButton>
            </div>
          ))}
        </div>
      ) : null}

      {/* image display */}
      {/* {url && <img className="register-upload__image-image" alt={url} src={url}></img>} */}
    </div>
  );
}

export default UploadImage;

