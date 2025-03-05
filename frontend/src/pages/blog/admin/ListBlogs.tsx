import { useState, useEffect } from "react";
import { db } from "../../../components/firebase/FirebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../components/firebase/FirebaseConfig";
import { TrashIcon } from "@heroicons/react/20/solid";

interface BlogPost {
  id: string;
  title: string;
  authorId: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  createdAt: {
    toDate(): Date;
  };
}

const ListBlogs = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const blogCollectionRef = collection(db, "blog");
        const snapshot = await getDocs(blogCollectionRef);
        const posts: BlogPost[] = [];

        for (const doc of snapshot.docs) {
          const postData = doc.data();
          const imageUrl = await getImageUrl(postData.img);
          posts.push({
            id: doc.id,
            title: postData.title,
            authorId: postData.authorId,
            imageUrl: imageUrl || "",
            authorName: postData.authorName,
            authorAvatar: postData.authorAvatar,
            createdAt: postData.createdAt,
          });
        }

        setBlogPosts(posts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false); // Set loading to false once data fetching is completed or failed
      }
    };

    fetchBlogPosts();
  }, []);

  const getImageUrl = async (imagePath: string): Promise<string | null> => {
    try {
      const storageRef = ref(storage, imagePath);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  const handleDeleteBlogPost = async (postId: string, imagePath: string) => {
    try {
      await deleteDoc(doc(db, "blog", postId));
      await deleteObject(ref(storage, imagePath));
      setBlogPosts(blogPosts.filter((post) => post.id !== postId));
      alert("Blog post deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("Failed to delete blog post.");
    }
  };

  return (
    <div>
      <h2 className="mb-8 text-2xl font-bold text-white">Blog Posts</h2>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-b-2 border-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-800">
          {blogPosts.map((post) => (
            <li key={post.id} className="flex justify-between py-5 gap-x-6">
              <div className="flex min-w-0 gap-x-4">
                <img
                  className="flex-none object-cover w-12 h-12 bg-gray-800 rounded-full"
                  src={post.imageUrl}
                  alt=""
                />
                <div className="flex-auto min-w-0">
                  <p className="text-sm font-semibold leading-6 text-white">
                    {post.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-400 truncate">
                    Created by:{" "}
                    <span className="text-gray-200">{post.authorName}</span>
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <p className="mt-1 text-xs leading-5 text-gray-400">
                  Created{" "}
                  <time dateTime={post.createdAt.toDate().toISOString()}>
                    {post.createdAt.toDate().toLocaleDateString()}
                  </time>
                </p>
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none p-1 rounded-full bg-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs leading-5 text-gray-400">Live</p>
                  <button
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                    onClick={() => handleDeleteBlogPost(post.id, post.imageUrl)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListBlogs;
