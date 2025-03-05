import React, { useState, useEffect } from "react";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../components/firebase/FirebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../components/firebase/FirebaseConfig";
import { auth } from "../../../components/firebase/FirebaseConfig";

const AddBlog: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch the current user's details from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleImageChange = (e: { target: { files: any } }) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `blog-images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImg(downloadURL);
          setUploading(false);
        });
      }
    );
  };

  const styleContent = (htmlContent: string): string => {
    return htmlContent
      .replace(
        /<h1>/g,
        '<h1 class="text-3xl text-gray-200 font-semibold mb-4">'
      )
      .replace(/<h2>/g, '<h2 class="text-2xl text-gray-200 mb-2">')
      .replace(/<h3>/g, '<h3 class="text-xl text-gray-200 mb-2">')
      .replace(/<p>/g, '<p class="text-gray-400 mb-8">')
      .replace(/<strong>/g, '<strong class="text-gray-200 mb-8 font-semibold">')
      .replace(/<ul>/g, '<ul class="text-gray-300 mb-8">')
      .replace(/<ol>/g, '<ul class="text-gray-300 mb-8">')
      .replace(/<li>/g, '<li class="mb-4">');
  };

  const styledContent = styleContent(content);

  const handleAddBlogPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!img) {
      alert("Please upload an image and wait for it to finish uploading.");
      return;
    }

    if (!user) {
      alert("User details not found.");
      return;
    }

    try {
      await addDoc(collection(db, "blog"), {
        title,
        content: styledContent,
        img,
        createdAt: new Date(),
        authorId: user.uid,
        authorName: user.displayName,
        authorAvatar: user.userAvatar,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/gi, "")
          .replace(/\s+/g, "-"),
      });
      setTitle("");
      setContent("");
      setImg("");
      alert("Blog post added successfully!");
    } catch (error) {
      console.error("Error adding blog post:", error);
      alert("Failed to add blog post.");
    }
  };

  return (
    <div>
      <h2 className="mb-8 text-2xl font-bold text-white">Add Blog Post</h2>
      <form onSubmit={handleAddBlogPost} className="mb-8">
        <div className="w-full p-2 mb-4 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full p-0 bg-gray-900 border-0 text-gray-50 placeholder:text-gray-700 focus:ring-0"
            required
          />
        </div>
        <div className="w-full p-2 mb-4 transition duration-500 rounded-md shadow-sm ring-1 ring-inset ring-gray-600 focus-within:ring-2 focus-within:ring-gray-200">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content:
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full p-0 bg-gray-900 border-0 text-gray-50 placeholder:text-gray-700 focus:ring-0"
            required
          />
        </div>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="img"
            className="flex flex-col items-center justify-center w-full transition duration-500 bg-gray-900 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer h-52 hover:bg-gray-800 hover:border-gray-500"
          >
            {img ? (
              <img
                src={img}
                alt="Image preview"
                className="object-contain w-full h-full rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-3 pb-3">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500"
                  aria-hidden="true"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Upload your image</span> or
                  drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, or GIF (min. 128x128px)
                </p>
              </div>
            )}
            <input
              id="img"
              type="file"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center w-full px-6 py-2 mt-4 text-sm text-white transition duration-300 ease-in-out rounded-md bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
          disabled={uploading}
        >
          Add Blog Post
        </button>
      </form>
    </div>
  );
};

export default AddBlog;
