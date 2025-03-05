import React, { useState, useEffect } from "react";
import { auth, db } from "../../../components/firebase/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { User, onAuthStateChanged } from "firebase/auth";
import AddBlog from "./AddBlog";
import ListBlogs from "./ListBlogs";
import { XCircleIcon } from "@heroicons/react/20/solid";
import Sidebar from "../../../components/Sidebar";

const BlogAdmin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().isAdmin || false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sidebar />
      <main className="h-full px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-8/12">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Blog Admin Dashboard
            </h1>
          </div>
          <hr className="my-12 border-gray-700" />
          {user && isAdmin ? (
            <div>
              <h2 className="text-lg">Welcome, {user.displayName}</h2>
              <p>
                <strong>ID:</strong> {user.uid}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <hr className="my-12 border-gray-700" />
              <AddBlog />
              <ListBlogs />
            </div>
          ) : user ? (
            <div className="p-4 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="w-5 h-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    This page requires admin privileges
                  </h3>
                </div>
              </div>
            </div>
          ) : (
            <p>No user is currently logged in.</p>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogAdmin;
