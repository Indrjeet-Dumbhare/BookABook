import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "bookabook/copies",
      },
      (err, result) => {
        if(err) {
          reject(err);
        } else {
          console.log(result.secure_url);
          resolve({url : result.secure_url , public_id : result.public_id});
        }
      }
    ).end(file.buffer);
  });
};